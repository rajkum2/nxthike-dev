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
import com.nxthike.android.domain.repository.HiringRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

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

                val stats = statsD.await().getOrNull()
                val queue = queueD.await().getOrNull()
                val dash = dashD.await().getOrNull()
                val callbacks = cbD.await().getOrNull()?.items.orEmpty()

                if (stats == null && queue == null && dash == null) {
                    _state.value = _state.value.copy(
                        loading = false,
                        error = "Couldn't reach the hiring API. Check your connection and retry.",
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
                    openTasks = overdue + (dash?.byStatus?.get(Stages.Offer.id) ?: 0),
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

/** Everything the notifications centre groups, built from real activity. */
data class NotificationItem(
    val kind: Alert.Kind,
    val title: String,
    val detail: String,
    val at: LocalDateTime?,
    val targetId: String? = null,
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val calls: CallRepository,
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _items = MutableStateFlow<List<NotificationItem>>(emptyList())
    val items: StateFlow<List<NotificationItem>> = _items.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    init { refresh() }

    fun refresh() = viewModelScope.launch {
        _loading.value = true
        val out = mutableListOf<NotificationItem>()

        calls.list(disposition = "connected_callback", pageSize = 40).onSuccess { page ->
            page.items.mapNotNull { l -> Fmt.parse(l.callbackAt)?.let { l to it } }
                .sortedBy { it.second }
                .take(6)
                .forEach { (log, at) ->
                    out += NotificationItem(
                        Alert.Kind.OverdueCallback,
                        "Callback ${if (at.isBefore(LocalDateTime.now())) "overdue" else "due"}",
                        "${log.candidateName ?: "Candidate"} · ${log.note.ifBlank { "no note captured" }}",
                        at, log.candidateId,
                    )
                }
        }

        hiring.candidates(null, null, Stages.Offer.id, 1, 10).onSuccess { page ->
            page.items.forEach { c ->
                out += NotificationItem(
                    Alert.Kind.Approval,
                    "Offer awaiting decision",
                    "${c.name ?: "Candidate"} · ${c.roleName}",
                    Fmt.parse(c.updatedAt), c.id,
                )
            }
        }

        calls.list(disposition = "wrong_number", pageSize = 10).onSuccess { page ->
            page.items.take(3).forEach { l ->
                out += NotificationItem(
                    Alert.Kind.DataIssue,
                    "Number flagged for cleanup",
                    "${l.candidateName ?: "Candidate"} · ${l.candidatePhone ?: "no number"}",
                    Fmt.parse(l.calledAt), l.candidateId,
                )
            }
        }

        _items.value = out.sortedByDescending { it.at }
        _loading.value = false
    }
}

/**
 * Tasks are inferred, not stored — the API has no task table, so the app derives
 * the recruiter's real to-do list from pipeline state.
 */
data class TaskItem(
    val id: String,
    val title: String,
    val due: String,
    val link: String,
    val urgent: Boolean,
    val candidateId: String? = null,
)

@HiltViewModel
class TasksViewModel @Inject constructor(
    private val calls: CallRepository,
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _tasks = MutableStateFlow<List<TaskItem>>(emptyList())
    val tasks: StateFlow<List<TaskItem>> = _tasks.asStateFlow()

    private val _done = MutableStateFlow<Set<String>>(emptySet())
    val done: StateFlow<Set<String>> = _done.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    init { refresh() }

    fun toggle(id: String) {
        _done.value = if (id in _done.value) _done.value - id else _done.value + id
    }

    fun refresh() = viewModelScope.launch {
        _loading.value = true
        val out = mutableListOf<TaskItem>()
        val now = LocalDateTime.now()

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

        hiring.candidates(null, null, Stages.Screening.id, 1, 5).onSuccess { page ->
            page.items.forEach { c ->
                out += TaskItem(
                    id = "screen-${c.id}",
                    title = "Finish screening ${c.name ?: "candidate"}",
                    due = "In screening",
                    link = c.roleName,
                    urgent = false,
                    candidateId = c.id,
                )
            }
        }

        calls.list(disposition = "wrong_number", pageSize = 20).onSuccess { page ->
            if (page.items.isNotEmpty()) {
                out += TaskItem(
                    id = "cleanup",
                    title = "Clean up ${page.items.size} wrong-number record(s)",
                    due = "Data hygiene",
                    link = "Compliance",
                    urgent = false,
                )
            }
        }

        _tasks.value = out
        _loading.value = false
    }

    fun openCount(): Int = _tasks.value.count { it.id !in _done.value }
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
