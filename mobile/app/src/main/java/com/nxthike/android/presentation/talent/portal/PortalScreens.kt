package com.nxthike.android.presentation.talent.portal

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.data.remote.dto.CourseDto
import com.nxthike.android.data.remote.dto.EventDto
import com.nxthike.android.domain.repository.CourseRepository
import com.nxthike.android.domain.repository.EventRepository
import com.nxthike.android.presentation.designsystem.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * The portal's events and courses.
 *
 * These have no counterpart in the TalentDialer spec, but the endpoints and the
 * data are real, so they keep a home under More rather than being dropped in
 * the redesign. Same visual language, read-only.
 */
@HiltViewModel
class PortalViewModel @Inject constructor(
    private val events: EventRepository,
    private val courses: CourseRepository,
) : ViewModel() {

    private val _events = MutableStateFlow<List<EventDto>>(emptyList())
    val eventList: StateFlow<List<EventDto>> = _events.asStateFlow()

    private val _courses = MutableStateFlow<List<CourseDto>>(emptyList())
    val courseList: StateFlow<List<CourseDto>> = _courses.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadEvents() = viewModelScope.launch {
        _loading.value = true; _error.value = null
        events.list(1)
            .onSuccess { _events.value = it.items }
            .onError { e -> _error.value = e.message }
        _loading.value = false
    }

    fun loadCourses() = viewModelScope.launch {
        _loading.value = true; _error.value = null
        courses.list(1)
            .onSuccess { _courses.value = it.items }
            .onError { e -> _error.value = e.message }
        _loading.value = false
    }
}

@Composable
fun EventsScreen(onBack: () -> Unit) {
    val vm: PortalViewModel = hiltViewModel()
    val list by vm.eventList.collectAsState()
    val loading by vm.loading.collectAsState()
    val error by vm.error.collectAsState()
    LaunchedEffect(Unit) { vm.loadEvents() }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Events", onBack, subtitle = "${list.size} on the portal")
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            error != null -> ErrorState(error!!, onRetry = { vm.loadEvents() })
            list.isEmpty() -> StateBlock(Icons.Default.Event, "No events", "Nothing published right now.")
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(list, key = { it.id }) { e ->
                    TCard(shape = T.RCardLg, padding = 14.dp) {
                        Row(verticalAlignment = Alignment.Top) {
                            Column(Modifier.weight(1f)) {
                                TText(e.title, Type.section, T.Ink, maxLines = 2)
                                TText(
                                    e.organizer ?: e.type ?: "",
                                    Type.bodySm, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 1,
                                )
                            }
                            if (e.isOnline) Badge("Online", T.TealTint, T.Teal, icon = Icons.Default.Videocam)
                        }
                        Row(
                            Modifier.padding(top = 11.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(Icons.Default.Place, null, tint = T.InkFaint, modifier = Modifier.size(14.dp))
                            TText(e.location ?: "—", Type.labelSm, T.InkMuted, Modifier.weight(1f), maxLines = 1)
                            e.date?.let { TText(it, Type.monoSm, T.InkFaint, maxLines = 1) }
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}

@Composable
fun CoursesScreen(onBack: () -> Unit) {
    val vm: PortalViewModel = hiltViewModel()
    val list by vm.courseList.collectAsState()
    val loading by vm.loading.collectAsState()
    val error by vm.error.collectAsState()
    LaunchedEffect(Unit) { vm.loadCourses() }

    Column(Modifier.fillMaxSize().background(T.Bg)) {
        TopBar("Courses", onBack, subtitle = "${list.size} on the portal")
        when {
            loading -> SkeletonList(4, Modifier.padding(horizontal = T.Gutter))
            error != null -> ErrorState(error!!, onRetry = { vm.loadCourses() })
            list.isEmpty() -> StateBlock(Icons.Default.MenuBook, "No courses", "Nothing published right now.")
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = T.Gutter),
                verticalArrangement = Arrangement.spacedBy(T.Gap),
            ) {
                items(list, key = { it.id }) { c ->
                    TCard(shape = T.RCardLg, padding = 14.dp) {
                        Row(verticalAlignment = Alignment.Top) {
                            Column(Modifier.weight(1f)) {
                                TText(c.title, Type.section, T.Ink, maxLines = 2)
                                TText(
                                    listOfNotNull(c.instructor, c.category).joinToString(" · "),
                                    Type.bodySm, T.InkMuted, Modifier.padding(top = 3.dp), maxLines = 1,
                                )
                            }
                            c.level?.let { Badge(it, T.IndigoTint, T.IndigoInk) }
                        }
                        Row(
                            Modifier.padding(top = 11.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            c.duration?.let { TText(it, Type.labelSm, T.InkMuted, maxLines = 1) }
                            c.rating?.let { TText("★ $it", Type.labelSm, T.Amber, maxLines = 1) }
                            Spacer(Modifier.weight(1f))
                            c.price?.let {
                                TText(if (it <= 0.0) "Free" else "₹${it.toInt()}", Type.mono, T.Ink, maxLines = 1)
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(T.FabInset)) }
            }
        }
    }
}
