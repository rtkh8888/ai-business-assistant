create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum (
      'new',
      'reviewed',
      'ready',
      'contacted',
      'replied',
      'won',
      'lost'
    );
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  original_url text not null,
  normalized_url text not null unique,
  canonical_url text null,
  website_host text not null,
  business_name text not null default 'Unknown',
  industry text not null default 'Unknown',
  target_customer text not null default 'Unknown',
  business_summary text not null default 'Unknown',
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommended_service_key text not null default 'unknown',
  recommended_service_label text not null default 'Unknown',
  recommended_service_reason text not null default 'Unknown',
  outreach_message text not null default 'Unknown',
  opportunity_score integer not null default 0,
  score_explanation text not null default 'Unknown',
  status lead_status not null default 'new',
  last_analysis_id uuid null,
  reviewed_at timestamptz null,
  contacted_at timestamptz null,
  replied_at timestamptz null,
  won_at timestamptz null,
  lost_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_analyses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  analysis_status text not null check (analysis_status in ('processing', 'succeeded', 'failed')),
  analysis_version text not null default 'v1',
  prompt_version text not null default 'v1',
  model_provider text not null,
  model_name text not null,
  input_url text not null,
  extraction_json jsonb not null,
  rule_findings_json jsonb not null,
  llm_output_json jsonb not null,
  score integer not null default 0,
  score_explanation text not null default 'Unknown',
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads
  add constraint leads_last_analysis_id_fkey
  foreign key (last_analysis_id)
  references public.lead_analyses(id)
  on delete set null;

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_score_idx on public.leads(opportunity_score);
create index if not exists leads_updated_at_idx on public.leads(updated_at);
create index if not exists lead_analyses_lead_id_idx on public.lead_analyses(lead_id);
create index if not exists lead_analyses_status_idx on public.lead_analyses(analysis_status);
create index if not exists lead_analyses_created_at_idx on public.lead_analyses(created_at);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

drop trigger if exists lead_analyses_set_updated_at on public.lead_analyses;
create trigger lead_analyses_set_updated_at
before update on public.lead_analyses
for each row
execute function public.set_updated_at();
