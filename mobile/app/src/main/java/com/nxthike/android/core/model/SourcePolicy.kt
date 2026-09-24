package com.nxthike.android.core.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

/**
 * Where a candidate came from (Naukri, Apna, an Excel import…) is admin-only. Recruiters and every
 * other persona see the candidate, never the channel.
 *
 * The data itself is left untouched — the edit form and the composer write whole fields back, so
 * stripping on read would erase the source on the server. Everything here is display-only:
 * screens pass role names, notes, links and descriptions through it before showing them.
 *
 * [visible] follows the session's capabilities (see SessionViewModel) and is Compose state, so
 * screens update when the session lands.
 */
object SourcePolicy {
    var visible by mutableStateOf(false)

    /** Job boards and import channels whose names must not reach a recruiter. */
    private val BOARDS = listOf(
        "naukri", "apna", "internshala", "linkedin", "indeed", "monster", "shine", "foundit",
        "workindia", "hirect", "timesjobs", "glassdoor", "cutshort", "instahyre", "wellfound", "angellist",
    )
    private val BOARD_ALT = BOARDS.joinToString("|")

    /** "(Naukri Import)", "(Apna)", "(imported 2021)" */
    private val PAREN = Regex("""\s*\((?:[^)]*\b(?:$BOARD_ALT|import(?:ed)?)\b[^)]*)\)""", RegexOption.IGNORE_CASE)
    /** "Naukri Import", "Apna Import", "Imported from Naukri" */
    private val PHRASE = Regex(
        """\s*(?:\b(?:imported\s+(?:from|via)\s+)?(?:$BOARD_ALT)(?:\s+(?:import(?:ed)?|excel|export(?:s)?|job\s*id|status))?\b|\bexcel\s+import\b)""",
        RegexOption.IGNORE_CASE,
    )
    private val SEPARATORS = Regex("""^[\s\-–—·:|,/()]+|[\s\-–—·:|,/(]+$""")

    /** Note keys the importers write ("Source: file.xlsx", "Origin: Apna", "Apna job id: …"). */
    private val NOTE_KEY = Regex("""^\s*(?:source|origin|imported(?:\s+from)?|$BOARD_ALT)\b[^:]*:""", RegexOption.IGNORE_CASE)
    private val MENTIONS_BOARD = Regex("""\b(?:$BOARD_ALT)\b""", RegexOption.IGNORE_CASE)

    /**
     * Role / requisition name without the channel: "Digital Marketing (Naukri Import)" →
     * "Digital Marketing". A name that is nothing but the channel ("Apna Import (2021)") becomes
     * [fallback].
     */
    fun role(raw: String?, fallback: String = "Open role"): String {
        val text = raw?.trim().orEmpty()
        if (text.isEmpty() || visible) return text
        return stripChannel(text, fallback)
    }

    /** Channel-free label regardless of who is viewing — for anything sent to a candidate. */
    fun stripChannel(raw: String?, fallback: String = ""): String {
        val text = raw?.trim().orEmpty()
        if (text.isEmpty()) return text
        val cleaned = PHRASE.replace(PAREN.replace(text, ""), " ")
            .replace(Regex("""\(\s*\)"""), "")
            .replace(Regex("""\s{2,}"""), " ")
            .replace(SEPARATORS, "")
            .trim()
        return if (cleaned.none { it.isLetter() }) fallback else cleaned
    }

    /** Free text (descriptions, subtitles): drops any sentence or line that names a channel. */
    fun text(raw: String?): String {
        val t = raw?.trim().orEmpty()
        if (t.isEmpty() || visible) return t
        return t.split(Regex("""(?<=[.!?])\s+|\n"""))
            .filterNot { MENTIONS_BOARD.containsMatchIn(it) || Regex("""\bimport(?:ed)?\b""", RegexOption.IGNORE_CASE).containsMatchIn(it) }
            .joinToString(" ")
            .trim()
    }

    /** True for an importer note line a recruiter must not see. */
    fun hidesNoteLine(line: String): Boolean =
        !visible && (NOTE_KEY.containsMatchIn(line) || MENTIONS_BOARD.containsMatchIn(line))

    /** A resume/application link hosted on a job board ("employer.apna.co/…") names the source. */
    fun hidesLink(url: String?): Boolean {
        if (visible || url.isNullOrBlank()) return false
        val host = runCatching { java.net.URI(url.trim()).host }.getOrNull()?.lowercase() ?: return false
        return BOARDS.any { host == "$it.com" || host == "$it.co" || host == "$it.in" || host.contains(".$it.") || host.startsWith("$it.") || host.endsWith(".$it.com") || host.endsWith(".$it.co") || host.endsWith(".$it.in") }
    }
}
