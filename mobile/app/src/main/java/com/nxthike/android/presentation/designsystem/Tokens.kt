package com.nxthike.android.presentation.designsystem

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/**
 * TalentDialer design tokens — lifted verbatim from the Claude Design spec
 * (`TalentDialer.dc.html`). Every literal here appears in that file; keep them
 * in sync rather than inventing new values.
 */
object T {

    // ---- Surfaces -------------------------------------------------------
    /** App canvas behind every screen. */
    val Bg = Color(0xFFFBFAFD)
    /** Raised cards, sheets, sticky footers. */
    val Surface = Color(0xFFFFFFFF)
    /** Recessed blocks: "last contact", quiet rows, gesture bar. */
    val SurfaceMuted = Color(0xFFF5F4FA)
    /** Icon buttons, inert chips, note bodies. */
    val Fill = Color(0xFFF1F0F7)
    /** Skeleton shimmer + progress track. */
    val Track = Color(0xFFF0EFF6)
    /** Kanban board backdrop. */
    val Board = Color(0xFFF3F2F8)

    // ---- Lines ----------------------------------------------------------
    val Border = Color(0xFFE9E7F2)
    val BorderStrong = Color(0xFFC7C5D0)
    val Divider = Color(0xFFEDEBF3)
    val DividerFaint = Color(0xFFF3F2F8)
    val TrackBorder = Color(0xFFE6E4F0)

    // ---- Text -----------------------------------------------------------
    val Ink = Color(0xFF1A1A22)
    val InkBody = Color(0xFF3A3846)
    val InkMuted = Color(0xFF5A5866)
    val InkFaint = Color(0xFF8B8996)
    val InkGhost = Color(0xFFB7B5C2)

    // ---- Brand (indigo) -------------------------------------------------
    val Indigo = Color(0xFF4B45C9)
    val IndigoPressed = Color(0xFF3A34AD)
    val IndigoInk = Color(0xFF2A2585)
    val IndigoTint = Color(0xFFEDEBFA)
    val IndigoTintSoft = Color(0xFFF4F3FE)
    val IndigoPill = Color(0xFFDFDCFB)
    /** Disabled primary button. */
    val Disabled = Color(0xFFE6E4F0)
    val DisabledInk = Color(0xFF8B8996)

    // ---- Semantic accents (bg / fg pairs) -------------------------------
    val GreenTint = Color(0xFFE4F4E9); val Green = Color(0xFF1F7A3D)
    val TealTint = Color(0xFFE3F4F1); val Teal = Color(0xFF0F7A72); val TealInk = Color(0xFF0B4F49)
    val TealBorder = Color(0xFFBFE4DD); val TealSurface = Color(0xFFE9F6F3)
    val BlueTint = Color(0xFFE5EDFA); val Blue = Color(0xFF1D5FBF)
    val PurpleTint = Color(0xFFEEE4FA); val Purple = Color(0xFF6E3AAF)
    val AmberTint = Color(0xFFFBF0DC); val Amber = Color(0xFFA66A00); val AmberInk = Color(0xFF8A5A00)
    val AmberSurface = Color(0xFFFFF6E5); val AmberBorder = Color(0xFFF2DCB0); val AmberDeep = Color(0xFF6B5220)
    val RedTint = Color(0xFFFCE8E6); val Red = Color(0xFFB3261E)
    val MaroonTint = Color(0xFFFBE3E1); val Maroon = Color(0xFF8C1D18)
    val MaroonBorder = Color(0xFFF3C6C1); val MaroonInk = Color(0xFF7A1F19)
    val OrangeTint = Color(0xFFFCEEDD); val Orange = Color(0xFFB85C00)
    val RustTint = Color(0xFFFBEBE0); val Rust = Color(0xFFB34A00)
    val ClayTint = Color(0xFFF5EBEA); val Clay = Color(0xFF8A5A57)
    val SlateTint = Color(0xFFE7ECF1); val Slate = Color(0xFF4A5A6B)
    val NeutralTint = Color(0xFFF1F0F4); val Neutral = Color(0xFF6B6975)
    val MintTint = Color(0xFFE6F4EB); val Mint = Color(0xFF2B7A4B)

    // ---- Dark surfaces (handoff / return / resume) ----------------------
    val Night = Color(0xFF211F35)
    val NightAlt = Color(0xFF2C2A3E)
    val NightDeep = Color(0xFF0C0B12)
    val NightInk = Color(0xFFB9B5D6)
    val NightInkSoft = Color(0xFFCFCCE6)
    val NightAccent = Color(0xFF8B85FF)

    /** Deterministic avatar palette (design `AV`). */
    val Avatars = listOf(
        Color(0xFF4B45C9), Color(0xFF0F7A72), Color(0xFF6E3AAF), Color(0xFFB85C00),
        Color(0xFF1D5FBF), Color(0xFF1F7A3D), Color(0xFF8C1D18), Color(0xFF4A5A6B),
    )

    // ---- Shape ----------------------------------------------------------
    val RSheet = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
    val RDialog = RoundedCornerShape(26.dp)
    val RFab = RoundedCornerShape(18.dp)
    val RCardLg = RoundedCornerShape(16.dp)
    val RCard = RoundedCornerShape(14.dp)
    val RField = RoundedCornerShape(12.dp)
    val RChip = RoundedCornerShape(11.dp)
    val RBadge = RoundedCornerShape(7.dp)
    val RIcon = RoundedCornerShape(10.dp)
    val RPill = RoundedCornerShape(99.dp)

    // ---- Spacing --------------------------------------------------------
    /** Horizontal screen gutter used by every scroll body in the spec. */
    val Gutter = 18.dp
    /** Vertical rhythm between stacked cards. */
    val Gap = 8.dp
    /** Space reserved under a list so the FAB never covers the last row. */
    val FabInset = 96.dp
}

/** Deterministic avatar colour — mirrors the spec's `avOf()` character-sum hash. */
fun avatarColor(key: String): Color {
    if (key.isEmpty()) return T.Avatars[0]
    var sum = 0
    for (ch in key) sum += ch.code
    return T.Avatars[Math.floorMod(sum, T.Avatars.size)]
}

/** Two-letter initials — mirrors the spec's `ini()`. */
fun initialsOf(name: String?): String {
    val parts = name?.trim()?.split(Regex("\\s+"))?.filter { it.isNotEmpty() }.orEmpty()
    if (parts.isEmpty()) return "?"
    val first = parts[0].first()
    val second = parts.getOrNull(1)?.first()
    return (if (second != null) "$first$second" else "$first").uppercase()
}
