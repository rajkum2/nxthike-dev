package com.nxthike.android.presentation.talent.common

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.GppMaybe
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.model.Stage
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.CallLogDto
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.presentation.calls.QueueRow
import com.nxthike.android.presentation.designsystem.*

/* ------------------------------------------------------------------ *
 *  Flags                                                             *
 * ------------------------------------------------------------------ */

/**
 * The single-glyph compliance flag that sits beside a candidate's name.
 * Order matters: a DND lock outranks a missing consent, which outranks "fine".
 */
@Composable
fun ComplianceFlag(dnc: Boolean, consent: Boolean, size: Dp = 15.dp) {
    val (icon, tint) = when {
        dnc -> Icons.Default.Block to T.Maroon
        consent -> Icons.Default.VerifiedUser to T.Green
        else -> Icons.Default.GppMaybe to T.Amber
    }
    Icon(icon, if (dnc) "On DND register" else if (consent) "Consent on file" else "No consent recorded",
        tint = tint, modifier = Modifier.size(size))
}

@Composable
fun StageBadge(stage: Stage, modifier: Modifier = Modifier) =
    Badge(stage.label, stage.tint, stage.color, modifier)

@Composable
fun DispositionBadge(id: String?, modifier: Modifier = Modifier) {
    val d = Dispositions.display(id)
    Badge(d.label, d.tint, d.color, modifier, icon = d.icon)
}

@Composable
fun ConsentBadge(consent: Boolean, modifier: Modifier = Modifier) = Badge(
    if (consent) "Consent" else "No consent",
    if (consent) T.GreenTint else T.AmberTint,
    if (consent) T.Green else T.AmberInk,
    modifier,
    icon = if (consent) Icons.Default.VerifiedUser else Icons.Default.GppMaybe,
)

/* ------------------------------------------------------------------ *
 *  Candidate rows                                                    *
 * ------------------------------------------------------------------ */

/** Search-result row: avatar, name + flag, role line, stage + facts, call/chat. */
@Composable
fun CandidateCard(
    candidate: CandidateDto,
    onOpen: () -> Unit,
    onCall: () -> Unit,
    onChat: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val dnc = com.nxthike.android.core.model.CandidateTags.hasDnc(candidate.tags)
    val consent = com.nxthike.android.core.model.CandidateTags.hasConsent(candidate.tags)
    TCard(modifier, onClick = onOpen) {
        Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Avatar(candidate.name, candidate.id)
            Column(Modifier.weight(1f)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TText(candidate.name ?: "Unnamed", Type.cardTitle, T.Ink, Modifier.weight(1f, false), maxLines = 1)
                    ComplianceFlag(dnc, consent)
                }
                TText(candidateSubtitle(candidate), Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1)
                Spacer(Modifier.height(7.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    StageBadge(Stages.find(candidate.status))
                    candidate.city?.takeIf { it.isNotBlank() }?.let {
                        TText(it, Type.labelSm, T.InkFaint, maxLines = 1)
                    }
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                IconTile(
                    Icons.Default.Call, onCall, size = 36.dp,
                    background = if (dnc) T.MaroonTint else T.IndigoTint,
                    tint = if (dnc) T.Maroon else T.Indigo, iconSize = 18.dp,
                )
                IconTile(Icons.Default.Chat, onChat, size = 36.dp, background = T.TealTint, tint = T.Teal, iconSize = 18.dp)
            }
        }
    }
}

/** "Senior Java Developer · Infosys", falling back through what the record has. */
fun candidateSubtitle(c: CandidateDto): String = listOfNotNull(
    c.latestRole?.takeIf { it.isNotBlank() } ?: c.roleName.takeIf { it.isNotBlank() },
    c.latestCompany?.takeIf { it.isNotBlank() } ?: c.institute?.takeIf { it.isNotBlank() },
).joinToString(" · ").ifBlank { c.email ?: c.phone ?: "No details on file" }

/**
 * Dial-list row. Denser than the search row: it leads with the last outcome and
 * attempt count, because that is what decides whether you call now or skip.
 */
