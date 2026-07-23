create table account_deletion_requests (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  user_id uuid not null,
  reason text,
  requested_at timestamp with time zone default now(),
  scheduled_for timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending', 'cancelled', 'completed')),
  completed_at timestamp with time zone
);

alter table account_deletion_requests enable row level security;

create policy "Founder can view their own deletion request"
  on account_deletion_requests for select
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create policy "Founder can create their own deletion request"
  on account_deletion_requests for insert
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create policy "Founder can cancel their own pending request"
  on account_deletion_requests for update
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
    and status = 'pending'
  );

create policy "Admin can view all deletion requests"
  on account_deletion_requests for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update deletion requests"
  on account_deletion_requests for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');