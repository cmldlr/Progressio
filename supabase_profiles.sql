-- 8. Profiles Tablosu (Kullanıcı Adı Desteği İçin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Kullanıcı adı kuralları: en az 4, en fazla 15 karakter, sadece küçük harf, rakam ve alt çizgi
  CONSTRAINT username_length CHECK (char_length(username) >= 4 AND char_length(username) <= 15),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$')
);

-- 9. RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 10. Yeni kullanıcı oluştuğunda Profile oluşturma Trigger'ı
-- Bu fonksiyon, auth.users tablosuna kayıt eklendiğinde çalışır
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    -- Eğer metadata'da username yoksa, email'in '@' öncesini al (fallback)
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Kullanıcı Adı ile Email Bulma Fonksiyonu (Login için)
-- Bu fonksiyon client-side tarafından RPC ile çağrılacak
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
