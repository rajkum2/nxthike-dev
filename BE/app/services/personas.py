"""
Persona resolution and capability gating for the recruiting workspace.

The design shows and hides navigation per persona. A hidden nav item is a
courtesy, not a control — so every capability the UI reads from here is also
checked here, server-side, before the data leaves the building.

Access model, deliberately conservative:

* `role == "admin"`      → full workspace access (persona defaults to p8).
* `persona` set          → workspace access with that persona's capabilities.
* anything else          → 403.

That last line matters: the portal's `student` and `employer` accounts must not
gain sight of candidate PII just because the workspace grew new endpoints. They
stay locked out exactly as they are today until an admin assigns them a persona.
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, HTTPException, status

from app.models.user import User
from app.models.workspace import PERSONA_BY_ID, resolve_persona
from app.services.auth import get_current_user


@dataclass(frozen=True)
class WorkspaceIdentity:
    """The signed-in user, plus the capabilities their persona grants."""

    user: User
    persona_id: str
    persona_name: str
    mode: str
    landing: str
    home: str
    caps: dict

    # -- capability helpers -------------------------------------------------

    def cap(self, name: str):
        return self.caps.get(name)

    def can(self, name: str) -> bool:
        """
        Truthy capability check. `'config'` and `'ifPanel'` count as yes.

        The enum capabilities carry `'none'` for "not allowed", and a non-empty
        string is truthy in Python — so it has to be excluded explicitly, or
        `can('reqs')` would return True for a role that holds `reqs: 'none'`.
        """
        value = self.caps.get(name)
        if value == "none":
            return False
        return bool(value)

    @property
    def is_admin(self) -> bool:
        return self.caps.get("admin") is True

    @property
    def masks_pii(self) -> bool:
        """
        Roles that may see a candidate but not their contact details.

        `ownInterviews` is included because an interviewer neither dials nor
        logs calls — a phone number would serve no purpose their role has.
        """
        return self.caps.get("db") in ("limitedPII", "ownReqs", "ownInterviews")

    @property
    def sees_rates(self) -> bool:
        return bool(self.caps.get("rates"))

    @property
    def name(self) -> str:
        full = " ".join(x for x in [self.user.first_name, self.user.last_name] if x).strip()
        return full or self.user.email.split("@")[0]


async def get_workspace_user(user: User = Depends(get_current_user)) -> WorkspaceIdentity:
    """Resolve the caller's workspace identity, or refuse."""
    persona_assigned = getattr(user, "persona", None)
    is_admin_role = (user.role or "").lower() == "admin"

    if not persona_assigned and not is_admin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has no recruiting workspace access. Ask an admin to assign a persona.",
        )

    if (getattr(user, "status", "active") or "active").lower() == "suspended":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is suspended.")

    p = resolve_persona(persona_assigned, user.role)
    return WorkspaceIdentity(
        user=user,
        persona_id=p["id"],
        persona_name=p["name"],
        mode=p["mode"],
        landing=p["landing"],
        home=p["home"],
        caps=dict(p["caps"]),
    )


def require_cap(name: str, message: str | None = None):
    """
    Dependency factory gating an endpoint on a capability.

        @router.post("/offers", dependencies=[Depends(require_cap("approve"))])
    """

    async def _dep(me: WorkspaceIdentity = Depends(get_workspace_user)) -> WorkspaceIdentity:
        if not me.can(name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=message or f"Your role ({me.persona_name}) cannot {name}.",
            )
        return me

    return _dep


def require_cap_in(name: str, allowed: tuple[str, ...], message: str | None = None):
    """
    Dependency factory for the enum capabilities, where truthiness is not the
    question — `reqs` of `'view'` is truthy but must not permit a write.

        Depends(require_cap_in("reqs", ("all", "own")))
    """

    async def _dep(me: WorkspaceIdentity = Depends(get_workspace_user)) -> WorkspaceIdentity:
        if me.caps.get(name) not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=message or f"Your role ({me.persona_name}) cannot do this.",
            )
        return me

    return _dep


async def require_admin_workspace(
    me: WorkspaceIdentity = Depends(get_workspace_user),
) -> WorkspaceIdentity:
    """
    Any admin surface, including the Team Lead's `admin: "partial"`.

    Use this only for **reading**. Anything that changes who can do what must
    use `require_full_admin` — see the note there.
    """
    if not me.caps.get("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin capability required. Your role is {me.persona_name}.",
        )
    return me


async def require_full_admin(
    me: WorkspaceIdentity = Depends(get_workspace_user),
) -> WorkspaceIdentity:
    """
    `admin` exactly `True` — not the Team Lead's `"partial"`.

    `"partial"` is a truthy string, so a plain `if not caps["admin"]` check let
    a Team Lead through every admin route, including the one that assigns
    personas. That made "partial" a one-call route to full Admin, which is no
    limitation at all. Every route that can widen someone's access — persona,
    account status, invitations, workspace settings, the role matrix, erasure
    decisions — has to check identity, not truthiness.
    """
    if me.caps.get("admin") is not True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"This needs a full Admin role; yours is {me.persona_name}. "
                "Ask an admin to make the change."
            ),
        )
    return me


def mask_phone(phone: str | None) -> str | None:
    if not phone:
        return phone
    tail = phone.strip()[-3:]
    return f"••••• ••{tail}"


def mask_email(email: str | None) -> str | None:
    if not email or "@" not in email:
        return "•••••" if email else email
    local, _, domain = email.partition("@")
    tld = domain[domain.rfind(".") :] if "." in domain else ""
    return f"{local[:1]}•••••••@•••••{tld}"


def apply_pii_policy(payload: dict, me: WorkspaceIdentity) -> dict:
    """
    Mask contact details for roles that may see the record but not how to reach
    the person. Applied on the way out, so the raw value never reaches a client
    that is not entitled to it.
    """
    if not me.masks_pii:
        return payload
    out = dict(payload)
    if "phone" in out:
        out["phone"] = mask_phone(out.get("phone"))
    if "email" in out:
        out["email"] = mask_email(out.get("email"))
    out["piiMasked"] = True
    return out


def persona_catalogue() -> list[dict]:
    """The eight personas, for the persona switcher and the roles screen."""
    return [
        {
            "id": p["id"],
            "name": p["name"],
            "short": p["short"],
            "mode": p["mode"],
            "landing": p["landing"],
            "home": p["home"],
            "caps": p["caps"],
        }
        for p in PERSONA_BY_ID.values()
    ]
