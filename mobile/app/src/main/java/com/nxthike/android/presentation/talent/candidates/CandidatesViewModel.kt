package com.nxthike.android.presentation.talent.candidates

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.CandidateTags
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.data.remote.dto.CandidatePatchDto
import com.nxthike.android.data.remote.dto.CandidateWriteDto
import com.nxthike.android.data.remote.dto.CallLogDto
import com.nxthike.android.data.remote.dto.HiringRoleDto
import com.nxthike.android.core.model.Stage
import com.nxthike.android.core.model.StageMove
import com.nxthike.android.data.remote.dto.NoteDto
import com.nxthike.android.data.remote.dto.SavedSearchCreateDto
import com.nxthike.android.data.remote.dto.SavedSearchDto
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.domain.repository.CandidateQuery
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.domain.repository.WorkspaceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.Instant
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import com.nxthike.android.core.model.hasConsent
import com.nxthike.android.core.model.isDnc
import com.nxthike.android.core.model.sourceLabel

/** Quick filters above the candidate list. */
enum class CandidateChip(val key: String, val label: String) {
    All("all", "All"),
    Starred("starred", "Starred"),
    Screening("screening", "In screening"),
    Interview("interview", "At interview"),
    Consent("consent", "Consent on file"),
    NoConsent("noconsent", "Consent missing"),
}

/**
 * Filter-sheet selections. Every one of these is applied by the database.
 *
 * `city` stays singular because the sheet offers one; the query underneath takes
 * a list, so adding multi-select later needs no repository change.
 */
data class CandidateFilters(
    val roleId: String? = null,
    val status: String? = null,
    val city: String? = null,
    val source: String? = null,
    val gender: String? = null,
    /** `"yes"` / `"no"`. */
    val experience: String? = null,
    val graduationYear: String? = null,
    /** Server-side bucket: `0-1`, `1-3`, `3-5`, `5-7`, `7-10`, `10+`. */
    val expYears: String? = null,
    /** `Excellent` / `Good` / `Moderate` — the résumé-match grade. */
    val aiMatch: String? = null,
    val hasPhone: Boolean = false,
    val hasResume: Boolean = false,
    val hasEmail: Boolean = false,
    val hasNotes: Boolean = false,
    val dncOnly: Boolean = false,
) {
    val count: Int
        get() = listOfNotNull(
            roleId, status, city, source, gender, experience, graduationYear, expYears, aiMatch,
        ).size + listOf(hasPhone, hasResume, hasEmail, hasNotes, dncOnly).count { it }
}

data class CandidatesState(
    val loading: Boolean = true,
    val error: String? = null,
    val items: List<CandidateDto> = emptyList(),
    val total: Int = 0,
    val query: String = "",
    val chip: CandidateChip = CandidateChip.All,
    val filters: CandidateFilters = CandidateFilters(),
    val roles: List<HiringRoleDto> = emptyList(),
    val cities: List<String> = emptyList(),
    val graduationYears: List<String> = emptyList(),
    /** Shared with the web desk — the same rows, the same filter shape. */
    val savedSearches: List<SavedSearchDto> = emptyList(),
    /** Id of the saved search currently applied, if any. */
    val appliedSearchId: String? = null,
    /** Set while an inline edit (stage move, star) is in flight. */
    val busyId: String? = null,
)

