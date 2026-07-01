create table opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image_url text,
  cta_label text not null,
  cta_url text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  target text default 'all' check (target in ('all', 'live', 'draft')),
  published boolean default false,
  created_at timestamp with time zone default now()
);

alter table opportunities enable row level security;

-- Anyone authenticated can read active opportunities
create policy "Authenticated users can view active opportunities"
  on opportunities for select
  using (
    auth.uid() is not null
    and published = true
    and end_date > now()
  );

-- Only service role can insert/update (via edge function)