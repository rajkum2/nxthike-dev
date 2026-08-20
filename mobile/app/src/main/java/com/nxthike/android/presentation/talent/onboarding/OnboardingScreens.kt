package com.nxthike.android.presentation.talent.onboarding

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CheckBox
import androidx.compose.material.icons.filled.CheckBoxOutlineBlank
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Contacts
import androidx.compose.material.icons.filled.CorporateFare
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.GppGood
import androidx.compose.material.icons.filled.HowToReg
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.RadioButtonChecked
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.RunningWithErrors
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import com.nxthike.android.data.local.WorkspaceMode
import com.nxthike.android.presentation.auth.AuthViewModel
import com.nxthike.android.presentation.designsystem.*
import com.nxthike.android.presentation.session.SessionViewModel
import com.nxthike.android.BuildConfig
import androidx.compose.material.icons.filled.Science

/* ------------------------------------------------------------------ *
 *  SCR-AUTH-02 · Login                                               *
 * ------------------------------------------------------------------ */

@Composable
fun LoginScreen(onSignedIn: () -> Unit, onRegister: () -> Unit) {
    val vm: AuthViewModel = hiltViewModel()
    // Debug builds can pre-fill a development account, set in `local.properties`
    // as `devLoginEmail` / `devLoginPassword`. Release builds compile these to
    // empty strings — see the comment in `app/build.gradle.kts` for why a real
    // credential must never reach a shipped APK.
    val devEmail = if (BuildConfig.DEBUG) BuildConfig.DEV_LOGIN_EMAIL else ""
    val devPassword = if (BuildConfig.DEBUG) BuildConfig.DEV_LOGIN_PASSWORD else ""
    val prefilled = devEmail.isNotBlank() && devPassword.isNotBlank()

    var email by remember { mutableStateOf(devEmail) }
    var password by remember { mutableStateOf(devPassword) }
    var reveal by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }

    Column(
        Modifier
            .fillMaxSize()
            .background(T.Bg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 26.dp)
            .padding(top = 40.dp, bottom = 26.dp),
    ) {
        Box(
            Modifier.size(52.dp).clip(RoundedCornerShape(16.dp)).background(T.Indigo),
            contentAlignment = Alignment.Center,
        ) { Icon(Icons.Default.Phone, null, tint = Color.White, modifier = Modifier.size(30.dp)) }

        TText("Sign in to\nTalentDialer", Type.heroTitle, T.Ink, Modifier.padding(top = 26.dp))
        TText(
            "Your recruiting desk, in your pocket. Calls stay on your phone dialer.",
            Type.body.copy(fontSize = androidx.compose.ui.unit.TextUnit(13.5f, androidx.compose.ui.unit.TextUnitType.Sp)),
            T.InkMuted,
            Modifier.padding(top = 8.dp),
        )

        if (prefilled) {
            Banner(
                Icons.Default.Science, T.AmberSurface, T.AmberBorder, T.Amber,
                Modifier.padding(top = 18.dp),
            ) {
                TText(
                    "Debug build — development credentials pre-filled from local.properties. " +
                        "Release builds never carry them.",
                    Type.bodySm, T.AmberDeep,
                )
            }
        }

        Spacer(Modifier.height(26.dp))
        TField(email, { email = it; error = null }, label = "Work email", placeholder = "you@company.com", minHeight = 52.dp)
        Spacer(Modifier.height(12.dp))
        TText("Password", Type.label, T.InkMuted, Modifier.padding(bottom = 6.dp))
        Row(
            Modifier
                .fillMaxWidth()
                .height(52.dp)
                .clip(T.RField)
                .background(T.Surface)
                .border(1.dp, if (error != null) T.MaroonBorder else T.BorderStrong, T.RField)
                .padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.weight(1f)) {
                if (password.isEmpty()) TText("••••••••", Type.body, T.InkFaint)
                androidx.compose.foundation.text.BasicTextField(
                    value = password,
                    onValueChange = { password = it; error = null },
                    singleLine = true,
                    visualTransformation = if (reveal) androidx.compose.ui.text.input.VisualTransformation.None else PasswordVisualTransformation(),
                    textStyle = Type.body.copy(color = T.Ink),
                    cursorBrush = androidx.compose.ui.graphics.SolidColor(T.Indigo),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            Icon(
                if (reveal) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                if (reveal) "Hide password" else "Show password",
                tint = T.InkMuted,
                modifier = Modifier.size(20.dp).clickable { reveal = !reveal },
            )
        }

        if (error != null) {
            Spacer(Modifier.height(12.dp))
            Banner(Icons.Default.Error, T.MaroonTint, T.MaroonBorder, T.Maroon) {
                TText(error!!, Type.bodySm, T.MaroonInk)
            }
        }

        Spacer(Modifier.height(20.dp))
        PrimaryButton(
            if (busy) "Signing in…" else "Sign in",
            onClick = {
                if (email.isBlank() || password.isBlank()) {
                    error = "Enter your work email and password."
                    return@PrimaryButton
                }
                busy = true
                vm.login(email, password) { ok, msg ->
                    busy = false
                    if (ok) onSignedIn() else error = msg ?: "Those credentials were not accepted."
                }
            },
            enabled = !busy,
            height = 54.dp,
            shape = RoundedCornerShape(14.dp),
        )
        Spacer(Modifier.height(10.dp))
        PrimaryButton(
            "Create an account",
            onClick = onRegister,
            icon = Icons.Default.Business,
            height = 54.dp,
            shape = RoundedCornerShape(14.dp),
            container = T.IndigoTint,
            contentColor = T.IndigoInk,
        )
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-AUTH-03 · Register                                            *
 * ------------------------------------------------------------------ */

@Composable
fun RegisterScreen(onRegistered: () -> Unit, onBack: () -> Unit) {
    val vm: AuthViewModel = hiltViewModel()
    var first by remember { mutableStateOf("") }
    var last by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    val valid = email.contains('@') && password.length >= 6 && first.isNotBlank()

    Column(
        Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())
            .padding(horizontal = 26.dp).padding(top = 20.dp, bottom = 26.dp),
    ) {
        TopBar("Create account", onBack)
        TText(
            "Recruiters get their own login so every call is attributed. " +
                "An admin has to grant hiring access before the desk unlocks.",
            Type.body, T.InkMuted,
        )
        Spacer(Modifier.height(20.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            TField(first, { first = it; error = null }, Modifier.weight(1f), label = "First name", placeholder = "Priya", minHeight = 52.dp)
            TField(last, { last = it }, Modifier.weight(1f), label = "Last name", placeholder = "Sharma", minHeight = 52.dp)
        }
        Spacer(Modifier.height(12.dp))
        TField(email, { email = it; error = null }, label = "Work email", placeholder = "you@company.com", minHeight = 52.dp)
        Spacer(Modifier.height(12.dp))
        TField(password, { password = it; error = null }, label = "Password", placeholder = "At least 6 characters", minHeight = 52.dp)

        if (error != null) {
            Spacer(Modifier.height(12.dp))
            Banner(Icons.Default.Error, T.MaroonTint, T.MaroonBorder, T.Maroon) {
                TText(error!!, Type.bodySm, T.MaroonInk)
            }
        }

        Spacer(Modifier.height(20.dp))
        PrimaryButton(
            if (busy) "Creating…" else "Create account",
            onClick = {
                busy = true
                // The API refuses self-registration as admin (it forces
                // student/employer), and every CRM route requires an admin JWT —
                // so a new account lands on the access-pending screen until an
                // admin promotes it.
                vm.register(email, password, first, last, "employer") { ok, msg ->
                    busy = false
                    if (ok) onRegistered() else error = msg ?: "Could not create that account."
                }
            },
            enabled = valid && !busy,
            height = 54.dp, shape = RoundedCornerShape(14.dp),
        )
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-AUTH-04 · Workspace mode                                      *
 * ------------------------------------------------------------------ */

@Composable
fun ModeScreen(session: SessionViewModel, onContinue: () -> Unit) {
    val prefs by session.prefs.collectAsState()
    val agency = prefs.mode == WorkspaceMode.AGENCY

    Column(
        Modifier.fillMaxSize().background(T.Bg).padding(horizontal = 22.dp).padding(top = 30.dp, bottom = 22.dp),
    ) {
        TText("Choose your workspace", Type.displayTitle, T.Ink)
        TText(
            "Mode changes vocabulary, navigation and permissions across the app.",
            Type.body, T.InkMuted, Modifier.padding(top = 6.dp),
        )
        Spacer(Modifier.height(20.dp))

        ModeCard(
            selected = agency,
            accent = T.Indigo,
            icon = Icons.Default.Apartment,
            title = "Agency",
            body = "Clients → Requisitions → Submissions. High-volume outbound calling, bill and pay rates.",
            eyebrow = "VOCABULARY · CLIENT / REQUISITION",
            onClick = { session.setMode(WorkspaceMode.AGENCY) },
        )
        Spacer(Modifier.height(12.dp))
        ModeCard(
            selected = !agency,
            accent = T.Teal,
            icon = Icons.Default.CorporateFare,
            title = "In-house",
            body = "Departments → Openings → Pipelines. Hiring-manager collaboration, scorecards, approvals.",
            eyebrow = "VOCABULARY · DEPARTMENT / OPENING",
            onClick = { session.setMode(WorkspaceMode.IN_HOUSE) },
        )

        Spacer(Modifier.weight(1f))
        PrimaryButton("Continue", onContinue, height = 54.dp, shape = RoundedCornerShape(14.dp))
    }
}

@Composable
private fun ModeCard(
    selected: Boolean,
    accent: Color,
    icon: ImageVector,
    title: String,
    body: String,
    eyebrow: String,
    onClick: () -> Unit,
) = Column(
    Modifier
        .fillMaxWidth()
        .clip(T.RCardLg)
        .background(if (selected) accent.copy(alpha = 0.05f) else T.Surface)
        .border(2.dp, if (selected) accent else T.BorderStrong.copy(alpha = 0.6f), T.RCardLg)
        .clickable(onClick = onClick)
        .padding(16.dp),
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = accent, modifier = Modifier.size(21.dp))
        Spacer(Modifier.width(9.dp))
        TText(title, Type.sheetTitle, T.Ink, Modifier.weight(1f))
        Icon(
            if (selected) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
            null, tint = if (selected) accent else T.BorderStrong, modifier = Modifier.size(22.dp),
        )
    }
    TText(body, Type.body, T.InkMuted, Modifier.padding(top = 8.dp))
    Eyebrow(eyebrow, Modifier.padding(top = 10.dp))
}

/* ------------------------------------------------------------------ *
 *  SCR-AUTH-05 · Permission priming                                  *
 * ------------------------------------------------------------------ */

private data class Perm(
    val icon: ImageVector,
    val key: String,
    val optional: Boolean,
    val title: String,
    val why: String,
    val fallback: String,
    val manifest: String?,
)

/**
 * The four runtime permissions, pre-explained. Nothing is requested until the
 * user taps Continue — the spec's rule is no cold OS dialogs.
 *
 * `READ_CALL_LOG` is deliberately absent: the app never reads the device call
 * log, which is why every duration it records is marked ESTIMATED.
 */
private val PERMISSIONS = listOf(
    Perm(
        Icons.Default.Phone, "CALL_PHONE", true, "Place calls in one tap",
        "Dials the candidate directly from the queue instead of opening the dialer with the number pre-filled.",
        "we fall back to ACTION_DIAL — one extra tap.",
        Manifest.permission.CALL_PHONE,
    ),
    Perm(
        Icons.Default.Timer, "READ_PHONE_STATE", false, "Estimate call duration",
        "Detects when a call starts and ends so the duration is pre-filled for you.",
        "we time the handoff instead — still an estimate, still editable.",
        Manifest.permission.READ_PHONE_STATE,
    ),
    Perm(
        Icons.Default.Notifications, "POST_NOTIFICATIONS", false, "Remind you to log the call",
        "Sends the \"log your call\" nudge the moment you return from a call.",
        "no nudge — the sheet opens next time you open the app.",
        if (Build.VERSION.SDK_INT >= 33) Manifest.permission.POST_NOTIFICATIONS else null,
    ),
    Perm(
        Icons.Default.Contacts, "READ_CONTACTS", true, "Import from your contacts",
        "Adds a candidate from a saved contact without retyping the number.",
        "numbers are entered manually.",
        Manifest.permission.READ_CONTACTS,
    ),
)

@Composable
fun PermissionPrimingScreen(session: SessionViewModel, onGranted: () -> Unit, onDenied: () -> Unit) {
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) { result ->
        session.markPrimed()
        if (result.values.any { !it }) onDenied() else onGranted()
    }

    Column(
        Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())
            .padding(horizontal = 22.dp).padding(top = 26.dp, bottom = 22.dp),
    ) {
        TText("Four permissions,\nand why we ask", Type.heroTitle.copy(fontSize = androidx.compose.ui.unit.TextUnit(22f, androidx.compose.ui.unit.TextUnitType.Sp)), T.Ink)
        TText("Nothing is requested until you tap Continue.", Type.body, T.InkMuted, Modifier.padding(top = 8.dp))

        Spacer(Modifier.height(18.dp))
        PERMISSIONS.forEach { p ->
            TCard(Modifier.padding(bottom = 10.dp), padding = 13.dp) {
                Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                    Box(
                        Modifier.size(36.dp).clip(RoundedCornerShape(11.dp)).background(T.IndigoTint),
                        contentAlignment = Alignment.Center,
                    ) { Icon(p.icon, null, tint = T.Indigo, modifier = Modifier.size(19.dp)) }
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            TText(p.title, Type.cardTitle, T.Ink)
                            Spacer(Modifier.width(6.dp))
                            Box(
                                Modifier.clip(RoundedCornerShape(4.dp)).background(T.Fill)
                                    .padding(horizontal = 5.dp, vertical = 2.dp),
                            ) {
                                TText(if (p.optional) "OPTIONAL" else "RECOMMENDED", Type.monoXs, T.Neutral)
                            }
                        }
                        TText(p.why, Type.body, T.InkMuted, Modifier.padding(top = 4.dp))
                        TText("Without it: ${p.fallback}", Type.bodySm, T.InkFaint, Modifier.padding(top = 5.dp))
                    }
                }
            }
        }

        Banner(Icons.Default.Security, T.AmberSurface, T.AmberBorder, T.Amber) {
            TText(
                "No READ_CALL_LOG is declared. Outcomes are logged by you; duration is only an estimate.",
                Type.bodySm, T.AmberDeep,
            )
        }

        Spacer(Modifier.height(18.dp))
        PrimaryButton(
            "Continue",
            onClick = {
                val asks = PERMISSIONS.mapNotNull { it.manifest }.toTypedArray()
                if (asks.isEmpty()) { session.markPrimed(); onGranted() } else launcher.launch(asks)
            },
            height = 54.dp, shape = RoundedCornerShape(14.dp),
        )
        Box(
            Modifier.fillMaxWidth().height(44.dp).clickable { session.markPrimed(); onDenied() },
            contentAlignment = Alignment.Center,
        ) { TText("Not now", Type.cardTitleSm, T.InkMuted) }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-AUTH-06 · Permission denied / recovery                        *
 * ------------------------------------------------------------------ */

