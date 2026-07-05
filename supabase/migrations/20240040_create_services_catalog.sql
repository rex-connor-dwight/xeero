create table services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  icon_key text not null,
  status text not null default 'coming_soon' check (status in ('available', 'coming_soon')),
  category text,
  route text,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

alter table services enable row level security;

create policy "Anyone authenticated can view services"
  on services for select
  using (auth.uid() is not null);

create policy "Admin can manage services"
  on services for insert
  with check (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update services"
  on services for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can delete services"
  on services for delete
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create table service_interest (
  id uuid default gen_random_uuid() primary key,
  service_id uuid references services(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(service_id, profile_id)
);

alter table service_interest enable row level security;

create policy "Founder can register interest"
  on service_interest for insert
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create policy "Founder can view their own interest"
  on service_interest for select
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create policy "Admin can view all interest"
  on service_interest for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

-- Seed initial catalog
insert into services (name, description, icon_key, status, category, route, display_order) values
('Incorporate Now, Pay Later', 'Register your company in Nigeria, Ghana, or Delaware. We front the cost, you pay over 6-12 months.', 'building', 'available', 'legal', '/dashboard/services/incorporate', 1),
('Corporate Bank Account Setup', 'Fast-tracked business bank account through our partner network.', 'landmark', 'coming_soon', 'banking', null, 2),
('Legal Essentials', 'Shareholder agreements, vesting schedules, NDAs, and employment contracts.', 'scale', 'coming_soon', 'legal', null, 3),
('Dev Team Matching', 'Get matched with vetted development teams to build your MVP.', 'code', 'coming_soon', 'talent', null, 4),
('Co-founder Matching', 'Find a co-founder based on skills, industry, and stage.', 'users', 'coming_soon', 'talent', null, 5),
('Investor Matchmaking', 'Get matched with relevant investors based on stage and sector.', 'trending-up', 'coming_soon', 'funding', null, 6),
('Distribution & Growth', 'Connect with growth partners and marketing freelancers.', 'megaphone', 'coming_soon', 'growth', null, 7),
('Bookkeeping & Tax Compliance', 'Monthly bookkeeping and annual filing with a vetted accountant.', 'calculator', 'coming_soon', 'finance', null, 8);