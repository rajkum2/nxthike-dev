"""Rich resume text extraction for Internshala-style and general PDFs."""

from __future__ import annotations

import re
from io import BytesIO

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(
    r"(?:\+?\s*91[\s\-]?)?(?:\d[\s\-]?){10,12}|\b[6-9]\d{9}\b"
)

SECTION_HEADERS = re.compile(
    r"(?im)^("
    r"education|educational\s+qualifications?|academic|"
    r"experience|work\s+experience|professional\s+experience|employment|"
    r"internships?|training|trainings|certifications?|certificates?|"
    r"projects?|skills?|technical\s+skills|key\s+skills|"
    r"languages?|achievements?|awards?|hobbies?|interests?|"
    r"objective|career\s+objective|summary|profile|about\s+me|"
    r"work\s+samples?|portfolio|personal\s+details?|declaration|"
    r"additional\s+details?|extra\s*curricular|"
    r"positions?\s+of\s+responsibility|por"
    r")\s*$"
)


def extract_text_from_pdf_bytes(data: bytes) -> str:
    if not data:
        return ""
    try:
        import fitz

        doc = fitz.open(stream=data, filetype="pdf")
        parts = []
        for page in doc:
            parts.append(page.get_text("text") or "")
        doc.close()
        return "\n".join(parts)
    except Exception:
        try:
            from pypdf import PdfReader

            r = PdfReader(BytesIO(data))
            return "\n".join((p.extract_text() or "") for p in r.pages)
        except Exception:
            return ""


def _clean_lines(text: str) -> list[str]:
    lines = []
    for ln in (text or "").splitlines():
        ln = ln.strip()
        # fix common PDF garbage
        ln = ln.replace("\xa0", " ")
        ln = re.sub(r"\s+", " ", ln)
        if ln:
            lines.append(ln)
    return lines


def _split_sections(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"_preamble": []}
    current = "_preamble"
    for ln in lines:
        if SECTION_HEADERS.match(ln):
            key = re.sub(r"\s+", " ", ln.lower())
            # normalize keys
            if "educat" in key or "academic" in key:
                current = "education"
            elif "intern" in key and "experience" not in key:
                current = "internships"
            elif "experience" in key or "employment" in key:
                current = "experience"
            elif "train" in key or "certif" in key:
                current = "certifications"
            elif "project" in key:
                current = "projects"
            elif "skill" in key:
                current = "skills"
            elif "language" in key:
                current = "languages"
            elif "objective" in key or key in {"summary", "profile", "about me"}:
                current = "objective"
            elif "sample" in key or "portfolio" in key:
                current = "portfolio"
            elif "additional" in key or "extra" in key:
                current = "additional"
            elif "personal" in key or "declaration" in key:
                current = "personal"
            else:
                current = key
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(ln)
    return sections


def _join(lines: list[str] | None, limit: int = 2000) -> str | None:
    if not lines:
        return None
    s = "\n".join(lines).strip()
    if not s:
        return None
    return s[:limit]


