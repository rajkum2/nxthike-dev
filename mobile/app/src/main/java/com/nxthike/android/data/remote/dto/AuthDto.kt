package com.nxthike.android.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class LoginRequest(
    val email: String,
    val password: String,
)

@JsonClass(generateAdapter = true)
data class RegisterRequest(
    val email: String,
    val password: String,
    @Json(name = "first_name") val firstName: String? = null,
    @Json(name = "last_name") val lastName: String? = null,
    val role: String = "student",
    @Json(name = "company_name") val companyName: String? = null,
)

@JsonClass(generateAdapter = true)
data class TokenResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "token_type") val tokenType: String? = "bearer",
    val user: UserDto,
)

@JsonClass(generateAdapter = true)
data class UserDto(
    val id: String,
    val email: String,
    val role: String,
    val firstName: String? = null,
    val lastName: String? = null,
    val profilePicture: String? = null,
    val createdAt: String? = null,
    val resume: String? = null,
    val skills: List<String>? = null,
    val companyName: String? = null,
    val companyLogo: String? = null,
    val companyDescription: String? = null,
    val industry: String? = null,
    val location: String? = null,
    val website: String? = null,
)

@JsonClass(generateAdapter = true)
data class ProfileUpdateRequest(
    val firstName: String? = null,
    val lastName: String? = null,
    val profilePicture: String? = null,
    val companyName: String? = null,
    val companyDescription: String? = null,
    val industry: String? = null,
    val location: String? = null,
    val website: String? = null,
    val skills: List<String>? = null,
)

@JsonClass(generateAdapter = true)
data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String,
)
