-- ==========================================
-- ADDED: 29.01.2026 - Progressio v2 Schema
-- ==========================================

-- 1. Workout Data (Global Settings)
-- Recreated to ensure all JSONB columns exist
DROP TABLE IF EXISTS public.workout_data;
create table public.workout_data (
  user_id uuid references auth.users not null primary key,
  muscle_groups jsonb default '{}'::jsonb,
  workout_types jsonb default '[]'::jsonb,
  workout_colors jsonb default '{}'::jsonb,
  exercise_details jsonb default '{}'::jsonb,
  start_date date,
  active_week_id int default 1,     
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.workout_data enable row level security;
create policy "Users can view their own settings" on public.workout_data for select using (auth.uid() = user_id);
create policy "Users can insert/update their own settings" on public.workout_data for all using (auth.uid() = user_id);

-- 2. Weeks (Scalable Data)
create table if not exists public.weeks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  week_number int not null,
  start_date date not null,
  end_date date,
  exercises jsonb default '[]'::jsonb,
  grid_data jsonb default '{}'::jsonb,
  days_config jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, week_number)
);
alter table public.weeks enable row level security;
-- Policies (using DO block to avoid errors if they exist)
do $$
begin
  if not exists (select from pg_policies where tablename = 'weeks' and policyname = 'Users can view their own weeks') then
    create policy "Users can view their own weeks" on public.weeks for select using (auth.uid() = user_id);
    create policy "Users can insert their own weeks" on public.weeks for insert with check (auth.uid() = user_id);
    create policy "Users can update their own weeks" on public.weeks for update using (auth.uid() = user_id);
    create policy "Users can delete their own weeks" on public.weeks for delete using (auth.uid() = user_id);
  end if;
end
$$;

-- 3. Measurements (Progress Tracking)
create table if not exists public.measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null default CURRENT_DATE,
  weight numeric(5,2),
  body_fat_percent numeric(4,1),
  muscle_mass numeric(5,2),
  water_percent numeric(4,1),
  visceral_fat numeric(3,1),
  bmr int,
  metabolic_age int,
  tape_measurements jsonb default '{}'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.measurements enable row level security;
do $$
begin
  if not exists (select from pg_policies where tablename = 'measurements' and policyname = 'Users can view their own measurements') then
    create policy "Users can view their own measurements" on public.measurements for select using (auth.uid() = user_id);
    create policy "Users can insert their own measurements" on public.measurements for insert with check (auth.uid() = user_id);
    create policy "Users can update their own measurements" on public.measurements for update using (auth.uid() = user_id);
    create policy "Users can delete their own measurements" on public.measurements for delete using (auth.uid() = user_id);
  end if;
end
$$;
