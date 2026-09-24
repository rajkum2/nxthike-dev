package com.nxthike.android.core.telephony

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

/**
 * Basic dialer handoff — opens the system dialer/phone app.
 * Advanced auto call-log capture can be added later.
 */
object DialerHelper {
    /**
     * Number in the form wa.me expects: country code + number, digits only. Indian numbers are
     * stored bare ("9789819592") or with a trunk 0 ("08309700415"); WhatsApp rejects both with
     * "missing a country code". Returns null when there is no usable number.
     */
    fun whatsAppNumber(raw: String?): String? {
        if (raw.isNullOrBlank()) return null
        // "98xxxxxxxx / 97xxxxxxxx" — the first number only.
        val first = raw.split('/', ',', ';', '|').map { it.trim() }.firstOrNull { it.any(Char::isDigit) } ?: return null
        val international = first.startsWith("+") || first.startsWith("00")
        var d = first.filter(Char::isDigit)
        if (first.startsWith("00")) d = d.removePrefix("00")
        if (d.length == 11 && d.startsWith("0")) d = d.substring(1)
        if (d.length == 13 && d.startsWith("910")) d = "91" + d.substring(3) // +91 0xxxxxxxxxx
        return when {
            d.length == 10 -> "91$d"
            d.length == 12 && d.startsWith("91") -> d
            international && d.length in 8..15 -> d
            else -> null
        }
    }

    fun dial(context: Context, phone: String?) {
        val digits = phone?.filter { it.isDigit() || it == '+' }.orEmpty()
        if (digits.length < 6) {
            Toast.makeText(context, "No valid phone number", Toast.LENGTH_SHORT).show()
            return
        }
        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$digits")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Cannot open dialer: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    fun openWhatsApp(context: Context, phone: String?, message: String = "") {
        val e164 = whatsAppNumber(phone)
        if (e164 == null) {
            Toast.makeText(context, "No valid phone for WhatsApp", Toast.LENGTH_SHORT).show()
            return
        }
        val text = Uri.encode(message)
        val uri = Uri.parse("https://wa.me/$e164?text=$text")
        try {
            context.startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (e: Exception) {
            Toast.makeText(context, "WhatsApp not available", Toast.LENGTH_SHORT).show()
        }
    }

    fun email(context: Context, address: String?, subject: String = "", body: String = "") {
        val to = address?.trim().orEmpty()
        if (!to.contains('@')) {
            Toast.makeText(context, "No email address on file", Toast.LENGTH_SHORT).show()
            return
        }
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:$to")).apply {
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, body)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "No email app available", Toast.LENGTH_SHORT).show()
        }
    }

    /** Opens a link (resume, application) in whatever the device uses for it. */
    fun openUrl(context: Context, url: String?) {
        val u = url?.trim().orEmpty()
        if (u.isEmpty()) {
            Toast.makeText(context, "No link available", Toast.LENGTH_SHORT).show()
            return
        }
        val normalised = if (u.startsWith("http://") || u.startsWith("https://")) u else "https://$u"
        try {
            context.startActivity(
                Intent(Intent.ACTION_VIEW, Uri.parse(normalised)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        } catch (e: Exception) {
            Toast.makeText(context, "Nothing can open that link", Toast.LENGTH_SHORT).show()
        }
    }

    fun share(context: Context, text: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        try {
            context.startActivity(
                Intent.createChooser(intent, "Share").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        } catch (e: Exception) {
            Toast.makeText(context, "Nothing to share with", Toast.LENGTH_SHORT).show()
        }
    }

    fun sms(context: Context, phone: String?, body: String = "") {
        val digits = phone?.filter { it.isDigit() || it == '+' }.orEmpty()
        if (digits.length < 6) {
            Toast.makeText(context, "No valid phone number", Toast.LENGTH_SHORT).show()
            return
        }
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:$digits")).apply {
            putExtra("sms_body", body)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Cannot open SMS", Toast.LENGTH_SHORT).show()
        }
    }
}
