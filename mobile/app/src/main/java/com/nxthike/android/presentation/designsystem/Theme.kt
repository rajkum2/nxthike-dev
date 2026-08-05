package com.nxthike.android.presentation.designsystem

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * The spec sets its UI in Plus Jakarta Sans and its numerics in Roboto Mono.
 * Neither ships with Android, so we stand on the platform faces and carry the
 * spec's weight/size/tracking scale across. To get the exact faces, drop the
 * OFL `.ttf` files into `res/font/` and swap these two declarations —
 * nothing else in the app references a family directly.
 */
val Jakarta = FontFamily.Default

/** Every number, duration, ID and timestamp in the spec is set in mono. */
val Mono = FontFamily.Monospace

/**
 * Named text styles matching the spec's px sizes. The design is authored at
 * 393dp width, so px map 1:1 onto sp.
 */
object Type {
    val screenTitle = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 20.sp, letterSpacing = (-0.4).sp)
    val displayTitle = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 23.sp, letterSpacing = (-0.46).sp)
    val heroTitle = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 28.sp, letterSpacing = (-0.56).sp, lineHeight = 32.sp)
    val sheetTitle = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 17.sp)
    val barTitle = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 18.sp)
    val section = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 14.5f.sp)
    val cardTitle = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 13.5f.sp)
    val cardTitleSm = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 12.5f.sp)
    val body = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Normal, fontSize = 12.5f.sp, lineHeight = 19.sp)
    val bodySm = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Normal, fontSize = 11.5f.sp, lineHeight = 16.sp)
    val label = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.SemiBold, fontSize = 11.5f.sp)
    val labelSm = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.SemiBold, fontSize = 10.5f.sp)
    val badge = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 10.5f.sp)
    val button = TextStyle(fontFamily = Jakarta, fontWeight = FontWeight.Bold, fontSize = 14.5f.sp)

    /** `Roboto Mono` runs: counters, durations, IDs, timestamps. */
    val mono = TextStyle(fontFamily = Mono, fontWeight = FontWeight.Medium, fontSize = 12.sp)
    val monoSm = TextStyle(fontFamily = Mono, fontWeight = FontWeight.Normal, fontSize = 10.sp)
    val monoXs = TextStyle(fontFamily = Mono, fontWeight = FontWeight.Normal, fontSize = 9.sp, letterSpacing = 1.0.sp)
    val monoStat = TextStyle(fontFamily = Mono, fontWeight = FontWeight.Medium, fontSize = 24.sp)
    val monoHero = TextStyle(fontFamily = Mono, fontWeight = FontWeight.Medium, fontSize = 30.sp)
}

private val Scheme = lightColorScheme(
    primary = T.Indigo,
    onPrimary = Color.White,
    primaryContainer = T.IndigoTint,
    onPrimaryContainer = T.IndigoInk,
    secondary = T.Teal,
    onSecondary = Color.White,
    secondaryContainer = T.TealTint,
    onSecondaryContainer = T.TealInk,
    background = T.Bg,
    onBackground = T.Ink,
    surface = T.Surface,
    onSurface = T.Ink,
    surfaceVariant = T.Fill,
    onSurfaceVariant = T.InkMuted,
    outline = T.BorderStrong,
    outlineVariant = T.Border,
    error = T.Red,
    onError = Color.White,
    errorContainer = T.RedTint,
    onErrorContainer = T.Maroon,
)

/**
 * The spec ships a single light theme — a recruiter reads this in daylight with
 * one hand, so there is no dark variant to drift out of sync.
 */
@Composable
fun TalentTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = Scheme,
        typography = Typography(
            bodyLarge = Type.body,
            bodyMedium = Type.body,
            bodySmall = Type.bodySm,
            titleLarge = Type.barTitle,
            titleMedium = Type.section,
            titleSmall = Type.cardTitle,
            labelLarge = Type.button,
            labelMedium = Type.label,
            labelSmall = Type.labelSm,
        ),
        content = content,
    )
}
