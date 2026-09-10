-- Builds out the 6 database-backed items from Anthony's feature roadmap (see project memory,
-- "Anthony's feature roadmap" section, 2026-08-14) ahead of the Sep 2026 handoff:
--   1. Per-site custom risk thresholds (TARP) + per-pool pH correction method
--   2. Microbiology test logging (lab-turnaround pass/fail — genuinely different workflow to water_tests)
--   3. Corrective actions (punch-list, owner/priority/status workflow)
--   4. Risk register (AS/NZS ISO 31000-style inherent/residual scoring)
--   5. Site emergency contact tree
--   6. Generic image/file attachments (incidents + asset service log to start)
-- LSI/dosing calculator UI and WQRMP document generation are pure frontend — no schema needed.

-- ─── 1. Per-pool overrides ─────────────────────────────────────────────────────
-- classifyRisk()/calculateDoses() (lib/water-chemistry.ts) read from a hardcoded RANGES object,
-- not water_test_targets — same architecture gap already flagged. Rather than the larger
-- rearchitecture (making water_test_targets the live source of truth for every parameter), this
-- adds a narrower, immediately-actionable override: a site's real closure standard often differs
-- from the codebase's generic absolute-red thresholds (e.g. this WQRMP closes at FC < 2.0, not
-- the hardcoded < 0.5), and the correction method for pH-down varies by site (acid vs CO2 dosing).
alter table pools add column if not exists ph_correction_method text not null default 'acid'
  check (ph_correction_method in ('acid', 'co2'));
alter table pools add column if not exists close_threshold_free_chlorine numeric;  -- null = use codebase default (0.5)
alter table pools add column if not exists close_threshold_ph_low numeric;         -- null = use codebase default (6.8)
alter table pools add column if not exists close_threshold_ph_high numeric;        -- null = use codebase default (8.2)

-- ─── 2. Microbiology test logging ──────────────────────────────────────────────
create table if not exists microbiology_tests (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  sample_taken_by uuid references staff(id),
  sample_taken_at timestamptz not null default now(),
  test_type text not null check (test_type in ('e_coli', 'pseudomonas_aeruginosa', 'hcc', 'legionella', 'other')),
  lab_name text,
  lab_reference text,
  result_value numeric,
  result_unit text default 'cfu/100ml',
  pass_fail text check (pass_fail in ('pending', 'pass', 'fail')) default 'pending',
  result_received_at timestamptz,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_microbiology_pool on microbiology_tests(pool_id);
create index if not exists idx_microbiology_status on microbiology_tests(pass_fail);

-- ─── 3. Corrective actions ──────────────────────────────────────────────────────
-- A real punch-list, distinct from compliance_events (which is recurring-obligation-shaped, not
-- task-shaped) — the WQRMP's own CA-01..CA-09 items were previously shoehorned into
-- compliance_events, which has no owner/priority workflow. This is the proper home for those.
create table if not exists corrective_actions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  code text,                          -- e.g. "CA-01", matches the WQRMP's own numbering when sourced from one
  source text default 'internal' check (source in ('wqrmp', 'internal', 'audit', 'incident')),
  description text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  owner_staff_id uuid references staff(id),
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'overdue')),
  completed_at timestamptz,
  completed_by uuid references staff(id),
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_corrective_actions_pool on corrective_actions(pool_id);
create index if not exists idx_corrective_actions_status on corrective_actions(status);

-- ─── 4. Risk register ────────────────────────────────────────────────────────────
-- AS/NZS ISO 31000-style: inherent rating (before controls) vs residual rating (after controls
-- in place), each scored 1-5 likelihood x 1-5 consequence. Rating is computed in the app layer
-- (likelihood * consequence), not stored as a generated column, so re-scoring logic can change
-- without a migration.
create table if not exists risk_register_entries (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  code text,                          -- e.g. "R-01"
  hazard_description text not null,
  inherent_likelihood int check (inherent_likelihood between 1 and 5),
  inherent_consequence int check (inherent_consequence between 1 and 5),
  controls_in_place text,
  residual_likelihood int check (residual_likelihood between 1 and 5),
  residual_consequence int check (residual_consequence between 1 and 5),
  owner_staff_id uuid references staff(id),
  review_date date,
  status text not null default 'active' check (status in ('active', 'monitoring', 'closed')),
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_risk_register_pool on risk_register_entries(pool_id);

-- ─── 5. Emergency contact tree ───────────────────────────────────────────────────
create table if not exists pool_contacts (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  contact_type text not null check (contact_type in ('facility_manager', 'service_provider', 'gas_supplier', 'chemical_supplier', 'laboratory', 'electrical_hvac', 'emergency_services', 'other')),
  name text not null,
  organisation text,
  phone text,
  email text,
  is_primary boolean default false,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_pool_contacts_pool on pool_contacts(pool_id);

-- ─── 6. Generic attachments ───────────────────────────────────────────────────────
-- entity_type/entity_id pattern rather than a table per feature — scope was explicitly unclear
-- from Anthony ("ask him what for"), so this starts wired into the two most obviously useful
-- spots (incidents, asset service log) and can extend to more entity types with zero schema change.
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('incident', 'asset_service_log', 'water_test', 'microbiology_test', 'corrective_action')),
  entity_id uuid not null,
  uploaded_by uuid references staff(id),
  file_url text not null,
  file_name text,
  caption text,
  created_at timestamptz default now()
);
create index if not exists idx_attachments_entity on attachments(entity_type, entity_id);

NOTIFY pgrst, 'reload schema';
