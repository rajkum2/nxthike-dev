package com.nxthike.android.presentation.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.SpaceDashboard
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.nxthike.android.presentation.calls.CallFlowViewModel
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.calls.*
import com.nxthike.android.presentation.talent.candidates.*
import com.nxthike.android.presentation.talent.clients.*
import com.nxthike.android.presentation.talent.comms.*
import com.nxthike.android.presentation.talent.home.*
import com.nxthike.android.presentation.talent.interviews.*
import com.nxthike.android.presentation.talent.offers.*
import com.nxthike.android.presentation.talent.onboarding.*
import com.nxthike.android.presentation.talent.portal.*
import com.nxthike.android.presentation.talent.requisitions.*
import com.nxthike.android.presentation.talent.settings.*
import com.nxthike.android.presentation.talent.team.*
import java.net.URLDecoder
import com.nxthike.android.data.remote.dto.CandidateDto

/** Sheets and dialogs are hosted above the graph so they survive navigation. */
private sealed interface AppSheet {
    data object QuickAdd : AppSheet
    data object Disposition : AppSheet
    data object Callback : AppSheet
    data object Dnc : AppSheet
    data class Consent(val candidateId: String) : AppSheet
    data class Erasure(val candidateId: String) : AppSheet
    data object Filters : AppSheet
    data object StageChange : AppSheet
    data object SaveSearch : AppSheet

    /**
     * Carries the candidate rather than an id: the row already has the record,
     * and the sheet needs its current stage and note trail to build the move.
     */
    data class Stage(val candidate: CandidateDto) : AppSheet
    data class QuickActions(val candidate: CandidateDto) : AppSheet
}

/** Screens reachable without a session — never bounce away from these. */
private val AUTH_ROUTES = setOf(R.SPLASH, R.LOGIN, R.REGISTER)

private data class Tab(val route: String, val label: String, val icon: ImageVector)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TalentNavHost() {
    val nav = rememberNavController()
    val session: SessionViewModel = hiltViewModel()

    // Flows shared across several destinations live at the host, so state
    // survives moving between the queue, the pre-call card and the sheets.
    val callFlow: CallFlowViewModel = hiltViewModel()
    val candidates: CandidatesViewModel = hiltViewModel()
    val pipeline: PipelineViewModel = hiltViewModel()
    val interviews: InterviewsViewModel = hiltViewModel()
    val offers: OffersViewModel = hiltViewModel()
    val clients: ClientsViewModel = hiltViewModel()
    val candidateProfile: CandidateProfileViewModel = hiltViewModel()

    val loggedIn by session.isLoggedIn.collectAsState()
    val bootstrapped by session.bootstrapped.collectAsState()
    val candidateProfileState by candidateProfile.state.collectAsState()
    val needsAccess by session.needsAccess.collectAsState()
    val profileResolved by session.profileResolved.collectAsState()
    val prefs by session.prefs.collectAsState()
    val offline by session.offline.collectAsState()

