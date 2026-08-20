package com.nxthike.android.presentation.talent.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.HowToReg
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Pending
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Rule
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.CandidateTags
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.local.WorkspaceMode
import com.nxthike.android.data.remote.dto.CallLogDto
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.data.remote.dto.AuditDto
import com.nxthike.android.data.remote.dto.ErasureDto
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.domain.repository.WorkspaceRepository
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.DayOfWeek
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/* ------------------------------------------------------------------ *
 *  More hub                                                          *
 * ------------------------------------------------------------------ */

@Composable
fun MoreScreen(
    session: SessionViewModel,
    onClients: () -> Unit,
    onInterviews: () -> Unit,
    onOffers: () -> Unit,
    onFeed: () -> Unit,
    onPerformance: () -> Unit,
    onPostings: () -> Unit,
    onSettings: () -> Unit,
    onCallWindow: () -> Unit,
    onRoles: () -> Unit,
    onCompliance: () -> Unit,
    onAudit: () -> Unit,
    onTaxonomy: () -> Unit,
    onSync: () -> Unit,
    onStates: () -> Unit,
    onProfile: () -> Unit,
    onEvents: () -> Unit,
    onCourses: () -> Unit,
) {
    val prefs by session.prefs.collectAsState()
    val pending by session.pending.collectAsState()
    val user by session.user.collectAsState()

    Column(
        Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState()),
    ) {
        ScreenHeader("More", subtitle = prefs.mode.label)

        Column(
            Modifier.padding(horizontal = T.Gutter),
            verticalArrangement = Arrangement.spacedBy(T.Gap),
        ) {
            NavRow(Icons.Default.Apartment, "${prefs.mode.clientWord}s", "Accounts and job orders", onClients)
            NavRow(Icons.Default.Event, "Interviews", "Schedule, kits and scorecards", onInterviews, iconTint = T.Purple, iconBackground = T.PurpleTint)
            NavRow(Icons.Default.Gavel, "Offers & approvals", "Decisions waiting on you", onOffers, iconTint = T.Teal, iconBackground = T.TealTint)
            NavRow(Icons.Default.Forum, "Activity", "What the team logged", onFeed, iconTint = T.Blue, iconBackground = T.BlueTint)
            NavRow(Icons.Default.BarChart, "Reporting", "Personal and team dashboards", onPerformance, iconTint = T.Amber, iconBackground = T.AmberTint)
            NavRow(Icons.Default.Work, "Job postings", "The public portal board", onPostings, iconTint = T.InkMuted, iconBackground = T.Fill)
            NavRow(Icons.Default.Event, "Events", "Portal events feed", onEvents, iconTint = T.Rust, iconBackground = T.RustTint)
            NavRow(Icons.Default.MenuBook, "Courses", "Portal course catalogue", onCourses, iconTint = T.Mint, iconBackground = T.MintTint)
        }

        SettingsGroup("WORKSPACE") {
            SettingsRow(Icons.Default.Person, user?.email ?: "Profile", "Signed in · ${user?.role ?: "user"}", onProfile)
            SettingsRow(Icons.Default.Schedule, "Calling window", "${prefs.window.rangeLabel()} · ${prefs.window.days.size} days", onCallWindow)
            SettingsRow(Icons.Default.AdminPanelSettings, "Roles & permissions", "Who can see what", onRoles)
            SettingsRow(Icons.Default.Description, "Settings", "Mode, notifications and appearance", onSettings, last = true)
        }

        SettingsGroup("COMPLIANCE") {
            SettingsRow(Icons.Default.HowToReg, "Compliance centre", "Consent, retention and erasure", onCompliance)
            SettingsRow(Icons.Default.Rule, "Audit log", "Who did what, when", onAudit)
            SettingsRow(Icons.Default.Block, "Disposition taxonomy", "${Dispositions.ALL.size} outcome codes", onTaxonomy, last = true)
        }

        SettingsGroup("SYSTEM") {
            SettingsRow(
                Icons.Default.Sync, "Offline & sync",
                if (pending.isEmpty()) "Everything synced" else "${pending.size} waiting in the outbox",
                onSync,
            )
            SettingsRow(Icons.Default.Inbox, "State gallery", "Loading, empty, error and blocked states", onStates, last = true)
        }

        Spacer(Modifier.height(T.FabInset))
    }
}

