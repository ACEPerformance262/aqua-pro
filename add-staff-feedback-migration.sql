-- AquaPro — Staff Feedback / Error Log
-- Bug reports, feature requests and improvement suggestions from any logged-in staff
-- member, with an AI (Claude) triage step run automatically on submission.
--
-- NOTE: the table actually live in production does NOT match a `submitted_by uuid
-- references staff(id)` FK that an earlier version of this file specified — a
-- staff_feedback table with the shape below (free-text submitted_by/submitted_by_email,
-- same shape as ace-dashboard's original) already existed before this migration was
-- ever run, cause unknown. The app code (app/api/feedback/*) was adapted to match
-- what's actually live rather than risk a destructive DROP TABLE. This file now
-- documents the real, live shape — treat it as the source of truth for a fresh install.

create table staff_feedback (
  id                 uuid primary key default gen_random_uuid(),
  type               text not null default 'bug' check (type in ('bug', 'feature', 'improvement')),
  title              text not null,
  description        text default '',
  submitted_by       text default 'Unknown',
  submitted_by_email text,
  priority           text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status             text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  page_url           text,
  screenshot_url     text,

  -- AI triage (Claude Haiku), populated async right after insert
  ai_diagnosis       text,
  ai_workaround      text,
  ai_fix_hint        text,

  created_at         timestamptz default now()
);

create index idx_staff_feedback_status on staff_feedback(status);
create index idx_staff_feedback_created on staff_feedback(created_at desc);
