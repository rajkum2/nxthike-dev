package com.nxthike.android.presentation.talent.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddTask
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.NoteAdd
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.PersonSearch
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.TaskAlt
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.common.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

/* ------------------------------------------------------------------ *
 *  SCR-HOME-01 · Dashboard                                           *
 * ------------------------------------------------------------------ */

@Composable
fun HomeScreen(
    session: SessionViewModel,
    onQueue: () -> Unit,
    onCallbacks: () -> Unit,
    onTasks: () -> Unit,
    onNotifications: () -> Unit,
    onSearch: () -> Unit,
    onCandidate: (String) -> Unit,
    onCall: (String) -> Unit,
    onRequisition: (String) -> Unit,
    onOffers: () -> Unit,
    onSync: () -> Unit,
    onQuickAdd: () -> Unit,
) {
    val vm: HomeViewModel = hiltViewModel()
    val state by vm.state.collectAsState()
    val prefs by session.prefs.collectAsState()
    val offline by session.offline.collectAsState()
    val pending by session.pending.collectAsState()

    val now = remember { LocalDateTime.now() }
    val windowOpen = prefs.window.isOpenAt(now)

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {

            // Greeting
            Row(
                Modifier.fillMaxWidth().padding(start = T.Gutter, end = T.Gutter, top = 16.dp, bottom = 8.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Column(Modifier.weight(1f)) {
                    TText(
                        LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, d MMMM", Locale.UK)),
                        Type.body, T.InkMuted,
                    )
                    TText(
                        "${greeting(now)}, ${Fmt.firstName(session.displayName)}",
                        Type.displayTitle, T.Ink, Modifier.padding(top = 2.dp), maxLines = 1,
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconTile(Icons.Default.Search, onSearch, size = 40.dp, shape = T.RField, iconSize = 21.dp)
                    Box {
                        IconTile(Icons.Default.Notifications, onNotifications, size = 40.dp, shape = T.RField, iconSize = 21.dp)
                        if (state.callbacksOverdue > 0) {
                            Box(
                                Modifier.padding(top = 7.dp, end = 8.dp).size(7.dp)
                                    .clip(T.RPill).background(T.Red).align(Alignment.TopEnd),
                            )
                        }
                    }
                }
            }

            // Calling window — the gate every dial obeys
            Banner(
                if (windowOpen) Icons.Default.Schedule else Icons.Default.Warning,
                if (windowOpen) T.TealSurface else T.MaroonTint,
                if (windowOpen) T.TealBorder else T.MaroonBorder,
                if (windowOpen) T.Teal else T.Maroon,
                Modifier.padding(horizontal = T.Gutter, vertical = 6.dp),
            ) {
                TText(
                    if (windowOpen) {
                        "Calling window open · ${prefs.window.rangeLabel()} · ${prefs.window.countdownLabel(now)}"
                    } else {
                        "Outside calling window · TCCCPR permits ${prefs.window.rangeLabel()} · ${prefs.window.countdownLabel(now)}"
                    },
                    Type.bodySm, if (windowOpen) T.TealInk else T.MaroonInk,
                )
            }

            if (offline || pending.isNotEmpty()) {
                Banner(
                    Icons.Default.CloudOff, T.Fill, Color(0xFFDEDCE8), T.InkMuted,
                    Modifier.padding(horizontal = T.Gutter).padding(bottom = 6.dp),
                    trailing = {
                        TText("${pending.size} pending", Type.label, T.Indigo, Modifier.clickable(onClick = onSync))
                    },
                ) {
                    TText(
                        if (offline) "Offline · showing cached data" else "Outcomes waiting to sync",
                        Type.bodySm, T.InkBody,
                    )
                }
            }

            when {
                state.loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter, vertical = 8.dp))
                state.error != null -> ErrorState(state.error!!, vm::refresh)
                else -> {
                    // Two headline counters
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = T.Gutter, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Column(
                            Modifier.weight(1f).clip(T.RCardLg).background(T.Indigo)
                                .clickable(onClick = onQueue).padding(14.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                TText("Today's calls", Type.label, Color.White.copy(alpha = 0.85f), Modifier.weight(1f))
                                Icon(Icons.Default.Call, null, tint = Color.White.copy(alpha = 0.85f), modifier = Modifier.size(17.dp))
                            }
                            TText(
                                Fmt.count(state.callsToday), Type.monoHero, Color.White,
                                Modifier.padding(top = 10.dp),
                            )
                            TText(
                                "${Fmt.count(state.queueTotal)} in queue", Type.bodySm,
                                Color.White.copy(alpha = 0.8f), Modifier.padding(top = 4.dp), maxLines = 1,
                            )
                            // The meter tracks connect rate — the API has no daily
                            // target, and charting against the whole database would
                            // leave the bar permanently empty.
                            Meter(
                                state.connectRateFraction,
                                Modifier.padding(top = 10.dp), height = 5.dp,
                                color = Color.White, track = Color.White.copy(alpha = 0.28f),
                            )
                            TText(
                                "Connect rate ${state.connectRate}", Type.bodySm,
                                Color.White.copy(alpha = 0.85f), Modifier.padding(top = 7.dp),
                            )
                        }
                        TCard(Modifier.weight(1f), shape = T.RCardLg, padding = 14.dp, onClick = onCallbacks) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                TText("Callbacks due", Type.label, T.InkMuted, Modifier.weight(1f))
                                Icon(Icons.Default.History, null, tint = T.InkFaint, modifier = Modifier.size(17.dp))
                            }
                            Row(Modifier.padding(top = 10.dp), verticalAlignment = Alignment.Bottom) {
                                TText(Fmt.count(state.callbacksDue), Type.monoHero, T.Ink)
                                if (state.callbacksOverdue > 0) {
                                    TText(
                                        " ${state.callbacksOverdue} overdue", Type.label, T.Red,
                                        Modifier.padding(bottom = 4.dp), maxLines = 1,
                                    )
                                }
                            }
                            TText(
                                state.nextCallback?.let {
                                    "Next · ${Fmt.time(Fmt.parse(it.callbackAt))} ${it.candidateName.orEmpty()}"
                                } ?: "Nothing scheduled",
                                Type.bodySm, T.InkFaint, Modifier.padding(top = 12.dp), maxLines = 1,
                            )
                        }
                    }

                    // Up next
                    if (state.upNext.isNotEmpty()) {
                        SectionRow(
                            "Up next",
                            Modifier.padding(horizontal = T.Gutter).padding(top = 8.dp),
                            action = "Open queue", onAction = onQueue,
                        )
                        Column(
                            Modifier.padding(horizontal = T.Gutter, vertical = 10.dp),
                            verticalArrangement = Arrangement.spacedBy(T.Gap),
                        ) {
                            state.upNext.forEach { row ->
                                TCard(padding = 11.dp, onClick = { onCandidate(row.candidateId) }) {
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(11.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Avatar(row.name, row.candidateId, 38.dp)
                                        Column(Modifier.weight(1f)) {
                                            TText(row.name, Type.cardTitle, T.Ink, maxLines = 1)
                                            TText(
                                                row.roleName.ifBlank { row.city.orEmpty() },
                                                Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1,
                                            )
                                        }
                                        ComplianceFlag(row.dnc, consent = true, size = 16.dp)
                                        IconTile(
                                            Icons.Default.Call, { onCall(row.candidateId) }, size = 38.dp,
                                            background = if (row.dnc) T.MaroonTint else T.IndigoTint,
                                            tint = if (row.dnc) T.Maroon else T.Indigo,
                                            shape = T.RPill, iconSize = 19.dp,
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Needs you
                    if (state.alerts.isNotEmpty()) {
                        SectionRow("Needs you", Modifier.padding(horizontal = T.Gutter).padding(top = 8.dp))
                        Column(
                            Modifier.padding(horizontal = T.Gutter, vertical = 10.dp),
                            verticalArrangement = Arrangement.spacedBy(T.Gap),
                        ) {
                            state.alerts.forEach { a ->
                                val (icon, tint, bg) = alertVisual(a.kind)
                                NavRow(
                                    icon, a.title, a.detail,
                                    onClick = {
                                        when (a.kind) {
                                            Alert.Kind.Approval -> onOffers()
                                            Alert.Kind.AtRisk -> a.targetId?.let(onRequisition)
                                            else -> a.targetId?.let(onCandidate)
                                        }
                                    },
                                    iconTint = tint, iconBackground = bg,
                                )
                            }
                        }
                    }

                    // Tasks teaser
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 8.dp)
                            .clip(T.RCard).background(T.SurfaceMuted)
                            .clickable(onClick = onTasks).padding(13.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(11.dp),
                    ) {
                        Icon(Icons.Default.TaskAlt, null, tint = T.InkMuted, modifier = Modifier.size(20.dp))
                        Column(Modifier.weight(1f)) {
                            TText("${state.openTasks} tasks open", Type.cardTitleSm, T.Ink)
                            TText(
                                "${Fmt.count(state.totalCandidates)} candidates across ${state.roles.size} requisitions",
                                Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1,
                            )
                        }
                        Chevron()
                    }
                }
            }
            Spacer(Modifier.height(T.FabInset))
        }

        // Quick add
        Row(
            Modifier.align(Alignment.BottomEnd).padding(16.dp).height(56.dp)
                .clip(T.RFab).background(T.Indigo)
                .clickable(onClick = onQuickAdd).padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(9.dp),
        ) {
            Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(22.dp))
            TText("Quick add", Type.button, Color.White)
        }
    }
}

