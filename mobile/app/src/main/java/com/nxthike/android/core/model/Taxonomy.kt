package com.nxthike.android.core.model

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.PhoneDisabled
import androidx.compose.material.icons.filled.PhoneMissed
import androidx.compose.material.icons.filled.PhonePaused
import androidx.compose.material.icons.filled.SignalCellularOff
import androidx.compose.material.icons.filled.ThumbDown
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.filled.Voicemail
import androidx.compose.material.icons.filled.WrongLocation
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.nxthike.android.presentation.designsystem.T

/**
 * Call outcome taxonomy.
 *
 * The `id`s are the backend's `CALL_DISPOSITIONS` verbatim — the design's
 * eleven codes and the API's eleven codes are the same set, so no translation
 * table is needed, only presentation metadata.
 */
enum class DispositionCategory(val label: String) {
    Reached("Reached"),
    NotReached("Not reached"),
    DataIssue("Data issue"),
    Compliance("Compliance"),
}

data class Disposition(
    val id: String,
    val label: String,
    val category: DispositionCategory,
    val color: Color,
    val tint: Color,
    val icon: ImageVector,
    /** The follow-up the spec prescribes for this outcome. */
    val nextAction: String,
)

object Dispositions {

    val ALL = listOf(
        Disposition(
            "connected_interested", "Interested", DispositionCategory.Reached,
            T.Green, T.GreenTint, Icons.Default.ThumbUp,
            "Move stage to Screening, schedule a follow-up",
        ),
        Disposition(
            "connected_callback", "Callback", DispositionCategory.Reached,
            T.Teal, T.TealTint, Icons.Default.History,
            "Schedule a callback inside the 9:00–21:00 window",
        ),
        Disposition(
            "connected_not_interested", "Not interested", DispositionCategory.Reached,
            T.Orange, T.OrangeTint, Icons.Default.ThumbDown,
            "Remove from queue, record the reason",
        ),
        Disposition(
            "screening_passed", "Screening passed", DispositionCategory.Reached,
            T.Mint, T.MintTint, Icons.Default.CheckCircle,
            "Move to Submitted, prepare the client submission",
        ),
        Disposition(
            "screening_failed", "Screening failed", DispositionCategory.Reached,
            T.Red, T.RedTint, Icons.Default.Cancel,
            "Reject with a structured reason",
        ),
        Disposition(
            "no_answer", "No answer", DispositionCategory.NotReached,
            T.Neutral, T.NeutralTint, Icons.Default.PhoneMissed,
            "Retry per cadence — next attempt tomorrow morning",
        ),
        Disposition(
            "busy", "Busy", DispositionCategory.NotReached,
            T.Amber, T.AmberTint, Icons.Default.PhonePaused,
            "Retry in 1–2 hours",
        ),
        Disposition(
            "voicemail", "Voicemail", DispositionCategory.NotReached,
            T.Blue, T.BlueTint, Icons.Default.Voicemail,
            "Send a WhatsApp follow-up, then retry",
        ),
        Disposition(
            "wrong_number", "Wrong number", DispositionCategory.DataIssue,
            T.Rust, T.RustTint, Icons.Default.WrongLocation,
            "Flag the record for data cleanup",
        ),
        Disposition(
            "not_reachable", "Not reachable", DispositionCategory.DataIssue,
            T.Clay, T.ClayTint, Icons.Default.SignalCellularOff,
            "Verify the number or archive the record",
        ),
        Disposition(
            "do_not_call", "Do not call", DispositionCategory.Compliance,
            T.Maroon, T.MaroonTint, Icons.Default.Block,
            "Lock the number, remove from every queue",
        ),
    )

    private val byId = ALL.associateBy { it.id }

    fun find(id: String?): Disposition? = id?.let { byId[it] }

    /** Placeholder shown for a candidate with no logged call yet. */
    val never = Disposition(
        "", "Never called", DispositionCategory.NotReached,
        T.Neutral, T.NeutralTint, Icons.Default.PhoneDisabled, "",
    )

    fun display(id: String?): Disposition = find(id) ?: never

    /**
     * The next-action the disposition sheet pre-selects. Mirrors the spec:
     * a callback outcome pre-arms the scheduler, a positive screen pre-arms the
     * stage move, and a DNC pre-arms the block.
     */
    fun defaultNextAction(id: String): String = when (id) {
        "connected_callback" -> "callback"
        "do_not_call" -> "dnc"
        "connected_interested", "screening_passed" -> "stage"
        else -> "none"
    }
}

/**
 * Pipeline stages.
 *
 * `id` is the backend `Candidate.status`; `label` is the design's recruiting
 * vocabulary. The two lists differ in wording only — "Sourced" is the API's
 * `new`, "Submitted" is `shortlisted`, and so on.
 */
data class Stage(
    val id: String,
    val label: String,
    val color: Color,
    val tint: Color,
)

object Stages {
    val Sourced = Stage("new", "Sourced", T.Slate, T.SlateTint)
    val Screening = Stage("reviewing", "Screening", T.Amber, T.AmberTint)
    val Submitted = Stage("shortlisted", "Submitted", T.Blue, T.BlueTint)
    val Interview = Stage("interview", "Interview", T.Purple, T.PurpleTint)
    val Offer = Stage("offer", "Offer", T.Teal, T.TealTint)
    val Hired = Stage("hired", "Hired", T.Green, T.GreenTint)
    val Dropped = Stage("rejected", "Dropped", T.Red, T.RedTint)
    val OnHold = Stage("on_hold", "On hold", T.Neutral, T.NeutralTint)

    /** Board column order, left to right. */
    val BOARD = listOf(Sourced, Screening, Submitted, Interview, Offer, Hired, Dropped)

    /** Every stage the API can return, including the off-board `on_hold`. */
    val ALL = BOARD + OnHold

    private val byId = ALL.associateBy { it.id }

    fun find(id: String?): Stage = id?.let { byId[it] } ?: Sourced

    /** Reasons required when a card is dropped, per the spec's drop sheet. */
    val DROP_REASONS = listOf(
        "Offer dropped", "Ghosted", "Counter-offer accepted", "Comp mismatch",
        "Notice too long", "Failed screening", "Position closed",
    )
}

/** Tags the app writes onto a candidate to carry compliance state. */
object CandidateTags {
    const val DNC = "dnc"
    const val CONSENT = "consent"
    const val ERASURE = "erasure_requested"

    fun hasDnc(tags: List<String>?) = tags?.any { it.equals(DNC, true) } == true
    fun hasConsent(tags: List<String>?) = tags?.any { it.equals(CONSENT, true) } == true
    fun erasureRaised(tags: List<String>?) = tags?.any { it.equals(ERASURE, true) } == true

    /** Sources the add-candidate form offers; stored as a tag. */
    val SOURCES = listOf("Naukri", "LinkedIn", "Referral", "Walk-in")

    fun sourceOf(tags: List<String>?): String? =
        tags?.firstOrNull { t -> SOURCES.any { it.equals(t, true) } }
}