@Composable
fun PermissionDeniedScreen(onContinue: () -> Unit) {
    val context = LocalContext.current
    // Read the live grant state rather than trusting what the request returned —
    // the user may have changed it in system settings and come back.
    val granted = remember {
        PERMISSIONS.associate { p ->
            p.key to (
                p.manifest == null ||
                    ContextCompat.checkSelfPermission(context, p.manifest) == PackageManager.PERMISSION_GRANTED
                )
        }
    }
    val allGranted = granted.values.all { it }
    Column(
        Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())
            .padding(horizontal = 22.dp).padding(top = 26.dp, bottom = 22.dp),
    ) {
        Box(
            Modifier.size(44.dp).clip(RoundedCornerShape(13.dp))
                .background(if (allGranted) T.GreenTint else T.AmberTint),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                if (allGranted) Icons.Default.CheckCircle else Icons.Default.RunningWithErrors,
                null,
                tint = if (allGranted) T.Green else T.Amber,
                modifier = Modifier.size(24.dp),
            )
        }

        TText(
            if (allGranted) "All set" else "Running in degraded mode",
            Type.heroTitle.copy(fontSize = androidx.compose.ui.unit.TextUnit(22f, androidx.compose.ui.unit.TextUnitType.Sp)),
            T.Ink, Modifier.padding(top = 16.dp),
        )
        TText(
            if (allGranted) {
                "Every permission was granted. Nothing is degraded."
            } else {
                "The app still works. Here is exactly what changes, per permission."
            },
            Type.body, T.InkMuted, Modifier.padding(top = 8.dp),
        )

        Spacer(Modifier.height(16.dp))
        PERMISSIONS.forEach { p ->
            val ok = granted[p.key] == true
            TCard(Modifier.padding(bottom = 8.dp), shape = T.RField, padding = 12.dp) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TText(p.key, Type.mono, T.Ink, Modifier.weight(1f))
                    Badge(
                        if (ok) "Granted" else "Denied",
                        if (ok) T.GreenTint else T.AmberTint,
                        if (ok) T.Green else T.AmberInk,
                        icon = if (ok) Icons.Default.CheckCircle else Icons.Default.Error,
                    )
                }
                TText("Fallback: ${p.fallback}", Type.body, T.InkMuted, Modifier.padding(top = 6.dp))
            }
        }

        Spacer(Modifier.height(18.dp))
        if (!allGranted) {
            PrimaryButton(
            "Open system settings",
            onClick = {
                runCatching {
                    context.startActivity(
                        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                            .setData(Uri.fromParts("package", context.packageName, null))
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                    )
                }
            },
            icon = Icons.Default.Settings, height = 54.dp, shape = RoundedCornerShape(14.dp),
            )
        }
        if (allGranted) {
            PrimaryButton("Continue", onContinue, height = 54.dp, shape = RoundedCornerShape(14.dp))
        } else {
            Box(
                Modifier.fillMaxWidth().height(44.dp).clickable(onClick = onContinue),
                contentAlignment = Alignment.Center,
            ) { TText("Continue anyway", Type.cardTitleSm, T.InkMuted) }
        }
    }
}

