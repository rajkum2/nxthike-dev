package com.nxthike.android.presentation.designsystem

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/* ------------------------------------------------------------------ *
 *  Text                                                              *
 * ------------------------------------------------------------------ */

@Composable
fun TText(
    text: String,
    style: TextStyle,
    color: Color = T.Ink,
    modifier: Modifier = Modifier,
    maxLines: Int = Int.MAX_VALUE,
    weight: FontWeight? = null,
) = Text(
    text = text,
    style = if (weight != null) style.copy(fontWeight = weight) else style,
    color = color,
    modifier = modifier,
    maxLines = maxLines,
    overflow = if (maxLines == Int.MAX_VALUE) TextOverflow.Clip else TextOverflow.Ellipsis,
)

/** Uppercase mono eyebrow used above every grouped list in the spec. */
@Composable
fun Eyebrow(text: String, modifier: Modifier = Modifier, color: Color = T.InkFaint) =
    TText(text.uppercase(), Type.monoXs, color, modifier)

/* ------------------------------------------------------------------ *
 *  Containers                                                        *
 * ------------------------------------------------------------------ */

/** The workhorse: white, hairline-bordered, 14dp radius. */
@Composable
fun TCard(
    modifier: Modifier = Modifier,
    shape: Shape = T.RCard,
    border: Color = T.Border,
    background: Color = T.Surface,
    padding: Dp = 12.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) = Column(
    modifier
        .fillMaxWidth()
        .clip(shape)
        .background(background)
        .border(1.dp, border, shape)
        .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
        .padding(padding),
    content = content,
)

/** Tinted info strip — the calling-window, offline and compliance banners. */
@Composable
fun Banner(
    icon: ImageVector,
    background: Color,
    border: Color,
    iconTint: Color,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) = Row(
    modifier
        .fillMaxWidth()
        .clip(T.RField)
        .background(background)
        .border(1.dp, border, T.RField)
        .padding(horizontal = 12.dp, vertical = 10.dp),
    horizontalArrangement = Arrangement.spacedBy(9.dp),
    verticalAlignment = Alignment.CenterVertically,
) {
    Icon(icon, null, tint = iconTint, modifier = Modifier.size(18.dp))
    Column(Modifier.weight(1f), content = content)
    trailing?.invoke()
}

/* ------------------------------------------------------------------ *
 *  Identity                                                          *
 * ------------------------------------------------------------------ */

/** Initials avatar; colour is derived from a stable key, never the index. */
@Composable
fun Avatar(name: String?, key: String, size: Dp = 40.dp, shape: Shape = T.RPill) = Box(
    Modifier
        .size(size)
        .clip(shape)
        .background(avatarColor(key)),
    contentAlignment = Alignment.Center,
) {
    TText(
        initialsOf(name),
        Type.cardTitle.copy(fontSize = (size.value * 0.34f).coerceAtLeast(8f).sp),
        Color.White,
    )
}

/* ------------------------------------------------------------------ *
 *  Chips & badges                                                    *
 * ------------------------------------------------------------------ */

/** Status badge: tinted rounded rect, optional leading glyph. Never colour-only. */
@Composable
fun Badge(
    label: String,
    background: Color,
    foreground: Color,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
) = Row(
    modifier
        .clip(T.RBadge)
        .background(background)
        .padding(horizontal = 8.dp, vertical = 3.dp),
    horizontalArrangement = Arrangement.spacedBy(4.dp),
    verticalAlignment = Alignment.CenterVertically,
) {
    if (icon != null) Icon(icon, null, tint = foreground, modifier = Modifier.size(13.dp))
    TText(label, Type.badge, foreground, maxLines = 1)
}

/** Selectable filter chip — the spec's `chip(on)` helper. */
@Composable
fun FilterChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    accent: Color = T.Indigo,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    height: Dp = 32.dp,
) {
    val border = if (selected) accent else T.BorderStrong.copy(alpha = 0.55f)
    val bg = if (selected) accent.copy(alpha = 0.08f) else T.Surface
    val fg = if (selected) T.IndigoInk.takeIf { accent == T.Indigo } ?: accent else T.InkBody
    Row(
        modifier
            .height(height)
            .clip(T.RChip)
            .background(bg)
            .border(1.dp, border, T.RChip)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 12.dp)
            .alpha(if (enabled) 1f else 0.45f),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icon != null) Icon(icon, null, tint = fg, modifier = Modifier.size(17.dp))
        TText(label, Type.label, fg, maxLines = 1)
    }
}

