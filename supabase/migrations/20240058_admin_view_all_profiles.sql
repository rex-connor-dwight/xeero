create policy "Admin can view all profiles"
  on profiles for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');