package com.nxthike.android.data.remote.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CourseDto(
    val id: String,
    val title: String,
    val description: String? = null,
    val instructor: String? = null,
    val category: String? = null,
    val level: String? = null,
    val duration: String? = null,
    val price: Double? = null,
    val discount: Double? = null,
    val image: String? = null,
    val enrollments: Int? = null,
    val instructorTitle: String? = null,
    val instructorAvatar: String? = null,
    val instructorBio: String? = null,
    val rating: Double? = null,
    val reviewCount: Int? = null,
)

@JsonClass(generateAdapter = true)
data class PaginatedCoursesDto(
    val items: List<CourseDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val per_page: Int = 9,
    val pages: Int = 0,
)

@JsonClass(generateAdapter = true)
data class CourseWriteDto(
    val title: String,
    val description: String = "",
    val instructor: String = "",
    val category: String = "General",
    val level: String = "beginner",
    val duration: String? = null,
    val price: Double = 0.0,
    val discount: Double? = null,
    val image: String? = null,
)
