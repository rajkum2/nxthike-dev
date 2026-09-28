-- Merge client accounts that share a phone number.
--
-- The pet-store import (20260928000000) was the first listing load and deduped
-- on id only — name plus coordinates — so two branches of one business with
-- different coordinates but the same reception number both landed. Every later
-- import dedupes on phone as well, which is why all nine rows here come from
-- that first batch.
--
-- For each shared number the listing with the most Google reviews is kept, and
-- the others are folded into its notes so the alternate branch names and
-- addresses are not lost, then deleted. Nothing references these rows
-- (checked: no requisitions), so the delete is safe.
--
-- Idempotent: the notes append is guarded on its own marker, and the deletes
-- are no-ops once the rows are gone.

begin;

-- 8143874622 — Pet Cuddles, two branches
update public.companies
   set notes = coalesce(notes || ' | ', '') ||
       'Also listed at: Pet Cuddles, 1279 plot 2nd floor, Raja Rajeshwara Nagar, Kondapur [merged duplicate phone]'
 where id = 'gmaps_hyd_pet_pet_cuddles_f65b6d'
   and coalesce(notes, '') not like '%[merged duplicate phone]%';

-- 9121228809 — Scoopy Scrub, three branches
update public.companies
   set notes = coalesce(notes || ' | ', '') ||
       'Also listed at: Scoopy Scrub & Pet Bytes, H-No 7-1-1/191 MIG First Floor; '
       'and 3, GHMC No. 28/HIG A First floor, Gachibowli [merged duplicate phone]'
 where id = 'gmaps_hyd_pet_scoopy_scrub_pet_grooming_salon_270c36'
   and coalesce(notes, '') not like '%[merged duplicate phone]%';

-- 9347895645 — two differently named shops on one number
update public.companies
   set notes = coalesce(notes || ' | ', '') ||
       'Shares this number with: PET STATION HYD, 12-6-2/173 NH65, M J Colony, Kukatpally [merged duplicate phone]'
 where id = 'gmaps_hyd_pet_aman_s_pet_heart_c1c315'
   and coalesce(notes, '') not like '%[merged duplicate phone]%';

-- 9849493113 — the clinic and the vet listed separately
update public.companies
   set notes = coalesce(notes || ' | ', '') ||
       'Shares this number with: Prabhakar Dr Barka, Lig-42 Huda, Chandan Nagar [merged duplicate phone]'
 where id = 'gmaps_hyd_pet_b_g_pet_clinic_3fb6aa'
   and coalesce(notes, '') not like '%[merged duplicate phone]%';

delete from public.companies
 where id in (
   'gmaps_hyd_pet_pet_cuddles_26cc0d',
   'gmaps_hyd_pet_scoopy_scrub_pet_bytes_pet_grooming_salon_4f140f',
   'gmaps_hyd_pet_scoopy_scrub_pet_bytes_pet_grooming_salon_ab66b8',
   'gmaps_hyd_pet_pet_station_hyd_f1c92c',
   'gmaps_hyd_pet_prabhakar_dr_barka_65747f'
 );

commit;
