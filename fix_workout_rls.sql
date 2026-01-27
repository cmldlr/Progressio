-- RLS Repair Script
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Ensure table exists with correct schema
CREATE TABLE IF NOT EXISTS public.workout_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    weeks JSONB NOT NULL DEFAULT '[]',
    active_week_id INTEGER DEFAULT 1,
    muscle_groups JSONB DEFAULT '{}',
    workout_types JSONB DEFAULT '[]',
    exercise_details JSONB DEFAULT '{}',
    workout_colors JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id is unique for UPSERT to work
ALTER TABLE public.workout_data 
ADD CONSTRAINT workout_data_user_id_key UNIQUE (user_id);

-- 2. Enable RLS
ALTER TABLE public.workout_data ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts or stale states
DROP POLICY IF EXISTS "Users can view own data" ON public.workout_data;
DROP POLICY IF EXISTS "Users can insert own data" ON public.workout_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.workout_data;
DROP POLICY IF EXISTS "Users can delete own data" ON public.workout_data;

-- 4. Re-create policies targeting authenticated users specifically
CREATE POLICY "Users can view own data"
ON public.workout_data FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
ON public.workout_data FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON public.workout_data FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
ON public.workout_data FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Grant access to authenticated users
GRANT ALL ON TABLE public.workout_data TO authenticated;
GRANT ALL ON TABLE public.workout_data TO service_role;

-- 6. Verify setup
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'workout_data';
