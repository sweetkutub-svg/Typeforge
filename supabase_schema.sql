-- Run this in your Supabase SQL Editor

create table if not exists users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  lesson_id int not null,
  wpm int not null,
  accuracy numeric(5,2) not null,
  xp int not null default 0,
  completed_at timestamptz default now()
);

create table if not exists key_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  key_char text not null,
  attempts int default 0,
  mistakes int default 0,
  updated_at timestamptz default now(),
  unique(user_id, key_char)
);

-- Row Level Security
alter table users enable row level security;
alter table progress enable row level security;
alter table key_stats enable row level security;

create policy "Users can read own data" on users for select using (auth.uid() = id);
create policy "Users can insert own data" on users for insert with check (auth.uid() = id);

create policy "Users can read own progress" on progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on progress for insert with check (auth.uid() = user_id);

create policy "Users can read own key_stats" on key_stats for select using (auth.uid() = user_id);
create policy "Users can upsert own key_stats" on key_stats for all using (auth.uid() = user_id);
