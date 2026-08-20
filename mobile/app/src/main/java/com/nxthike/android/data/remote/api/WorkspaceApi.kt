package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

/**
 * The recruiting workspace API — `/api/workspace/…`.
 *
 * Two FastAPI routers mount under this prefix (`workspace.py` for session,
 * settings and admin; `recruiting.py` for requisitions and pipeline artefacts),
 * but they are one namespace over the wire, so they are one interface here.
 *
 * Every route sits behind `get_workspace_user`, and most writes behind a
 * `require_cap(...)` gate — a 403 here means "your persona cannot do this",
 * not "you are signed out".
 */
interface WorkspaceApi {

    /* ---- Session, personas, settings ---------------------------------- */

    @GET("api/workspace/session")
    suspend fun session(): SessionDto

    @GET("api/workspace/personas")
    suspend fun personas(): List<PersonaDto>

    /**
     * Try on another persona. Separate from [patchUser] because that route is
     * gated on the *current* persona's admin capability — switching away from
     * Admin would otherwise be a one-way door.
     */
    @PATCH("api/workspace/session/persona")
    suspend fun switchPersona(@Body body: SelfPersonaDto): SessionDto

    @GET("api/workspace/settings")
    suspend fun settings(): WorkspaceSettingsDto

    @PATCH("api/workspace/settings")
    suspend fun updateSettings(@Body body: SettingsUpdateDto): WorkspaceSettingsDto

    @GET("api/workspace/taxonomy")
    suspend fun taxonomy(): TaxonomyDto

    /* ---- Requisitions & clients --------------------------------------- */

    @GET("api/workspace/requisitions")
    suspend fun requisitions(
        @Query("includeCounts") includeCounts: Boolean = true,
    ): List<RequisitionDto>

    @GET("api/workspace/requisitions/{id}")
    suspend fun requisition(@Path("id") id: String): RequisitionDto

    @POST("api/workspace/requisitions")
    suspend fun createRequisition(@Body body: RequisitionWriteDto): RequisitionDto

    @PATCH("api/workspace/requisitions/{id}")
    suspend fun updateRequisition(
        @Path("id") id: String,
        @Body body: RequisitionWriteDto,
    ): RequisitionDto

    @GET("api/workspace/clients")
    suspend fun clients(): List<ClientDto>

    @GET("api/workspace/clients/{id}")
    suspend fun client(@Path("id") id: String): ClientDto

    @PATCH("api/workspace/clients/{id}")
    suspend fun patchClient(@Path("id") id: String, @Body body: ClientPatchDto): ClientDto

    /* ---- Submissions -------------------------------------------------- */

    @GET("api/workspace/submissions")
    suspend fun submissions(
        @Query("clientId") clientId: String? = null,
        @Query("requisitionId") requisitionId: String? = null,
        @Query("candidateId") candidateId: String? = null,
    ): List<SubmissionDto>

    @POST("api/workspace/submissions")
    suspend fun createSubmission(@Body body: SubmissionCreateDto): SubmissionDto

    @PATCH("api/workspace/submissions/{id}")
    suspend fun patchSubmission(@Path("id") id: String, @Body body: SubmissionPatchDto): SubmissionDto

    /* ---- Interviews & scorecards -------------------------------------- */

    @GET("api/workspace/interviews")
    suspend fun interviews(
        @Query("candidateId") candidateId: String? = null,
        @Query("mine") mine: Boolean? = null,
    ): List<InterviewDto>

    @POST("api/workspace/interviews")
    suspend fun createInterview(@Body body: InterviewCreateDto): InterviewDto

    @PATCH("api/workspace/interviews/{id}")
    suspend fun patchInterview(@Path("id") id: String, @Body body: InterviewPatchDto): InterviewDto

    @GET("api/workspace/scorecards")
    suspend fun scorecards(
        @Query("candidateId") candidateId: String? = null,
        @Query("interviewId") interviewId: String? = null,
    ): List<ScorecardDto>

    @POST("api/workspace/scorecards")
    suspend fun submitScorecard(@Body body: ScorecardWriteDto): ScorecardDto

    /* ---- Offers & approvals ------------------------------------------- */