@OptIn(FlowPreview::class)
@HiltViewModel
class CandidatesViewModel @Inject constructor(
    private val hiring: HiringRepository,
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(CandidatesState())
    val state: StateFlow<CandidatesState> = _state.asStateFlow()

    private val queryFlow = MutableStateFlow("")

    init {
        load()
        loadReferenceData()
        // Debounced so typing a phone number does not fire a request per keystroke.
        viewModelScope.launch { queryFlow.drop(1).debounce(300).collect { load() } }
    }

    /**
     * Requisitions, city facets and saved searches — everything the filter sheet
     * needs but the list itself does not.
     *
     * Called on construction and again whenever the sheet opens on empty state.
     * These used to be fire-and-forget calls in `init`: if the token was stale at
     * app start they failed silently and never retried, so the filter sheet
     * offered "Any" as the only requisition for the rest of the session.
     */
    fun loadReferenceData() = viewModelScope.launch {
        hiring.roles().onSuccess { r -> _state.update { it.copy(roles = r) } }
        hiring.facets().onSuccess { f ->
            _state.update { st ->
                st.copy(
                    cities = f.cities.map { it.value },
                    graduationYears = f.graduationYears.map { it.value }.sortedDescending(),
                )
            }
        }
        workspace.savedSearches().onSuccess { list ->
            _state.update { it.copy(savedSearches = list) }
        }
    }

    /** Pulls reference data only if a previous attempt left it empty. */
    fun ensureReferenceData() {
        val s = _state.value
        if (s.roles.isEmpty() || s.cities.isEmpty() || s.savedSearches.isEmpty()) loadReferenceData()
    }

    fun setQuery(q: String) {
        _state.update { it.copy(query = q) }
        queryFlow.value = q
    }

    fun setChip(chip: CandidateChip) {
        _state.update { it.copy(chip = chip) }
        load()
    }

    fun setFilters(f: CandidateFilters, fromSearchId: String? = null) {
        _state.update { it.copy(filters = f, appliedSearchId = fromSearchId) }
        load()
    }

    fun clearFilters() = setFilters(CandidateFilters())

    /**
     * Loads one page, with every filter the server can apply pushed to it.
     *
     * This used to fetch a page and then filter starred/consent in memory, which
     * meant the count under the chip described the page rather than the search —
     * "Consent missing: 4" when the database held hundreds.
     */
    fun load() = viewModelScope.launch {
        val s = _state.value
        _state.update { it.copy(loading = true, error = null) }

        val statusFromChip = when (s.chip) {
            CandidateChip.Screening -> Stages.Screening.id
            CandidateChip.Interview -> Stages.Interview.id
            else -> null
        }

        val query = CandidateQuery(
            search = s.query.takeIf { it.isNotBlank() },
            roleId = s.filters.roleId,
            status = statusFromChip ?: s.filters.status,
            cities = listOfNotNull(s.filters.city),
            source = s.filters.source,
            gender = s.filters.gender,
            experience = s.filters.experience,
            graduationYears = listOfNotNull(s.filters.graduationYear),
            expYears = listOfNotNull(s.filters.expYears),
            aiMatch = s.filters.aiMatch,
            starredOnly = s.chip == CandidateChip.Starred,
            hasNotes = s.filters.hasNotes,
            hasPhone = s.filters.hasPhone,
            hasResume = s.filters.hasResume,
            hasEmail = s.filters.hasEmail,
            dncOnly = s.filters.dncOnly,
            noConsent = s.chip == CandidateChip.NoConsent,
            pageSize = 100,
        )

        when (val r = hiring.search(query)) {
            is AppResult.Success -> {
                // The server exposes `noConsent` but has no `hasConsent` inverse,
                // so this one chip narrows the page rather than the query.
                val items =
                    if (s.chip == CandidateChip.Consent) r.data.items.filter { it.consentAt != null }
                    else r.data.items
                _state.update { it.copy(loading = false, items = items, total = r.data.total) }
            }
            is AppResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
        }
    }

    /**
     * Moves a candidate's stage from the list, without opening the profile.
     *
     * Writes through [StageMove] so the record left behind is identical to the
     * one the pipeline board writes, and updates the row in place — re-running
     * the search would re-sort and could drop the row out of the current filter
     * under the user's finger.
     */
    fun changeStage(
        candidate: CandidateDto,
        to: Stage,
        note: String = "",
        dropReason: String? = null,
        onDone: () -> Unit = {},
    ) = viewModelScope.launch {
        _state.update { it.copy(busyId = candidate.id) }
        when (val r = hiring.patchCandidate(candidate.id, StageMove.patch(candidate, to, note, dropReason))) {
            is AppResult.Success -> {
                _state.update { st ->
                    st.copy(
                        busyId = null,
                        items = st.items.map { if (it.id == candidate.id) r.data else it },
                    )
                }
                onDone()
            }
            is AppResult.Error -> _state.update { it.copy(busyId = null, error = r.message) }
        }
    }

    fun toggleStar(candidate: CandidateDto) = viewModelScope.launch {
        _state.update { it.copy(busyId = candidate.id) }
        hiring.patchCandidate(candidate.id, CandidatePatchDto(starred = !candidate.starred))
            .onSuccess { updated ->
                _state.update { st ->
                    st.copy(busyId = null, items = st.items.map { if (it.id == updated.id) updated else it })
                }
            }
            .onError { e -> _state.update { it.copy(busyId = null, error = e.message) } }
    }

    /* ---- Saved searches ------------------------------------------------ */

    /**
     * Saves the current query and filters under a name.
     *
     * Written in the web desk's exact filter shape — including its `"all"` and
     * `""` sentinels — so a search saved on a phone shows up correctly in the
     * browser and vice versa. They are the same rows in the same table.
     */
    fun saveCurrentSearch(name: String, onDone: () -> Unit = {}) = viewModelScope.launch {
        val s = _state.value
        val res = workspace.saveSearch(
            SavedSearchCreateDto(name = name.trim(), filters = s.toSavedFilters(), shared = false),
        )
        res.onSuccess { created ->
            _state.update {
                it.copy(savedSearches = it.savedSearches + created, appliedSearchId = created.id)
            }
            onDone()
        }.onError { e -> _state.update { it.copy(error = e.message) } }
    }

    fun applySavedSearch(search: SavedSearchDto) {
        val f = search.filters
        fun str(key: String): String? =
            (f[key] as? String)?.trim()?.takeIf { it.isNotEmpty() && it != "all" }
        fun flag(key: String): Boolean = f[key] == true

        _state.update {
            it.copy(
                query = str("query").orEmpty(),
                chip = if (flag("starredOnly")) CandidateChip.Starred
                else if (flag("noConsent")) CandidateChip.NoConsent
                else CandidateChip.All,
            )
        }
        queryFlow.value = str("query").orEmpty()
        setFilters(
            CandidateFilters(
                roleId = str("roleId"),
                status = str("status"),
                city = str("city"),
                source = str("source"),
                gender = str("gender"),
                experience = str("experience"),
                graduationYear = str("graduationYear"),
                expYears = str("expYears"),
                aiMatch = str("aiMatch"),
                hasPhone = flag("hasPhone"),
                hasResume = flag("hasResume"),
                hasEmail = flag("hasEmail"),
                hasNotes = flag("hasNotes"),
                dncOnly = flag("dncOnly"),
            ),
            fromSearchId = search.id,
        )
    }

    /**
     * Filter keys in a saved search that this app cannot apply.
     *
     * A chip that silently applies half a search is worse than one that says so,
     * so the screen shows this alongside the applied search.
     */
    fun unsupportedKeys(search: SavedSearchDto): List<String> {
        val supported = setOf(
            "query", "roleId", "status", "city", "source", "gender", "experience",
            "graduationYear", "expYears", "aiMatch", "starredOnly", "hasNotes",
            "hasPhone", "hasEmail", "hasResume", "dncOnly", "noConsent",
            "sortKey", "sortDir",
        )
        return search.filters.entries
            .filter { (k, v) ->
                k !in supported && v != null && v != false && v != "" && v != "all"
            }
            .map { it.key }
    }

    fun deleteSavedSearch(id: String) = viewModelScope.launch {
        workspace.deleteSavedSearch(id).onSuccess {
            _state.update { st ->
                st.copy(
                    savedSearches = st.savedSearches.filterNot { it.id == id },
                    appliedSearchId = st.appliedSearchId?.takeIf { it != id },
                )
            }
        }
    }
}

