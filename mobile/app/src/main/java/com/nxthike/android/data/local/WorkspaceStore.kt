package com.nxthike.android.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.nxthike.android.core.model.CallingWindow
import com.nxthike.android.data.remote.dto.CallingWindowDto
import com.nxthike.android.data.remote.dto.SessionDto
import com.squareup.moshi.Moshi
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.DayOfWeek
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.workspaceStore by preferencesDataStore("talent_workspace")

/** AGENCY reshapes vocabulary to Client/Requisition; IN_HOUSE to Department/Opening. */
enum class WorkspaceMode { AGENCY, IN_HOUSE;
    val clientWord: String get() = if (this == AGENCY) "Client" else "Department"
    val reqWord: String get() = if (this == AGENCY) "Requisition" else "Opening"
    val reqWordPlural: String get() = if (this == AGENCY) "Requisitions" else "Openings"
    val jobsTab: String get() = if (this == AGENCY) "Jobs" else "Openings"
    /** Bill/pay rates are an agency concept and stay hidden in-house. */
    val showsRates: Boolean get() = this == AGENCY
    val label: String get() = if (this == AGENCY) "AGENCY" else "IN-HOUSE"
}

data class WorkspacePrefs(
    val mode: WorkspaceMode = WorkspaceMode.AGENCY,
    val window: CallingWindow = CallingWindow.Default,
    val onboarded: Boolean = false,
    val dpdpAccepted: Boolean = false,
    val permissionsPrimed: Boolean = false,
    val notifyCallbacks: Boolean = true,
    val notifyMentions: Boolean = true,
    val notifyApprovals: Boolean = true,
    val notifyInterviews: Boolean = false,
    val notifyWindow: Boolean = true,
    val maskPii: Boolean = false,
)

/**
 * Workspace-level state on disk.
 *
 * Two different things live here, and the difference matters:
 *
 *  - **Server-owned settings** — mode and the calling window. These come from
 *    `GET /api/workspace/settings`; this store is a cache so the dial gate still
 *    holds when the app opens without a signal. [applyServerSettings] is the
 *    only thing that should write them on a normal launch.
 *  - **Device preferences** — onboarding progress, notification channels and the
 *    mask-PII toggle. These are genuinely local and stay that way.
 *
 * [saveSession] keeps the last good session so a network failure degrades to
 * the persona the user actually holds rather than to no capabilities at all.
 */
