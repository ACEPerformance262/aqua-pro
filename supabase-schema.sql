-- AquaPro Database Schema
-- Single-company pool maintenance management system
-- Run against a fresh Supabase PostgreSQL project

-- ─── STAFF & AUTH ────────────────────────────────────────────────────────────

create table staff (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('admin', 'manager', 'technician', 'contractor')),
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── POOLS (the core entity) ──────────────────────────────────────────────────

create table pools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site_code text unique not null,          -- e.g. "AQ-001" for QR/IoT lookup
  address text not null,
  suburb text,
  state text,
  postcode text,
  pool_type text not null check (pool_type in ('indoor', 'outdoor', 'spa', 'wading', 'hydrotherapy', 'leisure')),
  sanitiser_type text not null check (sanitiser_type in ('chlorine', 'bromine', 'saltwater', 'uv_chlorine', 'ozone_chlorine', 'baquacil')),
  volume_litres numeric,
  surface_area_m2 numeric,
  max_bather_load int,
  pool_manager_id uuid references staff(id),   -- the on-site responsible person
  owner_name text,
  owner_email text,
  owner_phone text,
  is_commercial boolean default false,
  health_licence_number text,
  licence_expiry date,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- IoT sensor registration per pool
create table iot_sensors (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  sensor_key text unique not null,    -- secret key sent in ingest webhook
  device_type text,                   -- e.g. "WaterGuru", "Lovibond Checkit Connect", "custom"
  manufacturer text,
  serial_number text,
  installed_at timestamptz,
  last_seen_at timestamptz,
  is_active boolean default true,
  notes text
);

-- ─── WATER TESTING ───────────────────────────────────────────────────────────

create table water_tests (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  tested_by uuid references staff(id),
  test_source text not null default 'manual' check (test_source in ('manual', 'iot', 'pool_manager')),
  tested_at timestamptz not null default now(),

  -- Core parameters (all in ppm unless noted)
  free_chlorine numeric,
  combined_chlorine numeric,
  total_chlorine numeric,
  bromine numeric,
  ph numeric,
  total_alkalinity numeric,
  calcium_hardness numeric,
  cyanuric_acid numeric,
  total_dissolved_solids numeric,
  salt_level numeric,
  phosphates numeric,        -- ppb
  temperature_c numeric,
  turbidity numeric,         -- NTU
  langelier_saturation_index numeric,   -- calculated

  -- Risk classification (computed on insert by trigger or API)
  risk_level text check (risk_level in ('green', 'yellow', 'orange', 'red')),
  risk_flags text[],          -- array of parameter names that are out of range

  -- AI advice (fetched on demand, cached here)
  ai_advice text,
  ai_advice_generated_at timestamptz,

  notes text,
  created_at timestamptz default now()
);

-- Water test target ranges (configurable per pool type)
create table water_test_targets (
  id uuid primary key default gen_random_uuid(),
  pool_type text not null,
  sanitiser_type text not null,
  parameter text not null,
  min_value numeric not null,
  max_value numeric not null,
  ideal_value numeric,
  unit text default 'ppm',
  priority text default 'normal' check (priority in ('critical', 'high', 'normal')),
  unique (pool_type, sanitiser_type, parameter)
);

