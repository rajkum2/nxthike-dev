package com.nxthike.android.core.model

import com.nxthike.android.data.remote.dto.SessionDto

/**
 * The capabilities the signed-in persona grants.
 *
 * A thin wrapper over the server's untyped `caps` map, with accessors that
 * mirror `WorkspaceIdentity` in `BE/app/services/personas.py` exactly — the
 * server is the enforcement point, and a client that disagrees with it either
 * hides something a user is entitled to or offers something that will 403.
 *
 * Two subtleties carried over deliberately:
 *
 *  - [can] treats the string `"none"` as false. The enum capabilities carry
 *    `"none"` for "not allowed", and a non-empty string is otherwise truthy,
 *    so `can("reqs")` would be wrong for a role holding `reqs: "none"`.
 *  - [isAdmin] requires the literal `true`, never a truthy string. `admin` can
 *    hold `"partial"`, which must not open the admin surfaces.
 */
@JvmInline
value class Caps(val raw: Map<String, Any?>) {

    fun cap(name: String): Any? = raw[name]

    /** Truthy check. `"config"` and `"ifPanel"` count as yes; `"none"` does not. */
    fun can(name: String): Boolean {
        val value = raw[name] ?: return false
        if (value == "none") return false
        return when (value) {
            is Boolean -> value
            is String -> value.isNotEmpty()
            is Number -> value.toDouble() != 0.0
            else -> true
        }
    }

    /** The enum capabilities: is this cap set to one of [allowed]? */
    fun capIn(name: String, vararg allowed: String): Boolean =
        (raw[name] as? String) in allowed

    /** Only the literal `true` — `"partial"` is truthy but is not full admin. */
    val isAdmin: Boolean get() = raw["admin"] == true

    /** True when the server will mask `phone` and `email` for this persona. */
    val masksPii: Boolean get() = capIn("db", "limitedPII", "ownReqs", "ownInterviews")

    val seesRates: Boolean get() = can("rates")

    val canDial: Boolean get() = can("dial")
    val canLog: Boolean get() = can("log")
    val canCreate: Boolean get() = can("create")
    val canStage: Boolean get() = can("stage")
    val canScore: Boolean get() = can("score")
    val canApprove: Boolean get() = can("approve")
    val canErase: Boolean get() = can("erasure")

    /** Requisitions are readable at `all`/`own`/`view`, writable only at the first two. */
    val canEditRequisitions: Boolean get() = capIn("reqs", "all", "own")
    val seesRequisitions: Boolean get() = can("reqs")

    val seesAnalytics: Boolean get() = can("analytics")
    val seesDatabase: Boolean get() = can("db")

    companion object {
        /**
         * What to assume before a session has landed: nothing. Every gate then
         * reads closed until the server says otherwise, so no screen briefly
         * offers an action the persona does not hold.
         */
        val NONE = Caps(emptyMap())

        /**
         * The fallback for "signed in, but the workspace session could not be
         * reached and nothing is cached" — a first launch that lost the network
         * between login and the session call.
         *
         * Opening up beats locking out here. Every route is gated server-side,
         * so the worst case is an action that returns a 403 with a readable
         * message; the alternative is an app that shows a signed-in user nothing
         * and gives no reason. Replaced the moment a real session arrives.
         */
        val OPTIMISTIC = Caps(
            mapOf(
                "db" to "all", "create" to true, "dial" to true, "log" to true,
                "reqs" to "all", "rates" to false, "stage" to true, "score" to true,
                "approve" to false, "eeo" to false, "analytics" to "own",
                "admin" to false, "erasure" to false,
            ),
        )
    }
}

/**
 * Screen keys the server's nav allow-list uses, so a route can be checked
 * against `session.nav` without stringly-typed guesswork at each call site.
 */
object NavKeys {
    const val CANDIDATES = "cands"
    const val QUEUE = "queue"
    const val REQUISITIONS = "reqs"
    const val CLIENTS = "clients"
    const val INTERVIEWS = "intcal"
    const val OFFERS = "offers"
    const val APPROVALS = "approvals"
    const val TEAM = "team"
    const val USERS = "users"
    const val COMPLIANCE = "compliance"
    const val AUDIT = "audit"
}

/** Pulls the capability view out of a freshly loaded session. */
val SessionDto.capabilities: Caps get() = Caps(caps)
