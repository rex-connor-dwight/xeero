create or replace view venture_room_unique_pending as
select distinct on (lower(email))
  id, full_name, email, phone, startup_name, role,
  ticket_code, payment_status, amount_ngn, created_at
from venture_room_registrations vr
where payment_status = 'pending'
  and not exists (
    select 1 from venture_room_registrations paid
    where lower(paid.email) = lower(vr.email)
    and paid.payment_status = 'paid'
  )
order by lower(email), created_at desc;