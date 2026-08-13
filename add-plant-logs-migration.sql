-- AquaPro — Plant Room Log Migration
-- Run after add-checklists-migration.sql

create table plant_logs (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  shift_id uuid references shifts(id) on delete set null,
  logged_by uuid references staff(id),
  logged_at timestamptz not null default now(),

  -- Pool condition
  water_clarity text check (water_clarity in ('great', 'good', 'fair', 'concern')),
  pool_floor_checked boolean,

  -- Maintenance tasks
  backwash_done boolean default false,
  lint_baskets_done boolean default false,
  sample_line_filter_done boolean default false,
  auto_vac_done boolean default false,
  dosing_done boolean default false,

  -- Controller readings (from the automated controller display)
  controller_status_ok boolean,
  controller_ph numeric,
  controller_fcl numeric,
  controller_tcl numeric,
  controller_ccl numeric,
  controller_temp_c numeric,
  co2_controller text check (co2_controller in ('auto', 'manual', 'off')),
  gas_detector_co2 text check (gas_detector_co2 in ('good', 'alarm', 'not_checked')),
  dulcomarin_alarm boolean default false,
  mechmate_alarm boolean default false,

  -- Circulation Pump 1
  cp1_status text check (cp1_status in ('on_auto', 'on_manual', 'off', 'fault')),
  cp1_pressure_gauge_ok boolean,
  cp1_pressure_psi numeric,

  -- Circulation Pump 2
  cp2_status text check (cp2_status in ('on_auto', 'on_manual', 'off', 'fault', 'na')),
  cp2_pressure_gauge_ok boolean,
  cp2_pressure_psi numeric,

  -- Heat pump / temp gauges
  heat_pump_status text check (heat_pump_status in ('on', 'off', 'fault', 'na')),
  temp_gauge_1_ok boolean,
  temp_gauge_2_ok boolean,

  -- Filter pressures
  filter_1_pressure_psi numeric,
  filter_2_pressure_psi numeric,

  -- Dosing pumps
  chlorine_dosing_pump text check (chlorine_dosing_pump in ('on_auto', 'on_manual', 'off', 'external_auto', 'na')),
  acid_dosing_pump text check (acid_dosing_pump in ('on_auto', 'on_manual', 'off', 'external_auto', 'na')),

  -- General
  general_leaks boolean default false,
  general_leaks_notes text,

  -- Photometric calibration flags (comparing controller vs manual readings)
  calibrate_fcl boolean default false,
  calibrate_tcl boolean default false,
  calibrate_ph boolean default false,

  notes text,
  created_at timestamptz default now()
);

-- Add controller + calibration columns to water_tests for side-by-side comparison
alter table water_tests
  add column if not exists controller_ph numeric,
  add column if not exists controller_fcl numeric,
  add column if not exists controller_tcl numeric,
  add column if not exists controller_ccl numeric,
  add column if not exists calibrate_fcl boolean,
  add column if not exists calibrate_tcl boolean,
  add column if not exists calibrate_ph boolean,
  add column if not exists water_clarity text,
  add column if not exists pool_floor_checked boolean,
  add column if not exists plant_log_id uuid references plant_logs(id);

create index idx_plant_logs_pool on plant_logs(pool_id);
create index idx_plant_logs_logged_at on plant_logs(logged_at desc);
create index idx_plant_logs_shift on plant_logs(shift_id);
