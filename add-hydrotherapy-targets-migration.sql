-- Adds the missing hydrotherapy/chlorine water quality targets to water_test_targets.
-- No hydrotherapy targets existed at all before this — a hydrotherapy pool falls back to
-- outdoor_chlorine defaults, which are materially wrong for this class of facility (lower
-- free chlorine floor, wider pH band, no total chlorine or turbidity tracking).
--
-- Values sourced from a real WQRMP (Better Health Network hydrotherapy pool, Bentleigh East,
-- Aug 2026), Section 5.1 "Operational target" column — the tightest, most defensible figures
-- available for this pool class since no other reference existed in this codebase.
--
-- NOTE (2026-08): these values are also hardcoded separately in lib/water-chemistry.ts
-- (RANGES.hydrotherapy_chlorine) because classifyRisk()/calculateDoses() read from that
-- hardcoded object, not from this table, at runtime. This migration keeps the DB reference
-- data consistent with the code; it does not by itself change app behaviour. See the
-- session notes for the broader recommendation to make water_test_targets the live source
-- of truth instead of a hardcoded mirror.

insert into water_test_targets (pool_type, sanitiser_type, parameter, min_value, max_value, ideal_value, unit, priority) values
('hydrotherapy', 'chlorine', 'free_chlorine', 2.5, 3.5, 2.75, 'ppm', 'critical'),
('hydrotherapy', 'chlorine', 'combined_chlorine', 0, 0.5, 0.0, 'ppm', 'critical'),
('hydrotherapy', 'chlorine', 'total_chlorine', 0, 4.0, 2.5, 'ppm', 'high'),
('hydrotherapy', 'chlorine', 'ph', 7.4, 7.6, 7.55, 'pH', 'critical'),
('hydrotherapy', 'chlorine', 'total_alkalinity', 100, 140, 120, 'ppm', 'high'),
('hydrotherapy', 'chlorine', 'calcium_hardness', 100, 250, 175, 'ppm', 'normal'),
('hydrotherapy', 'chlorine', 'turbidity', 0, 0.5, 0.2, 'NTU', 'high')
on conflict (pool_type, sanitiser_type, parameter) do update set
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  ideal_value = excluded.ideal_value,
  unit = excluded.unit,
  priority = excluded.priority;

NOTIFY pgrst, 'reload schema';
