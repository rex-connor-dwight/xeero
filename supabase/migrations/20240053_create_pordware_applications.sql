create table pordware_applications (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,

  status text not null default 'draft' check (status in (
    'draft', 'submitted', 'under_review', 'shortlisted', 'technical_assessment',
    'due_diligence', 'approved', 'rejected', 'waitlisted', 'development_in_progress', 'completed'
  )),
  current_step integer not null default 1,

  -- Step 1: Founder Information
  full_name text,
  email text,
  phone_number text,
  linkedin_url text,
  location text,
  founder_role text,
  number_of_founders integer,
  team_size text,

  -- Step 2: Startup Information
  startup_name text,
  website_url text,
  industry text,
  market_served text,
  startup_stage text,
  revenue_status text check (revenue_status in ('pre_revenue', 'early_revenue', 'revenue_generating') or revenue_status is null),
  revenue_amount text,
  customer_count text,
  funding_status text check (funding_status in ('bootstrapped', 'raised', 'raising') or funding_status is null),
  amount_raised_to_date text,
  currently_fundraising boolean,

  -- Step 3: Problem Validation
  problem_description text,
  who_experiences_problem text,
  current_solutions text,
  validation_method text,
  customers_spoken_to text,
  demand_evidence text,
  customers_paid_for_manual_version boolean,
  pre_revenue_demand_evidence text,

  -- Step 4: Current Business
  business_current_operations text,
  manual_processes text,
  scaling_blockers text,
  tech_improvement_area text,
  consequence_if_not_built text,

  -- Step 5: Technology Request
  technology_description text,
  why_needed_now text,
  current_alternative text,
  has_existing_mvp boolean,
  platforms_required text[],
  minimum_product_description text,
  success_90_days text,

  -- Step 6: Development Budget
  has_development_estimate boolean,
  estimated_total_cost numeric,
  founder_contribution_amount numeric,
  requested_pordware_amount numeric,
  existing_dev_team text,
  previous_development_work text,
  existing_codebase_assets text,

  -- Step 7: Business Model
  revenue_model text,
  current_pricing_model text,
  expected_change_after_tech text,
  expected_revenue_impact text,
  expected_cost_savings text,
  expected_capacity_increase text,

  -- Step 8: Validation Evidence (metadata; actual files in pordware_application_documents)
  evidence_notes text,

  -- Step 9: Founder Questions
  why_support_this text,
  what_built_without_tech text,
  customer_learning text,
  fallback_plan text,

  submitted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table pordware_applications enable row level security;

create policy "Founder can view their own application"
  on pordware_applications for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Founder can create their own application"
  on pordware_applications for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));