-- Seed default targets
insert into water_test_targets (pool_type, sanitiser_type, parameter, min_value, max_value, ideal_value, unit, priority) values
-- Chlorine outdoor
('outdoor', 'chlorine', 'free_chlorine', 1.0, 3.0, 2.0, 'ppm', 'critical'),
('outdoor', 'chlorine', 'ph', 7.2, 7.6, 7.4, 'pH', 'critical'),
('outdoor', 'chlorine', 'total_alkalinity', 80, 120, 100, 'ppm', 'high'),
('outdoor', 'chlorine', 'calcium_hardness', 200, 400, 300, 'ppm', 'normal'),
('outdoor', 'chlorine', 'cyanuric_acid', 30, 50, 40, 'ppm', 'high'),
('outdoor', 'chlorine', 'total_dissolved_solids', 0, 3000, 1500, 'ppm', 'normal'),
('outdoor', 'chlorine', 'combined_chlorine', 0, 0.2, 0.0, 'ppm', 'high'),
('outdoor', 'chlorine', 'phosphates', 0, 100, 0, 'ppb', 'normal'),
-- Saltwater outdoor
('outdoor', 'saltwater', 'free_chlorine', 1.0, 3.0, 2.0, 'ppm', 'critical'),
('outdoor', 'saltwater', 'ph', 7.2, 7.6, 7.4, 'pH', 'critical'),
('outdoor', 'saltwater', 'total_alkalinity', 80, 120, 100, 'ppm', 'high'),
('outdoor', 'saltwater', 'calcium_hardness', 200, 400, 300, 'ppm', 'normal'),
('outdoor', 'saltwater', 'cyanuric_acid', 30, 50, 40, 'ppm', 'high'),
('outdoor', 'saltwater', 'salt_level', 2700, 3400, 3000, 'ppm', 'high'),
('outdoor', 'saltwater', 'combined_chlorine', 0, 0.2, 0.0, 'ppm', 'high'),
-- Indoor chlorine (no CYA needed)
('indoor', 'chlorine', 'free_chlorine', 1.0, 3.0, 2.0, 'ppm', 'critical'),
('indoor', 'chlorine', 'ph', 7.2, 7.6, 7.4, 'pH', 'critical'),
('indoor', 'chlorine', 'total_alkalinity', 80, 120, 100, 'ppm', 'high'),
('indoor', 'chlorine', 'calcium_hardness', 200, 400, 300, 'ppm', 'normal'),
('indoor', 'chlorine', 'cyanuric_acid', 0, 0, 0, 'ppm', 'normal'),
('indoor', 'chlorine', 'combined_chlorine', 0, 0.2, 0.0, 'ppm', 'critical'),
-- Spa / hot tub
('spa', 'chlorine', 'free_chlorine', 3.0, 5.0, 4.0, 'ppm', 'critical'),
('spa', 'chlorine', 'ph', 7.2, 7.8, 7.5, 'pH', 'critical'),
('spa', 'chlorine', 'total_alkalinity', 80, 120, 100, 'ppm', 'high'),
('spa', 'chlorine', 'calcium_hardness', 150, 250, 200, 'ppm', 'normal'),
('spa', 'bromine', 'bromine', 3.0, 5.0, 4.0, 'ppm', 'critical'),
('spa', 'bromine', 'ph', 7.2, 7.8, 7.5, 'pH', 'critical'),
('spa', 'bromine', 'total_alkalinity', 80, 120, 100, 'ppm', 'high');

-- ─── STAFF SCHEDULING ────────────────────────────────────────────────────────

create table service_routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- e.g. "North Route", "CBD Route"
  assigned_technician_id uuid references staff(id),
  day_of_week int[],                -- 0=Sun … 6=Sat
  notes text,
  is_active boolean default true
);

create table route_pools (
  route_id uuid not null references service_routes(id) on delete cascade,
  pool_id uuid not null references pools(id) on delete cascade,
  visit_order int not null,
  service_frequency text default 'weekly' check (service_frequency in ('daily', 'weekly', 'fortnightly', 'monthly', 'on_demand')),
  primary key (route_id, pool_id)
);

create table shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id),
  pool_id uuid references pools(id),       -- null = office/admin shift
  route_id uuid references service_routes(id),
  shift_type text not null check (shift_type in ('service_visit', 'repair', 'chemical_delivery', 'inspection', 'office', 'emergency')),
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  actual_start timestamptz,
  actual_end timestamptz,
  status text default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz default now()
);

create table staff_unavailability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  approved_by uuid references staff(id),
  created_at timestamptz default now()
);

-- ─── ASSET MANAGEMENT ────────────────────────────────────────────────────────

create table asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,        -- e.g. "Pump", "Filter", "Chlorinator", "Heater"
  inspection_interval_days int default 90
);

insert into asset_categories (name, inspection_interval_days) values
('Circulation Pump', 90),
('Sand Filter', 180),
('Cartridge Filter', 90),
('Salt Chlorinator', 90),
('Chemical Dosing Unit', 30),
('UV Steriliser', 180),
('Ozone Generator', 180),
('Heater / Heat Pump', 180),
('Backwash Valve', 365),
('Flow Meter', 365),
('Pressure Gauge', 90),
('Automated Pool Cover', 180),
('Robotic Cleaner', 90),
('Suction Cleaner', 90),
('IoT Sensor / Controller', 30),
('Chemical Storage Cabinet', 90),
('Safety Equipment', 90),
('Pool Lighting', 365),
('Safety Fence / Gate', 90),
('Emergency Stop Button', 30);

