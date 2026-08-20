package com.nxthike.android.data.remote.dto

import com.squareup.moshi.JsonClass

/**
 * DTOs for the recruiting half of `/api/workspace/…` — requisitions, clients
 * and the pipeline artefacts (submissions, interviews, scorecards, offers,
 * approvals) plus notes, tags, saved searches and templates.
 *
 * Generated against the live production OpenAPI schema. Money fields are
 * `Double?` because the server types them as JSON numbers, not integers.
 */

/* ------------------------------------------------------------------ *
 *  Requisitions                                                      *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class RequisitionDto(
    val id: String,
    val title: String = "",
    val description: String? = null,
    val clientId: String? = null,
    val clientName: String? = null,
    val department: String? = null,
    val priority: String = "P2",
    val openings: Int = 1,
    val filled: Int = 0,
    val slaDue: String? = null,
    val slaLabel: String? = null,
    val slaBreached: Boolean = false,
    val compMin: Double? = null,
    val compMax: Double? = null,
    val compLabel: String? = null,
    /** Commercials are role-gated server-side — null means "not entitled". */
    val billRate: String? = null,
    val payRate: String? = null,
    val ownerId: String? = null,
    val location: String? = null,
    val skills: List<String> = emptyList(),
    val status: String = "open",
    val isActive: Boolean = true,
    val pipelineTotal: Int = 0,
    /** Keyed by `Candidate.status`, the same ids `Stages` uses. */
    val byStage: Map<String, Int> = emptyMap(),
)

@JsonClass(generateAdapter = true)
data class RequisitionWriteDto(
    val id: String? = null,
    val title: String,
    val description: String? = null,
    val clientId: String? = null,
    val department: String? = null,
    val priority: String = "P2",
    val openings: Int = 1,
    val slaDue: String? = null,
    val compMin: Double? = null,
    val compMax: Double? = null,
    val billRate: String? = null,
    val payRate: String? = null,
    val location: String? = null,
    val skills: List<String> = emptyList(),
    val status: String = "open",
)

/* ------------------------------------------------------------------ *
 *  Clients                                                           *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class ClientContactDto(
    val name: String? = null,
    val role: String? = null,
    val phone: String? = null,
    val email: String? = null,
)

@JsonClass(generateAdapter = true)
data class ClientDto(
    val id: String,
    val name: String = "",
    val industry: String? = null,
    val location: String? = null,
    val health: String = "good",
    val marginPct: Double? = null,
    val terms: String? = null,
    val contacts: List<ClientContactDto> = emptyList(),
    val openRequisitions: Int = 0,
    val submissions: Int = 0,
    val placements: Int = 0,
    val website: String? = null,
    val logo: String? = null,
)

@JsonClass(generateAdapter = true)
data class ClientPatchDto(
    val health: String? = null,
    val marginPct: Double? = null,
    val terms: String? = null,
    val contacts: List<ClientContactDto>? = null,
    val isClient: Boolean? = null,
    val ownerId: String? = null,
)

/* ------------------------------------------------------------------ *
 *  Submissions                                                       *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class SubmissionDto(
    val id: String,
    val candidateId: String,
    val candidateName: String? = null,
    val requisitionId: String? = null,
    val requisitionName: String? = null,
    val clientId: String? = null,
    val clientName: String? = null,
    val status: String = "submitted",
    val submittedCtc: Double? = null,
    val note: String = "",
    val submittedByName: String? = null,
    val submittedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class SubmissionCreateDto(
    val candidateId: String,
    val requisitionId: String? = null,
    val clientId: String? = null,
    val submittedCtc: Double? = null,
    val note: String = "",
)

@JsonClass(generateAdapter = true)
data class SubmissionPatchDto(
    val status: String? = null,
    val note: String? = null,
)

/* ------------------------------------------------------------------ *
 *  Interviews & scorecards                                           *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class PanellistDto(
    val id: String? = null,
    val name: String? = null,
    val email: String? = null,
)

@JsonClass(generateAdapter = true)
data class InterviewDto(
    val id: String,
    val candidateId: String,
    val candidateName: String? = null,
    val requisitionId: String? = null,
    val requisitionName: String? = null,
    val kind: String = "technical",
    val roundLabel: String? = null,
    val scheduledAt: String? = null,
    val durationMinutes: Int = 45,
    val mode: String? = null,
    val location: String? = null,
    val panel: List<PanellistDto> = emptyList(),
    val status: String = "scheduled",
    val hasScorecard: Boolean = false,
)

@JsonClass(generateAdapter = true)
data class InterviewCreateDto(
    val candidateId: String,
    val requisitionId: String? = null,
    val kind: String = "technical",
    val roundLabel: String? = null,
    val scheduledAt: String? = null,
    val durationMinutes: Int = 45,
    val mode: String? = null,
    val location: String? = null,
    val panel: List<PanellistDto> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class InterviewPatchDto(
    val status: String? = null,
    val scheduledAt: String? = null,
    val mode: String? = null,
    val location: String? = null,
    val panel: List<PanellistDto>? = null,
)

/**
 * `scores` is read as `Double` and written as `Int`: the server stores whatever
 * JSON numbers it was given, and a scorecard saved by another client may carry
 * `4.0` where this app would have sent `4`.
 */
