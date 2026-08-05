package com.nxthike.android.presentation.talent.calls

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Dialpad
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PhoneDisabled
import androidx.compose.material.icons.filled.PhoneForwarded
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.TaskAlt
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.telephony.DialerHelper
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.presentation.calls.CallFlowViewModel
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.common.*
import java.time.LocalDateTime

/* ------------------------------------------------------------------ *
 *  SCR-CALL-01 · Call queue                                          *
 * ------------------------------------------------------------------ */

@Composable
fun QueueScreen(
    vm: CallFlowViewModel,
    session: SessionViewModel,
    onStartCalling: () -> Unit,
    onOpenCandidate: (String) -> Unit,
    onHistory: () -> Unit,
    onRequisitions: () -> Unit,
    onFilters: () -> Unit,
    onBlockedDial: () -> Unit,
) {
    val state by vm.queue.collectAsState()
    val prefs by session.prefs.collectAsState()
    val offline by session.offline.collectAsState()
    val now = remember { LocalDateTime.now() }
    val windowOpen = prefs.window.isOpenAt(now)

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {

            ScreenHeader(
                "Call queue",
                subtitle = state.roleLabel,
                actions = {
                    IconTile(Icons.Default.FilterList, onFilters)
                    IconTile(Icons.Default.History, onHistory)
                },
            )

            // Progress against the day
            Row(
                Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(bottom = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Meter(state.progress, Modifier.weight(1f))
                TText("${Fmt.count(state.doneToday)} / ${Fmt.count(state.targetToday)}", Type.mono, T.Ink)
            }

            if (!windowOpen) {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(bottom = 10.dp)
                        .clip(T.RField).background(T.MaroonTint)
                        .border(1.dp, T.MaroonBorder, T.RField).padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Icon(Icons.Default.Block, null, tint = T.Red, modifier = Modifier.size(19.dp))
                    Column {
                        TText("Outside calling window", Type.cardTitleSm, T.MaroonInk)
                        TText(
                            "TCCCPR permits commercial calls ${prefs.window.rangeLabel()} IST. " +
                                "Dialling ${prefs.window.countdownLabel(now)}.",
                            Type.bodySm, T.MaroonInk, Modifier.padding(top = 3.dp),
                        )
                    }
                }
            }

            when {
                state.loading -> SkeletonList(5, Modifier.padding(horizontal = T.Gutter))
                state.error != null -> ErrorState(state.error!!, onRetry = { vm.loadQueue() })
                state.empty -> StateBlock(
                    Icons.Default.PhoneDisabled, "No calls queued",
                    "Build a queue from a requisition pipeline, or widen the filter.",
                    actionLabel = "Build from a requisition", onAction = onRequisitions,
                )
                else -> LazyColumn(
                    Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = T.Gutter, vertical = 2.dp),
                    verticalArrangement = Arrangement.spacedBy(T.Gap),
                ) {
                    if (offline) {
                        item {
                            Banner(Icons.Default.CloudOff, T.Fill, Color(0xFFDEDCE8), T.InkMuted) {
                                TText("Offline · dispositions will queue and sync", Type.bodySm, T.InkBody)
                            }
                        }
                    }
                    itemsIndexed(state.rows, key = { _, r -> r.candidateId }) { index, row ->
                        QueueCard(
                            row,
                            onOpen = { onOpenCandidate(row.candidateId) },
                            onCall = {
                                if (row.dnc || !windowOpen) onBlockedDial()
                                else { vm.openAt(index); onStartCalling() }
                            },
                        )
                    }
                    item { Spacer(Modifier.height(T.FabInset + 16.dp)) }
                }
            }
        }

        if (!state.loading && state.error == null && state.rows.isNotEmpty()) {
            PrimaryButton(
                if (windowOpen) "Start calling" else "Calling window closed",
                onClick = { if (windowOpen) { vm.openAt(0); onStartCalling() } else onBlockedDial() },
                modifier = Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
                enabled = windowOpen,
                icon = if (windowOpen) Icons.Default.PlayArrow else Icons.Default.Block,
                height = 58.dp,
                shape = T.RFab,
            )
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CALL-02 · Pre-call card                                       *
 * ------------------------------------------------------------------ */

@Composable
fun PreCallScreen(
    vm: CallFlowViewModel,
    session: SessionViewModel,
    onExit: () -> Unit,
    onDial: () -> Unit,
    onBlocked: () -> Unit,
    onCompose: (String) -> Unit,
    onFinished: () -> Unit,
) {
    val state by vm.preCall.collectAsState()
    val prefs by session.prefs.collectAsState()
    val now = remember { LocalDateTime.now() }
    val windowOpen = prefs.window.isOpenAt(now)
    val row = state.row

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = T.Gutter, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Row(
                    Modifier.clickable(onClick = onExit),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Icon(Icons.Default.Close, "Exit queue", tint = T.Ink, modifier = Modifier.size(23.dp))
                    TText("Exit queue", Type.cardTitleSm, T.InkMuted)
                }
                Spacer(Modifier.weight(1f))
                if (state.queueSize > 0) {
                    TText("${state.position} of ${state.queueSize} in queue", Type.mono, T.InkMuted)
                }
            }

            if (state.loading || row == null) {
                SkeletonList(3, Modifier.padding(horizontal = T.Gutter))
            } else {
                Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter).padding(bottom = 128.dp),
                ) {
                    // Snapshot
                    TCard(shape = RoundedCornerShape(20.dp), padding = 17.dp) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(13.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(row.name, row.candidateId, 54.dp)
                            Column {
                                TText(row.name, Type.barTitle, T.Ink, maxLines = 2)
                                TText(
                                    state.candidate?.let { candidateSubtitle(it) } ?: row.roleName,
                                    Type.body, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 2,
                                )
                            }
                        }
                        @OptIn(ExperimentalLayoutApi::class)
                        FlowRow(
                            Modifier.fillMaxWidth().padding(top = 12.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            StageBadge(com.nxthike.android.core.model.Stages.find(row.status))
                            ConsentBadge(state.consent)
                            WindowBadge(windowOpen)
                            if (state.dnc) {
                                Badge("DND · do not call", T.MaroonTint, T.Maroon, icon = Icons.Default.Block)
                            }
                        }
                        Box(Modifier.fillMaxWidth().padding(vertical = 14.dp).height(1.dp).background(T.Divider))
                        FactGrid(
                            listOf(
                                "Phone" to (row.phone ?: "—"),
                                "Location" to (row.city ?: "—"),
                                "Requisition" to row.roleName.ifBlank { "—" },
                                "Experience" to (state.candidate?.experienceDuration ?: "—"),
                            ),
                            monoValues = setOf("Phone"),
                        )
                    }

                    // Talking points
                    val points = vm.talkingPoints(state)
                    if (points.isNotEmpty()) {
                        TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                            TText("Talking points", Type.cardTitleSm, T.Ink)
                            Spacer(Modifier.height(9.dp))
                            points.forEach { p ->
                                Row(Modifier.padding(bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                                    Box(Modifier.padding(top = 6.dp).size(5.dp).clip(CircleShape).background(T.Indigo))
                                    TText(p, Type.body, T.InkBody)
                                }
                            }
                        }
                    }

                    // Last contact
                    state.lastCall?.let { last ->
                        val d = Dispositions.display(last.disposition)
                        Column(
                            Modifier.fillMaxWidth().padding(top = 12.dp)
                                .clip(T.RCardLg).background(T.SurfaceMuted).padding(14.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                TText("Last contact", Type.cardTitleSm, T.Ink, Modifier.weight(1f))
                                TText(Fmt.whenLabel(Fmt.parse(last.calledAt)), Type.monoSm, T.InkFaint)
                            }
                            Badge(d.label, d.tint, d.color, Modifier.padding(top = 8.dp), icon = d.icon)
                            if (last.note.isNotBlank()) {
                                TText(last.note, Type.body, T.InkBody, Modifier.padding(top = 8.dp))
                            }
                        }
                    }

                    // Secondary actions
                    Row(Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        GhostButton(
                            "WhatsApp", { onCompose(row.candidateId) }, Modifier.weight(1f),
                            icon = Icons.Default.Chat, iconTint = T.Teal,
                        )
                        GhostButton(
                            "Skip", { vm.skip(onFinished) }, Modifier.weight(1f),
                            icon = Icons.Default.SkipNext,
                        )
                    }
                }
            }
        }

        // Primary dial action, thumb-reachable
        Column(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                .background(T.Bg).padding(horizontal = T.Gutter).padding(top = 14.dp, bottom = 16.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PrimaryButton(
                    if (!windowOpen) "Window closed" else if (state.dnc) "Blocked · DND" else "Call now",
                    onClick = { if (!windowOpen || state.dnc) onBlocked() else onDial() },
                    modifier = Modifier.weight(1f),
                    enabled = windowOpen && !state.dnc && row?.phone != null,
                    icon = if (windowOpen && !state.dnc) Icons.Default.Call else Icons.Default.Block,
                    height = 60.dp,
                    shape = RoundedCornerShape(19.dp),
                )
                IconTile(
                    Icons.Default.Dialpad,
                    onClick = { if (!windowOpen || state.dnc) onBlocked() else onDial() },
                    size = 60.dp, background = T.IndigoTint, tint = T.IndigoInk,
                    shape = RoundedCornerShape(19.dp), iconSize = 24.dp,
                )
            }
            TText(
                "Opens your phone dialer · return here to log the outcome",
                Type.labelSm, T.InkFaint,
                Modifier.fillMaxWidth().padding(top = 8.dp),
            )
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CALL-03/04 · Dialling handoff and return                      *
 * ------------------------------------------------------------------ */

/**
 * Fires `ACTION_DIAL` and waits. We declare no call-log permission, so the only
 * duration signal is how long the app stayed in the background — the moment it
 * resumes we compute that estimate and open the disposition sheet.
 */
@Composable
fun HandoffScreen(
    vm: CallFlowViewModel,
    onLogOutcome: () -> Unit,
    onBack: () -> Unit,
) {
    val state by vm.preCall.collectAsState()
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val row = state.row

    var dialled by rememberSaveable { mutableStateOf(false) }
    var backgrounded by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(row?.candidateId) {
        if (!dialled && row?.phone != null) {
            vm.onDialFired()
            DialerHelper.dial(context, row.phone)
            dialled = true
        }
    }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_STOP -> if (dialled) backgrounded = true
                Lifecycle.Event.ON_RESUME -> if (backgrounded) {
                    backgrounded = false
                    vm.onReturnFromDial()
                    onLogOutcome()
                }
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    val spin = rememberInfiniteTransition("handoff")
    val angle by spin.animateFloat(
        0f, 360f,
        infiniteRepeatable(tween(1100, easing = LinearEasing), RepeatMode.Restart),
        label = "spin",
    )

    Column(
        Modifier.fillMaxSize().background(T.Night).padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(contentAlignment = Alignment.Center) {
            Box(
                Modifier.size(92.dp).rotate(angle).clip(CircleShape)
                    .border(2.dp, T.NightAccent.copy(alpha = 0.35f), CircleShape),
            )
            Box(
                Modifier.size(74.dp).clip(CircleShape)
                    .border(2.dp, Color.White.copy(alpha = 0.2f), CircleShape),
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Default.PhoneForwarded, null, tint = Color.White, modifier = Modifier.size(34.dp)) }
        }

        TText("Handing off to your phone", Type.barTitle, Color.White, Modifier.padding(top = 26.dp))
        androidx.compose.material3.Text(
            "Dialling ${row?.name ?: "candidate"}",
            style = Type.body, color = T.NightInk,
            modifier = Modifier.padding(top = 10.dp), textAlign = TextAlign.Center,
        )
        TText(row?.phone.orEmpty(), Type.mono, Color.White, Modifier.padding(top = 4.dp))

        Row(
            Modifier.padding(top = 24.dp).clip(T.RCard)
                .background(Color.White.copy(alpha = 0.08f)).padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Icon(Icons.Default.Info, null, tint = T.NightAccent, modifier = Modifier.size(19.dp))
            TText(
                "Come back to TalentDialer after the call. The outcome sheet opens automatically, " +
                    "with the duration pre-filled as an estimate.",
                Type.bodySm, T.NightInkSoft,
            )
        }

        Spacer(Modifier.height(26.dp))
        PrimaryButton(
            "Log the outcome now",
            onClick = { vm.onReturnFromDial(); onLogOutcome() },
            modifier = Modifier.fillMaxWidth(),
            icon = Icons.Default.CheckCircle, height = 50.dp, shape = T.RCard,
            container = Color.White.copy(alpha = 0.14f), contentColor = Color.White,
        )
        Box(
            Modifier.fillMaxWidth().height(44.dp).clickable(onClick = onBack),
            contentAlignment = Alignment.Center,
        ) { TText("Back to the card", Type.cardTitleSm, T.NightInk) }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CALL-END · Queue completion summary                           *
 * ------------------------------------------------------------------ */

@Composable
fun SummaryScreen(vm: CallFlowViewModel, onHome: () -> Unit, onAnother: () -> Unit) {
    val s by vm.summary.collectAsState()
    val queue by vm.queue.collectAsState()

    Column(
        Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp).padding(top = 32.dp, bottom = 20.dp),
    ) {
        Box(
            Modifier.size(54.dp).clip(RoundedCornerShape(18.dp)).background(T.GreenTint),
            contentAlignment = Alignment.Center,
        ) { Icon(Icons.Default.TaskAlt, null, tint = T.Green, modifier = Modifier.size(31.dp)) }

        TText("Queue complete", Type.heroTitle, T.Ink, Modifier.padding(top = 18.dp))
        TText(queue.roleLabel, Type.body, T.InkMuted, Modifier.padding(top = 6.dp))

        Row(Modifier.padding(top = 20.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatTile("Calls made", "${s.calls}", Modifier.weight(1f))
            StatTile("Connected", "${s.connected}", Modifier.weight(1f), T.Green)
        }
        Row(Modifier.padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatTile("Connect rate", s.connectRate, Modifier.weight(1f), T.Indigo)
            StatTile("Callbacks", "${s.callbacks}", Modifier.weight(1f), T.Teal)
        }

        if (s.mix.isNotEmpty()) {
            TCard(Modifier.padding(top = 14.dp), shape = T.RCardLg, padding = 14.dp) {
                TText("Outcome mix", Type.cardTitleSm, T.Ink)
                Spacer(Modifier.height(11.dp))
                s.mix.forEach { (id, count) ->
                    val d = Dispositions.display(id)
                    MixRow(
                        d.label, count,
                        if (s.calls > 0) count / s.calls.toFloat() else 0f,
                        d.color, d.icon,
                        Modifier.padding(bottom = 10.dp),
                    )
                }
            }
        }

        if (s.callbacks > 0) {
            Row(
                Modifier.fillMaxWidth().padding(top = 14.dp)
                    .clip(T.RCardLg).background(T.IndigoTint).padding(14.dp),
                horizontalArrangement = Arrangement.spacedBy(11.dp),
            ) {
                Icon(Icons.Default.History, null, tint = T.Indigo, modifier = Modifier.size(20.dp))
                Column {
                    TText("${s.callbacks} callbacks scheduled", Type.cardTitleSm, T.IndigoInk)
                    TText(
                        "All inside the calling window. Reminders set 10 minutes before.",
                        Type.bodySm, T.IndigoInk, Modifier.padding(top = 3.dp),
                    )
                }
            }
        }

        Spacer(Modifier.height(18.dp))
        PrimaryButton("Back to home", onHome, height = 54.dp, shape = RoundedCornerShape(15.dp))
        Box(
            Modifier.fillMaxWidth().height(46.dp).clickable { vm.restartQueue(); onAnother() },
            contentAlignment = Alignment.Center,
        ) { TText("Start another queue", Type.cardTitleSm, T.Indigo) }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CALL-07 · Callbacks                                           *
 * ------------------------------------------------------------------ */

@Composable
fun CallbacksScreen(
    vm: CallFlowViewModel,
    onBack: () -> Unit,
    onOpenCandidate: (String) -> Unit,
    onCall: (String) -> Unit,
) {
    val callbacks by vm.callbacks.collectAsState()
    LaunchedEffect(Unit) { vm.loadCallbacks() }
    val now = remember { LocalDateTime.now() }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Callbacks", onBack)
        if (callbacks.isEmpty()) {
            StateBlock(
                Icons.Default.Schedule, "No callbacks booked",
                "When a call ends in \"Callback\", the slot you pick lands here.",
            )
        } else {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(callbacks, key = { it.id }) { log ->
                    val at = Fmt.parse(log.callbackAt)
                    val overdue = at?.isBefore(now) == true
                    TCard(
                        border = if (overdue) T.MaroonBorder else T.Border,
                        onClick = { onOpenCandidate(log.candidateId) },
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(log.candidateName, log.candidateId)
                            Column(Modifier.weight(1f)) {
                                TText(log.candidateName ?: "Candidate", Type.cardTitle, T.Ink, maxLines = 1)
                                TText(
                                    log.note.ifBlank { "No reason captured" },
                                    Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1,
                                )
                                Row(
                                    Modifier.padding(top = 6.dp),
                                    horizontalArrangement = Arrangement.spacedBy(5.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Icon(
                                        if (overdue) Icons.Default.Block else Icons.Default.Schedule,
                                        null,
                                        tint = if (overdue) T.Red else T.Teal,
                                        modifier = Modifier.size(14.dp),
                                    )
                                    TText(
                                        Fmt.whenLabel(at) + if (overdue) " · overdue" else "",
                                        Type.mono, if (overdue) T.Red else T.Teal,
                                    )
                                }
                            }
                            IconTile(
                                Icons.Default.Call, { onCall(log.candidateId) }, size = 44.dp,
                                background = T.IndigoTint, tint = T.Indigo, shape = T.RCard, iconSize = 21.dp,
                            )
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CALL-08 · Call history                                        *
 * ------------------------------------------------------------------ */

private val HISTORY_FILTERS = listOf(
    "all" to "All outcomes",
    "reached" to "Reached",
    "missed" to "Not reached",
    "data" to "Data issues",
)

@Composable
fun HistoryScreen(vm: CallFlowViewModel, onBack: () -> Unit) {
    val history by vm.history.collectAsState()
    val loading by vm.historyLoading.collectAsState()
    var filter by rememberSaveable { mutableStateOf("all") }

    LaunchedEffect(Unit) { vm.loadHistory() }

    val shown = remember(history, filter) {
        history.filter { log ->
            val cat = Dispositions.find(log.disposition)?.category
            when (filter) {
                "reached" -> cat == com.nxthike.android.core.model.DispositionCategory.Reached
                "missed" -> cat == com.nxthike.android.core.model.DispositionCategory.NotReached
                "data" -> cat == com.nxthike.android.core.model.DispositionCategory.DataIssue ||
                    cat == com.nxthike.android.core.model.DispositionCategory.Compliance
                else -> true
            }
        }
    }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Call history", onBack)
        ChipRail(Modifier.padding(horizontal = T.Gutter).padding(bottom = 10.dp)) {
            HISTORY_FILTERS.forEach { (key, label) ->
                FilterChip(label, filter == key, { filter = key })
            }
        }
        when {
            loading -> SkeletonList(5, Modifier.padding(horizontal = T.Gutter))
            shown.isEmpty() -> StateBlock(
                Icons.Default.PhoneDisabled,
                if (history.isEmpty()) "No calls logged yet" else "Nothing in this filter",
                if (history.isEmpty()) {
                    "Outcomes you log from the queue appear here, newest first."
                } else {
                    "Try another outcome group."
                },
                actionLabel = if (history.isNotEmpty()) "Show all" else null,
                onAction = { filter = "all" },
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(shown, key = { it.id }) { CallLogCard(it) }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}
