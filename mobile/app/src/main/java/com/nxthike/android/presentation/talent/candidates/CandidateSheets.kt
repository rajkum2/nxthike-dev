package com.nxthike.android.presentation.talent.candidates

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.nxthike.android.core.model.Stage
import com.nxthike.android.core.model.StageMove
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.model.hasConsent
import com.nxthike.android.core.model.isDnc
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.talent.common.candidateSubtitle

/* ------------------------------------------------------------------ *
 *  Stage picker                                                      *
 * ------------------------------------------------------------------ */

/**
 * Change a candidate's stage in two taps.
 *
 * Moving someone used to mean opening the profile, finding the stage control and
 * confirming — four screens deep for the single most common edit a recruiter
 * makes. This opens straight from the list row's stage pill.
 *
 * Dropping still asks for a reason, because that is the one move the desk
 * records a justification for; everything else commits on tap with an optional
 * note.
 */
@Composable
fun StagePickerSheetContent(
    candidate: CandidateDto,
    saving: Boolean,
    onConfirm: (stage: Stage, note: String, dropReason: String?) -> Unit,
) {
    val current = Stages.find(candidate.status)
    var target by rememberSaveable(candidate.id) { mutableStateOf<String?>(null) }
    var reason by rememberSaveable(candidate.id) { mutableStateOf<String?>(null) }
    var note by rememberSaveable(candidate.id) { mutableStateOf("") }

    val chosen = target?.let { Stages.find(it) }
    val needsReason = chosen != null && StageMove.requiresReason(chosen)

    Column(
        Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = T.Gutter)
            .padding(top = 10.dp, bottom = 20.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Avatar(candidate.name, candidate.id, 38.dp)
            Column(Modifier.weight(1f)) {
                TText(candidate.name ?: "Unnamed", Type.sheetTitle, T.Ink, maxLines = 1)
                TText(candidateSubtitle(candidate), Type.bodySm, T.InkMuted, maxLines = 1)
            }
        }

        TText("Move to", Type.label, T.InkMuted, Modifier.padding(top = 18.dp, bottom = 8.dp))

        // Full-width rows rather than a chip grid: nine stages as chips wrap into
        // an unreadable block, and a stage move deserves a target you cannot miss.
        Stages.ALL.forEach { stage ->
            val isCurrent = stage.id == current.id
            val isTarget = stage.id == target
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(bottom = 7.dp)
                    .clip(T.RField)
                    .background(if (isTarget) stage.tint else T.Surface)
                    .border(1.dp, if (isTarget) stage.color else T.Border, T.RField)
                    .clickable(enabled = !isCurrent && !saving) {
                        target = stage.id
                        if (!StageMove.requiresReason(stage)) reason = null
                    }
                    .padding(horizontal = 13.dp, vertical = 13.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(11.dp),
            ) {
                Box(
                    Modifier.size(10.dp).clip(T.RPill)
                        .background(if (isCurrent) T.InkGhost else stage.color),
                )
                TText(
                    stage.label,
                    if (isTarget) Type.cardTitleSm else Type.body,
                    if (isCurrent) T.InkFaint else T.Ink,
                    Modifier.weight(1f),
                )
                when {
                    isCurrent -> Badge("CURRENT", T.Fill, T.InkFaint)
                    isTarget -> Icon(
                        Icons.Default.CheckCircle, null,
                        tint = stage.color, modifier = Modifier.size(20.dp),
                    )
                }
            }
        }

        if (needsReason) {
            TText("Drop reason · required", Type.label, T.InkMuted, Modifier.padding(top = 8.dp, bottom = 8.dp))
            Column {
                Stages.DROP_REASONS.chunked(2).forEach { pair ->
                    Row(
                        Modifier.fillMaxWidth().padding(bottom = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        pair.forEach { r ->
                            Box(Modifier.weight(1f)) {
                                FilterChip(
                                    r, reason == r, { reason = r },
                                    Modifier.fillMaxWidth(), accent = T.Maroon, height = 40.dp,
                                )
                            }
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }

        TText("Note · optional", Type.label, T.InkMuted, Modifier.padding(top = 10.dp, bottom = 7.dp))
        TTextArea(note, { note = it }, "Why is this moving?", minHeight = 58.dp)

        Spacer(Modifier.height(14.dp))
        PrimaryButton(
            when {
                saving -> "Saving…"
                chosen == null -> "Pick a stage"
                needsReason && reason == null -> "Choose a drop reason"
                else -> "Move to ${chosen.label}"
            },
            { chosen?.let { onConfirm(it, note, reason) } },
            enabled = !saving && chosen != null && (!needsReason || reason != null),
            height = 54.dp,
        )
    }
}

/* ------------------------------------------------------------------ *
 *  Quick actions (long-press on a list row)                          *
 * ------------------------------------------------------------------ */

/** Everything the row used to need extra buttons for. */
@Composable
fun CandidateQuickActionsSheetContent(
    candidate: CandidateDto,
    onOpen: () -> Unit,
    onCall: () -> Unit,
    onMessage: () -> Unit,
    onStage: () -> Unit,
    onToggleStar: () -> Unit,
) {
    val dnc = candidate.isDnc
    Column(
        Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 10.dp, bottom = 22.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Avatar(candidate.name, candidate.id, 40.dp)
            Column(Modifier.weight(1f)) {
                TText(candidate.name ?: "Unnamed", Type.sheetTitle, T.Ink, maxLines = 1)
                TText(candidateSubtitle(candidate), Type.bodySm, T.InkMuted, maxLines = 1)
            }
            if (dnc) Badge("DND", T.MaroonTint, T.Maroon)
            else if (!candidate.hasConsent) Badge("No consent", T.AmberTint, T.AmberInk)
        }

        Spacer(Modifier.height(16.dp))
        QuickAction(Icons.Default.Person, "Open full record", onOpen)
        QuickAction(
            if (dnc) Icons.Default.Block else Icons.Default.Call,
            if (dnc) "Do not call — locked" else "Call now",
            onCall, enabled = !dnc,
            tint = if (dnc) T.Maroon else T.Indigo,
        )
        QuickAction(Icons.Default.Chat, "Message", onMessage, tint = T.Teal)
        QuickAction(Icons.Default.Timeline, "Change stage", onStage, tint = T.Purple)
        QuickAction(
            if (candidate.starred) Icons.Default.Star else Icons.Default.StarBorder,
            if (candidate.starred) "Remove star" else "Star candidate",
            onToggleStar,
            tint = if (candidate.starred) T.Amber else T.InkBody,
            divider = false,
        )
    }
}

@Composable
private fun QuickAction(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit,
    enabled: Boolean = true,
    tint: Color = T.InkBody,
    divider: Boolean = true,
) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(enabled = enabled, onClick = onClick)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(13.dp),
    ) {
        Icon(icon, null, tint = if (enabled) tint else T.InkGhost, modifier = Modifier.size(22.dp))
        TText(label, Type.body, if (enabled) T.Ink else T.InkGhost, Modifier.weight(1f))
    }
    if (divider) Box(Modifier.fillMaxWidth().height(1.dp).background(T.DividerFaint))
}