/** Horizontally scrolling chip rail (candidate filters, history outcomes). */
@Composable
fun ChipRail(modifier: Modifier = Modifier, content: @Composable RowScope.() -> Unit) = Row(
    modifier
        .fillMaxWidth()
        .horizontalScroll(rememberScrollState())
        .padding(bottom = 2.dp),
    horizontalArrangement = Arrangement.spacedBy(6.dp),
    content = content,
)

/* ------------------------------------------------------------------ *
 *  Buttons                                                           *
 * ------------------------------------------------------------------ */

/**
 * Primary action. Disabled state is a flat grey fill with grey ink — the spec
 * never dims the label alone, because that reads as "loading" on a phone.
 */
@Composable
fun PrimaryButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null,
    trailingIcon: ImageVector? = null,
    height: Dp = 54.dp,
    shape: Shape = T.RCardLg,
    container: Color = T.Indigo,
    contentColor: Color = Color.White,
) {
    val bg = if (enabled) container else T.Disabled
    val fg = if (enabled) contentColor else T.DisabledInk
    Row(
        modifier
            .fillMaxWidth()
            .height(height)
            .clip(shape)
            .background(bg)
            .clickable(enabled = enabled, onClick = onClick),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icon != null) {
            Icon(icon, null, tint = fg, modifier = Modifier.size(22.dp))
            Spacer(Modifier.width(9.dp))
        }
        TText(label, Type.button, fg, maxLines = 1)
        if (trailingIcon != null) {
            Spacer(Modifier.width(8.dp))
            Icon(trailingIcon, null, tint = fg, modifier = Modifier.size(20.dp))
        }
    }
}

/** Outlined secondary action used in pairs beside the primary. */
@Composable
fun GhostButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    iconTint: Color = T.InkBody,
    borderColor: Color = T.BorderStrong,
    contentColor: Color = T.Ink,
    height: Dp = 48.dp,
) = Row(
    modifier
        .height(height)
        .clip(T.RField)
        .background(T.Surface)
        .border(1.dp, borderColor, T.RField)
        .clickable(onClick = onClick)
        .padding(horizontal = 16.dp),
    horizontalArrangement = Arrangement.Center,
    verticalAlignment = Alignment.CenterVertically,
) {
    if (icon != null) {
        Icon(icon, null, tint = iconTint, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(7.dp))
    }
    TText(label, Type.cardTitleSm, contentColor, maxLines = 1)
}

/** Square tinted icon button (top-bar actions, row affordances). */
@Composable
fun IconTile(
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 38.dp,
    background: Color = T.Fill,
    tint: Color = T.InkBody,
    shape: Shape = T.RChip,
    iconSize: Dp = 20.dp,
) = Box(
    modifier
        .size(size)
        .clip(shape)
        .background(background)
        .clickable(onClick = onClick),
    contentAlignment = Alignment.Center,
) { Icon(icon, null, tint = tint, modifier = Modifier.size(iconSize)) }

/* ------------------------------------------------------------------ *
 *  Bars                                                              *
 * ------------------------------------------------------------------ */

/** Back-arrow + title bar. `onBack == null` renders a title-only header. */
@Composable
fun TopBar(
    title: String,
    onBack: (() -> Unit)? = null,
    subtitle: String? = null,
    closeIcon: Boolean = false,
    actions: @Composable RowScope.() -> Unit = {},
) = Row(
    Modifier
        .fillMaxWidth()
        .padding(start = T.Gutter, end = T.Gutter, top = 14.dp, bottom = 10.dp),
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    verticalAlignment = Alignment.CenterVertically,
) {
    if (onBack != null) {
        Icon(
            if (closeIcon) Icons.Default.Close else Icons.AutoMirrored.Filled.ArrowBack,
            "Back",
            tint = T.Ink,
            modifier = Modifier.size(23.dp).clickable(onClick = onBack),
        )
    }
    Column(Modifier.weight(1f)) {
        TText(title, Type.barTitle, T.Ink, maxLines = 1)
        if (subtitle != null) TText(subtitle, Type.bodySm, T.InkMuted, Modifier.padding(top = 1.dp), maxLines = 1)
    }
    actions()
}

