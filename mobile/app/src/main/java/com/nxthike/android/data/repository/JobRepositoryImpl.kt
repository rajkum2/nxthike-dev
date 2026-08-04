package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.JobsApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.JobRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class JobRepositoryImpl @Inject constructor(private val api: JobsApi) : JobRepository {
    override suspend fun list(search: String?, type: String?, page: Int, status: String?) =
        safeApiCall { api.list(search = search, type = type, page = page, status = status ?: "approved") }

    override suspend fun get(id: String) = safeApiCall { api.get(id) }
    override suspend fun create(body: JobWriteDto) = safeApiCall { api.create(body) }
    override suspend fun update(id: String, body: JobWriteDto) = safeApiCall { api.update(id, body) }
    override suspend fun delete(id: String): AppResult<Unit> = safeApiCall { api.delete(id); Unit }
}
