"""
Categorize candidates into hiring roles from resume text / skills / titles.

By default only reassigns Manual Import bucket; can also categorize other roles.

Usage (from BE/):
  python -m app.categorize_candidates
  python -m app.categorize_candidates --role manual_import_aug2026 --dry-run
  python -m app.categorize_candidates --role manual_import_aug2026 --min-score 3
"""

from __future__ import annotations

import argparse
import asyncio
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from sqlalchemy import select

from app.database import async_session
from app.models.hiring import Candidate, HiringRole

# Weighted keyword rules → existing role ids
ROLE_RULES: dict[str, list[tuple[str, int]]] = {
    "ai_ml_engineer": [
        (r"\bmachine\s*learning\b", 4),
        (r"\bdeep\s*learning\b", 4),
        (r"\bdata\s*scientist\b", 4),
        (r"\bdata\s*science\b", 3),
        (r"\bnlp\b|\bnatural\s*language\b", 3),
        (r"\bcomputer\s*vision\b", 3),
        (r"\btensorflow\b|\bpytorch\b|\bkeras\b|\bscikit", 3),
        (r"\bllm\b|\blangchain\b|\bgenerative\s*ai\b|\bgen\s*ai\b", 4),
        (r"\bai[/\s\-]?ml\b|\bml\s*engineer\b", 4),
        (r"\bneural\s*network", 2),
        (r"\bpandas\b|\bnumpy\b|\bmatplotlib\b", 1),
    ],
    "ai_agent_development": [
        (r"\bai\s*agent", 5),
        (r"\bagentic\b|\bmulti[-\s]?agent\b", 4),
        (r"\blangchain\b|\bllamaindex\b|\bautogen\b|\bcrewai\b", 4),
        (r"\brag\b|\bretrieval\s*augmented\b", 3),
        (r"\bopenai\b|\bgpt[-\s]?\d|\bllm\b", 2),
        (r"\bprompt\s*engineer", 3),
        (r"\bchatbot\b|\bconversational\s*ai\b", 2),
        (r"\bpython\b", 1),
        (r"\bfastapi\b|\bflask\b|\bdjango\b", 1),
    ],
    "content_social_media": [
        (r"\bdigital\s*marketing\b", 4),
        (r"\bsocial\s*media\b", 4),
        (r"\bseo\b|\bsem\b|\bsearch\s*engine\b", 4),
        (r"\bcontent\s*writ", 3),
        (r"\bcontent\s*market", 3),
        (r"\bgoogle\s*ads\b|\bmeta\s*ads\b|\bfacebook\s*ads\b", 3),
        (r"\binfluencer\b|\bbrand\s*manag", 2),
        (r"\bcopywrit", 3),
        (r"\binstagram\b|\blinkedin\s*marketing\b", 2),
        (r"\bcanva\b|\bhootsuite\b|\bmailchimp\b", 2),
        (r"\bmarketing\b", 2),
    ],
    "video_editing": [
        (r"\bvideo\s*edit", 5),
        (r"\bpremiere\s*pro\b|\bafter\s*effects\b|\bfinal\s*cut\b|\bdavinci\b", 4),
        (r"\banimation\b|\bmotion\s*graphics\b", 3),
        (r"\bfilm\s*mak|\bvideograph", 3),
        (r"\badobe\s*premiere\b|\bae\b", 2),
        (r"\byoutube\b|\breels\b|\bshort[-\s]?form\b", 2),
        (r"\bcolor\s*grad", 2),
    ],
    "product_management": [
        (r"\bproduct\s*manag", 5),
        (r"\bproduct\s*owner\b", 4),
        (r"\bagile\b|\bscrum\b|\bjira\b", 2),
        (r"\broadmap\b|\bprds?\b|\buser\s*stor", 3),
        (r"\bproduct\s*analyst\b", 3),
        (r"\bgrowth\s*product\b", 3),
        (r"\bmvp\b|\bwirefram", 2),
    ],
    "recruitment_consultant": [
        (r"\brecruit", 5),
        (r"\btalent\s*acquisition\b|\bta\b", 4),
        (r"\bhr\b|\bhuman\s*resource", 3),
        (r"\bstaffing\b|\bheadhunt", 3),
        (r"\bsourc(ing|er)\b", 3),
        (r"\binterview\s*schedul", 2),
        (r"\bnaukri\b|\blinkedin\s*recruiter\b", 2),
    ],
    "business_research": [
        (r"\bbusiness\s*research\b", 5),
        (r"\bmarket\s*research\b", 4),
        (r"\bdata\s*analys[it]", 3),
        (r"\bbusiness\s*analys[it]", 4),
        (r"\bresearch\s*analyst\b", 4),
        (r"\bexcel\b|\bpower\s*bi\b|\btableau\b", 2),
        (r"\bsurvey\b|\bsecondary\s*research\b", 2),
        (r"\bfinancial\s*analys", 2),
    ],
}

