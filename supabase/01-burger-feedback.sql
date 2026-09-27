-- Ink Burger: tester feedback. Paste into Supabase > SQL Editor and press Run (once).
-- Players can send notes; nobody can read them from the game. Read them in Supabase > Table Editor > burger_feedback.
-- It's the same Supabase project as Ink Nine, and it only adds a new table: nothing of Ink Nine's is touched.

create table if not exists public.burger_feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  player_id  uuid default auth.uid(),
  version    text not null default '',
  kind       text not null default '',
  note       text not null check (char_length(note) between 1 and 1000),
  context    jsonb not null default '{}'::jsonb
);

alter table public.burger_feedback enable row level security;

drop policy if exists "players send burger feedback" on public.burger_feedback;
create policy "players send burger feedback"
  on public.burger_feedback for insert with check (auth.uid() = player_id);