/**
 * The current search as the web desk stores it.
 *
 * The sentinels matter: the desk writes `"all"` for an unset enum and `""` for an
 * unset string, and its reader renders whatever it finds. Writing `null` here
 * would put empty chips in the browser's filter bar.
 */
private fun CandidatesState.toSavedFilters(): Map<String, Any?> = mapOf(
    "query" to query,
    "status" to (filters.status ?: "all"),
    "roleId" to filters.roleId.orEmpty(),
    "experience" to (filters.experience ?: "all"),
    "city" to filters.city.orEmpty(),
    "source" to filters.source.orEmpty(),
    "gender" to (filters.gender ?: "all"),
    "graduationYear" to (filters.graduationYear ?: "all"),
    "expYears" to (filters.expYears ?: "all"),
    "aiMatch" to (filters.aiMatch ?: "all"),
    "starredOnly" to (chip == CandidateChip.Starred),
    "hasNotes" to filters.hasNotes,
    "hasPhone" to filters.hasPhone,
    "hasEmail" to filters.hasEmail,
    "hasResume" to filters.hasResume,
    "dncOnly" to filters.dncOnly,
    "noConsent" to (chip == CandidateChip.NoConsent),
    "sortKey" to "name",
    "sortDir" to "asc",
)

/* ------------------------------------------------------------------ *
 *  Candidate profile                                                 *
 * ------------------------------------------------------------------ */

