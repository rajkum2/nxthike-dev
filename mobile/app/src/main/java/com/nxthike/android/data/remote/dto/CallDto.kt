package com.nxthike.android.data.remote.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CallDispositionDto(
    val id: String,
    val label: String,
    val category: String = "",
)

@JsonClass(generateAdapter = true)
data class CallQueueItemDto(
    val candidateId: String,
    val name: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val city: String? = null,
    val roleId: String = "",
    val roleName: String = "",
    val status: String = "new",
    val notes: String = "",
    val lastDisposition: String? = null,
    val lastCalledAt: String? = null,
    val starred: Boolean = false,
)

@JsonClass(generateAdapter = true)
data class PaginatedCallQueueDto(
    val items: List<CallQueueItemDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val pageSize: Int = 50,
    val totalPages: Int = 1,
)

@JsonClass(generateAdapter = true)
data class CallLogDto(
    val id: String,
    val candidateId: String,
    val candidateName: String? = null,
    val candidatePhone: String? = null,
    val roleId: String? = null,
    val roleName: String? = null,
    val userId: String? = null,
    val userEmail: String? = null,
    val disposition: String = "no_answer",
    val note: String = "",
    val durationSeconds: Int? = null,
    val durationEstimated: Boolean = false,
    val callbackAt: String? = null,
    val nextAction: String? = null,
    val calledAt: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class PaginatedCallLogDto(
    val items: List<CallLogDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val pageSize: Int = 50,
    val totalPages: Int = 1,
)

@JsonClass(generateAdapter = true)
data class CallLogCreateDto(
    val candidateId: String,
    val disposition: String = "no_answer",
    val note: String = "",
    val durationSeconds: Int? = null,
    val durationEstimated: Boolean = false,
    val nextAction: String? = null,
    val candidateName: String? = null,
    val candidatePhone: String? = null,
    val roleId: String? = null,
    val roleName: String? = null,
    /** ISO-8601 local date-time; set when the outcome schedules a callback. */
    val callbackAt: String? = null,
    /** Set when replaying a disposition captured offline, so the log keeps its real time. */
    val calledAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class CallStatsDto(
    val todayCount: Int = 0,
    val totalCount: Int = 0,
    val byDisposition: Map<String, Int> = emptyMap(),
    val callbacksDue: Int = 0,
)
