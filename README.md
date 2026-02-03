# Progressio 🏋️

Modern, bulut tabanlı antrenman takip ve planlama uygulaması. React, Vite, TailwindCSS ve Supabase ile geliştirilmiştir.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat-square&logo=supabase)

## 📋 Özellikler

- **📅 Haftalık Antrenman Planlaması** - 7 günlük program oluşturma ve düzenleme
- **💪 Egzersiz Yönetimi** - Set, tekrar ve ağırlık takibi
- **📊 İlerleme Grafikleri** - Görsel raporlama ve analiz
- **📏 Vücut Ölçümleri** - Kilo, yağ oranı, kas kütlesi takibi
- **🎨 İnteraktif Vücut Diyagramı** - Kas gruplarını görselleştirme
- **☁️ Bulut Senkronizasyon** - Tüm cihazlardan erişim
- **📱 Responsive Tasarım** - Mobil ve masaüstü uyumlu
- **🌙 Karanlık Mod** - Göz yormayan arayüz

## 🛠️ Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| Frontend | React 19, Vite 7, TailwindCSS 4 |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Grafikler | Recharts |
| Tarih İşlemleri | date-fns |
| İkonlar | Lucide React |
| Routing | React Router DOM 7 |

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/cmldlr/Progressio.git
cd Progressio
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Geliştirme Sunucusu

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 🗄️ Veritabanı Kurulumu (Supabase)

Supabase Dashboard > SQL Editor'da aşağıdaki SQL'leri **sırasıyla** çalıştırın:

### Adım 1: Ana Tablolar

```sql
-- ==========================================
-- Progressio Database Schema
-- ==========================================

-- 1. Workout Data (Kullanıcı Ayarları)
CREATE TABLE IF NOT EXISTS public.workout_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    weeks JSONB NOT NULL DEFAULT '[]',
    active_week_id INTEGER DEFAULT 1,
    muscle_groups JSONB DEFAULT '{}',
    workout_types JSONB DEFAULT '[]',
    exercise_details JSONB DEFAULT '{}',
    workout_colors JSONB DEFAULT '{}',
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Weeks (Haftalık Veriler)
CREATE TABLE IF NOT EXISTS public.weeks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    week_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    exercises JSONB DEFAULT '[]'::jsonb,
    grid_data JSONB DEFAULT '{}'::jsonb,
    days_config JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, week_number)
);

-- 3. Measurements (Ölçümler)
CREATE TABLE IF NOT EXISTS public.measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(5,2),
    body_fat_percent NUMERIC(4,1),
    muscle_mass NUMERIC(5,2),
    water_percent NUMERIC(4,1),
    visceral_fat NUMERIC(3,1),
    bmr INT,
    metabolic_age INT,
    tape_measurements JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Profiles (Kullanıcı Profilleri)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT username_length CHECK (char_length(username) >= 4 AND char_length(username) <= 15),
    CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$')
);
```

### Adım 2: Row Level Security (RLS)

```sql
-- ==========================================
-- RLS Politikaları
-- ==========================================

-- Workout Data RLS
ALTER TABLE public.workout_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.workout_data;
DROP POLICY IF EXISTS "Users can insert own data" ON public.workout_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.workout_data;
DROP POLICY IF EXISTS "Users can delete own data" ON public.workout_data;

CREATE POLICY "Users can view own data" ON public.workout_data 
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON public.workout_data 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON public.workout_data 
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON public.workout_data 
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Weeks RLS
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weeks" ON public.weeks 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weeks" ON public.weeks 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weeks" ON public.weeks 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weeks" ON public.weeks 
    FOR DELETE USING (auth.uid() = user_id);

-- Measurements RLS
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own measurements" ON public.measurements 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own measurements" ON public.measurements 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own measurements" ON public.measurements 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own measurements" ON public.measurements 
    FOR DELETE USING (auth.uid() = user_id);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Grants
GRANT ALL ON TABLE public.workout_data TO authenticated;
GRANT ALL ON TABLE public.workout_data TO service_role;
GRANT ALL ON TABLE public.weeks TO authenticated;
GRANT ALL ON TABLE public.weeks TO service_role;
GRANT ALL ON TABLE public.measurements TO authenticated;
GRANT ALL ON TABLE public.measurements TO service_role;
```

### Adım 3: Fonksiyonlar ve Trigger'lar

```sql
-- ==========================================
-- Fonksiyonlar & Trigger'lar
-- ==========================================

-- Yeni kullanıcı oluştuğunda profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Kullanıcı adı ile email bulma (login için)
CREATE OR REPLACE FUNCTION get_email_by_username(username_input TEXT)
RETURNS TEXT AS $$
DECLARE
    found_email TEXT;
BEGIN
    SELECT email INTO found_email
    FROM public.profiles
    WHERE username = username_input;
    RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🌐 Deployment (Netlify)

### 1. Netlify'da Yeni Site Oluşturun

GitHub reposunu bağlayın.

### 2. Build Ayarları

| Ayar | Değer |
|------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |

### 3. Environment Variables

Netlify Dashboard > Site settings > Environment variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Supabase proje URL'iniz |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key'iniz |

### 4. Supabase Redirect URL

Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: `https://your-site.netlify.app`
- **Redirect URLs**: `https://your-site.netlify.app`

## 📁 Proje Yapısı

```
Progressio/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx        # Giriş/Kayıt modal
│   │   ├── BodyDiagramSVG.jsx   # İnteraktif vücut diyagramı
│   │   ├── CalendarView.jsx     # Takvim görünümü
│   │   ├── ExerciseEditor.jsx   # Egzersiz düzenleme
│   │   ├── MeasurementsModal.jsx # Ölçüm girişi
│   │   ├── ProgressCharts.jsx   # İlerleme grafikleri
│   │   ├── SettingsPanel.jsx    # Ayarlar paneli
│   │   ├── WeeklyGrid.jsx       # Haftalık tablo
│   │   └── WeekSelector.jsx     # Hafta seçici
│   ├── hooks/
│   │   └── useWorkoutData.js    # Veri yönetimi hook
│   ├── lib/
│   │   └── supabaseClient.js    # Supabase bağlantısı
│   ├── pages/
│   │   ├── Dashboard.jsx        # Ana panel
│   │   └── LandingPage.jsx      # Giriş sayfası
│   ├── utils/
│   │   └── themeColors.js       # Tema renkleri
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── .env                         # Environment variables
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔐 Güvenlik

- **Row Level Security (RLS)**: Her kullanıcı sadece kendi verilerine erişebilir
- **Şifre Gereksinimleri**: 
  - Minimum 8 karakter
  - En az 1 büyük harf
  - En az 1 küçük harf
  - En az 1 rakam
- **Email Doğrulama**: Kayıt sonrası email onayı gerekli

## 📝 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 Geliştirici

**Cemil Dalar**

- GitHub: [@cmldlr](https://github.com/cmldlr)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
