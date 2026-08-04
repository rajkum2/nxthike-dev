package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

interface CoursesApi {
    @GET("api/courses")
    suspend fun list(
        @Query("category") category: String? = null,
        @Query("level") level: String? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20,
    ): PaginatedCoursesDto

    @GET("api/courses/{id}")
    suspend fun get(@Path("id") id: String): CourseDto

    @POST("api/courses")
    suspend fun create(@Body body: CourseWriteDto): CourseDto

    @PUT("api/courses/{id}")
    suspend fun update(@Path("id") id: String, @Body body: CourseWriteDto): CourseDto

    @DELETE("api/courses/{id}")
    suspend fun delete(@Path("id") id: String): Map<String, String>
}
