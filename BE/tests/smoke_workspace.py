"""
End-to-end smoke test of the workspace API against a throwaway SQLite file.

Run:  cd BE && python -m tests.smoke_workspace

This never touches a real database — `use_sqlite()` refuses to proceed if the
app resolves to anything other than SQLite.
"""

from __future__ import annotations

import asyncio
import sys

from tests.local_db import use_sqlite

DB_PATH = use_sqlite()

from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.database import async_session, engine, Base  # noqa: E402
from app.main import app  # noqa: E402
from app.migrations import run_migrations  # noqa: E402
from app.services.auth import hash_password  # noqa: E402

PASSED: list[str] = []
FAILED: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    (PASSED if ok else FAILED).append(f"{name}{f' — {detail}' if detail else ''}")
    print(f"{'  ok ' if ok else 'FAIL '} {name}{f' — {detail}' if detail else ''}")


async def seed_users() -> None:
    """An admin, a sourcer and a portal-only student, so gating can be compared."""
    from app.models.user import User

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await run_migrations(engine)

    async with async_session() as db:
        pw = hash_password("smoke-only-pw")
        db.add_all([
            User(id="u-admin", email="admin@smoke.example", password_hash=pw,
                 first_name="Ada", last_name="Admin", role="admin", persona="p8"),
            User(id="u-src", email="sourcer@smoke.example", password_hash=pw,
                 first_name="Sam", last_name="Sourcer", role="employer", persona="p1"),
            # No persona and not an admin — the portal lockout case.
            User(id="u-stu", email="student@smoke.example", password_hash=pw,
                 first_name="Sara", last_name="Student", role="student"),
        ])
        await db.commit()


async def token(client: AsyncClient, email: str) -> str | None:
    r = await client.post("/api/auth/login", json={"email": email, "password": "smoke-only-pw"})
    if r.status_code != 200:
        return None
    return r.json().get("access_token")


