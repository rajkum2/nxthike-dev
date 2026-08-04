package com.nxthike.android.presentation.events

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
import com.nxthike.android.data.remote.dto.EventDto
import com.nxthike.android.data.remote.dto.EventWriteDto
import com.nxthike.android.domain.repository.EventRepository
import com.nxthike.android.presentation.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class EventsViewModel @Inject constructor(private val repo: EventRepository) : ViewModel() {
    private val _list = MutableStateFlow<UiState<List<EventDto>>>(UiState.Idle)
    val list = _list.asStateFlow()
    private val _detail = MutableStateFlow<UiState<EventDto>>(UiState.Idle)
    val detail = _detail.asStateFlow()
    private val _save = MutableStateFlow<UiState<EventDto>>(UiState.Idle)
    val save = _save.asStateFlow()

    fun load() = viewModelScope.launch {
        _list.value = UiState.Loading
        _list.value = when (val r = repo.list(1)) {
            is AppResult.Success -> UiState.Success(r.data.items)
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

    fun save(id: String?, body: EventWriteDto) = viewModelScope.launch {
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
fun EventsListScreen(onOpen: (String) -> Unit, onCreate: () -> Unit, onBack: () -> Unit, vm: EventsViewModel = hiltViewModel()) {
    val state by vm.list.collectAsState()
    LaunchedEffect(Unit) { vm.load() }
    Scaffold(
        topBar = { NxtTopBar("Events", onBack = onBack) },
        floatingActionButton = { FloatingActionButton(onClick = onCreate) { Icon(Icons.Default.Add, null) } },
    ) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> LazyColumn(Modifier.padding(pad), contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(s.data, key = { it.id }) { e ->
                    Card(Modifier.fillMaxWidth().clickable { onOpen(e.id) }) {
                        Column(Modifier.padding(14.dp)) {
                            Text(e.title, fontWeight = FontWeight.SemiBold)
                            Text("${e.date.orEmpty()} · ${e.location.orEmpty()}")
                            Text(e.type.orEmpty(), style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventDetailScreen(id: String, onBack: () -> Unit, onEdit: () -> Unit, vm: EventsViewModel = hiltViewModel()) {
    val state by vm.detail.collectAsState()
    LaunchedEffect(id) { vm.loadDetail(id) }
    Scaffold(topBar = {
        NxtTopBar("Event", onBack = onBack, actions = {
            IconButton(onClick = onEdit) { Icon(Icons.Default.Edit, null) }
            IconButton(onClick = { vm.delete(id, onBack) }) { Icon(Icons.Default.Delete, null) }
        })
    }) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadDetail(id) ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
                Text(s.data.title, style = MaterialTheme.typography.headlineMedium)
                Text("${s.data.date} ${s.data.time.orEmpty()}")
                Text(s.data.location.orEmpty())
                Spacer(Modifier.height(8.dp))
                Text(s.data.description.orEmpty())
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventEditScreen(id: String, onDone: () -> Unit, onBack: () -> Unit, vm: EventsViewModel = hiltViewModel()) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("webinar") }
    val save by vm.save.collectAsState()
    val isNew = id == "new"
    LaunchedEffect(id) { if (!isNew) vm.loadDetail(id) }
    val detail by vm.detail.collectAsState()
    LaunchedEffect(detail) {
        val e = (detail as? UiState.Success)?.data ?: return@LaunchedEffect
        title = e.title; description = e.description.orEmpty(); date = e.date.orEmpty()
        location = e.location.orEmpty(); type = e.type ?: "webinar"
    }
    LaunchedEffect(save) { if (save is UiState.Success) onDone() }
    Scaffold(topBar = { NxtTopBar(if (isNew) "New event" else "Edit event", onBack = onBack) }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
            OutlinedTextField(title, { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(date, { date = it }, label = { Text("Date") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(location, { location = it }, label = { Text("Location") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(type, { type = it }, label = { Text("Type") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(description, { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth().height(120.dp))
            if (save is UiState.Error) Text((save as UiState.Error).message, color = MaterialTheme.colorScheme.error)
            Spacer(Modifier.height(12.dp))
            PrimaryButton("Save", loading = save is UiState.Loading, onClick = {
                vm.save(if (isNew) null else id, EventWriteDto(title, description, type, date, location = location))
            })
        }
    }
}
