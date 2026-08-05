package com.nxthike.android.domain.repository

import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.*
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    val isLoggedIn: Flow<Boolean>
    suspend fun login(email: String, password: String): AppResult<UserDto>
    suspend fun register(email: String, password: String, firstName: String?, lastName: String?, role: String): AppResult<UserDto>
    suspend fun me(): AppResult<UserDto>
    suspend fun updateProfile(body: ProfileUpdateRequest): AppResult<UserDto>
    suspend fun changePassword(current: String, new: String): AppResult<Unit>
    suspend fun logout()
    suspend fun cachedUser(): UserDto?
    /** Workspace roster — backs the team dashboard and the activity feed. */
    suspend fun listUsers(): AppResult<List<UserDto>>
}

interface JobRepository {
    suspend fun list(search: String?, type: String?, page: Int, status: String?): AppResult<PaginatedJobsDto>
    suspend fun get(id: String): AppResult<JobDto>
    suspend fun create(body: JobWriteDto): AppResult<JobDto>
    suspend fun update(id: String, body: JobWriteDto): AppResult<JobDto>
    suspend fun delete(id: String): AppResult<Unit>
}

interface EventRepository {
    suspend fun list(page: Int): AppResult<PaginatedEventsDto>
    suspend fun get(id: String): AppResult<EventDto>
    suspend fun create(body: EventWriteDto): AppResult<EventDto>
    suspend fun update(id: String, body: EventWriteDto): AppResult<EventDto>
    suspend fun delete(id: String): AppResult<Unit>
}

interface CourseRepository {
    suspend fun list(page: Int): AppResult<PaginatedCoursesDto>
    suspend fun get(id: String): AppResult<CourseDto>
    suspend fun create(body: CourseWriteDto): AppResult<CourseDto>
    suspend fun update(id: String, body: CourseWriteDto): AppResult<CourseDto>
    suspend fun delete(id: String): AppResult<Unit>
}

interface CompanyRepository {
    suspend fun list(): AppResult<List<CompanyDto>>
    suspend fun get(id: String): AppResult<CompanyDto>
    suspend fun create(body: CompanyWriteDto): AppResult<CompanyDto>
    suspend fun update(id: String, body: CompanyWriteDto): AppResult<CompanyDto>
    suspend fun delete(id: String): AppResult<Unit>
}

interface HiringRepository {
    suspend fun roles(): AppResult<List<HiringRoleDto>>
    suspend fun createRole(body: HiringRoleWriteDto): AppResult<HiringRoleDto>
    suspend fun deleteRole(id: String): AppResult<Unit>
    suspend fun dashboard(roleId: String?): AppResult<HiringDashboardDto>
    suspend fun candidates(
        search: String?, roleId: String?, status: String?, page: Int, pageSize: Int,
    ): AppResult<PaginatedCandidatesDto>
    suspend fun getCandidate(id: String): AppResult<CandidateDto>
    suspend fun createCandidate(body: CandidateWriteDto): AppResult<CandidateDto>
    suspend fun patchCandidate(id: String, body: CandidatePatchDto): AppResult<CandidateDto>
    suspend fun deleteCandidate(id: String): AppResult<Unit>
    suspend fun bulkStatus(ids: List<String>, status: String): AppResult<Int>
    suspend fun bulkDelete(ids: List<String>): AppResult<Int>
}

interface DashboardRepository {
    suspend fun stats(): AppResult<AdminStatsDto>
}

// CallRepository is defined in CallRepository.kt
