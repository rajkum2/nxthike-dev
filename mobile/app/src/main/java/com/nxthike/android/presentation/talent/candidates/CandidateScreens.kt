package com.nxthike.android.presentation.talent.candidates

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.HowToReg
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.MoveDown
import androidx.compose.material.icons.filled.Note
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.PersonSearch
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.RadioButtonChecked
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nxthike.android.core.model.CandidateTags
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.telephony.DialerHelper
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.presentation.talent.common.*
import com.nxthike.android.core.model.sourceLabel
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkAdd
import androidx.compose.material.icons.filled.BookmarkBorder
import com.nxthike.android.data.remote.dto.CandidateDto
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.GppMaybe
import androidx.compose.material.icons.filled.ExpandLess

/* ------------------------------------------------------------------ *
 *  SCR-CAND-01 · Candidate search & list                             *
 * ------------------------------------------------------------------ */

@Composable
fun CandidatesScreen(
    vm: CandidatesViewModel,
    onOpen: (String) -> Unit,
    onCall: (String) -> Unit,
    onCompose: (String) -> Unit,
    onAdd: () -> Unit,
    onFilters: () -> Unit,
    onStage: (CandidateDto) -> Unit,
    onMore: (CandidateDto) -> Unit,
    onSaveSearch: () -> Unit,
) {
    val state by vm.state.collectAsState()
    val applied = state.savedSearches.firstOrNull { it.id == state.appliedSearchId }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            ScreenHeader("Candidates") {
                TText("${state.items.size} of ${state.total}", Type.mono, T.InkMuted)
            }

            SearchBar(
                state.query, vm::setQuery, "Name, skill, company, phone",
                Modifier.padding(horizontal = T.Gutter),
            ) {
                Row(
                    Modifier.clickable(onClick = onFilters).padding(start = 9.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Icon(
                        Icons.Default.Tune, "Filters",
                        tint = if (state.filters.count > 0) T.Indigo else T.InkMuted,
                        modifier = Modifier.size(20.dp),
                    )
                    if (state.filters.count > 0) {
                        TText("${state.filters.count}", Type.label, T.Indigo)
                    }
                }
            }

            // One rail, two kinds of chip: the fixed quick views first, then the
            // searches this workspace has saved — the same rows the web desk
            // shows, so a search saved at a desk is one tap away on a phone.
            ChipRail(Modifier.padding(horizontal = T.Gutter).padding(top = 10.dp, bottom = 6.dp)) {
                CandidateChip.entries.forEach { chip ->
                    FilterChip(
                        chip.label,
                        state.chip == chip && state.appliedSearchId == null,
                        { vm.setChip(chip) },
                    )
                }
                state.savedSearches.forEach { search ->
                    FilterChip(
                        search.name,
                        state.appliedSearchId == search.id,
                        { vm.applySavedSearch(search) },
                        accent = T.Teal,
                        icon = Icons.Default.BookmarkBorder,
                    )
                }
                // Offered once something is actually narrowed — saving the
                // unfiltered list would just be a second "All".
                if (state.filters.count > 0 || state.query.isNotBlank()) {
                    FilterChip(
                        "Save search", false, onSaveSearch,
                        accent = T.Indigo, icon = Icons.Default.BookmarkAdd,
                    )
                }
            }

            if (applied != null) {
                val dropped = vm.unsupportedKeys(applied)
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(bottom = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(7.dp),
                ) {
                    Icon(Icons.Default.Bookmark, null, tint = T.Teal, modifier = Modifier.size(15.dp))
                    TText(
                        if (dropped.isEmpty()) "Saved search · ${applied.name}"
                        // Better to name the gap than to quietly apply half a search.
                        else "Saved search · ${applied.name} — ${dropped.joinToString(", ")} not supported here",
                        Type.labelSm,
                        if (dropped.isEmpty()) T.TealInk else T.AmberInk,
                        Modifier.weight(1f),
                        maxLines = 2,
                    )
                    TText(
                        "Clear", Type.label, T.Indigo,
                        Modifier.clickable { vm.clearFilters(); vm.setQuery("") },
                    )
                }
            }

            when {
                state.loading -> SkeletonList(7, Modifier.padding(horizontal = T.Gutter, vertical = 4.dp))
                state.error != null -> ErrorState(state.error!!, onRetry = { vm.load() })
                state.items.isEmpty() -> StateBlock(
                    Icons.Default.PersonSearch, "No candidates match",
                    "Clear the filters, or add this person to the database.",
                    actionLabel = "Add candidate", onAction = onAdd,
                )
                else -> LazyColumn(
                    Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = T.Gutter, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    items(state.items, key = { it.id }) { c ->
                        CandidateCard(
                            c,
                            onOpen = { onOpen(c.id) },
                            onCall = { onCall(c.id) },
                            onStage = { onStage(c) },
                            onMore = { onMore(c) },
                        )
                    }
                    // Clears the FAB, which used to sit on top of the last row.
                    item { Spacer(Modifier.height(T.FabInset)) }
                }
            }
        }

        IconTile(
            Icons.Default.PersonAdd, onAdd,
            Modifier.align(Alignment.BottomEnd).padding(16.dp),
            size = 58.dp, background = T.Indigo, tint = Color.White,
            shape = RoundedCornerShape(19.dp), iconSize = 26.dp,
        )
    }
}

/** Names a search before saving it. */
@Composable
fun SaveSearchSheetContent(
    filterCount: Int,
    query: String,
    onSave: (String) -> Unit,
) {
    var name by rememberSaveable { mutableStateOf("") }
    Column(
        Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 22.dp),
    ) {
        TText("Save this search", Type.sheetTitle, T.Ink)
        TText(
            listOfNotNull(
                query.takeIf { it.isNotBlank() }?.let { "\"$it\"" },
                "$filterCount filter${if (filterCount == 1) "" else "s"}",
            ).joinToString(" · "),
            Type.bodySm, T.InkMuted, Modifier.padding(top = 5.dp),
        )
        Spacer(Modifier.height(16.dp))
        TField(name, { name = it }, label = "Name", placeholder = "e.g. Pune Java, 30-day notice")
        Spacer(Modifier.height(8.dp))
        TText(
            "Saved searches are shared with the web desk — this will appear there too.",
            Type.labelSm, T.InkFaint,
        )
        Spacer(Modifier.height(16.dp))
        PrimaryButton(
            "Save search", { onSave(name) },
            enabled = name.isNotBlank(), height = 52.dp,
        )
    }
}

