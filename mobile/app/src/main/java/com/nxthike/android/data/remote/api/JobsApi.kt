package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

interface JobsApi {
    @GET("api/jobs")
    suspend fun list(
        @Query("search") search: String? = null,
        @Query("location") location: String? = null,
        @Query("category") category: String? = null,
        @Query("type") type: String? = null,
        @Query("is_remote") isRemote: Boolean? = null,
        @Query("status") status: String? = "approved",
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20,
    ): PaginatedJobsDto

    @GET("api/jobs/{id}")
    suspend fun get(@Path("id") id: String): JobDto

    @POST("api/jobs")
    suspend fun create(@Body body: JobWriteDto): JobDto

    @PUT("api/jobs/{id}")
    suspend fun update(@Path("id") id: String, @Body body: JobWriteDto): JobDto

    @DELETE("api/jobs/{id}")
    suspend fun delete(@Path("id") id: String): Map<String, String>
}
