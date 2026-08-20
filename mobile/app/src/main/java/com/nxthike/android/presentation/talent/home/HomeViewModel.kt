package com.nxthike.android.presentation.talent.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.DispositionCategory
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.CallLogDto
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.data.remote.dto.HiringRoleDto
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.data.remote.dto.TaskPatchDto
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.domain.repository.WorkspaceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.nxthike.android.core.result.AppResult

/** One "Needs you" card — always derived from live data, never a placeholder. */
data class Alert(
    val kind: Kind,
    val title: String,
    val detail: String,
    val targetId: String? = null,
) {
    enum class Kind { Approval, AtRisk, OverdueCallback, NoConsent, DataIssue }
}

data class HomeState(
    val loading: Boolean = true,
    val error: String? = null,
    val callsToday: Int = 0,
    val queueTotal: Int = 0,
    val connectRate: String = "0%",
    val callbacksDue: Int = 0,
    val callbacksOverdue: Int = 0,
    val nextCallback: CallLogDto? = null,
    val upNext: List<com.nxthike.android.presentation.calls.QueueRow> = emptyList(),
    val alerts: List<Alert> = emptyList(),
    val openTasks: Int = 0,
    val roles: List<HiringRoleDto> = emptyList(),
    val totalCandidates: Int = 0,
    val reachedCount: Int = 0,
    val totalCalls: Int = 0,
) {
    val connectRateFraction: Float
        get() = if (totalCalls <= 0) 0f else (reachedCount.toFloat() / totalCalls).coerceIn(0f, 1f)
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val calls: CallRepository,
    private val hiring: HiringRepository,
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(HomeState())
    val state: StateFlow<HomeState> = _state.asStateFlow()

    init { refresh() }

    fun refresh() = viewModelScope.launch {
        _state.value = _state.value.copy(loading = true, error = null)
        try {
            coroutineScope {
                val statsD = async { calls.stats() }
                val queueD = async { calls.queue(pageSize = 20) }
                val dashD = async { hiring.dashboard(null) }
                val cbD = async { calls.list(disposition = "connected_callback", pageSize = 60) }

                val statsR = statsD.await()
                val queueR = queueD.await()
                val dashR = dashD.await()
                val stats = statsR.getOrNull()
                val queue = queueR.getOrNull()
                val dash = dashR.getOrNull()
                val callbacks = cbD.await().getOrNull()?.items.orEmpty()

                if (stats == null && queue == null && dash == null) {
                    // Report what the server said. Assuming connectivity sent
                    // people to check their wifi when the real answer was an
                    // expired session or a persona without dialer access — both
                    // of which arrive as a perfectly healthy HTTP response.
                    val failure = listOf(statsR, queueR, dashR)
                        .filterIsInstance<AppResult.Error>()
                        .firstOrNull()
                    _state.value = _state.value.copy(
                        loading = false,
                        error = when {
                            failure == null -> "Couldn't load your desk. Retry in a moment."
                            failure.code == null ->
                                "Couldn't reach the API. Check your connection and retry."
                            failure.code == 403 -> "Your role can't see this. ${failure.message}"
                            else -> "${failure.message} (HTTP ${failure.code})"
                        },
                    )
                    return@coroutineScope
                }

                val now = LocalDateTime.now()
                val pendingCallbacks = callbacks
                    .filter { it.callbackAt != null }
                    .mapNotNull { log -> Fmt.parse(log.callbackAt)?.let { log to it } }
                    .sortedBy { it.second }
                val overdue = pendingCallbacks.count { it.second.isBefore(now) }

                val reached = Dispositions.ALL
                    .filter { it.category == DispositionCategory.Reached }
                    .sumOf { stats?.byDisposition?.get(it.id) ?: 0 }

                val openTaskCount = workspace.tasks(mine = true, includeDone = false)
                    .getOrNull()?.count { !it.done } ?: 0

                _state.value = HomeState(
                    loading = false,
                    callsToday = stats?.todayCount ?: 0,
                    queueTotal = queue?.total ?: 0,
                    connectRate = Fmt.percent(reached, stats?.totalCount ?: 0),
                    reachedCount = reached,
                    totalCalls = stats?.totalCount ?: 0,
                    callbacksDue = pendingCallbacks.size,
                    callbacksOverdue = overdue,
                    nextCallback = pendingCallbacks.firstOrNull { !it.second.isBefore(now) }?.first
                        ?: pendingCallbacks.firstOrNull()?.first,
                    upNext = queue?.items.orEmpty().take(3).map { item ->
                        com.nxthike.android.presentation.calls.QueueRow(
                            candidateId = item.candidateId,
                            name = item.name?.takeIf { it.isNotBlank() } ?: "Unnamed candidate",
                            phone = item.phone, roleId = item.roleId, roleName = item.roleName,
                            status = item.status, lastDisposition = item.lastDisposition,
                            lastCalledAt = Fmt.parse(item.lastCalledAt), starred = item.starred,
                            city = item.city, email = item.email, notes = item.notes,
                        )
                    },
                    alerts = buildAlerts(dash, pendingCallbacks, now),
                    // Real open tasks, plus the overdue callbacks that live on
                    // call logs rather than in the task table.
                    openTasks = overdue + openTaskCount,
                    roles = dash?.roles.orEmpty(),
                    totalCandidates = dash?.total ?: 0,
                )
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(loading = false, error = e.message ?: "Something went wrong")
        }
    }

    /**
     * Alerts are ranked by how much they cost if ignored: an offer waiting on a
     * decision, then a stalled requisition, then a missed callback.
     */
    private suspend fun buildAlerts(
        dash: com.nxthike.android.data.remote.dto.HiringDashboardDto?,
        callbacks: List<Pair<CallLogDto, LocalDateTime>>,
        now: LocalDateTime,
    ): List<Alert> {
        val out = mutableListOf<Alert>()

        dash?.byStatus?.get(Stages.Offer.id)?.takeIf { it > 0 }?.let { n ->
            out += Alert(
                Alert.Kind.Approval,
                if (n == 1) "1 offer waiting on a decision" else "$n offers waiting on a decision",
                "Review the terms and approve or reject",
            )
        }

        // A role with a big pipeline but nothing at interview is stalled. Only the
        // worst one is surfaced — four near-identical rows is noise, not a signal.
        val stalled = dash?.roles.orEmpty()
            .map { role -> role to (dash?.byRole?.get(role.id) ?: role.count) }
            .filter { it.second >= 5 }
            .sortedByDescending { it.second }
            .firstOrNull { (role, _) ->
                (hiring.candidates(null, role.id, Stages.Interview.id, 1, 1).getOrNull()?.total ?: 0) == 0
            }
        stalled?.let { (role, count) ->
            out += Alert(
                Alert.Kind.AtRisk,
                "Pipeline at risk · ${role.name}",
                "${Fmt.count(count)} sourced, none at interview yet",
                role.id,
            )
        }

        callbacks.firstOrNull { it.second.isBefore(now) }?.let { (log, at) ->
            out += Alert(
                Alert.Kind.OverdueCallback,
                "Callback overdue · ${log.candidateName ?: "candidate"}",
                "Was due ${Fmt.whenLabel(at)}",
                log.candidateId,
            )
        }

        return out.take(4)
    }
}

/** A row in the notifications centre. */
data class NotificationItem(
    val id: String,
    val kind: Alert.Kind,
    val title: String,
    val detail: String,
    val at: LocalDateTime?,
    val targetId: String? = null,
    val read: Boolean = false,
)

/**
 * Notifications from `/api/workspace/notifications`.
 *
 * These are the workspace's own notifications — the same ones the web desk shows,
 * marked read for the whole account by `POST /notifications/read-all`. This
 * screen used to synthesise a plausible list out of call logs and pipeline state,
 * which meant it never showed a mention, an assignment or an approval request,
 * and "mark all read" had nothing to mark.
 */
@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _items = MutableStateFlow<List<NotificationItem>>(emptyList())
    val items: StateFlow<List<NotificationItem>> = _items.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    val unreadCount: Int get() = _items.value.count { !it.read }

    init { refresh() }

    fun refresh() = viewModelScope.launch {
        _loading.value = true
        _error.value = null
        workspace.notifications()
            .onSuccess { list ->
                _items.value = list
                    .map { n ->
                        NotificationItem(
                            id = n.id,
                            kind = kindOf(n.kind),
                            title = n.title,
                            detail = n.detail,
                            at = Fmt.parse(n.createdAt),
                            targetId = n.refId,
                            read = n.read,
                        )
                    }
                    .sortedByDescending { it.at }
            }
            .onError { e -> _error.value = e.message }
        _loading.value = false
    }

    fun markAllRead() = viewModelScope.launch {
        workspace.markAllRead().onSuccess {
            _items.value = _items.value.map { it.copy(read = true) }
        }
    }

    /** Maps the server's notification kinds onto the alert styling this app has. */
    private fun kindOf(raw: String): Alert.Kind = when {
        raw.contains("callback", true) -> Alert.Kind.OverdueCallback
        raw.contains("approval", true) || raw.contains("offer", true) -> Alert.Kind.Approval
        raw.contains("data", true) || raw.contains("dedupe", true) -> Alert.Kind.DataIssue
        else -> Alert.Kind.Approval
    }
}