private fun greeting(now: LocalDateTime) = when (now.hour) {
    in 0..11 -> "Morning"
    in 12..16 -> "Afternoon"
    else -> "Evening"
}

private fun alertVisual(kind: Alert.Kind): Triple<ImageVector, Color, Color> = when (kind) {
    Alert.Kind.Approval -> Triple(Icons.Default.Gavel, T.Purple, T.PurpleTint)
    Alert.Kind.AtRisk -> Triple(Icons.Default.TrendingDown, T.Red, T.RedTint)
    Alert.Kind.OverdueCallback -> Triple(Icons.Default.History, T.Amber, T.AmberTint)
    Alert.Kind.NoConsent -> Triple(Icons.Default.Warning, T.Amber, T.AmberTint)
    Alert.Kind.DataIssue -> Triple(Icons.Default.Warning, T.Rust, T.RustTint)
}

/* ------------------------------------------------------------------ *
 *  SCR-HOME-02 · Notifications                                       *
 * ------------------------------------------------------------------ */

@Composable
fun NotificationsScreen(onBack: () -> Unit, onOpenCandidate: (String) -> Unit) {
    val vm: NotificationsViewModel = hiltViewModel()
    val items by vm.items.collectAsState()
    val loading by vm.loading.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Notifications", onBack) {
            TText("Refresh", Type.label, T.Indigo, Modifier.clickable { vm.refresh() })
        }
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            items.isEmpty() -> StateBlock(
                Icons.Default.Inbox, "Nothing needs you",
                "Callbacks, offers and flagged records will surface here as they happen.",
            )
            else -> {
                val today = items.filter { it.at?.toLocalDate() == LocalDate.now() }
                val earlier = items - today.toSet()
                LazyColumn(
                    Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = T.Gutter, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(T.Gap),
                ) {
                    if (today.isNotEmpty()) {
                        item { Eyebrow("TODAY", Modifier.padding(vertical = 8.dp)) }
                        items(today) { NotificationCard(it, onOpenCandidate) }
                    }
                    if (earlier.isNotEmpty()) {
                        item { Eyebrow("EARLIER", Modifier.padding(vertical = 8.dp)) }
                        items(earlier) { NotificationCard(it, onOpenCandidate) }
                    }
                    item { Spacer(Modifier.height(T.FabInset)) }
                }
            }
        }
    }
}

