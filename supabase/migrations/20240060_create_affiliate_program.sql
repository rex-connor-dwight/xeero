create table affiliate_links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null unique,
  referral_code text unique not null,
  created_at timestamp with time zone default now()
);

alter table affiliate_links enable row level security;

create policy "Founder can view their own referral link"
  on affiliate_links for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Founder can create their own referral link"
  on affiliate_links for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Anyone can look up a referral code"
  on affiliate_links for select
  using (true);

create policy "Admin can view all referral links"
  on affiliate_links for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');


create table affiliate_referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_profile_id uuid references profiles(id) on delete cascade not null,
  referred_profile_id uuid references profiles(id) on delete cascade not null unique,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'go_live_rewarded', 'teams_rewarded', 'fully_rewarded')),
  go_live_reward_usd numeric,
  teams_reward_usd numeric,
  go_live_rewarded_at timestamp with time zone,
  teams_rewarded_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table affiliate_referrals enable row level security;

create policy "Founder can view their own referrals"
  on affiliate_referrals for select
  using (referrer_profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Anyone can create a referral record"
  on affiliate_referrals for insert
  with check (true);

create policy "Admin can view all referrals"
  on affiliate_referrals for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update all referrals"
  on affiliate_referrals for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');


create table affiliate_payouts (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  amount_usd numeric not null,
  payout_method text check (payout_method in ('bank_transfer', 'paypal', 'account_credit', 'other')),
  payout_details text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  paid_at timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone default now()
);

alter table affiliate_payouts enable row level security;

create policy "Founder can view their own payouts"
  on affiliate_payouts for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Founder can set their payout preference"
  on affiliate_payouts for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Admin can view all payouts"
  on affiliate_payouts for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');

create policy "Admin can update all payouts"
  on affiliate_payouts for update
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');