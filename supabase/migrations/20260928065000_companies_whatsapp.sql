-- A business WhatsApp number, separate from the landline.
--
-- Blank means "use `phone` if it looks like a mobile", which is how the desk
-- decides whether to offer a WhatsApp action — the same Indian-mobile heuristic
-- the Candidates screen already uses. The BE adds this column on boot too, via
-- app/migrations.py; this file keeps a pure-SQL deploy in step.

alter table public.companies add column if not exists whatsapp varchar;