/* ------------------------------------------------------------------ *
 *  SCR-AUTH-07 · DPDP consent notice                                 *
 * ------------------------------------------------------------------ */

private val DPDP_POINTS = listOf(
    Triple(Icons.Default.GppGood, "Lawful purpose only", "Candidate data is processed for recruitment, and nothing else."),
    Triple(Icons.Default.HowToReg, "Consent before contact", "Record consent with channel and timestamp before the first call or message."),
    Triple(Icons.Default.EditNote, "Correction and erasure", "Candidates can ask for changes or deletion. Requests are routed to your admin."),
    Triple(Icons.Default.Schedule, "Retention limits", "Records are purged 24 months after last activity unless a placement exists."),
)

@Composable
fun DpdpScreen(session: SessionViewModel, onAccept: () -> Unit) {
    var checked by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().background(T.Bg)) {
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState())
                .padding(horizontal = 22.dp).padding(top = 26.dp, bottom = 12.dp),
        ) {
            Eyebrow("DPDP ACT 2023")
            TText(
                "How candidate data is handled",
                Type.heroTitle.copy(fontSize = androidx.compose.ui.unit.TextUnit(22f, androidx.compose.ui.unit.TextUnitType.Sp)),
                T.Ink, Modifier.padding(top = 8.dp),
            )
            Spacer(Modifier.height(16.dp))
            DPDP_POINTS.forEach { (icon, title, body) ->
                Row(Modifier.padding(bottom = 13.dp), horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                    Icon(icon, null, tint = T.Teal, modifier = Modifier.size(19.dp))
                    Column {
                        TText(title, Type.cardTitle, T.Ink)
                        TText(body, Type.body, T.InkMuted, Modifier.padding(top = 3.dp))
                    }
                }
            }
            TText(
                "Consent can be withdrawn from Settings at any time.",
                Type.bodySm, T.InkFaint, Modifier.padding(top = 4.dp),
            )
        }
        Column(
            Modifier.fillMaxWidth().background(T.Surface).padding(horizontal = 22.dp).padding(top = 12.dp, bottom = 20.dp),
        ) {
            Row(
                Modifier.fillMaxWidth().clickable { checked = !checked }.padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Icon(
                    if (checked) Icons.Default.CheckBox else Icons.Default.CheckBoxOutlineBlank,
                    null, tint = if (checked) T.Indigo else T.InkFaint, modifier = Modifier.size(22.dp),
                )
                TText(
                    "I have read the notice and I will record candidate consent before first contact.",
                    Type.body, T.InkBody,
                )
            }
            PrimaryButton(
                "Accept & continue",
                onClick = { session.acceptDpdp(); session.setOnboarded(); onAccept() },
                enabled = checked, height = 54.dp, shape = RoundedCornerShape(14.dp),
            )
        }
    }
}