/**
 * One collapsible filter axis.
 *
 * Collapsed it is a single row showing the axis and its current value; expanded
 * it reveals the options. Only one is open at a time, so the whole filter set —
 * nine axes — fits on one screen and the Apply button never scrolls away.
 *
 * The previous version rendered every picker permanently open, which meant two
 * long lists (22 requisitions, 250 cities) each took a full screen of their own
 * and pushed Apply two scrolls down even after you had chosen.
 */
@Composable
private fun FilterSection(
    label: String,
    value: String?,
    expanded: Boolean,
    onToggle: () -> Unit,
    onClear: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    Column(Modifier.fillMaxWidth()) {
        Row(
            Modifier
                .fillMaxWidth()
                .clip(T.RField)
                .background(if (expanded) T.SurfaceMuted else T.Surface)
                .border(1.dp, if (value != null) T.Indigo.copy(alpha = 0.45f) else T.Border, T.RField)
                .clickable(onClick = onToggle)
                .padding(horizontal = 13.dp, vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            TText(label, Type.body, T.Ink, Modifier.weight(1f), maxLines = 1)
            TText(
                value ?: "Any",
                if (value != null) Type.cardTitleSm else Type.body,
                if (value != null) T.IndigoInk else T.InkFaint,
                Modifier.widthIn(max = 150.dp),
                maxLines = 1,
            )
            if (value != null && onClear != null) {
                Icon(
                    Icons.Default.Close, "Clear $label",
                    tint = T.InkMuted,
                    modifier = Modifier.size(17.dp).clickable(onClick = onClear),
                )
            }
            Icon(
                if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                null, tint = T.InkFaint, modifier = Modifier.size(19.dp),
            )
        }
        if (expanded) {
            Column(Modifier.fillMaxWidth().padding(top = 8.dp, start = 2.dp, end = 2.dp)) { content() }
        }
    }
}

/** Options as chips — for axes with a handful of values. */
@Composable
private fun ChipOptions(
    options: List<String>,
    selected: String?,
    accent: Color = T.Indigo,
    onSelect: (String?) -> Unit,
) {
    @OptIn(ExperimentalLayoutApi::class)
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        FilterChip("Any", selected == null, { onSelect(null) }, height = 38.dp)
        options.forEach { o ->
            FilterChip(o, selected == o, { onSelect(o) }, accent = accent, height = 38.dp)
        }
    }
}

/**
 * Type-to-narrow options, for the long lists.
 *
 * Renders at most [maxShown] matches so there is no scroll container nested
 * inside the sheet's own scroll.
 */
