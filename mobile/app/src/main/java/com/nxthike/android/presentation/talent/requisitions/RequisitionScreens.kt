package com.nxthike.android.presentation.talent.requisitions

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.ViewList
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.ViewKanban
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nxthike.android.core.model.Stage
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.local.WorkspaceMode
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.common.*
import com.nxthike.android.core.model.hasConsent
import com.nxthike.android.core.model.isDnc

/* ------------------------------------------------------------------ *
 *  SCR-JOB-01 · Requisition list                                     *
 * ------------------------------------------------------------------ */

@Composable
fun RequisitionsScreen(
    session: SessionViewModel,
    onOpen: (String) -> Unit,
    onCreate: () -> Unit,
    onPostings: () -> Unit,
) {
    val vm: RequisitionsViewModel = hiltViewModel()
    val state by vm.state.collectAsState()
    val prefs by session.prefs.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        ScreenHeader(
            prefs.mode.reqWordPlural,
            subtitle = if (state.loading) {
                "Loading pipelines…"
            } else {
                "${state.items.size} open · ${Fmt.count(state.totalCandidates)} candidates"
            },
        ) {
            IconTile(Icons.Default.Work, onPostings)
            IconTile(Icons.Default.Add, onCreate, background = T.IndigoTint, tint = T.Indigo)
        }

        when {
            state.loading -> SkeletonList(5, Modifier.padding(horizontal = T.Gutter))
            state.error != null -> ErrorState(state.error!!, onRetry = { vm.load() })
            state.items.isEmpty() -> StateBlock(
                Icons.Default.Work, "No ${prefs.mode.reqWordPlural.lowercase()} yet",
                "Create one to group candidates and build call queues from it.",
                actionLabel = "New ${prefs.mode.reqWord.lowercase()}", onAction = onCreate,
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(state.items, key = { it.id }) { req ->
                    TCard(shape = T.RCardLg, padding = 14.dp, onClick = { onOpen(req.id) }) {
                        Row(verticalAlignment = Alignment.Top) {
                            Column(Modifier.weight(1f)) {
                                TText(req.title, Type.section, T.Ink, maxLines = 2)
                                // Only when there is something to add — the counts
                                // below already carry the pipeline size.
                                req.description?.takeIf { it.isNotBlank() }?.let {
                                    TText(it, Type.bodySm, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 1)
                                }
                            }
                            if (req.detailed) {
                                Badge(
                                    req.priority,
                                    when (req.priority) {
                                        "P1" -> T.RedTint; "P2" -> T.AmberTint; else -> T.NeutralTint
                                    },
                                    when (req.priority) {
                                        "P1" -> T.Red; "P2" -> T.Amber; else -> T.Neutral
                                    },
                                )
                            }
                        }
                        Row(
                            Modifier.padding(top = 11.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            TText("${Fmt.count(req.total)} in pipeline", Type.label, T.Ink)
                            if (req.detailed) {
                                Divider()
                                TText("${Fmt.count(req.submitted)} submitted", Type.label, T.InkMuted)
                                Divider()
                                TText("${Fmt.count(req.interviewing)} interviewing", Type.label, T.InkMuted)
                            }
                        }
                        Meter(
                            if (req.detailed) req.advanced else 0f,
                            Modifier.padding(top = 10.dp), height = 6.dp,
                        )
                        Row(
                            Modifier.padding(top = 9.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            TText(
                                if (req.detailed) {
                                    "${Math.round(req.advanced * 100)}% past first contact"
                                } else {
                                    "Loading stage breakdown…"
                                },
                                Type.monoSm, T.InkFaint, Modifier.weight(1f),
                            )
                            TText(if (req.active) "Active" else "Closed", Type.labelSm, if (req.active) T.Green else T.InkFaint)
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

@Composable
private fun Divider() = Box(Modifier.size(1.dp, 11.dp).background(Color(0xFFDEDCE8)))

/* ------------------------------------------------------------------ *
 *  SCR-JOB-02 · Requisition detail                                   *
 * ------------------------------------------------------------------ */

@Composable
fun RequisitionDetailScreen(
    roleId: String,
    session: SessionViewModel,
    onBack: () -> Unit,
    onKanban: () -> Unit,
    onStartCalling: () -> Unit,
    onCandidate: (String) -> Unit,
    onSubmissions: () -> Unit,
) {
    val vm: RequisitionDetailViewModel = hiltViewModel()
    val state by vm.state.collectAsState()
    val prefs by session.prefs.collectAsState()
    LaunchedEffect(roleId) { vm.load(roleId) }

    val req = state.requisition

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(req?.title ?: prefs.mode.reqWord, onBack)
            when {
                state.loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
                req == null -> ErrorState(state.error ?: "Not found", onRetry = { vm.load(roleId) })
                else -> Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter).padding(bottom = 100.dp),
                ) {
                    TText(req.title, Type.screenTitle, T.Ink, maxLines = 3)
                    TText(
                        listOfNotNull(
                            prefs.mode.clientWord,
                            req.description?.takeIf { it.isNotBlank() },
                        ).joinToString(" · "),
                        Type.body, T.InkMuted, Modifier.padding(top = 4.dp),
                    )

                    Row(Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        MiniStat("In pipeline", Fmt.count(req.total), Modifier.weight(1f))
                        MiniStat("Submitted", Fmt.count(req.submitted), Modifier.weight(1f))
                        MiniStat("Hired", Fmt.count(req.hired), Modifier.weight(1f))
                    }

                    // Comp comes from the matching public posting when one exists.
                    state.posting?.let { posting ->
                        TCard(Modifier.padding(top = 10.dp), padding = 13.dp) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Payments, null, tint = T.Amber, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(6.dp))
                                TText("Commercials · from the public posting", Type.label, T.Ink)
                            }
                            Spacer(Modifier.height(10.dp))
                            FactGrid(
                                listOf(
                                    "Compensation" to (posting.salary?.raw ?: posting.stipend?.raw ?: "Not published"),
                                    "Location" to (posting.location ?: "—"),
                                    "Type" to (posting.type ?: "—"),
                                    "Status" to (posting.status ?: "—"),
                                ),
                            )
                        }
                    }

                    SectionRow(
                        "Pipeline", Modifier.padding(top = 16.dp),
                        action = "Open board", onAction = onKanban,
                    )
                    Row(
                        Modifier.padding(top = 9.dp).horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Stages.BOARD.forEach { stage ->
                            val n = req.byStage[stage.id] ?: 0
                            Column(
                                Modifier
                                    .widthIn(min = 82.dp)
                                    .clip(T.RChip).background(stage.tint)
                                    .padding(horizontal = 12.dp, vertical = 9.dp),
                            ) {
                                TText(
                                    "$n",
                                    Type.mono.copy(fontSize = androidx.compose.ui.unit.TextUnit(17f, androidx.compose.ui.unit.TextUnitType.Sp)),
                                    stage.color,
                                )
                                TText(stage.label, Type.labelSm, stage.color, Modifier.padding(top = 2.dp), maxLines = 1)
                            }
                        }
                    }

                    SectionRow("Candidates in play", Modifier.padding(top = 16.dp))
                    Spacer(Modifier.height(9.dp))
                    if (state.candidates.isEmpty()) {
                        TText("Nothing sourced against this requisition yet.", Type.body, T.InkMuted)
                    } else {
                        state.candidates.take(12).forEach { c ->
                            TCard(
                                Modifier.padding(bottom = T.Gap), padding = 11.dp,
                                onClick = { onCandidate(c.id) },
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(11.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Avatar(c.name, c.id, 36.dp)
                                    Column(Modifier.weight(1f)) {
                                        TText(c.name ?: "Unnamed", Type.cardTitleSm, T.Ink, maxLines = 1)
                                        TText(candidateSubtitle(c), Type.bodySm, T.InkMuted, maxLines = 1)
                                    }
                                    StageBadge(Stages.find(c.status))
                                }
                            }
                        }
                    }
                }
            }
        }

        if (req != null) {
            Row(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                    .padding(horizontal = T.Gutter, vertical = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PrimaryButton(
                    "Start calling", onStartCalling, Modifier.weight(1f),
                    icon = Icons.Default.PlayArrow, height = 54.dp, shape = RoundedCornerShape(17.dp),
                )
                IconTile(
                    Icons.Default.Send, onSubmissions, size = 54.dp,
                    background = T.Surface, tint = T.InkBody, shape = RoundedCornerShape(17.dp), iconSize = 21.dp,
                )
            }
        }
    }
}

@Composable
private fun MiniStat(label: String, value: String, modifier: Modifier = Modifier) =
    TCard(modifier, shape = T.RField, padding = 11.dp) {
        TText(label, Type.labelSm, T.InkFaint, maxLines = 1)
        TText(
            value,
            Type.mono.copy(fontSize = androidx.compose.ui.unit.TextUnit(17f, androidx.compose.ui.unit.TextUnitType.Sp)),
            T.Ink, Modifier.padding(top = 3.dp),
        )
    }

/* ------------------------------------------------------------------ *
 *  SCR-JOB-03 · Create requisition                                   *
 * ------------------------------------------------------------------ */

@Composable
fun NewRequisitionScreen(session: SessionViewModel, onBack: () -> Unit, onCreated: () -> Unit) {
    val vm: RequisitionsViewModel = hiltViewModel()
    val prefs by session.prefs.collectAsState()
    var name by rememberSaveable { mutableStateOf("") }
    var description by rememberSaveable { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar("New ${prefs.mode.reqWord.lowercase()}", onBack, closeIcon = true)
            Box(Modifier.fillMaxWidth().height(1.dp).background(T.Divider))
            Column(
                Modifier.weight(1f).verticalScroll(rememberScrollState())
                    .padding(horizontal = T.Gutter).padding(top = 16.dp, bottom = 100.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                TField(name, { name = it }, label = "Title *", placeholder = "e.g. Staff Site Reliability Engineer")
                TField(
                    description, { description = it },
                    label = prefs.mode.clientWord, placeholder = "e.g. Platform Engineering",
                    singleLine = false, minHeight = 80.dp,
                )
                Banner(Icons.Default.Work, T.IndigoTint, T.IndigoTint, T.Indigo) {
                    TText(
                        "Candidates you add against this ${prefs.mode.reqWord.lowercase()} become its pipeline, " +
                            "and its call queue.",
                        Type.bodySm, T.IndigoInk,
                    )
                }
            }
        }
        PrimaryButton(
            if (saving) "Creating…" else "Create ${prefs.mode.reqWord.lowercase()}",
            onClick = { saving = true; vm.create(name, description) { saving = false; onCreated() } },
            modifier = Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
            enabled = name.isNotBlank() && !saving,
            height = 52.dp, shape = RoundedCornerShape(15.dp),
        )
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-PIPE-01 · Pipeline board                                      *
 * ------------------------------------------------------------------ */

@Composable
fun PipelineBoardScreen(
    roleId: String?,
    vm: PipelineViewModel,
    onBack: () -> Unit,
    onCandidate: (String) -> Unit,
    onListView: () -> Unit,
    onMoveRequested: () -> Unit,
) {
    val state by vm.state.collectAsState()
    LaunchedEffect(roleId) { vm.load(roleId) }

    Column(Modifier.fillMaxSize().background(T.Board)) {
        Column(Modifier.fillMaxWidth().background(T.Bg)) {
            TopBar("Pipeline", onBack, subtitle = state.roleName) {
                IconTile(Icons.AutoMirrored.Filled.ViewList, onListView, size = 36.dp, iconSize = 19.dp)
                IconTile(Icons.Default.ViewKanban, {}, size = 36.dp, background = T.IndigoTint, tint = T.Indigo, iconSize = 19.dp)
            }
            Row(
                Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(bottom = 10.dp)
                    .clip(T.RIcon).background(T.IndigoTint).padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Icon(Icons.Default.SwapHoriz, null, tint = T.Indigo, modifier = Modifier.size(16.dp))
                TText("Tap a card's stage chip to move it between columns", Type.bodySm, T.IndigoInk)
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(T.TrackBorder))
        }

        when {
            state.loading -> SkeletonList(5, Modifier.padding(T.Gutter))
            state.error != null -> ErrorState(state.error!!, onRetry = { vm.load(roleId) })
            else -> Row(
                Modifier.fillMaxSize().horizontalScroll(rememberScrollState()).padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Stages.BOARD.forEach { stage ->
                    val cards = state.columns[stage.id].orEmpty()
                    Column(
                        Modifier
                            .width(194.dp)
                            .fillMaxHeight()
                            .clip(T.RCard)
                            .background(T.Bg)
                            .border(1.dp, T.TrackBorder, T.RCard),
                    ) {
                        Row(
                            Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(7.dp),
                        ) {
                            Box(Modifier.size(8.dp).clip(CircleShape).background(stage.color))
                            TText(stage.label, Type.label, T.Ink, Modifier.weight(1f), maxLines = 1)
                            TText("${cards.size}", Type.mono, T.InkMuted)
                        }
                        LazyColumn(
                            Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            verticalArrangement = Arrangement.spacedBy(7.dp),
                        ) {
                            items(cards, key = { it.id }) { c ->
                                TCard(
                                    shape = RoundedCornerShape(11.dp), padding = 10.dp,
                                    onClick = { onCandidate(c.id) },
                                ) {
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Avatar(c.name, c.id, 26.dp)
                                        TText(c.name ?: "Unnamed", Type.label, T.Ink, maxLines = 1)
                                    }
                                    TText(
                                        candidateSubtitle(c), Type.labelSm, T.InkMuted,
                                        Modifier.padding(top = 7.dp), maxLines = 1,
                                    )
                                    Row(
                                        Modifier.fillMaxWidth().padding(top = 7.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        StageMoveChip(
                                            stage,
                                            onMove = { target ->
                                                vm.stageMove(c, target)
                                                onMoveRequested()
                                            },
                                        )
                                        Spacer(Modifier.weight(1f))
                                        ComplianceFlag(
                                            c.isDnc,
                                            c.hasConsent,
                                            13.dp,
                                        )
                                    }
                                }
                            }
                            item { Spacer(Modifier.height(8.dp)) }
                        }
                    }
                }
            }
        }
    }
}

/** Tap-to-move affordance — drag-and-drop is unreliable inside a scrolling board. */
@Composable
private fun StageMoveChip(current: Stage, onMove: (Stage) -> Unit) {
    var open by remember { mutableStateOf(false) }
    Box {
        Row(
            Modifier
                .clip(T.RBadge).background(current.tint)
                .clickable { open = true }
                .padding(horizontal = 7.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(3.dp),
        ) {
            TText("Move", Type.monoXs, current.color)
            Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = current.color, modifier = Modifier.size(11.dp))
        }
        androidx.compose.material3.DropdownMenu(open, { open = false }) {
            Stages.BOARD.filter { it.id != current.id }.forEach { stage ->
                androidx.compose.material3.DropdownMenuItem(
                    text = { TText(stage.label, Type.body, stage.color) },
                    onClick = { open = false; onMove(stage) },
                )
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-PIPE-02 · Pipeline list                                       *
 * ------------------------------------------------------------------ */

@Composable
fun PipelineListScreen(
    roleId: String?,
    vm: PipelineViewModel,
    onBack: () -> Unit,
    onCandidate: (String) -> Unit,
    onBoardView: () -> Unit,
) {
    val state by vm.state.collectAsState()
    LaunchedEffect(roleId) { vm.load(roleId) }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Pipeline list", onBack, subtitle = state.roleName) {
            IconTile(Icons.Default.ViewKanban, onBoardView, size = 36.dp, iconSize = 19.dp)
        }
        when {
            state.loading -> SkeletonList(5, Modifier.padding(horizontal = T.Gutter))
            state.error != null -> ErrorState(state.error!!, onRetry = { vm.load(roleId) })
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                Stages.BOARD.forEach { stage ->
                    val cards = state.columns[stage.id].orEmpty()
                    if (cards.isNotEmpty()) {
                        item(key = "h-${stage.id}") {
                            Row(
                                Modifier.padding(top = 12.dp, bottom = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(7.dp),
                            ) {
                                Box(Modifier.size(8.dp).clip(CircleShape).background(stage.color))
                                TText(stage.label, Type.cardTitleSm, T.Ink)
                                TText("${cards.size}", Type.monoSm, T.InkFaint)
                            }
                        }
                        items(cards, key = { it.id }) { c ->
                            TCard(shape = T.RField, padding = 10.dp, onClick = { onCandidate(c.id) }) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Avatar(c.name, c.id, 32.dp)
                                    Column(Modifier.weight(1f)) {
                                        TText(c.name ?: "Unnamed", Type.cardTitleSm, T.Ink, maxLines = 1)
                                        TText(candidateSubtitle(c), Type.labelSm, T.InkMuted, maxLines = 1)
                                    }
                                    ComplianceFlag(
                                        c.isDnc,
                                        c.hasConsent,
                                    )
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
 *  Stage-change sheet                                                *
 * ------------------------------------------------------------------ */

@Composable
fun StageChangeSheetContent(
    move: PendingMove,
    onConfirm: (note: String, dropReason: String?) -> Unit,
) {
    var note by rememberSaveable { mutableStateOf("") }
    var reason by rememberSaveable { mutableStateOf<String?>(null) }
    val isDrop = move.to.id == Stages.Dropped.id

    Column(Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 20.dp)) {
        TText("Stage change", Type.sheetTitle, T.Ink)

        Row(
            Modifier.padding(top = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Badge(move.from.label, T.NeutralTint, T.Neutral)
            Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = T.InkGhost, modifier = Modifier.size(19.dp))
            Badge(move.to.label, move.to.tint, move.to.color)
        }

        TCard(Modifier.padding(top = 12.dp)) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(11.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Avatar(move.candidate.name, move.candidate.id, 36.dp)
                Column(Modifier.weight(1f)) {
                    TText(move.candidate.name ?: "Unnamed", Type.cardTitleSm, T.Ink, maxLines = 1)
                    TText(candidateSubtitle(move.candidate), Type.bodySm, T.InkMuted, maxLines = 1)
                }
            }
        }

        if (isDrop) {
            Spacer(Modifier.height(12.dp))
            TText("Drop reason · required", Type.label, T.InkMuted, Modifier.padding(bottom = 8.dp))
            @OptIn(ExperimentalLayoutApi::class)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Stages.DROP_REASONS.forEach { r ->
                    FilterChip(r, reason == r, { reason = r }, accent = T.Maroon, height = 38.dp)
                }
            }
        }

        Spacer(Modifier.height(12.dp))
        TTextArea(note, { note = it }, "Add context for the team…", minHeight = 60.dp)

        Spacer(Modifier.height(14.dp))
        PrimaryButton(
            "Confirm move",
            { onConfirm(note, reason) },
            enabled = !isDrop || reason != null,
            height = 54.dp,
        )
    }
}
