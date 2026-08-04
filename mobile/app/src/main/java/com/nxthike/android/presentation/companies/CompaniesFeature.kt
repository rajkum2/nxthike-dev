package com.nxthike.android.presentation.companies

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.CompanyDto
import com.nxthike.android.data.remote.dto.CompanyWriteDto
import com.nxthike.android.domain.repository.CompanyRepository
import com.nxthike.android.presentation.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class CompaniesViewModel @Inject constructor(private val repo: CompanyRepository) : ViewModel() {
    private val _list = MutableStateFlow<UiState<List<CompanyDto>>>(UiState.Idle)
    val list = _list.asStateFlow()
    private val _detail = MutableStateFlow<UiState<CompanyDto>>(UiState.Idle)
    val detail = _detail.asStateFlow()
    private val _save = MutableStateFlow<UiState<CompanyDto>>(UiState.Idle)
    val save = _save.asStateFlow()

    fun load() = viewModelScope.launch {
        _list.value = UiState.Loading
        _list.value = when (val r = repo.list()) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun loadDetail(id: String) = viewModelScope.launch {
        _detail.value = UiState.Loading
        _detail.value = when (val r = repo.get(id)) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun save(id: String?, body: CompanyWriteDto) = viewModelScope.launch {
        _save.value = UiState.Loading
        val r = if (id == null || id == "new") repo.create(body) else repo.update(id, body)
        _save.value = when (r) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun delete(id: String, onDone: () -> Unit) = viewModelScope.launch {
        if (repo.delete(id) is AppResult.Success) onDone()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompaniesListScreen(onOpen: (String) -> Unit, onCreate: () -> Unit, onBack: () -> Unit, vm: CompaniesViewModel = hiltViewModel()) {
    val state by vm.list.collectAsState()
    LaunchedEffect(Unit) { vm.load() }
    Scaffold(
        topBar = { NxtTopBar("Companies", onBack = onBack) },
        floatingActionButton = { FloatingActionButton(onClick = onCreate) { Icon(Icons.Default.Add, null) } },
    ) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> LazyColumn(Modifier.padding(pad), contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(s.data, key = { it.id }) { c ->
                    Card(Modifier.fillMaxWidth().clickable { onOpen(c.id) }) {
                        Column(Modifier.padding(14.dp)) {
                            Text(c.name, fontWeight = FontWeight.SemiBold)
                            Text("${c.industry.orEmpty()} · ${c.location.orEmpty()}")
                            Text("Open: ${c.openPositions ?: 0}", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompanyDetailScreen(id: String, onBack: () -> Unit, onEdit: () -> Unit, vm: CompaniesViewModel = hiltViewModel()) {
    val state by vm.detail.collectAsState()
    LaunchedEffect(id) { vm.loadDetail(id) }
    Scaffold(topBar = {
        NxtTopBar("Company", onBack = onBack, actions = {
            IconButton(onClick = onEdit) { Icon(Icons.Default.Edit, null) }
            IconButton(onClick = { vm.delete(id, onBack) }) { Icon(Icons.Default.Delete, null) }
        })
    }) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadDetail(id) ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
                Text(s.data.name, style = MaterialTheme.typography.headlineMedium)
                Text(s.data.industry.orEmpty())
                Text(s.data.location.orEmpty())
                Text(s.data.website.orEmpty())
                Spacer(Modifier.height(8.dp))
                Text(s.data.description.orEmpty())
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompanyEditScreen(id: String, onDone: () -> Unit, onBack: () -> Unit, vm: CompaniesViewModel = hiltViewModel()) {
    var name by remember { mutableStateOf("") }
    var industry by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var website by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    val save by vm.save.collectAsState()
    val isNew = id == "new"
    LaunchedEffect(id) { if (!isNew) vm.loadDetail(id) }
    val detail by vm.detail.collectAsState()
    LaunchedEffect(detail) {
        val c = (detail as? UiState.Success)?.data ?: return@LaunchedEffect
        name = c.name; industry = c.industry.orEmpty(); location = c.location.orEmpty()
        website = c.website.orEmpty(); description = c.description.orEmpty()
    }
    LaunchedEffect(save) { if (save is UiState.Success) onDone() }
    Scaffold(topBar = { NxtTopBar(if (isNew) "New company" else "Edit company", onBack = onBack) }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
            OutlinedTextField(name, { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(industry, { industry = it }, label = { Text("Industry") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(location, { location = it }, label = { Text("Location") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(website, { website = it }, label = { Text("Website") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(description, { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth().height(120.dp))
            if (save is UiState.Error) Text((save as UiState.Error).message, color = MaterialTheme.colorScheme.error)
            Spacer(Modifier.height(12.dp))
            PrimaryButton("Save", loading = save is UiState.Loading, onClick = {
                vm.save(if (isNew) null else id, CompanyWriteDto(name, industry = industry, location = location, description = description, website = website))
            })
        }
    }
}
