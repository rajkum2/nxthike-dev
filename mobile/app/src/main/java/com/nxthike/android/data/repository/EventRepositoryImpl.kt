package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.remote.api.EventsApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.EventRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EventRepositoryImpl @Inject constructor(private val api: EventsApi) : EventRepository {
    override suspend fun list(page: Int) = safeApiCall { api.list(page = page) }
    override suspend fun get(id: String) = safeApiCall { api.get(id) }
    override suspend fun create(body: EventWriteDto) = safeApiCall { api.create(body) }
    override suspend fun update(id: String, body: EventWriteDto) = safeApiCall { api.update(id, body) }
    override suspend fun delete(id: String): AppResult<Unit> = safeApiCall { api.delete(id); Unit }
}
