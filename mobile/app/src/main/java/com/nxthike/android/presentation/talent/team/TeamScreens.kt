package com.nxthike.android.presentation.talent.team

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.DispositionCategory
import com.nxthike.android.core.model.Dispositions
import com.nxthike.android.core.model.Stages
import com.nxthike.android.core.util.Fmt
import com.nxthike.android.data.remote.dto.CallLogDto
import com.nxthike.android.domain.repository.AuthRepository
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.domain.repository.HiringRepository
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.talent.common.*
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDate
import javax.inject.Inject
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** One recruiter's numbers, aggregated from their call logs. */
data class RecruiterRow(
    val name: String,
    val email: String,
    val calls: Int,
    val connected: Int,
    val submissions: Int,
) {
    val connectRate: String get() = Fmt.percent(connected, calls)
}

data class ReportingState(
    val loading: Boolean = true,
    val error: String? = null,
    val myCalls: Int = 0,
    val myConnected: Int = 0,
    val myToday: Int = 0,
    val callbacksKept: Int = 0,
    val callbacksBooked: Int = 0,
    val perDay: List<Pair<String, Int>> = emptyList(),
    val mix: List<Triple<String, Int, com.nxthike.android.core.model.Disposition>> = emptyList(),
    val team: List<RecruiterRow> = emptyList(),
    val funnel: List<Pair<String, Int>> = emptyList(),
    val feed: List<CallLogDto> = emptyList(),
) {
    val myConnectRate: String get() = Fmt.percent(myConnected, myCalls)
}

@HiltViewModel
class ReportingViewModel @Inject constructor(
    private val calls: CallRepository,
    private val hiring: HiringRepository,
    private val auth: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ReportingState())
    val state: StateFlow<ReportingState> = _state.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _state.value = _state.value.copy(loading = true, error = null)

        val logs = calls.list(pageSize = 200).getOrNull()?.items
        if (logs == null) {
            _state.value = _state.value.copy(
                loading = false,
                error = "Couldn't load call activity. Check your connection and retry.",
            )
            return@launch
        }

        val me = auth.cachedUser()?.email
        val mine = if (me != null) logs.filter { it.userEmail == me } else logs

        val connected = mine.count {
            Dispositions.find(it.disposition)?.category == DispositionCategory.Reached
        }
        val today = LocalDate.now()

        // Last six days of activity, oldest first.
        val perDay = (5 downTo 0).map { back ->
            val day = today.minusDays(back.toLong())
            val label = day.dayOfWeek.getDisplayName(
                java.time.format.TextStyle.SHORT, java.util.Locale.UK,
            )
            label to mine.count { Fmt.parse(it.calledAt)?.toLocalDate() == day }
        }

        val mix = mine.groupingBy { it.disposition }.eachCount().entries
            .sortedByDescending { it.value }
            .map { Triple(it.key, it.value, Dispositions.display(it.key)) }

        // Team roll-up, keyed by the email stamped on each call log.
        val users = auth.listUsers().getOrNull().orEmpty()
        val byUser = logs.groupBy { it.userEmail ?: "unattributed" }
        val team = byUser.map { (email, rows) ->
            val user = users.firstOrNull { it.email == email }
            RecruiterRow(
                name = user?.let { u ->
                    listOfNotNull(u.firstName, u.lastName).joinToString(" ").ifBlank { u.email.substringBefore('@') }
                } ?: email.substringBefore('@'),
                email = email,
                calls = rows.size,
                connected = rows.count {
                    Dispositions.find(it.disposition)?.category == DispositionCategory.Reached
                },
                submissions = 0,
            )
        }.sortedByDescending { it.calls }

        val funnel = coroutineScope {
            listOf(
                Stages.Sourced, Stages.Screening, Stages.Submitted,
                Stages.Interview, Stages.Offer, Stages.Hired,
            ).map { stage ->
                async { stage.label to (hiring.candidates(null, null, stage.id, 1, 1).getOrNull()?.total ?: 0) }
            }.awaitAll()
        }

        val callbacks = logs.filter { it.disposition == "connected_callback" }

        _state.value = ReportingState(
            loading = false,
            myCalls = mine.size,
            myConnected = connected,
            myToday = mine.count { Fmt.parse(it.calledAt)?.toLocalDate() == today },
            callbacksBooked = callbacks.size,
            callbacksKept = callbacks.count { cb ->
                val at = Fmt.parse(cb.callbackAt) ?: return@count false
                // Kept = another call to the same candidate after the slot.
                logs.any {
                    it.candidateId == cb.candidateId && it.id != cb.id &&
                        (Fmt.parse(it.calledAt)?.isAfter(at) == true)
                }
            },
            perDay = perDay,
            mix = mix,
            team = team,
            funnel = funnel,
            feed = logs.take(30),
        )
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-RPT-01 · My performance                                       *
 * ------------------------------------------------------------------ */

