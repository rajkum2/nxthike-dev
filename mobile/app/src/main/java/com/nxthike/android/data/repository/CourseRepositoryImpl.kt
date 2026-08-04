package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.CoursesApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.CourseRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CourseRepositoryImpl @Inject constructor(private val api: CoursesApi) : CourseRepository {
    override suspend fun list(page: Int) = safeApiCall { api.list(page = page) }
    override suspend fun get(id: String) = safeApiCall { api.get(id) }
    override suspend fun create(body: CourseWriteDto) = safeApiCall { api.create(body) }
    override suspend fun update(id: String, body: CourseWriteDto) = safeApiCall { api.update(id, body) }
    override suspend fun delete(id: String): AppResult<Unit> = safeApiCall { api.delete(id); Unit }
}
