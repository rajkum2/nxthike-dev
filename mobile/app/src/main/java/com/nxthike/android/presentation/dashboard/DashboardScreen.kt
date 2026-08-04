package com.nxthike.android.presentation.dashboard

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
import com.nxthike.android.data.remote.dto.AdminStatsDto
import com.nxthike.android.domain.repository.DashboardRepository
import com.nxthike.android.presentation.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class DashboardViewModel @Inject constructor(private val repo: DashboardRepository) : ViewModel() {
    private val _state = MutableStateFlow<UiState<AdminStatsDto>>(UiState.Idle)
    val state = _state.asStateFlow()
    fun load() = viewModelScope.launch {
        _state.value = UiState.Loading
        _state.value = when (val r = repo.stats()) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(vm: DashboardViewModel = hiltViewModel()) {
    val state by vm.state.collectAsState()
    LaunchedEffect(Unit) { vm.load() }
    Scaffold(topBar = { NxtTopBar("Admin stats") }) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> {
                val d = s.data
                Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Platform overview", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatChip("Jobs", d.jobs.toString(), Modifier.weight(1f))
                        StatChip("Internships", d.internships.toString(), Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatChip("Candidates", d.candidates.toString(), Modifier.weight(1f))
                        StatChip("Roles", d.hiringRoles.toString(), Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatChip("Events", d.events.toString(), Modifier.weight(1f))
                        StatChip("Courses", d.courses.toString(), Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatChip("Companies", d.companies.toString(), Modifier.weight(1f))
                        StatChip("Users", d.users.toString(), Modifier.weight(1f))
                    }
                    Text("Pending jobs: ${d.pendingJobs} · Admins: ${d.admins}")
                }
            }
        }
    }
}
