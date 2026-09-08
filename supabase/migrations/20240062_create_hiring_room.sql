create table hiring_roles (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  compensation_amount text,
  compensation_currency text default 'USD',
  is_equity_offered boolean default false,
  cutoff_score integer default 0,
  opens_at timestamp with time zone not null,
  closes_at timestamp with time zone not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'open', 'closed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table hiring_roles enable row level security;

create policy "Anyone can view open roles"
  on hiring_roles for select
  using (true);

create policy "Founder can manage their own roles"
  on hiring_roles for all
  using (profile_id in (select id from profiles where user_id = auth.uid()))
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Team members can manage roles for their startup"
  on hiring_roles for all
  using (profile_id in (select profile_id from team_profiles where user_id = auth.uid()))
  with check (profile_id in (select profile_id from team_profiles where user_id = auth.uid()));

create policy "Admin can view all roles"
  on hiring_roles for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');


create table hiring_screening_questions (
  id uuid default gen_random_uuid() primary key,
  role_id uuid references hiring_roles(id) on delete cascade not null,
  question_text text not null,
  question_type text not null check (question_type in ('yes_no', 'free_text')),
  correct_answer text check (correct_answer in ('yes', 'no') or correct_answer is null),
  display_order integer default 0
);

alter table hiring_screening_questions enable row level security;

create policy "Anyone can view questions for a role"
  on hiring_screening_questions for select
  using (true);

create policy "Founder can manage questions for their own roles"
  on hiring_screening_questions for all
  using (
    role_id in (
      select id from hiring_roles where profile_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  )
  with check (
    role_id in (
      select id from hiring_roles where profile_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

create policy "Team members can manage questions for their startup roles"
  on hiring_screening_questions for all
  using (
    role_id in (
      select id from hiring_roles where profile_id in (
        select profile_id from team_profiles where user_id = auth.uid()
      )
    )
  )
  with check (
    role_id in (
      select id from hiring_roles where profile_id in (
        select profile_id from team_profiles where user_id = auth.uid()
      )
    )
  );


create table hiring_applications (
  id uuid default gen_random_uuid() primary key,
  role_id uuid references hiring_roles(id) on delete cascade not null,
  applicant_name text not null,
  applicant_email text not null,
  resume_url text,
  score integer default 0,
  met_cutoff boolean default false,
  status text not null default 'new' check (status in ('new', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  created_at timestamp with time zone default now()
);

alter table hiring_applications enable row level security;

create policy "Anyone can submit an application"
  on hiring_applications for insert
  with check (true);

create policy "Founder can view applications for their own roles"
  on hiring_applications for select
  using (
    role_id in (
      select id from hiring_roles where profile_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

create policy "Founder can update applications for their own roles"
  on hiring_applications for update
  using (
    role_id in (
      select id from hiring_roles where profile_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

create policy "Team members can view applications for their startup roles"
  on hiring_applications for select
  using (
    role_id in (
      select id from hiring_roles where profile_id in (
        select profile_id from team_profiles where user_id = auth.uid()
      )
    )
  );

create policy "Team members can update applications for their startup roles"
  on hiring_applications for update
  using (
    role_id in (
      select id from hiring_roles where profile_id in (
        select profile_id from team_profiles where user_id = auth.uid()
      )
    )
  );

create policy "Admin can view all applications"
  on hiring_applications for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');


create table hiring_application_answers (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references hiring_applications(id) on delete cascade not null,
  question_id uuid references hiring_screening_questions(id) on delete cascade not null,
  answer_text text
);

alter table hiring_application_answers enable row level security;

create policy "Anyone can submit answers"
  on hiring_application_answers for insert
  with check (true);

create policy "Founder can view answers for their own roles"
  on hiring_application_answers for select
  using (
    application_id in (
      select id from hiring_applications where role_id in (
        select id from hiring_roles where profile_id in (
          select id from profiles where user_id = auth.uid()
        )
      )
    )
  );

create policy "Team members can view answers for their startup roles"
  on hiring_application_answers for select
  using (
    application_id in (
      select id from hiring_applications where role_id in (
        select id from hiring_roles where profile_id in (
          select profile_id from team_profiles where user_id = auth.uid()
        )
      )
    )
  );