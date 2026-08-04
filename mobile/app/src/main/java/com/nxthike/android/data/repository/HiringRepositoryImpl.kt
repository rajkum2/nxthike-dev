package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.HiringApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.HiringRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HiringRepositoryImpl @Inject constructor(private val api: HiringApi) : HiringRepository {
    override suspend fun roles() = safeApiCall { api.listRoles() }
    override suspend fun createRole(body: HiringRoleWriteDto) = safeApiCall { api.createRole(body) }
    override suspend fun deleteRole(id: String): AppResult<Unit> = safeApiCall { api.deleteRole(id); Unit }
    override suspend fun dashboard(roleId: String?) = safeApiCall { api.dashboard(roleId) }
    override suspend fun candidates(search: String?, roleId: String?, status: String?, page: Int, pageSize: Int) =
        safeApiCall {
            api.listCandidates(search = search, roleId = roleId, status = status, page = page, pageSize = pageSize)
        }
    override suspend fun getCandidate(id: String) = safeApiCall { api.getCandidate(id) }
    override suspend fun createCandidate(body: CandidateWriteDto) = safeApiCall { api.createCandidate(body) }
    override suspend fun patchCandidate(id: String, body: CandidatePatchDto) =
        safeApiCall { api.patchCandidate(id, body) }
    override suspend fun deleteCandidate(id: String): AppResult<Unit> =
        safeApiCall { api.deleteCandidate(id); Unit }
    override suspend fun bulkStatus(ids: List<String>, status: String) =
        safeApiCall { api.bulkStatus(BulkStatusRequest(ids, status)).updated ?: 0 }
    override suspend fun bulkDelete(ids: List<String>) =
        safeApiCall { api.bulkDelete(BulkDeleteRequest(ids)).deleted ?: 0 }
}
