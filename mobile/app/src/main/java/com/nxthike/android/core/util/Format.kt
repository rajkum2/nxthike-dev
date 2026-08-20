package com.nxthike.android.core.util

import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * Formatting helpers shared by every screen. The spec is specific about how
 * time reads — mono digits, "Today 10:42" for recent calls, uppercase short
 * dates for anything older — so it lives in one place.
 */
object Fmt {

    private val isoCandidates = listOf(
        DateTimeFormatter.ISO_LOCAL_DATE_TIME,
        DateTimeFormatter.ISO_OFFSET_DATE_TIME,
        DateTimeFormatter.ISO_DATE_TIME,
    )

    /** Parses the backend's ISO timestamps, tolerating offset/no-offset forms. */
    fun parse(iso: String?): LocalDateTime? {
        if (iso.isNullOrBlank()) return null
        for (f in isoCandidates) {
            try {
                return LocalDateTime.parse(iso, f)
            } catch (_: Exception) {
                // try next shape
            }
        }
        return try {
            java.time.Instant.parse(iso).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
        } catch (_: Exception) {
            null
        }
    }

    fun toIso(at: LocalDateTime): String = at.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)

    private val timeF = DateTimeFormatter.ofPattern("HH:mm", Locale.UK)
    private val shortDateF = DateTimeFormatter.ofPattern("dd MMM", Locale.UK)
    private val stampF = DateTimeFormatter.ofPattern("dd MMM yyyy · HH:mm", Locale.UK)
    private val auditF = DateTimeFormatter.ofPattern("dd MMM HH:mm", Locale.UK)

    fun time(at: LocalDateTime?): String = at?.format(timeF).orEmpty()

    /** "Today 10:42" · "Yest 17:30" · "28 Jul 11:05". */
    fun whenLabel(at: LocalDateTime?, today: LocalDate = LocalDate.now()): String {
        if (at == null) return "—"
        val d = at.toLocalDate()
        return when (d) {
            today -> "Today ${at.format(timeF)}"
            today.minusDays(1) -> "Yest ${at.format(timeF)}"
            else -> "${at.format(shortDateF)} ${at.format(timeF)}"
        }
    }

    /** "28 JUL" — the uppercase eyebrow used on timeline entries. */
    fun shortDate(at: LocalDateTime?): String = at?.format(shortDateF)?.uppercase().orEmpty()

    fun stamp(at: LocalDateTime?): String = at?.format(stampF).orEmpty()

    fun audit(at: LocalDateTime?): String = at?.format(auditF)?.uppercase().orEmpty()

    /** "2h" · "4d" · "Just now" — relative age for feed rows. */
    fun ago(at: LocalDateTime?, now: LocalDateTime = LocalDateTime.now()): String {
        if (at == null) return ""
        val d = Duration.between(at, now)
        val mins = d.toMinutes()
        return when {
            mins < 1 -> "Now"
            mins < 60 -> "${mins}m"
            d.toHours() < 24 -> "${d.toHours()}h"
            d.toDays() == 1L -> "Yest"
            d.toDays() < 30 -> "${d.toDays()}d"
            else -> shortDate(at)
        }
    }

    /** Seconds → "0:42" / "12:07". Blank when the duration was never captured. */
    fun duration(seconds: Int?): String {
        if (seconds == null || seconds < 0) return "—"
        return "${seconds / 60}:${(seconds % 60).toString().padStart(2, '0')}"
    }

    /** Parses "0:42" or "42" back into seconds for the editable duration field. */
    fun parseDuration(text: String): Int? {
        val t = text.trim()
        if (t.isEmpty()) return null
        return try {
            if (t.contains(':')) {
                val (m, s) = t.split(':', limit = 2)
                m.trim().toInt() * 60 + s.trim().toInt()
            } else {
                t.toInt()
            }
        } catch (_: Exception) {
            null
        }
    }

    /** 23676 → "23,676". Large pipelines are unreadable without it. */
    fun count(n: Int): String = java.text.NumberFormat.getIntegerInstance(Locale.UK).format(n)

    /**
     * Money the way an Indian recruiting desk reads it.
     *
     * Comp is quoted in lakhs and crores in this market, so a CTC of 1_850_000
     * reads "₹18.5L", not "₹1,850,000". Whole values lose the decimal — ₹12L,
     * not ₹12.0L — and anything under a lakh falls back to grouped digits.
     */
    fun money(amount: Double?): String {
        val v = amount ?: return "—"
        val abs = kotlin.math.abs(v)
        fun trim(x: Double): String =
            if (x % 1.0 == 0.0) x.toLong().toString() else "%.2f".format(x).trimEnd('0').trimEnd('.')
        return when {
            abs >= 10_000_000 -> "₹${trim(v / 10_000_000)}Cr"
            abs >= 100_000 -> "₹${trim(v / 100_000)}L"
            else -> "₹${java.text.NumberFormat.getIntegerInstance(Locale.UK).format(v.toLong())}"
        }
    }

    /** A comp band, collapsing to one figure when both ends match. */
    fun moneyRange(min: Double?, max: Double?): String = when {
        min == null && max == null -> "—"
        min == null -> money(max)
        max == null -> "${money(min)}+"
        min == max -> money(min)
        else -> "${money(min)} – ${money(max)}"
    }

    fun percent(numerator: Int, denominator: Int): String =
        if (denominator <= 0) "0%" else "${Math.round(numerator * 100.0 / denominator)}%"

    /** Splits the API's free-text skill blobs into chips. */
    fun splitList(raw: String?): List<String> = raw
        ?.split(',', ';', '\n', '|')
        ?.map { it.trim() }
        ?.filter { it.isNotEmpty() }
        .orEmpty()
        .distinct()

    /**
     * First name for "Call Priyanka" style buttons. Skips leading initials —
     * plenty of imported records read "A Feroz Usman", and "Call A" is nonsense.
     */
    fun firstName(full: String?): String {
        val parts = full?.trim()?.split(Regex("\\s+")).orEmpty().filter { it.isNotBlank() }
        if (parts.isEmpty()) return "candidate"
        return parts.firstOrNull { it.trim('.').length > 1 } ?: parts.first()
    }

    /** Masks a phone for the PII-masked profile view: "+91 ••••• ••562". */
    fun maskPhone(phone: String?): String {
        val p = phone?.trim().orEmpty()
        if (p.length < 4) return "••••"
        return "••••• ••" + p.takeLast(3)
    }

    fun maskEmail(email: String?): String {
        val e = email?.trim().orEmpty()
        val at = e.indexOf('@')
        if (at <= 0) return "•••••"
        val domain = e.substring(at + 1)
        val dot = domain.lastIndexOf('.')
        val tld = if (dot >= 0) domain.substring(dot) else ""
        return "${e.first()}•••••••@•••••$tld"
    }
}