@Composable
fun PerformanceScreen(onBack: () -> Unit, onTeam: () -> Unit) {
    val vm: ReportingViewModel = hiltViewModel()
    val s by vm.state.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("My performance", onBack, subtitle = "Last 200 logged calls") {
            TText(
                "Team", Type.label, T.Indigo,
                Modifier
                    .clip(T.RBadge)
                    .background(T.IndigoTint)
                    .clickable(onClick = onTeam)
                    .padding(horizontal = 10.dp, vertical = 6.dp),
            )
        }
        when {
            s.loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            s.error != null -> ErrorState(s.error!!, onRetry = { vm.load() })
            else -> Column(
                Modifier.fillMaxSize().verticalScroll(rememberScrollState())
                    .padding(horizontal = T.Gutter).padding(bottom = T.FabInset),
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Calls made", "${s.myCalls}", Modifier.weight(1f), caption = "${s.myToday} today")
                    StatTile("Connect rate", s.myConnectRate, Modifier.weight(1f), T.Green, "${s.myConnected} reached")
                }
                Row(Modifier.padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Callbacks booked", "${s.callbacksBooked}", Modifier.weight(1f), T.Indigo)
                    StatTile(
                        "Callbacks kept", Fmt.percent(s.callbacksKept, s.callbacksBooked),
                        Modifier.weight(1f), T.Teal, "${s.callbacksKept} followed up",
                    )
                }

                // Calls per day
                TCard(Modifier.padding(top = 14.dp), shape = T.RCardLg, padding = 14.dp) {
                    TText("Calls per day", Type.cardTitleSm, T.Ink)
                    val peak = (s.perDay.maxOfOrNull { it.second } ?: 1).coerceAtLeast(1)
                    Row(
                        Modifier.fillMaxWidth().height(128.dp).padding(top = 14.dp),
                        horizontalArrangement = Arrangement.spacedBy(9.dp),
                        verticalAlignment = Alignment.Bottom,
                    ) {
                        s.perDay.forEach { (label, n) ->
                            Column(
                                Modifier.weight(1f).fillMaxHeight(),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Bottom,
                            ) {
                                TText("$n", Type.monoSm, T.InkMuted)
                                Spacer(Modifier.height(6.dp))
                                Box(
                                    Modifier
                                        .fillMaxWidth()
                                        .fillMaxHeight(((n.toFloat() / peak) * 0.78f).coerceAtLeast(0.02f))
                                        .clip(RoundedCornerShape(6.dp, 6.dp, 3.dp, 3.dp))
                                        .background(T.Indigo),
                                )
                                TText(label, Type.labelSm, T.InkFaint, Modifier.padding(top = 6.dp), maxLines = 1)
                            }
                        }
                    }
                }

                if (s.mix.isNotEmpty()) {
                    TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                        TText("Outcome mix", Type.cardTitleSm, T.Ink)
                        Spacer(Modifier.height(11.dp))
                        s.mix.forEach { (_, count, d) ->
                            MixRow(
                                d.label, count,
                                if (s.myCalls > 0) count / s.myCalls.toFloat() else 0f,
                                d.color, d.icon, Modifier.padding(bottom = 10.dp),
                            )
                        }
                    }
                }

                PrimaryButton(
                    "Open team dashboard", onTeam, Modifier.padding(top = 14.dp),
                    icon = Icons.Default.Groups, height = 50.dp, shape = T.RCard,
                    container = T.IndigoTint, contentColor = T.IndigoInk,
                )
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-RPT-02 · Team dashboard                                       *
 * ------------------------------------------------------------------ */

@Composable
fun TeamScreen(onBack: () -> Unit) {
    val vm: ReportingViewModel = hiltViewModel()
    val s by vm.state.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Team dashboard", onBack, subtitle = "Attributed from logged calls")
        when {
            s.loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            s.error != null -> ErrorState(s.error!!, onRetry = { vm.load() })
            else -> Column(
                Modifier.fillMaxSize().verticalScroll(rememberScrollState())
                    .padding(horizontal = T.Gutter).padding(bottom = T.FabInset),
            ) {
                TCard(shape = T.RCardLg, padding = 14.dp) {
                    TText("Calls & connect rate", Type.cardTitleSm, T.Ink)
                    Spacer(Modifier.height(12.dp))
                    val peak = (s.team.maxOfOrNull { it.calls } ?: 1).coerceAtLeast(1)
                    if (s.team.isEmpty()) {
                        TText("No attributed calls yet.", Type.body, T.InkMuted)
                    } else {
                        s.team.forEach { r ->
                            Column(Modifier.padding(bottom = 12.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(9.dp),
                                ) {
                                    Avatar(r.name, r.email, 26.dp)
                                    TText(r.name, Type.label, T.Ink, Modifier.weight(1f), maxLines = 1)
                                    TText("${r.calls}", Type.mono, T.InkMuted)
                                    TText(r.connectRate, Type.mono, T.Ink, Modifier.width(42.dp))
                                }
                                Meter(
                                    r.calls.toFloat() / peak,
                                    Modifier.padding(start = 35.dp, top = 6.dp),
                                    height = 6.dp,
                                    color = avatarColor(r.email),
                                    track = T.Track,
                                )
                            }
                        }
                    }
                }

                TCard(Modifier.padding(top = 12.dp), shape = T.RCardLg, padding = 14.dp) {
                    TText("Pipeline funnel", Type.cardTitleSm, T.Ink)
                    Spacer(Modifier.height(12.dp))
                    val top = (s.funnel.firstOrNull()?.second ?: 1).coerceAtLeast(1)
                    s.funnel.forEach { (label, n) ->
                        Row(
                            Modifier.padding(bottom = 9.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            TText(label, Type.label, T.Ink, Modifier.width(74.dp), maxLines = 1)
                            Box(
                                Modifier.weight(1f).height(22.dp)
                                    .clip(RoundedCornerShape(6.dp)).background(T.Track),
                            ) {
                                Box(
                                    Modifier.fillMaxHeight()
                                        .fillMaxWidth((n.toFloat() / top).coerceIn(0f, 1f))
                                        .clip(RoundedCornerShape(6.dp)).background(T.Indigo),
                                )
                            }
                            TText("$n", Type.mono, T.Ink, Modifier.width(30.dp))
                        }
                    }
                }
            }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-COLLAB-01 · Activity feed                                     *
 * ------------------------------------------------------------------ */

@Composable
fun ActivityFeedScreen(onBack: () -> Unit, onOpenCandidate: (String) -> Unit) {
    val vm: ReportingViewModel = hiltViewModel()
    val s by vm.state.collectAsState()

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Activity", onBack, subtitle = "What the team logged, newest first")
        when {
            s.loading -> SkeletonList(5, Modifier.padding(horizontal = T.Gutter))
            s.error != null -> ErrorState(s.error!!, onRetry = { vm.load() })
            s.feed.isEmpty() -> StateBlock(
                Icons.Default.Forum, "No activity yet",
                "Calls, notes and stage changes across the team land here.",
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(s.feed, key = { it.id }) { log ->
                    val d = Dispositions.display(log.disposition)
                    val who = log.userEmail?.substringBefore('@') ?: "Someone"
                    TCard(onClick = { onOpenCandidate(log.candidateId) }) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(9.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(who, log.userEmail ?: "system", 30.dp)
                            TText(
                                "$who logged ${d.label.lowercase()} · ${log.candidateName ?: "candidate"}",
                                Type.body, T.Ink, Modifier.weight(1f), maxLines = 2,
                            )
                            TText(Fmt.ago(Fmt.parse(log.calledAt)), Type.monoXs, T.InkFaint)
                        }
                        if (log.note.isNotBlank()) {
                            Row(
                                Modifier.padding(top = 9.dp),
                                horizontalArrangement = Arrangement.spacedBy(9.dp),
                            ) {
                                Box(
                                    Modifier.size(28.dp).clip(T.RIcon).background(d.tint),
                                    contentAlignment = Alignment.Center,
                                ) { Icon(d.icon, null, tint = d.color, modifier = Modifier.size(15.dp)) }
                                TText(log.note, Type.body, T.InkBody, Modifier.weight(1f))
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}
