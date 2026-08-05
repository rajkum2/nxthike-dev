package com.nxthike.android.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.nxthike.android.core.model.CallingWindow
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
 * Workspace-level preferences. These are the settings the spec exposes but the
 * NxtHike API has no endpoint for (mode, calling window, notification channels),
 * so they live on-device rather than being invented server-side.
 */
@Singleton
class WorkspaceStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
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
    }

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