@Composable
private fun NarrowingOptions(
    options: List<String>,
    selected: String?,
    onSelect: (String?) -> Unit,
    emptyHint: String,
    maxShown: Int = 6,
) {
    var query by rememberSaveable(options.size, selected) { mutableStateOf("") }
    val hits = remember(options, query) {
        if (query.isBlank()) options else options.filter { it.contains(query, ignoreCase = true) }
    }
    val shown = hits.take(maxShown)

    if (options.isEmpty()) {
        TText(emptyHint, Type.bodySm, T.InkFaint)
        return
    }
    SearchBar(query, { query = it }, "Type to narrow ${options.size}")
    Spacer(Modifier.height(6.dp))
    if (shown.isEmpty()) {
        TText("Nothing matches \"$query\".", Type.bodySm, T.InkFaint)
    }
    shown.forEach { option ->
        val on = option == selected
        Row(
            Modifier.fillMaxWidth().padding(bottom = 5.dp)
                .clip(T.RIcon)
                .background(if (on) T.IndigoTint else T.Surface)
                .border(1.dp, if (on) T.Indigo else T.Border, T.RIcon)
                .clickable { onSelect(if (on) null else option) }
                .padding(horizontal = 12.dp, vertical = 11.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TText(
                option, Type.body, if (on) T.IndigoInk else T.Ink,
                Modifier.weight(1f), maxLines = 1,
            )
            if (on) Icon(Icons.Default.Check, null, tint = T.Indigo, modifier = Modifier.size(17.dp))
        }
    }
    if (hits.size > shown.size) {
        TText("${hits.size - shown.size} more — keep typing", Type.labelSm, T.InkFaint)
    }
}

/** Experience buckets the server can filter on, in its own vocabulary. */
private val EXP_BUCKETS = listOf("0-1", "1-3", "3-5", "5-7", "7-10", "10+")
private val AI_MATCH_GRADES = listOf("Excellent", "Good", "Moderate")
private val GENDERS = listOf("Male", "Female")

/**
 * Filter sheet — every axis `/api/hiring/candidates` accepts, applied server-side.
 *
 * Nine collapsed rows and one chip block, with Apply and Save pinned below, so
 * the whole thing is one screen and saving a search no longer means applying it
 * first and then hunting for a chip in the rail.
 */
@Composable
fun CandidateFiltersSheetContent(
    state: CandidatesState,
    onApply: (CandidateFilters) -> Unit,
    onReset: () -> Unit,
    onSave: (CandidateFilters) -> Unit,
) {
    var draft by remember(state.filters) { mutableStateOf(state.filters) }
    // Accordion: one axis open at a time.
    var open by rememberSaveable { mutableStateOf<String?>(null) }
    fun toggle(id: String) { open = if (open == id) null else id }

    Column(Modifier.fillMaxWidth()) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TText("Filters", Type.sheetTitle, T.Ink, Modifier.weight(1f))
            if (draft.count > 0) {
                Badge("${draft.count} active", T.IndigoTint, T.IndigoInk, Modifier.padding(end = 10.dp))
            }
            TText(
                "Reset", Type.label,
                if (draft.count > 0) T.Indigo else T.InkGhost,
                Modifier.clickable(enabled = draft.count > 0) {
                    draft = CandidateFilters(); open = null; onReset()
                },
            )
        }

        // Bounded so the footer stays on screen whatever is expanded.
        Column(
            Modifier
                .heightIn(max = 430.dp)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = T.Gutter),
            verticalArrangement = Arrangement.spacedBy(7.dp),
        ) {
            FilterSection(
                "Requisition",
                state.roles.firstOrNull { it.id == draft.roleId }?.name,
                open == "req", { toggle("req") },
                onClear = { draft = draft.copy(roleId = null) },
            ) {
                NarrowingOptions(
                    state.roles.map { it.name },
                    state.roles.firstOrNull { it.id == draft.roleId }?.name,
                    { name ->
                        draft = draft.copy(roleId = name?.let { n -> state.roles.first { it.name == n }.id })
                    },
                    "Requisitions haven't loaded — close and reopen this sheet.",
                )
            }

            FilterSection(
                "Stage",
                draft.status?.let { Stages.find(it).label },
                open == "stage", { toggle("stage") },
                onClear = { draft = draft.copy(status = null) },
            ) {
                @OptIn(ExperimentalLayoutApi::class)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    FilterChip("Any", draft.status == null, { draft = draft.copy(status = null) }, height = 38.dp)
                    Stages.ALL.forEach { st ->
                        FilterChip(
                            st.label, draft.status == st.id, { draft = draft.copy(status = st.id) },
                            accent = st.color, height = 38.dp,
                        )
                    }
                }
            }

            FilterSection(
                "City", draft.city, open == "city", { toggle("city") },
                onClear = { draft = draft.copy(city = null) },
            ) {
                NarrowingOptions(
                    state.cities, draft.city,
                    { draft = draft.copy(city = it) },
                    "City facets haven't loaded yet.",
                )
            }

            FilterSection(
                "Gender", draft.gender, open == "gender", { toggle("gender") },
                onClear = { draft = draft.copy(gender = null) },
            ) {
                ChipOptions(GENDERS, draft.gender) { draft = draft.copy(gender = it) }
            }

            FilterSection(
                "Experience",
                when (draft.experience) {
                    "yes" -> "Has experience"
                    "no" -> "Fresher"
                    else -> null
                },
                open == "exp", { toggle("exp") },
                onClear = { draft = draft.copy(experience = null) },
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip("Any", draft.experience == null, { draft = draft.copy(experience = null) }, height = 38.dp)
                    FilterChip("Has experience", draft.experience == "yes", { draft = draft.copy(experience = "yes") }, height = 38.dp)
                    FilterChip("Fresher", draft.experience == "no", { draft = draft.copy(experience = "no") }, height = 38.dp)
                }
            }

            FilterSection(
                "Years of experience",
                draft.expYears?.let { if (it == "10+") "10+ years" else "$it years" },
                open == "years", { toggle("years") },
                onClear = { draft = draft.copy(expYears = null) },
            ) {
                ChipOptions(EXP_BUCKETS, draft.expYears) { draft = draft.copy(expYears = it) }
                TText(
                    "Counted from total experience on the record, not a text match.",
                    Type.labelSm, T.InkFaint, Modifier.padding(top = 6.dp),
                )
            }

            FilterSection(
                "Graduation year", draft.graduationYear,
                open == "grad", { toggle("grad") },
                onClear = { draft = draft.copy(graduationYear = null) },
            ) {
                NarrowingOptions(
                    state.graduationYears, draft.graduationYear,
                    { draft = draft.copy(graduationYear = it) },
                    "Graduation-year facets haven't loaded yet.",
                )
            }

            FilterSection(
                "Source", draft.source, open == "source", { toggle("source") },
                onClear = { draft = draft.copy(source = null) },
            ) {
                ChipOptions(CandidateTags.SOURCES, draft.source) { draft = draft.copy(source = it) }
            }

            FilterSection(
                "Résumé match", draft.aiMatch, open == "ai", { toggle("ai") },
                onClear = { draft = draft.copy(aiMatch = null) },
            ) {
                ChipOptions(AI_MATCH_GRADES, draft.aiMatch, accent = T.Teal) {
                    draft = draft.copy(aiMatch = it)
                }
            }

            Column(Modifier.padding(top = 4.dp)) {
                TText("Record", Type.label, T.InkMuted, Modifier.padding(bottom = 8.dp))
                @OptIn(ExperimentalLayoutApi::class)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    FilterChip("Has phone", draft.hasPhone, { draft = draft.copy(hasPhone = !draft.hasPhone) }, height = 38.dp)
                    FilterChip("Has email", draft.hasEmail, { draft = draft.copy(hasEmail = !draft.hasEmail) }, height = 38.dp)
                    FilterChip("Has résumé", draft.hasResume, { draft = draft.copy(hasResume = !draft.hasResume) }, height = 38.dp)
                    FilterChip("Has notes", draft.hasNotes, { draft = draft.copy(hasNotes = !draft.hasNotes) }, height = 38.dp)
                    FilterChip(
                        "On DND", draft.dncOnly, { draft = draft.copy(dncOnly = !draft.dncOnly) },
                        accent = T.Maroon, height = 38.dp,
                    )
                }
            }

            if (draft.dncOnly) {
                Banner(Icons.Default.Block, T.MaroonTint, T.MaroonBorder, T.Maroon) {
                    TText(
                        "Showing numbers locked from every queue. These records cannot be dialled.",
                        Type.bodySm, T.MaroonInk,
                    )
                }
            }
            Spacer(Modifier.height(4.dp))
        }

        // Pinned: apply, or save this exact set as a one-tap chip for next time.
        Column(
            Modifier.fillMaxWidth().background(T.Surface)
                .padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 16.dp),
        ) {
            Box(Modifier.fillMaxWidth().height(1.dp).background(T.Divider))
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                GhostButton(
                    "Save", { onSave(draft) },
                    Modifier.weight(0.42f),
                    icon = Icons.Default.BookmarkAdd,
                    height = 52.dp,
                )
                Box(Modifier.weight(1f)) {
                    PrimaryButton(
                        if (draft.count > 0) "Apply ${draft.count} filter${if (draft.count == 1) "" else "s"}"
                        else "Show all candidates",
                        { onApply(draft) },
                        height = 52.dp, shape = RoundedCornerShape(15.dp),
                    )
                }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CAND-02 · Candidate profile                                   *
 * ------------------------------------------------------------------ */

private val PROFILE_TABS = listOf(
    "overview" to "Overview",
    "timeline" to "Timeline",
    "docs" to "Documents",
    "notes" to "Notes",
    "calls" to "Calls",
)

@Composable
fun CandidateProfileScreen(
    candidateId: String,
    vm: CandidateProfileViewModel,
    session: SessionViewModel,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onCall: () -> Unit,
    onCompose: () -> Unit,
    onResume: () -> Unit,
    onMerge: () -> Unit,
    onConsent: () -> Unit,
    onErasure: () -> Unit,
    onStageChange: () -> Unit,
) {
    val state by vm.state.collectAsState()
    val prefs by session.prefs.collectAsState()
    val context = LocalContext.current
    var tab by rememberSaveable { mutableStateOf("overview") }
    var noteDraft by rememberSaveable { mutableStateOf("") }
    var noteShared by rememberSaveable { mutableStateOf(true) }

    LaunchedEffect(candidateId) { vm.load(candidateId) }

    val c = state.candidate

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        when {
            state.loading -> Column { TopBar("", onBack); SkeletonList(4, Modifier.padding(horizontal = T.Gutter)) }
            c == null -> Column {
                TopBar("Candidate", onBack)
                ErrorState(state.error ?: "That record could not be loaded.", onRetry = { vm.load(candidateId, true) })
            }
            else -> Column(Modifier.fillMaxSize()) {
                // Header actions
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        Icons.Default.Description, "Back", tint = Color.Transparent,
                        modifier = Modifier.size(0.dp),
                    )
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack, "Back",
                        tint = T.Ink, modifier = Modifier.size(23.dp).clickable(onClick = onBack),
                    )
                    Spacer(Modifier.weight(1f))
                    Row(
                        Modifier
                            .clip(T.RIcon)
                            .background(if (prefs.maskPii) T.AmberTint else T.Fill)
                            .clickable { session.setMaskPii(!prefs.maskPii) }
                            .padding(horizontal = 9.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp),
                    ) {
                        Icon(
                            if (prefs.maskPii) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            null,
                            tint = if (prefs.maskPii) T.AmberInk else T.InkMuted,
                            modifier = Modifier.size(16.dp),
                        )
                        TText(
                            if (prefs.maskPii) "PII MASKED" else "FULL VIEW",
                            Type.monoXs, if (prefs.maskPii) T.AmberInk else T.InkMuted,
                        )
                    }
                    Spacer(Modifier.width(10.dp))
                    Icon(
                        if (c.starred) Icons.Default.Star else Icons.Default.StarBorder,
                        "Star", tint = if (c.starred) T.Amber else T.InkMuted,
                        modifier = Modifier.size(21.dp).clickable { vm.toggleStar() },
                    )
                    Spacer(Modifier.width(10.dp))
                    Icon(
                        Icons.Default.Edit, "Edit", tint = T.Ink,
                        modifier = Modifier.size(21.dp).clickable(onClick = onEdit),
                    )
                }

                // Identity
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 14.dp),
                    horizontalArrangement = Arrangement.spacedBy(13.dp),
                ) {
                    Avatar(c.name, c.id, 56.dp)
                    Column(Modifier.weight(1f)) {
                        TText(c.name ?: "Unnamed", Type.screenTitle, T.Ink, maxLines = 2)
                        TText(candidateSubtitle(c), Type.body, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 2)
                        @OptIn(ExperimentalLayoutApi::class)
                        FlowRow(
                            Modifier.padding(top = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(5.dp),
                            verticalArrangement = Arrangement.spacedBy(5.dp),
                        ) {
                            // Reads as a control, not a label — this is the
                            // shortcut for the edit recruiters make most.
                            val stage = Stages.find(c.status)
                            Row(
                                Modifier.clip(T.RPill).background(stage.tint)
                                    .clickable(onClick = onStageChange)
                                    .padding(start = 10.dp, end = 7.dp, top = 5.dp, bottom = 5.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(3.dp),
                            ) {
                                TText(stage.label, Type.labelSm, stage.color, maxLines = 1)
                                Icon(
                                    Icons.Default.ExpandMore, "Change stage",
                                    tint = stage.color, modifier = Modifier.size(15.dp),
                                )
                            }
                            ConsentBadge(state.consent)
                            if (state.dnc) Badge("DND · do not call", T.MaroonTint, T.Maroon, icon = Icons.Default.Lock)
                            if (state.erasureRaised) Badge("Erasure raised", T.AmberTint, T.AmberInk)
                        }
                    }
                }

                // Contact actions
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = T.Gutter).padding(top = 14.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    ProfileAction(Icons.Default.Call, "Call", T.IndigoTint, T.Indigo, Modifier.weight(1f), onCall)
                    ProfileAction(Icons.Default.Chat, "WhatsApp", T.TealTint, T.Teal, Modifier.weight(1f), onCompose)
                    ProfileAction(Icons.Default.Sms, "SMS", T.BlueTint, T.Blue, Modifier.weight(1f)) {
                        DialerHelper.sms(context, c.phone)
                    }
                    ProfileAction(Icons.Default.Mail, "Email", T.Fill, T.InkBody, Modifier.weight(1f)) {
                        DialerHelper.email(context, c.email)
                    }
                }

                // Tabs
                Row(
                    Modifier.fillMaxWidth().padding(top = 14.dp)
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter),
                ) {
                    PROFILE_TABS.forEach { (key, label) ->
                        val on = tab == key
                        Column(
                            Modifier.clickable { tab = key }.padding(horizontal = 11.dp, vertical = 9.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            TText(
                                label, Type.cardTitleSm,
                                if (on) T.Indigo else T.InkMuted,
                                weight = if (on) androidx.compose.ui.text.font.FontWeight.Bold
                                else androidx.compose.ui.text.font.FontWeight.Medium,
                            )
                        }
                    }
                }
                Box(Modifier.fillMaxWidth().height(1.dp).background(T.Divider))

                Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        // Must clear the overlaid Call button: 56dp tall with 14dp
                        // above and below, plus breathing room. At 90dp the last
                        // row sat underneath it.
                        .padding(horizontal = T.Gutter).padding(top = 14.dp, bottom = 104.dp),
                ) {
                    when (tab) {
                        "overview" -> {
                            TCard(shape = T.RCardLg, padding = 14.dp) {
                                FactGrid(
                                    listOf(
                                        "Phone" to (if (prefs.maskPii) Fmt.maskPhone(c.phone) else c.phone.orEmpty()),
                                        "Email" to (if (prefs.maskPii) Fmt.maskEmail(c.email) else c.email.orEmpty()),
                                        "Location" to c.city.orEmpty(),
                                        "Source" to (c.sourceLabel ?: "—"),
                                        "Experience" to (c.experienceDuration ?: c.hasWorkExperience ?: "—"),
                                        "Availability" to (c.availability ?: "—"),
                                        "Institute" to (c.institute ?: "—"),
                                        "Requisition" to c.roleName,
                                    ),
                                    monoValues = setOf("Phone"),
                                )
                            }
                            if (state.skills.isNotEmpty()) {
                                TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                                    TText("Skills", Type.cardTitleSm, T.Ink)
                                    Spacer(Modifier.height(10.dp))
                                    TagChips(state.skills)
                                }
                            }
                            TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                                TText("Compliance", Type.cardTitleSm, T.Ink)
                                Spacer(Modifier.height(10.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    TText("Consent recorded", Type.body, T.InkMuted, Modifier.weight(1f))
                                    TText(
                                        if (state.consent) "On file" else "Not recorded",
                                        Type.cardTitleSm,
                                        if (state.consent) T.Green else T.AmberInk,
                                    )
                                }
                                Spacer(Modifier.height(10.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    TText("Retention until", Type.body, T.InkMuted, Modifier.weight(1f))
                                    TText(
                                        Fmt.parse(c.updatedAt)?.plusMonths(24)?.let { Fmt.shortDate(it) + " " + it.year }
                                            ?: "—",
                                        Type.mono, T.Ink,
                                    )
                                }
                                Spacer(Modifier.height(10.dp))
                                GhostButton(
                                    "Record or update consent", onConsent, Modifier.fillMaxWidth(),
                                    icon = Icons.Default.HowToReg, iconTint = T.Teal, height = 42.dp,
                                )
                                Spacer(Modifier.height(8.dp))
                                GhostButton(
                                    "Raise erasure request", onErasure, Modifier.fillMaxWidth(),
                                    icon = Icons.Default.DeleteSweep, iconTint = T.Maroon,
                                    borderColor = T.MaroonBorder, contentColor = T.Maroon, height = 42.dp,
                                )
                                Spacer(Modifier.height(8.dp))
                                GhostButton(
                                    "Find duplicates", onMerge, Modifier.fillMaxWidth(),
                                    icon = Icons.Default.ContentCopy, iconTint = T.Amber, height = 42.dp,
                                )
                            }
                        }

                        "timeline" -> {
                            val entries = vm.timeline()
                            if (entries.isEmpty()) {
                                StateBlock(Icons.Default.Note, "Nothing recorded yet", "Calls and notes will build this timeline.")
                            } else {
                                entries.forEachIndexed { i, e ->
                                    val (icon, tint, bg) = timelineVisual(e.kind)
                                    TimelineRow(
                                        icon, tint, bg, e.title, e.detail,
                                        Fmt.shortDate(e.at).ifBlank { Fmt.time(e.at) },
                                        e.who, last = i == entries.lastIndex,
                                    )
                                }
                            }
                        }

                        "docs" -> {
                            val resume = c.resumeLink ?: c.downloadLink ?: c.pdfFile
                            if (resume.isNullOrBlank()) {
                                StateBlock(
                                    Icons.Default.Description, "No documents attached",
                                    "A resume link on the candidate record shows up here.",
                                )
                            } else {
                                TCard(shape = T.RCardLg, padding = 14.dp, onClick = onResume) {
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Box(
                                            Modifier.size(42.dp).clip(T.RChip).background(T.RedTint),
                                            contentAlignment = Alignment.Center,
                                        ) { Icon(Icons.Default.PictureAsPdf, null, tint = T.Red, modifier = Modifier.size(22.dp)) }
                                        Column(Modifier.weight(1f)) {
                                            TText("${Fmt.firstName(c.name)}_resume", Type.cardTitleSm, T.Ink, maxLines = 1)
                                            TText(resume, Type.monoSm, T.InkFaint, Modifier.padding(top = 3.dp), maxLines = 1)
                                        }
                                        Chevron()
                                    }
                                }
                            }
                        }

                        "notes" -> {
                            TCard {
                                TTextArea(noteDraft, { noteDraft = it }, "Add a note…", minHeight = 60.dp)
                                Spacer(Modifier.height(9.dp))
                                Box(Modifier.fillMaxWidth().height(1.dp).background(T.Track))
                                Row(
                                    Modifier.fillMaxWidth().padding(top = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Row(
                                        Modifier.clickable { noteShared = !noteShared }.weight(1f),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    ) {
                                        Icon(
                                            if (noteShared) Icons.Default.Group else Icons.Default.Lock, null,
                                            tint = if (noteShared) T.Green else T.Neutral,
                                            modifier = Modifier.size(17.dp),
                                        )
                                        TText(
                                            if (noteShared) "Shared with team" else "Private to me",
                                            Type.label, T.InkMuted,
                                        )
                                    }
                                    Box(
                                        Modifier
                                            .height(36.dp).clip(T.RIcon)
                                            .background(if (noteDraft.isNotBlank()) T.Indigo else T.Disabled)
                                            .clickable(enabled = noteDraft.isNotBlank()) {
                                                vm.addNote(noteDraft, noteShared) { noteDraft = "" }
                                            }
                                            .padding(horizontal = 15.dp),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        TText("Post", Type.cardTitleSm, if (noteDraft.isNotBlank()) Color.White else T.DisabledInk)
                                    }
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                            state.notes.forEach { n ->
                                TCard(Modifier.padding(bottom = T.Gap)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Avatar(n.author, n.author, 24.dp)
                                        Spacer(Modifier.width(7.dp))
                                        TText(n.author, Type.label, T.Ink)
                                        Spacer(Modifier.width(6.dp))
                                        Badge(
                                            if (n.system) "System" else "Shared",
                                            if (n.system) T.Fill else T.GreenTint,
                                            if (n.system) T.Neutral else T.Green,
                                        )
                                        Spacer(Modifier.weight(1f))
                                        TText(Fmt.whenLabel(n.at), Type.monoXs, T.InkFaint)
                                    }
                                    TText(n.body, Type.body, T.InkBody, Modifier.padding(top = 8.dp))
                                }
                            }
                        }

                        "calls" -> {
                            if (state.calls.isEmpty()) {
                                StateBlock(
                                    Icons.Default.Call, "No calls logged",
                                    "Outcomes recorded from the queue show up here.",
                                )
                            } else {
                                state.calls.forEach {
                                    CallLogCard(it, Modifier.padding(bottom = T.Gap), showName = false)
                                }
                            }
                        }
                    }
                }
            }
        }

        if (c != null) {
            PrimaryButton(
                if (state.dnc) "Blocked · DND" else "Call ${Fmt.firstName(c.name)}",
                onClick = onCall,
                modifier = Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
                enabled = !state.dnc && !c.phone.isNullOrBlank(),
                icon = Icons.Default.Call, height = 56.dp, shape = T.RFab,
            )
        }
    }
}

