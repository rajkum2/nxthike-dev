package com.nxthike.android.domain.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.*

interface CallRepository {
    suspend fun dispositions(): AppResult<List<CallDispositionDto>>
    suspend fun stats(): AppResult<CallStatsDto>
    suspend fun queue(
        roleId: String? = null,
        status: String? = null,
        search: String? = null,
        page: Int = 1,
        pageSize: Int = 50,
    ): AppResult<PaginatedCallQueueDto>
    suspend fun list(
        candidateId: String? = null,
        disposition: String? = null,
        roleId: String? = null,
        page: Int = 1,
        pageSize: Int = 50,
    ): AppResult<PaginatedCallLogDto>
    suspend fun logCall(body: CallLogCreateDto): AppResult<CallLogDto>
    /** Amend an already-logged outcome — used when a callback is rescheduled. */
    suspend fun patch(id: String, fields: Map<String, Any?>): AppResult<CallLogDto>
    suspend fun delete(id: String): AppResult<Unit>
}
