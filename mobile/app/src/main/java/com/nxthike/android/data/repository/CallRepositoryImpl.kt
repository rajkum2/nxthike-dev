package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.CallsApi
import com.nxthike.android.data.remote.dto.CallLogCreateDto
import com.nxthike.android.domain.repository.CallRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CallRepositoryImpl @Inject constructor(
    private val api: CallsApi,
) : CallRepository {
    override suspend fun dispositions() = safeApiCall { api.dispositions() }
    override suspend fun stats() = safeApiCall { api.stats() }
    override suspend fun queue(roleId: String?, status: String?, search: String?, page: Int) =
        safeApiCall { api.queue(roleId = roleId, status = status, search = search, page = page) }
    override suspend fun list(candidateId: String?, disposition: String?, page: Int) =
        safeApiCall { api.list(candidateId = candidateId, disposition = disposition, page = page) }
    override suspend fun logCall(body: CallLogCreateDto) = safeApiCall { api.create(body) }
    override suspend fun delete(id: String): AppResult<Unit> = safeApiCall { api.delete(id); Unit }
}
