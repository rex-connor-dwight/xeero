create policy "Admin can view all applications"
  on pordware_applications for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update all applications"
  on pordware_applications for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');