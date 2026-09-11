create table venture_room_registrations (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  phone text,
  startup_name text,
  role text,
  profile_id uuid references profiles(id) on delete set null,
  ticket_code text unique not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  paystack_reference text,
  amount_ngn numeric default 25000,
  checked_in boolean default false,
  checked_in_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table venture_room_registrations enable row level security;

create policy "Anyone can register"
  on venture_room_registrations for insert
  with check (true);

create policy "Admin can view all registrations"
  on venture_room_registrations for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update registrations"
  on venture_room_registrations for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');