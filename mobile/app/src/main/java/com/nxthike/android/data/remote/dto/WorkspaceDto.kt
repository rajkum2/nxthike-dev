package com.nxthike.android.data.remote.dto

import com.squareup.moshi.JsonClass

/**
 * DTOs for `/api/workspace/…` — the recruiting workspace layer.
 *
 * Generated against the live production OpenAPI schema
 * (`https://api.nxthike.com/openapi.json`), so field names and nullability
 * mirror the server exactly. Every JSON key is already camelCase server-side,
 * which is why nothing here needs `@Json(name = ...)`.
 *
 * This file covers session, settings, taxonomy and the admin surfaces;
 * requisitions and the pipeline artefacts live in `RecruitingDto.kt`.
 */

/* ------------------------------------------------------------------ *
 *  Session, personas, capabilities                                   *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class CallingWindowDto(
    val openHour: Int = 9,
    val closeHour: Int = 21,
    val days: List<Int> = listOf(1, 2, 3, 4, 5, 6, 7),
    val timezone: String = "Asia/Kolkata",
    /** Server's own verdict, computed in the workspace timezone. */
    val isOpen: Boolean = true,
    val label: String = "",
)

@JsonClass(generateAdapter = true)
data class WorkspaceSettingsDto(
    val orgName: String = "",
    val mode: String = "AGENCY",
    val callingWindow: CallingWindowDto = CallingWindowDto(),
    val retentionMonths: Int = 24,
    val notificationToggles: Map<String, Boolean> = emptyMap(),
    /** persona id → capability name → level. Heterogeneous, so read untyped. */
    val roleMatrix: Map<String, Map<String, String>> = emptyMap(),
)

/**
 * `caps` is deliberately untyped.
 *
 * The server mixes booleans with enum strings in one map — `dial` is a boolean,
 * `db` is one of `all`/`assigned`/`limitedPII`/…, and `approve` can be `true`,
 * `false` or the string `"config"`. Decoding that into a data class would mean
 * a custom adapter per field for no gain, so it stays a map and
 * [com.nxthike.android.core.model.Caps] provides the accessors.
 */
@JsonClass(generateAdapter = true)
data class SessionDto(
    val userId: String = "",
    val email: String = "",
    val name: String = "",
    val role: String = "",
    val personaId: String = "",
    val personaName: String = "",
    val mode: String = "AGENCY",
    val landing: String = "home",
    val home: String = "",
    val caps: Map<String, Any?> = emptyMap(),
    /** Screen keys this persona may reach — the server's own nav allow-list. */
    val nav: List<String> = emptyList(),
    val settings: WorkspaceSettingsDto = WorkspaceSettingsDto(),
    val personas: List<Map<String, Any?>> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class PersonaDto(
    val id: String,
    val name: String = "",
    val short: String = "",
    val mode: String = "AGENCY",
    val landing: String = "home",
    val home: String = "",
    val caps: Map<String, Any?> = emptyMap(),
)

@JsonClass(generateAdapter = true)
data class SelfPersonaDto(val persona: String)

/* ------------------------------------------------------------------ *
 *  Settings writes                                                   *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class CallingWindowUpdateDto(
    val openHour: Int? = null,
    val closeHour: Int? = null,
    val days: List<Int>? = null,
    val timezone: String? = null,
)

@JsonClass(generateAdapter = true)
data class SettingsUpdateDto(
    val orgName: String? = null,
    val mode: String? = null,
    val callingWindow: CallingWindowUpdateDto? = null,
    val retentionMonths: Int? = null,
    val notificationToggles: Map<String, Boolean>? = null,
)

/* ------------------------------------------------------------------ *
 *  Taxonomy                                                          *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class TaxonomyDispositionDto(
    val id: String,
    val label: String = "",
    val category: String = "",
)

@JsonClass(generateAdapter = true)
data class TaxonomyDto(
    val dispositions: List<TaxonomyDispositionDto> = emptyList(),
    /** The ids the server will actually accept on a call log. */
    val enforced: List<String> = emptyList(),
)

/* ------------------------------------------------------------------ *
 *  Workspace roster                                                  *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class WorkspaceUserDto(
    val id: String,
    val email: String = "",
    val name: String = "",
    val role: String = "",
    val persona: String? = null,
    val personaName: String? = null,
    val status: String = "active",
    val title: String? = null,
    val org: String? = null,
    val createdAt: String? = null,
    val lastActiveAt: String? = null,
    val invitedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class InviteRequestDto(
    val email: String,
    val firstName: String = "",
    val lastName: String = "",
    val persona: String = "p1",
    val title: String? = null,
    val tempPassword: String,
)

@JsonClass(generateAdapter = true)
data class UserPatchDto(
    val persona: String? = null,
    val status: String? = null,
    val title: String? = null,
    val org: String? = null,
)

/* ------------------------------------------------------------------ *
 *  Tasks                                                             *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class TaskDto(
    val id: String,
    val title: String = "",
    val detail: String = "",
    val dueAt: String? = null,
    val assigneeId: String? = null,
    val assigneeName: String? = null,
    val linkKind: String? = null,
    val linkId: String? = null,
    val linkLabel: String? = null,
    val done: Boolean = false,
    val overdue: Boolean = false,
    val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class TaskCreateDto(
    val title: String,
    val detail: String = "",
    val dueAt: String? = null,
    val assigneeId: String? = null,
    val assigneeName: String? = null,
    val linkKind: String? = null,
    val linkId: String? = null,
    val linkLabel: String? = null,
)

@JsonClass(generateAdapter = true)
data class TaskPatchDto(
    val done: Boolean? = null,
    val title: String? = null,
    val dueAt: String? = null,
    val snoozedUntil: String? = null,
    val assigneeId: String? = null,
    val assigneeName: String? = null,
)

/* ------------------------------------------------------------------ *
 *  Notifications                                                     *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class NotificationDto(
    val id: String,
    val kind: String = "",
    val title: String = "",
    val detail: String = "",
    val refKind: String? = null,
    val refId: String? = null,
    val read: Boolean = false,
    val createdAt: String? = null,
)

/* ------------------------------------------------------------------ *
 *  Audit & compliance                                                *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class AuditDto(
    val id: String,
    val actorName: String? = null,
    val actorEmail: String? = null,
    val action: String = "",
    val objectKind: String? = null,
    val objectId: String? = null,
    val objectLabel: String? = null,
    val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class ComplianceDto(
    val totalCandidates: Int = 0,
    val withConsent: Int = 0,
    val missingConsent: Int = 0,
    val dncCount: Int = 0,
    val retentionMonths: Int = 24,
    val openErasures: Int = 0,
)

@JsonClass(generateAdapter = true)
data class ErasureDto(
    val id: String,
    val candidateId: String,
    val candidateName: String? = null,
    val reason: String = "",
    val status: String = "open",
    val raisedByName: String? = null,
    val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class ErasureCreateDto(
    val candidateId: String,
    val reason: String = "",
)

@JsonClass(generateAdapter = true)
data class ErasureDecisionDto(val status: String)
