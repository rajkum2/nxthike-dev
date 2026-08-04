package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.AdminStatsDto
import retrofit2.http.GET

interface DashboardApi {
    @GET("api/dashboard/stats")
    suspend fun stats(): AdminStatsDto
}
