package com.nxthike.android.presentation.calls

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.CandidateTags
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.local.OutboxEntry
import com.nxthike.android.data.local.OutboxStore
import com.nxthike.android.data.remote.dto.CallLogCreateDto
import com.nxthike.android.data.remote.dto.CallLogDto
import com.nxthike.android.data.remote.dto.CallQueueItemDto
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.domain.repository.HiringRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.Duration
import java.time.LocalDateTime
import java.util.UUID
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import com.nxthike.android.core.model.hasConsent
import com.nxthike.android.core.model.isDnc

/** A row in the dial list, decorated with everything the queue card renders. */
data class QueueRow(
    val candidateId: String,
    val name: String,
    val phone: String?,
    val roleId: String,
    val roleName: String,
    val status: String,
    val lastDisposition: String?,
    val lastCalledAt: LocalDateTime?,
    val starred: Boolean,
    val city: String?,
    val email: String?,
    val notes: String,
) {
    /** A logged `do_not_call` locks the number — the queue shows it but will not dial it. */
    val dnc: Boolean get() = lastDisposition == "do_not_call"
    val attemptLabel: String get() = if (lastCalledAt == null) "FIRST ATTEMPT" else "LAST ${Fmt.ago(lastCalledAt).uppercase()}"
}

data class QueueState(
    val loading: Boolean = true,
    val error: String? = null,
    val rows: List<QueueRow> = emptyList(),
    val total: Int = 0,
    val doneToday: Int = 0,
    val targetToday: Int = 0,
    val connectRate: String = "0%",
    val roleFilter: String? = null,
    val roleLabel: String = "All roles",
    val search: String = "",
) {
    val empty: Boolean get() = !loading && error == null && rows.isEmpty()
    val progress: Float get() = if (targetToday <= 0) 0f else doneToday.toFloat() / targetToday
}

/** Everything the pre-call card and disposition sheet need for one candidate. */
data class PreCallState(
    val loading: Boolean = true,
    val row: QueueRow? = null,
    val candidate: CandidateDto? = null,
    val lastCall: CallLogDto? = null,
    val position: Int = 0,
    val queueSize: Int = 0,
) {
    /**
     * Consent and DNC read the candidate's own columns, which the pre-call card
     * has because it fetches the full record. The tag fallback covers records an
     * older build wrote before these columns were used; `row.dnc` covers the case
     * where the last logged disposition was `do_not_call` but the column was
     * never set — a call logged by a build that only wrote the tag.
     */
    val consent: Boolean
        get() = candidate?.hasConsent == true

    val dnc: Boolean
        get() = candidate?.isDnc == true || row?.dnc == true

    /** The server withheld the phone number for this persona — it is not dialable. */
    val piiMasked: Boolean get() = candidate?.piiMasked == true
}

/** Draft outcome being composed in the disposition sheet. */
data class DispositionDraft(
    val disposition: String? = null,
    val durationText: String = "0:00",
    val note: String = "",
    val nextAction: String = "none",
    val callbackAt: LocalDateTime? = null,
    val remind: Boolean = true,
) {
    val valid: Boolean get() = disposition != null
}

/** Recap shown when the queue runs out. */
data class QueueSummary(
    val calls: Int = 0,
    val connected: Int = 0,
    val callbacks: Int = 0,
    val mix: List<Pair<String, Int>> = emptyList(),
) {
    val connectRate: String get() = Fmt.percent(connected, calls)
}