def parse_resume_text(text: str, fallback_name: str | None = None) -> dict:
    lines = _clean_lines(text)
    sections = _split_sections(lines)
    full = "\n".join(lines)

    emails = EMAIL_RE.findall(full)
    email = None
    for e in emails:
        if "example.com" not in e.lower() and "udemy" not in e.lower():
            email = e
            break

    phone = None
    for p in PHONE_RE.findall(full):
        digits = re.sub(r"\D", "", p)
        if len(digits) >= 10:
            phone = digits[-10:]
            break

    # Name: first preamble line that looks like a person name
    name = fallback_name
    for ln in sections.get("_preamble", [])[:8]:
        if EMAIL_RE.search(ln) or PHONE_RE.search(ln):
            continue
        if re.search(r"(?i)http|linkedin|github|mobile|email|phone|@|\d{5,}", ln):
            continue
        if 2 <= len(ln) <= 55 and re.match(r"^[A-Za-z][A-Za-z.\s'-]{1,54}$", ln):
            # avoid single words that are section-like
            if ln.lower() in {"resume", "curriculum", "vitae", "cv"}:
                continue
            name = ln.strip()
            break

    # City: often line after phone/email in Internshala format "City1, City2"
    city = None
    for ln in sections.get("_preamble", [])[:10]:
        if EMAIL_RE.search(ln) or PHONE_RE.search(ln):
            continue
        if name and ln.strip().lower() == name.strip().lower():
            continue
        if re.search(r"(?i)http|linkedin|github", ln):
            continue
        # location-like: commas, no digits heavy
        if re.match(r"^[A-Za-z][A-Za-z\s,./-]{2,60}$", ln) and not re.search(
            r"(?i)engineer|developer|student|bachelor|university", ln
        ):
            # prefer multi-part locations
            if "," in ln or len(ln.split()) <= 4:
                city = ln.split(",")[0].strip()
                break

    edu_lines = sections.get("education") or []
    education_blob = _join(edu_lines, 1500)
    degree = None
    institute = None
    stream = None
    grad_year = None
    if edu_lines:
        # first degree-ish line
        for ln in edu_lines[:6]:
            if re.search(
                r"(?i)b\.?\s*tech|b\.?\s*e\.?|bachelor|m\.?\s*tech|m\.?\s*sc|mba|b\.?\s*sc|diploma|secondary|xii|x\b|graduation",
                ln,
            ):
                degree = ln[:200]
                break
        for ln in edu_lines[:12]:
            if re.search(r"(?i)university|college|institute|school|iit|nit|vit", ln):
                institute = ln[:200]
                break
        for ln in edu_lines:
            ym = re.search(r"(20\d{2})\s*[-–—]\s*(20\d{2}|present)", ln, re.I)
            if ym:
                grad_year = ym.group(2) if ym.group(2).lower() != "present" else ym.group(1)
                break
            ym2 = re.search(r"(?i)year of completion[:\s]*(\d{4})", ln)
            if ym2:
                grad_year = ym2.group(1)
                break
        for ln in edu_lines[:8]:
            if re.search(r"(?i)computer|science|mechanical|electrical|commerce|arts|marketing", ln):
                if not re.search(r"(?i)university|college|school", ln):
                    stream = ln[:120]
                    break

    exp_lines = (sections.get("experience") or []) + (sections.get("internships") or [])
    exp_blob = _join(exp_lines, 2500)
    has_exp = None
    if exp_lines:
        has_exp = "Yes"
    elif re.search(r"(?i)\b(intern|worked at|experience)\b", full):
        has_exp = "Yes"
    else:
        has_exp = "No" if re.search(r"(?i)fresher|no experience", full) else None

    companies: list[str] = []
    titles: list[str] = []
    latest_role = None
    latest_company = None
    # Heuristic: company lines often after role or with Pvt/Ltd/Inc
    for i, ln in enumerate(exp_lines[:20]):
        if re.search(r"(?i)\b(pvt|ltd|limited|inc|llc|technologies|solutions|labs|university|college)\b", ln):
            companies.append(ln)
        if re.search(
            r"(?i)\b(engineer|developer|intern|analyst|manager|designer|consultant|associate|trainee)\b",
            ln,
        ) and len(ln) < 80:
            titles.append(ln)
    if titles:
        latest_role = titles[0]
    if companies:
        latest_company = companies[0]
    # Internshala: role then company on next lines sometimes
    if not latest_role and exp_lines:
        latest_role = exp_lines[0][:120]

    skills_lines = sections.get("skills") or []
    # Internshala: skill name then level on next line
    skills: list[str] = []
    skip_levels = {"beginner", "intermediate", "advanced", "expert", "proficient"}
    for ln in skills_lines:
        low = ln.lower().strip()
        if low in skip_levels:
            continue
        if re.match(r"^https?://", ln):
            continue
        if 1 < len(ln) < 60:
            skills.append(ln)
    skills_str = ", ".join(dict.fromkeys(skills))[:1000] if skills else None

    langs = _join(sections.get("languages"), 400)
    # if languages section is "English\nIntermediate" style
    if langs:
        lang_bits = []
        for ln in sections.get("languages") or []:
            if ln.lower() not in skip_levels and not re.match(r"^https?://", ln):
                lang_bits.append(ln)
        langs = ", ".join(lang_bits)[:400] if lang_bits else langs

    certs = _join(sections.get("certifications"), 1500)
    projects = _join(sections.get("projects"), 2000)
    objective = _join(sections.get("objective"), 800)
    additional = _join(sections.get("additional"), 800)
    if not additional:
        additional = _join(sections.get("portfolio"), 500)

    # duration heuristic from experience text
    duration = None
    m_dur = re.search(
        r"(?i)(\d+\s*(?:year|yr|month|mo)s?(?:\s+\d+\s*(?:month|mo)s?)?)",
        exp_blob or full,
    )
    if m_dur:
        duration = m_dur.group(1)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "city": city,
        "degree": degree,
        "stream": stream,
        "institute": institute,
        "graduation_year": grad_year,
        "education_from_pdf": education_blob,
        "has_work_experience": has_exp,
        "work_experience_detail": exp_blob,
        "experience_duration": duration,
        "companies": ", ".join(dict.fromkeys(companies))[:500] if companies else None,
        "job_titles": ", ".join(dict.fromkeys(titles))[:500] if titles else None,
        "latest_role": latest_role,
        "latest_company": latest_company,
        "other_skills": skills_str,
        "languages": langs,
        "certifications": certs,
        "projects": projects,
        "career_objective": objective,
        "additional_details": additional,
        "relevant_skills": skills_str,
    }
