drop policy if exists "Admin can manage roadmap updates" on roadmap_updates;

create policy "Admin can insert roadmap updates"
  on roadmap_updates for insert
  with check (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update roadmap updates"
  on roadmap_updates for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can delete roadmap updates"
  on roadmap_updates for delete
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');