@Composable
private fun SettingsGroup(title: String, content: @Composable ColumnScope.() -> Unit) {
    Eyebrow(title, Modifier.padding(horizontal = T.Gutter).padding(top = 20.dp, bottom = 8.dp))
    Column(
        Modifier.padding(horizontal = T.Gutter).fillMaxWidth()
            .clip(T.RCard).background(T.Surface).border(1.dp, T.Border, T.RCard),
        content = content,
    )
}

@Composable
private fun SettingsRow(
    icon: ImageVector,
    label: String,
    detail: String,
    onClick: () -> Unit,
    last: Boolean = false,
) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 13.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(11.dp),
    ) {
        Icon(icon, null, tint = T.InkMuted, modifier = Modifier.size(20.dp))
        Column(Modifier.weight(1f)) {
            TText(label, Type.cardTitleSm, T.Ink, maxLines = 1)
            TText(detail, Type.bodySm, T.InkFaint, Modifier.padding(top = 2.dp), maxLines = 1)
        }
        Chevron(Modifier.size(19.dp))
    }
    if (!last) Box(Modifier.fillMaxWidth().height(1.dp).background(T.DividerFaint))
}

/* ------------------------------------------------------------------ *
 *  SCR-SET-01/02 · Settings                                          *
 * ------------------------------------------------------------------ */

