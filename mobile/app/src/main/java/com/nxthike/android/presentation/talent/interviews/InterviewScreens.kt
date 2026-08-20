package com.nxthike.android.presentation.talent.interviews

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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.data.remote.dto.CandidatePatchDto
import com.nxthike.android.data.remote.dto.InterviewCreateDto
import com.nxthike.android.data.remote.dto.InterviewDto
import com.nxthike.android.data.remote.dto.PanellistDto
import com.nxthike.android.data.remote.dto.ScorecardWriteDto
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.domain.repository.WorkspaceRepository
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.talent.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Interviews and scorecards, as records rather than note text.
 *
 * This screen used to build itself from whichever candidates happened to sit at
 * the Interview stage, and wrote schedules and scorecards back as formatted
 * lines in the candidate's notes blob — readable to a person, opaque to the web
 * desk and impossible to report on. Both are real tables now.
 *
 * [candidates] is still loaded, but only to populate the candidate picker on the
 * schedule screen; the calendar itself comes from [interviews].
 */
@HiltViewModel
class InterviewsViewModel @Inject constructor(
    private val hiring: HiringRepository,
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _interviews = MutableStateFlow<List<InterviewDto>>(emptyList())
    val interviews: StateFlow<List<InterviewDto>> = _interviews.asStateFlow()

    private val _candidates = MutableStateFlow<List<CandidateDto>>(emptyList())
    val candidates: StateFlow<List<CandidateDto>> = _candidates.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _selected = MutableStateFlow<CandidateDto?>(null)
    val selected: StateFlow<CandidateDto?> = _selected.asStateFlow()

    /** The interview a scorecard will be attached to, when one is known. */
    private val _selectedInterview = MutableStateFlow<InterviewDto?>(null)
    val selectedInterview: StateFlow<InterviewDto?> = _selectedInterview.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _loading.value = true
        _error.value = null
        workspace.interviews()
            .onSuccess { _interviews.value = it.sortedBy { i -> i.scheduledAt ?: "" } }
            .onError { e -> _error.value = e.message }
        hiring.candidates(null, null, Stages.Interview.id, 1, 60)
            .onSuccess { _candidates.value = it.items }
        _loading.value = false
    }

    fun select(id: String) = viewModelScope.launch {
        _selected.value = _candidates.value.firstOrNull { it.id == id }
            ?: hiring.getCandidate(id).getOrNull()
        // Prefer the soonest interview still open for this candidate, so a
        // scorecard attaches to the round it was actually written for.
        _selectedInterview.value = _interviews.value
            .filter { it.candidateId == id }
            .minByOrNull { it.scheduledAt ?: "9999" }
            ?: workspace.interviews(candidateId = id).getOrNull()
                ?.minByOrNull { it.scheduledAt ?: "9999" }
    }

    /** Creates the interview record: panel, slot, mode and duration as columns. */
    fun schedule(
        candidateId: String,
        type: String,
        slotIso: String?,
        panel: String,
        location: String,
        onDone: () -> Unit,
    ) = viewModelScope.launch {
        val candidate = _selected.value?.takeIf { it.id == candidateId }
            ?: hiring.getCandidate(candidateId).getOrNull()
        val result = workspace.createInterview(
            InterviewCreateDto(
                candidateId = candidateId,
                requisitionId = candidate?.requisitionId ?: candidate?.roleId,
                kind = interviewKind(type),
                roundLabel = type,
                scheduledAt = slotIso,
                durationMinutes = 45,
                mode = if (looksRemote(location)) "video" else "onsite",
                location = location.ifBlank { null },
                panel = panel.split(',')
                    .map { it.trim() }
                    .filter { it.isNotEmpty() && !it.equals("TBC", true) }
                    .map { PanellistDto(name = it) },
            ),
        )
        result.onError { e -> _error.value = e.message }
        load()
        onDone()
    }

    /**
     * Submits the scorecard.
     *
     * The stage move is the server's to make — `POST /scorecards` advances a
     * `hire` to Offer and a `strong_no` to Dropped, and records the audit line.
     * Doing it here as well would double-write and could disagree with it.
     */
    fun submitScorecard(
        candidateId: String,
        scores: Map<String, Int>,
        recommendation: String,
        evidence: String,
        onDone: () -> Unit,
    ) = viewModelScope.launch {
        workspace.submitScorecard(
            ScorecardWriteDto(
                candidateId = candidateId,
                interviewId = _selectedInterview.value?.id,
                scores = scores,
                recommendation = recommendationId(recommendation),
                evidence = evidence,
                isDraft = false,
            ),
        ).onError { e -> _error.value = e.message }
        load()
        onDone()
    }

    private fun looksRemote(location: String): Boolean {
        val l = location.lowercase()
        return l.startsWith("http") || listOf("meet", "zoom", "teams", "webex", "call").any { it in l }
    }

    private fun interviewKind(display: String): String = when (display.lowercase()) {
        "screening" -> "screening"
        "panel" -> "panel"
        "culture fit" -> "culture"
        "hr round" -> "hr"
        else -> "technical"
    }

    /** The server stores recommendation ids, not the words on the buttons. */
    private fun recommendationId(display: String): String = when (display.lowercase()) {
        "strong hire" -> "strong_hire"
        "hire" -> "hire"
        "no hire" -> "no_hire"
        "strong no" -> "strong_no"
        else -> display.lowercase().replace(' ', '_')
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-INT-01 · Interview calendar                                   *
 * ------------------------------------------------------------------ */

@Composable
fun InterviewsScreen(
    vm: InterviewsViewModel,
    onBack: () -> Unit,
    onSchedule: () -> Unit,
    onOpenKit: (String) -> Unit,
) {
    val list by vm.interviews.collectAsState()
    val loading by vm.loading.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Interviews", onBack, subtitle = "${list.size} scheduled") {
            IconTile(Icons.Default.Add, onSchedule, size = 38.dp, background = T.IndigoTint, tint = T.Indigo)
        }
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            list.isEmpty() -> StateBlock(
                Icons.Default.Event, "No interviews in flight",
                "Schedule one and it appears here with its panel and slot.",
                actionLabel = "Schedule one", onAction = onSchedule,
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(list, key = { it.id }) { iv ->
                    val at = Fmt.parse(iv.scheduledAt)
                    Row(
                        Modifier.fillMaxWidth().clickable { onOpenKit(iv.candidateId) },
                        horizontalArrangement = Arrangement.spacedBy(11.dp),
                    ) {
                        Column(
                            Modifier.width(48.dp).padding(top = 12.dp),
                            horizontalAlignment = Alignment.End,
                        ) {
                            TText(Fmt.time(at).ifBlank { "TBC" }, Type.mono, T.Ink)
                            TText(Fmt.shortDate(at), Type.monoXs, T.InkFaint, Modifier.padding(top = 2.dp))
                        }
                        Column(
                            Modifier.weight(1f)
                                .clip(T.RField).background(T.Surface)
                                .border(1.dp, T.Border, T.RField)
                                .padding(start = 3.dp),
                        ) {
                            Row(Modifier.fillMaxWidth()) {
                                Box(Modifier.width(3.dp).fillMaxHeight().background(T.Purple))
                                Column(Modifier.weight(1f).padding(12.dp)) {
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(9.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Avatar(iv.candidateName, iv.candidateId, 32.dp)
                                        Column(Modifier.weight(1f)) {
                                            TText(
                                                iv.candidateName ?: "Unnamed",
                                                Type.cardTitleSm, T.Ink, maxLines = 1,
                                            )
                                            TText(
                                                listOfNotNull(
                                                    iv.roundLabel ?: iv.kind,
                                                    iv.requisitionName,
                                                    "${iv.durationMinutes} min",
                                                ).joinToString(" · "),
                                                Type.bodySm, T.InkMuted, maxLines = 1,
                                            )
                                        }
                                        if (iv.hasScorecard) {
                                            Badge("SCORED", T.GreenTint, T.Green)
                                        }
                                    }
                                    Row(
                                        Modifier.padding(top = 9.dp),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Badge(
                                            iv.status.replace('_', ' ').uppercase(),
                                            T.PurpleTint, T.Purple,
                                        )
                                        Icon(
                                            if (iv.mode == "onsite") Icons.Default.Place
                                            else Icons.Default.Videocam,
                                            null, tint = T.InkMuted, modifier = Modifier.size(14.dp),
                                        )
                                        TText(
                                            iv.location ?: iv.mode ?: "—",
                                            Type.labelSm, T.InkMuted, maxLines = 1,
                                        )
                                    }
                                    if (iv.panel.isNotEmpty()) {
                                        TText(
                                            "Panel: " + iv.panel.mapNotNull { it.name }.joinToString(", "),
                                            Type.labelSm, T.InkFaint,
                                            Modifier.padding(top = 6.dp), maxLines = 1,
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-INT-02 · Schedule interview                                   *
 * ------------------------------------------------------------------ */

private val INTERVIEW_TYPES = listOf("Screening", "Technical", "Panel", "Culture fit", "HR round")

@Composable
fun ScheduleInterviewScreen(
    candidateId: String,
    vm: InterviewsViewModel,
    onBack: () -> Unit,
    onScheduled: () -> Unit,
) {
    val list by vm.candidates.collectAsState()
    val selected by vm.selected.collectAsState()
    var type by rememberSaveable { mutableStateOf("Technical") }
    var slot by rememberSaveable { mutableStateOf("") }
    var panel by rememberSaveable { mutableStateOf("") }
    var location by rememberSaveable { mutableStateOf("Google Meet") }
    var chosenId by rememberSaveable { mutableStateOf(candidateId) }

    LaunchedEffect(candidateId) { if (candidateId.isNotBlank()) vm.select(candidateId) }

    // Label for the chip, ISO for the wire. The server stores a real timestamp,
    // so a human-readable slot string is no longer enough to send.
    val slots = remember {
        val base = LocalDateTime.now().plusDays(1).withMinute(0).withSecond(0).withNano(0)
        listOf(10, 12, 15, 17).flatMap { h ->
            listOf(base.withHour(h), base.plusDays(1).withHour(h))
        }.map { Fmt.whenLabel(it) to Fmt.toIso(it) }
    }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar("Schedule interview", onBack, closeIcon = true)
            Box(Modifier.fillMaxWidth().height(1.dp).background(T.Divider))
            Column(
                Modifier.weight(1f).verticalScroll(rememberScrollState())
                    .padding(horizontal = T.Gutter).padding(top = 16.dp, bottom = 100.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                if (selected != null) {
                    TCard {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(selected!!.name, selected!!.id, 38.dp)
                            Column(Modifier.weight(1f)) {
                                TText(selected!!.name ?: "Unnamed", Type.cardTitleSm, T.Ink, maxLines = 1)
                                TText(selected!!.roleName, Type.bodySm, T.InkMuted, maxLines = 1)
                            }
                        }
                    }
                } else {
                    Column {
                        TText("Candidate", Type.label, T.InkMuted, Modifier.padding(bottom = 8.dp))
                        @OptIn(ExperimentalLayoutApi::class)
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            list.take(10).forEach { c ->
                                FilterChip(
                                    c.name ?: "Unnamed", chosenId == c.id,
                                    { chosenId = c.id; vm.select(c.id) }, height = 40.dp,
                                )
                            }
                        }
                    }
                }

                Column {
                    TText("Interview type", Type.label, T.InkMuted, Modifier.padding(bottom = 8.dp))
                    @OptIn(ExperimentalLayoutApi::class)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        INTERVIEW_TYPES.forEach { t ->
                            FilterChip(t, type == t, { type = t }, height = 38.dp)
                        }
                    }
                }

                Column {
                    TText("Proposed slot", Type.label, T.InkMuted, Modifier.padding(bottom = 8.dp))
                    @OptIn(ExperimentalLayoutApi::class)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        slots.forEach { (label, iso) ->
                            FilterChip(label, slot == iso, { slot = iso }, height = 40.dp)
                        }
                    }
                }

                TField(panel, { panel = it }, label = "Panel", placeholder = "e.g. Fatima Q, Arun S")
                TField(location, { location = it }, label = "Location or link", placeholder = "Google Meet")
            }
        }
        PrimaryButton(
            "Send invite",
            onClick = {
                val id = selected?.id ?: chosenId
                if (id.isNotBlank()) {
                    vm.schedule(id, type, slot.ifBlank { null }, panel, location) { onScheduled() }
                }
            },
            modifier = Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
            enabled = slot.isNotBlank() && (selected != null || chosenId.isNotBlank()),
            icon = Icons.Default.Send, height = 52.dp, shape = RoundedCornerShape(15.dp),
        )
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-INT-03 · Interview kit                                        *
 * ------------------------------------------------------------------ */

private val AGENDA = listOf(
    "0–5 min" to "Intro, role context, team shape",
    "5–25 min" to "Core skills deep dive against the candidate's stated stack",
    "25–40 min" to "System design or scenario relevant to the requisition",
    "40–45 min" to "Candidate questions, comp and notice confirmation",
)

/** Competencies used by both the kit and the scorecard, so they stay aligned. */
val COMPETENCIES = listOf(
    "Core craft" to "Walk through the hardest problem you solved in this stack.",
    "Systems thinking" to "How would you design this to survive a 10× load increase?",
    "Ownership" to "Describe a release you owned end to end.",
    "Communication" to "Explain your last architecture decision to a non-technical stakeholder.",
)

@Composable
fun InterviewKitScreen(
    candidateId: String,
    vm: InterviewsViewModel,
    onBack: () -> Unit,
    onScorecard: () -> Unit,
    onResume: () -> Unit,
) {
    val selected by vm.selected.collectAsState()
    LaunchedEffect(candidateId) { vm.select(candidateId) }
    val c = selected

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar("Interview kit", onBack) {
                Row(
                    Modifier.clip(T.RIcon).background(T.Fill).clickable(onClick = onResume)
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp),
                ) {
                    Icon(Icons.Default.PictureAsPdf, null, tint = T.Red, modifier = Modifier.size(16.dp))
                    TText("Resume", Type.label, T.Ink)
                }
            }
            Column(
                Modifier.weight(1f).verticalScroll(rememberScrollState())
                    .padding(horizontal = T.Gutter).padding(bottom = 100.dp),
            ) {
                Eyebrow("INTERVIEW BRIEF · 45 MIN", color = T.Purple)
                TText(c?.name ?: "Candidate", Type.screenTitle, T.Ink, Modifier.padding(top = 7.dp), maxLines = 2)
                TText(
                    c?.let { candidateSubtitle(it) } ?: "",
                    Type.body, T.InkMuted, Modifier.padding(top = 3.dp),
                )

                TCard(Modifier.padding(top = 14.dp), shape = T.RCardLg, padding = 14.dp) {
                    TText("Agenda", Type.cardTitleSm, T.Ink)
                    Spacer(Modifier.height(10.dp))
                    AGENDA.forEach { (t, d) ->
                        Row(Modifier.padding(bottom = 10.dp), horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                            TText(t, Type.monoSm, T.Purple, Modifier.width(58.dp))
                            TText(d, Type.body, T.InkBody, Modifier.weight(1f))
                        }
                    }
                }

                TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                    TText("Competencies & prompts", Type.cardTitleSm, T.Ink)
                    Spacer(Modifier.height(10.dp))
                    COMPETENCIES.forEach { (n, q) ->
                        Column(Modifier.padding(bottom = 11.dp)) {
                            TText(n, Type.label, T.Indigo)
                            TText(q, Type.body, T.InkMuted, Modifier.padding(top = 3.dp))
                        }
                    }
                }

                if (!c?.relevantSkills.isNullOrBlank() || !c?.otherSkills.isNullOrBlank()) {
                    TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                        TText("Stated skills", Type.cardTitleSm, T.Ink)
                        Spacer(Modifier.height(10.dp))
                        TagChips(Fmt.splitList(c?.relevantSkills ?: c?.otherSkills))
                    }
                }
            }
        }
        PrimaryButton(
            "Open scorecard", onScorecard,
            Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
            icon = Icons.Default.RateReview, height = 56.dp, shape = T.RFab,
        )
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-INT-04 · Scorecard                                            *
 * ------------------------------------------------------------------ */

private val RECOMMENDATIONS = listOf(
    "Strong hire" to T.Green,
    "Hire" to T.Teal,
    "No hire" to T.Orange,
    "Strong no" to T.Red,
)

@Composable
fun ScorecardScreen(
    candidateId: String,
    vm: InterviewsViewModel,
    onBack: () -> Unit,
    onSubmitted: () -> Unit,
) {
    val selected by vm.selected.collectAsState()
    LaunchedEffect(candidateId) { vm.select(candidateId) }

    var scores by rememberSaveable { mutableStateOf(mapOf<String, Int>()) }
    var recommendation by rememberSaveable { mutableStateOf<String?>(null) }
    var evidence by rememberSaveable { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }

    val complete = scores.size == COMPETENCIES.size && recommendation != null

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(
                "Scorecard", onBack,
                subtitle = selected?.name ?: "Candidate",
            ) {
                Box(
                    Modifier.clip(RoundedCornerShape(6.dp)).background(T.AmberTint)
                        .padding(horizontal = 7.dp, vertical = 4.dp),
                ) { TText("DRAFT", Type.monoXs, T.Amber) }
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(T.Divider))

            Column(
                Modifier.weight(1f).verticalScroll(rememberScrollState())
                    .padding(horizontal = T.Gutter).padding(top = 16.dp, bottom = 100.dp),
            ) {
                Row(Modifier.fillMaxWidth()) {
                    Eyebrow("COMPETENCY", Modifier.weight(1f))
                    Eyebrow("1 POOR — 4 EXCELLENT")
                }
                Spacer(Modifier.height(10.dp))

                COMPETENCIES.forEach { (name, _) ->
                    TCard(Modifier.padding(bottom = 9.dp)) {
                        TText(name, Type.cardTitleSm, T.Ink)
                        Row(Modifier.padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                            (1..4).forEach { v ->
                                val on = scores[name] == v
                                val col = when (v) {
                                    1 -> T.Red; 2 -> T.Orange; 3 -> T.Green; else -> T.Teal
                                }
                                Box(
                                    Modifier
                                        .weight(1f).height(46.dp)
                                        .clip(T.RField)
                                        .background(if (on) col else T.Surface)
                                        .border(1.5.dp, if (on) col else T.BorderStrong.copy(alpha = 0.6f), T.RField)
                                        .clickable { scores = scores + (name to v) },
                                    contentAlignment = Alignment.Center,
                                ) {
                                    TText(
                                        "$v",
                                        Type.mono.copy(fontSize = androidx.compose.ui.unit.TextUnit(15f, androidx.compose.ui.unit.TextUnitType.Sp)),
                                        if (on) Color.White else T.InkMuted,
                                    )
                                }
                            }
                        }
                    }
                }

                TText("Evidence & notes", Type.label, T.InkMuted, Modifier.padding(top = 5.dp, bottom = 7.dp))
                TTextArea(evidence, { evidence = it }, "What did they actually say or do? Quote specifics.", minHeight = 80.dp)

                TText("Recommendation", Type.label, T.InkMuted, Modifier.padding(top = 14.dp, bottom = 8.dp))
                RECOMMENDATIONS.chunked(2).forEach { pair ->
                    Row(Modifier.fillMaxWidth().padding(bottom = 7.dp), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        pair.forEach { (label, col) ->
                            val on = recommendation == label
                            Box(
                                Modifier
                                    .weight(1f).height(46.dp)
                                    .clip(T.RField)
                                    .background(if (on) col else T.Surface)
                                    .border(1.5.dp, if (on) col else T.BorderStrong.copy(alpha = 0.6f), T.RField)
                                    .clickable { recommendation = label },
                                contentAlignment = Alignment.Center,
                            ) { TText(label, Type.cardTitleSm, if (on) Color.White else T.InkBody) }
                        }
                    }
                }

                if (complete) {
                    Banner(Icons.Default.RateReview, T.IndigoTint, T.IndigoTint, T.Indigo, Modifier.padding(top = 8.dp)) {
                        TText(
                            when (recommendation) {
                                "Strong hire", "Hire" -> "Submitting moves this candidate to Offer."
                                "Strong no" -> "Submitting drops this candidate from the pipeline."
                                else -> "Submitting records the scorecard without changing the stage."
                            },
                            Type.bodySm, T.IndigoInk,
                        )
                    }
                }
            }
        }

        PrimaryButton(
            when {
                saving -> "Submitting…"
                !complete -> "Rate all ${COMPETENCIES.size} competencies"
                else -> "Submit scorecard"
            },
            onClick = {
                saving = true
                vm.submitScorecard(candidateId, scores, recommendation!!, evidence) {
                    saving = false; onSubmitted()
                }
            },
            modifier = Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
            enabled = complete && !saving,
            height = 52.dp, shape = RoundedCornerShape(15.dp),
        )
    }
}
