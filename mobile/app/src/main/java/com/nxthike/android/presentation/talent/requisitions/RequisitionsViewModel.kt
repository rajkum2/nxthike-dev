package com.nxthike.android.presentation.talent.requisitions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.Stage
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.data.remote.dto.CandidatePatchDto
import com.nxthike.android.data.remote.dto.HiringRoleDto
import com.nxthike.android.data.remote.dto.HiringRoleWriteDto
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.domain.repository.JobRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * A requisition, as this app understands it: a `HiringRole` plus the pipeline
 * counts that make it actionable. The role is what candidates hang off, so it
 * is the thing you can build a call queue from.
 */
data class Requisition(
    val id: String,
    val title: String,
    val description: String?,
    val active: Boolean,
    val total: Int,
    val byStage: Map<String, Int>,
    /** False until the per-role stage breakdown has arrived. */
    val detailed: Boolean = true,
) {
    val submitted: Int get() = byStage[Stages.Submitted.id] ?: 0
    val interviewing: Int get() = byStage[Stages.Interview.id] ?: 0
    val hired: Int get() = byStage[Stages.Hired.id] ?: 0
    val sourced: Int get() = byStage[Stages.Sourced.id] ?: 0

    /** Fraction of the pipeline that has moved past first contact. */
    val advanced: Float
        get() = if (total == 0) 0f else (total - sourced).toFloat() / total

    /** Priority is inferred from shape: a big untouched pipeline is urgent. */
    val priority: String
        get() = when {
            total >= 20 && advanced < 0.2f -> "P1"
            total >= 8 && advanced < 0.5f -> "P2"
            else -> "P3"
        }
}

data class RequisitionsState(
    val loading: Boolean = true,
    val error: String? = null,
    val items: List<Requisition> = emptyList(),
    val totalCandidates: Int = 0,
)

@HiltViewModel
class RequisitionsViewModel @Inject constructor(
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RequisitionsState())
    val state: StateFlow<RequisitionsState> = _state.asStateFlow()

    private var enrichJob: Job? = null

    init { load() }

    fun load() = viewModelScope.launch {
        _state.update { it.copy(loading = true, error = null) }
        when (val dash = hiring.dashboard(null)) {
            is AppResult.Success -> {
                val roles = dash.data.roles.ifEmpty { hiring.roles().getOrNull().orEmpty() }

                // Show the list straight away from the roll-up the dashboard already
                // returned. Per-role stage breakdowns are a separate request each and
                // the API takes seconds per call, so they stream in afterwards rather
                // than holding the whole screen on a skeleton.
                _state.value = RequisitionsState(
                    loading = false,
                    totalCandidates = dash.data.total,
                    items = roles.map { role ->
                        Requisition(
                            id = role.id,
                            title = role.name,
                            description = role.description,
                            active = role.is_active,
                            total = dash.data.byRole[role.id] ?: role.count,
                            byStage = emptyMap(),
                            detailed = false,
                        )
                    },
                )
                enrich(roles.map { it.id })
            }
            is AppResult.Error -> _state.update { it.copy(loading = false, error = dash.message) }
        }
    }

    /** Fills in each role's stage breakdown as it arrives, card by card. */
    private fun enrich(roleIds: List<String>) {
        enrichJob?.cancel()
        enrichJob = viewModelScope.launch {
            roleIds.forEach { id ->
                launch {
                    val perRole = hiring.dashboard(id).getOrNull() ?: return@launch
                    _state.update { s ->
                        s.copy(
                            items = s.items.map { req ->
                                if (req.id == id) {
                                    req.copy(
                                        total = perRole.total,
                                        byStage = perRole.byStatus,
                                        detailed = true,
                                    )
                                } else {
                                    req
                                }
                            },
                        )
                    }
                }
            }
        }
    }

    fun create(name: String, description: String, onDone: () -> Unit) = viewModelScope.launch {
        val id = name.lowercase().replace(Regex("[^a-z0-9]+"), "_").trim('_').ifBlank { "role" }
        hiring.createRole(
            HiringRoleWriteDto(id = id, name = name, description = description.ifBlank { null }),
        ).onSuccess { load(); onDone() }
            .onError { e -> _state.update { it.copy(error = e.message) } }
    }
}

/* ------------------------------------------------------------------ *
 *  Detail                                                            *
 * ------------------------------------------------------------------ */