    @GET("api/workspace/offers")
    suspend fun offers(@Query("status") status: String? = null): List<OfferDto>

    @GET("api/workspace/offers/{id}")
    suspend fun offer(@Path("id") id: String): OfferDto

    @POST("api/workspace/offers")
    suspend fun createOffer(@Body body: OfferCreateDto): OfferDto

    @PATCH("api/workspace/offers/{id}")
    suspend fun patchOffer(@Path("id") id: String, @Body body: OfferPatchDto): OfferDto

    @GET("api/workspace/approvals")
    suspend fun approvals(
        @Query("mine") mine: Boolean? = null,
        @Query("status") status: String? = null,
    ): List<ApprovalDto>

    @POST("api/workspace/approvals/{id}/decide")
    suspend fun decideApproval(
        @Path("id") id: String,
        @Body body: ApprovalDecisionDto,
    ): ApprovalDto

    /* ---- Notes, tags, saved searches, templates ----------------------- */

    @GET("api/workspace/notes")
    suspend fun notes(@Query("candidateId") candidateId: String): List<NoteDto>

    @POST("api/workspace/notes")
    suspend fun addNote(@Body body: NoteCreateDto): NoteDto

    @GET("api/workspace/tags")
    suspend fun tags(): List<TagDto>

    @POST("api/workspace/tags")
    suspend fun createTag(@Body body: TagCreateDto): TagDto

    @POST("api/workspace/tags/apply")
    suspend fun applyTags(@Body body: BulkTagRequestDto): BulkCountResponse

    @GET("api/workspace/saved-searches")
    suspend fun savedSearches(): List<SavedSearchDto>

    @POST("api/workspace/saved-searches")
    suspend fun saveSearch(@Body body: SavedSearchCreateDto): SavedSearchDto

    @DELETE("api/workspace/saved-searches/{id}")
    suspend fun deleteSavedSearch(@Path("id") id: String)

    @GET("api/workspace/templates")
    suspend fun templates(): List<TemplateDto>

    @POST("api/workspace/templates")
    suspend fun createTemplate(@Body body: TemplateWriteDto): TemplateDto

    @PATCH("api/workspace/templates/{id}")
    suspend fun updateTemplate(@Path("id") id: String, @Body body: TemplateWriteDto): TemplateDto

    /* ---- Tasks & notifications ---------------------------------------- */

    @GET("api/workspace/tasks")
    suspend fun tasks(
        @Query("mine") mine: Boolean? = null,
        @Query("includeDone") includeDone: Boolean? = null,
    ): List<TaskDto>

    @POST("api/workspace/tasks")
    suspend fun createTask(@Body body: TaskCreateDto): TaskDto

    @PATCH("api/workspace/tasks/{id}")
    suspend fun patchTask(@Path("id") id: String, @Body body: TaskPatchDto): TaskDto

    @DELETE("api/workspace/tasks/{id}")
    suspend fun deleteTask(@Path("id") id: String)

    @GET("api/workspace/notifications")
    suspend fun notifications(): List<NotificationDto>

    @POST("api/workspace/notifications/read-all")
    suspend fun markAllRead()

    /* ---- Roster, audit, compliance ------------------------------------ */

    @GET("api/workspace/users")
    suspend fun users(@Query("search") search: String? = null): List<WorkspaceUserDto>

    @POST("api/workspace/users/invite")
    suspend fun inviteUser(@Body body: InviteRequestDto): WorkspaceUserDto

    @PATCH("api/workspace/users/{id}")
    suspend fun patchUser(@Path("id") id: String, @Body body: UserPatchDto): WorkspaceUserDto

    @GET("api/workspace/audit")
    suspend fun audit(@Query("limit") limit: Int = 100): List<AuditDto>

    @GET("api/workspace/compliance")
    suspend fun compliance(): ComplianceDto

    @GET("api/workspace/erasures")
    suspend fun erasures(): List<ErasureDto>

    @POST("api/workspace/erasures")
    suspend fun raiseErasure(@Body body: ErasureCreateDto): ErasureDto

    @PATCH("api/workspace/erasures/{id}")
    suspend fun decideErasure(@Path("id") id: String, @Body body: ErasureDecisionDto): ErasureDto
}