/**
 * A row on the task list.
 *
 * [serverId] is set for rows that are real `Task` records; it is null for the
 * callback reminders derived from call logs, which have no task row to update.
 */
data class TaskItem(
    val id: String,
    val title: String,
    val due: String,
    val link: String,
    val urgent: Boolean,
    val candidateId: String? = null,
    val serverId: String? = null,
    val done: Boolean = false,
)

/**
 * Tasks from `/api/workspace/tasks`, plus the callbacks the call log owns.
 *
 * The task table is the shared list: what the desk assigns, what a lead hands
 * out, what survives closing the app. Ticking one persists through
 * `PATCH /tasks/{id}` rather than being forgotten on the next launch, which is
 * what happened while this list was derived from pipeline state.
 *
 * Callback reminders stay derived on purpose — a callback lives on its call log,
 * not in the task table, and it is the single most time-critical thing a dialer
 * has to see.
 */
@HiltViewModel
class TasksViewModel @Inject constructor(
    private val calls: CallRepository,
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _tasks = MutableStateFlow<List<TaskItem>>(emptyList())
    val tasks: StateFlow<List<TaskItem>> = _tasks.asStateFlow()

    /** Locally ticked ids — used only for the derived rows, which cannot persist. */
    private val _done = MutableStateFlow<Set<String>>(emptySet())
    val done: StateFlow<Set<String>> = _done.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { refresh() }

    /**
     * Ticks a task off. A real task is updated on the server and stays ticked;
     * a derived callback reminder can only be dismissed for this session.
     */
    fun toggle(id: String) {
        val task = _tasks.value.firstOrNull { it.id == id }
        val serverId = task?.serverId
        if (serverId == null) {
            _done.value = if (id in _done.value) _done.value - id else _done.value + id
            return
        }
        val nowDone = !(task.done)
        // Optimistic: the row moves immediately, and is reconciled by the reload.
        _tasks.value = _tasks.value.map { if (it.id == id) it.copy(done = nowDone) else it }
        viewModelScope.launch {
            workspace.patchTask(serverId, TaskPatchDto(done = nowDone))
                .onError { e ->
                    _error.value = e.message
                    _tasks.value = _tasks.value.map { if (it.id == id) it.copy(done = !nowDone) else it }
                }
        }
    }

    fun create(title: String, detail: String = "", onDone: () -> Unit = {}) = viewModelScope.launch {
        workspace.createTask(
            com.nxthike.android.data.remote.dto.TaskCreateDto(title = title, detail = detail),
        ).onSuccess { refresh(); onDone() }
            .onError { e -> _error.value = e.message }
    }

    fun refresh() = viewModelScope.launch {
        _loading.value = true
        _error.value = null
        val out = mutableListOf<TaskItem>()
        val now = LocalDateTime.now()

        workspace.tasks(mine = true, includeDone = false)
            .onSuccess { list ->
                list.forEach { t ->
                    out += TaskItem(
                        id = "task-${t.id}",
                        title = t.title,
                        due = when {
                            t.overdue -> "Overdue"
                            t.dueAt != null -> Fmt.whenLabel(Fmt.parse(t.dueAt))
                            else -> t.detail.ifBlank { "No due date" }
                        },
                        link = t.linkLabel ?: t.linkKind ?: "Task",
                        urgent = t.overdue,
                        candidateId = t.linkId?.takeIf { t.linkKind == "candidate" },
                        serverId = t.id,
                        done = t.done,
                    )
                }
            }
            .onError { e -> _error.value = e.message }

        calls.list(disposition = "connected_callback", pageSize = 40).onSuccess { page ->
            page.items.mapNotNull { l -> Fmt.parse(l.callbackAt)?.let { l to it } }
                .sortedBy { it.second }
                .take(5)
                .forEach { (log, at) ->
                    out += TaskItem(
                        id = "cb-${log.id}",
                        title = "Call back ${log.candidateName ?: "candidate"}",
                        due = if (at.isBefore(now)) "Overdue" else Fmt.whenLabel(at),
                        link = log.roleName.orEmpty().ifBlank { "Callback" },
                        urgent = at.isBefore(now),
                        candidateId = log.candidateId,
                    )
                }
        }

        _tasks.value = out.sortedByDescending { it.urgent }
        _loading.value = false
    }

    fun openCount(): Int = _tasks.value.count { !it.done && it.id !in _done.value }
}

