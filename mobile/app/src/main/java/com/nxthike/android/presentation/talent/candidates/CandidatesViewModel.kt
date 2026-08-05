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
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.domain.repository.HiringRepository
import dagger.hilt.android.lifecycle.HiltViewModel
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

/** Quick filters above the candidate list. */
enum class CandidateChip(val key: String, val label: String) {
    All("all", "All"),
    Starred("starred", "Starred"),
    Screening("screening", "In screening"),
    Interview("interview", "At interview"),
    Consent("consent", "Consent on file"),
    NoConsent("noconsent", "Consent missing"),
}

/** Filter-sheet selections that need a round trip to the API. */
data class CandidateFilters(
    val roleId: String? = null,
    val status: String? = null,
    val city: String? = null,
) {
    val count: Int get() = listOfNotNull(roleId, status, city).size
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
)

@OptIn(FlowPreview::class)
@HiltViewModel
class CandidatesViewModel @Inject constructor(
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(CandidatesState())
    val state: StateFlow<CandidatesState> = _state.asStateFlow()

    private val queryFlow = MutableStateFlow("")

    init {
        load()
        viewModelScope.launch { hiring.roles().onSuccess { r -> _state.update { it.copy(roles = r) } } }
        // Debounced so typing a phone number does not fire a request per keystroke.
        viewModelScope.launch { queryFlow.drop(1).debounce(300).collect { load() } }
    }

    fun setQuery(q: String) {
        _state.update { it.copy(query = q) }
        queryFlow.value = q
    }

    fun setChip(chip: CandidateChip) {
        _state.update { it.copy(chip = chip) }
        load()
    }

    fun setFilters(f: CandidateFilters) {
        _state.update { it.copy(filters = f) }
        load()
    }

    fun clearFilters() = setFilters(CandidateFilters())

    fun load() = viewModelScope.launch {
        val s = _state.value
        _state.update { it.copy(loading = true, error = null) }

        // A chip that maps to a pipeline stage is pushed to the API; the rest are
        // record-level predicates the API cannot express, so they filter locally.
        val statusFromChip = when (s.chip) {
            CandidateChip.Screening -> Stages.Screening.id
            CandidateChip.Interview -> Stages.Interview.id
            else -> null
        }

        when (
            val r = hiring.candidates(
                search = s.query.takeIf { it.isNotBlank() },
                roleId = s.filters.roleId,
                status = statusFromChip ?: s.filters.status,
                page = 1,
                pageSize = 100,
            )
        ) {
            is AppResult.Success -> {
                var items = r.data.items
                items = when (s.chip) {
                    CandidateChip.Starred -> items.filter { it.starred }
                    CandidateChip.Consent -> items.filter { CandidateTags.hasConsent(it.tags) }
                    CandidateChip.NoConsent -> items.filter { !CandidateTags.hasConsent(it.tags) }
                    else -> items
                }
                s.filters.city?.let { c -> items = items.filter { it.city.equals(c, true) } }
                _state.update {
                    it.copy(
                        loading = false, items = items, total = r.data.total,
                        cities = r.data.items.mapNotNull { c -> c.city?.takeIf { s2 -> s2.isNotBlank() } }
                            .distinct().sorted().take(20),
                    )
                }
            }
            is AppResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
        }
    }
}

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
    val saving: Boolean = false,
) {
    val consent: Boolean get() = CandidateTags.hasConsent(candidate?.tags)
    val dnc: Boolean get() = CandidateTags.hasDnc(candidate?.tags)
    val erasureRaised: Boolean get() = CandidateTags.erasureRaised(candidate?.tags)
    val skills: List<String>
        get() = Fmt.splitList(candidate?.relevantSkills) .ifEmpty { Fmt.splitList(candidate?.otherSkills) }
}

@HiltViewModel
class CandidateProfileViewModel @Inject constructor(
    private val hiring: HiringRepository,
    private val calls: CallRepository,
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
                    _state.value = CandidateProfileState(
                        loading = false,
                        candidate = r.data,
                        calls = logs,
                        notes = parseNotes(r.data.notes),
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
            listOfNotNull(CandidateTags.sourceOf(c.tags)?.let { "Sourced from $it" }, c.roleName)
                .joinToString(" · "),
            Fmt.parse(c.createdAt), null,
        )
        return out.sortedByDescending { it.at ?: LocalDateTime.MIN }
    }

    fun toggleStar() = patch { CandidatePatchDto(starred = !(it.starred)) }

    fun setStage(stageId: String, onDone: () -> Unit = {}) = patch(onDone) { CandidatePatchDto(status = stageId) }

    fun recordConsent(channel: String, onDone: () -> Unit = {}) = patch(onDone) { c ->
        val tags = c.tags.toMutableList()
        if (!CandidateTags.hasConsent(tags)) tags += CandidateTags.CONSENT
        CandidatePatchDto(
            tags = tags,
            notes = appendNote(c.notes, "Consent recorded via $channel"),
        )
    }

    fun raiseErasure(reason: String, onDone: () -> Unit = {}) = patch(onDone) { c ->
        val tags = c.tags.toMutableList()
        if (!CandidateTags.erasureRaised(tags)) tags += CandidateTags.ERASURE
        CandidatePatchDto(
            tags = tags,
            notes = appendNote(c.notes, "Erasure requested — $reason"),
        )
    }

    fun addNote(body: String, shared: Boolean, onDone: () -> Unit = {}) = patch(onDone) { c ->
        CandidatePatchDto(
            notes = appendNote(c.notes, if (shared) body else "[private] $body"),
        )
    }

    fun markDnc(onDone: () -> Unit = {}) = patch(onDone) { c ->
        val tags = c.tags.toMutableList()
        if (!CandidateTags.hasDnc(tags)) tags += CandidateTags.DNC
        CandidatePatchDto(tags = tags, notes = appendNote(c.notes, "Marked do-not-call"))
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
) {
    val valid: Boolean get() = name.isNotBlank() && phone.isNotBlank() && roleId.isNotBlank()
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
                            source = CandidateTags.sourceOf(c.tags) ?: "Naukri",
                            starred = c.starred,
                            consent = CandidateTags.hasConsent(c.tags),
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
            val tags = buildList {
                add(f.source)
                if (f.consent) add(CandidateTags.CONSENT)
            }
            val result = if (s.editingId != null) {
                hiring.patchCandidate(
                    s.editingId,
                    CandidatePatchDto(
                        roleId = f.roleId, roleName = f.roleName, status = f.status,
                        tags = tags, starred = f.starred, name = f.name, phone = f.phone,
                        email = f.email.ifBlank { null }, city = f.city.ifBlank { null },
                        latestRole = f.latestRole.ifBlank { null },
                    ),
                )
            } else {
                hiring.createCandidate(
                    CandidateWriteDto(
                        roleId = f.roleId, roleName = f.roleName, status = f.status,
                        tags = tags, starred = f.starred, name = f.name, phone = f.phone,
                        email = f.email.ifBlank { null }, city = f.city.ifBlank { null },
                        latestRole = f.latestRole.ifBlank { null },
                        latestCompany = f.latestCompany.ifBlank { null },
                        otherSkills = f.skills.ifBlank { null },
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
