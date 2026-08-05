package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

interface CallsApi {
    @GET("api/calls/dispositions")
    suspend fun dispositions(): List<CallDispositionDto>

    @GET("api/calls/stats")
    suspend fun stats(): CallStatsDto

    @GET("api/calls/queue")
    suspend fun queue(
        @Query("roleId") roleId: String? = null,
        @Query("status") status: String? = null,
        @Query("search") search: String? = null,
        @Query("hasPhone") hasPhone: Boolean = true,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 50,
    ): PaginatedCallQueueDto

    @GET("api/calls")
    suspend fun list(
        @Query("candidateId") candidateId: String? = null,
        @Query("disposition") disposition: String? = null,
        @Query("roleId") roleId: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 50,
    ): PaginatedCallLogDto

    @POST("api/calls")
    suspend fun create(@Body body: CallLogCreateDto): CallLogDto

    @PATCH("api/calls/{id}")
    suspend fun patch(
        @Path("id") id: String,
        @Body body: Map<String, @JvmSuppressWildcards Any?>,
    ): CallLogDto

    @DELETE("api/calls/{id}")
    suspend fun delete(@Path("id") id: String)
}