/** Global search across candidates, requisitions and clients. */
data class SearchGroup(val name: String, val items: List<SearchHit>)
data class SearchHit(val id: String, val title: String, val detail: String, val kind: String)

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val hiring: HiringRepository,
    private val companies: com.nxthike.android.domain.repository.CompanyRepository,
) : ViewModel() {

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _groups = MutableStateFlow<List<SearchGroup>>(emptyList())
    val groups: StateFlow<List<SearchGroup>> = _groups.asStateFlow()

    fun setQuery(q: String) {
        _query.value = q
        if (q.isBlank()) { _groups.value = emptyList(); return }
        viewModelScope.launch {
            val out = mutableListOf<SearchGroup>()
            hiring.candidates(q, null, null, 1, 6).onSuccess { page ->
                if (page.items.isNotEmpty()) {
                    out += SearchGroup(
                        "CANDIDATES",
                        page.items.map { c ->
                            SearchHit(
                                c.id, c.name ?: "Unnamed",
                                com.nxthike.android.presentation.talent.common.candidateSubtitle(c),
                                "candidate",
                            )
                        },
                    )
                }
            }
            hiring.roles().onSuccess { roles ->
                val hits = roles.filter { it.name.contains(q, true) }.take(4)
                if (hits.isNotEmpty()) {
                    out += SearchGroup(
                        "REQUISITIONS",
                        hits.map { SearchHit(it.id, it.name, "${it.count} in pipeline", "req") },
                    )
                }
            }
            companies.list().onSuccess { list ->
                val hits = list.filter { it.name.contains(q, true) }.take(4)
                if (hits.isNotEmpty()) {
                    out += SearchGroup(
                        "CLIENTS",
                        hits.map { SearchHit(it.id, it.name, it.industry ?: it.location ?: "", "client") },
                    )
                }
            }
            _groups.value = out
        }
    }
}
