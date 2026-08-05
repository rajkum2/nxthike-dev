package com.nxthike.android.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.UserDto
import com.nxthike.android.domain.repository.AuthRepository
import com.nxthike.android.presentation.common.UiState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val auth: AuthRepository,
) : ViewModel() {
    val isLoggedIn = auth.isLoggedIn.stateIn(viewModelScope, SharingStarted.Eagerly, false)

    private val _loginState = MutableStateFlow<UiState<UserDto>>(UiState.Idle)
    val loginState = _loginState.asStateFlow()

    private val _registerState = MutableStateFlow<UiState<UserDto>>(UiState.Idle)
    val registerState = _registerState.asStateFlow()

    fun login(email: String, password: String) = viewModelScope.launch {
        _loginState.value = UiState.Loading
        _loginState.value = when (val r = auth.login(email, password)) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun register(email: String, password: String, first: String, last: String, role: String) =
        viewModelScope.launch {
            _registerState.value = UiState.Loading
            _registerState.value = when (val r = auth.register(email, password, first, last, role)) {
                is AppResult.Success -> UiState.Success(r.data)
                is AppResult.Error -> UiState.Error(r.message)
            }
        }

    fun logout(onDone: () -> Unit) = viewModelScope.launch {
        auth.logout()
        onDone()
    }

    /**
     * Callback variants used by the TalentDialer screens, which keep their own
     * local form state and want the outcome inline rather than via a StateFlow.
     */
    fun login(email: String, password: String, onResult: (Boolean, String?) -> Unit) =
        viewModelScope.launch {
            when (val r = auth.login(email, password)) {
                is AppResult.Success -> onResult(true, null)
                is AppResult.Error -> onResult(false, r.message)
            }
        }

    fun register(
        email: String, password: String, first: String, last: String, role: String,
        onResult: (Boolean, String?) -> Unit,
    ) = viewModelScope.launch {
        when (val r = auth.register(email, password, first, last, role)) {
            is AppResult.Success -> onResult(true, null)
            is AppResult.Error -> onResult(false, r.message)
        }
    }
}
