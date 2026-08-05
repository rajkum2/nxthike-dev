package com.nxthike.android.presentation.talent.calls

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.HowToReg
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.MoveDown
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.nxthike.android.core.model.CallingWindow
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.presentation.calls.DispositionDraft
import com.nxthike.android.presentation.designsystem.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Locale

/* ------------------------------------------------------------------ *
 *  Disposition sheet — the most-used surface in the app              *
 * ------------------------------------------------------------------ */

@Composable
fun DispositionSheetContent(
    candidateName: String,
    candidatePhone: String?,
    draft: DispositionDraft,
    offline: Boolean,
    onPick: (String) -> Unit,
    onDuration: (String) -> Unit,
    onNote: (String) -> Unit,
    onNextAction: (String) -> Unit,
    onSaveAndNext: () -> Unit,
    onSaveOnly: () -> Unit,
) {
    val selected = Dispositions.find(draft.disposition)

    Column(Modifier.fillMaxWidth()) {
        // Header: who, and the duration estimate
        Row(
            Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 4.dp, bottom = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Column(Modifier.weight(1f)) {
                TText("Log the call", Type.sheetTitle, T.Ink)
                TText(
                    listOfNotNull(candidateName, candidatePhone).joinToString(" · "),
                    Type.body, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1,
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Row(
                    Modifier
                        .clip(T.RChip).background(T.Surface)
                        .border(1.dp, T.BorderStrong, T.RChip)
                        .padding(horizontal = 9.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Icon(Icons.Default.Timer, null, tint = T.InkMuted, modifier = Modifier.size(16.dp))
                    Box(Modifier.width(44.dp)) {
                        androidx.compose.foundation.text.BasicTextField(
                            value = draft.durationText,
                            onValueChange = onDuration,
                            singleLine = true,
                            textStyle = Type.mono.copy(
                                color = T.Ink,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                fontSize = androidx.compose.ui.unit.TextUnit(14f, androidx.compose.ui.unit.TextUnitType.Sp),
                            ),
                            cursorBrush = androidx.compose.ui.graphics.SolidColor(T.Indigo),
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
                TText("ESTIMATED", Type.monoXs, T.InkFaint, Modifier.padding(top = 4.dp))
            }
        }

        Column(
            Modifier.weight(1f, fill = false).verticalScroll(rememberScrollState())
                .padding(horizontal = T.Gutter),
        ) {
            // 11 outcome tiles, two per row
            Dispositions.ALL.chunked(2).forEach { pair ->
                Row(
                    Modifier.fillMaxWidth().padding(bottom = 7.dp),
                    horizontalArrangement = Arrangement.spacedBy(7.dp),
                ) {
                    pair.forEach { d ->
                        val on = draft.disposition == d.id
                        Row(
                            Modifier
                                .weight(1f)
                                .heightIn(min = 58.dp)
                                .clip(RoundedCornerShape(13.dp))
                                .background(if (on) d.color else d.tint)
                                .border(1.5.dp, if (on) d.color else Color.Transparent, RoundedCornerShape(13.dp))
                                .clickable { onPick(d.id) }
                                .padding(horizontal = 10.dp, vertical = 9.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Icon(
                                d.icon, null,
                                tint = if (on) Color.White else d.color,
                                modifier = Modifier.size(20.dp),
                            )
                            Column {
                                TText(
                                    d.label, Type.label,
                                    if (on) Color.White else d.color, maxLines = 2,
                                )
                                TText(
                                    d.category.label, Type.monoXs,
                                    if (on) Color.White.copy(alpha = 0.75f) else d.color.copy(alpha = 0.7f),
                                )
                            }
                        }
                    }
                    if (pair.size == 1) Spacer(Modifier.weight(1f))
                }
            }

            // What this outcome implies
            if (selected != null && selected.nextAction.isNotBlank()) {
                Row(
                    Modifier.fillMaxWidth().padding(top = 5.dp)
                        .clip(T.RField).background(selected.tint).padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(9.dp),
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = selected.color, modifier = Modifier.size(18.dp))
                    TText("Next action · ${selected.nextAction}", Type.body, T.Ink)
                }
            }

            Spacer(Modifier.height(12.dp))
            TText("Quick note", Type.label, T.InkMuted, Modifier.padding(bottom = 6.dp))
            TTextArea(
                draft.note, onNote,
                "What did they actually say? Comp, notice, and what they are comparing against.",
            )

            Spacer(Modifier.height(12.dp))
            TText("Next action", Type.label, T.InkMuted, Modifier.padding(bottom = 6.dp))
            @OptIn(ExperimentalLayoutApi::class)
            FlowRow(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                NEXT_ACTIONS.forEach { (key, pair) ->
                    val (label, icon) = pair
                    FilterChip(
                        label, draft.nextAction == key, { onNextAction(key) },
                        icon = icon, height = 44.dp,
                    )
                }
            }

            if (offline) {
                Spacer(Modifier.height(12.dp))
                Banner(Icons.Default.CloudOff, T.Fill, Color(0xFFDEDCE8), T.InkMuted) {
                    TText(
                        "Offline · this outcome queues in the outbox and syncs automatically.",
                        Type.bodySm, T.InkBody,
                    )
                }
            }
            Spacer(Modifier.height(14.dp))
        }

        // Sticky footer
        Row(
            Modifier.fillMaxWidth().background(T.Surface)
                .padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            PrimaryButton(
                if (offline) "Queue & next" else "Save & next",
                onSaveAndNext,
                Modifier.weight(1f),
                enabled = draft.valid,
                trailingIcon = Icons.AutoMirrored.Filled.ArrowForward,
                height = 54.dp,
            )
            Box(
                Modifier.height(54.dp).clip(T.RCardLg).background(T.Fill)
                    .clickable(enabled = draft.valid, onClick = onSaveOnly)
                    .padding(horizontal = 18.dp),
                contentAlignment = Alignment.Center,
            ) { TText("Save", Type.cardTitle, if (draft.valid) T.InkBody else T.InkGhost) }
        }
    }
}

private val NEXT_ACTIONS: List<Pair<String, Pair<String, ImageVector>>> = listOf(
    "callback" to ("Schedule callback" to Icons.Default.History),
    "stage" to ("Move stage" to Icons.Default.MoveDown),
    "whatsapp" to ("Send WhatsApp" to Icons.Default.Chat),
    "dnc" to ("Mark DNC" to Icons.Default.Block),
    "none" to ("Nothing" to Icons.Default.Remove),
)

/* ------------------------------------------------------------------ *
 *  Callback scheduler                                                *
 * ------------------------------------------------------------------ */

/** Fixed half-day grid; anything outside the window renders disabled, not hidden. */
private val SLOT_TIMES = listOf(
    LocalTime.of(9, 30), LocalTime.of(11, 0), LocalTime.of(12, 30), LocalTime.of(14, 0),
    LocalTime.of(15, 30), LocalTime.of(17, 0), LocalTime.of(18, 30), LocalTime.of(20, 0),
    LocalTime.of(21, 30),
)

@Composable
fun CallbackSheetContent(
    candidateName: String,
    window: CallingWindow,
    selected: LocalDateTime?,
    remind: Boolean,
    onSelect: (LocalDateTime) -> Unit,
    onRemind: (Boolean) -> Unit,
    onConfirm: () -> Unit,
) {
    val today = remember { LocalDate.now() }
    val days = remember { (0..2).map { today.plusDays(it.toLong()) } }
    var day by remember { mutableStateOf(selected?.toLocalDate() ?: today) }
    val time = selected?.toLocalTime()

    Column(Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 18.dp)) {
        TText("Schedule callback", Type.sheetTitle, T.Ink)
        TText(candidateName, Type.body, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1)

        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            days.forEach { d ->
                val on = d == day
                Column(
                    Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(13.dp))
                        .background(if (on) T.IndigoTint else T.Surface)
                        .border(1.5.dp, if (on) T.Indigo else T.BorderStrong.copy(alpha = 0.6f), RoundedCornerShape(13.dp))
                        .clickable {
                            day = d
                            time?.let { onSelect(d.atTime(it)) }
                        }
                        .padding(horizontal = 8.dp, vertical = 10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    TText(
                        when (d) {
                            today -> "Today"
                            today.plusDays(1) -> "Tomorrow"
                            else -> d.format(DateTimeFormatter.ofPattern("EEE", Locale.UK))
                        },
                        Type.labelSm, if (on) T.Indigo else T.InkFaint, maxLines = 1,
                    )
                    TText(
                        "${d.dayOfMonth}", Type.mono.copy(fontSize = androidx.compose.ui.unit.TextUnit(16f, androidx.compose.ui.unit.TextUnitType.Sp)),
                        if (on) T.IndigoInk else T.Ink, Modifier.padding(top = 3.dp),
                    )
                }
            }
        }

        Spacer(Modifier.height(10.dp))
        @OptIn(ExperimentalLayoutApi::class)
        FlowRow(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            SLOT_TIMES.forEach { t ->
                val at = day.atTime(t)
                val blocked = window.blocksSlot(at) || at.isBefore(LocalDateTime.now())
                val on = !blocked && selected == at
                Row(
                    Modifier
                        .height(44.dp)
                        .clip(T.RField)
                        .background(if (blocked) T.MaroonTint else if (on) T.IndigoTint else T.Surface)
                        .border(
                            1.dp,
                            if (blocked) T.MaroonBorder else if (on) T.Indigo else T.BorderStrong.copy(alpha = 0.6f),
                            T.RField,
                        )
                        .clickable(enabled = !blocked) { onSelect(at) }
                        .padding(horizontal = 13.dp)
                        .alpha(if (blocked) 0.6f else 1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    TText(
                        t.format(DateTimeFormatter.ofPattern("HH:mm")),
                        Type.mono,
                        if (blocked) T.Maroon else if (on) T.IndigoInk else T.InkBody,
                    )
                    if (blocked) Icon(Icons.Default.Block, null, tint = T.Maroon, modifier = Modifier.size(14.dp))
                }
            }
        }

        Spacer(Modifier.height(12.dp))
        Banner(Icons.Default.Schedule, T.TealTint, T.TealBorder, T.Teal) {
            TText(
                "Slots outside ${window.rangeLabel()} IST are disabled to stay inside the TRAI calling window.",
                Type.bodySm, T.TealInk,
            )
        }

        Spacer(Modifier.height(12.dp))
        TCard(padding = 12.dp) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                TText("Remind me 10 min before", Type.cardTitleSm, T.Ink, Modifier.weight(1f))
                TSwitch(remind, onRemind)
            }
        }

        Spacer(Modifier.height(14.dp))
        PrimaryButton(
            selected?.let { "Set callback · ${Fmt.whenLabel(it)}" } ?: "Pick a slot",
            onConfirm,
            enabled = selected != null,
            height = 54.dp,
        )
    }
}

/* ------------------------------------------------------------------ *
 *  DND block dialog                                                  *
 * ------------------------------------------------------------------ */

/**
 * Hard stop, not a warning. The spec's position is that a number on the NCPR
 * register with no consent on file must not be dialled at all.
 */
@Composable
fun DncDialogContent(onRecordConsent: () -> Unit, onBack: () -> Unit) = Column(Modifier.padding(22.dp)) {
    Box(
        Modifier.size(46.dp).clip(RoundedCornerShape(14.dp)).background(T.MaroonTint),
        contentAlignment = Alignment.Center,
    ) { Icon(Icons.Default.Block, null, tint = T.Maroon, modifier = Modifier.size(26.dp)) }

    TText("This number is on the DND register", Type.barTitle, T.Ink, Modifier.padding(top = 15.dp))
    TText(
        "The record is flagged do-not-call and no commercial-contact consent is recorded. " +
            "Calling could breach TCCCPR 2018.",
        Type.body, T.InkMuted, Modifier.padding(top = 8.dp),
    )

    TCard(Modifier.padding(top = 14.dp), shape = T.RField, padding = 11.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TText("DND status", Type.bodySm, T.InkMuted, Modifier.weight(1f))
            TText("Registered", Type.bodySm, T.Maroon, weight = androidx.compose.ui.text.font.FontWeight.Bold)
        }
        Row(Modifier.padding(top = 7.dp), verticalAlignment = Alignment.CenterVertically) {
            TText("Consent on file", Type.bodySm, T.InkMuted, Modifier.weight(1f))
            TText("None", Type.bodySm, T.Maroon, weight = androidx.compose.ui.text.font.FontWeight.Bold)
        }
    }

    Spacer(Modifier.height(15.dp))
    PrimaryButton("Record consent instead", onRecordConsent, icon = Icons.Default.HowToReg, height = 50.dp, shape = T.RCard)
    Spacer(Modifier.height(8.dp))
    PrimaryButton("Back to queue", onBack, height = 50.dp, shape = T.RCard, container = T.Fill, contentColor = T.InkBody)
}

/* ------------------------------------------------------------------ *
 *  Consent capture                                                   *
 * ------------------------------------------------------------------ */

private val CONSENT_CHANNELS = listOf(
    "call" to ("Phone call" to Icons.Default.Phone),
    "whatsapp" to ("WhatsApp" to Icons.Default.Chat),
    "email" to ("Email" to Icons.Default.Mail),
    "form" to ("Signed form" to Icons.Default.Draw),
)

@Composable
fun ConsentSheetContent(
    channel: String,
    onChannel: (String) -> Unit,
    onRecord: () -> Unit,
    saving: Boolean = false,
) = Column(Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 18.dp)) {
    TText("Record consent", Type.sheetTitle, T.Ink)
    TText(
        "Stored with channel and timestamp for the DPDP audit trail.",
        Type.body, T.InkMuted, Modifier.padding(top = 2.dp),
    )

    Spacer(Modifier.height(14.dp))
    TText("Consent obtained via", Type.label, T.InkMuted)
    Spacer(Modifier.height(8.dp))
    @OptIn(ExperimentalLayoutApi::class)
    FlowRow(
        Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        CONSENT_CHANNELS.forEach { (key, pair) ->
            FilterChip(pair.first, channel == key, { onChannel(key) }, icon = pair.second, height = 44.dp)
        }
    }

    Spacer(Modifier.height(12.dp))
    TCard(padding = 12.dp) {
        ConsentFact("Timestamp", Fmt.stamp(LocalDateTime.now()), mono = true)
        ConsentFact("Purpose", "Recruitment contact")
        ConsentFact("Retention", "24 months after last activity")
    }

    Spacer(Modifier.height(14.dp))
    PrimaryButton(
        if (saving) "Recording…" else "Record consent",
        onRecord, enabled = !saving, height = 54.dp, container = T.Teal,
    )
}

