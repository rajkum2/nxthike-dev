package com.nxthike.android.core

import com.nxthike.android.core.model.SourcePolicy
import com.nxthike.android.core.telephony.DialerHelper
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class WhatsAppNumberTest {
    private fun n(s: String?) = DialerHelper.whatsAppNumber(s)

    @Test fun bare() = assertEquals("918309700415", n("8309700415"))
    @Test fun leadingZero() = assertEquals("918309700415", n("08309700415"))
    @Test fun leadingZeroSpaced() = assertEquals("918309700415", n("0830 970 0415"))
    @Test fun plus91WithZero() = assertEquals("918309700415", n("+91 08309700415"))
    @Test fun plus91() = assertEquals("919820041562", n("+91 98200 41562"))
    @Test fun ninetyOne() = assertEquals("919820041562", n("919820041562"))
    @Test fun doubleZero() = assertEquals("919820041562", n("0091 98200 41562"))
    @Test fun otherCountry() = assertEquals("14155550123", n("+1 415 555 0123"))
    @Test fun firstOfTwo() = assertEquals("919876543210", n("9876543210 / 9123456789"))
    @Test fun invalid() = assertNull(n("12345"))
    @Test fun blank() = assertNull(n(null))
}

class SourcePolicyTest {
    @Before fun recruiter() { SourcePolicy.visible = false }
    @After fun reset() { SourcePolicy.visible = false }

    @Test fun naukriSuffix() = assertEquals("Digital Marketing", SourcePolicy.role("Digital Marketing (Naukri Import)"))
    @Test fun naukriBare() = assertEquals("AI/ML Engineer", SourcePolicy.role("AI/ML Engineer Naukri Import"))
    @Test fun wholeNameIsChannel() = assertEquals("Open role", SourcePolicy.role("Apna Import (2021)"))
    @Test fun ordinaryNameUntouched() =
        assertEquals("Business Development Executive (BDE) - Hyderabad", SourcePolicy.role("Business Development Executive (BDE) - Hyderabad"))
    @Test fun adminSeesRaw() {
        SourcePolicy.visible = true
        assertEquals("Digital Marketing (Naukri Import)", SourcePolicy.role("Digital Marketing (Naukri Import)"))
        assertFalse(SourcePolicy.hidesNoteLine("Origin: Apna"))
        assertFalse(SourcePolicy.hidesLink("https://employer.apna.co/jobs/1/2"))
    }
    @Test fun outboundAlwaysStripped() {
        SourcePolicy.visible = true
        assertEquals("Digital Marketing", SourcePolicy.stripChannel("Digital Marketing (Naukri Import)"))
    }

    @Test fun importerNoteLines() {
        listOf(
            "Source: Business Development Executive (BDE) - Hyderabad.xlsx#job_1",
            "Origin: Apna", "Apna job id: 166214983", "Apna status: new_candidate",
            "Imported from local file: x.xlsx",
        ).forEach { assertTrue(it, SourcePolicy.hidesNoteLine(it)) }
        listOf("Area: Nacharam", "Age: 32", "Relocation: Same city, No Relocation Needed", "Matched on: skills,education")
            .forEach { assertFalse(it, SourcePolicy.hidesNoteLine(it)) }
    }

    @Test fun jobBoardLinks() {
        assertTrue(SourcePolicy.hidesLink("https://employer.apna.co/jobs/166214983/1"))
        assertTrue(SourcePolicy.hidesLink("https://www.naukri.com/r/abc"))
        assertTrue(SourcePolicy.hidesLink("https://internshala.com/x"))
        assertFalse(SourcePolicy.hidesLink("https://drive.google.com/file/d/abc"))
        assertFalse(SourcePolicy.hidesLink("https://storage.nxthike.com/resumes/a.pdf"))
    }

    @Test fun descriptionText() {
        assertEquals("", SourcePolicy.text("Imported from Naukri Excel exports (AI/ML Engineer (Naukri Import))"))
        assertEquals("Applicants for BDE - Hyderabad", SourcePolicy.text("Applicants for BDE - Hyderabad"))
    }
}