/** A note parsed out of the candidate's free-text notes blob. */
data class ParsedNote(val author: String, val body: String, val at: LocalDateTime?, val system: Boolean)

/** One row of the activity timeline, merged from calls and record metadata. */
data class TimelineEntry(
    val kind: Kind,
    val title: String,
    val detail: String,
    val at: LocalDateTime?,
    val who: String?,
) {
    enum class Kind { Call, Note, Stage, Consent, Created, Message }
}

data class CandidateProfileState(
    val loading: Boolean = true,
    val error: String? = null,
    val candidate: CandidateDto? = null,
    val calls: List<CallLogDto> = emptyList(),
    val notes: List<ParsedNote> = emptyList(),
    /** Structured notes from `/api/workspace/notes` — author and visibility intact. */
    val teamNotes: List<NoteDto> = emptyList(),
    /** True when an erasure request row exists for this candidate. */
    val erasureOnFile: Boolean = false,
    val saving: Boolean = false,
) {
    /**
     * Consent, DNC and erasure all read the real columns first.
     *
     * The tag fallback is for records an older build of this app wrote before
     * these columns were wired: it tagged `consent` / `dnc` / `erasure_requested`
     * instead, and the web desk has never been able to see those. Reading both
     * means nothing already captured disappears; every *write* now goes to the
     * column, so the fallback drains over time.
     */
    val consent: Boolean
        get() = candidate?.hasConsent == true

    val consentChannel: String? get() = candidate?.consentChannel

    val dnc: Boolean
        get() = candidate?.isDnc == true

    val erasureRaised: Boolean
        get() = erasureOnFile || CandidateTags.erasureRaised(candidate?.tags)

    /** Set when the server withheld contact details for this persona. */
    val piiMasked: Boolean get() = candidate?.piiMasked == true

    val skills: List<String>
        get() = Fmt.splitList(candidate?.relevantSkills) .ifEmpty { Fmt.splitList(candidate?.otherSkills) }
}