/** Large screen heading used by the five root tabs. */
@Composable
fun ScreenHeader(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    actions: @Composable RowScope.() -> Unit = {},
) = Row(
    modifier
        .fillMaxWidth()
        .padding(start = T.Gutter, end = T.Gutter, top = 14.dp, bottom = 10.dp),
    verticalAlignment = Alignment.CenterVertically,
) {
    Column(Modifier.weight(1f)) {
        TText(title, Type.screenTitle, T.Ink, maxLines = 1)
        if (subtitle != null) TText(subtitle, Type.bodySm, T.InkMuted, Modifier.padding(top = 2.dp), maxLines = 1)
    }
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) { actions() }
}

/** Right-chevron row terminator. */
@Composable
fun Chevron(modifier: Modifier = Modifier) =
    Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = T.InkGhost, modifier = modifier.size(20.dp))

/* ------------------------------------------------------------------ *
 *  Inputs                                                            *
 * ------------------------------------------------------------------ */

/** Bordered text field matching the spec's 50dp form input. */
@Composable
fun TField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    label: String? = null,
    borderColor: Color = T.BorderStrong,
    mono: Boolean = false,
    minHeight: Dp = 50.dp,
    singleLine: Boolean = true,
    trailing: (@Composable () -> Unit)? = null,
) = Column(modifier.fillMaxWidth()) {
    if (label != null) {
        TText(label, Type.label, T.InkMuted, Modifier.padding(bottom = 6.dp))
    }
    Row(
        Modifier
            .fillMaxWidth()
            .heightIn(min = minHeight)
            .clip(T.RField)
            .background(T.Surface)
            .border(1.dp, borderColor, T.RField)
            .padding(horizontal = 13.dp, vertical = if (singleLine) 0.dp else 11.dp),
        verticalAlignment = if (singleLine) Alignment.CenterVertically else Alignment.Top,
    ) {
        Box(Modifier.weight(1f)) {
            if (value.isEmpty()) {
                TText(placeholder, if (mono) Type.mono else Type.body, T.InkFaint, maxLines = 1)
            }
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                singleLine = singleLine,
                textStyle = (if (mono) Type.mono else Type.body).copy(color = T.Ink),
                cursorBrush = SolidColor(T.Indigo),
                modifier = Modifier.fillMaxWidth(),
            )
        }
        trailing?.invoke()
    }
}

/** Multi-line note box (call notes, scorecard evidence, BD notes). */
@Composable
fun TTextArea(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    minHeight: Dp = 64.dp,
) = Box(
    modifier
        .fillMaxWidth()
        .heightIn(min = minHeight)
        .clip(T.RField)
        .background(T.Surface)
        .border(1.dp, T.BorderStrong, T.RField)
        .padding(horizontal = 12.dp, vertical = 11.dp),
) {
    if (value.isEmpty()) TText(placeholder, Type.body, T.InkFaint)
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        textStyle = Type.body.copy(color = T.Ink),
        cursorBrush = SolidColor(T.Indigo),
        modifier = Modifier.fillMaxWidth(),
    )
}

/** Rounded search bar with an optional trailing filter affordance. */
@Composable
fun SearchBar(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
) = Row(
    modifier
        .fillMaxWidth()
        .height(46.dp)
        .clip(T.RCard)
        .background(T.Fill)
        .padding(horizontal = 13.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(9.dp),
) {
    Icon(Icons.Default.Search, null, tint = T.InkMuted, modifier = Modifier.size(20.dp))
    Box(Modifier.weight(1f)) {
        if (value.isEmpty()) TText(placeholder, Type.body.copy(fontSize = 13.5f.sp), T.InkFaint, maxLines = 1)
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = true,
            textStyle = Type.body.copy(fontSize = 13.5f.sp, color = T.Ink),
            cursorBrush = SolidColor(T.Indigo),
            modifier = Modifier.fillMaxWidth(),
        )
    }
    trailing?.invoke()
}

/** iOS-style switch — the spec's 44×26 pill. */
@Composable
fun TSwitch(checked: Boolean, onCheckedChange: (Boolean) -> Unit, modifier: Modifier = Modifier) = Box(
    modifier
        .size(44.dp, 26.dp)
        .clip(T.RPill)
        .background(if (checked) T.Indigo else Color(0xFFC7C5D0))
        .clickable { onCheckedChange(!checked) }
        .padding(3.dp),
    contentAlignment = if (checked) Alignment.CenterEnd else Alignment.CenterStart,
) {
    Box(Modifier.size(20.dp).clip(T.RPill).background(Color.White))
}