async def main() -> int:
    await seed_users()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://smoke") as client:
        admin_tok = await token(client, "admin@smoke.example")
        src_tok = await token(client, "sourcer@smoke.example")
        stu_tok = await token(client, "student@smoke.example")
        check("login: admin", bool(admin_tok))
        check("login: sourcer", bool(src_tok))
        check("login: student", bool(stu_tok))
        if not (admin_tok and src_tok and stu_tok):
            return 1

        A = {"Authorization": f"Bearer {admin_tok}"}
        S = {"Authorization": f"Bearer {src_tok}"}
        P = {"Authorization": f"Bearer {stu_tok}"}

        # --- session + persona gating -------------------------------------
        r = await client.get("/api/workspace/session", headers=A)
        check("GET session (admin)", r.status_code == 200, f"HTTP {r.status_code}")
        admin_session = r.json() if r.status_code == 200 else {}

        r = await client.get("/api/workspace/session", headers=S)
        check("GET session (sourcer)", r.status_code == 200, f"HTTP {r.status_code}")
        src_session = r.json() if r.status_code == 200 else {}

        r = await client.get("/api/workspace/session", headers=P)
        check("portal student is locked out", r.status_code == 403, f"HTTP {r.status_code}")

        if admin_session and src_session:
            an, sn = len(admin_session["nav"]), len(src_session["nav"])
            check("admin sees more nav than sourcer", an > sn, f"{an} vs {sn}")
            check("sourcer cannot see users", "users" not in src_session["nav"])
            check("sourcer has no rates cap", src_session["caps"]["rates"] is False)
            check("admin has rates cap", admin_session["caps"]["rates"] is True)
            check("personas list is populated", len(admin_session["personas"]) == 8,
                  str(len(admin_session["personas"])))
            check("calling window present", "callingWindow" in admin_session["settings"])

        # --- every screen's primary GET, as admin -------------------------
        gets = [
            ("personas", "/api/workspace/personas"),
            ("settings", "/api/workspace/settings"),
            ("taxonomy", "/api/workspace/taxonomy"),
            ("requisitions", "/api/workspace/requisitions"),
            ("clients", "/api/workspace/clients"),
            ("submissions", "/api/workspace/submissions"),
            ("interviews", "/api/workspace/interviews"),
            ("scorecards", "/api/workspace/scorecards"),
            ("offers", "/api/workspace/offers"),
            ("approvals", "/api/workspace/approvals"),
            ("tags", "/api/workspace/tags"),
            ("saved-searches", "/api/workspace/saved-searches"),
            ("templates", "/api/workspace/templates"),
            ("tasks", "/api/workspace/tasks"),
            ("notifications", "/api/workspace/notifications"),
            ("users", "/api/workspace/users"),
            ("audit", "/api/workspace/audit"),
            ("compliance", "/api/workspace/compliance"),
            ("erasures", "/api/workspace/erasures"),
            ("hiring candidates", "/api/hiring/candidates?pageSize=5"),
            ("hiring dashboard", "/api/hiring/dashboard"),
            ("call queue", "/api/calls/queue?pageSize=5"),
            ("call logs", "/api/calls?pageSize=5"),
            ("call stats", "/api/calls/stats"),
        ]
        for name, url in gets:
            r = await client.get(url, headers=A)
            check(f"GET {name}", r.status_code == 200, f"HTTP {r.status_code} {r.text[:110]}")

        # --- writes, then verify they read back ---------------------------
        r = await client.post(
            "/api/workspace/requisitions",
            headers=A,
            json={"title": "Smoke SRE", "priority": "P1", "openings": 2,
                  "location": "Pune", "billRate": "₹1,60,000"},
        )
        check("POST requisition", r.status_code in (200, 201), f"HTTP {r.status_code} {r.text[:110]}")
        req_id = r.json().get("id") if r.status_code in (200, 201) else None

        if req_id:
            r = await client.get(f"/api/workspace/requisitions/{req_id}", headers=A)
            check("GET requisition (admin sees bill rate)",
                  r.status_code == 200 and r.json().get("billRate") == "₹1,60,000",
                  f"HTTP {r.status_code} billRate={r.json().get('billRate') if r.status_code == 200 else '?'}")

            r = await client.get(f"/api/workspace/requisitions/{req_id}", headers=S)
            withheld = r.status_code == 200 and not r.json().get("billRate")
            check("sourcer cannot see bill rate", withheld,
                  f"HTTP {r.status_code} billRate={r.json().get('billRate') if r.status_code == 200 else '?'}")

        r = await client.post(
            "/api/workspace/tasks", headers=A,
            json={"title": "Smoke task", "detail": "created by smoke test"},
        )
        check("POST task", r.status_code in (200, 201), f"HTTP {r.status_code} {r.text[:110]}")

        r = await client.post(
            "/api/workspace/templates", headers=A,
            json={"name": "Smoke template", "channel": "whatsapp", "body": "Hi {{name}}"},
        )
        check("POST template", r.status_code in (200, 201), f"HTTP {r.status_code} {r.text[:110]}")

        r = await client.post(
            "/api/workspace/tags", headers=A,
            json={"name": "smoke-tag", "kind": "skill"},
        )
        check("POST tag", r.status_code in (200, 201), f"HTTP {r.status_code} {r.text[:110]}")

        # sourcer must not be able to create a requisition (reqs: none)
        r = await client.post(
            "/api/workspace/requisitions", headers=S, json={"title": "Should be refused"},
        )
        check("sourcer cannot create requisition", r.status_code == 403, f"HTTP {r.status_code}")

        # sourcer must not be able to list users (admin only)
        r = await client.get("/api/workspace/users", headers=S)
        check("sourcer cannot list users", r.status_code == 403, f"HTTP {r.status_code}")

        # settings write is admin-only
        r = await client.patch(
            "/api/workspace/settings", headers=S, json={"retentionMonths": 1},
        )
        check("sourcer cannot change settings", r.status_code == 403, f"HTTP {r.status_code}")

        # The FE sends the window nested, mirroring how it is read back.
        r = await client.patch(
            "/api/workspace/settings", headers=A,
            json={"callingWindow": {"openHour": 10, "closeHour": 19, "days": [1, 2, 3, 4, 5]}},
        )
        check("PATCH settings (admin)", r.status_code == 200, f"HTTP {r.status_code} {r.text[:110]}")

        r = await client.get("/api/workspace/session", headers=A)
        cw = r.json()["settings"]["callingWindow"] if r.status_code == 200 else {}
        check("nested calling window persisted",
              cw.get("openHour") == 10 and cw.get("closeHour") == 19 and cw.get("days") == [1, 2, 3, 4, 5],
              str(cw))

        # Day 0 is not an ISO weekday — this must be refused, not silently stored.
        r = await client.patch(
            "/api/workspace/settings", headers=A,
            json={"callingWindow": {"days": [0, 1, 2]}},
        )
        check("day 0 is rejected", r.status_code == 400, f"HTTP {r.status_code}")

        # An unknown key must 422 rather than return 200 having changed nothing.
        r = await client.patch(
            "/api/workspace/settings", headers=A, json={"noSuchSetting": 1},
        )
        check("unknown settings key is rejected", r.status_code == 422, f"HTTP {r.status_code}")

        # A window that opens after it closes is refused even when only one end moves.
        r = await client.patch(
            "/api/workspace/settings", headers=A, json={"openHour": 22},
        )
        check("open-after-close is rejected", r.status_code == 400, f"HTTP {r.status_code}")

        r = await client.get("/api/workspace/settings", headers=A)
        cw = r.json()["callingWindow"] if r.status_code == 200 else {}
        check("rejected writes left the window untouched",
              cw.get("openHour") == 10 and cw.get("days") == [1, 2, 3, 4, 5], str(cw))

        # --- the hiring + calls routers now admit personas, not just admins ---
        r = await client.get("/api/hiring/candidates?pageSize=5", headers=S)
        check("sourcer can read the candidate list", r.status_code == 200, f"HTTP {r.status_code}")

        r = await client.get("/api/hiring/candidates?pageSize=5", headers=P)
        check("portal student still refused candidates", r.status_code == 403, f"HTTP {r.status_code}")

        r = await client.get("/api/calls/stats", headers=S)
        check("sourcer can read call stats", r.status_code == 200, f"HTTP {r.status_code}")

        r = await client.get("/api/calls/stats", headers=P)
        check("portal student still refused calls", r.status_code == 403, f"HTTP {r.status_code}")

        # p1 holds reqs='view' — truthy as a string, but read-only in meaning.
        r = await client.post("/api/hiring/roles", headers=S, json={"id": "nope", "name": "Nope"})
        check("reqs='view' cannot create a hiring role", r.status_code == 403, f"HTTP {r.status_code}")

        # --- PII masking and the write-back guard -------------------------
        r = await client.post("/api/hiring/roles", headers=A, json={"id": "smoke_role", "name": "Smoke role"})
        check("admin can create a hiring role", r.status_code in (200, 201), f"HTTP {r.status_code} {r.text[:110]}")

        r = await client.post(
            "/api/hiring/candidates", headers=A,
            json={"id": "smoke_cand", "roleId": "smoke_role", "name": "Priya Menon",
                  "phone": "9876543210", "email": "priya@example.com"},
        )
        check("admin can create a candidate", r.status_code in (200, 201), f"HTTP {r.status_code} {r.text[:110]}")

        r = await client.get("/api/hiring/candidates/smoke_cand", headers=A)
        raw = r.json() if r.status_code == 200 else {}
        check("admin sees the real phone", raw.get("phone") == "9876543210", str(raw.get("phone")))
        check("admin response is not flagged masked", raw.get("piiMasked") is False, str(raw.get("piiMasked")))

        # The list path serialises differently from the detail path, and an
        # empty list would exercise neither — so assert against a real row.
        r = await client.get("/api/hiring/candidates?pageSize=5", headers=A)
        listed = r.json().get("items", []) if r.status_code == 200 else []
        check("candidate list serialises a real row", r.status_code == 200 and len(listed) == 1,
              f"HTTP {r.status_code} n={len(listed)} {r.text[:110]}")
        check("listed row carries the phone", listed and listed[0].get("phone") == "9876543210",
              str(listed[0].get("phone") if listed else "-"))

        # p5 (Account Manager) holds db: limitedPII.
        r = await client.patch("/api/workspace/users/u-src", headers=A, json={"persona": "p5"})
        check("admin can change a persona", r.status_code == 200, f"HTTP {r.status_code} {r.text[:110]}")
        am_tok = await token(client, "sourcer@smoke.example")
        M = {"Authorization": f"Bearer {am_tok}"}

        r = await client.get("/api/hiring/candidates?pageSize=5", headers=M)
        masked_list = r.json().get("items", []) if r.status_code == 200 else []
        check("the list is masked too, not just the detail",
              bool(masked_list) and masked_list[0].get("piiMasked") is True
              and "9876543210" not in str(masked_list[0].get("phone")),
              str(masked_list[0].get("phone") if masked_list else "-"))

        r = await client.get("/api/hiring/candidates/smoke_cand", headers=M)
        masked = r.json() if r.status_code == 200 else {}
        check("limitedPII role gets a masked phone",
              masked.get("phone") not in (None, "9876543210") and "9876543210" not in str(masked.get("phone")),
              str(masked.get("phone")))
        check("limitedPII role gets a masked email",
              "priya@example.com" != masked.get("email"), str(masked.get("email")))
        check("masked response says so", masked.get("piiMasked") is True, str(masked.get("piiMasked")))
        check("masked response keeps the name", masked.get("name") == "Priya Menon", str(masked.get("name")))

        # Echoing the masked value back must not overwrite the real number.
        r = await client.patch(
            "/api/hiring/candidates/smoke_cand", headers=M,
            json={"phone": masked.get("phone")},
        )
        check("masked role cannot write contact details back", r.status_code == 403, f"HTTP {r.status_code}")

        r = await client.get("/api/hiring/candidates/smoke_cand", headers=A)
        check("real phone survived the attempt",
              r.json().get("phone") == "9876543210" if r.status_code == 200 else False,
              str(r.json().get("phone") if r.status_code == 200 else r.status_code))

        # p5 holds create: False and stage: False — neither edit is allowed.
        r = await client.patch("/api/hiring/candidates/smoke_cand", headers=M, json={"city": "Kochi"})
        check("role without `create` cannot edit a candidate", r.status_code == 403, f"HTTP {r.status_code}")

        r = await client.patch("/api/hiring/candidates/smoke_cand", headers=M, json={"status": "reviewing"})
        check("role without `stage` cannot move the candidate", r.status_code == 403, f"HTTP {r.status_code}")

        # p1 (Recruiter) holds stage: True — the same move must now succeed.
        r = await client.patch("/api/workspace/users/u-src", headers=A, json={"persona": "p1"})
        check("persona switched back to p1", r.status_code == 200, f"HTTP {r.status_code}")
        rec_tok = await token(client, "sourcer@smoke.example")
        R1 = {"Authorization": f"Bearer {rec_tok}"}

        r = await client.patch("/api/hiring/candidates/smoke_cand", headers=R1, json={"status": "reviewing"})
        check("role with `stage` can move the candidate", r.status_code == 200, f"HTTP {r.status_code} {r.text[:110]}")
        check("p1 is not PII-masked", r.json().get("phone") == "9876543210" if r.status_code == 200 else False,
              str(r.json().get("phone") if r.status_code == 200 else "-"))

        # --- the new workspace columns round-trip -------------------------
        r = await client.patch(
            "/api/hiring/candidates/smoke_cand", headers=A,
            json={"consentAt": "2026-08-06T09:30:00", "consentChannel": "call",
                  "currentCtc": 18.5, "expectedCtc": 26.0, "noticeDays": 60,
                  "buyout": True, "dnc": False, "source": "Naukri"},
        )
        check("workspace columns accept a write", r.status_code == 200, f"HTTP {r.status_code} {r.text[:140]}")
        got = r.json() if r.status_code == 200 else {}
        check("consentAt round-trips", str(got.get("consentAt", "")).startswith("2026-08-06T09:30"), str(got.get("consentAt")))
        check("ctc round-trips", got.get("currentCtc") == 18.5 and got.get("expectedCtc") == 26.0,
              f"{got.get('currentCtc')} / {got.get('expectedCtc')}")
        check("notice + buyout round-trip", got.get("noticeDays") == 60 and got.get("buyout") is True,
              f"{got.get('noticeDays')} / {got.get('buyout')}")
        check("source round-trips", got.get("source") == "Naukri", str(got.get("source")))

        r = await client.get("/api/workspace/compliance", headers=A)
        comp = r.json() if r.status_code == 200 else {}
        check("compliance counts the recorded consent", comp.get("withConsent", 0) >= 1, str(comp))

        r = await client.patch(
            "/api/hiring/candidates/smoke_cand", headers=A, json={"consentAt": "not-a-date"},
        )
        check("a bad timestamp is refused", r.status_code == 400, f"HTTP {r.status_code}")

        # --- "partial" admin must not be a route to full admin -------------
        # p4 (Team Lead) holds admin: "partial" — a truthy string. Every route
        # that can widen someone's access has to check identity, not truthiness.
        r = await client.patch("/api/workspace/users/u-src", headers=A, json={"persona": "p4"})
        check("made the second account a Team Lead", r.status_code == 200, f"HTTP {r.status_code}")
        tl_tok = await token(client, "sourcer@smoke.example")
        TL = {"Authorization": f"Bearer {tl_tok}"}

        r = await client.get("/api/workspace/session", headers=TL)
        check("team lead holds admin='partial'",
              r.json()["caps"]["admin"] == "partial" if r.status_code == 200 else False,
              str(r.json()["caps"]["admin"] if r.status_code == 200 else "-"))

        r = await client.patch("/api/workspace/users/u-src", headers=TL, json={"persona": "p8"})
        check("partial admin cannot grant itself full Admin", r.status_code == 403, f"HTTP {r.status_code}")

        r = await client.get("/api/workspace/session", headers=TL)
        check("it is still a Team Lead afterwards",
              r.json()["personaId"] == "p4" if r.status_code == 200 else False,
              str(r.json()["personaId"] if r.status_code == 200 else "-"))

        r = await client.patch("/api/workspace/settings", headers=TL, json={"retentionMonths": 1})
        check("partial admin cannot change workspace settings", r.status_code == 403, f"HTTP {r.status_code}")

        r = await client.post("/api/workspace/users/invite", headers=TL,
                              json={"email": "nope@smoke.example", "persona": "p8", "tempPassword": "x" * 12})
        check("partial admin cannot invite anyone", r.status_code == 403, f"HTTP {r.status_code}")

        r = await client.get("/api/workspace/users", headers=TL)
        check("partial admin may still read the team roster", r.status_code == 200, f"HTTP {r.status_code}")

        r = await client.patch("/api/workspace/users/u-src", headers=A, json={"persona": "p1"})
        check("restored the second account to p1", r.status_code == 200, f"HTTP {r.status_code}")

        # --- self-service persona switch (the one-way-door guard) ---------
        r = await client.patch("/api/workspace/session/persona", headers=A, json={"persona": "p7"})
        check("admin can switch its own persona", r.status_code == 200, f"HTTP {r.status_code} {r.text[:110]}")
        check("the switch takes effect", r.json().get("personaId") == "p7" if r.status_code == 200 else False,
              str(r.json().get("personaId") if r.status_code == 200 else "-"))

        # p7 has admin: False. The user-management route is now closed to it...
        r = await client.patch("/api/workspace/users/u-src", headers=A, json={"persona": "p1"})
        check("switched-away admin loses user management", r.status_code == 403, f"HTTP {r.status_code}")

        # ...but switching back must still work, or the account is stranded.
        r = await client.patch("/api/workspace/session/persona", headers=A, json={"persona": "p8"})
        check("admin can switch back out of a low-privilege role",
              r.status_code == 200 and r.json().get("personaId") == "p8",
              f"HTTP {r.status_code} {r.json().get('personaId') if r.status_code == 200 else '-'}")

        r = await client.patch("/api/workspace/session/persona", headers=S, json={"persona": "p8"})
        check("a non-admin account cannot promote itself", r.status_code == 403, f"HTTP {r.status_code}")

        r = await client.patch("/api/workspace/session/persona", headers=A, json={"persona": "p99"})
        check("an unknown persona is refused", r.status_code == 400, f"HTTP {r.status_code}")

        # audit recorded the admin's writes
        r = await client.get("/api/workspace/audit?limit=50", headers=A)
        rows = r.json() if r.status_code == 200 else []
        check("audit captured the writes", len(rows) > 0, f"{len(rows)} entries")

    print()
    print(f"passed {len(PASSED)}   failed {len(FAILED)}")
    if FAILED:
        print("\nFailures:")
        for f in FAILED:
            print(f"  - {f}")
    print(f"\nthrowaway db: {DB_PATH}")
    return 1 if FAILED else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
