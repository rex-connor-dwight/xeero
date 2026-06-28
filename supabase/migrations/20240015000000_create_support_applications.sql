create table support_applications (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  bank_name text not null,
  bank_code text not null,
  account_number text not null,
  account_name text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'declined')),
  subaccount_code text,
  decline_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table support_applications enable row level security;

-- Founder can view and create their own application
create policy "Owner can manage their application"
  on support_applications
  for all
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Service role only for approval/decline