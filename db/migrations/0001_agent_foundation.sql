create extension if not exists pgcrypto;

create table if not exists knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  title text not null,
  authority text not null check (authority in ('legislation', 'planning_instrument', 'council', 'title', 'seller_verified')),
  access_tier text not null check (access_tier in ('public', 'registered', 'qualified')),
  jurisdiction text,
  canonical_url text,
  sharepoint_item_id text,
  review_owner text,
  review_due_at timestamptz,
  last_indexed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references knowledge_sources(id) on delete cascade,
  content_hash text not null,
  sharepoint_etag text,
  effective_from date,
  effective_to date,
  temporal_status text not null default 'current' check (temporal_status in ('current', 'historical', 'superseded')),
  indexed_at timestamptz,
  chunk_count integer not null default 0 check (chunk_count >= 0),
  created_at timestamptz not null default now(),
  unique (source_id, content_hash)
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  claim_key text not null unique,
  subject text not null,
  approved_wording text not null,
  spoken_wording text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'expired')),
  risk_level text not null default 'normal' check (risk_level in ('normal', 'planning', 'legal', 'privacy', 'financial')),
  approved_by text,
  approved_at timestamptz,
  review_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists claim_sources (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims(id) on delete cascade,
  source_id uuid not null references knowledge_sources(id) on delete cascade,
  source_version_id uuid references source_versions(id) on delete set null,
  page integer check (page is null or page > 0),
  clause text,
  excerpt text,
  created_at timestamptz not null default now(),
  unique (claim_id, source_id, source_version_id, page, clause)
);

create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running' check (status in ('running', 'succeeded', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  discovered_count integer not null default 0,
  changed_count integer not null default 0,
  indexed_count integer not null default 0,
  failed_count integer not null default 0,
  initiated_by text,
  created_at timestamptz not null default now()
);

create table if not exists ingestion_failures (
  id uuid primary key default gen_random_uuid(),
  ingestion_run_id uuid not null references ingestion_runs(id) on delete cascade,
  source_id uuid references knowledge_sources(id) on delete set null,
  source_key text,
  stage text not null,
  error_code text,
  error_message text not null,
  retryable boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  access_tier text not null default 'public' check (access_tier in ('public', 'registered', 'qualified')),
  status text not null default 'active' check (status in ('active', 'closed', 'handed_off')),
  channel text not null default 'chat' check (channel in ('chat', 'voice', 'avatar')),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  cited_evidence_ids jsonb not null default '[]'::jsonb,
  retrieval_ids jsonb not null default '[]'::jsonb,
  retained_with_consent boolean not null default false,
  expires_at timestamptz not null default (now() + interval '90 days'),
  created_at timestamptz not null default now()
);

create table if not exists citations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  source_id uuid references knowledge_sources(id) on delete set null,
  source_version_id uuid references source_versions(id) on delete set null,
  external_evidence_id text,
  page integer check (page is null or page > 0),
  clause text,
  excerpt text,
  created_at timestamptz not null default now()
);

