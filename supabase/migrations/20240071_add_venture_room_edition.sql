-- Editions: every registration belongs to a city edition (lagos, abuja, ...).
-- Stored as free text so adding a new city needs no schema change.

-- 1. Add the column. Every existing row is a Lagos registration.
alter table public.venture_room_registrations
  add column edition text not null default 'lagos';

-- Future inserts must name their edition explicitly (existing rows keep 'lagos').
alter table public.venture_room_registrations
  alter column edition drop default;

-- 2. One registration per email per edition (case-insensitive).
drop index if exists public.venture_room_registrations_email_unique;

create unique index venture_room_registrations_email_edition_unique
  on public.venture_room_registrations (lower(email), edition);

-- 3. Pending view, now per edition. A Lagos payment no longer hides an Abuja pending row.
create or replace view public.venture_room_unique_pending as
  select distinct on (lower(vr.email), vr.edition)
    vr.id,
    vr.full_name,
    vr.email,
    vr.phone,
    vr.startup_name,
    vr.role,
    vr.ticket_code,
    vr.payment_status,
    vr.amount_ngn,
    vr.created_at,
    vr.edition
  from public.venture_room_registrations vr
  where vr.payment_status = 'pending'
    and not exists (
      select 1
      from public.venture_room_registrations paid
      where lower(paid.email) = lower(vr.email)
        and paid.edition = vr.edition
        and paid.payment_status = 'paid'
    )
  order by lower(vr.email), vr.edition, vr.created_at desc;

-- 4. Scope venture coupons to an edition. NULL means a normal (non-venture) coupon.
alter table public.coupons add column edition text;

update public.coupons
  set edition = 'lagos'
  where code in ('VENTURETEST', 'VENTURE90', 'VENTURE40', 'VENTUREFREE');
