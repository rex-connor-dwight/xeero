alter table profiles add column if not exists plan_type text default 'free' check (plan_type in ('free', 'teams'));
alter table profiles add column if not exists plan_expires_at timestamp with time zone;

alter table payments drop constraint if exists payments_payment_type_check;
alter table payments add constraint payments_payment_type_check
  check (payment_type in ('subscription', 'commission', 'teams_annual'));