@HiltViewModel
class CandidateProfileViewModel @Inject constructor(
    private val hiring: HiringRepository,
    private val calls: CallRepository,
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(CandidateProfileState())
    val state: StateFlow<CandidateProfileState> = _state.asStateFlow()

    private var currentId: String? = null

    fun load(id: String, force: Boolean = false) {
        if (id == currentId && !force && !_state.value.loading) return
        currentId = id
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            when (val r = hiring.getCandidate(id)) {
                is AppResult.Success -> {
                    val logs = calls.list(candidateId = id, pageSize = 50).getOrNull()?.items.orEmpty()
                    val team = workspace.notes(id).getOrNull().orEmpty()
                    // `/erasures` has no per-candidate filter, so the register is
                    // read whole and matched here — the same thing the web does.
                    val erasure = workspace.erasures().getOrNull()
                        .orEmpty().any { it.candidateId == id }
                    _state.value = CandidateProfileState(
                        loading = false,
                        candidate = r.data,
                        calls = logs,
                        notes = parseNotes(r.data.notes),
                        teamNotes = team,
                        erasureOnFile = erasure,
                    )
                }
                is AppResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
            }
        }
    }

    /**
     * The API stores notes as one growing text blob (the call API appends
     * `[timestamp] Call: disposition — note` lines). We split it back into cards
     * so the Notes tab reads like a conversation rather than a log file.
     */
    private fun parseNotes(raw: String): List<ParsedNote> {
        if (raw.isBlank()) return emptyList()
        val stampRe = Regex("""^\[(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2})]\s*(.*)$""")
        return raw.lines()
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .map { line ->
                val m = stampRe.find(line)
                if (m != null) {
                    val at = Fmt.parse(m.groupValues[1].replace(' ', 'T'))
                    val body = m.groupValues[2]
                    ParsedNote(
                        author = if (body.startsWith("Call:")) "Call log" else "Note",
                        body = body.removePrefix("Call:").trim().ifBlank { body },
                        at = at,
                        system = body.startsWith("Call:"),
                    )
                } else {
                    ParsedNote("Note", line, null, false)
                }
            }
            .reversed()
    }

    fun timeline(): List<TimelineEntry> {
        val s = _state.value
        val c = s.candidate ?: return emptyList()
        val out = mutableListOf<TimelineEntry>()

        s.calls.forEach { log ->
            val d = com.nxthike.android.core.model.Dispositions.display(log.disposition)
            out += TimelineEntry(
                TimelineEntry.Kind.Call,
                "Call · ${d.label}",
                listOfNotNull(
                    Fmt.duration(log.durationSeconds).takeIf { log.durationSeconds != null },
                    log.note.takeIf { it.isNotBlank() },
                ).joinToString(" · "),
                Fmt.parse(log.calledAt),
                log.userEmail,
            )
        }
        s.notes.filter { !it.system && it.at != null }.forEach {
            out += TimelineEntry(TimelineEntry.Kind.Note, "Note added", it.body, it.at, it.author)
        }
        if (s.consent) {
            out += TimelineEntry(
                TimelineEntry.Kind.Consent, "Consent recorded",
                "Retained 24 months from last activity", Fmt.parse(c.updatedAt), null,
            )
        }
        out += TimelineEntry(
            TimelineEntry.Kind.Created, "Candidate created",
            listOfNotNull(c.sourceLabel?.let { "Sourced from $it" }, c.roleName)
                .joinToString(" · "),
            Fmt.parse(c.createdAt), null,
        )
        return out.sortedByDescending { it.at ?: LocalDateTime.MIN }
    }

    fun toggleStar() = patch { CandidatePatchDto(starred = !(it.starred)) }

    /**
     * Moves the stage from the profile.
     *
     * Through [StageMove], so this leaves the same trail as the board and the
     * list. It used to write a bare status, which meant the same move produced a
     * different record depending on which screen made it.
     */
    fun changeStage(
        to: Stage,
        note: String = "",
        dropReason: String? = null,
        onDone: () -> Unit = {},
    ) = patch(onDone) { c -> StageMove.patch(c, to, note, dropReason) }

    /**
     * Records DPDP consent on the candidate's own columns.
     *
     * The timestamp is a UTC instant, matching what the web desk sends. A local
     * `LocalDateTime` would be written without a zone and read back as UTC,
     * shifting every consent record by the device's offset.
     */
    fun recordConsent(channel: String, onDone: () -> Unit = {}) = patch(onDone) { c ->
        CandidatePatchDto(
            consentAt = Instant.now().toString(),
            consentChannel = channel,
            notes = appendNote(c.notes, "Consent recorded via $channel"),
        )
    }

    /**
     * Raises a DPDP erasure request.
     *
     * This creates a row in the workspace's erasure register, which is what the
     * admin queue reads and what `/compliance` counts. Tagging the candidate — as
     * this app used to — left the request invisible to everyone but this screen.
     */
    fun raiseErasure(reason: String, onDone: () -> Unit = {}) {
        val c = _state.value.candidate ?: return
        viewModelScope.launch {
            _state.update { it.copy(saving = true) }
            when (val r = workspace.raiseErasure(c.id, reason)) {
                is AppResult.Success -> {
                    _state.update { it.copy(saving = false, erasureOnFile = true) }
                    onDone()
                }
                is AppResult.Error -> _state.update { it.copy(saving = false, error = r.message) }
            }
        }
    }

    /**
     * Adds a note as a note — author, visibility and timestamp as columns.
     *
     * Appending to the candidate's free-text `notes` blob, which is what this
     * used to do, produced something the desk could only render as a log line
     * and could never attribute or scope to a private audience.
     */
    fun addNote(body: String, shared: Boolean, onDone: () -> Unit = {}) {
        val c = _state.value.candidate ?: return
        viewModelScope.launch {
            _state.update { it.copy(saving = true) }
            when (val r = workspace.addNote(c.id, body, shared)) {
                is AppResult.Success -> {
                    _state.update { it.copy(saving = false, teamNotes = listOf(r.data) + it.teamNotes) }
                    onDone()
                }
                is AppResult.Error -> _state.update { it.copy(saving = false, error = r.message) }
            }
        }
    }

    /**
     * Flags the record do-not-call, permanently, for every surface.
     *
     * The column is the durable flag. A `do_not_call` disposition also blocks the
     * dialer, but only until the next call log replaces `lastDisposition` — so
     * the column is what actually keeps the number suppressed.
     */
    fun markDnc(onDone: () -> Unit = {}) = patch(onDone) { c ->
        CandidatePatchDto(dnc = true, notes = appendNote(c.notes, "Marked do-not-call"))
    }

    private fun appendNote(existing: String, line: String): String {
        val stamped = "[${Fmt.toIso(LocalDateTime.now()).take(16)}] $line"
        return (existing.trimEnd() + "\n" + stamped).trim()
    }

    private fun patch(onDone: () -> Unit = {}, build: (CandidateDto) -> CandidatePatchDto) {
        val c = _state.value.candidate ?: return
        viewModelScope.launch {
            _state.update { it.copy(saving = true) }
            when (val r = hiring.patchCandidate(c.id, build(c))) {
                is AppResult.Success -> {
                    _state.update {
                        it.copy(saving = false, candidate = r.data, notes = parseNotes(r.data.notes))
                    }
                    onDone()
                }
                is AppResult.Error -> _state.update { it.copy(saving = false, error = r.message) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  Add / edit                                                        *
 * ------------------------------------------------------------------ */

data class CandidateForm(
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val city: String = "",
    val latestRole: String = "",
    val latestCompany: String = "",
    val skills: String = "",
    val availability: String = "",
    val roleId: String = "",
    val roleName: String = "",
    val status: String = Stages.Sourced.id,
    val source: String = "Naukri",
    val starred: Boolean = false,
    val consent: Boolean = false,
    /** Lakhs per annum as typed; parsed to rupees on save. */
    val currentCtc: String = "",
    val expectedCtc: String = "",
    val noticeDays: String = "",
) {
    val valid: Boolean get() = name.isNotBlank() && phone.isNotBlank() && roleId.isNotBlank()

    /** What still has to be filled in, for a message that names the gap. */
    val missing: List<String>
        get() = buildList {
            if (name.isBlank()) add("full name")
            if (phone.isBlank()) add("mobile number")
            if (roleId.isBlank()) add("requisition")
        }
}

/** "8.5" → 850000. Recruiters quote comp in lakhs; the API stores rupees. */
internal fun lakhsToRupees(text: String): Double? =
    text.trim().replace(",", "").toDoubleOrNull()?.takeIf { it > 0 }?.times(100_000)

internal fun rupeesToLakhs(amount: Double?): String {
    val v = amount ?: return ""
    val l = v / 100_000
    return if (l % 1.0 == 0.0) l.toLong().toString() else "%.2f".format(l).trimEnd('0').trimEnd('.')
}

data class CandidateEditState(
    val loading: Boolean = false,
    val saving: Boolean = false,
    val error: String? = null,
    val form: CandidateForm = CandidateForm(),
    val roles: List<HiringRoleDto> = emptyList(),
    val duplicate: CandidateDto? = null,
    val editingId: String? = null,
)

@OptIn(FlowPreview::class)
@HiltViewModel
class CandidateEditViewModel @Inject constructor(
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(CandidateEditState())
    val state: StateFlow<CandidateEditState> = _state.asStateFlow()

    private val phoneFlow = MutableStateFlow("")

    init {
        viewModelScope.launch {
            hiring.roles().onSuccess { roles ->
                _state.update { s ->
                    s.copy(
                        roles = roles,
                        form = if (s.form.roleId.isBlank() && roles.isNotEmpty()) {
                            s.form.copy(roleId = roles.first().id, roleName = roles.first().name)
                        } else {
                            s.form
                        },
                    )
                }
            }
        }
        // Dedupe runs as you type — the spec checks phone before anything is saved.
        viewModelScope.launch {
            phoneFlow.drop(1).debounce(400).collect { phone ->
                val digits = phone.filter { it.isDigit() }
                if (digits.length < 6) { _state.update { it.copy(duplicate = null) }; return@collect }
                val hit = hiring.candidates(digits.takeLast(10), null, null, 1, 5).getOrNull()
                    ?.items?.firstOrNull { c ->
                        c.id != _state.value.editingId &&
                            c.phone?.filter { ch -> ch.isDigit() }?.takeLast(10) == digits.takeLast(10)
                    }
                _state.update { it.copy(duplicate = hit) }
            }
        }
    }

    fun loadForEdit(id: String) {
        if (id == "new") return
        viewModelScope.launch {
            _state.update { it.copy(loading = true, editingId = id) }
            hiring.getCandidate(id).onSuccess { c ->
                _state.update {
                    it.copy(
                        loading = false,
                        editingId = id,
                        form = CandidateForm(
                            name = c.name.orEmpty(),
                            phone = c.phone.orEmpty(),
                            email = c.email.orEmpty(),
                            city = c.city.orEmpty(),
                            latestRole = c.latestRole.orEmpty(),
                            latestCompany = c.latestCompany.orEmpty(),
                            skills = (c.relevantSkills ?: c.otherSkills).orEmpty(),
                            availability = c.availability.orEmpty(),
                            roleId = c.roleId,
                            roleName = c.roleName,
                            status = c.status,
                            source = c.sourceLabel ?: "Naukri",
                            starred = c.starred,
                            consent = c.hasConsent,
                            currentCtc = rupeesToLakhs(c.currentCtc),
                            expectedCtc = rupeesToLakhs(c.expectedCtc),
                            noticeDays = c.noticeDays?.toString().orEmpty(),
                        ),
                    )
                }
            }.onError { e -> _state.update { it.copy(loading = false, error = e.message) } }
        }
    }

    fun update(block: (CandidateForm) -> CandidateForm) {
        _state.update { it.copy(form = block(it.form)) }
        phoneFlow.value = _state.value.form.phone
    }

    fun pickRole(role: HiringRoleDto) =
        update { it.copy(roleId = role.id, roleName = role.name) }

    fun save(onDone: (String) -> Unit) {
        val s = _state.value
        val f = s.form
        if (!f.valid) return
        viewModelScope.launch {
            _state.update { it.copy(saving = true, error = null) }
            // Source and consent are columns, not tags. Consent especially:
            // ticking the box on this form has to produce the same record the
            // web desk writes, or the candidate reads as "no consent" there.
            val consentAt = if (f.consent) Instant.now().toString() else null
            val consentChannel = if (f.consent) "form" else null
            val result = if (s.editingId != null) {
                hiring.patchCandidate(
                    s.editingId,
                    CandidatePatchDto(
                        roleId = f.roleId, roleName = f.roleName, status = f.status,
                        starred = f.starred, name = f.name, phone = f.phone,
                        email = f.email.ifBlank { null }, city = f.city.ifBlank { null },
                        latestRole = f.latestRole.ifBlank { null },
                        latestCompany = f.latestCompany.ifBlank { null },
                        relevantSkills = f.skills.ifBlank { null },
                        availability = f.availability.ifBlank { null },
                        source = f.source.ifBlank { null },
                        currentCtc = lakhsToRupees(f.currentCtc),
                        expectedCtc = lakhsToRupees(f.expectedCtc),
                        noticeDays = f.noticeDays.trim().toIntOrNull(),
                        consentAt = consentAt, consentChannel = consentChannel,
                    ),
                )
            } else {
                hiring.createCandidate(
                    CandidateWriteDto(
                        roleId = f.roleId, roleName = f.roleName, status = f.status,
                        starred = f.starred, name = f.name, phone = f.phone,
                        email = f.email.ifBlank { null }, city = f.city.ifBlank { null },
                        latestRole = f.latestRole.ifBlank { null },
                        latestCompany = f.latestCompany.ifBlank { null },
                        otherSkills = f.skills.ifBlank { null },
                        availability = f.availability.ifBlank { null },
                        source = f.source.ifBlank { null },
                        currentCtc = lakhsToRupees(f.currentCtc),
                        expectedCtc = lakhsToRupees(f.expectedCtc),
                        noticeDays = f.noticeDays.trim().toIntOrNull(),
                        consentAt = consentAt, consentChannel = consentChannel,
                    ),
                )
            }
            when (result) {
                is AppResult.Success -> { _state.update { it.copy(saving = false) }; onDone(result.data.id) }
                is AppResult.Error -> _state.update { it.copy(saving = false, error = result.message) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  Dedupe / merge                                                    *
 * ------------------------------------------------------------------ */

data class MergeField(val label: String, val left: String, val right: String, val key: String)

data class MergeState(
    val loading: Boolean = true,
    val error: String? = null,
    val primary: CandidateDto? = null,
    val duplicate: CandidateDto? = null,
    val fields: List<MergeField> = emptyList(),
    /** field key → "left" or "right". */
    val picks: Map<String, String> = emptyMap(),
    val merging: Boolean = false,
)

@HiltViewModel
class MergeViewModel @Inject constructor(
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(MergeState())
    val state: StateFlow<MergeState> = _state.asStateFlow()

    fun load(primaryId: String) = viewModelScope.launch {
        _state.update { it.copy(loading = true, error = null) }
        val primary = hiring.getCandidate(primaryId).getOrNull()
        if (primary == null) {
            _state.update { it.copy(loading = false, error = "Couldn't load that record.") }
            return@launch
        }
        val digits = primary.phone?.filter { it.isDigit() }?.takeLast(10).orEmpty()
        val dup = if (digits.length >= 6) {
            hiring.candidates(digits, null, null, 1, 10).getOrNull()?.items
                ?.firstOrNull { it.id != primary.id }
        } else null

        _state.value = MergeState(
            loading = false,
            primary = primary,
            duplicate = dup,
            fields = if (dup == null) emptyList() else buildFields(primary, dup),
            picks = emptyMap(),
        )
    }

    private fun buildFields(a: CandidateDto, b: CandidateDto) = listOf(
        MergeField("Full name", a.name.orEmpty(), b.name.orEmpty(), "name"),
        MergeField("Phone", a.phone.orEmpty(), b.phone.orEmpty(), "phone"),
        MergeField("Email", a.email.orEmpty(), b.email.orEmpty(), "email"),
        MergeField("City", a.city.orEmpty(), b.city.orEmpty(), "city"),
        MergeField("Current role", a.latestRole.orEmpty(), b.latestRole.orEmpty(), "latestRole"),
        MergeField("Requisition", a.roleName, b.roleName, "roleName"),
    ).filter { it.left.isNotBlank() || it.right.isNotBlank() }

    fun pick(key: String, side: String) =
        _state.update { it.copy(picks = it.picks + (key to side)) }

    fun sideFor(key: String) = _state.value.picks[key] ?: "left"

    /**
     * Applies the surviving values to the primary record and deletes the
     * duplicate. Nothing is destroyed until the write succeeds.
     */
    fun merge(onDone: (String) -> Unit) {
        val s = _state.value
        val primary = s.primary ?: return
        val dup = s.duplicate ?: return
        viewModelScope.launch {
            _state.update { it.copy(merging = true) }
            fun pickValue(key: String, l: String, r: String) = if (sideFor(key) == "right") r else l
            val patch = CandidatePatchDto(
                name = pickValue("name", primary.name.orEmpty(), dup.name.orEmpty()).ifBlank { null },
                phone = pickValue("phone", primary.phone.orEmpty(), dup.phone.orEmpty()).ifBlank { null },
                email = pickValue("email", primary.email.orEmpty(), dup.email.orEmpty()).ifBlank { null },
                city = pickValue("city", primary.city.orEmpty(), dup.city.orEmpty()).ifBlank { null },
                latestRole = pickValue("latestRole", primary.latestRole.orEmpty(), dup.latestRole.orEmpty()).ifBlank { null },
                tags = (primary.tags + dup.tags).distinct(),
                notes = listOf(primary.notes, dup.notes).filter { it.isNotBlank() }.joinToString("\n"),
            )
            when (hiring.patchCandidate(primary.id, patch)) {
                is AppResult.Success -> {
                    hiring.deleteCandidate(dup.id)
                    _state.update { it.copy(merging = false) }
                    onDone(primary.id)
                }
                is AppResult.Error -> _state.update { it.copy(merging = false, error = "Merge failed. Nothing was deleted.") }
            }
        }
    }
}
