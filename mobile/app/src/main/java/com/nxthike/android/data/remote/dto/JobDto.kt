package com.nxthike.android.data.remote.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class MoneyDto(
    val amount: Double? = null,
    val currency: String? = null,
    val period: String? = null,
    val max: Double? = null,
    val raw: String? = null,
)

@JsonClass(generateAdapter = true)
data class JobDto(
    val id: String,
    val title: String,
    val company: String,
    val companyLogo: String? = null,
    val location: String? = null,
    val isRemote: Boolean = false,
    val type: String? = null,
    val category: String? = null,
    val description: String? = null,
    val requirements: List<String>? = null,
    val responsibilities: List<String>? = null,
    val salary: MoneyDto? = null,
    val stipend: MoneyDto? = null,
    val duration: String? = null,
    val applicationDeadline: String? = null,
    val postedBy: String? = null,
    val postedAt: String? = null,
    val status: String? = null,
    val applicants: List<String>? = null,
)

@JsonClass(generateAdapter = true)
data class PaginatedJobsDto(
    val items: List<JobDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val per_page: Int = 9,
    val pages: Int = 0,
)

@JsonClass(generateAdapter = true)
data class JobWriteDto(
    val title: String,
    val company: String,
    val companyLogo: String? = null,
    val location: String,
    val isRemote: Boolean = false,
    val type: String = "internship",
    val category: String = "Other",
    val description: String = "",
    val requirements: List<String> = emptyList(),
    val responsibilities: List<String> = emptyList(),
    val salary: MoneyDto? = null,
    val stipend: MoneyDto? = null,
    val duration: String? = null,
    val applicationDeadline: String? = null,
    val status: String? = "approved",
)
