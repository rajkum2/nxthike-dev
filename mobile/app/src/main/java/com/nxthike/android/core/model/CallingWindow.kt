package com.nxthike.android.core.model

import java.time.DayOfWeek
import java.time.Duration
import java.time.LocalDateTime
import java.time.LocalTime

/**
 * TRAI TCCCPR 2018 (amended 12 Feb 2025) permits commercial calls between
 * 09:00 and 21:00 local time only.
 *
 * The spec is emphatic that outside the window the dial action is *disabled*,
 * not merely warned about — so this is a domain rule, not a UI hint.
 */
data class CallingWindow(
    val openHour: Int = 9,
    val openMinute: Int = 0,
    val closeHour: Int = 21,
    val closeMinute: Int = 0,
    /** Days the team dials. Defaults to Mon–Sat, matching Indian recruiting practice. */
    val days: Set<DayOfWeek> = setOf(
        DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY,
    ),
    val zoneLabel: String = "Asia/Kolkata · IST (UTC+05:30)",
) {
    val opensAt: LocalTime get() = LocalTime.of(openHour, openMinute)
    val closesAt: LocalTime get() = LocalTime.of(closeHour, closeMinute)

    fun isOpenAt(now: LocalDateTime): Boolean {
        if (now.dayOfWeek !in days) return false
        val t = now.toLocalTime()
        return !t.isBefore(opensAt) && t.isBefore(closesAt)
    }

    /** Time until the window flips state, for the banner countdown. */
    fun timeUntilChange(now: LocalDateTime): Duration {
        val t = now.toLocalTime()
        return if (isOpenAt(now)) {
            Duration.between(t, closesAt)
        } else {
            // Next opening: later today if we're before 09:00, else the next dialling day.
            var day = now
            if (t.isBefore(opensAt) && now.dayOfWeek in days) {
                return Duration.between(t, opensAt)
            }
            var guard = 0
            do {
                day = day.plusDays(1)
                guard++
            } while (day.dayOfWeek !in days && guard < 8)
            Duration.between(now, day.toLocalDate().atTime(opensAt))
        }
    }

    /** "11h 19m left" / "opens in 8h 04m". */
    fun countdownLabel(now: LocalDateTime): String {
        val d = timeUntilChange(now)
        val h = d.toHours()
        val m = d.toMinutes() % 60
        val span = if (h > 0) "${h}h ${m.toString().padStart(2, '0')}m" else "${m}m"
        return if (isOpenAt(now)) "$span left" else "opens in $span"
    }

    fun rangeLabel(): String =
        "%02d:%02d–%02d:%02d".format(openHour, openMinute, closeHour, closeMinute)

    /** True when a proposed callback slot would land outside the window. */
    fun blocksSlot(at: LocalDateTime): Boolean = !isOpenAt(at)

    companion object {
        val Default = CallingWindow()
    }
}
