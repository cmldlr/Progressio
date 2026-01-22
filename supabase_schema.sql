-- Progressio Veritabanı Şeması
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Workout data tablosu
CREATE TABLE IF NOT EXISTS workout_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    weeks JSONB NOT NULL DEFAULT '[]',
    active_week_id INTEGER DEFAULT 1,
    muscle_groups JSONB DEFAULT '{}',
    workout_types JSONB DEFAULT '[]',
    exercise_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS (Row Level Security) etkinleştir
ALTER TABLE workout_data ENABLE ROW LEVEL SECURITY;

-- 3. Kullanıcılar sadece kendi verilerini görebilsin
CREATE POLICY "Users can view own data"
ON workout_data FOR SELECT
USING (auth.uid() = user_id);

-- 4. Kullanıcılar sadece kendi verilerini ekleyebilsin
CREATE POLICY "Users can insert own data"
ON workout_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Kullanıcılar sadece kendi verilerini güncelleyebilsin
CREATE POLICY "Users can update own data"
ON workout_data FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Kullanıcılar sadece kendi verilerini silebilsin
CREATE POLICY "Users can delete own data"
ON workout_data FOR DELETE
USING (auth.uid() = user_id);

-- 7. updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_data_updated_at
    BEFORE UPDATE ON workout_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
