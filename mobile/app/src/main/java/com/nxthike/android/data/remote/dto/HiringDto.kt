package com.nxthike.android.data.remote.dto

import com.nxthike.android.data.remote.moshi.LenientString
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class HiringRoleDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val is_active: Boolean = true,
    val sort_order: Int = 0,
    val count: Int = 0,
)

@JsonClass(generateAdapter = true)
data class HiringRoleWriteDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val is_active: Boolean = true,
    val sort_order: Int = 0,
)

/**
 * A candidate as `/api/hiring/candidates` returns it.
 *
 * The block at the end is the workspace layer's own columns — comp, notice,
 * consent, DNC, ownership and requisition link. They are the fields the
 * recruiting flow runs on, so they are read here rather than inferred from tags.
 *
 * [piiMasked] is set by the server when it withheld `phone` and `email` for the
 * caller's persona. The masked value is what arrived over the wire: do not mask
 * it again, and do not treat it as dialable.
 */
@JsonClass(generateAdapter = true)
data class CandidateDto(
    val id: String,
    val roleId: String,
    val roleName: String = "",
    val status: String = "new",
    val tags: List<String> = emptyList(),
    val notes: String = "",
    val starred: Boolean = false,
    val name: String? = null,
    val applicationLink: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val city: String? = null,
    val gender: String? = null,
    val otherSkills: String? = null,
    val aiResumeMatch: String? = null,
    val institute: String? = null,
    val degree: String? = null,
    val stream: String? = null,
    @LenientString val graduationYear: String? = null,
    val performancePg: String? = null,
    val performanceUg: String? = null,
    val performance12: String? = null,
    val performance10: String? = null,
    val chatLink: String? = null,
    val resumeLink: String? = null,
    val downloadLink: String? = null,
    val appliedAt: String? = null,
    val hasWorkExperience: String? = null,
    @LenientString val totalRoles: String? = null,
    @LenientString val internshipCount: String? = null,
    @LenientString val fulltimeCount: String? = null,
    val companies: String? = null,
    val jobTitles: String? = null,
    val workExperienceDetail: String? = null,
    val experienceDuration: String? = null,
    val latestRole: String? = null,
    val latestCompany: String? = null,
    val careerObjective: String? = null,
    val languages: String? = null,
    val certifications: String? = null,
    val projects: String? = null,
    val extraCurricular: String? = null,
    val additionalDetails: String? = null,
    val relevantSkills: String? = null,
    val educationFromPdf: String? = null,
    val streamFromPdf: String? = null,
    val pdfFile: String? = null,
    val availability: String? = null,
    /** Profile headshot (R2 / CDN). */
    val photoUrl: String? = null,
    val aiInterviewScores: Map<String, Any?> = emptyMap(),
    val skillFlags: Map<String, Any?> = emptyMap(),

    // ---- Workspace columns ----------------------------------------------
    val ownerId: String? = null,
    /** The real column. Older records carry the source as a tag instead. */
    val source: String? = null,
    val currentCtc: Double? = null,
    val expectedCtc: Double? = null,
    val noticeDays: Int? = null,
    val buyout: Boolean? = null,
    /** ISO-8601 instant, UTC. Null means no consent is on file. */
    val consentAt: String? = null,
    val consentChannel: String? = null,
    val dnc: Boolean? = null,
    val requisitionId: String? = null,
    /** True when the server masked `phone`/`email` for this caller's persona. */
    val piiMasked: Boolean = false,

    val createdAt: String? = null,
    val updatedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class PaginatedCandidatesDto(
    val items: List<CandidateDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val pageSize: Int = 50,
    val totalPages: Int = 1,
)

@JsonClass(generateAdapter = true)
data class CandidateWriteDto(
    val id: String? = null,
    val roleId: String,
    val roleName: String = "",
    val status: String = "new",
    val tags: List<String> = emptyList(),
    val notes: String = "",
    val starred: Boolean = false,
    val name: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val city: String? = null,
    val institute: String? = null,
    val degree: String? = null,
    val stream: String? = null,
    val hasWorkExperience: String? = null,
    val experienceDuration: String? = null,
    val latestRole: String? = null,
    val latestCompany: String? = null,
    val companies: String? = null,
    val resumeLink: String? = null,
    val otherSkills: String? = null,
    val availability: String? = null,
    // ---- Workspace columns ----
    val source: String? = null,
    val currentCtc: Double? = null,
    val expectedCtc: Double? = null,
    val noticeDays: Int? = null,
    val buyout: Boolean? = null,
    val consentAt: String? = null,
    val consentChannel: String? = null,
    val dnc: Boolean? = null,
    val requisitionId: String? = null,
    val ownerId: String? = null,
)

/**
 * A partial update. Every field is nullable and omitted-when-null, so a patch
 * only ever carries what the caller actually changed.
 */
@JsonClass(generateAdapter = true)
data class CandidatePatchDto(
    val roleId: String? = null,
    val roleName: String? = null,
    val status: String? = null,
    val tags: List<String>? = null,
    val notes: String? = null,
    val starred: Boolean? = null,
    val name: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val city: String? = null,
    val gender: String? = null,
    val institute: String? = null,
    val degree: String? = null,
    val stream: String? = null,
    val latestRole: String? = null,
    val latestCompany: String? = null,
    val resumeLink: String? = null,
    val otherSkills: String? = null,
    val relevantSkills: String? = null,
    val availability: String? = null,
    val hasWorkExperience: String? = null,
    val experienceDuration: String? = null,
    val photoUrl: String? = null,
    // ---- Workspace columns ----
    val source: String? = null,
    val currentCtc: Double? = null,
    val expectedCtc: Double? = null,
    val noticeDays: Int? = null,
    val buyout: Boolean? = null,
    /** ISO-8601 instant in UTC — use `Instant.now().toString()`, never a local time. */
    val consentAt: String? = null,
    val consentChannel: String? = null,
    val dnc: Boolean? = null,
    val requisitionId: String? = null,
    val ownerId: String? = null,
)

@JsonClass(generateAdapter = true)
data class BulkStatusRequest(val ids: List<String>, val status: String)

@JsonClass(generateAdapter = true)
data class BulkDeleteRequest(val ids: List<String>)

@JsonClass(generateAdapter = true)
data class BulkRoleRequest(
    val ids: List<String>,
    val roleId: String,
    val roleName: String? = null,
)

/** One round trip for the bulk-edit sheet: any subset of these applies to all ids. */
@JsonClass(generateAdapter = true)
data class BulkUpdateRequest(
    val ids: List<String>,
    val status: String? = null,
    val roleId: String? = null,
    val roleName: String? = null,
    val city: String? = null,
    val source: String? = null,
    val gender: String? = null,
    val starred: Boolean? = null,
    val dnc: Boolean? = null,
    val hasWorkExperience: String? = null,
    val experienceDuration: String? = null,
    val noticeDays: Int? = null,
    val availability: String? = null,
    val tagsAdd: List<String>? = null,
    val tagsRemove: List<String>? = null,
    val notesAppend: String? = null,
)

@JsonClass(generateAdapter = true)
data class BulkCountResponse(val updated: Int? = null, val deleted: Int? = null)

@JsonClass(generateAdapter = true)
data class HiringDashboardDto(
    val total: Int = 0,
    val starred: Int = 0,
    val withExp: Int = 0,
    val byStatus: Map<String, Int> = emptyMap(),
    val byRole: Map<String, Int> = emptyMap(),
    val roles: List<HiringRoleDto> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class AdminStatsDto(
    val jobs: Int = 0,
    val internships: Int = 0,
    val fulltime: Int = 0,
    val pendingJobs: Int = 0,
    val events: Int = 0,
    val courses: Int = 0,
    val companies: Int = 0,
    val users: Int = 0,
    val admins: Int = 0,
    val candidates: Int = 0,
    val hiringRoles: Int = 0,
)
