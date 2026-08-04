package com.nxthike.android.presentation.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.nxthike.android.presentation.auth.*
import com.nxthike.android.presentation.companies.*
import com.nxthike.android.presentation.courses.*
import com.nxthike.android.presentation.dashboard.DashboardScreen
import com.nxthike.android.presentation.events.*
import com.nxthike.android.presentation.hiring.*
import com.nxthike.android.presentation.home.HomeScreen
import com.nxthike.android.presentation.jobs.*
import com.nxthike.android.presentation.profile.ProfileScreen

private data class Tab(val route: String, val label: String, val icon: ImageVector)

@Composable
fun NxtHikeNavHost() {
    val nav = rememberNavController()
    val authVm: AuthViewModel = hiltViewModel()
    val loggedIn by authVm.isLoggedIn.collectAsState()

    val tabs = listOf(
        Tab(Routes.HOME, "Home", Icons.Default.Home),
        Tab(Routes.JOBS, "Jobs", Icons.Default.Work),
        Tab(Routes.HIRING, "Hiring", Icons.Default.People),
        Tab(Routes.DASHBOARD, "Stats", Icons.Default.Dashboard),
        Tab(Routes.PROFILE, "Profile", Icons.Default.Person),
    )

    val backStack by nav.currentBackStackEntryAsState()
    val current = backStack?.destination?.route
    val showBottom = current in tabs.map { it.route } && loggedIn

    Scaffold(
        bottomBar = {
            if (showBottom) {
                NavigationBar {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = current == tab.route,
                            onClick = {
                                nav.navigate(tab.route) {
                                    popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = tab.label) },
                            label = { Text(tab.label) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Routes.SPLASH,
            modifier = Modifier.padding(padding),
        ) {
            composable(Routes.SPLASH) {
                LaunchedEffect(loggedIn) {
                    if (loggedIn) nav.navigate(Routes.HOME) { popUpTo(Routes.SPLASH) { inclusive = true } }
                    else nav.navigate(Routes.LOGIN) { popUpTo(Routes.SPLASH) { inclusive = true } }
                }
            }
            composable(Routes.LOGIN) {
                LoginScreen(
                    onLoggedIn = { nav.navigate(Routes.HOME) { popUpTo(Routes.LOGIN) { inclusive = true } } },
                    onRegister = { nav.navigate(Routes.REGISTER) },
                )
            }
            composable(Routes.REGISTER) {
                RegisterScreen(
                    onRegistered = { nav.navigate(Routes.HOME) { popUpTo(Routes.LOGIN) { inclusive = true } } },
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.HOME) {
                HomeScreen(
                    onJobs = { nav.navigate(Routes.JOBS) },
                    onEvents = { nav.navigate(Routes.EVENTS) },
                    onCourses = { nav.navigate(Routes.COURSES) },
                    onCompanies = { nav.navigate(Routes.COMPANIES) },
                    onHiring = { nav.navigate(Routes.HIRING) },
                    onDashboard = { nav.navigate(Routes.DASHBOARD) },
                )
            }
            composable(Routes.JOBS) {
                JobsListScreen(
                    onOpen = { nav.navigate(Routes.jobDetail(it)) },
                    onCreate = { nav.navigate(Routes.jobEdit()) },
                )
            }
            composable(Routes.JOB_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) {
                val id = it.arguments?.getString("id")!!
                JobDetailScreen(
                    jobId = id,
                    onBack = { nav.popBackStack() },
                    onEdit = { nav.navigate(Routes.jobEdit(id)) },
                )
            }
            composable(Routes.JOB_EDIT, listOf(navArgument("id") { type = NavType.StringType; defaultValue = "new" })) {
                val id = it.arguments?.getString("id") ?: "new"
                JobEditScreen(jobId = id, onDone = { nav.popBackStack() }, onBack = { nav.popBackStack() })
            }
            composable(Routes.EVENTS) {
                EventsListScreen(
                    onOpen = { nav.navigate(Routes.eventDetail(it)) },
                    onCreate = { nav.navigate(Routes.eventEdit()) },
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.EVENT_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) {
                val id = it.arguments?.getString("id")!!
                EventDetailScreen(id, onBack = { nav.popBackStack() }, onEdit = { nav.navigate(Routes.eventEdit(id)) })
            }
            composable(Routes.EVENT_EDIT, listOf(navArgument("id") { type = NavType.StringType; defaultValue = "new" })) {
                EventEditScreen(it.arguments?.getString("id") ?: "new", onDone = { nav.popBackStack() }, onBack = { nav.popBackStack() })
            }
            composable(Routes.COURSES) {
                CoursesListScreen(
                    onOpen = { nav.navigate(Routes.courseDetail(it)) },
                    onCreate = { nav.navigate(Routes.courseEdit()) },
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.COURSE_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) {
                val id = it.arguments?.getString("id")!!
                CourseDetailScreen(id, onBack = { nav.popBackStack() }, onEdit = { nav.navigate(Routes.courseEdit(id)) })
            }
            composable(Routes.COURSE_EDIT, listOf(navArgument("id") { type = NavType.StringType; defaultValue = "new" })) {
                CourseEditScreen(it.arguments?.getString("id") ?: "new", onDone = { nav.popBackStack() }, onBack = { nav.popBackStack() })
            }
            composable(Routes.COMPANIES) {
                CompaniesListScreen(
                    onOpen = { nav.navigate(Routes.companyDetail(it)) },
                    onCreate = { nav.navigate(Routes.companyEdit()) },
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.COMPANY_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) {
                val id = it.arguments?.getString("id")!!
                CompanyDetailScreen(id, onBack = { nav.popBackStack() }, onEdit = { nav.navigate(Routes.companyEdit(id)) })
            }
            composable(Routes.COMPANY_EDIT, listOf(navArgument("id") { type = NavType.StringType; defaultValue = "new" })) {
                CompanyEditScreen(it.arguments?.getString("id") ?: "new", onDone = { nav.popBackStack() }, onBack = { nav.popBackStack() })
            }
            composable(Routes.HIRING) {
                HiringHomeScreen(
                    onCandidates = { nav.navigate(Routes.HIRING_CANDIDATES) },
                    onRoles = { nav.navigate(Routes.HIRING_ROLES) },
                    onOpenCandidate = { nav.navigate(Routes.candidateDetail(it)) },
                )
            }
            composable(Routes.HIRING_CANDIDATES) {
                CandidatesListScreen(
                    onOpen = { nav.navigate(Routes.candidateDetail(it)) },
                    onCreate = { nav.navigate(Routes.candidateEdit()) },
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.HIRING_CANDIDATE, listOf(navArgument("id") { type = NavType.StringType })) {
                val id = it.arguments?.getString("id")!!
                CandidateDetailScreen(
                    id,
                    onBack = { nav.popBackStack() },
                    onEdit = { nav.navigate(Routes.candidateEdit(id)) },
                )
            }
            composable(
                Routes.HIRING_CANDIDATE_EDIT,
                listOf(navArgument("id") { type = NavType.StringType; defaultValue = "new" }),
            ) {
                CandidateEditScreen(
                    it.arguments?.getString("id") ?: "new",
                    onDone = { nav.popBackStack() },
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.HIRING_ROLES) {
                RolesScreen(onBack = { nav.popBackStack() })
            }
            composable(Routes.DASHBOARD) { DashboardScreen() }
            composable(Routes.PROFILE) {
                ProfileScreen(onLoggedOut = {
                    nav.navigate(Routes.LOGIN) { popUpTo(0) { inclusive = true } }
                })
            }
        }
    }
}
