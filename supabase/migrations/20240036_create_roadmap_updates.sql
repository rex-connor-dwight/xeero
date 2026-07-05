create table if not exists roadmap_updates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  status text not null check (status in ('shipped', 'next', 'planned')),
  created_at timestamp with time zone default now()
);

alter table roadmap_updates enable row level security;

create policy "Anyone authenticated can view roadmap updates"
  on roadmap_updates for select
  using (auth.uid() is not null);

create policy "Admin can insert roadmap updates"
  on roadmap_updates for insert
  with check (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update roadmap updates"
  on roadmap_updates for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can delete roadmap updates"
  on roadmap_updates for delete
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');