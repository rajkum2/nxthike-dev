package com.nxthike.android.presentation.session

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.model.CallingWindow
import com.nxthike.android.core.model.Caps
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.local.OutboxEntry
import com.nxthike.android.data.local.OutboxStore
import com.nxthike.android.data.local.WorkspaceMode
import com.nxthike.android.data.local.WorkspacePrefs
import com.nxthike.android.data.local.WorkspaceStore
import com.nxthike.android.data.remote.dto.CallingWindowUpdateDto
import com.nxthike.android.data.remote.dto.SessionDto
import com.nxthike.android.data.remote.dto.SettingsUpdateDto
import com.nxthike.android.domain.repository.AuthRepository
import com.nxthike.android.domain.repository.CallRepository
import com.nxthike.android.domain.repository.WorkspaceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.DayOfWeek
import java.time.LocalDateTime
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * Whether this account may use the recruiting workspace at all.
 *
 * The server decides. `get_workspace_user` admits any account with a persona
 * assigned (and any admin), and refuses portal-only students and employers with
 * a 403 that explains itself — so that message is what the user sees, rather
 * than this app guessing from a role name.
 */
sealed interface Access {
    data object Resolving : Access
    data object Granted : Access
    data class Denied(val reason: String) : Access
}

/**
 * App-wide state: who is signed in, what their persona may do, whether the
 * calling window is open, and what is still sitting in the offline outbox.
 *
 * Held at the NavHost level so every screen reads one source of truth for the
 * capability gates, the vocabulary swap and the dial gate.
 */
