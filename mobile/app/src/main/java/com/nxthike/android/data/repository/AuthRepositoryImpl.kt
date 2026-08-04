package com.nxthike.android.data.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.result.safeApiCall
import com.nxthike.android.data.local.TokenStore
import com.nxthike.android.data.remote.api.AuthApi
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.AuthRepository
import com.squareup.moshi.Moshi
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi,
    private val tokenStore: TokenStore,
    private val moshi: Moshi,
) : AuthRepository {

    private val userAdapter by lazy { moshi.adapter(UserDto::class.java) }

    override val isLoggedIn: Flow<Boolean> = tokenStore.tokenFlow.map { !it.isNullOrBlank() }

    override suspend fun login(email: String, password: String): AppResult<UserDto> =
        safeApiCall {
            val res = api.login(LoginRequest(email.trim(), password))
            tokenStore.saveSession(res.accessToken, userAdapter.toJson(res.user))
            res.user
        }

    override suspend fun register(
        email: String, password: String, firstName: String?, lastName: String?, role: String,
    ): AppResult<UserDto> = safeApiCall {
        val res = api.register(
            RegisterRequest(email.trim(), password, firstName, lastName, role),
        )
        tokenStore.saveSession(res.accessToken, userAdapter.toJson(res.user))
        res.user
    }

    override suspend fun me(): AppResult<UserDto> = safeApiCall {
        val user = api.me()
        tokenStore.saveSession(tokenStore.getToken().orEmpty(), userAdapter.toJson(user))
        user
    }

    override suspend fun updateProfile(body: ProfileUpdateRequest): AppResult<UserDto> =
        safeApiCall {
            val user = api.updateMe(body)
            tokenStore.getToken()?.let { tokenStore.saveSession(it, userAdapter.toJson(user)) }
            user
        }

    override suspend fun changePassword(current: String, new: String): AppResult<Unit> =
        safeApiCall {
            api.changePassword(ChangePasswordRequest(current, new))
            Unit
        }

    override suspend fun logout() = tokenStore.clear()

    override suspend fun cachedUser(): UserDto? =
        tokenStore.getUserJson()?.let { runCatching { userAdapter.fromJson(it) }.getOrNull() }
}