/** Bolder weight helper kept local so the onboarding hero titles stay legible. */
private val Bold = FontWeight.Bold

/* ------------------------------------------------------------------ *
 *  Access pending — signed in, but not an admin                      *
 * ------------------------------------------------------------------ */

/**
 * The CRM routes are admin-only on the server. Rather than let a `student` or
 * `employer` account walk into twelve screens that each 403, we stop here and
 * name the exact fix.
 */
@Composable
fun AccessPendingScreen(session: SessionViewModel, onSignOut: () -> Unit) {
    val user by session.user.collectAsState()
    // What the server actually said. It refuses with a reason, so show that
    // rather than guessing — the remedy differs between "no persona assigned"
    // and "this account is suspended".
    val reason = session.accessDenialReason

    Column(
        Modifier.fillMaxSize().background(T.Bg).verticalScroll(rememberScrollState())
            .padding(horizontal = 26.dp).padding(top = 60.dp, bottom = 26.dp),
    ) {
        Box(
            Modifier.size(52.dp).clip(RoundedCornerShape(16.dp)).background(T.AmberTint),
            contentAlignment = Alignment.Center,
        ) { Icon(Icons.Default.Lock, null, tint = T.Amber, modifier = Modifier.size(28.dp)) }

        TText("No workspace access yet", Type.heroTitle, T.Ink, Modifier.padding(top = 26.dp))
        TText(
            reason ?: "You're signed in, but this account can't see candidates or calls yet.",
            Type.body, T.InkMuted, Modifier.padding(top = 8.dp),
        )

        TCard(Modifier.padding(top = 22.dp), shape = T.RCardLg, padding = 14.dp) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                TText("Signed in as", Type.body, T.InkMuted, Modifier.weight(1f))
                TText(user?.email ?: "—", Type.cardTitleSm, T.Ink, maxLines = 1)
            }
            Row(Modifier.padding(top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                TText("Portal role", Type.body, T.InkMuted, Modifier.weight(1f))
                Badge(session.role, T.AmberTint, T.AmberInk)
            }
            Row(Modifier.padding(top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                TText("Persona", Type.body, T.InkMuted, Modifier.weight(1f))
                Badge("not assigned", T.MaroonTint, T.Maroon)
            }
        }

        Banner(
            Icons.Default.AdminPanelSettings, T.AmberSurface, T.AmberBorder, T.Amber,
            Modifier.padding(top = 14.dp),
        ) {
            TText(
                "Ask a workspace admin to assign you a persona — Sourcer, Recruiter, " +
                    "Team Lead, Account Manager, Hiring Manager or Interviewer all open " +
                    "the desk. You do not need to be an admin. Then tap Check again.",
                Type.bodySm, T.AmberDeep,
            )
        }

        Spacer(Modifier.height(24.dp))
        PrimaryButton(
            "Check again", { session.refreshUser() },
            icon = Icons.Default.Refresh, height = 54.dp, shape = RoundedCornerShape(14.dp),
        )
        Spacer(Modifier.height(10.dp))
        PrimaryButton(
            "Sign out", { session.logout(onSignOut) },
            height = 54.dp, shape = RoundedCornerShape(14.dp),
            container = T.MaroonTint, contentColor = T.Maroon,
        )
    }
}
