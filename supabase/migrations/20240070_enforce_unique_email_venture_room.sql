-- Keep one row per email: prefer a paid row, otherwise the most recent attempt.
-- Delete every other duplicate.
with ranked as (
  select id,
    row_number() over (
      partition by lower(email)
      order by (payment_status = 'paid') desc, created_at desc
    ) as rn
  from venture_room_registrations
)
delete from venture_room_registrations
where id in (select id from ranked where rn > 1);

-- Now that duplicates are gone, enforce it going forward.
create unique index if not exists venture_room_registrations_email_unique
  on venture_room_registrations (lower(email));