@Composable
private fun ProfileAction(
    icon: ImageVector,
    label: String,
    background: Color,
    tint: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) = Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
    Box(
        Modifier.fillMaxWidth().height(48.dp).clip(T.RCard).background(background).clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Icon(icon, label, tint = tint, modifier = Modifier.size(21.dp)) }
    TText(label, Type.labelSm, T.InkMuted, Modifier.padding(top = 5.dp), maxLines = 1)
}

private fun timelineVisual(kind: TimelineEntry.Kind): Triple<ImageVector, Color, Color> = when (kind) {
    TimelineEntry.Kind.Call -> Triple(Icons.Default.Call, T.Purple, T.PurpleTint)
    TimelineEntry.Kind.Note -> Triple(Icons.Default.Note, T.Indigo, T.IndigoTint)
    TimelineEntry.Kind.Stage -> Triple(Icons.Default.MoveDown, T.Amber, T.AmberTint)
    TimelineEntry.Kind.Consent -> Triple(Icons.Default.HowToReg, T.Green, T.GreenTint)
    TimelineEntry.Kind.Message -> Triple(Icons.Default.Chat, T.Teal, T.TealTint)
    TimelineEntry.Kind.Created -> Triple(Icons.Default.PersonAdd, T.InkMuted, T.Fill)
}

