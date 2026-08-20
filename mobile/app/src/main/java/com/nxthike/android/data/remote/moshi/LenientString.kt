package com.nxthike.android.data.remote.moshi

import com.squareup.moshi.FromJson
import com.squareup.moshi.JsonQualifier
import com.squareup.moshi.JsonReader
import com.squareup.moshi.JsonWriter
import com.squareup.moshi.ToJson

/**
 * Marks a `String?` field the server may also send as a number or a boolean.
 *
 * Several candidate columns are free-text in the database but arrive typed by
 * whatever wrote them — `graduationYear` is `string | integer | null` in the
 * OpenAPI schema, because a spreadsheet import writes `2024` where the web form
 * writes `"2024"`. Without this, Moshi fails the whole response with
 * "Expected a string but was NUMBER" and the screen shows an error for one
 * badly-typed field on one record.
 */
// No @Target: Moshi needs this on the property, on the adapter's return type and
// on its writer parameter, so the default (all applicable targets) is correct.
@JsonQualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class LenientString

object LenientStringAdapter {

    @FromJson
    @LenientString
    fun fromJson(reader: JsonReader): String? = when (reader.peek()) {
        JsonReader.Token.NULL -> reader.nextNull<String>()
        JsonReader.Token.STRING -> reader.nextString()
        JsonReader.Token.BOOLEAN -> reader.nextBoolean().toString()
        JsonReader.Token.NUMBER -> {
            // Keep whole numbers whole — a graduation year must read 2024, not 2024.0.
            val n = reader.nextDouble()
            if (n.isFinite() && n % 1.0 == 0.0) n.toLong().toString() else n.toString()
        }
        else -> {
            reader.skipValue()
            null
        }
    }

    @ToJson
    fun toJson(writer: JsonWriter, @LenientString value: String?) {
        writer.value(value)
    }
}