@Composable
fun QueueCard(
    row: QueueRow,
    onOpen: () -> Unit,
    onCall: () -> Unit,
    modifier: Modifier = Modifier,
    consent: Boolean = true,
) = TCard(
    modifier.alpha(if (row.dnc) 0.66f else 1f),
    border = if (row.dnc) T.MaroonBorder else T.Border,
    onClick = onOpen,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
        Avatar(row.name, row.candidateId)
        Column(Modifier.weight(1f)) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                TText(row.name, Type.cardTitle, T.Ink, Modifier.weight(1f, false), maxLines = 1)
                ComplianceFlag(row.dnc, consent)
            }
            row.roleName.takeIf { it.isNotBlank() }?.let {
                TText(it, Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1)
            }
            Spacer(Modifier.height(8.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                DispositionBadge(row.lastDisposition)
                TText(row.attemptLabel, Type.monoXs, T.InkFaint, maxLines = 1)
            }
        }
        Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(7.dp)) {
            TText(
                if (row.dnc) "DND locked" else Fmt.whenLabel(row.lastCalledAt).takeIf { row.lastCalledAt != null } ?: "Any time",
                Type.monoSm,
                if (row.dnc) T.Maroon else T.InkFaint,
                maxLines = 1,
            )
            IconTile(
                if (row.dnc) Icons.Default.Block else Icons.Default.Call,
                onCall,
                size = 44.dp,
                background = if (row.dnc) T.MaroonTint else T.IndigoTint,
                tint = if (row.dnc) T.Maroon else T.Indigo,
                shape = T.RCard,
                iconSize = 21.dp,
            )
        }
    }
}

/* ------------------------------------------------------------------ *
 *  Call log rows                                                     *
 * ------------------------------------------------------------------ */

/** Full history entry: outcome tile, duration, the note, then provenance. */
@Composable
fun CallLogCard(log: CallLogDto, modifier: Modifier = Modifier, showName: Boolean = true) {
    val d = Dispositions.display(log.disposition)
    TCard(modifier) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier.size(32.dp).clip(T.RIcon).background(d.tint),
                contentAlignment = Alignment.Center,
            ) { Icon(d.icon, null, tint = d.color, modifier = Modifier.size(17.dp)) }
            Column(Modifier.weight(1f)) {
                if (showName) {
                    TText(log.candidateName ?: "Candidate", Type.cardTitle, T.Ink, maxLines = 1)
                    TText(d.label, Type.bodySm, d.color, Modifier.padding(top = 2.dp), weight = androidx.compose.ui.text.font.FontWeight.SemiBold)
                } else {
                    TText(d.label, Type.cardTitleSm, d.color, maxLines = 1)
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                TText(Fmt.duration(log.durationSeconds), Type.mono, T.Ink)
                TText(Fmt.whenLabel(Fmt.parse(log.calledAt)), Type.monoSm, T.InkFaint, Modifier.padding(top = 2.dp))
            }
        }
        if (log.note.isNotBlank()) {
            Spacer(Modifier.height(9.dp))
            Box(
                Modifier.fillMaxWidth().clip(T.RIcon).background(Color(0xFFF7F6FB)).padding(horizontal = 10.dp, vertical = 9.dp),
            ) { TText(log.note, Type.body, T.InkBody) }
        }
        Spacer(Modifier.height(7.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            if (log.durationEstimated) TText("ESTIMATED", Type.monoXs, T.InkFaint)
            log.roleName?.takeIf { it.isNotBlank() }?.let { TText(it, Type.bodySm, T.InkFaint, maxLines = 1) }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  Generic rows & tiles                                              *
 * ------------------------------------------------------------------ */

/** Icon tile + title + subtitle + chevron. The spec's universal navigation row. */
@Composable
fun NavRow(
    icon: ImageVector,
    title: String,
    subtitle: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    iconTint: Color = T.Indigo,
    iconBackground: Color = T.IndigoTint,
    trailing: (@Composable () -> Unit)? = null,
) = TCard(modifier, padding = 13.dp, onClick = onClick) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(11.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier.size(34.dp).clip(T.RIcon).background(iconBackground),
            contentAlignment = Alignment.Center,
        ) { Icon(icon, null, tint = iconTint, modifier = Modifier.size(19.dp)) }
        Column(Modifier.weight(1f)) {
            TText(title, Type.cardTitleSm, T.Ink, maxLines = 1)
            if (subtitle != null) TText(subtitle, Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1)
        }
        if (trailing != null) trailing() else Chevron()
    }
}