@HiltViewModel
class CallFlowViewModel @Inject constructor(
    private val calls: CallRepository,
    private val hiring: HiringRepository,
    private val outbox: OutboxStore,
) : ViewModel() {

    private val _queue = MutableStateFlow(QueueState())
    val queue: StateFlow<QueueState> = _queue.asStateFlow()

    private val _preCall = MutableStateFlow(PreCallState())
    val preCall: StateFlow<PreCallState> = _preCall.asStateFlow()

    private val _draft = MutableStateFlow(DispositionDraft())
    val draft: StateFlow<DispositionDraft> = _draft.asStateFlow()

    private val _summary = MutableStateFlow(QueueSummary())
    val summary: StateFlow<QueueSummary> = _summary.asStateFlow()

    private val _history = MutableStateFlow<List<CallLogDto>>(emptyList())
    val history: StateFlow<List<CallLogDto>> = _history.asStateFlow()

    private val _historyLoading = MutableStateFlow(true)
    val historyLoading: StateFlow<Boolean> = _historyLoading.asStateFlow()

    private val _callbacks = MutableStateFlow<List<CallLogDto>>(emptyList())
    val callbacks: StateFlow<List<CallLogDto>> = _callbacks.asStateFlow()

    /** Index into [QueueState.rows] for the candidate currently being worked. */
    private var cursor = 0

    /** Wall-clock moment the dial intent fired; the only duration signal we have. */
    private var dialStartedAt: LocalDateTime? = null

    /** Outcomes logged in this sitting, for the completion summary. */
    private val loggedThisRun = mutableListOf<String>()

    init { loadQueue() }

    // ---- Queue ---------------------------------------------------------

    fun loadQueue(roleId: String? = _queue.value.roleFilter, roleLabel: String? = null) {
        viewModelScope.launch {
            _queue.update { it.copy(loading = true, error = null, roleFilter = roleId, roleLabel = roleLabel ?: it.roleLabel) }
            val search = _queue.value.search.takeIf { it.isNotBlank() }
            when (val r = calls.queue(roleId = roleId, search = search, pageSize = 100)) {
                is AppResult.Success -> {
                    val rows = r.data.items.map { it.toRow() }
                    _queue.update { s -> s.copy(loading = false, rows = rows, total = r.data.total, targetToday = r.data.total) }
                    refreshStats()
                }
                is AppResult.Error -> _queue.update { it.copy(loading = false, error = r.message) }
            }
        }
    }

    fun setSearch(q: String) {
        _queue.update { it.copy(search = q) }
        loadQueue()
    }

    private suspend fun refreshStats() {
        calls.stats().onSuccess { s ->
            val reached = Dispositions.ALL
                .filter { it.category == com.nxthike.android.core.model.DispositionCategory.Reached }
                .sumOf { s.byDisposition[it.id] ?: 0 }
            _queue.update {
                it.copy(
                    doneToday = s.todayCount,
                    connectRate = Fmt.percent(reached, s.totalCount),
                    targetToday = maxOf(it.total, s.todayCount),
                )
            }
        }
    }

    private fun CallQueueItemDto.toRow() = QueueRow(
        candidateId = candidateId,
        name = name?.takeIf { it.isNotBlank() } ?: "Unnamed candidate",
        phone = phone,
        roleId = roleId,
        roleName = roleName,
        status = status,
        lastDisposition = lastDisposition,
        lastCalledAt = Fmt.parse(lastCalledAt),
        starred = starred,
        city = city,
        email = email,
        notes = notes,
    )

    // ---- Pre-call ------------------------------------------------------

    /** Opens the pre-call card for a queue position. */
    fun openAt(index: Int) {
        val rows = _queue.value.rows
        if (rows.isEmpty()) return
        cursor = index.coerceIn(0, rows.lastIndex)
        loadPreCall(rows[cursor])
    }

    /** Opens the pre-call card for a candidate reached from outside the queue. */
    fun openCandidate(candidateId: String) {
        val rows = _queue.value.rows
        val idx = rows.indexOfFirst { it.candidateId == candidateId }
        if (idx >= 0) {
            openAt(idx)
        } else {
            cursor = -1
            _preCall.value = PreCallState(loading = true, position = 0, queueSize = 0)
            viewModelScope.launch { hydrate(candidateId, null) }
        }
    }

    private fun loadPreCall(row: QueueRow) {
        _preCall.value = PreCallState(
            loading = true, row = row,
            position = cursor + 1, queueSize = _queue.value.rows.size,
        )
        _draft.value = DispositionDraft()
        viewModelScope.launch { hydrate(row.candidateId, row) }
    }

    private suspend fun hydrate(candidateId: String, row: QueueRow?) {
        val candidate = hiring.getCandidate(candidateId).getOrNull()
        val last = calls.list(candidateId = candidateId, pageSize = 1).getOrNull()?.items?.firstOrNull()
        val resolved = row ?: candidate?.let {
            QueueRow(
                candidateId = it.id,
                name = it.name?.takeIf { n -> n.isNotBlank() } ?: "Unnamed candidate",
                phone = it.phone, roleId = it.roleId, roleName = it.roleName, status = it.status,
                lastDisposition = last?.disposition, lastCalledAt = Fmt.parse(last?.calledAt),
                starred = it.starred, city = it.city, email = it.email, notes = it.notes,
            )
        }
        _preCall.update {
            it.copy(loading = false, row = resolved ?: it.row, candidate = candidate, lastCall = last)
        }
    }

    /** Talking points assembled from what the record actually knows. */
    fun talkingPoints(state: PreCallState): List<String> {
        val c = state.candidate ?: return emptyList()
        val points = mutableListOf<String>()
        val role = listOfNotNull(c.latestRole, c.latestCompany).joinToString(" at ").takeIf { it.isNotBlank() }
        if (role != null) points += "Currently $role. Open with what changed since they applied."
        c.roleName.takeIf { it.isNotBlank() }?.let { points += "Applied for $it — confirm they still want this role." }
        val skills = Fmt.splitList(c.relevantSkills ?: c.otherSkills).take(4)
        if (skills.isNotEmpty()) points += "Probe on ${skills.joinToString(", ")}."
        c.availability?.takeIf { it.isNotBlank() }?.let { points += "Stated availability: $it. Confirm notice period." }
        state.lastCall?.let { l ->
            val d = Dispositions.display(l.disposition)
            points += "Last call was ${d.label.lowercase()} — ${d.nextAction.lowercase()}."
        }
        if (points.isEmpty()) points += "No history on this record yet. Verify name, role interest and availability."
        return points
    }

    // ---- Dial handoff --------------------------------------------------

    /**
     * Marks the moment the OS dialer took over. We deliberately declare no
     * `READ_CALL_LOG` / `READ_PHONE_STATE`; the elapsed time between handoff and
     * the app regaining focus is the duration estimate the spec describes.
     */
    fun onDialFired() {
        dialStartedAt = LocalDateTime.now()
    }

    /** Called when the app resumes after a handoff. Returns the estimate in seconds. */
    fun onReturnFromDial(): Int? {
        val started = dialStartedAt ?: return null
        dialStartedAt = null
        val secs = Duration.between(started, LocalDateTime.now()).seconds.toInt()
        if (secs !in 1..7200) return null
        _draft.update { it.copy(durationText = Fmt.duration(secs)) }
        return secs
    }

    val hasPendingReturn: Boolean get() = dialStartedAt != null

    // ---- Disposition draft ---------------------------------------------

    fun pickDisposition(id: String) = _draft.update {
        it.copy(disposition = id, nextAction = Dispositions.defaultNextAction(id))
    }

    fun setDuration(text: String) = _draft.update { it.copy(durationText = text) }
    fun setNote(text: String) = _draft.update { it.copy(note = text) }
    fun setNextAction(a: String) = _draft.update { it.copy(nextAction = a) }
    fun setCallbackAt(at: LocalDateTime?) = _draft.update { it.copy(callbackAt = at) }
    fun setRemind(v: Boolean) = _draft.update { it.copy(remind = v) }
    fun resetDraft() { _draft.value = DispositionDraft() }

    /**
     * Persists the outcome. On a network failure the entry goes to the outbox and
     * the flow still advances — the spec's rule is that a recruiter mid-queue is
     * never blocked by connectivity.
     *
     * @return true when it reached the server, false when it was queued offline.
     */
    fun save(advance: Boolean, onDone: (queuedOffline: Boolean, finished: Boolean) -> Unit) {
        val d = _draft.value
        val disposition = d.disposition ?: return
        val state = _preCall.value
        val row = state.row ?: return

        val body = CallLogCreateDto(
            candidateId = row.candidateId,
            disposition = disposition,
            note = d.note,
            durationSeconds = Fmt.parseDuration(d.durationText),
            durationEstimated = true,
            nextAction = d.nextAction.takeIf { it != "none" },
            candidateName = row.name,
            candidatePhone = row.phone,
            roleId = row.roleId,
            roleName = row.roleName,
            callbackAt = d.callbackAt?.let { Fmt.toIso(it) },
            calledAt = Fmt.toIso(LocalDateTime.now()),
        )

        viewModelScope.launch {
            var queuedOffline = false
            when (val r = calls.logCall(body)) {
                is AppResult.Success -> Unit
                is AppResult.Error -> {
                    if (r.code == null) {
                        outbox.add(
                            OutboxEntry(
                                id = UUID.randomUUID().toString(),
                                body = body,
                                title = "Disposition · ${row.name}",
                                detail = "${Dispositions.display(disposition).label} · ${d.durationText}",
                                queuedAt = Fmt.toIso(LocalDateTime.now()),
                            ),
                        )
                        queuedOffline = true
                    }
                }
            }

            loggedThisRun += disposition
            applySideEffects(disposition, row)
            _queue.update { it.copy(doneToday = it.doneToday + 1) }
            resetDraft()

            val finished = if (advance) !advanceCursor() else false
            if (finished) buildSummary()
            onDone(queuedOffline, finished)
        }
    }

    /**
     * Mirrors the "next action" the disposition implies onto the candidate record,
     * so the pipeline and the DND register stay true without a second screen.
     */
    private suspend fun applySideEffects(disposition: String, row: QueueRow) {
        val candidate = _preCall.value.candidate ?: return
        // `do_not_call` sets the column, not a tag.
        //
        // The disposition alone blocks the dialer only while it remains the
        // *latest* call — one later log of any other outcome and the number is
        // dialable again on every surface. `Candidate.dnc` is the permanent flag,
        // and it is what the web desk's gate, the `dncOnly` filter and the
        // compliance count all read.
        if (disposition == "do_not_call" && candidate.dnc != true) {
            hiring.patchCandidate(
                row.candidateId,
                com.nxthike.android.data.remote.dto.CandidatePatchDto(dnc = true),
            )
        }
    }

    /** @return true when another candidate is queued, false when the run is over. */
    private fun advanceCursor(): Boolean {
        val rows = _queue.value.rows
        if (cursor < 0) return false
        val next = cursor + 1
        if (next > rows.lastIndex) return false
        cursor = next
        loadPreCall(rows[cursor])
        return true
    }

    fun skip(onFinished: () -> Unit) {
        resetDraft()
        if (!advanceCursor()) { buildSummary(); onFinished() }
    }

    private fun buildSummary() {
        val mix = loggedThisRun.groupingBy { it }.eachCount().entries
            .sortedByDescending { it.value }
            .map { it.key to it.value }
        val connected = loggedThisRun.count {
            Dispositions.find(it)?.category == com.nxthike.android.core.model.DispositionCategory.Reached
        }
        _summary.value = QueueSummary(
            calls = loggedThisRun.size,
            connected = connected,
            callbacks = loggedThisRun.count { it == "connected_callback" },
            mix = mix,
        )
    }

    fun restartQueue() {
        loggedThisRun.clear()
        cursor = 0
        loadQueue()
    }

    // ---- History & callbacks -------------------------------------------

    fun loadHistory(candidateId: String? = null) = viewModelScope.launch {
        _historyLoading.value = true
        calls.list(candidateId = candidateId, pageSize = 100)
            .onSuccess { _history.value = it.items }
        _historyLoading.value = false
    }

    fun loadCallbacks() = viewModelScope.launch {
        calls.list(disposition = "connected_callback", pageSize = 100).onSuccess { page ->
            _callbacks.value = page.items
                .filter { it.callbackAt != null }
                .sortedBy { Fmt.parse(it.callbackAt) }
        }
    }

    /** Move an existing callback to a new slot. */
    fun rescheduleCallback(callId: String, at: LocalDateTime) = viewModelScope.launch {
        calls.patch(callId, mapOf("callbackAt" to Fmt.toIso(at))).onSuccess { loadCallbacks() }
    }
}