/* ------------------------------------------------------------------ *
 *  SCR-CAND-03 · Add / edit candidate                                *
 * ------------------------------------------------------------------ */

@Composable
fun CandidateEditScreen(
    candidateId: String,
    onDone: (String) -> Unit,
    onBack: () -> Unit,
    onOpenExisting: (String) -> Unit,
    onMerge: (String) -> Unit,
) {
    val vm: CandidateEditViewModel = hiltViewModel()
    val state by vm.state.collectAsState()
    val f = state.form
    val editing = candidateId != "new"

    LaunchedEffect(candidateId) { vm.loadForEdit(candidateId) }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(if (editing) "Edit candidate" else "Add candidate", onBack, closeIcon = true)
            Box(Modifier.fillMaxWidth().height(1.dp).background(T.Divider))

            Column(
                Modifier.weight(1f).verticalScroll(rememberScrollState())
                    .padding(horizontal = T.Gutter).padding(top = 16.dp, bottom = 110.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                FormSection("Who they are", first = true)
                TField(f.name, { v -> vm.update { it.copy(name = v) } }, label = "Full name *", placeholder = "e.g. Ritu Malhotra")

                Column {
                    TField(
                        f.phone, { v -> vm.update { it.copy(phone = v) } },
                        label = "Mobile number *", placeholder = "98200 41562", mono = true,
                        borderColor = if (state.duplicate != null) Color(0xFFE0A83A) else T.BorderStrong,
                    )
                    state.duplicate?.let { dup ->
                        Column(
                            Modifier.fillMaxWidth().padding(top = 10.dp)
                                .clip(T.RField).background(T.AmberSurface)
                                .border(1.dp, T.AmberBorder, T.RField).padding(12.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.ContentCopy, null, tint = T.Amber, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(7.dp))
                                TText("Possible duplicate", Type.cardTitleSm, T.AmberDeep)
                            }
                            TCard(Modifier.padding(top = 8.dp), shape = T.RIcon, padding = 10.dp, border = Color.Transparent) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Avatar(dup.name, dup.id, 34.dp)
                                    Column(Modifier.weight(1f)) {
                                        TText(dup.name ?: "Unnamed", Type.cardTitleSm, T.Ink, maxLines = 1)
                                        TText(candidateSubtitle(dup), Type.bodySm, T.InkMuted, maxLines = 1)
                                    }
                                }
                            }
                            Row(Modifier.padding(top = 9.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                PrimaryButton(
                                    "Open existing", { onOpenExisting(dup.id) }, Modifier.weight(1f),
                                    height = 40.dp, shape = T.RIcon,
                                )
                                GhostButton("Compare & merge", { onMerge(dup.id) }, Modifier.weight(1f), height = 40.dp)
                            }
                        }
                    }
                }

                TField(f.email, { v -> vm.update { it.copy(email = v) } }, label = "Email", placeholder = "name@company.com")

                FormSection("Work")
                TField(f.latestRole, { v -> vm.update { it.copy(latestRole = v) } }, label = "Current role", placeholder = "e.g. Senior Java Developer")
                TField(f.latestCompany, { v -> vm.update { it.copy(latestCompany = v) } }, label = "Current company", placeholder = "e.g. Infosys")
                TField(f.city, { v -> vm.update { it.copy(city = v) } }, label = "City", placeholder = "e.g. Pune")
                TField(f.skills, { v -> vm.update { it.copy(skills = v) } }, label = "Skills", placeholder = "Java, Spring Boot, Kafka", singleLine = false, minHeight = 60.dp)
                TField(f.availability, { v -> vm.update { it.copy(availability = v) } }, label = "Availability", placeholder = "e.g. immediate, buyout possible")

                FormSection("Pipeline")

                // Opens itself until a requisition is picked — it is required, so
                // an empty collapsed row would hide the one thing still blocking save.
                val pickedRole = state.roles.firstOrNull { it.id == f.roleId }?.name
                var reqOpen by rememberSaveable { mutableStateOf(false) }
                FilterSection(
                    "Requisition *",
                    pickedRole,
                    expanded = reqOpen || pickedRole == null,
                    onToggle = { reqOpen = !reqOpen },
                ) {
                    NarrowingOptions(
                        state.roles.map { it.name },
                        pickedRole,
                        { name ->
                            if (name == null) vm.update { form -> form.copy(roleId = "", roleName = "") }
                            else state.roles.firstOrNull { it.name == name }?.let { r ->
                                vm.pickRole(r)
                                reqOpen = false
                            }
                        },
                        "Requisitions haven't loaded — go back and reopen this screen.",
                    )
                }

                Column {
                    TText("Stage", Type.label, T.InkMuted, Modifier.padding(bottom = 8.dp))
                    @OptIn(ExperimentalLayoutApi::class)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Stages.BOARD.forEach { s ->
                            FilterChip(
                                s.label, f.status == s.id,
                                { vm.update { form -> form.copy(status = s.id) } },
                                accent = s.color, height = 40.dp,
                            )
                        }
                    }
                }

                Column {
                    TText("Source", Type.label, T.InkMuted, Modifier.padding(bottom = 8.dp))
                    @OptIn(ExperimentalLayoutApi::class)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        CandidateTags.SOURCES.forEach { src ->
                            FilterChip(src, f.source == src, { vm.update { form -> form.copy(source = src) } }, height = 40.dp)
                        }
                    }
                }

                // Comp and notice: the three facts an offer conversation needs, and
                // the ones a recruiter is asked for first. They were columns the app
                // could read but never write.
                Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                    Box(Modifier.weight(1f)) {
                        TField(
                            f.currentCtc, { v -> vm.update { it.copy(currentCtc = v) } },
                            label = "Current CTC", placeholder = "8.5", mono = true,
                        )
                    }
                    Box(Modifier.weight(1f)) {
                        TField(
                            f.expectedCtc, { v -> vm.update { it.copy(expectedCtc = v) } },
                            label = "Expected CTC", placeholder = "12", mono = true,
                        )
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TText("In lakhs per annum", Type.labelSm, T.InkFaint, Modifier.weight(1f))
                    lakhsToRupees(f.expectedCtc)?.let {
                        TText("Expected ${Fmt.money(it)}", Type.labelSm, T.TealInk)
                    }
                }
                TField(
                    f.noticeDays, { v -> vm.update { it.copy(noticeDays = v.filter(Char::isDigit)) } },
                    label = "Notice period (days)", placeholder = "60", mono = true,
                )

                FormSection("Compliance")
                Row(
                    Modifier.fillMaxWidth().clip(T.RField).background(T.TealTint)
                        .border(1.dp, T.TealBorder, T.RField)
                        .clickable { vm.update { it.copy(consent = !it.consent) } }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Icon(
                        if (f.consent) Icons.Default.CheckCircle else Icons.Default.HowToReg,
                        null, tint = T.Teal, modifier = Modifier.size(18.dp),
                    )
                    Column(Modifier.weight(1f)) {
                        TText("Consent recorded", Type.cardTitleSm, T.TealInk)
                        TText("Required under DPDP before first contact.", Type.bodySm, T.TealInk, Modifier.padding(top = 3.dp))
                    }
                    TSwitch(f.consent, onCheckedChange = { v -> vm.update { it.copy(consent = v) } })
                }

                state.error?.let {
                    Banner(Icons.Default.ContentCopy, T.MaroonTint, T.MaroonBorder, T.Maroon) {
                        TText(it, Type.bodySm, T.MaroonInk)
                    }
                }
            }
        }

        Row(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth().background(T.Surface)
                .padding(horizontal = T.Gutter).padding(top = 12.dp, bottom = 16.dp),
        ) {
            Column {
                // The button says what it does; the line above says what is
                // missing. A button labelled with a validation error tells you
                // there is a problem but not where to go.
                if (!f.valid) {
                    Row(
                        Modifier.fillMaxWidth().padding(bottom = 9.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Icon(
                            Icons.Default.GppMaybe, null,
                            tint = T.Amber, modifier = Modifier.size(15.dp),
                        )
                        TText(
                            "Still needed: ${f.missing.joinToString(", ")}",
                            Type.labelSm, T.AmberInk,
                        )
                    }
                }
                PrimaryButton(
                    when {
                        state.saving -> "Saving…"
                        editing -> "Save changes"
                        else -> "Save candidate"
                    },
                    onClick = { vm.save(onDone) },
                    enabled = f.valid && !state.saving,
                    height = 52.dp, shape = RoundedCornerShape(15.dp),
                )
            }
        }
    }
}

