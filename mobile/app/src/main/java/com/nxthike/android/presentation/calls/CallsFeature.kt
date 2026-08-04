package com.nxthike.android.presentation.calls

import android.content.Context
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.core.telephony.DialerHelper
import com.nxthike.android.data.remote.dto.*
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.presentation.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class CallsViewModel @Inject constructor(
    private val repo: CallRepository,
) : ViewModel() {
    private val _queue = MutableStateFlow<UiState<List<CallQueueItemDto>>>(UiState.Idle)
    val queue = _queue.asStateFlow()
    private val _history = MutableStateFlow<UiState<List<CallLogDto>>>(UiState.Idle)
    val history = _history.asStateFlow()
    private val _stats = MutableStateFlow<CallStatsDto?>(null)
    val stats = _stats.asStateFlow()
    private val _dispositions = MutableStateFlow<List<CallDispositionDto>>(emptyList())
    val dispositions = _dispositions.asStateFlow()
    private val _save = MutableStateFlow<UiState<CallLogDto>>(UiState.Idle)
    val save = _save.asStateFlow()
    private val _queueTotal = MutableStateFlow(0)
    val queueTotal = _queueTotal.asStateFlow()

    var search = ""
    var roleId: String? = null

    fun loadQueue() = viewModelScope.launch {
        _queue.value = UiState.Loading
        when (val r = repo.queue(roleId = roleId, search = search.ifBlank { null })) {
            is AppResult.Success -> {
                _queueTotal.value = r.data.total
                _queue.value = UiState.Success(r.data.items)
            }
            is AppResult.Error -> _queue.value = UiState.Error(r.message)
        }
    }

    fun loadHistory(candidateId: String? = null) = viewModelScope.launch {
        _history.value = UiState.Loading
        when (val r = repo.list(candidateId = candidateId)) {
            is AppResult.Success -> _history.value = UiState.Success(r.data.items)
            is AppResult.Error -> _history.value = UiState.Error(r.message)
        }
    }

    fun loadMeta() = viewModelScope.launch {
        when (val r = repo.dispositions()) {
            is AppResult.Success -> _dispositions.value = r.data
            is AppResult.Error -> { /* keep empty; UI has fallback labels */ }
        }
        when (val r = repo.stats()) {
            is AppResult.Success -> _stats.value = r.data
            is AppResult.Error -> {}
        }
    }

    fun logCall(
        candidateId: String,
        disposition: String,
        note: String,
        durationSec: Int?,
        name: String?,
        phone: String?,
        roleId: String?,
        roleName: String?,
        onDone: () -> Unit,
    ) = viewModelScope.launch {
        _save.value = UiState.Loading
        val body = CallLogCreateDto(
            candidateId = candidateId,
            disposition = disposition,
            note = note,
            durationSeconds = durationSec,
            durationEstimated = false,
            candidateName = name,
            candidatePhone = phone,
            roleId = roleId,
            roleName = roleName,
            nextAction = if (disposition == "connected_callback") "callback" else null,
        )
        when (val r = repo.logCall(body)) {
            is AppResult.Success -> {
                _save.value = UiState.Success(r.data)
                loadQueue()
                loadMeta()
                onDone()
            }
            is AppResult.Error -> _save.value = UiState.Error(r.message)
        }
    }

    fun deleteCall(id: String) = viewModelScope.launch {
        repo.delete(id)
        loadHistory()
        loadMeta()
    }

    fun resetSave() { _save.value = UiState.Idle }
}

private val FALLBACK_DISPOSITIONS = listOf(
    CallDispositionDto("connected_interested", "Interested", "reached"),
    CallDispositionDto("connected_callback", "Callback", "reached"),
    CallDispositionDto("connected_not_interested", "Not interested", "reached"),
    CallDispositionDto("screening_passed", "Screening OK", "reached"),
    CallDispositionDto("screening_failed", "Screening fail", "reached"),
    CallDispositionDto("no_answer", "No answer", "not_reached"),
    CallDispositionDto("busy", "Busy", "not_reached"),
    CallDispositionDto("voicemail", "Voicemail", "not_reached"),
    CallDispositionDto("wrong_number", "Wrong number", "data"),
    CallDispositionDto("not_reachable", "Not reachable", "data"),
    CallDispositionDto("do_not_call", "Do not call", "compliance"),
)