create table assets (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  category_id uuid not null references asset_categories(id),
  name text not null,
  manufacturer text,
  model text,
  serial_number text,
  install_date date,
  warranty_expiry date,
  expected_lifespan_years int,
  replacement_cost numeric,
  condition text default 'good' check (condition in ('new', 'good', 'fair', 'poor', 'failed')),
  location_description text,         -- e.g. "pump room, left side"
  next_service_date date,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table asset_service_log (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  serviced_by uuid references staff(id),
  service_date date not null default current_date,
  service_type text not null check (service_type in ('inspection', 'repair', 'replacement', 'calibration', 'cleaning', 'chemical_treatment')),
  description text not null,
  parts_used text,
  cost numeric,
  next_service_date date,
  created_at timestamptz default now()
);

-- ─── COMPLIANCE ───────────────────────────────────────────────────────────────

create table compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid references pools(id) on delete cascade,  -- null = applies to all
  requirement_type text not null,   -- e.g. "Health Dept Inspection", "Monthly Water Report", "Annual Licence Renewal"
  description text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'on_demand')),
  authority text,                   -- e.g. "Victorian Health Department"
  penalty_if_missed text,
  is_active boolean default true
);

create table compliance_events (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  requirement_id uuid references compliance_requirements(id),
  event_type text not null,
  due_date date not null,
  completed_date date,
  completed_by uuid references staff(id),
  status text default 'pending' check (status in ('pending', 'completed', 'overdue', 'waived', 'failed')),
  certificate_url text,
  notes text,
  created_at timestamptz default now()
);

create table water_closures (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  closed_by uuid references staff(id),
  closure_reason text not null,
  water_test_id uuid references water_tests(id),   -- the test that triggered closure
  closed_at timestamptz not null default now(),
  reopened_at timestamptz,
  reopened_by uuid references staff(id),
  reopening_test_id uuid references water_tests(id),
  authority_notified boolean default false,
  notes text
);

-- ─── CHEMICAL INVENTORY ───────────────────────────────────────────────────────

create table chemicals (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- e.g. "Liquid Chlorine (12.5%)", "pH Down (Muriatic Acid)"
  type text not null check (type in ('sanitiser', 'ph_adjuster', 'alkalinity', 'calcium', 'algaecide', 'clarifier', 'stabiliser', 'flocculant', 'other')),
  unit text not null default 'L',   -- L, kg, tablet
  current_stock numeric default 0,
  reorder_point numeric default 0,
  supplier text,
  safety_data_sheet_url text,
  is_active boolean default true
);

create table chemical_usage_log (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  chemical_id uuid not null references chemicals(id),
  water_test_id uuid references water_tests(id),
  applied_by uuid references staff(id),
  applied_at timestamptz not null default now(),
  quantity numeric not null,
  notes text
);

-- ─── INCIDENT / ISSUE REPORTING ───────────────────────────────────────────────

create table incidents (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  reported_by uuid references staff(id),
  incident_type text not null check (incident_type in ('injury', 'near_miss', 'equipment_failure', 'water_quality', 'security', 'vandalism', 'other')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  immediate_action text,
  authority_notified boolean default false,
  authority_reference text,
  status text default 'open' check (status in ('open', 'investigating', 'resolved', 'closed')),
  resolved_at timestamptz,
  resolved_by uuid references staff(id),
  occurred_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- ─── NOTIFICATIONS / ALERTS ───────────────────────────────────────────────────

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references staff(id),
  pool_id uuid references pools(id),
  type text not null,               -- 'compliance_due', 'water_risk', 'asset_service', 'incident', etc.
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

create index idx_water_tests_pool_id on water_tests(pool_id);
create index idx_water_tests_tested_at on water_tests(tested_at desc);
create index idx_water_tests_risk on water_tests(risk_level);
create index idx_shifts_staff_id on shifts(staff_id);
create index idx_shifts_scheduled_start on shifts(scheduled_start);
create index idx_assets_pool_id on assets(pool_id);
create index idx_assets_next_service on assets(next_service_date);
create index idx_compliance_events_pool on compliance_events(pool_id);
create index idx_compliance_events_due on compliance_events(due_date);
create index idx_incidents_pool on incidents(pool_id);
create index idx_incidents_status on incidents(status);
create index idx_iot_sensors_key on iot_sensors(sensor_key);