@Composable
fun SettingsScreen(session: SessionViewModel, onBack: () -> Unit, onLoggedOut: () -> Unit) {
    val prefs by session.prefs.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())) {
        TopBar("Settings", onBack)

        Eyebrow("WORKSPACE MODE", Modifier.padding(horizontal = T.Gutter).padding(bottom = 8.dp))
        Row(
            Modifier.padding(horizontal = T.Gutter).fillMaxWidth()
                .clip(T.RCard).background(T.Fill).padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            WorkspaceMode.entries.forEach { m ->
                val on = prefs.mode == m
                Box(
                    Modifier.weight(1f).height(38.dp)
                        .clip(T.RIcon)
                        .background(if (on) T.Indigo else Color.Transparent)
                        .clickable { session.setMode(m) },
                    contentAlignment = Alignment.Center,
                ) {
                    TText(
                        if (m == WorkspaceMode.AGENCY) "Agency" else "In-house",
                        Type.label, if (on) Color.White else T.InkMuted,
                    )
                }
            }
        }
        TText(
            "Mode swaps the vocabulary: ${prefs.mode.clientWord} / ${prefs.mode.reqWord}. " +
                if (prefs.mode.showsRates) "Rate fields are visible." else "Rate fields are hidden.",
            Type.bodySm, T.InkMuted, Modifier.padding(horizontal = T.Gutter).padding(top = 8.dp),
        )

        Eyebrow("NOTIFICATIONS", Modifier.padding(horizontal = T.Gutter).padding(top = 20.dp, bottom = 8.dp))
        Column(
            Modifier.padding(horizontal = T.Gutter).fillMaxWidth()
                .clip(T.RCard).background(T.Surface).border(1.dp, T.Border, T.RCard)
                .padding(horizontal = 13.dp),
        ) {
            ToggleRow("Callback reminders", prefs.notifyCallbacks, onCheckedChange = { session.setNotify("callbacks", it) })
            ToggleRow("Mentions", prefs.notifyMentions, onCheckedChange = { session.setNotify("mentions", it) })
            ToggleRow("Approvals", prefs.notifyApprovals, onCheckedChange = { session.setNotify("approvals", it) })
            ToggleRow("Interviews", prefs.notifyInterviews, onCheckedChange = { session.setNotify("interviews", it) })
            ToggleRow("Calling-window alerts", prefs.notifyWindow, onCheckedChange = { session.setNotify("window", it) }, divider = false)
        }

        Eyebrow("PRIVACY", Modifier.padding(horizontal = T.Gutter).padding(top = 20.dp, bottom = 8.dp))
        Column(
            Modifier.padding(horizontal = T.Gutter).fillMaxWidth()
                .clip(T.RCard).background(T.Surface).border(1.dp, T.Border, T.RCard)
                .padding(horizontal = 13.dp),
        ) {
            ToggleRow("Mask PII by default", prefs.maskPii, onCheckedChange = { session.setMaskPii(it) }, divider = false)
        }
        TText(
            "Masking hides phone numbers and emails on candidate profiles — use it when screen-sharing.",
            Type.bodySm, T.InkMuted, Modifier.padding(horizontal = T.Gutter).padding(top = 8.dp),
        )

        PrimaryButton(
            "Sign out",
            { session.logout(onLoggedOut) },
            Modifier.padding(horizontal = T.Gutter).padding(top = 24.dp),
            icon = Icons.Default.Logout, height = 50.dp, shape = T.RCard,
            container = T.MaroonTint, contentColor = T.Maroon,
        )
        Spacer(Modifier.height(T.FabInset))
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-SET-04 · Calling window                                       *
 * ------------------------------------------------------------------ */

@Composable
fun CallWindowScreen(session: SessionViewModel, onBack: () -> Unit) {
    val prefs by session.prefs.collectAsState()
    val w = prefs.window
    val now = remember { LocalDateTime.now() }

    Column(Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())) {
        TopBar("Calling window", onBack)

        Column(Modifier.padding(horizontal = T.Gutter)) {
            Banner(Icons.Default.Gavel, T.TealTint, T.TealBorder, T.Teal) {
                TText(
                    "TRAI TCCCPR 2018 permits commercial calls between 09:00 and 21:00 only. " +
                        "Outside the window the dial action is disabled, not just warned about.",
                    Type.bodySm, T.TealInk,
                )
            }

            Row(Modifier.padding(top = 14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                HourStepper(
                    "Window opens", w.openHour, Modifier.weight(1f),
                    onChange = { session.setWindow(it, w.closeHour) },
                    range = 0..(w.closeHour - 1),
                )
                HourStepper(
                    "Window closes", w.closeHour, Modifier.weight(1f),
                    onChange = { session.setWindow(w.openHour, it) },
                    range = (w.openHour + 1)..23,
                )
            }

            TCard(Modifier.padding(top = 12.dp), padding = 13.dp) {
                TText("Calling days", Type.label, T.Ink)
                Row(Modifier.padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                    DayOfWeek.entries.forEach { d ->
                        val on = d in w.days
                        Box(
                            Modifier.weight(1f).height(38.dp)
                                .clip(T.RIcon)
                                .background(if (on) T.Indigo else T.Fill)
                                .clickable { session.toggleDay(d) },
                            contentAlignment = Alignment.Center,
                        ) {
                            TText(
                                d.getDisplayName(java.time.format.TextStyle.NARROW, java.util.Locale.UK),
                                Type.labelSm, if (on) Color.White else T.InkMuted,
                            )
                        }
                    }
                }
            }

            TCard(Modifier.padding(top = 12.dp), padding = 13.dp) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        TText("Time zone", Type.cardTitleSm, T.Ink)
                        TText(w.zoneLabel, Type.bodySm, T.InkFaint, Modifier.padding(top = 2.dp))
                    }
                }
            }

            Banner(
                if (w.isOpenAt(now)) Icons.Default.Schedule else Icons.Default.Block,
                if (w.isOpenAt(now)) T.TealSurface else T.MaroonTint,
                if (w.isOpenAt(now)) T.TealBorder else T.MaroonBorder,
                if (w.isOpenAt(now)) T.Teal else T.Maroon,
                Modifier.padding(top = 12.dp),
            ) {
                TText(
                    "Right now: ${if (w.isOpenAt(now)) "open" else "closed"} · ${w.countdownLabel(now)}",
                    Type.bodySm, if (w.isOpenAt(now)) T.TealInk else T.MaroonInk,
                )
            }

            Banner(Icons.Default.Public, T.AmberSurface, T.AmberBorder, T.Amber, Modifier.padding(top = 12.dp)) {
                TText(
                    "Windows are per-workspace, so non-India teams can set their own local rules.",
                    Type.bodySm, T.AmberDeep,
                )
            }
        }
        Spacer(Modifier.height(T.FabInset))
    }
}

