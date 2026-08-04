package com.nxthike.android.presentation.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nxthike.android.presentation.common.NxtTopBar
import com.nxthike.android.presentation.common.PrimaryButton
import com.nxthike.android.presentation.common.UiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onRegistered: () -> Unit,
    onBack: () -> Unit,
    vm: AuthViewModel = hiltViewModel(),
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var first by remember { mutableStateOf("") }
    var last by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("student") }
    val state by vm.registerState.collectAsState()

    LaunchedEffect(state) { if (state is UiState.Success) onRegistered() }

    Scaffold(topBar = { NxtTopBar("Create account", onBack = onBack) }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
            OutlinedTextField(first, { first = it }, label = { Text("First name") }, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(last, { last = it }, label = { Text("Last name") }, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(password, { password = it }, label = { Text("Password") }, modifier = Modifier.fillMaxWidth(), visualTransformation = PasswordVisualTransformation())
            Spacer(Modifier.height(8.dp))
            Text("Role")
            Row {
                listOf("student", "employer").forEach { r ->
                    FilterChip(selected = role == r, onClick = { role = r }, label = { Text(r) }, modifier = Modifier.padding(end = 8.dp))
                }
            }
            if (state is UiState.Error) Text((state as UiState.Error).message, color = MaterialTheme.colorScheme.error)
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Register", onClick = { vm.register(email, password, first, last, role) }, loading = state is UiState.Loading)
        }
    }
}
