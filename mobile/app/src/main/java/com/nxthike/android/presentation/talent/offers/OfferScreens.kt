package com.nxthike.android.presentation.talent.offers

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.Stage
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.data.remote.dto.CandidatePatchDto
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.talent.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Offers are the candidates sitting at the Offer / Hired / Dropped stages. The
 * API has no offer table, so the CTC breakup and approval chain a full ATS
 * would show are not invented here — what is shown is what the record knows.
 */
data class OfferGroup(val name: String, val stage: Stage, val items: List<CandidateDto>)

@HiltViewModel
class OffersViewModel @Inject constructor(
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _groups = MutableStateFlow<List<OfferGroup>>(emptyList())
    val groups: StateFlow<List<OfferGroup>> = _groups.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _selected = MutableStateFlow<CandidateDto?>(null)
    val selected: StateFlow<CandidateDto?> = _selected.asStateFlow()

    private val _busy = MutableStateFlow(false)
    val busy: StateFlow<Boolean> = _busy.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _loading.value = true
        val stages = listOf(
            "PENDING DECISION" to Stages.Offer,
            "JOINED" to Stages.Hired,
            "CLOSED · DROPPED" to Stages.Dropped,
        )
        _groups.value = coroutineScope {
            stages.map { (name, stage) ->
                async {
                    val items = hiring.candidates(null, null, stage.id, 1, 40).getOrNull()?.items.orEmpty()
                    if (items.isEmpty()) null else OfferGroup(name, stage, items)
                }
            }.awaitAll().filterNotNull()
        }
        _loading.value = false
    }

    fun select(id: String) = viewModelScope.launch {
        _selected.value = _groups.value.flatMap { it.items }.firstOrNull { it.id == id }
            ?: hiring.getCandidate(id).getOrNull()
    }

    /** Approve = move to Hired. Reject = move to Dropped. Both leave an audit line. */
    fun decide(candidateId: String, approve: Boolean, comment: String, onDone: () -> Unit) =
        viewModelScope.launch {
            _busy.value = true
            val c = hiring.getCandidate(candidateId).getOrNull()
            if (c != null) {
                val verdict = if (approve) "Offer approved" else "Offer rejected"
                val line = "[${Fmt.toIso(LocalDateTime.now()).take(16)}] $verdict" +
                    if (comment.isNotBlank()) " — $comment" else ""
                hiring.patchCandidate(
                    candidateId,
                    CandidatePatchDto(
                        status = if (approve) Stages.Hired.id else Stages.Dropped.id,
                        notes = (c.notes.trimEnd() + "\n" + line).trim(),
                    ),
                )
            }
            _busy.value = false
            load()
            onDone()
        }
}

/* ------------------------------------------------------------------ *
 *  SCR-OFFER-01 · Offer list                                         *
 * ------------------------------------------------------------------ */