@Composable
private fun HourStepper(
    label: String,
    hour: Int,
    modifier: Modifier = Modifier,
    range: IntRange,
    onChange: (Int) -> Unit,
) = TCard(modifier, padding = 13.dp) {
    TText(label, Type.labelSm, T.InkFaint)
    Row(Modifier.padding(top = 5.dp), verticalAlignment = Alignment.CenterVertically) {
        TText(
            "%02d:00".format(hour),
            Type.mono.copy(fontSize = androidx.compose.ui.unit.TextUnit(22f, androidx.compose.ui.unit.TextUnitType.Sp)),
            T.Ink, Modifier.weight(1f),
        )
        Column {
            StepButton("+") { if (hour + 1 in range) onChange(hour + 1) }
            Spacer(Modifier.height(4.dp))
            StepButton("−") { if (hour - 1 in range) onChange(hour - 1) }
        }
    }
}

@Composable
private fun StepButton(label: String, onClick: () -> Unit) = Box(
    Modifier.size(28.dp, 20.dp).clip(T.RBadge).background(T.Fill).clickable(onClick = onClick),
    contentAlignment = Alignment.Center,
) { TText(label, Type.label, T.InkBody) }

/* ------------------------------------------------------------------ *
 *  SCR-SET-06 · Roles & permissions                                  *
 * ------------------------------------------------------------------ */

/**
 * The capability keys the server's `caps` map uses, with the words this screen
 * shows for them. Order follows the sequence a recruiter actually meets them in.
 */
private val CAPABILITY_ROWS = listOf(
    "db" to "See candidate database",
    "create" to "Add / edit candidates",
    "dial" to "Use the dialer queue",
    "log" to "Log call outcomes",
    "stage" to "Move pipeline stages",
    "reqs" to "Requisitions",
    "score" to "Submit scorecards",
    "approve" to "Approve offers",
    "rates" to "See client commercials",
    "analytics" to "Reporting",
    "eeo" to "See EEO data",
    "erasure" to "Action erasure requests",
    "admin" to "Workspace admin",
)

/** How a capability value reads as a cell: label, background, foreground. */
private fun capabilityCell(value: Any?): Triple<String, androidx.compose.ui.graphics.Color, androidx.compose.ui.graphics.Color> =
    when (value) {
        null, false, "none", "" -> Triple("—", T.NeutralTint, T.InkFaint)
        true -> Triple("Yes", T.GreenTint, T.Green)
        "all" -> Triple("All", T.IndigoTint, T.IndigoInk)
        "partial", "config", "ifPanel", "gated" -> Triple(
            value.toString().replaceFirstChar { it.uppercase() }, T.AmberTint, T.AmberInk,
        )
        else -> Triple(
            value.toString().replaceFirstChar { it.uppercase() }.take(9), T.SlateTint, T.Slate,
        )
    }

/**
 * The workspace's real permission matrix.
 *
 * Read-only, and deliberately so. This screen used to be an editable grid over a
 * local map with a banner admitting the API "currently enforces two roles" —
 * both halves are now out of date: the server enforces eight personas with
 * per-capability gates, and the matrix it returns is the one doing the enforcing.
 * Editing it is a web-admin job, because most capabilities are enums rather than
 * on/off and a tap-to-cycle control would happily write an invalid level.
 */
