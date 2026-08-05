package com.nxthike.android.presentation.navigation

import java.net.URLEncoder

/**
 * Route table. Names mirror the spec's screen ids (SCR-CALL-01 → `queue`) so a
 * route can be traced straight back to the design index.
 */
object R {
    const val SPLASH = "splash"

    // Onboarding — SCR-AUTH-*
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val MODE = "mode"
    const val PRIME = "prime"
    const val DENIED = "denied"
    const val DPDP = "dpdp"
    const val NO_ACCESS = "noaccess"

    // Home — SCR-HOME-*
    const val HOME = "home"
    const val NOTIFS = "notifs"
    const val TASKS = "tasks"
    const val SEARCH = "search"

    // Call flow — SCR-CALL-*
    const val QUEUE = "queue"
    const val PRECALL = "precall"
    const val HANDOFF = "handoff"
    const val SUMMARY = "summary"
    const val CALLBACKS = "callbacks"
    const val HISTORY = "history"

    // Candidates — SCR-CAND-*
    const val CANDIDATES = "cands"
    const val CANDIDATE = "cand/{id}"
    const val CANDIDATE_EDIT = "cand/edit?id={id}"
    const val MERGE = "merge/{id}"
    const val RESUME = "resume/{id}"

    // Requisitions & pipeline — SCR-JOB-*, SCR-PIPE-*
    const val REQS = "reqs"
    const val REQ = "req/{id}"
    const val REQ_NEW = "req/new"
    const val KANBAN = "kanban?roleId={roleId}"
    const val PIPELIST = "pipelist?roleId={roleId}"
    const val POSTINGS = "postings"
    const val EVENTS = "events"
    const val COURSES = "courses"

    // Comms — SCR-COMM-*
    const val COMPOSER = "composer/{id}"
    const val TEMPLATES = "templates"

    // Interviews — SCR-INT-*
    const val INTERVIEWS = "interviews"
    const val INT_SCHEDULE = "interviews/schedule?id={id}"
    const val INT_KIT = "interviews/kit/{id}"
    const val SCORECARD = "interviews/scorecard/{id}"

    // Offers — SCR-OFFER-*
    const val OFFERS = "offers"
    const val OFFER = "offer/{id}"
    const val APPROVALS = "approvals"

    // Clients — SCR-CLIENT-*
    const val CLIENTS = "clients"
    const val CLIENT = "client/{id}"
    const val SUBMISSIONS = "submissions?clientId={clientId}"

    // Team & reporting — SCR-COLLAB-*, SCR-RPT-*
    const val FEED = "feed"
    const val PERF = "perf"
    const val TEAM = "team"

    // Settings & admin — SCR-SET-*, SCR-GLOBAL-*
    const val MORE = "more"
    const val SETTINGS = "settings"
    const val CALL_WINDOW = "callwindow"
    const val ROLES = "roles"
    const val COMPLIANCE = "compliance"
    const val AUDIT = "audit"
    const val TAXONOMY = "taxonomy"
    const val SYNC = "sync"
    const val STATES = "states"
    const val PROFILE = "profile"

    private fun enc(s: String?) = URLEncoder.encode(s.orEmpty(), "UTF-8")

    fun candidate(id: String) = "cand/$id"
    fun candidateEdit(id: String = "new") = "cand/edit?id=$id"
    fun merge(id: String) = "merge/$id"
    fun resume(id: String) = "resume/$id"
    fun req(id: String) = "req/${enc(id)}"
    fun kanban(roleId: String? = null) = "kanban?roleId=${enc(roleId)}"
    fun pipelist(roleId: String? = null) = "pipelist?roleId=${enc(roleId)}"
    fun composer(id: String) = "composer/$id"
    fun intSchedule(id: String = "") = "interviews/schedule?id=${enc(id)}"
    fun intKit(id: String) = "interviews/kit/$id"
    fun scorecard(id: String) = "interviews/scorecard/$id"
    fun offer(id: String) = "offer/$id"
    fun client(id: String) = "client/${enc(id)}"
    fun submissions(clientId: String? = null) = "submissions?clientId=${enc(clientId)}"

    /** Which bottom-nav tab owns a route — the spec's TABKEY map. */
    fun tabFor(route: String?): String? = when {
        route == null -> null
        route in listOf(HOME, NOTIFS, TASKS, SEARCH) -> HOME
        route.startsWith("cand") || route.startsWith("merge") || route.startsWith("resume") -> CANDIDATES
        route in listOf(QUEUE, PRECALL, CALLBACKS, HISTORY, SUMMARY) -> QUEUE
        route.startsWith("req") || route.startsWith("kanban") ||
            route.startsWith("pipelist") || route == POSTINGS -> REQS
        else -> MORE
    }

    /** Routes that own the whole screen — no bottom bar, no distractions. */
    val FULL_SCREEN = setOf(
        SPLASH, LOGIN, REGISTER, MODE, PRIME, DENIED, DPDP, NO_ACCESS,
        PRECALL, HANDOFF, RESUME, CANDIDATE_EDIT, MERGE, REQ_NEW,
        INT_SCHEDULE, SCORECARD, COMPOSER,
    )
}