@Singleton
class WorkspaceStore @Inject constructor(
    @ApplicationContext private val context: Context,
    moshi: Moshi,
) {
    private val sessionAdapter = moshi.adapter(SessionDto::class.java)
    private object K {
        val mode = stringPreferencesKey("mode")
        val openHour = intPreferencesKey("window_open_hour")
        val closeHour = intPreferencesKey("window_close_hour")
        val days = stringSetPreferencesKey("window_days")
        val onboarded = booleanPreferencesKey("onboarded")
        val dpdp = booleanPreferencesKey("dpdp_accepted")
        val primed = booleanPreferencesKey("permissions_primed")
        val nCallbacks = booleanPreferencesKey("notify_callbacks")
        val nMentions = booleanPreferencesKey("notify_mentions")
        val nApprovals = booleanPreferencesKey("notify_approvals")
        val nInterviews = booleanPreferencesKey("notify_interviews")
        val nWindow = booleanPreferencesKey("notify_window")
        val mask = booleanPreferencesKey("mask_pii")
        val session = stringPreferencesKey("session_json")
        val timezone = stringPreferencesKey("window_timezone")
    }

    /**
     * The last session the server returned, or null before the first success.
     *
     * A malformed blob (an app upgrade that changed the shape) reads as null
     * rather than throwing — a stale cache must never brick the launch path.
     */
    val cachedSession: Flow<SessionDto?> = context.workspaceStore.data.map { p ->
        p[K.session]?.let { json -> runCatching { sessionAdapter.fromJson(json) }.getOrNull() }
    }

    suspend fun saveSession(session: SessionDto) {
        context.workspaceStore.edit { p ->
            p[K.session] = sessionAdapter.toJson(session)
        }
        applyServerSettings(session.mode, session.settings.callingWindow)
    }

    suspend fun clearSession() = context.workspaceStore.edit { it.remove(K.session) }.let { }

    /**
     * Mirrors the workspace's own mode and calling window onto the device.
     *
     * The server is the authority: an admin tightening the window centrally has
     * to change the gate on every phone, so this overwrites whatever was here.
     */
    suspend fun applyServerSettings(mode: String, window: CallingWindowDto) =
        context.workspaceStore.edit { p ->
            runCatching { WorkspaceMode.valueOf(mode) }.getOrNull()?.let { p[K.mode] = it.name }
            p[K.openHour] = window.openHour.coerceIn(0, 23)
            p[K.closeHour] = window.closeHour.coerceIn(1, 24)
            // The server sends ISO weekday numbers (1 = Monday).
            window.days
                .mapNotNull { n -> runCatching { DayOfWeek.of(n) }.getOrNull() }
                .takeIf { it.isNotEmpty() }
                ?.let { days -> p[K.days] = days.map { it.name }.toSet() }
            p[K.timezone] = window.timezone
        }.let { }

    val prefs: Flow<WorkspacePrefs> = context.workspaceStore.data.map { p ->
        val days = p[K.days]
            ?.mapNotNull { runCatching { DayOfWeek.valueOf(it) }.getOrNull() }
            ?.toSet()
            ?.takeIf { it.isNotEmpty() }
            ?: CallingWindow.Default.days
        WorkspacePrefs(
            mode = runCatching { WorkspaceMode.valueOf(p[K.mode] ?: "AGENCY") }
                .getOrDefault(WorkspaceMode.AGENCY),
            window = CallingWindow(
                openHour = p[K.openHour] ?: 9,
                closeHour = p[K.closeHour] ?: 21,
                days = days,
                zoneLabel = p[K.timezone] ?: CallingWindow.Default.zoneLabel,
            ),
            onboarded = p[K.onboarded] ?: false,
            dpdpAccepted = p[K.dpdp] ?: false,
            permissionsPrimed = p[K.primed] ?: false,
            notifyCallbacks = p[K.nCallbacks] ?: true,
            notifyMentions = p[K.nMentions] ?: true,
            notifyApprovals = p[K.nApprovals] ?: true,
            notifyInterviews = p[K.nInterviews] ?: false,
            notifyWindow = p[K.nWindow] ?: true,
            maskPii = p[K.mask] ?: false,
        )
    }

    suspend fun setMode(mode: WorkspaceMode) =
        context.workspaceStore.edit { it[K.mode] = mode.name }.let { }

    suspend fun setWindow(openHour: Int, closeHour: Int) = context.workspaceStore.edit {
        it[K.openHour] = openHour.coerceIn(0, 23)
        it[K.closeHour] = closeHour.coerceIn(1, 24)
    }.let { }

    suspend fun toggleDay(day: DayOfWeek) = context.workspaceStore.edit { p ->
        val cur = p[K.days] ?: CallingWindow.Default.days.map { it.name }.toSet()
        p[K.days] = if (day.name in cur) cur - day.name else cur + day.name
    }.let { }

    suspend fun setOnboarded(v: Boolean) = context.workspaceStore.edit { it[K.onboarded] = v }.let { }
    suspend fun setDpdpAccepted(v: Boolean) = context.workspaceStore.edit { it[K.dpdp] = v }.let { }
    suspend fun setPermissionsPrimed(v: Boolean) = context.workspaceStore.edit { it[K.primed] = v }.let { }
    suspend fun setMaskPii(v: Boolean) = context.workspaceStore.edit { it[K.mask] = v }.let { }

    suspend fun setNotify(key: String, v: Boolean) = context.workspaceStore.edit {
        when (key) {
            "callbacks" -> it[K.nCallbacks] = v
            "mentions" -> it[K.nMentions] = v
            "approvals" -> it[K.nApprovals] = v
            "interviews" -> it[K.nInterviews] = v
            "window" -> it[K.nWindow] = v
        }
    }.let { }
}
