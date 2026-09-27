-- Settle what `companies.is_client` means, and correct the rows already loaded.
--
-- It now reads: true  = an account the agency actually works with (a client),
--               false = a prospect imported from a directory (Google Maps and
--                       similar), desk-only and never on the public portal.
--
-- The three Google Maps imports wrote `true`, which is backwards under that
-- definition — and because /api/companies is unauthenticated and unfiltered,
-- it meant 2,668 scraped listings were being served publicly. This flips them
-- and marks the hand-entered accounts as real clients.
--
-- Idempotent: re-running changes nothing once the rows are correct.

-- Anything that came from a listing import is a prospect.
update public.companies
   set is_client = false
 where source is not null
   and is_client is distinct from false;

-- Everything else is an account someone entered deliberately.
update public.companies
   set is_client = true
 where source is null
   and is_client is distinct from true;

create index if not exists ix_companies_is_client on public.companies (is_client);