    var sheet by remember { mutableStateOf<AppSheet?>(null) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route
    val showBottomBar = loggedIn && route != null && route !in R.FULL_SCREEN

    val tabs = remember(prefs.mode) {
        listOf(
            Tab(R.HOME, "Home", Icons.Default.SpaceDashboard),
            Tab(R.CANDIDATES, "Candidates", Icons.Default.Groups),
            Tab(R.QUEUE, "Calls", Icons.Default.Call),
            Tab(R.REQS, prefs.mode.jobsTab, Icons.Default.Work),
            Tab(R.MORE, "More", Icons.Default.MoreHoriz),
        )
    }

    fun goTab(target: String) = nav.navigate(target) {
        popUpTo(nav.graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }

    /** Opens the pre-call card for a candidate, honouring the window and DND gate. */
    fun startCall(candidateId: String) {
        callFlow.openCandidate(candidateId)
        nav.navigate(R.PRECALL)
    }

    Scaffold(
        containerColor = T.Bg,
        bottomBar = {
            if (showBottomBar) {
                Column {
                    Box(Modifier.fillMaxWidth().height(1.dp).background(T.TrackBorder))
                    Row(
                        Modifier.fillMaxWidth().background(T.SurfaceMuted).padding(horizontal = 6.dp, vertical = 6.dp),
                    ) {
                        tabs.forEach { tab ->
                            val selected = R.tabFor(route) == tab.route
                            Column(
                                Modifier.weight(1f).clickable { goTab(tab.route) }.padding(vertical = 4.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                Box(
                                    Modifier
                                        .height(30.dp)
                                        .clip(T.RPill)
                                        .background(if (selected) T.IndigoPill else Color.Transparent)
                                        .padding(horizontal = 17.dp),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Icon(
                                        tab.icon, tab.label,
                                        tint = if (selected) T.IndigoInk else T.InkMuted,
                                        modifier = Modifier.size(21.dp),
                                    )
                                }
                                TText(
                                    tab.label, Type.labelSm,
                                    if (selected) T.IndigoInk else T.InkMuted,
                                    Modifier.padding(top = 3.dp), maxLines = 1,
                                )
                            }
                        }
                    }
                }
            }
        },
    ) { padding ->
        // Access is a persona, not a role: `get_workspace_user` admits all eight
        // personas and refuses portal-only accounts with a reason. Guarding here
        // rather than in routing means no screen is reachable before that lands.
        if (loggedIn && profileResolved && needsAccess) {
            Box(Modifier.padding(padding)) {
                AccessPendingScreen(session) {
                    nav.navigate(R.LOGIN) { popUpTo(0) { inclusive = true } }
                }
            }
            return@Scaffold
        }

        // The token can be dropped mid-session — it expires after eight hours, and
        // the interceptor clears it on any 401. Splash only routes on first
        // launch, so without this the app would sit on a screen whose every
        // request fails.
        LaunchedEffect(loggedIn, bootstrapped) {
            if (bootstrapped && !loggedIn && route != null && route !in AUTH_ROUTES) {
                nav.navigate(R.LOGIN) { popUpTo(0) { inclusive = true } }
            }
        }

        NavHost(
            navController = nav,
            startDestination = R.SPLASH,
            modifier = Modifier.padding(padding),
        ) {

            /* ---- Onboarding ---- */

            composable(R.SPLASH) {
                // Route only once disk state is known, so a returning user lands
                // on Home rather than flashing the login screen.
                LaunchedEffect(bootstrapped, loggedIn, prefs.onboarded) {
                    if (!bootstrapped) return@LaunchedEffect
                    val target = when {
                        !loggedIn -> R.LOGIN
                        !prefs.onboarded -> R.MODE
                        else -> R.HOME
                    }
                    nav.navigate(target) { popUpTo(R.SPLASH) { inclusive = true } }
                }
                Column(
                    Modifier.fillMaxSize().background(T.Bg),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Box(
                        Modifier.size(52.dp).clip(T.RCardLg).background(T.Indigo),
                        contentAlignment = Alignment.Center,
                    ) { Icon(Icons.Default.Call, null, tint = Color.White, modifier = Modifier.size(28.dp)) }
                    TText("TalentDialer", Type.sheetTitle, T.Ink, Modifier.padding(top = 16.dp))
                }
            }

            composable(R.LOGIN) {
                LoginScreen(
                    onSignedIn = {
                        session.refreshUser()
                        nav.navigate(R.SPLASH) { popUpTo(R.LOGIN) { inclusive = true } }
                    },
                    onRegister = { nav.navigate(R.REGISTER) },
                )
            }

            composable(R.REGISTER) {
                RegisterScreen(
                    onRegistered = {
                        session.refreshUser()
                        nav.navigate(R.SPLASH) { popUpTo(R.LOGIN) { inclusive = true } }
                    },
                    onBack = { nav.popBackStack() },
                )
            }

            composable(R.MODE) {
                ModeScreen(session) { nav.navigate(R.PRIME) }
            }

            composable(R.PRIME) {
                PermissionPrimingScreen(
                    session,
                    onGranted = { nav.navigate(R.DPDP) },
                    onDenied = { nav.navigate(R.DENIED) },
                )
            }

            composable(R.DENIED) {
                PermissionDeniedScreen(onContinue = { nav.navigate(R.DPDP) })
            }

            composable(R.NO_ACCESS) {
                AccessPendingScreen(session) {
                    nav.navigate(R.LOGIN) { popUpTo(0) { inclusive = true } }
                }
            }

            composable(R.DPDP) {
                DpdpScreen(session) {
                    nav.navigate(R.HOME) { popUpTo(R.SPLASH) { inclusive = true } }
                }
            }

            /* ---- Home ---- */

            composable(R.HOME) {
                HomeScreen(
                    session = session,
                    onQueue = { goTab(R.QUEUE) },
                    onCallbacks = { nav.navigate(R.CALLBACKS) },
                    onTasks = { nav.navigate(R.TASKS) },
                    onNotifications = { nav.navigate(R.NOTIFS) },
                    onSearch = { nav.navigate(R.SEARCH) },
                    onCandidate = { nav.navigate(R.candidate(it)) },
                    onCall = ::startCall,
                    onRequisition = { nav.navigate(R.req(it)) },
                    onOffers = { nav.navigate(R.OFFERS) },
                    onSync = { nav.navigate(R.SYNC) },
                    onQuickAdd = { sheet = AppSheet.QuickAdd },
                )
            }

            composable(R.NOTIFS) {
                NotificationsScreen({ nav.popBackStack() }) { nav.navigate(R.candidate(it)) }
            }

            composable(R.TASKS) {
                TasksScreen({ nav.popBackStack() }) { nav.navigate(R.candidate(it)) }
            }

            composable(R.SEARCH) {
                SearchScreen(
                    onBack = { nav.popBackStack() },
                    onCandidate = { nav.navigate(R.candidate(it)) },
                    onRequisition = { nav.navigate(R.req(it)) },
                    onClient = { nav.navigate(R.client(it)) },
                )
            }

            /* ---- Call flow ---- */

            composable(R.QUEUE) {
                QueueScreen(
                    vm = callFlow,
                    session = session,
                    onStartCalling = { nav.navigate(R.PRECALL) },
                    onOpenCandidate = { nav.navigate(R.candidate(it)) },
                    onHistory = { nav.navigate(R.HISTORY) },
                    onRequisitions = { goTab(R.REQS) },
                    onFilters = { sheet = AppSheet.Filters },
                    onBlockedDial = { sheet = AppSheet.Dnc },
                )
            }

            composable(R.PRECALL) {
                PreCallScreen(
                    vm = callFlow,
                    session = session,
                    onExit = { nav.popBackStack(R.QUEUE, inclusive = false) },
                    onDial = { nav.navigate(R.HANDOFF) },
                    onBlocked = { sheet = AppSheet.Dnc },
                    onCompose = { nav.navigate(R.composer(it)) },
                    onFinished = { nav.navigate(R.SUMMARY) },
                )
            }

            composable(R.HANDOFF) {
                HandoffScreen(
                    vm = callFlow,
                    onLogOutcome = { sheet = AppSheet.Disposition },
                    onBack = { nav.popBackStack() },
                )
            }

            composable(R.SUMMARY) {
                SummaryScreen(
                    vm = callFlow,
                    onHome = { goTab(R.HOME) },
                    onAnother = { nav.popBackStack(R.QUEUE, inclusive = false) },
                )
            }

            composable(R.CALLBACKS) {
                CallbacksScreen(
                    vm = callFlow,
                    onBack = { nav.popBackStack() },
                    onOpenCandidate = { nav.navigate(R.candidate(it)) },
                    onCall = ::startCall,
                )
            }

            composable(R.HISTORY) {
                HistoryScreen(callFlow) { nav.popBackStack() }
            }

            /* ---- Candidates ---- */

            composable(R.CANDIDATES) {
                CandidatesScreen(
                    vm = candidates,
                    onOpen = { nav.navigate(R.candidate(it)) },
                    onCall = ::startCall,
                    onCompose = { nav.navigate(R.composer(it)) },
                    onAdd = { nav.navigate(R.candidateEdit()) },
                    onFilters = { candidates.ensureReferenceData(); sheet = AppSheet.Filters },
                    onStage = { sheet = AppSheet.Stage(it) },
                    onMore = { sheet = AppSheet.QuickActions(it) },
                    onSaveSearch = { sheet = AppSheet.SaveSearch },
                )
            }

            composable(R.CANDIDATE, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                val id = entry.arguments?.getString("id").orEmpty()
                CandidateProfileScreen(
                    candidateId = id,
                    vm = candidateProfile,
                    session = session,
                    onBack = { nav.popBackStack() },
                    onEdit = { nav.navigate(R.candidateEdit(id)) },
                    onCall = { startCall(id) },
                    onCompose = { nav.navigate(R.composer(id)) },
                    onResume = { nav.navigate(R.resume(id)) },
                    onMerge = { nav.navigate(R.merge(id)) },
                    onConsent = { sheet = AppSheet.Consent(id) },
                    onErasure = { sheet = AppSheet.Erasure(id) },
                    // Was a jump to the pipeline list, which showed the board
                    // rather than changing anything. Opens the stage picker now.
                    onStageChange = {
                        candidateProfileState.candidate?.let { sheet = AppSheet.Stage(it) }
                    },
                )
            }

            composable(
                R.CANDIDATE_EDIT,
                listOf(navArgument("id") { type = NavType.StringType; defaultValue = "new" }),
            ) { entry ->
                val id = entry.arguments?.getString("id") ?: "new"
                CandidateEditScreen(
                    candidateId = id,
                    onDone = { newId ->
                        candidates.load()
                        nav.popBackStack()
                        nav.navigate(R.candidate(newId))
                    },
                    onBack = { nav.popBackStack() },
                    onOpenExisting = { nav.navigate(R.candidate(it)) },
                    onMerge = { nav.navigate(R.merge(it)) },
                )
            }

            composable(R.MERGE, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                MergeScreen(
                    primaryId = entry.arguments?.getString("id").orEmpty(),
                    onBack = { nav.popBackStack() },
                    onMerged = { id ->
                        candidates.load()
                        nav.popBackStack()
                        nav.navigate(R.candidate(id))
                    },
                )
            }

            composable(R.RESUME, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                ResumeScreen(entry.arguments?.getString("id").orEmpty()) { nav.popBackStack() }
            }

            /* ---- Requisitions & pipeline ---- */

            composable(R.REQS) {
                RequisitionsScreen(
                    session = session,
                    onOpen = { nav.navigate(R.req(it)) },
                    onCreate = { nav.navigate(R.REQ_NEW) },
                    onPostings = { nav.navigate(R.POSTINGS) },
                )
            }

            composable(R.REQ, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                val id = decode(entry.arguments?.getString("id"))
                RequisitionDetailScreen(
                    roleId = id,
                    session = session,
                    onBack = { nav.popBackStack() },
                    onKanban = { nav.navigate(R.kanban(id)) },
                    onStartCalling = {
                        callFlow.loadQueue(id, null)
                        goTab(R.QUEUE)
                    },
                    onCandidate = { nav.navigate(R.candidate(it)) },
                    onSubmissions = { nav.navigate(R.submissions()) },
                )
            }

            composable(R.REQ_NEW) {
                NewRequisitionScreen(session, { nav.popBackStack() }) { nav.popBackStack() }
            }

            composable(
                R.KANBAN,
                listOf(navArgument("roleId") { type = NavType.StringType; defaultValue = "" }),
            ) { entry ->
                val roleId = decode(entry.arguments?.getString("roleId")).takeIf { it.isNotBlank() }
                PipelineBoardScreen(
                    roleId = roleId,
                    vm = pipeline,
                    onBack = { nav.popBackStack() },
                    onCandidate = { nav.navigate(R.candidate(it)) },
                    onListView = { nav.navigate(R.pipelist(roleId)) },
                    onMoveRequested = { sheet = AppSheet.StageChange },
                )
            }

            composable(
                R.PIPELIST,
                listOf(navArgument("roleId") { type = NavType.StringType; defaultValue = "" }),
            ) { entry ->
                val roleId = decode(entry.arguments?.getString("roleId")).takeIf { it.isNotBlank() }
                PipelineListScreen(
                    roleId = roleId,
                    vm = pipeline,
                    onBack = { nav.popBackStack() },
                    onCandidate = { nav.navigate(R.candidate(it)) },
                    onBoardView = { nav.navigate(R.kanban(roleId)) },
                )
            }

            composable(R.POSTINGS) { PostingsScreen { nav.popBackStack() } }
            composable(R.EVENTS) { EventsScreen { nav.popBackStack() } }
            composable(R.COURSES) { CoursesScreen { nav.popBackStack() } }

            /* ---- Comms ---- */

            composable(R.COMPOSER, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                ComposerScreen(
                    candidateId = entry.arguments?.getString("id").orEmpty(),
                    session = session,
                    onBack = { nav.popBackStack() },
                    onTemplates = { nav.navigate(R.TEMPLATES) },
                )
            }

            composable(R.TEMPLATES) { TemplatesScreen { nav.popBackStack() } }

            /* ---- Interviews ---- */

            composable(R.INTERVIEWS) {
                InterviewsScreen(
                    vm = interviews,
                    onBack = { nav.popBackStack() },
                    onSchedule = { nav.navigate(R.intSchedule()) },
                    onOpenKit = { nav.navigate(R.intKit(it)) },
                )
            }

            composable(
                R.INT_SCHEDULE,
                listOf(navArgument("id") { type = NavType.StringType; defaultValue = "" }),
            ) { entry ->
                ScheduleInterviewScreen(
                    candidateId = decode(entry.arguments?.getString("id")),
                    vm = interviews,
                    onBack = { nav.popBackStack() },
                    onScheduled = { nav.popBackStack() },
                )
            }

            composable(R.INT_KIT, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                val id = entry.arguments?.getString("id").orEmpty()
                InterviewKitScreen(
                    candidateId = id,
                    vm = interviews,
                    onBack = { nav.popBackStack() },
                    onScorecard = { nav.navigate(R.scorecard(id)) },
                    onResume = { nav.navigate(R.resume(id)) },
                )
            }

            composable(R.SCORECARD, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                ScorecardScreen(
                    candidateId = entry.arguments?.getString("id").orEmpty(),
                    vm = interviews,
                    onBack = { nav.popBackStack() },
                    onSubmitted = { nav.popBackStack(R.INTERVIEWS, inclusive = false) },
                )
            }

            /* ---- Offers ---- */

            composable(R.OFFERS) {
                OffersScreen(
                    vm = offers,
                    onBack = { nav.popBackStack() },
                    onOpen = { nav.navigate(R.offer(it)) },
                    onApprovals = { nav.navigate(R.APPROVALS) },
                )
            }

            composable(R.OFFER, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                OfferDetailScreen(
                    // The route now carries an offer id: offers are their own
                    // records, not a candidate parked at the Offer stage.
                    offerId = entry.arguments?.getString("id").orEmpty(),
                    vm = offers,
                    onBack = { nav.popBackStack() },
                    onDecided = { nav.popBackStack() },
                    onOpenCandidate = { nav.navigate(R.candidate(it)) },
                )
            }

            composable(R.APPROVALS) {
                ApprovalsScreen(offers, { nav.popBackStack() }) { nav.navigate(R.offer(it)) }
            }

            /* ---- Clients ---- */

            composable(R.CLIENTS) {
                ClientsScreen(clients, session, { nav.popBackStack() }) { nav.navigate(R.client(it)) }
            }

            composable(R.CLIENT, listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                ClientDetailScreen(
                    clientId = decode(entry.arguments?.getString("id")),
                    vm = clients,
                    session = session,
                    onBack = { nav.popBackStack() },
                    onSubmissions = { nav.navigate(R.submissions()) },
                )
            }

            composable(
                R.SUBMISSIONS,
                listOf(navArgument("clientId") { type = NavType.StringType; defaultValue = "" }),
            ) { entry ->
                SubmissionsScreen(
                    clientId = decode(entry.arguments?.getString("clientId")).takeIf { it.isNotBlank() },
                    vm = clients,
                    onBack = { nav.popBackStack() },
                    onOpenCandidate = { nav.navigate(R.candidate(it)) },
                )
            }

            /* ---- Team & reporting ---- */

            composable(R.FEED) {
                ActivityFeedScreen({ nav.popBackStack() }) { nav.navigate(R.candidate(it)) }
            }
            composable(R.PERF) {
                PerformanceScreen({ nav.popBackStack() }) { nav.navigate(R.TEAM) }
            }
            composable(R.TEAM) { TeamScreen { nav.popBackStack() } }

            /* ---- Settings & admin ---- */

            composable(R.MORE) {
                MoreScreen(
                    session = session,
                    onClients = { nav.navigate(R.CLIENTS) },
                    onInterviews = { nav.navigate(R.INTERVIEWS) },
                    onOffers = { nav.navigate(R.OFFERS) },
                    onFeed = { nav.navigate(R.FEED) },
                    onPerformance = { nav.navigate(R.PERF) },
                    onPostings = { nav.navigate(R.POSTINGS) },
                    onSettings = { nav.navigate(R.SETTINGS) },
                    onCallWindow = { nav.navigate(R.CALL_WINDOW) },
                    onRoles = { nav.navigate(R.ROLES) },
                    onCompliance = { nav.navigate(R.COMPLIANCE) },
                    onAudit = { nav.navigate(R.AUDIT) },
                    onTaxonomy = { nav.navigate(R.TAXONOMY) },
                    onSync = { nav.navigate(R.SYNC) },
                    onStates = { nav.navigate(R.STATES) },
                    onProfile = { nav.navigate(R.PROFILE) },
                    onEvents = { nav.navigate(R.EVENTS) },
                    onCourses = { nav.navigate(R.COURSES) },
                )
            }

            composable(R.SETTINGS) {
                SettingsScreen(session, { nav.popBackStack() }) {
                    nav.navigate(R.LOGIN) { popUpTo(0) { inclusive = true } }
                }
            }
            composable(R.CALL_WINDOW) { CallWindowScreen(session) { nav.popBackStack() } }
            composable(R.ROLES) { RolesMatrixScreen(session) { nav.popBackStack() } }
            composable(R.COMPLIANCE) {
                ComplianceScreen(
                    onBack = { nav.popBackStack() },
                    onAudit = { nav.navigate(R.AUDIT) },
                    onOpenCandidate = { nav.navigate(R.candidate(it)) },
                )
            }
            composable(R.AUDIT) { AuditScreen { nav.popBackStack() } }
            composable(R.TAXONOMY) { TaxonomyScreen { nav.popBackStack() } }
            composable(R.SYNC) { SyncScreen(session) { nav.popBackStack() } }
            composable(R.STATES) { StateGalleryScreen { nav.popBackStack() } }
            composable(R.PROFILE) {
                ProfileScreen(session, { nav.popBackStack() }) {
                    nav.navigate(R.LOGIN) { popUpTo(0) { inclusive = true } }
                }
            }
        }
    }

    /* ---------------- Sheets ---------------- */

    val preCall by callFlow.preCall.collectAsState()
    val draft by callFlow.draft.collectAsState()
    val candidatesState by candidates.state.collectAsState()
    val pipelineState by pipeline.state.collectAsState()

    when (val s = sheet) {
        null -> Unit

        AppSheet.Dnc -> Dialog(onDismissRequest = { sheet = null }) {
            Box(
                Modifier.fillMaxWidth().clip(T.RDialog).background(T.Bg),
            ) {
                DncDialogContent(
                    onRecordConsent = {
                        val id = preCall.row?.candidateId
                        sheet = if (id != null) AppSheet.Consent(id) else null
                    },
                    onBack = { sheet = null },
                )
            }
        }

        else -> ModalBottomSheet(
            onDismissRequest = { sheet = null },
            sheetState = sheetState,
            containerColor = T.Bg,
            shape = T.RSheet,
        ) {
            when (s) {
                AppSheet.QuickAdd -> QuickAddSheetContent(
                    onAddCandidate = { sheet = null; nav.navigate(R.candidateEdit()) },
                    onNote = { sheet = null; goTab(R.CANDIDATES) },
                    onTask = { sheet = null; nav.navigate(R.TASKS) },
                    onCallback = { sheet = null; nav.navigate(R.CALLBACKS) },
                )

                AppSheet.Disposition -> DispositionSheetContent(
                    candidateName = preCall.row?.name ?: "Candidate",
                    candidatePhone = preCall.row?.phone,
                    draft = draft,
                    offline = offline,
                    onPick = callFlow::pickDisposition,
                    onDuration = callFlow::setDuration,
                    onNote = callFlow::setNote,
                    onNextAction = callFlow::setNextAction,
                    onSaveAndNext = {
                        // A callback outcome must land on a slot before it saves.
                        if (draft.disposition == "connected_callback" && draft.callbackAt == null) {
                            sheet = AppSheet.Callback
                        } else {
                            callFlow.save(advance = true) { _, finished ->
                                sheet = null
                                if (finished) {
                                    nav.navigate(R.SUMMARY) { popUpTo(R.QUEUE) }
                                } else {
                                    nav.navigate(R.PRECALL) { popUpTo(R.QUEUE) }
                                }
                            }
                        }
                    },
                    onSaveOnly = {
                        callFlow.save(advance = false) { _, _ ->
                            sheet = null
                            nav.popBackStack(R.QUEUE, inclusive = false)
                        }
                    },
                )

                AppSheet.Callback -> CallbackSheetContent(
                    candidateName = preCall.row?.name ?: "Candidate",
                    window = prefs.window,
                    selected = draft.callbackAt,
                    remind = draft.remind,
                    onSelect = callFlow::setCallbackAt,
                    onRemind = callFlow::setRemind,
                    onConfirm = {
                        callFlow.save(advance = true) { _, finished ->
                            sheet = null
                            if (finished) {
                                nav.navigate(R.SUMMARY) { popUpTo(R.QUEUE) }
                            } else {
                                nav.navigate(R.PRECALL) { popUpTo(R.QUEUE) }
                            }
                        }
                    },
                )

                is AppSheet.Consent -> {
                    var channel by remember { mutableStateOf("call") }
                    LaunchedEffect(s.candidateId) { candidateProfile.load(s.candidateId) }
                    ConsentSheetContent(
                        channel = channel,
                        onChannel = { channel = it },
                        onRecord = { candidateProfile.recordConsent(channel) { sheet = null } },
                    )
                }

                is AppSheet.Erasure -> {
                    var reason by remember { mutableStateOf("") }
                    LaunchedEffect(s.candidateId) { candidateProfile.load(s.candidateId) }
                    ErasureSheetContent(
                        reason = reason,
                        onReason = { reason = it },
                        onSubmit = { candidateProfile.raiseErasure(reason) { sheet = null } },
                    )
                }

                AppSheet.Filters -> CandidateFiltersSheetContent(
                    state = candidatesState,
                    onApply = { candidates.setFilters(it); sheet = null },
                    onReset = { candidates.clearFilters() },
                    // Apply first, then name it: the search being saved is the one
                    // the list is showing, which is what the user just checked.
                    onSave = { candidates.setFilters(it); sheet = AppSheet.SaveSearch },
                )

                AppSheet.SaveSearch -> SaveSearchSheetContent(
                    filterCount = candidatesState.filters.count,
                    query = candidatesState.query,
                    onSave = { name -> candidates.saveCurrentSearch(name) { sheet = null } },
                )

                is AppSheet.Stage -> StagePickerSheetContent(
                    // Re-read from the list so the sheet shows the stage as it is
                    // now, not as it was when the row was long-pressed.
                    candidate = candidatesState.items.firstOrNull { it.id == s.candidate.id }
                        ?: s.candidate,
                    saving = candidatesState.busyId == s.candidate.id,
                    onConfirm = { stage, note, reason ->
                        candidates.changeStage(s.candidate, stage, note, reason) {
                            // One write; refresh the profile too when it is the
                            // screen the move was made from.
                            if (candidateProfileState.candidate?.id == s.candidate.id) {
                                candidateProfile.load(s.candidate.id, force = true)
                            }
                            sheet = null
                        }
                    },
                )

                is AppSheet.QuickActions -> CandidateQuickActionsSheetContent(
                    candidate = candidatesState.items.firstOrNull { it.id == s.candidate.id }
                        ?: s.candidate,
                    onOpen = { sheet = null; nav.navigate(R.candidate(s.candidate.id)) },
                    onCall = { sheet = null; startCall(s.candidate.id) },
                    onMessage = { sheet = null; nav.navigate(R.composer(s.candidate.id)) },
                    onStage = { sheet = AppSheet.Stage(s.candidate) },
                    onToggleStar = { candidates.toggleStar(s.candidate); sheet = null },
                )

                AppSheet.StageChange -> {
                    val move = pipelineState.pendingMove
                    if (move == null) {
                        LaunchedEffect(Unit) { sheet = null }
                    } else {
                        StageChangeSheetContent(move) { note, dropReason ->
                            pipeline.confirmMove(note, dropReason) { sheet = null }
                        }
                    }
                }

                else -> Unit
            }
        }
    }
}

private fun decode(raw: String?): String {
    val v = raw.orEmpty()
    if (v.isBlank()) return ""
    return runCatching { URLDecoder.decode(v, "UTF-8") }.getOrDefault(v)
}
