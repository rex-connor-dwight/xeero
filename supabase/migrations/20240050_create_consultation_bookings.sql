create table consultation_bookings (
  id uuid default gen_random_uuid() primary key,
  package_key text not null check (package_key in ('clarity', 'advisory_session', 'strategy_intensive', 'founder_intensive')),
  founder_name text not null,
  founder_email text not null,
  xeero_slug text,
  amount_usd numeric not null default 0,
  amount_ngn numeric,
  paystack_reference text unique,
  payment_status text not null default 'pending' check (payment_status in ('not_required', 'pending', 'confirmed')),
  booking_status text not null default 'awaiting_payment' check (booking_status in ('awaiting_payment', 'awaiting_booking', 'booked', 'completed', 'cancelled', 'rescheduled')),
  calendly_event_uri text,
  scheduled_at timestamp with time zone,
  notes text,
  follow_up_status text default 'none' check (follow_up_status in ('none', 'pending', 'sent', 'not_applicable')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table consultation_bookings enable row level security;

create policy "Anyone can create a booking"
  on consultation_bookings for insert
  with check (true);

create policy "Anyone can view their own booking by reference"
  on consultation_bookings for select
  using (true);

create policy "Admin can update bookings"
  on consultation_bookings for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can view all bookings"
  on consultation_bookings for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');