@Composable
fun RolesMatrixScreen(session: SessionViewModel, onBack: () -> Unit) {
    val current by session.session.collectAsState()
    val personas = current?.personas.orEmpty()
    val matrix = current?.settings?.roleMatrix.orEmpty()

    // Columns come from the persona catalogue, so they stay in step with the
    // server rather than being a hardcoded four.
    val columns = personas.mapNotNull { p ->
        val id = p["id"] as? String ?: return@mapNotNull null
        val short = (p["short"] as? String) ?: (p["name"] as? String) ?: id
        id to short.uppercase()
    }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar(
            "Roles & permissions", onBack,
            subtitle = if (columns.isEmpty()) "Loading…" else "${columns.size} personas · enforced by the API",
        )
        if (columns.isEmpty()) {
            StateBlock(
                Icons.Default.Lock, "Matrix unavailable",
                "Sign in to the workspace to see how capabilities are assigned.",
            )
            return@Column
        }
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 14.dp),
        ) {
            Row(Modifier.horizontalScroll(rememberScrollState())) {
                Column(
                    Modifier.clip(T.RCard).background(T.Surface).border(1.dp, T.Border, T.RCard),
                ) {
                    Row(
                        Modifier.background(T.SurfaceMuted).padding(horizontal = 10.dp, vertical = 9.dp),
                    ) {
                        TText("CAPABILITY", Type.monoXs, T.InkFaint, Modifier.width(190.dp))
                        columns.forEach { (_, label) ->
                            TText(label, Type.monoXs, T.InkFaint, Modifier.width(62.dp), maxLines = 1)
                        }
                    }
                    CAPABILITY_ROWS.forEachIndexed { index, (key, label) ->
                        Row(
                            Modifier.padding(horizontal = 10.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            TText(label, Type.bodySm, T.Ink, Modifier.width(190.dp), maxLines = 2)
                            columns.forEach { (personaId, _) ->
                                val (cellLabel, bg, fg) = capabilityCell(matrix[personaId]?.get(key))
                                Box(
                                    Modifier.size(58.dp, 30.dp).clip(T.RIcon).background(bg),
                                    contentAlignment = Alignment.Center,
                                ) { TText(cellLabel, Type.labelSm, fg, maxLines = 1) }
                            }
                        }
                        if (index != CAPABILITY_ROWS.lastIndex) {
                            Box(Modifier.fillMaxWidth().height(1.dp).background(T.DividerFaint))
                        }
                    }
                }
            }
            Banner(
                Icons.Default.Lock, T.AmberSurface, T.AmberBorder, T.Amber,
                Modifier.padding(vertical = 14.dp),
            ) {
                TText(
                    "This is the live matrix the API enforces — every route checks it server-side. " +
                        "Your persona is ${session.personaName.ifBlank { "not assigned" }}. " +
                        "Changing it is an admin action on the web console.",
                    Type.bodySm, T.AmberDeep,
                )
            }
            Spacer(Modifier.height(T.FabInset))
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-SET-07 · Compliance centre                                    *
 * ------------------------------------------------------------------ */

data class ComplianceState(
    val loading: Boolean = true,
    val dncCount: Int = 0,
    val noConsent: Int = 0,
    val total: Int = 0,
    val retentionMonths: Int = 24,
    val erasureQueue: List<ErasureDto> = emptyList(),
    val error: String? = null,
)

/**
 * The workspace's compliance position, from `/api/workspace/compliance`.
 *
 * Counted by the database across every record. This screen used to count tags
 * over the first two hundred candidates, which was wrong twice: the tags were
 * only ever written by this app, and two hundred is not the workspace.
 */
@HiltViewModel
class ComplianceViewModel @Inject constructor(
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ComplianceState())
    val state: StateFlow<ComplianceState> = _state.asStateFlow()

    /** The real audit trail — every actor and action, not just logged calls. */
    private val _audit = MutableStateFlow<List<AuditDto>>(emptyList())
    val audit: StateFlow<List<AuditDto>> = _audit.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _state.value = _state.value.copy(loading = true, error = null)
        val erasures = workspace.erasures().getOrNull().orEmpty()
        workspace.compliance()
            .onSuccess { c ->
                _state.value = ComplianceState(
                    loading = false,
                    dncCount = c.dncCount,
                    noConsent = c.missingConsent,
                    total = c.totalCandidates,
                    retentionMonths = c.retentionMonths,
                    // The summary counts open requests; the list is what to act on.
                    erasureQueue = erasures.filter {
                        it.status.lowercase() in listOf("open", "verifying", "ready")
                    },
                )
            }
            .onError { e ->
                _state.value = _state.value.copy(loading = false, error = e.message)
            }
        workspace.audit(limit = 100).onSuccess { _audit.value = it }
    }

    /** Completes or rejects an erasure request. Admin-gated server-side. */
    fun decideErasure(id: String, status: String) = viewModelScope.launch {
        workspace.decideErasure(id, status)
            .onSuccess { load() }
            .onError { e -> _state.value = _state.value.copy(error = e.message) }
    }
}

