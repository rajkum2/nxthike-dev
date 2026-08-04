package com.nxthike.android.data.remote.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class EventDto(
    val id: String,
    val title: String,
    val description: String? = null,
    val type: String? = null,
    val date: String? = null,
    val time: String? = null,
    val location: String? = null,
    val isOnline: Boolean = false,
    val link: String? = null,
    val organizer: String? = null,
    val image: String? = null,
    val registrations: List<String>? = null,
    val address: String? = null,
    val organizerLogo: String? = null,
    val attendees: Int? = null,
    val maxAttendees: Int? = null,
)

@JsonClass(generateAdapter = true)
data class PaginatedEventsDto(
    val items: List<EventDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val per_page: Int = 9,
    val pages: Int = 0,
)

@JsonClass(generateAdapter = true)
data class EventWriteDto(
    val title: String,
    val description: String = "",
    val type: String = "webinar",
    val date: String = "",
    val time: String? = null,
    val location: String? = null,
    val isOnline: Boolean = true,
    val link: String? = null,
    val organizer: String? = null,
    val image: String? = null,
)
