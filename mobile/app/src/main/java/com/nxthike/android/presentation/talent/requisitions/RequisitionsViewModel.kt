package com.nxthike.android.presentation.talent.requisitions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.Stage
import com.nxthike.android.core.model.StageMove
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.data.remote.dto.CandidatePatchDto
import com.nxthike.android.data.remote.dto.RequisitionDto
import com.nxthike.android.data.remote.dto.RequisitionWriteDto
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.domain.repository.JobRepository
import com.nxthike.android.domain.repository.WorkspaceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * A requisition as the workspace defines it.
 *
 * Priority, openings, the SLA and the comp band used to be absent or guessed
 * here — `priority` was inferred from pipeline shape, because the only thing
 * available was a `HiringRole` and a count. They are real columns now, and
 * `/api/workspace/requisitions` returns them with the stage breakdown in one
 * request, so the per-role fan-out this screen used to do is gone too.
 */
data class Requisition(
    val id: String,
    val title: String,
    val description: String?,
    val active: Boolean,
    val total: Int,
    val byStage: Map<String, Int>,
    val priority: String = "P2",
    val openings: Int = 1,
    val filled: Int = 0,
    val clientId: String? = null,
    val clientName: String? = null,
    val department: String? = null,
    val location: String? = null,
    val skills: List<String> = emptyList(),
    val status: String = "open",
    val slaLabel: String? = null,
    val slaBreached: Boolean = false,
    val compLabel: String? = null,
    /** Null unless this persona is entitled to see commercials. */
    val billRate: String? = null,
    val payRate: String? = null,
    val ownerId: String? = null,
    /** Kept for the loading state: counts arrive with the list now, so this is true. */
    val detailed: Boolean = true,
) {
    val submitted: Int get() = byStage[Stages.Submitted.id] ?: 0
    val interviewing: Int get() = byStage[Stages.Interview.id] ?: 0
    val hired: Int get() = byStage[Stages.Hired.id] ?: 0
    val sourced: Int get() = byStage[Stages.Sourced.id] ?: 0

    /** Fraction of the pipeline that has moved past first contact. */
    val advanced: Float
        get() = if (total == 0) 0f else (total - sourced).toFloat() / total

    val remaining: Int get() = (openings - filled).coerceAtLeast(0)

    companion object {
        fun from(dto: RequisitionDto) = Requisition(
            id = dto.id,
            title = dto.title,
            description = dto.description,
            active = dto.isActive,
            total = dto.pipelineTotal,
            byStage = dto.byStage,
            priority = dto.priority,
            openings = dto.openings,
            filled = dto.filled,
            clientId = dto.clientId,
            clientName = dto.clientName,
            department = dto.department,
            location = dto.location,
            skills = dto.skills,
            status = dto.status,
            slaLabel = dto.slaLabel,
            slaBreached = dto.slaBreached,
            compLabel = dto.compLabel,
            billRate = dto.billRate,
            payRate = dto.payRate,
            ownerId = dto.ownerId,
        )
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
    private val workspace: WorkspaceRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RequisitionsState())
    val state: StateFlow<RequisitionsState> = _state.asStateFlow()

    init { load() }

    /**
     * One request for the whole board.
     *
     * `includeCounts` has the server group candidates by role and stage in a
     * single query, so this replaces the old dashboard call plus one follow-up
     * request per role — which on a workspace with thirty requisitions was
     * thirty-one round trips to render one list.
     */
    fun load() = viewModelScope.launch {
        _state.update { it.copy(loading = true, error = null) }
        when (val r = workspace.requisitions(includeCounts = true)) {
            is AppResult.Success -> {
                val items = r.data.map(Requisition::from)
                _state.value = RequisitionsState(
                    loading = false,
                    items = items,
                    totalCandidates = items.sumOf { it.total },
                )
            }
            is AppResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
        }
    }

    fun create(name: String, description: String, onDone: () -> Unit) = viewModelScope.launch {
        workspace.createRequisition(
            RequisitionWriteDto(title = name, description = description.ifBlank { null }),
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
    private val workspace: WorkspaceRepository,
    private val jobs: JobRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RequisitionDetailState())
    val state: StateFlow<RequisitionDetailState> = _state.asStateFlow()

    fun load(reqId: String) = viewModelScope.launch {
        _state.update { it.copy(loading = true, error = null) }
        when (val r = workspace.requisition(reqId)) {
            is AppResult.Success -> {
                val req = Requisition.from(r.data)
                val candidates = hiring.candidates(null, reqId, null, 1, 60)
                    .getOrNull()?.items.orEmpty()
                // The comp band is a requisition column now. A matching job posting
                // is still worth showing, but only as the public advert — it is no
                // longer the only place a salary range could be found.
                val posting = jobs.list(search = req.title, type = null, page = 1, status = null)
                    .getOrNull()?.items?.firstOrNull { it.title.equals(req.title, true) }
                _state.value = RequisitionDetailState(
                    loading = false,
                    requisition = req,
                    candidates = candidates,
                    posting = posting,
                )
            }
            is AppResult.Error -> _state.update {
                it.copy(loading = false, error = r.message)
            }
        }
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
            // Shared with the list row and the profile — one move, one record.
            val patch = StageMove.patch(move.candidate, move.to, note, dropReason)
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