/** Label + big mono number + optional delta. Used across every report screen. */
@Composable
fun StatTile(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    valueColor: Color = T.Ink,
    caption: String? = null,
) = TCard(modifier, padding = 13.dp) {
    TText(label, Type.label, T.InkMuted, maxLines = 1)
    TText(value, Type.monoStat, valueColor, Modifier.padding(top = 6.dp))
    if (caption != null) TText(caption, Type.labelSm, T.InkFaint, Modifier.padding(top = 5.dp), maxLines = 1)
}

/** One row of the outcome-mix chart: glyph, label, count, then the bar. */
@Composable
fun MixRow(
    label: String,
    count: Int,
    fraction: Float,
    color: Color,
    icon: ImageVector,
    modifier: Modifier = Modifier,
) = Column(modifier.fillMaxWidth()) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = color, modifier = Modifier.size(15.dp))
        Spacer(Modifier.width(6.dp))
        TText(label, Type.label, T.Ink, Modifier.weight(1f), maxLines = 1)
        TText("$count", Type.mono, T.InkMuted)
    }
    Spacer(Modifier.height(5.dp))
    Meter(fraction, height = 6.dp, color = color, track = T.Track)
}

/** Two-column key/value grid used by every detail header in the spec. */
@Composable
fun FactGrid(facts: List<Pair<String, String>>, modifier: Modifier = Modifier, monoValues: Set<String> = emptySet()) =
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        facts.chunked(2).forEach { pair ->
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                pair.forEach { (k, v) ->
                    Column(Modifier.weight(1f)) {
                        TText(k, Type.labelSm, T.InkFaint, maxLines = 1)
                        TText(
                            v.ifBlank { "—" },
                            if (k in monoValues) Type.mono else Type.cardTitleSm,
                            T.Ink,
                            Modifier.padding(top = 3.dp),
                            maxLines = 2,
                        )
                    }
                }
                if (pair.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }

/** Skill / tag chips. */
@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun TagChips(tags: List<String>, modifier: Modifier = Modifier) = FlowRow(
    modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(6.dp),
    verticalArrangement = Arrangement.spacedBy(6.dp),
) {
    tags.forEach { t ->
        Box(
            Modifier
                .clip(T.RIcon)
                .background(T.Fill)
                .padding(horizontal = 10.dp, vertical = 5.dp),
        ) { TText(t, Type.label, T.InkBody, maxLines = 1) }
    }
}

/** Timeline entry with the connecting rail. */
@Composable
fun TimelineRow(
    icon: ImageVector,
    tint: Color,
    tintBackground: Color,
    title: String,
    detail: String,
    when_: String,
    who: String?,
    last: Boolean = false,
    modifier: Modifier = Modifier,
) = Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            Modifier.size(30.dp).clip(T.RIcon).background(tintBackground),
            contentAlignment = Alignment.Center,
        ) { Icon(icon, null, tint = tint, modifier = Modifier.size(16.dp)) }
        if (!last) {
            Box(
                Modifier
                    .padding(vertical = 4.dp)
                    .width(1.5.dp)
                    .weight(1f)
                    .background(T.TrackBorder),
            )
        }
    }
    Column(Modifier.weight(1f).padding(bottom = if (last) 0.dp else 16.dp)) {
        Row(verticalAlignment = Alignment.Top) {
            TText(title, Type.cardTitleSm, T.Ink, Modifier.weight(1f))
            TText(when_, Type.monoXs, T.InkFaint)
        }
        if (detail.isNotBlank()) TText(detail, Type.body, T.InkMuted, Modifier.padding(top = 4.dp))
        if (who != null) TText(who, Type.labelSm, T.InkFaint, Modifier.padding(top = 5.dp), maxLines = 1)
    }
}

/** Section heading with an optional right-hand text action. */
@Composable
fun SectionRow(
    title: String,
    modifier: Modifier = Modifier,
    action: String? = null,
    onAction: (() -> Unit)? = null,
) = Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
    TText(title, Type.section, T.Ink, Modifier.weight(1f))
    if (action != null && onAction != null) {
        TText(action, Type.label, T.Indigo, Modifier.clickable(onClick = onAction))
    }
}

/** In-window / blocked pill used on the pre-call card. */
@Composable
fun WindowBadge(open: Boolean, modifier: Modifier = Modifier) = Badge(
    if (open) "In window" else "Window closed",
    if (open) T.TealTint else T.MaroonTint,
    if (open) T.TealInk else T.Maroon,
    modifier,
    icon = if (open) Icons.Default.Schedule else Icons.Default.Block,
)