/** Groups the edit form so it reads as four short forms, not one long one. */
@Composable
private fun FormSection(title: String, first: Boolean = false) {
    Column(Modifier.padding(top = if (first) 0.dp else 8.dp)) {
        Eyebrow(title)
        Spacer(Modifier.height(3.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(T.DividerFaint))
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-CAND-04 · Dedupe / merge                                      *
 * ------------------------------------------------------------------ */

@Composable
fun MergeScreen(primaryId: String, onBack: () -> Unit, onMerged: (String) -> Unit) {
    val vm: MergeViewModel = hiltViewModel()
    val state by vm.state.collectAsState()

    LaunchedEffect(primaryId) { vm.load(primaryId) }

    Box(Modifier.fillMaxSize().background(T.Bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar("Compare & merge", onBack)
            Box(Modifier.fillMaxWidth().height(1.dp).background(T.Divider))

            when {
                state.loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter, vertical = 14.dp))
                state.duplicate == null -> StateBlock(
                    Icons.Default.CheckCircle, "No duplicates found",
                    "No other record shares this phone number.",
                    iconBackground = T.GreenTint, iconTint = T.Green,
                    actionLabel = "Back to profile", onAction = onBack,
                )
                else -> Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState())
                        .padding(horizontal = T.Gutter).padding(top = 14.dp, bottom = 100.dp),
                ) {
                    TText(
                        "Two records share this number. Pick the surviving value for each field — " +
                            "the duplicate is deleted only after the merge succeeds.",
                        Type.body, T.InkMuted,
                    )
                    Spacer(Modifier.height(14.dp))
                    state.fields.forEach { field ->
                        TCard(Modifier.padding(bottom = T.Gap)) {
                            TText(field.label, Type.labelSm, T.InkFaint)
                            Spacer(Modifier.height(8.dp))
                            MergeOption(field.left.ifBlank { "—" }, vm.sideFor(field.key) == "left") {
                                vm.pick(field.key, "left")
                            }
                            Spacer(Modifier.height(7.dp))
                            MergeOption(field.right.ifBlank { "—" }, vm.sideFor(field.key) == "right") {
                                vm.pick(field.key, "right")
                            }
                        }
                    }
                    state.error?.let {
                        Banner(Icons.Default.ContentCopy, T.MaroonTint, T.MaroonBorder, T.Maroon) {
                            TText(it, Type.bodySm, T.MaroonInk)
                        }
                    }
                }
            }
        }

        if (state.duplicate != null) {
            PrimaryButton(
                if (state.merging) "Merging…" else "Merge records",
                onClick = { vm.merge(onMerged) },
                modifier = Modifier.align(Alignment.BottomCenter).padding(horizontal = T.Gutter, vertical = 14.dp),
                enabled = !state.merging, height = 54.dp,
            )
        }
    }
}

