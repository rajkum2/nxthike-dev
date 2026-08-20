package com.nxthike.android.domain.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.*

/**
 * The recruiting workspace, as the app consumes it.
 *
 * One interface for what the server splits across two routers, because callers
 * care about the domain, not which Python module serves it.
 */
interface WorkspaceRepository {

    /* ---- Session & settings ---- */
    suspend fun session(): AppResult<SessionDto>
    suspend fun personas(): AppResult<List<PersonaDto>>
    suspend fun switchPersona(persona: String): AppResult<SessionDto>
    suspend fun settings(): AppResult<WorkspaceSettingsDto>
    suspend fun updateSettings(body: SettingsUpdateDto): AppResult<WorkspaceSettingsDto>
    suspend fun taxonomy(): AppResult<TaxonomyDto>

    /* ---- Requisitions & clients ---- */
    suspend fun requisitions(includeCounts: Boolean = true): AppResult<List<RequisitionDto>>
    suspend fun requisition(id: String): AppResult<RequisitionDto>
    suspend fun createRequisition(body: RequisitionWriteDto): AppResult<RequisitionDto>
    suspend fun updateRequisition(id: String, body: RequisitionWriteDto): AppResult<RequisitionDto>
    suspend fun clients(): AppResult<List<ClientDto>>
    suspend fun client(id: String): AppResult<ClientDto>
    suspend fun patchClient(id: String, body: ClientPatchDto): AppResult<ClientDto>

    /* ---- Pipeline artefacts ---- */
    suspend fun submissions(
        clientId: String? = null,
        requisitionId: String? = null,
        candidateId: String? = null,
    ): AppResult<List<SubmissionDto>>
    suspend fun createSubmission(body: SubmissionCreateDto): AppResult<SubmissionDto>
    suspend fun patchSubmission(id: String, body: SubmissionPatchDto): AppResult<SubmissionDto>

    suspend fun interviews(candidateId: String? = null, mine: Boolean? = null): AppResult<List<InterviewDto>>
    suspend fun createInterview(body: InterviewCreateDto): AppResult<InterviewDto>
    suspend fun patchInterview(id: String, body: InterviewPatchDto): AppResult<InterviewDto>

    suspend fun scorecards(candidateId: String? = null, interviewId: String? = null): AppResult<List<ScorecardDto>>
    suspend fun submitScorecard(body: ScorecardWriteDto): AppResult<ScorecardDto>

    suspend fun offers(status: String? = null): AppResult<List<OfferDto>>
    suspend fun offer(id: String): AppResult<OfferDto>
    suspend fun createOffer(body: OfferCreateDto): AppResult<OfferDto>
    suspend fun patchOffer(id: String, body: OfferPatchDto): AppResult<OfferDto>

    suspend fun approvals(mine: Boolean? = null, status: String? = null): AppResult<List<ApprovalDto>>
    suspend fun decideApproval(id: String, approve: Boolean, comment: String = ""): AppResult<ApprovalDto>

    /* ---- Notes, tags, saved searches, templates ---- */
    suspend fun notes(candidateId: String): AppResult<List<NoteDto>>
    suspend fun addNote(candidateId: String, body: String, shared: Boolean): AppResult<NoteDto>
    suspend fun tags(): AppResult<List<TagDto>>
    suspend fun createTag(body: TagCreateDto): AppResult<TagDto>
    suspend fun applyTags(
        candidateIds: List<String>,
        add: List<String> = emptyList(),
        remove: List<String> = emptyList(),
    ): AppResult<Int>
    suspend fun savedSearches(): AppResult<List<SavedSearchDto>>
    suspend fun saveSearch(body: SavedSearchCreateDto): AppResult<SavedSearchDto>
    suspend fun deleteSavedSearch(id: String): AppResult<Unit>
    suspend fun templates(): AppResult<List<TemplateDto>>
    suspend fun createTemplate(body: TemplateWriteDto): AppResult<TemplateDto>
    suspend fun updateTemplate(id: String, body: TemplateWriteDto): AppResult<TemplateDto>

    /* ---- Tasks & notifications ---- */
    suspend fun tasks(mine: Boolean? = null, includeDone: Boolean? = null): AppResult<List<TaskDto>>
    suspend fun createTask(body: TaskCreateDto): AppResult<TaskDto>
    suspend fun patchTask(id: String, body: TaskPatchDto): AppResult<TaskDto>
    suspend fun deleteTask(id: String): AppResult<Unit>
    suspend fun notifications(): AppResult<List<NotificationDto>>
    suspend fun markAllRead(): AppResult<Unit>

    /* ---- Roster, audit, compliance ---- */
    suspend fun users(search: String? = null): AppResult<List<WorkspaceUserDto>>
    suspend fun inviteUser(body: InviteRequestDto): AppResult<WorkspaceUserDto>
    suspend fun patchUser(id: String, body: UserPatchDto): AppResult<WorkspaceUserDto>
    suspend fun audit(limit: Int = 100): AppResult<List<AuditDto>>
    suspend fun compliance(): AppResult<ComplianceDto>
    suspend fun erasures(): AppResult<List<ErasureDto>>
    suspend fun raiseErasure(candidateId: String, reason: String): AppResult<ErasureDto>
    suspend fun decideErasure(id: String, status: String): AppResult<ErasureDto>
}
