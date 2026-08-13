-- AquaPro — Chemical Stock Take + To Order List
-- Chemicals dropping to/below their reorder point (via stock take, manual update,
-- or usage logging) get auto-queued here; items can also be added manually.

create table chemical_orders (
  id              uuid primary key default gen_random_uuid(),
  chemical_id     uuid not null references chemicals(id) on delete cascade,
  status          text not null default 'pending' check (status in ('pending', 'ordered', 'received')),
  quantity_needed numeric,
  notes           text,
  added_at        timestamptz default now(),
  ordered_at      timestamptz,
  ordered_by      uuid references staff(id),
  received_at     timestamptz
);

create index idx_chemical_orders_status on chemical_orders(status);
create index idx_chemical_orders_chemical on chemical_orders(chemical_id);
