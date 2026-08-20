package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

interface HiringApi {
    @GET("api/hiring/roles")
    suspend fun listRoles(): List<HiringRoleDto>

    @POST("api/hiring/roles")
    suspend fun createRole(@Body body: HiringRoleWriteDto): HiringRoleDto

    @PATCH("api/hiring/roles/{id}")
    suspend fun updateRole(@Path("id") id: String, @Body body: Map<String, @JvmSuppressWildcards Any?>): HiringRoleDto

    @DELETE("api/hiring/roles/{id}")
    suspend fun deleteRole(@Path("id") id: String)

    @GET("api/hiring/dashboard")
    suspend fun dashboard(@Query("roleId") roleId: String? = null): HiringDashboardDto

    /**
     * The full server-side filter set.
     *
     * `city`, `graduationYear` and `expYears` repeat for multi-select — Retrofit
     * serialises a list into repeated query params, which is what
     * `Query(None)` on the FastAPI side expects.
     */
    @GET("api/hiring/candidates")
    suspend fun listCandidates(
        @Query("search") search: String? = null,
        @Query("roleId") roleId: String? = null,
        @Query("status") status: String? = null,
        @Query("city") city: List<String>? = null,
        @Query("source") source: String? = null,
        @Query("gender") gender: String? = null,
        @Query("experience") experience: String? = null,
        @Query("graduationYear") graduationYear: List<String>? = null,
        @Query("expYears") expYears: List<String>? = null,
        @Query("aiMatch") aiMatch: String? = null,
        @Query("starredOnly") starredOnly: Boolean = false,
        @Query("hasNotes") hasNotes: Boolean = false,
        @Query("hasPhone") hasPhone: Boolean = false,
        @Query("hasResume") hasResume: Boolean = false,
        @Query("hasEmail") hasEmail: Boolean = false,
        @Query("dncOnly") dncOnly: Boolean = false,
        @Query("noConsent") noConsent: Boolean = false,
        @Query("sortKey") sortKey: String = "name",
        @Query("sortDir") sortDir: String = "asc",
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 50,
    ): PaginatedCandidatesDto

    /** Distinct cities and graduation years, with counts, for the filter sheet. */
    @GET("api/hiring/candidates/facets")
    suspend fun facets(@Query("q") q: String? = null): CandidateFacetsDto

    @GET("api/hiring/candidates/{id}")
    suspend fun getCandidate(@Path("id") id: String): CandidateDto

    @POST("api/hiring/candidates")
    suspend fun createCandidate(@Body body: CandidateWriteDto): CandidateDto

    @PUT("api/hiring/candidates/{id}")
    suspend fun replaceCandidate(@Path("id") id: String, @Body body: CandidateWriteDto): CandidateDto

    @PATCH("api/hiring/candidates/{id}")
    suspend fun patchCandidate(@Path("id") id: String, @Body body: CandidatePatchDto): CandidateDto

    @DELETE("api/hiring/candidates/{id}")
    suspend fun deleteCandidate(@Path("id") id: String)

    @POST("api/hiring/candidates/bulk-status")
    suspend fun bulkStatus(@Body body: BulkStatusRequest): BulkCountResponse

    @POST("api/hiring/candidates/bulk-role")
    suspend fun bulkRole(@Body body: BulkRoleRequest): BulkCountResponse

    @POST("api/hiring/candidates/bulk-update")
    suspend fun bulkUpdate(@Body body: BulkUpdateRequest): BulkCountResponse

    @POST("api/hiring/candidates/bulk-delete")
    suspend fun bulkDelete(@Body body: BulkDeleteRequest): BulkCountResponse
}
