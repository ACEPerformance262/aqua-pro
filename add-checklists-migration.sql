-- AquaPro — Shift Checklists Migration
-- Run after supabase-schema.sql

-- ─── SHIFT CHECKLISTS ────────────────────────────────────────────────────────
-- One per shift (contains both pre-shift data and end-of-shift timestamp)
create table shift_checklists (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid references shifts(id) on delete set null,
  pool_id uuid not null references pools(id) on delete cascade,
  completed_by uuid references staff(id),
  checklist_date date not null default current_date,

  -- ── Pre-Shift ────────────────────────────────────────────────────────────
  pre_shift_time time,
  lifeguards_on_duty int,

  -- Basic operational checks
  keys_retrieved boolean,
  patrol_log_signed boolean,
  bumbag_retrieved boolean,
  pool_door_unlocked boolean,
  lights_on boolean,
  changerooms_opened boolean,

  -- Pool condition
  deck_perimeter_walk text check (deck_perimeter_walk in ('all_clear', 'issue', 'not_done')),
  deck_perimeter_notes text,
  water_clarity text check (water_clarity in ('great', 'good', 'fair', 'concern')),
  water_clarity_notes text,

  -- ── Safety Equipment ─────────────────────────────────────────────────────
  last_weekly_safety_check date,
  safety_equipment_check text check (safety_equipment_check in ('ok', 'fail', 'not_checked')),
  safety_equipment_notes text,
  throw_bags_count int,
  rescue_tubes_count int,
  spine_board_present boolean,
  first_aid_kit_ok boolean,

  -- ── Oxygen Equipment ─────────────────────────────────────────────────────
  last_weekly_oxygen_check date,
  oxygen_equipment_check text check (oxygen_equipment_check in ('ok', 'fail', 'not_checked')),
  oxygen_equipment_notes text,

  -- ── AED / Defibrillator ──────────────────────────────────────────────────
  last_weekly_aed_check date,
  aed_check text check (aed_check in ('ok', 'fail', 'not_checked')),
  aed_self_test text check (aed_self_test in ('pass', 'fail', 'not_tested')),
  aed_notes text,

  -- ── End of Shift ─────────────────────────────────────────────────────────
  end_of_shift_time time,

  -- Overall flags (any critical failures)
  has_flags boolean default false,
  flag_summary text[],   -- e.g. ['AED self test failed', 'Water clarity concern']

  notes text,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── SHIFT SESSIONS ──────────────────────────────────────────────────────────
-- Multiple sessions per shift checklist (e.g. school swim, public swim, etc.)
create table shift_sessions (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references shift_checklists(id) on delete cascade,
  pool_id uuid not null references pools(id) on delete cascade,
  session_number int not null default 1,

  -- Session identification
  pool_users text,                      -- e.g. "ELTHAM College", "Public Swim", "Swim Club"
  start_time time not null,
  finish_time time,

  -- Staffing
  lifeguards_on_shift int,
  lifeguard_names text[],               -- ["Sandra Vander Pal", "John Smith"]

  -- External / client staff
  external_staff_on_duty int default 0,
  external_staff_names text[],          -- ["Tim Wadeson"]

  -- Safety observations
  reporting_required boolean default false,
  incident_description text,            -- if reporting_required = true
  rules_observed boolean default true,
  rules_notes text,                     -- if rules not observed

  -- Post-session close-up checks
  lane_ropes_replaced boolean,
  deck_perimeter_walk boolean,
  changerooms_closed boolean,
  lights_off boolean,
  bumbag_returned boolean,
  keys_replaced boolean,

  notes text,
  created_at timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index idx_checklists_pool on shift_checklists(pool_id);
create index idx_checklists_date on shift_checklists(checklist_date desc);
create index idx_checklists_completed_by on shift_checklists(completed_by);
create index idx_checklists_flags on shift_checklists(has_flags);
create index idx_sessions_checklist on shift_sessions(checklist_id);
