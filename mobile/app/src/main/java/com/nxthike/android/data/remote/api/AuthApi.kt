package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

interface AuthApi {
    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): TokenResponse

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): TokenResponse

    @GET("api/auth/me")
    suspend fun me(): UserDto

    @PATCH("api/auth/me")
    suspend fun updateMe(@Body body: ProfileUpdateRequest): UserDto

    @POST("api/auth/change-password")
    suspend fun changePassword(@Body body: ChangePasswordRequest): Map<String, Any>

    @GET("api/auth/users")
    suspend fun listUsers(): List<UserDto>
}
