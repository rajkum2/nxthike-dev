package com.nxthike.android.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore("nxthike_prefs")

@Singleton
class TokenStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val tokenKey = stringPreferencesKey("access_token")
    private val userJsonKey = stringPreferencesKey("user_json")

    val tokenFlow: Flow<String?> = context.dataStore.data.map { it[tokenKey] }

    suspend fun getToken(): String? = context.dataStore.data.first()[tokenKey]

    suspend fun saveSession(token: String, userJson: String) {
        context.dataStore.edit {
            it[tokenKey] = token
            it[userJsonKey] = userJson
        }
    }

    suspend fun getUserJson(): String? = context.dataStore.data.first()[userJsonKey]

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }
}