@Composable
fun OffersScreen(
    vm: OffersViewModel,
    onBack: () -> Unit,
    onOpen: (String) -> Unit,
    onApprovals: () -> Unit,
) {
    val groups by vm.groups.collectAsState()
    val loading by vm.loading.collectAsState()
    val pending = groups.firstOrNull { it.stage.id == Stages.Offer.id }?.items?.size ?: 0

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Offers", onBack) {
            if (pending > 0) {
                Row(
                    Modifier.clip(T.RIcon).background(T.PurpleTint)
                        .clickable(onClick = onApprovals)
                        .padding(horizontal = 11.dp, vertical = 7.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp),
                ) {
                    Icon(Icons.Default.Gavel, null, tint = T.Purple, modifier = Modifier.size(17.dp))
                    TText("$pending to approve", Type.label, T.Purple)
                }
            }
        }
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            groups.isEmpty() -> StateBlock(
                Icons.Default.Gavel, "No offers in play",
                "Candidates you move to the Offer stage show up here.",
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                groups.forEach { group ->
                    item(key = group.name) { Eyebrow(group.name, Modifier.padding(top = 12.dp, bottom = 8.dp)) }
                    items(group.items, key = { it.id }) { c ->
                        TCard(onClick = { onOpen(c.id) }) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(11.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Avatar(c.name, c.id, 36.dp)
                                Column(Modifier.weight(1f)) {
                                    TText(c.name ?: "Unnamed", Type.cardTitleSm, T.Ink, maxLines = 1)
                                    TText(candidateSubtitle(c), Type.bodySm, T.InkMuted, maxLines = 1)
                                }
                            }
                            Row(
                                Modifier.padding(top = 10.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                StageBadge(group.stage)
                                TText(
                                    "UPDATED ${Fmt.shortDate(Fmt.parse(c.updatedAt))}",
                                    Type.monoXs, T.InkFaint,
                                )
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
 *  SCR-OFFER-02 · Offer detail                                       *
 * ------------------------------------------------------------------ */

@Composable
fun OfferDetailScreen(
    candidateId: String,
    vm: OffersViewModel,
    onBack: () -> Unit,
    onDecided: () -> Unit,
    onOpenCandidate: (String) -> Unit,
) {
    val c by vm.selected.collectAsState()
    val busy by vm.busy.collectAsState()
    var comment by remember { mutableStateOf("") }
    LaunchedEffect(candidateId) { vm.select(candidateId) }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar("Offer", onBack)
            val cand = c
            if (cand == null) {
                SkeletonList(3, Modifier.padding(horizontal = T.Gutter))
            } else {
                Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter).padding(bottom = 100.dp),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        StageBadge(Stages.find(cand.status))
                        TText("CAND-${cand.id.takeLast(6).uppercase()}", Type.monoXs, T.InkFaint)
                    }
                    TText(cand.name ?: "Unnamed", Type.screenTitle, T.Ink, Modifier.padding(top = 10.dp), maxLines = 2)
                    TText(candidateSubtitle(cand), Type.body, T.InkMuted, Modifier.padding(top = 3.dp))

                    // The record has no CTC field, so we surface what it does carry.
                    Column(
                        Modifier.fillMaxWidth().padding(top = 14.dp)
                            .clip(T.RCardLg).background(T.Indigo).padding(16.dp),
                    ) {
                        TText("Requisition", Type.label, Color.White.copy(alpha = 0.85f))
                        TText(
                            cand.roleName.ifBlank { "Unassigned" },
                            Type.heroTitle.copy(fontSize = androidx.compose.ui.unit.TextUnit(24f, androidx.compose.ui.unit.TextUnitType.Sp)),
                            Color.White, Modifier.padding(top = 6.dp), maxLines = 2,
                        )
                        TText(
                            "Stage ${Stages.find(cand.status).label} · updated ${Fmt.whenLabel(Fmt.parse(cand.updatedAt))}",
                            Type.bodySm, Color.White.copy(alpha = 0.85f), Modifier.padding(top = 6.dp),
                        )
                    }

                    TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                        FactGrid(
                            listOf(
                                "Availability" to (cand.availability ?: "—"),
                                "Experience" to (cand.experienceDuration ?: "—"),
                                "Current company" to (cand.latestCompany ?: "—"),
                                "Location" to (cand.city ?: "—"),
                            ),
                        )
                    }

                    TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                        TText("Decision trail", Type.cardTitleSm, T.Ink)
                        Spacer(Modifier.height(11.dp))
                        val trail = cand.notes.lines().filter {
                            it.contains("Offer", true) || it.contains("Scorecard", true) || it.contains("stage", true)
                        }.takeLast(5)
                        if (trail.isEmpty()) {
                            TText("Nothing recorded against this offer yet.", Type.body, T.InkMuted)
                        } else {
                            trail.forEach { line ->
                                Row(
                                    Modifier.padding(bottom = 10.dp),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                ) {
                                    Icon(Icons.Default.CheckCircle, null, tint = T.InkFaint, modifier = Modifier.size(18.dp))
                                    TText(line.trim(), Type.body, T.InkBody, Modifier.weight(1f))
                                }
                            }
                        }
                    }

                    GhostButton(
                        "Open full candidate record", { onOpenCandidate(cand.id) },
                        Modifier.fillMaxWidth().padding(top = 12.dp),
                        icon = Icons.Default.Visibility, height = 46.dp,
                    )

                    if (cand.status == Stages.Offer.id) {
                        TText("Decision comment", Type.label, T.InkMuted, Modifier.padding(top = 14.dp, bottom = 7.dp))
                        TTextArea(comment, { comment = it }, "Why approve or reject?", minHeight = 60.dp)
                    }
                }
            }
        }

        if (c?.status == Stages.Offer.id) {
            Row(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                    .padding(horizontal = T.Gutter, vertical = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PrimaryButton(
                    if (busy) "Saving…" else "Approve",
                    { vm.decide(candidateId, true, comment, onDecided) },
                    Modifier.weight(1f), enabled = !busy, height = 54.dp, shape = RoundedCornerShape(17.dp),
                )
                GhostButton(
                    "Reject", { vm.decide(candidateId, false, comment, onDecided) },
                    borderColor = T.MaroonBorder, contentColor = T.Maroon, height = 54.dp,
                )
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-OFFER-03 · Approvals                                          *
 * ------------------------------------------------------------------ */

@Composable
fun ApprovalsScreen(
    vm: OffersViewModel,
    onBack: () -> Unit,
    onOpen: (String) -> Unit,
) {
    val groups by vm.groups.collectAsState()
    val loading by vm.loading.collectAsState()
    val busy by vm.busy.collectAsState()
    val pending = groups.firstOrNull { it.stage.id == Stages.Offer.id }?.items.orEmpty()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Approvals", onBack, subtitle = "${pending.size} awaiting a decision")
        when {
            loading -> SkeletonList(3, Modifier.padding(horizontal = T.Gutter))
            pending.isEmpty() -> StateBlock(
                Icons.Default.CheckCircle, "Nothing to approve",
                "Offers raised by the team land here.",
                iconBackground = T.GreenTint, iconTint = T.Green,
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(pending, key = { it.id }) { c ->
                    TCard(shape = T.RCardLg, padding = 14.dp) {
                        Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                            Box(
                                Modifier.size(36.dp).clip(T.RChip).background(T.PurpleTint),
                                contentAlignment = Alignment.Center,
                            ) { Icon(Icons.Default.Gavel, null, tint = T.Purple, modifier = Modifier.size(19.dp)) }
                            Column(Modifier.weight(1f)) {
                                TText("Offer · ${c.name ?: "Unnamed"}", Type.cardTitle, T.Ink, maxLines = 1)
                                TText(candidateSubtitle(c), Type.bodySm, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 1)
                                TText(
                                    "Moved to Offer ${Fmt.whenLabel(Fmt.parse(c.updatedAt))}",
                                    Type.labelSm, T.InkFaint, Modifier.padding(top = 5.dp),
                                )
                            }
                        }
                        Row(Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            PrimaryButton(
                                "Approve", { vm.decide(c.id, true, "") {} },
                                Modifier.weight(1f), enabled = !busy, height = 44.dp, shape = T.RField,
                            )
                            GhostButton(
                                "Reject", { vm.decide(c.id, false, "") {} },
                                Modifier.weight(1f), height = 44.dp,
                            )
                            IconTile(
                                Icons.Default.Visibility, { onOpen(c.id) },
                                size = 44.dp, shape = T.RField, iconSize = 19.dp,
                            )
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}
