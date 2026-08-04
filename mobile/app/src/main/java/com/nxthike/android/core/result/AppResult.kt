package com.nxthike.android.core.result

/**
 * Functional result type used across domain + data layers (Railway-oriented error handling).
 */
sealed class AppResult<out T> {
    data class Success<T>(val data: T) : AppResult<T>()
    data class Error(
        val message: String,
        val code: Int? = null,
        val cause: Throwable? = null,
    ) : AppResult<Nothing>()

    val isSuccess: Boolean get() = this is Success
    fun getOrNull(): T? = (this as? Success)?.data

    inline fun <R> map(transform: (T) -> R): AppResult<R> = when (this) {
        is Success -> Success(transform(data))
        is Error -> this
    }

    inline fun onSuccess(block: (T) -> Unit): AppResult<T> {
        if (this is Success) block(data)
        return this
    }

    inline fun onError(block: (Error) -> Unit): AppResult<T> {
        if (this is Error) block(this)
        return this
    }

    companion object {
        fun <T> success(data: T) = Success(data)
        fun error(message: String, code: Int? = null, cause: Throwable? = null) =
            Error(message, code, cause)
    }
}

suspend fun <T> safeApiCall(block: suspend () -> T): AppResult<T> = try {
    AppResult.Success(block())
} catch (e: retrofit2.HttpException) {
    val body = e.response()?.errorBody()?.string().orEmpty()
    val msg = body.ifBlank { e.message() }.ifBlank { "HTTP ${e.code()}" }
    AppResult.Error(msg, e.code(), e)
} catch (e: java.io.IOException) {
    AppResult.Error("Network error: ${e.localizedMessage ?: "offline"}", cause = e)
} catch (e: Exception) {
    AppResult.Error(e.localizedMessage ?: "Unexpected error", cause = e)
}
