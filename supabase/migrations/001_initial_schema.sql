-- ============================================================
-- AI Resume Builder — Initial Database Schema
-- ============================================================

-- Enable extensions
create extension if not exists "pgvector" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;

-- ============================================================
-- TABLES
-- ============================================================

-- user_profiles (links to auth.users)
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  location text,
  target_roles text[] default '{}',
  experience_years integer,
  avatar_url text,
  github_username text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- resumes
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_url text not null,
  parsed_text text,
  file_name text not null,
  created_at timestamptz default now()
);

-- jobs
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null default '',
  title text not null default '',
  description text not null,
  extracted_skills text[] default '{}',
  embedding vector(768),
  ats_report jsonb,
  created_at timestamptz default now()
);

-- resume_versions
create table public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete set null,
  job_id uuid not null references public.jobs(id) on delete cascade,
  ats_score real not null default 0,
  content_json jsonb not null,
  pdf_url text,
  changes_json jsonb,
  generated_at timestamptz default now()
);

-- applications
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  resume_version_id uuid references public.resume_versions(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','applied','screening','interview','offer','rejected','accepted')),
  applied_at timestamptz,
  interview_at timestamptz,
  offer_at timestamptz
);

-- user_skills (Knowledge Graph)
create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  category text not null default 'other' check (category in ('language','framework','tool','platform','database','concept','soft_skill','other')),
  sources_json jsonb not null default '[]',
  confidence real not null default 0.5 check (confidence >= 0 and confidence <= 1),
  verified boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, skill_name)
);

-- ai_cache
create table public.ai_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  prompt_hash text not null,
  response text not null,
  model text not null,
  tokens_used integer default 0,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

-- analytics_events
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}',
  created_at timestamptz default now()
);

-- agent_tasks (future hooks)
create table public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_type text not null,
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  input_data jsonb default '{}',
  output_data jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- agent_events (future hooks)
create table public.agent_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.agent_tasks(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}',
  created_at timestamptz default now()
);

-- agent_runs (future hooks)
create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.agent_tasks(id) on delete cascade,
  agent_type text not null,
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  started_at timestamptz,
  completed_at timestamptz
);

-- user_subscriptions
create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan text not null default 'free' check (plan in ('free','pro','premium')),
  resumes_used integer not null default 0,
  analyses_used integer not null default 0,
  period_start timestamptz default now(),
  period_end timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_resumes_user on public.resumes(user_id);
create index idx_jobs_user on public.jobs(user_id);
create index idx_resume_versions_job on public.resume_versions(job_id);
create index idx_applications_user on public.applications(user_id);
create index idx_applications_job on public.applications(job_id);
create index idx_user_skills_user on public.user_skills(user_id);
create index idx_user_skills_name on public.user_skills(skill_name);
create index idx_analytics_user on public.analytics_events(user_id);
create index idx_analytics_type on public.analytics_events(event_type);
create index idx_ai_cache_key on public.ai_cache(cache_key);
create index idx_ai_cache_expires on public.ai_cache(expires_at);
create index idx_agent_tasks_user on public.agent_tasks(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.user_profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.jobs enable row level security;
alter table public.resume_versions enable row level security;
alter table public.applications enable row level security;
alter table public.user_skills enable row level security;
alter table public.analytics_events enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_events enable row level security;
alter table public.agent_runs enable row level security;

-- user_profiles policies
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

-- resumes policies
create policy "Users can manage own resumes"
  on public.resumes for all
  using (auth.uid() = user_id);

-- jobs policies
create policy "Users can manage own jobs"
  on public.jobs for all
  using (auth.uid() = user_id);

-- user_skills policies
create policy "Users can manage own skills"
  on public.user_skills for all
  using (auth.uid() = user_id);

-- applications policies
create policy "Users can manage own applications"
  on public.applications for all
  using (auth.uid() = user_id);

-- analytics_events policies
create policy "Users can view own analytics"
  on public.analytics_events for all
  using (auth.uid() = user_id);

-- user_subscriptions policies
create policy "Users can view own subscription"
  on public.user_subscriptions for all
  using (auth.uid() = user_id);

-- agent_tasks policies
create policy "Users can manage own agent tasks"
  on public.agent_tasks for all
  using (auth.uid() = user_id);

-- agent_events: access through task ownership
create policy "Users can manage own agent events"
  on public.agent_events for all
  using (
    exists (
      select 1 from public.agent_tasks
      where agent_tasks.id = agent_events.task_id
        and agent_tasks.user_id = auth.uid()
    )
  );

-- agent_runs: access through task ownership
create policy "Users can manage own agent runs"
  on public.agent_runs for all
  using (
    exists (
      select 1 from public.agent_tasks
      where agent_tasks.id = agent_runs.task_id
        and agent_tasks.user_id = auth.uid()
    )
  );

-- resume_versions: access through job ownership
create policy "Users can manage own resume versions"
  on public.resume_versions for all
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = resume_versions.job_id
        and jobs.user_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile and subscription on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  insert into public.user_subscriptions (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.update_updated_at();

create trigger update_user_skills_updated_at
  before update on public.user_skills
  for each row execute procedure public.update_updated_at();
