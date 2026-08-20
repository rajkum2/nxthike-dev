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
import androidx.compose.material.icons.filled.Cancel
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
import com.nxthike.android.data.remote.dto.ApprovalDto
import com.nxthike.android.data.remote.dto.OfferDto
import com.nxthike.android.domain.repository.WorkspaceRepository
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
 * Offers and their approval chains, from `/api/workspace/offers`.
 *
 * These are offer records: a reference, a CTC with its breakup, a joining date,
 * an expiry, notice and buyout, the letter, and an ordered approval chain. The
 * screen used to list candidates parked at the Offer stage and note in its own
 * comment that "the API has no offer table" — it does, and approving here now
 * decides the approval rather than flipping a candidate's status.
 */
data class OfferGroup(val name: String, val status: String, val items: List<OfferDto>)

@HiltViewModel
class OffersViewModel @Inject constructor(
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _groups = MutableStateFlow<List<OfferGroup>>(emptyList())
    val groups: StateFlow<List<OfferGroup>> = _groups.asStateFlow()

    /** Approvals assigned to the signed-in user, awaiting a decision. */
    private val _approvals = MutableStateFlow<List<ApprovalDto>>(emptyList())
    val approvals: StateFlow<List<ApprovalDto>> = _approvals.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _selected = MutableStateFlow<OfferDto?>(null)
    val selected: StateFlow<OfferDto?> = _selected.asStateFlow()

    private val _busy = MutableStateFlow(false)
    val busy: StateFlow<Boolean> = _busy.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _loading.value = true
        _error.value = null
        workspace.offers()
            .onSuccess { offers -> _groups.value = group(offers) }
            .onError { e -> _error.value = e.message }
        workspace.approvals(mine = true, status = "pending")
            .onSuccess { _approvals.value = it }
        _loading.value = false
    }

    /**
     * Buckets by offer status, in the order an offer actually travels.
     *
     * Anything the server introduces later falls into a trailing "other" group
     * rather than vanishing from the screen.
     */
    private fun group(offers: List<OfferDto>): List<OfferGroup> {
        val order = listOf(
            "AWAITING APPROVAL" to listOf("draft", "pending_approval", "pending"),
            "APPROVED · WITH CANDIDATE" to listOf("approved", "sent", "letter_sent"),
            "ACCEPTED" to listOf("accepted", "signed", "joined"),
            "CLOSED" to listOf("declined", "rejected", "withdrawn", "lapsed"),
        )
        val claimed = order.flatMap { it.second }.toSet()
        return buildList {
            order.forEach { (label, statuses) ->
                val items = offers.filter { it.status.lowercase() in statuses }
                if (items.isNotEmpty()) add(OfferGroup(label, statuses.first(), items))
            }
            val rest = offers.filter { it.status.lowercase() !in claimed }
            if (rest.isNotEmpty()) add(OfferGroup("OTHER", "other", rest))
        }
    }

    fun select(offerId: String) = viewModelScope.launch {
        _selected.value = _groups.value.flatMap { it.items }.firstOrNull { it.id == offerId }
        // Always refetch: the list omits nothing, but the approval chain moves.
        workspace.offer(offerId).onSuccess { _selected.value = it }
    }

    /**
     * Decides one approval in the chain.
     *
     * The server owns what that means — the next approver in sequence, the offer
     * status, and the audit line. This used to set the candidate to `hired` or
     * `rejected` directly, which skipped the chain entirely.
     */
    fun decideApproval(approvalId: String, approve: Boolean, comment: String, onDone: () -> Unit = {}) =
        viewModelScope.launch {
            _busy.value = true
            workspace.decideApproval(approvalId, approve, comment)
                .onError { e -> _error.value = e.message }
            _busy.value = false
            load()
            _selected.value?.id?.let { select(it) }
            onDone()
        }

    /** Decides the offer's own pending approval, from the offer screen. */
    fun decide(offerId: String, approve: Boolean, comment: String, onDone: () -> Unit = {}) {
        val offer = _selected.value?.takeIf { it.id == offerId }
            ?: _groups.value.flatMap { it.items }.firstOrNull { it.id == offerId }
        val pending = offer?.approvals?.firstOrNull { it.status.equals("pending", true) }
        if (pending == null) {
            _error.value = "This offer has no approval waiting on you."
            onDone()
            return
        }
        decideApproval(pending.id, approve, comment, onDone)
    }

    fun markLetterSent(offerId: String) = viewModelScope.launch {
        _busy.value = true
        workspace.patchOffer(
            offerId,
            com.nxthike.android.data.remote.dto.OfferPatchDto(markLetterSent = true),
        ).onSuccess { _selected.value = it }.onError { e -> _error.value = e.message }
        _busy.value = false
        load()
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
    val approvals by vm.approvals.collectAsState()
    val pending = approvals.size

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
                "Raise an offer and it appears here with its approval chain.",
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                groups.forEach { group ->
                    item(key = group.name) { Eyebrow(group.name, Modifier.padding(top = 12.dp, bottom = 8.dp)) }
                    items(group.items, key = { it.id }) { offer ->
                        TCard(onClick = { onOpen(offer.id) }) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(11.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Avatar(offer.candidateName, offer.candidateId, 36.dp)
                                Column(Modifier.weight(1f)) {
                                    TText(
                                        offer.candidateName ?: "Unnamed",
                                        Type.cardTitleSm, T.Ink, maxLines = 1,
                                    )
                                    TText(
                                        listOfNotNull(offer.requisitionName, offer.clientName)
                                            .joinToString(" · ").ifBlank { "Unassigned" },
                                        Type.bodySm, T.InkMuted, maxLines = 1,
                                    )
                                }
                                offer.ctcTotal?.let {
                                    TText(Fmt.money(it), Type.cardTitleSm, T.Ink)
                                }
                            }
                            Row(
                                Modifier.padding(top = 10.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Badge(
                                    offer.status.replace('_', ' ').uppercase(),
                                    T.PurpleTint, T.Purple,
                                )
                                val decided = offer.approvals.count { !it.status.equals("pending", true) }
                                if (offer.approvals.isNotEmpty()) {
                                    TText(
                                        "$decided/${offer.approvals.size} APPROVED",
                                        Type.monoXs, T.InkFaint,
                                    )
                                }
                                offer.reference?.takeIf { it.isNotBlank() }?.let {
                                    TText(it.uppercase(), Type.monoXs, T.InkFaint)
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
 *  SCR-OFFER-02 · Offer detail                                       *
 * ------------------------------------------------------------------ */

@Composable
fun OfferDetailScreen(
    offerId: String,
    vm: OffersViewModel,
    onBack: () -> Unit,
    onDecided: () -> Unit,
    onOpenCandidate: (String) -> Unit,
) {
    val offer by vm.selected.collectAsState()
    val busy by vm.busy.collectAsState()
    var comment by remember { mutableStateOf("") }
    LaunchedEffect(offerId) { vm.select(offerId) }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar("Offer", onBack)
            val o = offer
            if (o == null) {
                SkeletonList(3, Modifier.padding(horizontal = T.Gutter))
            } else {
                val awaitingMe = o.approvals.firstOrNull { it.status.equals("pending", true) }
                Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter).padding(bottom = 100.dp),
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Badge(o.status.replace('_', ' ').uppercase(), T.PurpleTint, T.Purple)
                        TText(
                            o.reference?.uppercase() ?: "OFR-${o.id.takeLast(6).uppercase()}",
                            Type.monoXs, T.InkFaint,
                        )
                    }
                    TText(
                        o.candidateName ?: "Unnamed",
                        Type.screenTitle, T.Ink, Modifier.padding(top = 10.dp), maxLines = 2,
                    )
                    TText(
                        listOfNotNull(o.requisitionName, o.clientName).joinToString(" · ")
                            .ifBlank { "Unassigned" },
                        Type.body, T.InkMuted, Modifier.padding(top = 3.dp),
                    )

                    // The headline number, and what makes it up.
                    Column(
                        Modifier.fillMaxWidth().padding(top = 14.dp)
                            .clip(T.RCardLg).background(T.Indigo).padding(16.dp),
                    ) {
                        TText("Total CTC", Type.label, Color.White.copy(alpha = 0.85f))
                        TText(
                            Fmt.money(o.ctcTotal),
                            Type.heroTitle.copy(
                                fontSize = androidx.compose.ui.unit.TextUnit(
                                    28f, androidx.compose.ui.unit.TextUnitType.Sp,
                                ),
                            ),
                            Color.White, Modifier.padding(top = 6.dp), maxLines = 1,
                        )
                        o.bandNote?.takeIf { it.isNotBlank() }?.let {
                            TText(
                                it, Type.bodySm, Color.White.copy(alpha = 0.85f),
                                Modifier.padding(top = 6.dp),
                            )
                        }
                        if (o.breakup.isNotEmpty()) {
                            Spacer(Modifier.height(12.dp))
                            o.breakup.forEach { line ->
                                Row(Modifier.fillMaxWidth().padding(top = 5.dp)) {
                                    TText(
                                        line.label, Type.bodySm,
                                        Color.White.copy(alpha = 0.85f), Modifier.weight(1f),
                                    )
                                    TText(Fmt.money(line.amount), Type.mono, Color.White)
                                }
                            }
                        }
                    }

                    TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                        FactGrid(
                            listOf(
                                "Joining date" to Fmt.shortDate(Fmt.parse(o.joiningDate)).ifBlank { "—" },
                                "Offer expires" to Fmt.shortDate(Fmt.parse(o.expiresAt)).ifBlank { "—" },
                                "Notice period" to (o.noticeDays?.let { "$it days" } ?: "—"),
                                "Buyout" to (o.buyoutCost?.let { Fmt.money(it) } ?: "—"),
                            ),
                        )
                    }

                    // The approval chain, in sequence, with who decided what.
                    if (o.approvals.isNotEmpty()) {
                        TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                            TText("Approval chain", Type.cardTitleSm, T.Ink)
                            Spacer(Modifier.height(11.dp))
                            o.approvals.sortedBy { it.sequence }.forEach { ap ->
                                val approved = ap.status.equals("approved", true)
                                val rejected = ap.status.equals("rejected", true)
                                Row(
                                    Modifier.padding(bottom = 11.dp),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                ) {
                                    Icon(
                                        when {
                                            approved -> Icons.Default.CheckCircle
                                            rejected -> Icons.Default.Cancel
                                            else -> Icons.Default.Schedule
                                        },
                                        null,
                                        tint = when {
                                            approved -> T.Green
                                            rejected -> T.Maroon
                                            else -> T.InkFaint
                                        },
                                        modifier = Modifier.size(18.dp),
                                    )
                                    Column(Modifier.weight(1f)) {
                                        TText(
                                            ap.approverName ?: "Approver ${ap.sequence + 1}",
                                            Type.cardTitleSm, T.Ink, maxLines = 1,
                                        )
                                        TText(
                                            listOfNotNull(
                                                ap.approverRole,
                                                ap.status.replace('_', ' '),
                                                Fmt.shortDate(Fmt.parse(ap.decidedAt)).takeIf { it.isNotBlank() },
                                            ).joinToString(" · "),
                                            Type.labelSm, T.InkMuted, maxLines = 1,
                                        )
                                        ap.comment.takeIf { it.isNotBlank() }?.let {
                                            TText(it, Type.bodySm, T.InkBody, Modifier.padding(top = 4.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }

                    o.letterBody?.takeIf { it.isNotBlank() }?.let { body ->
                        TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                TText("Offer letter", Type.cardTitleSm, T.Ink, Modifier.weight(1f))
                                if (o.letterSentAt != null) {
                                    Badge("SENT", T.GreenTint, T.Green)
                                }
                            }
                            Spacer(Modifier.height(9.dp))
                            TText(body, Type.bodySm, T.InkBody)
                            if (o.letterSentAt == null) {
                                Spacer(Modifier.height(11.dp))
                                GhostButton(
                                    "Mark letter sent",
                                    { if (!busy) vm.markLetterSent(o.id) },
                                    Modifier.fillMaxWidth(), height = 42.dp,
                                )
                            }
                        }
                    }

                    GhostButton(
                        "Open full candidate record", { onOpenCandidate(o.candidateId) },
                        Modifier.fillMaxWidth().padding(top = 12.dp),
                        icon = Icons.Default.Visibility, height = 46.dp,
                    )

                    if (awaitingMe != null) {
                        TText(
                            "Decision comment", Type.label, T.InkMuted,
                            Modifier.padding(top = 14.dp, bottom = 7.dp),
                        )
                        TTextArea(comment, { comment = it }, "Why approve or reject?", minHeight = 60.dp)
                    }
                }
            }
        }

        // Only shown when an approval in this chain is actually waiting. The
        // server refuses a decision from anyone else, so offering the buttons
        // regardless would just produce a 403.
        if (offer?.approvals?.any { it.status.equals("pending", true) } == true) {
            Row(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                    .padding(horizontal = T.Gutter, vertical = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PrimaryButton(
                    if (busy) "Saving…" else "Approve",
                    { vm.decide(offerId, true, comment, onDecided) },
                    Modifier.weight(1f), enabled = !busy, height = 54.dp,
                    shape = RoundedCornerShape(17.dp),
                )
                GhostButton(
                    "Reject", { vm.decide(offerId, false, comment, onDecided) },
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
    val pending by vm.approvals.collectAsState()
    val loading by vm.loading.collectAsState()
    val busy by vm.busy.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Approvals", onBack, subtitle = "${pending.size} awaiting your decision")
        when {
            loading -> SkeletonList(3, Modifier.padding(horizontal = T.Gutter))
            pending.isEmpty() -> StateBlock(
                Icons.Default.CheckCircle, "Nothing to approve",
                "Approvals assigned to you land here.",
                iconBackground = T.GreenTint, iconTint = T.Green,
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(pending, key = { it.id }) { ap ->
                    TCard(shape = T.RCardLg, padding = 14.dp) {
                        Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                            Box(
                                Modifier.size(36.dp).clip(T.RChip).background(T.PurpleTint),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(
                                    Icons.Default.Gavel, null, tint = T.Purple,
                                    modifier = Modifier.size(19.dp),
                                )
                            }
                            Column(Modifier.weight(1f)) {
                                TText(
                                    "${ap.kind.replace('_', ' ').replaceFirstChar { it.uppercase() }} · " +
                                        (ap.refLabel ?: "—"),
                                    Type.cardTitle, T.Ink, maxLines = 1,
                                )
                                ap.detail?.takeIf { it.isNotBlank() }?.let {
                                    TText(
                                        it, Type.bodySm, T.InkMuted,
                                        Modifier.padding(top = 3.dp), maxLines = 2,
                                    )
                                }
                                TText(
                                    listOfNotNull(
                                        ap.requestedByName?.let { "Raised by $it" },
                                        Fmt.whenLabel(Fmt.parse(ap.createdAt)).takeIf { it.isNotBlank() },
                                    ).joinToString(" · "),
                                    Type.labelSm, T.InkFaint, Modifier.padding(top = 5.dp),
                                )
                            }
                        }
                        Row(
                            Modifier.padding(top = 12.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            PrimaryButton(
                                "Approve", { vm.decideApproval(ap.id, true, "") },
                                Modifier.weight(1f), enabled = !busy, height = 44.dp, shape = T.RField,
                            )
                            GhostButton(
                                "Reject", { vm.decideApproval(ap.id, false, "") },
                                Modifier.weight(1f), height = 44.dp,
                            )
                            // `refId` is the offer for an offer approval, so the
                            // eye opens the record the decision is about.
                            IconTile(
                                Icons.Default.Visibility, { onOpen(ap.refId) },
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