@JsonClass(generateAdapter = true)
data class ScorecardDto(
    val id: String,
    val interviewId: String? = null,
    val candidateId: String,
    val panellistId: String? = null,
    val panellistName: String? = null,
    val scores: Map<String, Double> = emptyMap(),
    val recommendation: String? = null,
    val evidence: String = "",
    val isDraft: Boolean = false,
    val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class ScorecardWriteDto(
    val candidateId: String,
    val interviewId: String? = null,
    val scores: Map<String, Int> = emptyMap(),
    val recommendation: String? = null,
    val evidence: String = "",
    val isDraft: Boolean = false,
)

/* ------------------------------------------------------------------ *
 *  Offers & approvals                                                *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class OfferBreakupDto(
    val label: String = "",
    val amount: Double = 0.0,
)

@JsonClass(generateAdapter = true)
data class OfferApprovalDto(
    val id: String,
    val approverName: String? = null,
    val approverRole: String? = null,
    val status: String = "pending",
    val comment: String = "",
    val sequence: Int = 0,
    val decidedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class OfferDto(
    val id: String,
    val reference: String? = null,
    val candidateId: String,
    val candidateName: String? = null,
    val requisitionId: String? = null,
    val requisitionName: String? = null,
    val clientId: String? = null,
    val clientName: String? = null,
    val status: String = "draft",
    val ctcTotal: Double? = null,
    val breakup: List<OfferBreakupDto> = emptyList(),
    val bandNote: String? = null,
    val joiningDate: String? = null,
    val expiresAt: String? = null,
    val noticeDays: Int? = null,
    val buyoutCost: Double? = null,
    val letterBody: String? = null,
    val letterSentAt: String? = null,
    val signedAt: String? = null,
    val createdAt: String? = null,
    val approvals: List<OfferApprovalDto> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class OfferCreateDto(
    val candidateId: String,
    val requisitionId: String? = null,
    val ctcTotal: Double? = null,
    val breakup: List<OfferBreakupDto> = emptyList(),
    val bandNote: String? = null,
    val joiningDate: String? = null,
    val expiresAt: String? = null,
    val noticeDays: Int? = null,
    val buyoutCost: Double? = null,
    val approvers: List<PanellistDto> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class OfferPatchDto(
    val status: String? = null,
    val ctcTotal: Double? = null,
    val breakup: List<OfferBreakupDto>? = null,
    val joiningDate: String? = null,
    val expiresAt: String? = null,
    val letterBody: String? = null,
    val markLetterSent: Boolean? = null,
    val markSigned: Boolean? = null,
)

@JsonClass(generateAdapter = true)
data class ApprovalDto(
    val id: String,
    val kind: String = "",
    val refId: String = "",
    val refLabel: String? = null,
    val detail: String? = null,
    val requestedByName: String? = null,
    val approverName: String? = null,
    val approverRole: String? = null,
    val status: String = "pending",
    val comment: String = "",
    val createdAt: String? = null,
    val decidedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class ApprovalDecisionDto(
    val approve: Boolean,
    val comment: String = "",
)

/* ------------------------------------------------------------------ *
 *  Notes, tags, saved searches, templates                            *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class NoteDto(
    val id: String,
    val candidateId: String,
    val authorName: String? = null,
    val body: String = "",
    val visibility: String = "shared",
    val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class NoteCreateDto(
    val candidateId: String,
    val body: String,
    val visibility: String = "shared",
)

@JsonClass(generateAdapter = true)
data class TagDto(
    val id: String,
    val name: String = "",
    val kind: String = "list",
    val color: String? = null,
    val description: String? = null,
    val count: Int = 0,
)

@JsonClass(generateAdapter = true)
data class TagCreateDto(
    val name: String,
    val kind: String = "list",
    val color: String? = null,
    val description: String? = null,
)

@JsonClass(generateAdapter = true)
data class BulkTagRequestDto(
    val candidateIds: List<String>,
    val add: List<String> = emptyList(),
    val remove: List<String> = emptyList(),
    val ownerId: String? = null,
)

@JsonClass(generateAdapter = true)
data class SavedSearchDto(
    val id: String,
    val name: String = "",
    val filters: Map<String, Any?> = emptyMap(),
    val shared: Boolean = false,
    val ownerName: String? = null,
)

@JsonClass(generateAdapter = true)
data class SavedSearchCreateDto(
    val name: String,
    val filters: Map<String, Any?> = emptyMap(),
    val shared: Boolean = false,
)

@JsonClass(generateAdapter = true)
data class TemplateDto(
    val id: String,
    val name: String = "",
    val channel: String = "whatsapp",
    val stage: String? = null,
    val subject: String? = null,
    val body: String = "",
    val isActive: Boolean = true,
)

@JsonClass(generateAdapter = true)
data class TemplateWriteDto(
    val name: String,
    val channel: String = "whatsapp",
    val stage: String? = null,
    val subject: String? = null,
    val body: String,
)

/* ------------------------------------------------------------------ *
 *  Candidate facets                                                  *
 * ------------------------------------------------------------------ */

@JsonClass(generateAdapter = true)
data class FacetValueDto(
    val value: String = "",
    val count: Int = 0,
)

@JsonClass(generateAdapter = true)
data class CandidateFacetsDto(
    val cities: List<FacetValueDto> = emptyList(),
    val graduationYears: List<FacetValueDto> = emptyList(),
)