data class RequisitionDetailState(
    val loading: Boolean = true,
    val error: String? = null,
    val requisition: Requisition? = null,
    val candidates: List<CandidateDto> = emptyList(),
    val posting: com.nxthike.android.data.remote.dto.JobDto? = null,
)

@HiltViewModel
class RequisitionDetailViewModel @Inject constructor(
    private val hiring: HiringRepository,
    private val jobs: JobRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RequisitionDetailState())
    val state: StateFlow<RequisitionDetailState> = _state.asStateFlow()

    fun load(roleId: String) = viewModelScope.launch {
        _state.update { it.copy(loading = true, error = null) }
        val roles = hiring.roles().getOrNull().orEmpty()
        val role: HiringRoleDto? = roles.firstOrNull { it.id == roleId }
        val dash = hiring.dashboard(roleId).getOrNull()
        if (role == null && dash == null) {
            _state.update { it.copy(loading = false, error = "That requisition could not be loaded.") }
            return@launch
        }
        val candidates = hiring.candidates(null, roleId, null, 1, 60).getOrNull()?.items.orEmpty()
        // A job posting with a matching title carries the comp range the CRM lacks.
        val posting = role?.let { r ->
            jobs.list(search = r.name, type = null, page = 1, status = null)
                .getOrNull()?.items?.firstOrNull { it.title.equals(r.name, true) }
        }
        _state.value = RequisitionDetailState(
            loading = false,
            requisition = Requisition(
                id = roleId,
                title = role?.name ?: roleId,
                description = role?.description,
                active = role?.is_active ?: true,
                total = dash?.total ?: candidates.size,
                byStage = dash?.byStatus.orEmpty(),
            ),
            candidates = candidates,
            posting = posting,
        )
    }
}

/* ------------------------------------------------------------------ *
 *  Pipeline board                                                    *
 * ------------------------------------------------------------------ */

data class PipelineState(
    val loading: Boolean = true,
    val error: String? = null,
    val roleId: String? = null,
    val roleName: String = "All requisitions",
    val columns: Map<String, List<CandidateDto>> = emptyMap(),
    /** Set while a move is in flight, so the board can show it optimistically. */
    val moving: String? = null,
    val pendingMove: PendingMove? = null,
)

/** A drag that landed and is waiting on the stage-change sheet to confirm. */
data class PendingMove(
    val candidate: CandidateDto,
    val from: Stage,
    val to: Stage,
)

@HiltViewModel
class PipelineViewModel @Inject constructor(
    private val hiring: HiringRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(PipelineState())
    val state: StateFlow<PipelineState> = _state.asStateFlow()

    fun load(roleId: String?, roleName: String? = null) = viewModelScope.launch {
        _state.update {
            it.copy(loading = true, error = null, roleId = roleId, roleName = roleName ?: it.roleName)
        }
        when (val r = hiring.candidates(null, roleId, null, 1, 200)) {
            is AppResult.Success -> {
                val grouped = Stages.BOARD.associate { stage ->
                    stage.id to r.data.items.filter { it.status == stage.id }
                }
                _state.update { it.copy(loading = false, columns = grouped) }
            }
            is AppResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
        }
    }

    /** Stages a drop; the write only happens once the sheet is confirmed. */
    fun stageMove(candidate: CandidateDto, to: Stage) {
        val from = Stages.find(candidate.status)
        if (from.id == to.id) return
        _state.update { it.copy(pendingMove = PendingMove(candidate, from, to)) }
    }

    fun cancelMove() = _state.update { it.copy(pendingMove = null) }

    fun confirmMove(note: String, dropReason: String?, onDone: () -> Unit = {}) {
        val move = _state.value.pendingMove ?: return
        viewModelScope.launch {
            _state.update { it.copy(moving = move.candidate.id) }
            val trail = buildString {
                append("[stage] ${move.from.label} → ${move.to.label}")
                if (!dropReason.isNullOrBlank()) append(" · $dropReason")
                if (note.isNotBlank()) append(" — $note")
            }
            val patch = CandidatePatchDto(
                status = move.to.id,
                notes = (move.candidate.notes.trimEnd() + "\n" + trail).trim(),
            )
            when (hiring.patchCandidate(move.candidate.id, patch)) {
                is AppResult.Success -> {
                    _state.update { it.copy(moving = null, pendingMove = null) }
                    load(_state.value.roleId, _state.value.roleName)
                    onDone()
                }
                is AppResult.Error -> _state.update {
                    it.copy(moving = null, error = "Couldn't move that card. It stayed where it was.")
                }
            }
        }
    }
}
