-- Add new startup fields
alter table profiles
  add column if not exists website text,
  add column if not exists logo_url text,
  add column if not exists cover_url text,
  add column if not exists year_founded text,
  add column if not exists team_size text,
  add column if not exists funding_goal text,
  add column if not exists funding_stage text,
  add column if not exists deck_url text;

-- Add new founder CV fields
alter table profiles
  add column if not exists founder_photo_url text,
  add column if not exists founder_experience jsonb default '[]'::jsonb,
  add column if not exists founder_education jsonb default '[]'::jsonb,
  add column if not exists founder_achievements text,
  add column if not exists founder_previous_startups text,
  add column if not exists founder_skills text;