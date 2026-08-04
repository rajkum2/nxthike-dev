package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.CompaniesApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.CompanyRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CompanyRepositoryImpl @Inject constructor(private val api: CompaniesApi) : CompanyRepository {
    override suspend fun list() = safeApiCall { api.list() }
    override suspend fun get(id: String) = safeApiCall { api.get(id) }
    override suspend fun create(body: CompanyWriteDto) = safeApiCall { api.create(body) }
    override suspend fun update(id: String, body: CompanyWriteDto) = safeApiCall { api.update(id, body) }
    override suspend fun delete(id: String): AppResult<Unit> = safeApiCall { api.delete(id); Unit }
}
