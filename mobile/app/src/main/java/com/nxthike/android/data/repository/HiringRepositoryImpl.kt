package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.HiringApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.CandidateQuery
import com.nxthike.android.domain.repository.HiringRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HiringRepositoryImpl @Inject constructor(private val api: HiringApi) : HiringRepository {

    override suspend fun roles() = safeApiCall { api.listRoles() }
    override suspend fun createRole(body: HiringRoleWriteDto) = safeApiCall { api.createRole(body) }
    override suspend fun updateRole(id: String, changes: Map<String, Any?>) =
        safeApiCall { api.updateRole(id, changes) }
    override suspend fun deleteRole(id: String): AppResult<Unit> = safeApiCall { api.deleteRole(id); Unit }
    override suspend fun dashboard(roleId: String?) = safeApiCall { api.dashboard(roleId) }

    override suspend fun candidates(
        search: String?,
        roleId: String?,
        status: String?,
        page: Int,
        pageSize: Int,
    ) = safeApiCall {
        api.listCandidates(
            search = search,
            roleId = roleId,
            status = status,
            page = page,
            pageSize = pageSize,
        )
    }

    override suspend fun search(query: CandidateQuery) = safeApiCall {
        api.listCandidates(
            search = query.search,
            roleId = query.roleId,
            status = query.status,
            // An empty list must stay null, or Retrofit sends nothing and FastAPI
            // is fine — but an empty `?city=` would match every blank city.
            city = query.cities.ifEmpty { null },
            source = query.source,
            gender = query.gender,
            experience = query.experience,
            graduationYear = query.graduationYears.ifEmpty { null },
            expYears = query.expYears.ifEmpty { null },
            aiMatch = query.aiMatch,
            starredOnly = query.starredOnly,
            hasNotes = query.hasNotes,
            hasPhone = query.hasPhone,
            hasResume = query.hasResume,
            hasEmail = query.hasEmail,
            dncOnly = query.dncOnly,
            noConsent = query.noConsent,
            sortKey = query.sortKey,
            sortDir = query.sortDir,
            page = query.page,
            pageSize = query.pageSize,
        )
    }

    override suspend fun facets(q: String?) = safeApiCall { api.facets(q) }

    override suspend fun getCandidate(id: String) = safeApiCall { api.getCandidate(id) }
    override suspend fun createCandidate(body: CandidateWriteDto) = safeApiCall { api.createCandidate(body) }
    override suspend fun replaceCandidate(id: String, body: CandidateWriteDto) =
        safeApiCall { api.replaceCandidate(id, body) }
    override suspend fun patchCandidate(id: String, body: CandidatePatchDto) =
        safeApiCall { api.patchCandidate(id, body) }
    override suspend fun deleteCandidate(id: String): AppResult<Unit> =
        safeApiCall { api.deleteCandidate(id); Unit }

    override suspend fun bulkStatus(ids: List<String>, status: String) =
        safeApiCall { api.bulkStatus(BulkStatusRequest(ids, status)).updated ?: 0 }
    override suspend fun bulkRole(ids: List<String>, roleId: String, roleName: String?) =
        safeApiCall { api.bulkRole(BulkRoleRequest(ids, roleId, roleName)).updated ?: 0 }
    override suspend fun bulkUpdate(body: BulkUpdateRequest) =
        safeApiCall { api.bulkUpdate(body).updated ?: 0 }
    override suspend fun bulkDelete(ids: List<String>) =
        safeApiCall { api.bulkDelete(BulkDeleteRequest(ids)).deleted ?: 0 }
}
