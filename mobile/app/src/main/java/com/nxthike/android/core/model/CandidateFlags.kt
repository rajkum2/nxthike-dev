package com.nxthike.android.core.model

import com.nxthike.android.data.remote.dto.CandidateDto

/**
 * Compliance flags on a candidate, read the one correct way.
 *
 * Each of these is a real column — `consent_at`, `dnc`, `source` — and the
 * column is what the web desk writes, what the server's filters query and what
 * `/api/workspace/compliance` counts.
 *
 * The tag fallback exists only for records an older build of this app wrote,
 * when it tagged `consent` / `dnc` / a source name instead. Nothing writes tags
 * for these any more, so the fallback drains as records are touched. Keeping the
 * rule in one place means a screen cannot accidentally check only half of it and
 * show a do-not-call record as dialable.
 */
val CandidateDto.hasConsent: Boolean
    get() = consentAt != null || CandidateTags.hasConsent(tags)

val CandidateDto.isDnc: Boolean
    get() = dnc == true || CandidateTags.hasDnc(tags)

/** Where the candidate came from — the column, else the legacy source tag. */
val CandidateDto.sourceLabel: String?
    get() = source?.takeIf { it.isNotBlank() } ?: CandidateTags.sourceOf(tags)
