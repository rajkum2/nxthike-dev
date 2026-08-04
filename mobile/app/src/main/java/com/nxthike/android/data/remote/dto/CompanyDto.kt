package com.nxthike.android.data.remote.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CompanyDto(
    val id: String,
    val name: String,
    val logo: String? = null,
    val industry: String? = null,
    val location: String? = null,
    val openPositions: Int? = null,
    val description: String? = null,
    val website: String? = null,
)

@JsonClass(generateAdapter = true)
data class CompanyWriteDto(
    val name: String,
    val logo: String? = null,
    val industry: String? = null,
    val location: String? = null,
    val openPositions: Int = 0,
    val description: String? = null,
    val website: String? = null,
)
