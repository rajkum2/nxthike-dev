package com.nxthike.android.domain.repository

/**
 * The full server-side candidate filter, as one value.
 *
 * `/api/hiring/candidates` takes twenty-one query parameters. Passing them
 * positionally would be unreadable and would break every call site each time
 * the server grows one, so callers build a query and set only what they mean.
 *
 * Everything here is applied by the database. The list screen used to filter
 * consent and DNC in memory over a single page, which quietly disagreed with
 * the totals — anything the server can filter, it should.
 */
data class CandidateQuery(
    val search: String? = null,
    val roleId: String? = null,
    val status: String? = null,
    /** Multi-select: repeated as `?city=A&city=B`. */
    val cities: List<String> = emptyList(),
    val source: String? = null,
    val gender: String? = null,
    /** `"yes"` / `"no"` — has work experience at all. */
    val experience: String? = null,
    val graduationYears: List<String> = emptyList(),
    /** Experience buckets, e.g. `"0-1"`, `"2-5"`. Server-side bucketing. */
    val expYears: List<String> = emptyList(),
    val aiMatch: String? = null,
    val starredOnly: Boolean = false,
    val hasNotes: Boolean = false,
    val hasPhone: Boolean = false,
    val hasResume: Boolean = false,
    val hasEmail: Boolean = false,
    val dncOnly: Boolean = false,
    val noConsent: Boolean = false,
    val sortKey: String = "name",
    val sortDir: String = "asc",
    val page: Int = 1,
    val pageSize: Int = 50,
) {
    /** How many filters are active — drives the badge on the filter button. */
    val activeCount: Int
        get() = listOfNotNull(roleId, status, source, gender, experience, aiMatch).size +
            listOf(cities, graduationYears, expYears).count { it.isNotEmpty() } +
            listOf(starredOnly, hasNotes, hasPhone, hasResume, hasEmail, dncOnly, noConsent)
                .count { it }
}
