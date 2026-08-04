package com.nxthike.android.presentation.jobs

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
import com.nxthike.android.data.remote.dto.JobWriteDto
import com.nxthike.android.presentation.common.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobsListScreen(onOpen: (String) -> Unit, onCreate: () -> Unit, vm: JobsViewModel = hiltViewModel()) {
    val state by vm.list.collectAsState()
    var query by remember { mutableStateOf("") }
    LaunchedEffect(Unit) { vm.load() }

    Scaffold(
        topBar = { NxtTopBar("Jobs & Internships") },
        floatingActionButton = { FloatingActionButton(onClick = onCreate) { Icon(Icons.Default.Add, null) } },
    ) { pad ->
        Column(Modifier.padding(pad)) {
            OutlinedTextField(
                query, {
                    query = it
                    vm.search = it
                },
                modifier = Modifier.fillMaxWidth().padding(12.dp),
                label = { Text("Search") },
                singleLine = true,
            )
            Row(Modifier.padding(horizontal = 12.dp)) {
                listOf(null to "All", "internship" to "Intern", "full-time" to "Full-time").forEach { (v, label) ->
                    FilterChip(selected = vm.typeFilter == v, onClick = { vm.typeFilter = v; vm.load() }, label = { Text(label) }, modifier = Modifier.padding(end = 8.dp))
                }
                Spacer(Modifier.weight(1f))
                TextButton(onClick = { vm.load() }) { Text("Go") }
            }
            when (val s = state) {
                UiState.Loading, UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() ; Unit })
                is UiState.Success -> {
                    if (s.data.isEmpty()) EmptyState("No jobs found")
                    else LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(s.data, key = { it.id }) { job ->
                            Card(Modifier.fillMaxWidth().clickable { onOpen(job.id) }) {
                                Column(Modifier.padding(14.dp)) {
                                    Text(job.title, fontWeight = FontWeight.SemiBold)
                                    Text("${job.company} · ${job.location ?: "—"}")
                                    Text("${job.type ?: "—"} · ${job.category ?: "—"}", style = MaterialTheme.typography.bodySmall)
                                }
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
fun JobDetailScreen(jobId: String, onBack: () -> Unit, onEdit: () -> Unit, vm: JobsViewModel = hiltViewModel()) {
    val state by vm.detail.collectAsState()
    LaunchedEffect(jobId) { vm.loadDetail(jobId) }
    Scaffold(topBar = {
        NxtTopBar("Job", onBack = onBack, actions = {
            IconButton(onClick = onEdit) { Icon(Icons.Default.Edit, null) }
            IconButton(onClick = { vm.delete(jobId, onBack) }) { Icon(Icons.Default.Delete, null) }
        })
    }) { pad ->
        when (val s = state) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadDetail(jobId) ; Unit }, modifier = Modifier.padding(pad))
            is UiState.Success -> {
                val j = s.data
                Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
                    Text(j.title, style = MaterialTheme.typography.headlineMedium)
                    Text(j.company, color = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.height(8.dp))
                    Text("${j.location} · remote=${j.isRemote}")
                    Text("Type: ${j.type} · ${j.category}")
                    j.duration?.let { Text("Duration: $it") }
                    j.stipend?.raw?.let { Text("Stipend: $it") }
                    Spacer(Modifier.height(12.dp))
                    Text(j.description.orEmpty())
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobEditScreen(jobId: String, onDone: () -> Unit, onBack: () -> Unit, vm: JobsViewModel = hiltViewModel()) {
    var title by remember { mutableStateOf("") }
    var company by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("internship") }
    var category by remember { mutableStateOf("Other") }
    var description by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }
    val save by vm.save.collectAsState()
    val isNew = jobId == "new"

    LaunchedEffect(jobId) {
        if (!isNew) {
            vm.loadDetail(jobId)
        }
    }
    val detail by vm.detail.collectAsState()
    LaunchedEffect(detail) {
        val j = (detail as? UiState.Success)?.data ?: return@LaunchedEffect
        title = j.title; company = j.company; location = j.location.orEmpty()
        type = j.type ?: "internship"; category = j.category ?: "Other"
        description = j.description.orEmpty(); duration = j.duration.orEmpty()
    }
    LaunchedEffect(save) { if (save is UiState.Success) onDone() }

    Scaffold(topBar = { NxtTopBar(if (isNew) "New job" else "Edit job", onBack = onBack) }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState())) {
            OutlinedTextField(title, { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(company, { company = it }, label = { Text("Company") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(location, { location = it }, label = { Text("Location") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(type, { type = it }, label = { Text("Type") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(category, { category = it }, label = { Text("Category") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(duration, { duration = it }, label = { Text("Duration") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(description, { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth().height(140.dp))
            if (save is UiState.Error) Text((save as UiState.Error).message, color = MaterialTheme.colorScheme.error)
            Spacer(Modifier.height(12.dp))
            PrimaryButton("Save", loading = save is UiState.Loading, onClick = {
                vm.save(if (isNew) null else jobId, JobWriteDto(title, company, location = location, type = type, category = category, description = description, duration = duration.ifBlank { null }))
            })
        }
    }
}
