package com.nxthike.android.core.model

import com.nxthike.android.data.remote.dto.CandidateDto
import com.nxthike.android.data.remote.dto.CandidatePatchDto

/**
 * The one place a stage change is turned into a write.
 *
 * A candidate's stage can be moved from three places now — the pipeline board,
 * the candidate list row, and the profile — and every one of them has to leave
 * the same record behind. When the board wrote a `[stage]` trail line and a
 * quick change elsewhere wrote a bare status, the same move told two different
 * stories depending on which screen made it.
 *
 * The trail line is deliberately parseable: `CandidateProfileViewModel` splits
 * the notes blob on `[timestamp]` prefixes to build the activity timeline.
 */
object StageMove {

    /** `[2026-08-18T10:30] [stage] Sourced → Screening · reason — note` */
    fun trailLine(
        from: Stage,
        to: Stage,
        note: String = "",
        dropReason: String? = null,
    ): String = buildString {
        append("[stage] ${from.label} → ${to.label}")
        if (!dropReason.isNullOrBlank()) append(" · $dropReason")
        if (note.isNotBlank()) append(" — ${note.trim()}")
    }

    /**
     * The patch for a stage move: the new status, and the move appended to the
     * note trail so the timeline and the web desk both show why it happened.
     */
    fun patch(
        candidate: CandidateDto,
        to: Stage,
        note: String = "",
        dropReason: String? = null,
    ): CandidatePatchDto {
        val from = Stages.find(candidate.status)
        val stamped = "[${com.nxthike.android.core.util.Fmt.toIso(java.time.LocalDateTime.now()).take(16)}] " +
            trailLine(from, to, note, dropReason)
        return CandidatePatchDto(
            status = to.id,
            notes = (candidate.notes.trimEnd() + "\n" + stamped).trim(),
        )
    }

    /** Dropping someone needs a reason on the record; nothing else does. */
    fun requiresReason(to: Stage): Boolean = to.id == Stages.Dropped.id
}