# Prefer these when scores tie (higher first)
ROLE_PRIORITY = [
    "ai_agent_development",
    "ai_ml_engineer",
    "product_management",
    "content_social_media",
    "video_editing",
    "recruitment_consultant",
    "business_research",
]


def candidate_blob(c: Candidate) -> str:
    parts = [
        c.name,
        c.latest_role,
        c.latest_company,
        c.job_titles,
        c.companies,
        c.other_skills,
        c.relevant_skills,
        c.career_objective,
        c.work_experience_detail,
        c.degree,
        c.stream,
        c.projects,
        c.certifications,
        c.education_from_pdf,
        c.notes,
        c.pdf_file,
    ]
    return " ".join(str(p) for p in parts if p).lower()


def score_roles(blob: str) -> dict[str, int]:
    scores: dict[str, int] = {}
    for role_id, rules in ROLE_RULES.items():
        s = 0
        for pattern, weight in rules:
            hits = len(re.findall(pattern, blob, flags=re.I))
            if hits:
                s += weight * min(hits, 3)  # cap spam
        if s:
            scores[role_id] = s
    return scores


def pick_role(scores: dict[str, int], min_score: int) -> str | None:
    if not scores:
        return None
    best = max(scores.values())
    if best < min_score:
        return None
    # among best score, use priority order
    contenders = [r for r, s in scores.items() if s == best]
    for r in ROLE_PRIORITY:
        if r in contenders:
            return r
    return contenders[0]


async def run(role_filter: str | None, min_score: int, dry_run: bool) -> None:
    async with async_session() as db:
        roles = {
            r.id: r
            for r in (await db.execute(select(HiringRole))).scalars().all()
        }
        q = select(Candidate)
        if role_filter:
            q = q.where(Candidate.role_id == role_filter)
        cands = (await db.execute(q)).scalars().all()

    print(f"Candidates to score: {len(cands)} (filter={role_filter or 'all'})")
    print(f"min_score={min_score} dry_run={dry_run}")

    moves: Counter[str] = Counter()
    kept = 0
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    updates: list[tuple[str, str, str, dict[str, int]]] = []

    for c in cands:
        blob = candidate_blob(c)
        scores = score_roles(blob)
        target = pick_role(scores, min_score)
        if not target or target == c.role_id:
            kept += 1
            continue
        if target not in roles:
            print(f"  skip unknown role {target}")
            continue
        role_name = roles[target].name
        updates.append((c.id, target, role_name, scores))
        moves[f"{c.role_id} → {target}"] += 1

    print(f"\nWould reassign: {len(updates)}  keep: {kept}")
    for k, v in moves.most_common():
        print(f"  {k}: {v}")

    if dry_run or not updates:
        if dry_run:
            print("\nSample moves:")
            for cid, tid, tname, sc in updates[:15]:
                print(f"  {cid[:40]:40} → {tid:25} scores={sc}")
        return

    async with async_session() as db:
        for cid, tid, tname, sc in updates:
            c = await db.get(Candidate, cid)
            if not c:
                continue
            old = c.role_id
            c.role_id = tid
            c.role_name = tname
            c.updated_at = now
            # keep a trail
            note = f"Auto-categorized {old} → {tid} (scores={dict(sc)})"
            if note not in (c.notes or ""):
                c.notes = ((c.notes or "") + "\n" + note).strip()
            tags = list(c.tags or [])
            if "auto_categorized" not in tags:
                tags.append("auto_categorized")
            c.tags = tags
        await db.commit()

    print(f"\nApplied {len(updates)} role updates.")


def main() -> None:
    p = argparse.ArgumentParser(description="Categorize candidates into hiring roles")
    p.add_argument(
        "--role",
        default="manual_import_aug2026",
        help="Only candidates currently in this role (empty string = all)",
    )
    p.add_argument("--min-score", type=int, default=3)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--all", action="store_true", help="Score every candidate (ignore --role)")
    args = p.parse_args()
    role = None if args.all else (args.role or None)
    asyncio.run(run(role, args.min_score, args.dry_run))


if __name__ == "__main__":
    main()