@Composable
fun ComplianceScreen(onBack: () -> Unit, onAudit: () -> Unit, onOpenCandidate: (String) -> Unit) {
    val vm: ComplianceViewModel = hiltViewModel()
    val s by vm.state.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())) {
        TopBar("Compliance centre", onBack)

        Column(Modifier.padding(horizontal = T.Gutter), verticalArrangement = Arrangement.spacedBy(T.Gap)) {
            NavRow(
                Icons.Default.HowToReg, "Consent before first contact",
                "${s.total - s.noConsent} of ${s.total} records have consent on file",
                {}, iconTint = T.Green, iconBackground = T.GreenTint,
            )
            NavRow(
                Icons.Default.Block, "DND register",
                "${s.dncCount} numbers locked from every queue",
                {}, iconTint = T.Maroon, iconBackground = T.MaroonTint,
            )
            NavRow(
                Icons.Default.Schedule, "Retention period",
                "24 months after last activity",
                {}, iconTint = T.Blue, iconBackground = T.BlueTint,
            )
            NavRow(
                Icons.Default.DeleteSweep, "Erasure requests",
                if (s.erasureQueue.isEmpty()) "None open" else "${s.erasureQueue.size} open",
                {}, iconTint = T.Amber, iconBackground = T.AmberTint,
            )
            NavRow(
                Icons.Default.Rule, "Audit log", "Immutable record of every logged call",
                onAudit, iconTint = T.InkMuted, iconBackground = T.Fill,
            )
        }

        Eyebrow("ERASURE QUEUE · DPDP", Modifier.padding(horizontal = T.Gutter).padding(top = 20.dp, bottom = 8.dp))
        if (s.erasureQueue.isEmpty()) {
            TText(
                "No erasure requests are open.",
                Type.body, T.InkMuted, Modifier.padding(horizontal = T.Gutter),
            )
        } else {
            Column(
                Modifier.padding(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                s.erasureQueue.forEach { req ->
                    TCard(onClick = { onOpenCandidate(req.candidateId) }) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(req.candidateName, req.candidateId, 32.dp)
                            Column(Modifier.weight(1f)) {
                                TText(
                                    req.candidateName ?: "Unnamed",
                                    Type.cardTitleSm, T.Ink, maxLines = 1,
                                )
                                TText(
                                    listOfNotNull(
                                        req.raisedByName?.let { "Raised by $it" },
                                        Fmt.whenLabel(Fmt.parse(req.createdAt)).takeIf { it.isNotBlank() },
                                    ).joinToString(" · "),
                                    Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp),
                                )
                                req.reason.takeIf { it.isNotBlank() }?.let {
                                    TText(
                                        it, Type.labelSm, T.InkFaint,
                                        Modifier.padding(top = 4.dp), maxLines = 2,
                                    )
                                }
                            }
                            Badge(
                                req.status.replace('_', ' ').uppercase(),
                                T.AmberTint, T.AmberInk,
                            )
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(T.FabInset))
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-SET-08 · Audit log                                            *
 * ------------------------------------------------------------------ */

@Composable
fun AuditScreen(onBack: () -> Unit) {
    val vm: ComplianceViewModel = hiltViewModel()
    val audit by vm.audit.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Audit log", onBack, subtitle = "Immutable · every actor and action")
        if (audit.isEmpty()) {
            StateBlock(Icons.Default.Rule, "Nothing to audit yet", "Workspace activity builds this trail.")
        } else {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                items(audit, key = { it.id }) { row ->
                    val who = row.actorName?.takeIf { it.isNotBlank() }
                        ?: row.actorEmail?.substringBefore('@')
                        ?: "system"
                    TCard(shape = T.RField, padding = 11.dp) {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Avatar(who, row.actorEmail ?: row.id, 28.dp)
                            Column(Modifier.weight(1f)) {
                                TText("$who ${row.action}", Type.bodySm, T.Ink)
                                row.objectLabel?.takeIf { it.isNotBlank() }?.let {
                                    TText(
                                        it, Type.monoSm, T.Indigo,
                                        Modifier.padding(top = 3.dp), maxLines = 1,
                                    )
                                }
                                TText(
                                    listOfNotNull(
                                        Fmt.audit(Fmt.parse(row.createdAt)).takeIf { it.isNotBlank() },
                                        row.objectKind?.uppercase(),
                                    ).joinToString(" · "),
                                    Type.monoXs, T.InkFaint, Modifier.padding(top = 4.dp),
                                )
                            }
                            Icon(
                                Icons.Default.Rule, null,
                                tint = T.InkGhost, modifier = Modifier.size(17.dp),
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
 *  SCR-SET-09 · Disposition taxonomy                                 *
 * ------------------------------------------------------------------ */

@Composable
fun TaxonomyScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar(
            "Disposition taxonomy", onBack,
            subtitle = "${Dispositions.ALL.size} codes · enforced by the API",
        )
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = T.Gutter),
            verticalArrangement = Arrangement.spacedBy(7.dp),
        ) {
            items(Dispositions.ALL, key = { it.id }) { d ->
                TCard(shape = T.RField, padding = 11.dp) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            Modifier.size(30.dp).clip(T.RIcon).background(d.tint),
                            contentAlignment = Alignment.Center,
                        ) { Icon(d.icon, null, tint = d.color, modifier = Modifier.size(17.dp)) }
                        Column(Modifier.weight(1f)) {
                            TText(d.label, Type.cardTitleSm, T.Ink)
                            TText(d.category.label.uppercase(), Type.monoXs, T.InkFaint, Modifier.padding(top = 2.dp))
                        }
                        TText(d.id, Type.monoXs, T.InkGhost, maxLines = 1)
                    }
                    Box(
                        Modifier.fillMaxWidth().padding(top = 8.dp)
                            .clip(T.RIcon).background(Color(0xFFF7F6FB)).padding(9.dp),
                    ) { TText("→ ${d.nextAction}", Type.bodySm, T.InkMuted) }
                }
            }
            item {
                Banner(Icons.Default.Lock, T.AmberSurface, T.AmberBorder, T.Amber, Modifier.padding(vertical = 12.dp)) {
                    TText(
                        "These codes are the API's enum. Adding one means a backend migration, " +
                            "which is why the list is read-only here.",
                        Type.bodySm, T.AmberDeep,
                    )
                }
            }
            item { Spacer(Modifier.height(T.FabInset)) }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-GLOBAL-03 · Offline & sync                                    *
 * ------------------------------------------------------------------ */

@Composable
fun SyncScreen(session: SessionViewModel, onBack: () -> Unit) {
    val pending by session.pending.collectAsState()
    val syncing by session.syncing.collectAsState()
    val offline by session.offline.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Offline & sync", onBack)

        Row(
            Modifier.padding(horizontal = T.Gutter).fillMaxWidth()
                .clip(T.RCard)
                .background(if (offline) T.Fill else T.GreenTint)
                .border(1.dp, if (offline) Color(0xFFDEDCE8) else T.GreenTint, T.RCard)
                .padding(13.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(11.dp),
        ) {
            Icon(
                if (offline) Icons.Default.CloudOff else Icons.Default.Sync,
                null, tint = if (offline) T.InkMuted else T.Green, modifier = Modifier.size(20.dp),
            )
            Column(Modifier.weight(1f)) {
                TText(
                    if (offline) "Offline" else "Connected",
                    Type.cardTitleSm, if (offline) T.Ink else T.Green,
                )
                TText(
                    if (pending.isEmpty()) "Nothing waiting" else "${pending.size} in the outbox",
                    Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp),
                )
            }
            Box(
                Modifier.height(34.dp).clip(T.RIcon).background(T.Indigo)
                    .clickable(enabled = !syncing) { session.drainOutbox() }
                    .padding(horizontal = 13.dp),
                contentAlignment = Alignment.Center,
            ) { TText(if (syncing) "Syncing…" else "Retry", Type.label, Color.White) }
        }

        Eyebrow("OUTBOX", Modifier.padding(horizontal = T.Gutter).padding(top = 20.dp, bottom = 8.dp))
        if (pending.isEmpty()) {
            StateBlock(
                Icons.Default.Sync, "Everything is synced",
                "Outcomes captured without signal queue here and replay automatically.",
                iconBackground = T.GreenTint, iconTint = T.Green,
            )
        } else {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                items(pending, key = { it.id }) { entry ->
                    TCard(shape = T.RField, padding = 11.dp) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(
                                if (entry.lastError != null) Icons.Default.Error else Icons.Default.Pending,
                                null,
                                tint = if (entry.lastError != null) T.Red else T.Amber,
                                modifier = Modifier.size(19.dp),
                            )
                            Column(Modifier.weight(1f)) {
                                TText(entry.title, Type.cardTitleSm, T.Ink, maxLines = 1)
                                TText(entry.detail, Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1)
                                entry.lastError?.let {
                                    TText(it, Type.labelSm, T.Red, Modifier.padding(top = 4.dp), maxLines = 2)
                                }
                            }
                            Badge(
                                if (entry.lastError != null) "Failed" else "Queued",
                                if (entry.lastError != null) T.RedTint else T.AmberTint,
                                if (entry.lastError != null) T.Red else T.AmberInk,
                            )
                        }
                    }
                }
                item {
                    GhostButton(
                        "Discard the outbox", { session.discardOutbox() },
                        Modifier.fillMaxWidth().padding(top = 12.dp),
                        icon = Icons.Default.DeleteSweep, iconTint = T.Maroon,
                        borderColor = T.MaroonBorder, contentColor = T.Maroon, height = 44.dp,
                    )
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-GLOBAL-04 · State gallery                                     *
 * ------------------------------------------------------------------ */

private val GALLERY = listOf(
    Triple(Icons.Default.Pending, "Loading · list skeleton", "Shimmering rows wherever a list is paging."),
    Triple(Icons.Default.Inbox, "Empty · no records", "Icon, one-line cause, one primary action. Never a dead end."),
    Triple(Icons.Default.Error, "Error · request failed", "What failed, then Retry. Detail stays on the second line."),
    Triple(Icons.Default.CloudOff, "Offline · cached read", "Grey banner plus a pending-sync count that opens the outbox."),
    Triple(Icons.Default.Lock, "Permission denied", "States the exact fallback, plus a settings deep link."),
    Triple(Icons.Default.Block, "Blocked · calling window", "Red banner, disabled dial affordance, time until it reopens."),
)

@Composable
fun StateGalleryScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())) {
        TopBar("State gallery", onBack, subtitle = "Reusable across every list and detail screen")
        Column(
            Modifier.padding(horizontal = T.Gutter),
            verticalArrangement = Arrangement.spacedBy(T.Gap),
        ) {
            GALLERY.forEach { (icon, title, body) ->
                TCard(padding = 13.dp) {
                    Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                        Box(
                            Modifier.size(36.dp).clip(T.RChip).background(T.Fill),
                            contentAlignment = Alignment.Center,
                        ) { Icon(icon, null, tint = T.InkMuted, modifier = Modifier.size(19.dp)) }
                        Column {
                            TText(title, Type.cardTitleSm, T.Ink)
                            TText(body, Type.bodySm, T.InkMuted, Modifier.padding(top = 4.dp))
                        }
                    }
                }
            }
            Banner(Icons.Default.Rule, T.AmberSurface, T.AmberBorder, T.Amber) {
                TText(
                    "Every state pairs an icon with a label — colour is never the only signal. " +
                        "Tap targets stay at 48dp, 56dp inside the calling loop.",
                    Type.bodySm, T.AmberDeep,
                )
            }
            TText("Live skeleton", Type.label, T.InkMuted, Modifier.padding(top = 8.dp))
            SkeletonList(2)
        }
        Spacer(Modifier.height(T.FabInset))
    }
}

/* ------------------------------------------------------------------ *
 *  Profile                                                           *
 * ------------------------------------------------------------------ */

@Composable
fun ProfileScreen(session: SessionViewModel, onBack: () -> Unit, onLoggedOut: () -> Unit) {
    val user by session.user.collectAsState()
    val prefs by session.prefs.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())) {
        TopBar("Profile", onBack)
        Column(Modifier.padding(horizontal = T.Gutter)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(13.dp),
            ) {
                Avatar(session.displayName, user?.id ?: "me", 56.dp)
                Column(Modifier.weight(1f)) {
                    TText(session.displayName, Type.screenTitle, T.Ink, maxLines = 2)
                    TText(user?.email ?: "", Type.body, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 1)
                }
            }
            TCard(Modifier.padding(top = 16.dp), shape = T.RCardLg, padding = 14.dp) {
                FactGrid(
                    listOf(
                        "Role" to (user?.role ?: "—"),
                        "Workspace" to prefs.mode.label,
                        "Calling window" to prefs.window.rangeLabel(),
                        "Joined" to Fmt.shortDate(Fmt.parse(user?.createdAt)),
                    ),
                )
            }
            PrimaryButton(
                "Sign out", { session.logout(onLoggedOut) },
                Modifier.padding(top = 20.dp),
                icon = Icons.Default.Logout, height = 50.dp, shape = T.RCard,
                container = T.MaroonTint, contentColor = T.Maroon,
            )
        }
        Spacer(Modifier.height(T.FabInset))
    }
}
