alter table hiring_roles add column if not exists job_type text default 'full_time' check (job_type in ('full_time', 'part_time', 'contract', 'internship'));
alter table hiring_roles add column if not exists contract_duration_value integer;
alter table hiring_roles add column if not exists contract_duration_unit text check (contract_duration_unit in ('weeks', 'months', 'years') or contract_duration_unit is null);
alter table hiring_roles add column if not exists pay_frequency text default 'monthly' check (pay_frequency in ('hourly', 'weekly', 'monthly', 'yearly', 'fixed'));