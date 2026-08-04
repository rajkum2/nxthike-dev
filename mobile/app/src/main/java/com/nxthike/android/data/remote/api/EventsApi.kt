package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

interface EventsApi {
    @GET("api/events")
    suspend fun list(
        @Query("type") type: String? = null,
        @Query("is_online") isOnline: Boolean? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20,
    ): PaginatedEventsDto

    @GET("api/events/{id}")
    suspend fun get(@Path("id") id: String): EventDto

    @POST("api/events")
    suspend fun create(@Body body: EventWriteDto): EventDto

    @PUT("api/events/{id}")
    suspend fun update(@Path("id") id: String, @Body body: EventWriteDto): EventDto

    @DELETE("api/events/{id}")
    suspend fun delete(@Path("id") id: String): Map<String, String>
}
