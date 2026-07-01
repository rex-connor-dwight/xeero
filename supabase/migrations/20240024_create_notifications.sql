create table notifications (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  type text not null default 'opportunity',
  title text not null,
  body text not null,
  image_url text,
  cta_label text,
  cta_url text,
  read boolean default false,
  created_at timestamp with time zone default now()
);

alter table notifications enable row level security;

-- Founder can view and update their own notifications
create policy "Owner can view their notifications"
  on notifications for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

create policy "Owner can mark notifications as read"
  on notifications for update
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Service role inserts
create policy "Anyone can insert notifications"
  on notifications for insert
  with check (true);