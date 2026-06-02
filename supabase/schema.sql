-- =========================================================
-- CLEAN POLL SYSTEM SCHEMA (QUESTIONS + OPTIONS + VOTES)
-- =========================================================

-- ─────────────────────────────────────────────────────────
-- RESET (safe cleanup)
-- ─────────────────────────────────────────────────────────
drop table if exists votes cascade;
drop table if exists poll_options cascade;
drop table if exists questions cascade;

-- ─────────────────────────────────────────────────────────
-- QUESTIONS TABLE
-- ─────────────────────────────────────────────────────────
create table questions (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  author text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────
-- POLL OPTIONS TABLE
-- ─────────────────────────────────────────────────────────
create table poll_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_text text not null,
  created_at timestamptz default now()
);

create index poll_options_question_id_idx
on poll_options(question_id);

-- ─────────────────────────────────────────────────────────
-- VOTES TABLE (1 vote per user per poll)
-- ─────────────────────────────────────────────────────────
create table votes (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_id uuid not null references poll_options(id) on delete cascade,
  voter_id text not null,
  created_at timestamptz default now(),
  unique (question_id, voter_id)
);

create index votes_question_id_idx
on votes(question_id);

create index votes_option_id_idx
on votes(option_id);

-- ─────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────
alter table questions enable row level security;
alter table poll_options enable row level security;
alter table votes enable row level security;

-- ─────────────────────────────────────────────────────────
-- SIMPLE DEV POLICIES (ALLOW ALL)
-- ─────────────────────────────────────────────────────────

create policy "allow all questions"
on questions
for all
using (true)
with check (true);

create policy "allow all poll options"
on poll_options
for all
using (true)
with check (true);

create policy "allow all votes"
on votes
for all
using (true)
with check (true);

-- ─────────────────────────────────────────────────────────
-- SAMPLE DATA (OPTIONAL TEST SEED)
-- ─────────────────────────────────────────────────────────

insert into questions (body, author)
values
('What is your favorite frontend framework?', 'system'),
('Which backend do you prefer?', 'system');
