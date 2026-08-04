package com.nxthike.android.presentation.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.ProfileUpdateRequest
import com.nxthike.android.data.remote.dto.UserDto
import com.nxthike.android.domain.repository.AuthRepository
import com.nxthike.android.presentation.auth.AuthViewModel
import com.nxthike.android.presentation.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class ProfileViewModel @Inject constructor(private val auth: AuthRepository) : ViewModel() {
    private val _user = MutableStateFlow<UiState<UserDto>>(UiState.Idle)
    val user = _user.asStateFlow()
    private val _save = MutableStateFlow<UiState<UserDto>>(UiState.Idle)
    val save = _save.asStateFlow()

    fun load() = viewModelScope.launch {
        _user.value = UiState.Loading
        val cached = auth.cachedUser()
        if (cached != null) _user.value = UiState.Success(cached)
        _user.value = when (val r = auth.me()) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> if (cached != null) UiState.Success(cached) else UiState.Error(r.message)
        }
    }

    fun update(first: String, last: String, location: String) = viewModelScope.launch {
        _save.value = UiState.Loading
        _save.value = when (val r = auth.updateProfile(
            ProfileUpdateRequest(firstName = first, lastName = last, location = location),
        )) {
            is AppResult.Success -> {
                _user.value = UiState.Success(r.data)
                UiState.Success(r.data)
            }
            is AppResult.Error -> UiState.Error(r.message)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onLoggedOut: () -> Unit,
    vm: ProfileViewModel = hiltViewModel(),
    authVm: AuthViewModel = hiltViewModel(),
) {
    val state by vm.user.collectAsState()
    val save by vm.save.collectAsState()
    var first by remember { mutableStateOf("") }
    var last by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(state) {
        val u = (state as? UiState.Success)?.data ?: return@LaunchedEffect
        first = u.firstName.orEmpty(); last = u.lastName.orEmpty(); location = u.location.orEmpty()
    }

    Scaffold(topBar = { NxtTopBar("Profile") }) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
                Text(s.data.email, fontWeight = FontWeight.SemiBold)
                Text("Role: ${s.data.role}")
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(first, { first = it }, label = { Text("First name") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(last, { last = it }, label = { Text("Last name") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(location, { location = it }, label = { Text("Location") }, modifier = Modifier.fillMaxWidth())
                if (save is UiState.Error) Text((save as UiState.Error).message, color = MaterialTheme.colorScheme.error)
                if (save is UiState.Success) Text("Saved", color = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.height(12.dp))
                PrimaryButton("Save profile", loading = save is UiState.Loading, onClick = { vm.update(first, last, location) })
                Spacer(Modifier.height(8.dp))
                OutlinedButton(onClick = { authVm.logout(onLoggedOut) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Sign out")
                }
            }
        }
    }
}
