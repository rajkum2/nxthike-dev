package com.nxthike.android.presentation.session

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.CallingWindow
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.local.OutboxEntry
import com.nxthike.android.data.local.OutboxStore
import com.nxthike.android.data.local.WorkspaceMode
import com.nxthike.android.data.local.WorkspacePrefs
import com.nxthike.android.data.local.WorkspaceStore
import com.nxthike.android.data.remote.dto.UserDto
import com.nxthike.android.domain.repository.AuthRepository
import com.nxthike.android.domain.repository.CallRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.DayOfWeek
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * App-wide state: who is signed in, which workspace mode is active, whether the
 * calling window is open, and what is still sitting in the offline outbox.
 *
 * Held at the NavHost level so every screen reads one source of truth for the
 * vocabulary swap and the dial gate.
 */
@HiltViewModel
class SessionViewModel @Inject constructor(
    private val auth: AuthRepository,
    private val workspace: WorkspaceStore,
    private val outbox: OutboxStore,
    private val calls: CallRepository,
    networkMonitor: com.nxthike.android.data.local.NetworkMonitor,
) : ViewModel() {

    val isLoggedIn: StateFlow<Boolean> =
        auth.isLoggedIn.stateIn(viewModelScope, SharingStarted.Eagerly, false)

    val prefs: StateFlow<WorkspacePrefs> =
        workspace.prefs.stateIn(viewModelScope, SharingStarted.Eagerly, WorkspacePrefs())

    val pending: StateFlow<List<OutboxEntry>> =
        outbox.entries.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    private val _user = MutableStateFlow<UserDto?>(null)
    val user: StateFlow<UserDto?> = _user.asStateFlow()

    /**
     * Also set when a request fails with a network error, so a reachable-but-dead
     * backend still surfaces the offline affordances.
     */
    private val _offline = MutableStateFlow(false)
    val offline: StateFlow<Boolean> = _offline.asStateFlow()

    private val _syncing = MutableStateFlow(false)
    val syncing: StateFlow<Boolean> = _syncing.asStateFlow()

    /**
     * False until the persisted session and workspace preferences have been read
     * off disk. The splash must wait for this: both flows start on placeholder
     * values, so routing before it lands would bounce a signed-in user back to
     * the login screen.
     */
    private val _bootstrapped = MutableStateFlow(false)
    val bootstrapped: StateFlow<Boolean> = _bootstrapped.asStateFlow()

    /**
     * True once the signed-in user's profile is known — from the server, or from
     * cache when the server is unreachable. The access gate must not decide
     * before this, or a slow `auth/me` reads as "no role yet".
     */
    private val _profileResolved = MutableStateFlow(false)
    val profileResolved: StateFlow<Boolean> = _profileResolved.asStateFlow()

    init {
        // Track real connectivity, and drain the outbox the moment it returns.
        viewModelScope.launch {
            networkMonitor.online.collect { online ->
                _offline.value = !online
                if (online) drainOutbox()
            }
        }
        viewModelScope.launch {
            val signedIn = auth.isLoggedIn.first()
            workspace.prefs.first()
            _user.value = auth.cachedUser()
            _bootstrapped.value = true

            if (signedIn) {
                when (val r = auth.me()) {
                    is AppResult.Success -> { _user.value = r.data; _offline.value = false }
                    is AppResult.Error -> _offline.value = r.code == null
                }
                _profileResolved.value = true
                drainOutbox()
            } else {
                _profileResolved.value = true
            }
        }
    }

    val mode: WorkspaceMode get() = prefs.value.mode
    val window: CallingWindow get() = prefs.value.window

    fun windowOpen(now: LocalDateTime = LocalDateTime.now()): Boolean = window.isOpenAt(now)

    fun setMode(m: WorkspaceMode) = viewModelScope.launch { workspace.setMode(m) }
    fun setOnboarded() = viewModelScope.launch { workspace.setOnboarded(true) }
    fun acceptDpdp() = viewModelScope.launch { workspace.setDpdpAccepted(true) }
    fun markPrimed() = viewModelScope.launch { workspace.setPermissionsPrimed(true) }
    fun setMaskPii(v: Boolean) = viewModelScope.launch { workspace.setMaskPii(v) }
    fun setNotify(key: String, v: Boolean) = viewModelScope.launch { workspace.setNotify(key, v) }
    fun setWindow(open: Int, close: Int) = viewModelScope.launch { workspace.setWindow(open, close) }
    fun toggleDay(d: DayOfWeek) = viewModelScope.launch { workspace.toggleDay(d) }

    fun markOffline(isOffline: Boolean) { _offline.value = isOffline }

    fun refreshUser() = viewModelScope.launch {
        _user.value = _user.value ?: auth.cachedUser()
        auth.me().onSuccess { _user.value = it; _offline.value = false }
        _profileResolved.value = true
    }

    fun logout(onDone: () -> Unit) = viewModelScope.launch {
        auth.logout()
        _user.value = null
        _profileResolved.value = true
        onDone()
    }

    /**
     * Replays queued dispositions oldest-first. A failure leaves the entry in
     * place with its error recorded — nothing is dropped silently.
     */
    fun drainOutbox() = viewModelScope.launch {
        val queued = pending.value
        if (queued.isEmpty()) return@launch
        _syncing.value = true
        var anyNetworkFailure = false
        for (entry in queued) {
            when (val r = calls.logCall(entry.body)) {
                is AppResult.Success -> outbox.remove(entry.id)
                is AppResult.Error -> {
                    outbox.markError(entry.id, r.message)
                    if (r.code == null) anyNetworkFailure = true
                }
            }
        }
        _offline.value = anyNetworkFailure
        _syncing.value = false
    }

    fun discardOutbox() = viewModelScope.launch { outbox.clear() }

    /**
     * Every hiring, calls and dashboard route is gated on `get_admin_user`
     * server-side. A signed-in non-admin would otherwise hit a 403 on every
     * screen, so the app blocks once and explains why.
     */
    val needsAccess: StateFlow<Boolean> = _user
        .map { it != null && !it.role.equals("admin", ignoreCase = true) }
        .stateIn(viewModelScope, SharingStarted.Eagerly, false)

    val role: String get() = _user.value?.role ?: "unknown"

    val displayName: String
        get() = _user.value?.let { u ->
            listOfNotNull(u.firstName, u.lastName).joinToString(" ").ifBlank { u.email.substringBefore('@') }
        } ?: "there"
}