@HiltViewModel
class SessionViewModel @Inject constructor(
    private val auth: AuthRepository,
    private val workspace: WorkspaceRepository,
    private val store: WorkspaceStore,
    private val outbox: OutboxStore,
    private val calls: CallRepository,
    networkMonitor: com.nxthike.android.data.local.NetworkMonitor,
) : ViewModel() {

    val isLoggedIn: StateFlow<Boolean> =
        auth.isLoggedIn.stateIn(viewModelScope, SharingStarted.Eagerly, false)

    val prefs: StateFlow<WorkspacePrefs> =
        store.prefs.stateIn(viewModelScope, SharingStarted.Eagerly, WorkspacePrefs())

    val pending: StateFlow<List<OutboxEntry>> =
        outbox.entries.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    private val _user = MutableStateFlow<com.nxthike.android.data.remote.dto.UserDto?>(null)
    val user: StateFlow<com.nxthike.android.data.remote.dto.UserDto?> = _user.asStateFlow()

    /** The workspace session — persona, capabilities, nav allow-list, settings. */
    private val _session = MutableStateFlow<SessionDto?>(null)
    val session: StateFlow<SessionDto?> = _session.asStateFlow()

    /**
     * What this persona may do.
     *
     * Starts closed, so no screen briefly offers an action the persona does not
     * hold. The server enforces every one of these independently — this only
     * decides what the UI puts in front of the user.
     */
    private val _caps = MutableStateFlow(Caps.NONE)
    val caps: StateFlow<Caps> = _caps.asStateFlow()

    private val _access = MutableStateFlow<Access>(Access.Resolving)
    val access: StateFlow<Access> = _access.asStateFlow()

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
     * True once the workspace session is known — from the server, or from cache
     * when the server is unreachable. The access gate must not decide before
     * this, or a slow request reads as "no access".
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
            store.prefs.first()
            _user.value = auth.cachedUser()
            _session.value = store.cachedSession.first()
            _bootstrapped.value = true
        }
        // Resolve the session on every sign-in, not just the one that happened to
        // be in place when this ViewModel was constructed. Signing in after boot
        // would otherwise leave capabilities empty until the app was restarted —
        // and an admin editing the calling window would have their own edit
        // reverted, because `pushWindow` would not yet know they were an admin.
        viewModelScope.launch {
            var wasSignedIn: Boolean? = null
            auth.isLoggedIn.collect { signedIn ->
                if (signedIn == wasSignedIn) return@collect
                wasSignedIn = signedIn
                if (signedIn) {
                    loadSession()
                    drainOutbox()
                } else {
                    _session.value = null
                    _caps.value = Caps.NONE
                    _access.value = Access.Resolving
                    _profileResolved.value = true
                }
            }
        }
    }

    /**
     * Resolves the workspace session, and with it every capability gate.
     *
     * The three outcomes are deliberately different:
     *  - **200** — persona, caps and settings land; the server's calling window
     *    is written to disk so the dial gate matches the workspace.
     *  - **403** — this account has no workspace access. Show what the server
     *    said; do not retry, because nothing will change until an admin acts.
     *  - **network failure** — fall back to the last good session. A recruiter
     *    on a train keeps the persona they actually hold.
     */
    fun loadSession() = viewModelScope.launch {
        when (val r = workspace.session()) {
            is AppResult.Success -> {
                val s = r.data
                _session.value = s
                _caps.value = Caps(s.caps)
                _access.value = Access.Granted
                _offline.value = false
                store.saveSession(s)
                // `auth/me` is the only source for the portal profile fields the
                // profile screen shows; the session carries identity, not those.
                auth.me().onSuccess { _user.value = it }
            }
            is AppResult.Error -> {
                val cached = _session.value ?: store.cachedSession.first()
                when {
                    r.code == 403 -> {
                        _caps.value = Caps.NONE
                        _access.value = Access.Denied(r.message)
                    }
                    cached != null -> {
                        _session.value = cached
                        _caps.value = Caps(cached.caps)
                        _access.value = Access.Granted
                        _offline.value = r.code == null
                    }
                    r.code == null -> {
                        // Genuinely offline, nothing cached. Opening up beats
                        // locking out: the server gates every route anyway, so the
                        // worst case is an action that fails with a message rather
                        // than one that is quietly missing.
                        _caps.value = Caps.OPTIMISTIC
                        _access.value = Access.Granted
                        _offline.value = true
                    }
                    else -> {
                        // The server answered and refused. A 401 has already had
                        // the token cleared by the interceptor, so this resolves
                        // to the login screen rather than a home screen whose
                        // every request will fail the same way.
                        _caps.value = Caps.NONE
                        _access.value = Access.Denied(r.message)
                    }
                }
            }
        }
        _profileResolved.value = true
    }

    /** Try on another persona — admin-only server-side, and it re-resolves caps. */
    fun switchPersona(personaId: String, onDone: () -> Unit = {}) = viewModelScope.launch {
        workspace.switchPersona(personaId).onSuccess { s ->
            _session.value = s
            _caps.value = Caps(s.caps)
            store.saveSession(s)
            onDone()
        }
    }

    val mode: WorkspaceMode get() = prefs.value.mode
    val window: CallingWindow get() = prefs.value.window

    /**
     * Whether dialling is permitted right now.
     *
     * Evaluated against the workspace's own window, cached from the server. The
     * server also computes this (`callingWindow.isOpen`) but only at the moment
     * the session was fetched, so the live check has to happen here.
     */
    fun windowOpen(now: LocalDateTime = LocalDateTime.now()): Boolean = window.isOpenAt(now)

    /** The server's verdict at session time — used to spot a device-clock skew. */
    val serverSaysWindowOpen: Boolean?
        get() = _session.value?.settings?.callingWindow?.isOpen

    val personaName: String get() = _session.value?.personaName ?: ""
    val orgName: String get() = _session.value?.settings?.orgName.orEmpty()
    val retentionMonths: Int get() = _session.value?.settings?.retentionMonths ?: 24

    /** Screen keys this persona may reach, per the server's own allow-list. */
    fun mayReach(navKey: String): Boolean {
        val nav = _session.value?.nav ?: return true // unknown yet: don't hide things
        return nav.isEmpty() || navKey in nav
    }

    fun setOnboarded() = viewModelScope.launch { store.setOnboarded(true) }
    fun acceptDpdp() = viewModelScope.launch { store.setDpdpAccepted(true) }
    fun markPrimed() = viewModelScope.launch { store.setPermissionsPrimed(true) }
    fun setMaskPii(v: Boolean) = viewModelScope.launch { store.setMaskPii(v) }
    fun setNotify(key: String, v: Boolean) = viewModelScope.launch { store.setNotify(key, v) }

    /**
     * Mode is a workspace setting, not a device one.
     *
     * An admin changing it changes it for everyone; anyone else only changes what
     * their own device shows until the next session refresh overwrites it.
     */
    fun setMode(m: WorkspaceMode) = viewModelScope.launch {
        store.setMode(m)
        if (_caps.value.isAdmin) {
            workspace.updateSettings(SettingsUpdateDto(mode = m.name))
                .onSuccess { s -> store.applyServerSettings(s.mode, s.callingWindow) }
        }
    }

    /**
     * Edits the workspace calling window.
     *
     * Only an admin can move it for the team. For anyone else the write is
     * refused server-side, so the local change is reverted from the server's
     * copy rather than left to look as if it applied.
     */
    fun setWindow(open: Int, close: Int) = viewModelScope.launch {
        store.setWindow(open, close)
        pushWindow(openHour = open, closeHour = close)
    }

    fun toggleDay(d: DayOfWeek) = viewModelScope.launch {
        store.toggleDay(d)
        pushWindow(days = store.prefs.first().window.days.map { it.value }.sorted())
    }

    private suspend fun pushWindow(
        openHour: Int? = null,
        closeHour: Int? = null,
        days: List<Int>? = null,
    ) {
        if (!_caps.value.isAdmin) {
            // Not entitled — pull the workspace's real window back over the edit.
            workspace.settings().onSuccess { store.applyServerSettings(it.mode, it.callingWindow) }
            return
        }
        workspace.updateSettings(
            SettingsUpdateDto(
                callingWindow = CallingWindowUpdateDto(
                    openHour = openHour,
                    closeHour = closeHour,
                    days = days,
                ),
            ),
        ).onSuccess { s -> store.applyServerSettings(s.mode, s.callingWindow) }
    }

    fun markOffline(isOffline: Boolean) { _offline.value = isOffline }

    fun refreshUser() = viewModelScope.launch {
        _user.value = _user.value ?: auth.cachedUser()
        auth.me().onSuccess { _user.value = it; _offline.value = false }
        loadSession()
    }

    fun logout(onDone: () -> Unit) = viewModelScope.launch {
        auth.logout()
        store.clearSession()
        _user.value = null
        _session.value = null
        _caps.value = Caps.NONE
        _access.value = Access.Resolving
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
     * True when the server has refused this account the recruiting workspace.
     *
     * This used to be `role != "admin"`, which locked out every persona the
     * backend now admits — a sourcer or recruiter who uses the web desk daily
     * could not get past the access screen. The server's 403 is the only thing
     * that should close this door.
     */
    val needsAccess: StateFlow<Boolean> = MutableStateFlow(false).also { flow ->
        viewModelScope.launch {
            access.collect { flow.value = it is Access.Denied }
        }
    }.asStateFlow()

    /** What the server said when it refused, for the access screen to show. */
    val accessDenialReason: String?
        get() = (_access.value as? Access.Denied)?.reason

    val role: String get() = _session.value?.role ?: _user.value?.role ?: "unknown"

    val displayName: String
        get() = _session.value?.name?.takeIf { it.isNotBlank() }
            ?: _user.value?.let { u ->
                listOfNotNull(u.firstName, u.lastName).joinToString(" ")
                    .ifBlank { u.email.substringBefore('@') }
            }
            ?: "there"
}