create table if not exists buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  email text,
  name text,
  phone text,
  interests jsonb not null default '[]'::jsonb,
  conversation_summary text,
  access_tier text not null default 'public' check (access_tier in ('public', 'registered', 'qualified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists buyer_profiles_email_lower_idx
  on buyer_profiles (lower(email)) where email is not null;

create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  buyer_profile_id uuid not null references buyer_profiles(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  purpose text not null,
  policy_version text not null,
  granted boolean not null,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists handoffs (
  id uuid primary key default gen_random_uuid(),
  buyer_profile_id uuid not null references buyer_profiles(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'contacted', 'closed', 'declined')),
  reason text,
  summary text,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evaluation_cases (
  id uuid primary key default gen_random_uuid(),
  case_key text not null unique,
  category text not null,
  buyer_tier text not null default 'public' check (buyer_tier in ('public', 'registered', 'qualified')),
  prompt text not null,
  expected_behavior text not null,
  critical boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  model text,
  prompt_version text,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists evaluation_results (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references evaluation_runs(id) on delete cascade,
  evaluation_case_id uuid not null references evaluation_cases(id) on delete cascade,
  passed boolean not null,
  score numeric(5, 4) check (score is null or (score >= 0 and score <= 1)),
  failure_codes jsonb not null default '[]'::jsonb,
  answer_excerpt text,
  created_at timestamptz not null default now(),
  unique (evaluation_run_id, evaluation_case_id)
);

create index if not exists source_versions_source_created_idx on source_versions (source_id, created_at desc);
create index if not exists claims_status_review_idx on claims (status, review_due_at);
create index if not exists conversations_user_activity_idx on conversations (clerk_user_id, last_activity_at desc);
create index if not exists messages_conversation_created_idx on messages (conversation_id, created_at);
create index if not exists messages_expiry_idx on messages (expires_at) where retained_with_consent = false;
create index if not exists handoffs_status_created_idx on handoffs (status, created_at desc);
create index if not exists ingestion_failures_run_idx on ingestion_failures (ingestion_run_id, created_at);

insert into knowledge_sources (
  source_key, title, authority, access_tier, jurisdiction, canonical_url, review_owner
) values (
  'murrumbella-public-site',
  'Murrumbella property website',
  'seller_verified',
  'public',
  'NSW',
  '/',
  'Property owner'
) on conflict (source_key) do update set
  title = excluded.title,
  authority = excluded.authority,
  access_tier = excluded.access_tier,
  canonical_url = excluded.canonical_url,
  review_owner = excluded.review_owner,
  updated_at = now();

insert into claims (
  claim_key, subject, approved_wording, spoken_wording, status, risk_level,
  approved_by, approved_at, review_due_at
) values
  (
    'property-address',
    'Address',
    'Murrumbella is at 424 Horseshoe Road, Mullion NSW 2582.',
    'Murrumbella is at 424 Horseshoe Road in Mullion, New South Wales.',
    'approved', 'normal', 'Property owner', now(), now() + interval '180 days'
  ),
  (
    'property-area',
    'Area',
    'The property is approximately 406 acres, or 164 hectares.',
    'The property is approximately four hundred and six acres, or one hundred and sixty-four hectares.',
    'approved', 'normal', 'Property owner', now(), now() + interval '180 days'
  ),
  (
    'property-zoning',
    'Zoning',
    'The property is represented as RU1 Primary Production land in Yass Valley.',
    'The property is represented as RU1 Primary Production land in Yass Valley.',
    'approved', 'planning', 'Property owner', now(), now() + interval '90 days'
  ),
  (
    'dwelling-permitted-with-consent',
    'Dwelling pathway',
    'A dwelling is a permitted use in the RU1 zone subject to development consent; no dwelling approval is represented.',
    'A dwelling is a permitted use in the RU1 zone, subject to development consent. No dwelling approval is represented.',
    'approved', 'planning', 'Property owner', now(), now() + interval '90 days'
  )
on conflict (claim_key) do update set
  subject = excluded.subject,
  approved_wording = excluded.approved_wording,
  spoken_wording = excluded.spoken_wording,
  status = excluded.status,
  risk_level = excluded.risk_level,
  approved_by = excluded.approved_by,
  approved_at = excluded.approved_at,
  review_due_at = excluded.review_due_at,
  updated_at = now();

insert into claim_sources (claim_id, source_id, excerpt)
select c.id, s.id, c.approved_wording
from claims c
join knowledge_sources s on s.source_key = 'murrumbella-public-site'
where c.claim_key in (
  'property-address',
  'property-area',
  'property-zoning',
  'dwelling-permitted-with-consent'
)
and not exists (
  select 1 from claim_sources cs where cs.claim_id = c.id and cs.source_id = s.id
);