@Composable
private fun ConsentFact(label: String, value: String, mono: Boolean = false) = Row(
    Modifier.fillMaxWidth().padding(vertical = 5.dp),
    verticalAlignment = Alignment.CenterVertically,
) {
    TText(label, Type.body, T.InkMuted, Modifier.weight(1f))
    TText(value, if (mono) Type.mono else Type.cardTitleSm, T.Ink)
}

/* ------------------------------------------------------------------ *
 *  Erasure request                                                   *
 * ------------------------------------------------------------------ */

@Composable
fun ErasureSheetContent(
    reason: String,
    onReason: (String) -> Unit,
    onSubmit: () -> Unit,
) = Column(Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 18.dp)) {
    TText("Raise erasure request", Type.sheetTitle, T.Ink)
    TText(
        "Routed to your workspace admin. You cannot purge records yourself.",
        Type.body, T.InkMuted, Modifier.padding(top = 2.dp),
    )
    Spacer(Modifier.height(14.dp))
    TText("Reason", Type.label, T.InkMuted, Modifier.padding(bottom = 7.dp))
    TTextArea(reason, onReason, "Candidate asked for their data to be removed on today's call.", minHeight = 74.dp)
    Spacer(Modifier.height(12.dp))
    Banner(Icons.Default.Warning, T.MaroonTint, T.MaroonBorder, T.Maroon) {
        TText(
            "Once approved, the record, notes, call history and documents are permanently deleted. " +
                "An audit entry remains.",
            Type.bodySm, T.MaroonInk,
        )
    }
    Spacer(Modifier.height(14.dp))
    PrimaryButton("Submit request", onSubmit, enabled = reason.isNotBlank(), height = 54.dp, container = T.Maroon)
}
