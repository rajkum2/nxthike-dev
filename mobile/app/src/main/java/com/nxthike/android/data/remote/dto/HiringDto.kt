package com.nxthike.android.data.remote.dto

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
    val graduationYear: String? = null,
    val performancePg: String? = null,
    val performanceUg: String? = null,
    val performance12: String? = null,
    val performance10: String? = null,
    val chatLink: String? = null,
    val resumeLink: String? = null,
    val downloadLink: String? = null,
    val appliedAt: String? = null,
    val hasWorkExperience: String? = null,
    val totalRoles: String? = null,
    val internshipCount: String? = null,
    val fulltimeCount: String? = null,
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
)

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
    val institute: String? = null,
    val degree: String? = null,
    val latestRole: String? = null,
    val resumeLink: String? = null,
)

@JsonClass(generateAdapter = true)
data class BulkStatusRequest(val ids: List<String>, val status: String)

@JsonClass(generateAdapter = true)
data class BulkDeleteRequest(val ids: List<String>)

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
