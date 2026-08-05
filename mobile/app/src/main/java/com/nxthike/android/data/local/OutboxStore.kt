package com.nxthike.android.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.nxthike.android.data.remote.dto.CallLogCreateDto
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.outboxStore by preferencesDataStore("talent_outbox")

/** One disposition captured while offline, waiting to be replayed. */
@JsonClass(generateAdapter = true)
data class OutboxEntry(
    val id: String,
    val body: CallLogCreateDto,
    /** Display label for the sync screen, e.g. "Disposition · Vikas Nair". */
    val title: String,
    val detail: String,
    val queuedAt: String,
    val lastError: String? = null,
)

/**
 * Durable outbox for call outcomes.
 *
 * The spec's promise is that a disposition logged with no signal is never lost —
 * it queues, the sheet still closes, and the sync screen shows exactly what is
 * pending. Entries carry their original `calledAt` so replaying them later does
 * not shift the call's timestamp.
 */
@Singleton
class OutboxStore @Inject constructor(
    @ApplicationContext private val context: Context,
    moshi: Moshi,
) {
    private val adapter = moshi.adapter<List<OutboxEntry>>(
        Types.newParameterizedType(List::class.java, OutboxEntry::class.java),
    )
    private val key = stringPreferencesKey("entries")

    val entries: Flow<List<OutboxEntry>> = context.outboxStore.data.map { p ->
        p[key]?.let { runCatching { adapter.fromJson(it) }.getOrNull() }.orEmpty()
    }

    private suspend fun mutate(block: (List<OutboxEntry>) -> List<OutboxEntry>) {
        context.outboxStore.edit { p ->
            val cur = p[key]?.let { runCatching { adapter.fromJson(it) }.getOrNull() }.orEmpty()
            p[key] = adapter.toJson(block(cur))
        }
    }

    suspend fun add(entry: OutboxEntry) = mutate { it + entry }

    suspend fun remove(id: String) = mutate { list -> list.filterNot { it.id == id } }

    suspend fun markError(id: String, error: String) =
        mutate { list -> list.map { if (it.id == id) it.copy(lastError = error) else it } }

    suspend fun clear() = mutate { emptyList() }
}