fun dispositionLabel(id: String, list: List<CallDispositionDto>): String =
    list.firstOrNull { it.id == id }?.label ?: id.replace('_', ' ')

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CallsHubScreen(
    onOpenLog: (CallQueueItemDto) -> Unit,
    onHistory: () -> Unit,
    onOpenCandidate: (String) -> Unit,
    vm: CallsViewModel = hiltViewModel(),
) {
    val queue by vm.queue.collectAsState()
    val stats by vm.stats.collectAsState()
    val total by vm.queueTotal.collectAsState()
    var query by remember { mutableStateOf("") }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        vm.loadMeta()
        vm.loadQueue()
    }

    Scaffold(
        topBar = {
            NxtTopBar(
                "Calls",
                actions = {
                    IconButton(onClick = onHistory) {
                        Icon(Icons.Default.History, contentDescription = "History")
                    }
                },
            )
        },
    ) { pad ->
        Column(Modifier.padding(pad)) {
            // Stats strip
            stats?.let { s ->
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    StatChip("Today", s.todayCount.toString(), Modifier.weight(1f))
                    StatChip("All logs", s.totalCount.toString(), Modifier.weight(1f))
                    StatChip("Queue", total.toString(), Modifier.weight(1f))
                }
            }
            Text(
                "Dial with your phone, then log the outcome here.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f),
                modifier = Modifier.padding(horizontal = 16.dp),
            )
            OutlinedTextField(
                query,
                {
                    query = it
                    vm.search = it
                },
                modifier = Modifier.fillMaxWidth().padding(12.dp),
                label = { Text("Search queue") },
                singleLine = true,
                trailingIcon = {
                    IconButton(onClick = { vm.loadQueue() }) {
                        Icon(Icons.Default.Search, null)
                    }
                },
            )
            when (val s = queue) {
                UiState.Loading, UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadQueue() })
                is UiState.Success -> {
                    if (s.data.isEmpty()) EmptyState("No candidates with phone in active stages")
                    else LazyColumn(
                        contentPadding = PaddingValues(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(s.data, key = { it.candidateId }) { item ->
                            CallQueueCard(
                                item = item,
                                onDial = { DialerHelper.dial(context, item.phone) },
                                onWhatsApp = { DialerHelper.openWhatsApp(context, item.phone) },
                                onLog = { onOpenLog(item) },
                                onOpen = { onOpenCandidate(item.candidateId) },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CallQueueCard(
    item: CallQueueItemDto,
    onDial: () -> Unit,
    onWhatsApp: () -> Unit,
    onLog: () -> Unit,
    onOpen: () -> Unit,
) {
    androidx.compose.material3.Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onOpen),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(item.name ?: "Unnamed", fontWeight = FontWeight.SemiBold)
            Text(
                listOfNotNull(item.phone, item.roleName, item.status).joinToString(" · "),
                style = MaterialTheme.typography.bodySmall,
            )
            item.lastDisposition?.let {
                Text("Last: ${it.replace('_', ' ')}", style = MaterialTheme.typography.labelSmall)
            }
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilledTonalButton(onClick = onDial, contentPadding = PaddingValues(horizontal = 12.dp)) {
                    Icon(Icons.Default.Call, null, Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Dial")
                }
                OutlinedButton(onClick = onWhatsApp, contentPadding = PaddingValues(horizontal = 12.dp)) {
                    Icon(Icons.Default.Chat, null, Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("WA")
                }
                Button(onClick = onLog, contentPadding = PaddingValues(horizontal = 12.dp)) {
                    Icon(Icons.Default.EditNote, null, Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Log")
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogCallScreen(
    candidateId: String,
    name: String?,
    phone: String?,
    roleId: String?,
    roleName: String?,
    onDone: () -> Unit,
    onBack: () -> Unit,
    vm: CallsViewModel = hiltViewModel(),
) {
    val dispositions by vm.dispositions.collectAsState()
    val save by vm.save.collectAsState()
    val list = dispositions.ifEmpty { FALLBACK_DISPOSITIONS }
    var selected by remember { mutableStateOf("no_answer") }
    var note by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        vm.resetSave()
        vm.loadMeta()
    }
    LaunchedEffect(save) {
        if (save is UiState.Success) onDone()
    }

    Scaffold(
        topBar = { NxtTopBar("Log call", onBack = onBack) },
    ) { pad ->
        Column(
            Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState()),
        ) {
            Text(name ?: "Candidate", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
            Text(phone ?: "—", color = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilledTonalButton(onClick = { DialerHelper.dial(context, phone) }) {
                    Icon(Icons.Default.Call, null, Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Open dialer")
                }
                OutlinedButton(onClick = { DialerHelper.openWhatsApp(context, phone) }) {
                    Text("WhatsApp")
                }
            }
            Spacer(Modifier.height(16.dp))
            Text("Outcome", fontWeight = FontWeight.Medium)
            Spacer(Modifier.height(8.dp))
            list.chunked(2).forEach { row ->
                Row(
                    Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    row.forEach { d ->
                        FilterChip(
                            selected = selected == d.id,
                            onClick = { selected = d.id },
                            label = { Text(d.label, style = MaterialTheme.typography.labelSmall) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                duration,
                { duration = it.filter { ch -> ch.isDigit() } },
                label = { Text("Duration (seconds, optional)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            OutlinedTextField(
                note,
                { note = it },
                label = { Text("Notes") },
                modifier = Modifier.fillMaxWidth().height(100.dp),
            )
            if (save is UiState.Error) {
                Text((save as UiState.Error).message, color = MaterialTheme.colorScheme.error)
            }
            Spacer(Modifier.height(16.dp))
            PrimaryButton(
                "Save call log",
                loading = save is UiState.Loading,
                onClick = {
                    vm.logCall(
                        candidateId = candidateId,
                        disposition = selected,
                        note = note,
                        durationSec = duration.toIntOrNull(),
                        name = name,
                        phone = phone,
                        roleId = roleId,
                        roleName = roleName,
                        onDone = {},
                    )
                },
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CallHistoryScreen(
    onBack: () -> Unit,
    vm: CallsViewModel = hiltViewModel(),
) {
    val history by vm.history.collectAsState()
    val dispositions by vm.dispositions.collectAsState()
    val list = dispositions.ifEmpty { FALLBACK_DISPOSITIONS }
    LaunchedEffect(Unit) {
        vm.loadMeta()
        vm.loadHistory()
    }
    Scaffold(topBar = { NxtTopBar("Call history", onBack = onBack) }) { pad ->
        when (val s = history) {
            UiState.Loading, UiState.Idle -> LoadingBox(Modifier.padding(pad))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadHistory() }, modifier = Modifier.padding(pad))
            is UiState.Success -> {
                if (s.data.isEmpty()) EmptyState("No calls logged yet")
                else LazyColumn(
                    Modifier.padding(pad),
                    contentPadding = PaddingValues(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(s.data, key = { it.id }) { log ->
                        androidx.compose.material3.Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(log.candidateName ?: log.candidateId, fontWeight = FontWeight.SemiBold)
                                Text(dispositionLabel(log.disposition, list))
                                Text(
                                    listOfNotNull(
                                        log.candidatePhone,
                                        log.calledAt?.take(16),
                                        log.durationSeconds?.let { "${it}s" },
                                    ).joinToString(" · "),
                                    style = MaterialTheme.typography.bodySmall,
                                )
                                if (log.note.isNotBlank()) {
                                    Text(log.note, style = MaterialTheme.typography.bodySmall)
                                }
                                TextButton(onClick = { vm.deleteCall(log.id) }) {
                                    Text("Delete")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
