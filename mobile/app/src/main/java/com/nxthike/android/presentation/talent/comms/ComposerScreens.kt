package com.nxthike.android.presentation.talent.comms

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.telephony.DialerHelper
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/* ------------------------------------------------------------------ *
 *  Template library                                                  *
 * ------------------------------------------------------------------ */

enum class Channel(val key: String, val label: String, val color: Color, val tint: Color) {
    WhatsApp("wa", "WhatsApp", T.Teal, T.TealTint),
    Sms("sms", "SMS", T.Blue, T.BlueTint),
    Email("email", "Email", T.Purple, T.PurpleTint),
}

data class MessageTemplate(
    val id: String,
    val name: String,
    val channel: Channel,
    val stage: String,
    val body: String,
)

/**
 * Outreach templates. Variables in `{{braces}}` resolve against the candidate
 * and requisition the composer was opened from.
 */
object Templates {
    val ALL = listOf(
        MessageTemplate(
            "t1", "First outreach", Channel.WhatsApp, Stages.Sourced.label,
            "Hi {{name}}, {{recruiter}} here. We're hiring a {{role}} at {{client}}. " +
                "Your profile looks like a strong fit — is now a good time for a quick call?",
        ),
        MessageTemplate(
            "t2", "Screening follow-up", Channel.WhatsApp, Stages.Screening.label,
            "Thanks for your time, {{name}}. Sharing the details for the {{role}} role at {{client}}. " +
                "Could you confirm your current CTC, expected CTC and notice period?",
        ),
        MessageTemplate(
            "t3", "Interview invite", Channel.Email, Stages.Interview.label,
            "Hi {{name}}, your interview for {{role}} at {{client}} is confirmed. " +
                "Panel details and the joining link are attached.",
        ),
        MessageTemplate(
            "t4", "Offer nudge", Channel.WhatsApp, Stages.Offer.label,
            "Hi {{name}}, checking in on the offer for {{role}} at {{client}}. " +
                "Do you need anything from us to help you decide?",
        ),
        MessageTemplate(
            "t5", "Missed you", Channel.Sms, Stages.Sourced.label,
            "Hi {{name}}, tried reaching you about the {{role}} role at {{client}}. " +
                "Reply with a good time and I'll call back.",
        ),
    )

    fun resolve(body: String, vars: Map<String, String>): String =
        vars.entries.fold(body) { acc, (k, v) -> acc.replace("{{$k}}", v) }
}

/* ------------------------------------------------------------------ *
 *  ViewModel                                                         *
 * ------------------------------------------------------------------ */

data class ComposerState(
    val loading: Boolean = true,
    val candidate: CandidateDto? = null,
    val channel: Channel = Channel.WhatsApp,
    val templateId: String = "t1",
    val error: String? = null,
    val logging: Boolean = false,
)

