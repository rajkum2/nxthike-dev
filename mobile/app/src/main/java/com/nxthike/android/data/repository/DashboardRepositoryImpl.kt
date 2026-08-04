package com.nxthike.android.data.repository

import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.DashboardApi
import com.nxthike.android.domain.repository.DashboardRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepositoryImpl @Inject constructor(private val api: DashboardApi) : DashboardRepository {
    override suspend fun stats() = safeApiCall { api.stats() }
}