@Composable
private fun MergeOption(value: String, selected: Boolean, onClick: () -> Unit) = Row(
    Modifier
        .fillMaxWidth()
        .clip(T.RField)
        .background(if (selected) T.IndigoTintSoft else T.Surface)
        .border(1.dp, if (selected) T.Indigo else T.BorderStrong.copy(alpha = 0.6f), T.RField)
        .clickable(onClick = onClick)
        .padding(11.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(9.dp),
) {
    Icon(
        if (selected) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
        null, tint = if (selected) T.Indigo else T.BorderStrong, modifier = Modifier.size(19.dp),
    )
    TText(value, Type.body, T.Ink, Modifier.weight(1f), maxLines = 2)
}

/* ------------------------------------------------------------------ *
 *  SCR-CAND-05 · Resume viewer                                       *
 * ------------------------------------------------------------------ */

@Composable
fun ResumeScreen(candidateId: String, onBack: () -> Unit) {
    val vm: CandidateProfileViewModel = hiltViewModel()
    val state by vm.state.collectAsState()
    val context = LocalContext.current
    LaunchedEffect(candidateId) { vm.load(candidateId) }

    val link = state.candidate?.let { it.resumeLink ?: it.downloadLink ?: it.pdfFile }

    Column(Modifier.fillMaxSize().background(T.NightDeep)) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = T.Gutter, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack, "Back",
                tint = Color.White, modifier = Modifier.size(23.dp).clickable(onClick = onBack),
            )
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                TText(state.candidate?.name ?: "Resume", Type.cardTitle, Color.White, maxLines = 1)
                TText("Opens in your PDF viewer", Type.bodySm, T.NightInk)
            }
        }
        Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
            if (link.isNullOrBlank()) {
                StateBlock(
                    Icons.Default.Description, "No resume on file",
                    "Attach a resume link to this candidate to preview it here.",
                    iconBackground = Color.White.copy(alpha = 0.08f), iconTint = T.NightInk,
                )
            } else {
                Column(
                    Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Box(
                        Modifier.size(72.dp).clip(T.RCardLg).background(Color.White.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center,
                    ) { Icon(Icons.Default.PictureAsPdf, null, tint = Color.White, modifier = Modifier.size(36.dp)) }
                    TText(link, Type.monoSm, T.NightInk, Modifier.padding(top = 16.dp), maxLines = 3)
                    Spacer(Modifier.height(20.dp))
                    PrimaryButton(
                        "Open resume", { DialerHelper.openUrl(context, link) },
                        Modifier.fillMaxWidth(), icon = Icons.Default.Description, height = 52.dp,
                    )
                    Spacer(Modifier.height(8.dp))
                    PrimaryButton(
                        "Share link", { DialerHelper.share(context, link) },
                        Modifier.fillMaxWidth(), height = 52.dp,
                        container = Color.White.copy(alpha = 0.14f), contentColor = Color.White,
                    )
                }
            }
        }
    }
}