@HiltViewModel
class ComposerViewModel @Inject constructor(
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ComposerState())
    val state: StateFlow<ComposerState> = _state.asStateFlow()

    fun load(candidateId: String) = viewModelScope.launch {
        _state.value = _state.value.copy(loading = true)
        hiring.getCandidate(candidateId)
            .onSuccess { c ->
                // Open on the template that matches where the candidate actually is.
                val stageLabel = Stages.find(c.status).label
                val match = Templates.ALL.firstOrNull { it.stage == stageLabel }
                _state.value = ComposerState(
                    loading = false, candidate = c,
                    templateId = match?.id ?: "t1",
                    channel = match?.channel ?: Channel.WhatsApp,
                )
            }
            .onError { e -> _state.value = _state.value.copy(loading = false, error = e.message) }
    }

    fun setChannel(c: Channel) { _state.value = _state.value.copy(channel = c) }
    fun setTemplate(id: String) {
        val t = Templates.ALL.firstOrNull { it.id == id } ?: return
        _state.value = _state.value.copy(templateId = id, channel = t.channel)
    }

    fun variables(recruiterName: String): Map<String, String> {
        val c = _state.value.candidate
        return mapOf(
            "name" to Fmt.firstName(c?.name),
            "role" to (c?.roleName?.takeIf { it.isNotBlank() } ?: "the role"),
            "client" to (c?.latestCompany?.takeIf { it.isNotBlank() } ?: c?.roleName.orEmpty().ifBlank { "our client" }),
            "loc" to (c?.city ?: "your city"),
            "recruiter" to Fmt.firstName(recruiterName),
        )
    }

    fun composed(recruiterName: String): String {
        val t = Templates.ALL.firstOrNull { it.id == _state.value.templateId } ?: return ""
        return Templates.resolve(t.body, variables(recruiterName))
    }

    /** Records that outreach happened, so the timeline reflects it. */
    fun logOutreach(channel: Channel, body: String, onDone: () -> Unit) {
        val c = _state.value.candidate ?: return onDone()
        viewModelScope.launch {
            _state.value = _state.value.copy(logging = true)
            val line = "[${Fmt.toIso(java.time.LocalDateTime.now()).take(16)}] ${channel.label} sent — " +
                body.take(120)
            hiring.patchCandidate(
                c.id,
                com.nxthike.android.data.remote.dto.CandidatePatchDto(
                    notes = (c.notes.trimEnd() + "\n" + line).trim(),
                ),
            )
            _state.value = _state.value.copy(logging = false)
            onDone()
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-COMM-01 · Message composer                                    *
 * ------------------------------------------------------------------ */

@Composable
fun ComposerScreen(
    candidateId: String,
    session: SessionViewModel,
    onBack: () -> Unit,
    onTemplates: () -> Unit,
) {
    val vm: ComposerViewModel = hiltViewModel()
    val state by vm.state.collectAsState()
    val prefs by session.prefs.collectAsState()
    val context = LocalContext.current
    LaunchedEffect(candidateId) { vm.load(candidateId) }

    val recruiter = session.displayName
    val body = vm.composed(recruiter)
    val c = state.candidate

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(
                "Message", onBack,
                subtitle = c?.let {
                    "${it.name.orEmpty()} · ${if (prefs.maskPii) Fmt.maskPhone(it.phone) else it.phone.orEmpty()}"
                },
            )

            if (state.loading) {
                SkeletonList(3, Modifier.padding(horizontal = T.Gutter))
            } else {
                Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter).padding(bottom = 110.dp),
                ) {
                    // Channel
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        Channel.entries.forEach { ch ->
                            val on = state.channel == ch
                            Row(
                                Modifier
                                    .weight(1f).height(46.dp)
                                    .clip(RoundedCornerShape(13.dp))
                                    .background(if (on) ch.tint else T.Surface)
                                    .border(1.5.dp, if (on) ch.color else T.BorderStrong.copy(alpha = 0.6f), RoundedCornerShape(13.dp))
                                    .clickable { vm.setChannel(ch) },
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Icon(
                                    when (ch) {
                                        Channel.WhatsApp -> Icons.Default.Chat
                                        Channel.Sms -> Icons.Default.Sms
                                        Channel.Email -> Icons.Default.Mail
                                    },
                                    null, tint = if (on) ch.color else T.InkBody, modifier = Modifier.size(18.dp),
                                )
                                Spacer(Modifier.width(6.dp))
                                TText(ch.label, Type.cardTitleSm, if (on) ch.color else T.InkBody, maxLines = 1)
                            }
                        }
                    }

                    // Template picker
                    TText("Template", Type.label, T.InkMuted, Modifier.padding(top = 14.dp, bottom = 8.dp))
                    Templates.ALL.filter { it.channel == state.channel }.forEach { t ->
                        val on = state.templateId == t.id
                        Row(
                            Modifier
                                .fillMaxWidth().padding(bottom = 7.dp)
                                .clip(T.RField)
                                .background(if (on) T.IndigoTintSoft else T.Surface)
                                .border(1.5.dp, if (on) T.Indigo else T.Border, T.RField)
                                .clickable { vm.setTemplate(t.id) }
                                .padding(horizontal = 12.dp, vertical = 11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(7.dp),
                        ) {
                            TText(t.name, Type.cardTitleSm, T.Ink, Modifier.weight(1f), maxLines = 1)
                            Badge(t.stage, t.channel.tint, t.channel.color)
                        }
                    }

                    // Preview
                    Row(
                        Modifier.padding(top = 14.dp), verticalAlignment = Alignment.CenterVertically,
                    ) {
                        TText("Preview · variables resolved", Type.label, T.InkMuted, Modifier.weight(1f))
                        TText("Library", Type.label, T.Indigo, Modifier.clickable(onClick = onTemplates))
                    }
                    Column(
                        Modifier.fillMaxWidth().padding(top = 8.dp)
                            .clip(RoundedCornerShape(14.dp, 14.dp, 4.dp, 14.dp))
                            .background(T.TealTint)
                            .border(1.dp, T.TealBorder, RoundedCornerShape(14.dp, 14.dp, 4.dp, 14.dp))
                            .padding(13.dp),
                    ) {
                        TText(body, Type.body.copy(lineHeight = androidx.compose.ui.unit.TextUnit(21f, androidx.compose.ui.unit.TextUnitType.Sp)), Color(0xFF0B3B36))
                        TText(
                            Fmt.time(java.time.LocalDateTime.now()), Type.monoXs, T.Teal,
                            Modifier.align(Alignment.End).padding(top = 8.dp),
                        )
                    }

                    // Variables
                    TCard(Modifier.padding(top = 12.dp), shape = T.RField, padding = 12.dp) {
                        Eyebrow("VARIABLES")
                        Spacer(Modifier.height(9.dp))
                        vm.variables(recruiter).forEach { (k, v) ->
                            Row(
                                Modifier.padding(bottom = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                Box(
                                    Modifier.clip(RoundedCornerShape(5.dp)).background(T.Fill)
                                        .padding(horizontal = 6.dp, vertical = 3.dp),
                                ) { TText("{{$k}}", Type.monoSm, T.Indigo) }
                                Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = T.InkGhost, modifier = Modifier.size(15.dp))
                                TText(v, Type.bodySm, T.InkBody, maxLines = 1)
                            }
                        }
                    }
                }
            }
        }

        if (c != null) {
            Column(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                    .padding(horizontal = T.Gutter, vertical = 14.dp),
            ) {
                PrimaryButton(
                    when (state.channel) {
                        Channel.WhatsApp -> "Open in WhatsApp"
                        Channel.Sms -> "Open SMS app"
                        Channel.Email -> "Open email app"
                    },
                    onClick = {
                        when (state.channel) {
                            Channel.WhatsApp -> DialerHelper.openWhatsApp(context, c.phone, body)
                            Channel.Sms -> DialerHelper.sms(context, c.phone, body)
                            Channel.Email -> DialerHelper.email(context, c.email, c.roleName, body)
                        }
                        vm.logOutreach(state.channel, body) { onBack() }
                    },
                    icon = Icons.Default.OpenInNew, height = 56.dp, shape = T.RFab, container = T.Teal,
                )
                TText(
                    when (state.channel) {
                        Channel.WhatsApp -> "wa.me deep link · logged as a timeline event"
                        Channel.Sms -> "SMS intent · body pre-filled"
                        Channel.Email -> "Email intent · subject and body pre-filled"
                    },
                    Type.labelSm, T.InkFaint, Modifier.fillMaxWidth().padding(top = 7.dp),
                )
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-COMM-02 · Template library                                    *
 * ------------------------------------------------------------------ */

@Composable
fun TemplatesScreen(onBack: () -> Unit) {
    var channel by rememberSaveable { mutableStateOf<String?>(null) }
    val shown = Templates.ALL.filter { channel == null || it.channel.key == channel }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Templates", onBack, subtitle = "${Templates.ALL.size} across three channels") {
            IconTile(Icons.Default.Add, {}, size = 36.dp, background = T.IndigoTint, tint = T.Indigo, iconSize = 20.dp)
        }
        ChipRail(Modifier.padding(horizontal = T.Gutter).padding(bottom = 10.dp)) {
            FilterChip("All", channel == null, { channel = null })
            Channel.entries.forEach { ch ->
                FilterChip(ch.label, channel == ch.key, { channel = ch.key }, accent = ch.color)
            }
        }
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = T.Gutter),
            verticalArrangement = Arrangement.spacedBy(T.Gap),
        ) {
            items(shown, key = { it.id }) { t ->
                TCard(padding = 13.dp) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TText(t.name, Type.cardTitleSm, T.Ink, Modifier.weight(1f))
                        Badge(t.channel.label, t.channel.tint, t.channel.color)
                    }
                    Box(
                        Modifier.fillMaxWidth().padding(top = 8.dp)
                            .clip(T.RIcon).background(Color(0xFFF7F6FB)).padding(10.dp),
                    ) { TText(t.body, Type.monoSm, T.InkMuted) }
                    TText("STAGE · ${t.stage}", Type.monoXs, T.InkFaint, Modifier.padding(top = 8.dp))
                }
            }
            item { Spacer(Modifier.height(T.FabInset)) }
        }
    }
}