/** Settings row: label left, switch right, hairline underneath. */
@Composable
fun ToggleRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    divider: Boolean = true,
) = Column(modifier.fillMaxWidth()) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 11.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TText(label, Type.cardTitleSm, T.Ink, Modifier.weight(1f))
        TSwitch(checked, onCheckedChange)
    }
    if (divider) Box(Modifier.fillMaxWidth().height(1.dp).background(T.DividerFaint))
}

/* ------------------------------------------------------------------ *
 *  Progress                                                          *
 * ------------------------------------------------------------------ */

/** Flat rounded meter. Used for queue progress, pipeline fill and funnels. */
@Composable
fun Meter(
    fraction: Float,
    modifier: Modifier = Modifier,
    height: Dp = 8.dp,
    color: Color = T.Indigo,
    track: Color = T.TrackBorder,
) = Box(
    modifier
        .fillMaxWidth()
        .height(height)
        .clip(T.RPill)
        .background(track),
) {
    Box(
        Modifier
            .fillMaxHeight()
            .fillMaxWidth(fraction.coerceIn(0f, 1f))
            .clip(T.RPill)
            .background(color),
    )
}

/* ------------------------------------------------------------------ *
 *  States — the spec's reusable gallery                              *
 * ------------------------------------------------------------------ */

/** Shimmering placeholder rows shown while a virtualised list pages. */
@Composable
fun SkeletonList(rows: Int = 5, modifier: Modifier = Modifier) {
    val pulse = rememberInfiniteTransition("skeleton")
    val alpha by pulse.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label = "sk",
    )
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(T.Gap)) {
        repeat(rows) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .clip(T.RCard)
                    .background(T.Surface)
                    .border(1.dp, T.Divider, T.RCard)
                    .padding(12.dp)
                    .alpha(alpha),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(11.dp),
            ) {
                Box(Modifier.size(40.dp).clip(T.RPill).background(Color(0xFFEAE8F2)))
                Column(Modifier.weight(1f)) {
                    Box(Modifier.fillMaxWidth(0.58f).height(11.dp).clip(RoundedCornerShape(4.dp)).background(Color(0xFFEAE8F2)))
                    Spacer(Modifier.height(7.dp))
                    Box(Modifier.fillMaxWidth(0.8f).height(9.dp).clip(RoundedCornerShape(4.dp)).background(T.Track))
                }
            }
        }
    }
}

/**
 * Icon + cause + one action. The spec is explicit that an empty or failed
 * state is never a dead end, so [actionLabel] is the norm, not the exception.
 */
@Composable
fun StateBlock(
    icon: ImageVector,
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    iconBackground: Color = T.Fill,
    iconTint: Color = T.InkFaint,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    actionContainer: Color = T.Indigo,
    actionContent: Color = Color.White,
) = Column(
    modifier
        .fillMaxWidth()
        .padding(horizontal = 40.dp, vertical = 48.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
) {
    Box(
        Modifier.size(62.dp).clip(RoundedCornerShape(20.dp)).background(iconBackground),
        contentAlignment = Alignment.Center,
    ) { Icon(icon, null, tint = iconTint, modifier = Modifier.size(31.dp)) }
    Spacer(Modifier.height(16.dp))
    TText(title, Type.sheetTitle.copy(fontSize = 16.sp), T.Ink)
    Spacer(Modifier.height(6.dp))
    androidx.compose.material3.Text(
        body,
        style = Type.body,
        color = T.InkMuted,
        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
    )
    if (actionLabel != null && onAction != null) {
        Spacer(Modifier.height(18.dp))
        Row(
            Modifier
                .height(46.dp)
                .clip(RoundedCornerShape(13.dp))
                .background(actionContainer)
                .clickable(onClick = onAction)
                .padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) { TText(actionLabel, Type.cardTitle, actionContent) }
    }
}

/** Full-screen loading, error and empty wrappers so callers stay declarative. */
@Composable
fun ErrorState(message: String, onRetry: () -> Unit, modifier: Modifier = Modifier) = StateBlock(
    icon = Icons.Default.Close,
    title = "Something went wrong",
    body = message,
    modifier = modifier,
    iconBackground = T.RedTint,
    iconTint = T.Red,
    actionLabel = "Retry",
    onAction = onRetry,
    actionContainer = T.IndigoTint,
    actionContent = T.IndigoInk,
)

/** Provides the app text style so stray `Text` calls inherit the right face. */
@Composable
fun ProvideTalentText(content: @Composable () -> Unit) =
    CompositionLocalProvider(LocalTextStyle provides Type.body, content = content)
