package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.WorkspaceApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.WorkspaceRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WorkspaceRepositoryImpl @Inject constructor(
    private val api: WorkspaceApi,
) : WorkspaceRepository {

    /* ---- Session & settings ---- */
    override suspend fun session() = safeApiCall { api.session() }
    override suspend fun personas() = safeApiCall { api.personas() }
    override suspend fun switchPersona(persona: String) =
        safeApiCall { api.switchPersona(SelfPersonaDto(persona)) }
    override suspend fun settings() = safeApiCall { api.settings() }
    override suspend fun updateSettings(body: SettingsUpdateDto) =
        safeApiCall { api.updateSettings(body) }
    override suspend fun taxonomy() = safeApiCall { api.taxonomy() }

    /* ---- Requisitions & clients ---- */
    override suspend fun requisitions(includeCounts: Boolean) =
        safeApiCall { api.requisitions(includeCounts) }
    override suspend fun requisition(id: String) = safeApiCall { api.requisition(id) }
    override suspend fun createRequisition(body: RequisitionWriteDto) =
        safeApiCall { api.createRequisition(body) }
    override suspend fun updateRequisition(id: String, body: RequisitionWriteDto) =
        safeApiCall { api.updateRequisition(id, body) }
    override suspend fun clients() = safeApiCall { api.clients() }
    override suspend fun client(id: String) = safeApiCall { api.client(id) }
    override suspend fun patchClient(id: String, body: ClientPatchDto) =
        safeApiCall { api.patchClient(id, body) }

    /* ---- Pipeline artefacts ---- */
    override suspend fun submissions(clientId: String?, requisitionId: String?, candidateId: String?) =
        safeApiCall { api.submissions(clientId, requisitionId, candidateId) }
    override suspend fun createSubmission(body: SubmissionCreateDto) =
        safeApiCall { api.createSubmission(body) }
    override suspend fun patchSubmission(id: String, body: SubmissionPatchDto) =
        safeApiCall { api.patchSubmission(id, body) }

    override suspend fun interviews(candidateId: String?, mine: Boolean?) =
        safeApiCall { api.interviews(candidateId, mine) }
    override suspend fun createInterview(body: InterviewCreateDto) =
        safeApiCall { api.createInterview(body) }
    override suspend fun patchInterview(id: String, body: InterviewPatchDto) =
        safeApiCall { api.patchInterview(id, body) }

    override suspend fun scorecards(candidateId: String?, interviewId: String?) =
        safeApiCall { api.scorecards(candidateId, interviewId) }
    override suspend fun submitScorecard(body: ScorecardWriteDto) =
        safeApiCall { api.submitScorecard(body) }

    override suspend fun offers(status: String?) = safeApiCall { api.offers(status) }
    override suspend fun offer(id: String) = safeApiCall { api.offer(id) }
    override suspend fun createOffer(body: OfferCreateDto) = safeApiCall { api.createOffer(body) }
    override suspend fun patchOffer(id: String, body: OfferPatchDto) =
        safeApiCall { api.patchOffer(id, body) }

    override suspend fun approvals(mine: Boolean?, status: String?) =
        safeApiCall { api.approvals(mine, status) }
    override suspend fun decideApproval(id: String, approve: Boolean, comment: String) =
        safeApiCall { api.decideApproval(id, ApprovalDecisionDto(approve, comment)) }

    /* ---- Notes, tags, saved searches, templates ---- */
    override suspend fun notes(candidateId: String) = safeApiCall { api.notes(candidateId) }
    override suspend fun addNote(candidateId: String, body: String, shared: Boolean) =
        safeApiCall {
            api.addNote(
                NoteCreateDto(
                    candidateId = candidateId,
                    body = body,
                    visibility = if (shared) "shared" else "private",
                ),
            )
        }
    override suspend fun tags() = safeApiCall { api.tags() }
    override suspend fun createTag(body: TagCreateDto) = safeApiCall { api.createTag(body) }
    override suspend fun applyTags(candidateIds: List<String>, add: List<String>, remove: List<String>) =
        safeApiCall {
            api.applyTags(BulkTagRequestDto(candidateIds, add, remove)).updated ?: 0
        }
    override suspend fun savedSearches() = safeApiCall { api.savedSearches() }
    override suspend fun saveSearch(body: SavedSearchCreateDto) = safeApiCall { api.saveSearch(body) }
    override suspend fun deleteSavedSearch(id: String): AppResult<Unit> =
        safeApiCall { api.deleteSavedSearch(id); Unit }
    override suspend fun templates() = safeApiCall { api.templates() }
    override suspend fun createTemplate(body: TemplateWriteDto) = safeApiCall { api.createTemplate(body) }
    override suspend fun updateTemplate(id: String, body: TemplateWriteDto) =
        safeApiCall { api.updateTemplate(id, body) }

    /* ---- Tasks & notifications ---- */
    override suspend fun tasks(mine: Boolean?, includeDone: Boolean?) =
        safeApiCall { api.tasks(mine, includeDone) }
    override suspend fun createTask(body: TaskCreateDto) = safeApiCall { api.createTask(body) }
    override suspend fun patchTask(id: String, body: TaskPatchDto) = safeApiCall { api.patchTask(id, body) }
    override suspend fun deleteTask(id: String): AppResult<Unit> =
        safeApiCall { api.deleteTask(id); Unit }
    override suspend fun notifications() = safeApiCall { api.notifications() }
    override suspend fun markAllRead(): AppResult<Unit> = safeApiCall { api.markAllRead(); Unit }

    /* ---- Roster, audit, compliance ---- */
    override suspend fun users(search: String?) = safeApiCall { api.users(search) }
    override suspend fun inviteUser(body: InviteRequestDto) = safeApiCall { api.inviteUser(body) }
    override suspend fun patchUser(id: String, body: UserPatchDto) = safeApiCall { api.patchUser(id, body) }
    override suspend fun audit(limit: Int) = safeApiCall { api.audit(limit) }
    override suspend fun compliance() = safeApiCall { api.compliance() }
    override suspend fun erasures() = safeApiCall { api.erasures() }
    override suspend fun raiseErasure(candidateId: String, reason: String) =
        safeApiCall { api.raiseErasure(ErasureCreateDto(candidateId, reason)) }
    override suspend fun decideErasure(id: String, status: String) =
        safeApiCall { api.decideErasure(id, ErasureDecisionDto(status)) }
}
