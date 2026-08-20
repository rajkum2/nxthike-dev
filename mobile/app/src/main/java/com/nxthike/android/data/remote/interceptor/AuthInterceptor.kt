package com.nxthike.android.data.remote.interceptor

import com.nxthike.android.data.local.TokenStore
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Attaches the bearer token, and drops it when the server says it is no longer
 * good for anything.
 *
 * Tokens last eight hours. Without the 401 branch, an expired one produced a
 * signed-in-looking app where every request failed — and because each screen
 * reports its own failure as "check your connection", the user was told to fix
 * their network when what they needed was to sign in again. Clearing the token
 * flips `AuthRepository.isLoggedIn`, which routes back to the login screen.
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenStore: TokenStore,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { tokenStore.getToken() }
        val req = if (!token.isNullOrBlank()) {
            chain.request().newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }

        val response = chain.proceed(req)

        // A 401 from the credential endpoints means "wrong password", not
        // "expired session" — those must keep their error, and there is no
        // session to clear anyway.
        if (response.code == 401 && !token.isNullOrBlank() && !req.isCredentialRequest()) {
            runBlocking { tokenStore.clear() }
        }
        return response
    }

    private fun okhttp3.Request.isCredentialRequest(): Boolean {
        val path = url.encodedPath
        return path.endsWith("/api/auth/login") || path.endsWith("/api/auth/register")
    }
}
