package com.nxthike.android.presentation.talent.clients

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.telephony.DialerHelper
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.ClientDto
import com.nxthike.android.data.remote.dto.JobDto
import com.nxthike.android.data.remote.dto.SubmissionDto
import com.nxthike.android.domain.repository.JobRepository
import com.nxthike.android.domain.repository.WorkspaceRepository
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Client accounts from `/api/workspace/clients`.
 *
 * These are accounts, not portal companies: health, margin, payment terms,
 * contacts and the submitted/placed counts are columns the workspace keeps. The
 * screen used to read `/api/companies`, which knows a company's industry and
 * website but nothing about the commercial relationship.
 */
@HiltViewModel
class ClientsViewModel @Inject constructor(
    private val workspace: WorkspaceRepository,
    private val jobs: JobRepository,
) : ViewModel() {

    private val _list = MutableStateFlow<List<ClientDto>>(emptyList())
    val list: StateFlow<List<ClientDto>> = _list.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _selected = MutableStateFlow<ClientDto?>(null)
    val selected: StateFlow<ClientDto?> = _selected.asStateFlow()

    private val _postings = MutableStateFlow<List<JobDto>>(emptyList())
    val postings: StateFlow<List<JobDto>> = _postings.asStateFlow()

    /** Real submission records — who was sent where, when, by whom, at what rate. */
    private val _submissions = MutableStateFlow<List<SubmissionDto>>(emptyList())
    val submissions: StateFlow<List<SubmissionDto>> = _submissions.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _loading.value = true
        _error.value = null
        workspace.clients()
            .onSuccess { _list.value = it.sortedBy { c -> c.name } }
            .onError { e -> _error.value = e.message }
        _loading.value = false
    }

    fun select(id: String) = viewModelScope.launch {
        val client = _list.value.firstOrNull { it.id == id } ?: workspace.client(id).getOrNull()
        _selected.value = client
        if (client != null) {
            _postings.value = jobs.list(search = client.name, type = null, page = 1, status = null)
                .getOrNull()?.items.orEmpty()
                .filter { it.company.equals(client.name, true) }
        }
    }

    /**
     * Submissions for one account, or across all of them.
     *
     * Filtered by client id server-side. Matching on company name — which this
     * used to do, against the candidate's *previous* employer — put people in
     * front of the wrong client whenever a name happened to collide.
     */
    fun loadSubmissions(clientId: String?) = viewModelScope.launch {
        workspace.submissions(clientId = clientId)
            .onSuccess { _submissions.value = it }
            .onError { e -> _error.value = e.message }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CLIENT-01 · Client list                                       *
 * ------------------------------------------------------------------ */

@Composable
fun ClientsScreen(
    vm: ClientsViewModel,
    session: SessionViewModel,
    onBack: () -> Unit,
    onOpen: (String) -> Unit,
) {
    val list by vm.list.collectAsState()
    val loading by vm.loading.collectAsState()
    val error by vm.error.collectAsState()
    val prefs by session.prefs.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar(
            "${prefs.mode.clientWord}s", onBack,
            subtitle = "${list.size} accounts",
        )
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            error != null -> ErrorState(error!!, onRetry = { vm.load() })
            list.isEmpty() -> StateBlock(
                Icons.Default.Apartment, "No ${prefs.mode.clientWord.lowercase()}s yet",
                "Accounts with an open requisition appear here.",
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(list, key = { it.id }) { c ->
                    TCard(shape = T.RCardLg, padding = 14.dp, onClick = { onOpen(c.id) }) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(c.name, c.id, 40.dp, T.RChip)
                            Column(Modifier.weight(1f)) {
                                TText(c.name, Type.section, T.Ink, maxLines = 1)
                                TText(
                                    c.industry ?: c.location ?: "—",
                                    Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1,
                                )
                            }
                            val open = c.openRequisitions
                            Badge(
                                if (open > 0) "$open open" else "No openings",
                                if (open > 0) T.GreenTint else T.NeutralTint,
                                if (open > 0) T.Green else T.Neutral,
                            )
                        }
                        c.location?.takeIf { it.isNotBlank() }?.let {
                            Row(
                                Modifier.padding(top = 11.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                            ) {
                                Icon(Icons.Default.Place, null, tint = T.InkFaint, modifier = Modifier.size(14.dp))
                                TText(it, Type.labelSm, T.InkMuted, maxLines = 1)
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CLIENT-02 · Client 360                                        *
 * ------------------------------------------------------------------ */

@Composable
fun ClientDetailScreen(
    clientId: String,
    vm: ClientsViewModel,
    session: SessionViewModel,
    onBack: () -> Unit,
    onSubmissions: () -> Unit,
) {
    val client by vm.selected.collectAsState()
    val postings by vm.postings.collectAsState()
    val prefs by session.prefs.collectAsState()
    val context = LocalContext.current
    LaunchedEffect(clientId) { vm.select(clientId) }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(prefs.mode.clientWord, onBack)
            val c = client
            if (c == null) {
                SkeletonList(3, Modifier.padding(horizontal = T.Gutter))
            } else {
                Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter).padding(bottom = 100.dp),
                ) {
                    TText(c.name, Type.screenTitle, T.Ink, maxLines = 2)
                    TText(
                        listOfNotNull(c.industry, c.location).joinToString(" · "),
                        Type.body, T.InkMuted, Modifier.padding(top = 3.dp),
                    )

                    Row(
                        Modifier.padding(top = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(7.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        val healthy = c.health.equals("good", true)
                        val atRisk = c.health.equals("at_risk", true) || c.health.equals("risk", true)
                        Badge(
                            c.health.replace('_', ' ').uppercase(),
                            if (healthy) T.GreenTint else if (atRisk) T.AmberTint else T.MaroonTint,
                            if (healthy) T.Green else if (atRisk) T.AmberInk else T.Maroon,
                        )
                        // Margin is a commercial figure; the server withholds it
                        // from personas that may not see rates, so null means
                        // "not entitled", not "zero".
                        c.marginPct?.let { Badge("${it.toInt()}% margin", T.TealTint, T.TealInk) }
                    }

                    TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                        FactGrid(
                            listOf(
                                "Open requisitions" to "${c.openRequisitions}",
                                "Submissions" to "${c.submissions}",
                                "Placements" to "${c.placements}",
                                "Payment terms" to (c.terms ?: "—"),
                                "Industry" to (c.industry ?: "—"),
                                "Location" to (c.location ?: "—"),
                            ),
                        )
                        if (c.contacts.isNotEmpty()) {
                            Spacer(Modifier.height(12.dp))
                            Eyebrow("CONTACTS")
                            c.contacts.forEach { contact ->
                                Row(
                                    Modifier.padding(top = 8.dp),
                                    horizontalArrangement = Arrangement.spacedBy(9.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Avatar(contact.name, contact.email ?: contact.name.orEmpty(), 30.dp)
                                    Column(Modifier.weight(1f)) {
                                        TText(contact.name ?: "—", Type.cardTitleSm, T.Ink, maxLines = 1)
                                        TText(
                                            listOfNotNull(contact.role, contact.phone).joinToString(" · "),
                                            Type.labelSm, T.InkMuted, maxLines = 1,
                                        )
                                    }
                                    contact.phone?.takeIf { it.isNotBlank() }?.let { phone ->
                                        GhostButton(
                                            "Call", { DialerHelper.dial(context, phone) },
                                            height = 34.dp,
                                        )
                                    }
                                }
                            }
                        }
                        if (!c.website.isNullOrBlank()) {
                            Spacer(Modifier.height(10.dp))
                            GhostButton(
                                "Open website", { DialerHelper.openUrl(context, c.website) },
                                Modifier.fillMaxWidth(), icon = Icons.Default.Language, height = 42.dp,
                            )
                        }
                    }

                    SectionRow("Job orders", Modifier.padding(top = 16.dp))
                    Spacer(Modifier.height(9.dp))
                    if (postings.isEmpty()) {
                        TText("No live postings for this account.", Type.body, T.InkMuted)
                    } else {
                        postings.forEach { p ->
                            NavRow(
                                Icons.Default.Work,
                                p.title,
                                listOfNotNull(p.location, p.type, p.salary?.raw).joinToString(" · "),
                                onClick = {},
                                Modifier.padding(bottom = T.Gap),
                                iconTint = T.Indigo, iconBackground = T.IndigoTint,
                            )
                        }
                    }
                }
            }
        }
        if (client != null) {
            PrimaryButton(
                "Submissions", onSubmissions,
                Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
                icon = Icons.Default.Send, height = 54.dp, shape = T.RFab,
            )
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CLIENT-04 · Submissions tracker                               *
 * ------------------------------------------------------------------ */

@Composable
fun SubmissionsScreen(
    clientId: String?,
    vm: ClientsViewModel,
    onBack: () -> Unit,
    onOpenCandidate: (String) -> Unit,
) {
    val client by vm.selected.collectAsState()
    val subs by vm.submissions.collectAsState()

    LaunchedEffect(clientId) { vm.loadSubmissions(clientId) }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Submissions", onBack, subtitle = client?.name ?: "Across all accounts")
        if (subs.isEmpty()) {
            StateBlock(
                Icons.Default.Send, "Nothing submitted yet",
                "Candidates at Submitted or beyond appear here.",
            )
        } else {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(subs, key = { it.id }) { sub ->
                    TCard(onClick = { onOpenCandidate(sub.candidateId) }) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(sub.candidateName, sub.candidateId, 36.dp)
                            Column(Modifier.weight(1f)) {
                                TText(
                                    sub.candidateName ?: "Unnamed",
                                    Type.cardTitleSm, T.Ink, maxLines = 1,
                                )
                                TText(
                                    listOfNotNull(sub.requisitionName, sub.clientName)
                                        .joinToString(" · ").ifBlank { "—" },
                                    Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1,
                                )
                                Row(
                                    Modifier.padding(top = 6.dp),
                                    horizontalArrangement = Arrangement.spacedBy(7.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Badge(
                                        sub.status.replace('_', ' ').uppercase(),
                                        T.BlueTint, T.Blue,
                                    )
                                    sub.submittedCtc?.let {
                                        TText(Fmt.money(it), Type.monoXs, T.InkMuted)
                                    }
                                    TText(
                                        Fmt.shortDate(Fmt.parse(sub.submittedAt)),
                                        Type.monoXs, T.InkFaint,
                                    )
                                }
                                sub.submittedByName?.takeIf { it.isNotBlank() }?.let {
                                    TText(
                                        "by $it", Type.labelSm, T.InkFaint,
                                        Modifier.padding(top = 4.dp), maxLines = 1,
                                    )
                                }
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  Job postings (the public /api/jobs board)                         *
 * ------------------------------------------------------------------ */

@HiltViewModel
class PostingsViewModel @Inject constructor(
    private val jobs: JobRepository,
) : ViewModel() {
    private val _items = MutableStateFlow<List<JobDto>>(emptyList())
    val items: StateFlow<List<JobDto>> = _items.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { load() }

    fun load(search: String? = null) = viewModelScope.launch {
        _loading.value = true
        _error.value = null
        jobs.list(search = search, type = null, page = 1, status = null)
            .onSuccess { _items.value = it.items }
            .onError { e -> _error.value = e.message }
        _loading.value = false
    }
}

@Composable
fun PostingsScreen(onBack: () -> Unit) {
    val vm: PostingsViewModel = hiltViewModel()
    val items by vm.items.collectAsState()
    val loading by vm.loading.collectAsState()
    val error by vm.error.collectAsState()
    var query by remember { mutableStateOf("") }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Job postings", onBack, subtitle = "${items.size} live on the portal")
        SearchBar(
            query,
            { query = it; vm.load(it.takeIf { q -> q.isNotBlank() }) },
            "Title, company, location",
            Modifier.padding(horizontal = T.Gutter).padding(bottom = 10.dp),
        )
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            error != null -> ErrorState(error!!, onRetry = { vm.load() })
            items.isEmpty() -> StateBlock(
                Icons.Default.Work, "No postings", "Nothing matches that search.",
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(items, key = { it.id }) { j ->
                    TCard(shape = T.RCardLg, padding = 14.dp) {
                        Row(verticalAlignment = Alignment.Top) {
                            Column(Modifier.weight(1f)) {
                                TText(j.title, Type.section, T.Ink, maxLines = 2)
                                TText(
                                    listOfNotNull(j.company, j.location).joinToString(" · "),
                                    Type.bodySm, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 1,
                                )
                            }
                            j.type?.let { Badge(it, T.IndigoTint, T.IndigoInk) }
                        }
                        Row(
                            Modifier.padding(top = 11.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            (j.salary?.raw ?: j.stipend?.raw)?.let {
                                TText(it, Type.mono, T.Ink, maxLines = 1)
                            }
                            if (j.isRemote) Badge("Remote", T.TealTint, T.Teal)
                            Spacer(Modifier.weight(1f))
                            j.status?.let {
                                TText(it.uppercase(), Type.monoXs, T.InkFaint)
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}
