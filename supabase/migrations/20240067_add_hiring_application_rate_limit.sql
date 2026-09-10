create or replace function check_hiring_application_rate_limit()
returns trigger as $$
declare
  recent_count integer;
begin
  -- Block more than 3 submissions from the same email to the same role within 10 minutes
  select count(*) into recent_count
  from hiring_applications
  where applicant_email = new.applicant_email
    and role_id = new.role_id
    and created_at > now() - interval '10 minutes';

  if recent_count >= 3 then
    raise exception 'Too many submissions. Please wait a few minutes before applying again.';
  end if;

  -- Block more than 10 submissions from the same email across ANY role within 1 hour
  select count(*) into recent_count
  from hiring_applications
  where applicant_email = new.applicant_email
    and created_at > now() - interval '1 hour';

  if recent_count >= 10 then
    raise exception 'Too many applications submitted recently. Please try again later.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists hiring_application_rate_limit on hiring_applications;
create trigger hiring_application_rate_limit
  before insert on hiring_applications
  for each row execute function check_hiring_application_rate_limit();