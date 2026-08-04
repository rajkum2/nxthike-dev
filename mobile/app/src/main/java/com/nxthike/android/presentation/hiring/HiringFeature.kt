package com.nxthike.android.presentation.hiring

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.util.PipelineStatus
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.presentation.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class HiringViewModel @Inject constructor(private val repo: HiringRepository) : ViewModel() {
    private val _dashboard = MutableStateFlow<UiState<HiringDashboardDto>>(UiState.Idle)
    val dashboard = _dashboard.asStateFlow()
    private val _candidates = MutableStateFlow<UiState<List<CandidateDto>>>(UiState.Idle)
    val candidates = _candidates.asStateFlow()
    private val _detail = MutableStateFlow<UiState<CandidateDto>>(UiState.Idle)
    val detail = _detail.asStateFlow()
    private val _roles = MutableStateFlow<UiState<List<HiringRoleDto>>>(UiState.Idle)
    val roles = _roles.asStateFlow()
    private val _save = MutableStateFlow<UiState<CandidateDto>>(UiState.Idle)
    val save = _save.asStateFlow()
    private val _total = MutableStateFlow(0)
    val total = _total.asStateFlow()

    var search = ""
    var roleId: String? = null
    var status: String? = null

    fun loadDashboard() = viewModelScope.launch {
        _dashboard.value = UiState.Loading
        _dashboard.value = when (val r = repo.dashboard(null)) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun loadCandidates(page: Int = 1) = viewModelScope.launch {
        _candidates.value = UiState.Loading
        when (val r = repo.candidates(search.ifBlank { null }, roleId, status, page, 50)) {
            is AppResult.Success -> {
                _total.value = r.data.total
                _candidates.value = UiState.Success(r.data.items)
            }
            is AppResult.Error -> _candidates.value = UiState.Error(r.message)
        }
    }

    fun loadDetail(id: String) = viewModelScope.launch {
        _detail.value = UiState.Loading
        _detail.value = when (val r = repo.getCandidate(id)) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun loadRoles() = viewModelScope.launch {
        _roles.value = UiState.Loading
        _roles.value = when (val r = repo.roles()) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun createRole(id: String, name: String, onDone: () -> Unit) = viewModelScope.launch {
        if (repo.createRole(HiringRoleWriteDto(id, name)) is AppResult.Success) {
            loadRoles(); onDone()
        }
    }

    fun deleteRole(id: String) = viewModelScope.launch {
        repo.deleteRole(id); loadRoles()
    }

    fun patchStatus(id: String, status: String) = viewModelScope.launch {
        repo.patchCandidate(id, CandidatePatchDto(status = status))
        loadDetail(id)
    }

    fun toggleStar(c: CandidateDto) = viewModelScope.launch {
        repo.patchCandidate(c.id, CandidatePatchDto(starred = !c.starred))
        loadDetail(c.id)
        loadCandidates()
    }

    fun saveCandidate(id: String?, body: CandidateWriteDto) = viewModelScope.launch {
        _save.value = UiState.Loading
        val result = if (id == null || id == "new") {
            repo.createCandidate(body)
        } else {
            repo.patchCandidate(
                id,
                CandidatePatchDto(
                    roleId = body.roleId,
                    roleName = body.roleName,
                    status = body.status,
                    notes = body.notes,
                    name = body.name,
                    phone = body.phone,
                    email = body.email,
                    city = body.city,
                    institute = body.institute,
                    degree = body.degree,
                    latestRole = body.latestRole,
                    resumeLink = body.resumeLink,
                ),
            )
        }
        _save.value = when (result) {
            is AppResult.Success -> UiState.Success(result.data)
            is AppResult.Error -> UiState.Error(result.message)
        }
    }

    fun deleteCandidate(id: String, onDone: () -> Unit) = viewModelScope.launch {
        if (repo.deleteCandidate(id) is AppResult.Success) onDone()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HiringHomeScreen(
    onCandidates: () -> Unit,
    onRoles: () -> Unit,
    onOpenCandidate: (String) -> Unit,
    vm: HiringViewModel = hiltViewModel(),
) {
    val dash by vm.dashboard.collectAsState()
    LaunchedEffect(Unit) { vm.loadDashboard() }
    Scaffold(topBar = { NxtTopBar("Hiring CRM") }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
            when (val s = dash) {
                UiState.Loading, UiState.Idle -> CircularProgressIndicator()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadDashboard() ; Unit })
                is UiState.Success -> {
                    Text("Pipeline overview", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatChip("Total", s.data.total.toString(), Modifier.weight(1f))
                        StatChip("Starred", s.data.starred.toString(), Modifier.weight(1f))
                        StatChip("With exp", s.data.withExp.toString(), Modifier.weight(1f))
                    }
                    Spacer(Modifier.height(16.dp))
                    Text("By status", fontWeight = FontWeight.Medium)
                    s.data.byStatus.forEach { (k, v) ->
                        if (v > 0) Text("${PipelineStatus.label(k)}: $v")
                    }
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = onCandidates, modifier = Modifier.fillMaxWidth()) { Text("All candidates") }
                    OutlinedButton(onClick = onRoles, modifier = Modifier.fillMaxWidth()) { Text("Manage roles") }
                    Spacer(Modifier.height(12.dp))
                    Text("Roles", fontWeight = FontWeight.Medium)
                    s.data.roles.take(12).forEach { r ->
                        ListItem(
                            headlineContent = { Text(r.name) },
                            supportingContent = { Text("${r.count} candidates") },
                            modifier = Modifier.clickable {
                                vm.roleId = r.id
                                onCandidates()
                            },
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CandidatesListScreen(
    onOpen: (String) -> Unit,
    onCreate: () -> Unit,
    onBack: () -> Unit,
    vm: HiringViewModel = hiltViewModel(),
) {
    val state by vm.candidates.collectAsState()
    val total by vm.total.collectAsState()
    var query by remember { mutableStateOf(vm.search) }
    LaunchedEffect(Unit) { vm.loadCandidates() }

    Scaffold(
        topBar = { NxtTopBar("Candidates ($total)", onBack = onBack) },
        floatingActionButton = { FloatingActionButton(onClick = onCreate) { Icon(Icons.Default.Add, null) } },
    ) { pad ->
        Column(Modifier.padding(pad)) {
            OutlinedTextField(
                query, { query = it; vm.search = it },
                modifier = Modifier.fillMaxWidth().padding(12.dp),
                label = { Text("Search name, email, phone…") },
                singleLine = true,
                trailingIcon = { IconButton(onClick = { vm.loadCandidates() }) { Icon(Icons.Default.Search, null) } },
            )
            Row(Modifier.padding(horizontal = 12.dp)) {
                FilterChip(selected = vm.status == null, onClick = { vm.status = null; vm.loadCandidates() }, label = { Text("All") })
                Spacer(Modifier.width(6.dp))
                listOf("new", "interview", "offer", "hired", "on_hold").forEach { st ->
                    FilterChip(
                        selected = vm.status == st,
                        onClick = { vm.status = st; vm.loadCandidates() },
                        label = { Text(PipelineStatus.label(st)) },
                        modifier = Modifier.padding(end = 4.dp),
                    )
                }
            }
            when (val s = state) {
                UiState.Loading, UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadCandidates() ; Unit })
                is UiState.Success -> LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(s.data, key = { it.id }) { c ->
                        Card(Modifier.fillMaxWidth().clickable { onOpen(c.id) }) {
                            Column(Modifier.padding(14.dp)) {
                                Row {
                                    Text(c.name ?: "Unnamed", fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                                    if (c.starred) Icon(Icons.Default.Star, null, tint = MaterialTheme.colorScheme.secondary)
                                }
                                Text("${c.roleName} · ${PipelineStatus.label(c.status)}")
                                Text(listOfNotNull(c.phone, c.email, c.city).joinToString(" · "), style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CandidateDetailScreen(id: String, onBack: () -> Unit, onEdit: () -> Unit, vm: HiringViewModel = hiltViewModel()) {
    val state by vm.detail.collectAsState()
    LaunchedEffect(id) { vm.loadDetail(id) }
    Scaffold(topBar = {
        NxtTopBar("Candidate", onBack = onBack, actions = {
            IconButton(onClick = onEdit) { Icon(Icons.Default.Edit, null) }
            IconButton(onClick = { vm.deleteCandidate(id, onBack) }) { Icon(Icons.Default.Delete, null) }
        })
    }) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadDetail(id) ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> {
                val c = s.data
                Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
                    Row {
                        Text(c.name ?: "—", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.weight(1f))
                        IconButton(onClick = { vm.toggleStar(c) }) {
                            Icon(if (c.starred) Icons.Default.Star else Icons.Default.StarBorder, null)
                        }
                    }
                    Text("${c.roleName} · ${PipelineStatus.label(c.status)}")
                    Spacer(Modifier.height(8.dp))
                    Text("Phone: ${c.phone ?: "—"}")
                    Text("Email: ${c.email ?: "—"}")
                    Text("City: ${c.city ?: "—"}")
                    Text("Institute: ${c.institute ?: "—"}")
                    Text("Degree: ${c.degree ?: "—"}")
                    Text("Experience: ${c.experienceDuration ?: "—"} (${c.hasWorkExperience ?: "—"})")
                    Text("Latest: ${c.latestRole ?: "—"} @ ${c.latestCompany ?: "—"}")
                    c.resumeLink?.let { Text("Resume: $it") }
                    Spacer(Modifier.height(12.dp))
                    Text("Move status", fontWeight = FontWeight.Medium)
                    Row(Modifier.fillMaxWidth()) {
                        PipelineStatus.ALL.take(4).forEach { st ->
                            AssistChip(
                                onClick = { vm.patchStatus(id, st) },
                                label = { Text(PipelineStatus.label(st), style = MaterialTheme.typography.labelSmall) },
                                modifier = Modifier.padding(end = 4.dp),
                            )
                        }
                    }
                    Row {
                        PipelineStatus.ALL.drop(4).forEach { st ->
                            AssistChip(
                                onClick = { vm.patchStatus(id, st) },
                                label = { Text(PipelineStatus.label(st), style = MaterialTheme.typography.labelSmall) },
                                modifier = Modifier.padding(end = 4.dp),
                            )
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Text("Notes", fontWeight = FontWeight.Medium)
                    Text(c.notes.ifBlank { "—" })
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CandidateEditScreen(id: String, onDone: () -> Unit, onBack: () -> Unit, vm: HiringViewModel = hiltViewModel()) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var roleId by remember { mutableStateOf("interview_pipeline") }
    var roleName by remember { mutableStateOf("Interview Pipeline") }
    var status by remember { mutableStateOf("interview") }
    var city by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var institute by remember { mutableStateOf("") }
    var degree by remember { mutableStateOf("") }
    var latestRole by remember { mutableStateOf("") }
    val save by vm.save.collectAsState()
    val isNew = id == "new"
    LaunchedEffect(id) { if (!isNew) vm.loadDetail(id); vm.loadRoles() }
    val detail by vm.detail.collectAsState()
    LaunchedEffect(detail) {
        val c = (detail as? UiState.Success)?.data ?: return@LaunchedEffect
        name = c.name.orEmpty(); phone = c.phone.orEmpty(); email = c.email.orEmpty()
        roleId = c.roleId; roleName = c.roleName; status = c.status
        city = c.city.orEmpty(); notes = c.notes; institute = c.institute.orEmpty()
        degree = c.degree.orEmpty(); latestRole = c.latestRole.orEmpty()
    }
    LaunchedEffect(save) { if (save is UiState.Success) onDone() }

    Scaffold(topBar = { NxtTopBar(if (isNew) "New candidate" else "Edit candidate", onBack = onBack) }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
            OutlinedTextField(name, { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(roleId, { roleId = it }, label = { Text("Role id") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(roleName, { roleName = it }, label = { Text("Role name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(status, { status = it }, label = { Text("Status") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(city, { city = it }, label = { Text("City") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(institute, { institute = it }, label = { Text("Institute") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(degree, { degree = it }, label = { Text("Degree") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(latestRole, { latestRole = it }, label = { Text("Latest role") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(notes, { notes = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth().height(100.dp))
            if (save is UiState.Error) Text((save as UiState.Error).message, color = MaterialTheme.colorScheme.error)
            Spacer(Modifier.height(12.dp))
            PrimaryButton("Save", loading = save is UiState.Loading, onClick = {
                vm.saveCandidate(
                    if (isNew) null else id,
                    CandidateWriteDto(
                        roleId = roleId, roleName = roleName, status = status, notes = notes,
                        name = name.ifBlank { null }, phone = phone.ifBlank { null },
                        email = email.ifBlank { null }, city = city.ifBlank { null },
                        institute = institute.ifBlank { null }, degree = degree.ifBlank { null },
                        latestRole = latestRole.ifBlank { null },
                    ),
                )
            })
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RolesScreen(onBack: () -> Unit, vm: HiringViewModel = hiltViewModel()) {
    val state by vm.roles.collectAsState()
    var newId by remember { mutableStateOf("") }
    var newName by remember { mutableStateOf("") }
    LaunchedEffect(Unit) { vm.loadRoles() }
    Scaffold(topBar = { NxtTopBar("Hiring roles", onBack = onBack) }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp)) {
            OutlinedTextField(newId, { newId = it }, label = { Text("Role id (slug)") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(newName, { newName = it }, label = { Text("Display name") }, modifier = Modifier.fillMaxWidth())
            Button(onClick = {
                if (newId.isNotBlank() && newName.isNotBlank()) {
                    vm.createRole(newId.trim(), newName.trim()) { newId = ""; newName = "" }
                }
            }, modifier = Modifier.fillMaxWidth()) { Text("Add role") }
            Spacer(Modifier.height(12.dp))
            when (val s = state) {
                UiState.Loading, UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadRoles() ; Unit })
                is UiState.Success -> LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(s.data, key = { it.id }) { r ->
                        ListItem(
                            headlineContent = { Text(r.name) },
                            supportingContent = { Text("${r.id} · ${r.count} candidates") },
                            trailingContent = {
                                IconButton(onClick = { vm.deleteRole(r.id) }) {
                                    Icon(Icons.Default.Delete, null)
                                }
                            },
                        )
                    }
                }
            }
        }
    }
}