@Composable
private fun NotificationCard(item: NotificationItem, onOpen: (String) -> Unit) {
    val (icon, tint, bg) = alertVisual(item.kind)
    TCard(onClick = { item.targetId?.let(onOpen) }) {
        Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Box(
                Modifier.size(34.dp).clip(T.RIcon).background(bg),
                contentAlignment = Alignment.Center,
            ) { Icon(icon, null, tint = tint, modifier = Modifier.size(18.dp)) }
            Column(Modifier.weight(1f)) {
                TText(item.title, Type.cardTitleSm, T.Ink)
                TText(item.detail, Type.bodySm, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 2)
                TText(Fmt.whenLabel(item.at), Type.monoXs, T.InkFaint, Modifier.padding(top = 6.dp))
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-HOME-03 · Tasks                                               *
 * ------------------------------------------------------------------ */

@Composable
fun TasksScreen(onBack: () -> Unit, onOpenCandidate: (String) -> Unit) {
    val vm: TasksViewModel = hiltViewModel()
    val tasks by vm.tasks.collectAsState()
    val done by vm.done.collectAsState()
    val loading by vm.loading.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Tasks", onBack) {
            TText("${tasks.count { !it.done && it.id !in done }} OPEN", Type.mono, T.InkMuted)
        }
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            tasks.isEmpty() -> StateBlock(
                Icons.Default.TaskAlt, "Nothing outstanding",
                "Callbacks and in-flight screenings appear here automatically.",
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(tasks, key = { it.id }) { task ->
                    val isDone = task.done || task.id in done
                    TCard(onClick = { task.candidateId?.let(onOpenCandidate) }) {
                        Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                            Icon(
                                if (isDone) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                                if (isDone) "Completed" else "Mark complete",
                                tint = if (isDone) T.Green else T.InkGhost,
                                modifier = Modifier.size(22.dp).clickable { vm.toggle(task.id) },
                            )
                            Column(Modifier.weight(1f)) {
                                TText(
                                    task.title,
                                    Type.cardTitleSm.copy(
                                        textDecoration = if (isDone) TextDecoration.LineThrough else null,
                                    ),
                                    if (isDone) T.InkFaint else T.Ink,
                                )
                                Row(
                                    Modifier.padding(top = 5.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    TText(
                                        if (isDone) "Completed" else task.due, Type.labelSm,
                                        when {
                                            isDone -> T.InkFaint
                                            task.urgent -> T.Red
                                            else -> T.InkMuted
                                        },
                                    )
                                    TText(task.link, Type.labelSm, T.InkFaint, maxLines = 1)
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
 *  SCR-GLOBAL-01 · Global search                                     *
 * ------------------------------------------------------------------ */

@Composable
fun SearchScreen(
    onBack: () -> Unit,
    onCandidate: (String) -> Unit,
    onRequisition: (String) -> Unit,
    onClient: (String) -> Unit,
) {
    val vm: SearchViewModel = hiltViewModel()
    val query by vm.query.collectAsState()
    val groups by vm.groups.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 14.dp, bottom = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Icon(
                Icons.Default.Search, null, tint = Color.Transparent,
                modifier = Modifier.size(0.dp),
            )
            SearchBar(query, vm::setQuery, "Candidates, requisitions, clients", Modifier.weight(1f))
        }
        if (groups.isEmpty()) {
            StateBlock(
                Icons.Default.PersonSearch,
                if (query.isBlank()) "Search everything" else "No matches",
                if (query.isBlank()) {
                    "One field across candidates, requisitions and clients."
                } else {
                    "Nothing matched \"$query\". Try a phone number, skill or company."
                },
            )
        } else {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                groups.forEach { group ->
                    item(key = group.name) { Eyebrow(group.name, Modifier.padding(top = 12.dp, bottom = 8.dp)) }
                    items(group.items, key = { "${group.name}-${it.id}" }) { hit ->
                        NavRow(
                            when (hit.kind) {
                                "candidate" -> Icons.Default.PersonSearch
                                "req" -> Icons.Default.Work
                                else -> Icons.Default.Apartment
                            },
                            hit.title, hit.detail,
                            onClick = {
                                when (hit.kind) {
                                    "candidate" -> onCandidate(hit.id)
                                    "req" -> onRequisition(hit.id)
                                    else -> onClient(hit.id)
                                }
                            },
                            iconTint = T.InkMuted, iconBackground = T.Fill,
                        )
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  Quick add sheet                                                   *
 * ------------------------------------------------------------------ */

@Composable
fun QuickAddSheetContent(
    onAddCandidate: () -> Unit,
    onNote: () -> Unit,
    onTask: () -> Unit,
    onCallback: () -> Unit,
) = Column(Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 20.dp)) {
    TText("Quick add", Type.sheetTitle, T.Ink)
    Spacer(Modifier.height(12.dp))
    listOf(
        QuickAdd(Icons.Default.PersonAdd, "Candidate", "Name and number, dedupe checked", T.Indigo, T.IndigoTint, onAddCandidate),
        QuickAdd(Icons.Default.NoteAdd, "Note", "Against any record", T.Teal, T.TealTint, onNote),
        QuickAdd(Icons.Default.AddTask, "Task", "Track a follow-up", T.Purple, T.PurpleTint, onTask),
        QuickAdd(Icons.Default.History, "Callback", "Inside the calling window", T.Blue, T.BlueTint, onCallback),
    ).forEach { q ->
        NavRow(q.icon, q.label, q.detail, q.onClick, Modifier.padding(bottom = T.Gap), q.tint, q.bg)
    }
}

private data class QuickAdd(
    val icon: ImageVector,
    val label: String,
    val detail: String,
    val tint: Color,
    val bg: Color,
    val onClick: () -> Unit,
)
