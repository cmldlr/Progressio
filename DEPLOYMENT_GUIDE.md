# Supabase URL ve Yönlendirme Ayarları

Uygulamanızın alan adı (domain) değiştiğinde veya canlıya (Netlify, Vercel vb.) aldığınızda, Supabase'in kimlik doğrulama linklerinin (şifre sıfırlama, email doğrulama) doğru çalışması için aşağıdaki ayarları güncellemeniz gerekir.

## 1. Site URL Ayarı
Bu, uygulamanızın ana adresidir.

1.  **Supabase Dashboard**'a girin.
2.  Sol menüden **Authentication** > **URL Configuration** sayfasına gidin.
3.  **Site URL** alanına sitenizin güncel adresini yazın.
    *   Örnek: `https://progressio-app.netlify.app`
    *   Örnek (Domain aldıysanız): `https://www.progressio.com`

## 2. Redirect URLs (Yönlendirme Linkleri)
Supabase, güvenlik gereği sadece izin verilen adreslere yönlendirme yapar. Sitenizin adresi değişirse burayı da güncellemelisiniz.

1.  Aynı sayfada (**URL Configuration**) alt kısımda **Redirect URLs** bölümünü bulun.
2.  **Add URL** butonuna tıklayın.
3.  Sitenizin adresini ekleyin.
    *   Öneri: Hem `https` hem de `http` (localhost testleri için) versiyonlarını ekleyebilirsiniz.
    *   Örnekler:
        *   `http://localhost:5173` (Geliştirme ortamı için)
        *   `https://progressio-app.netlify.app` (Canlı ortam için)
        *   `https://baska-bir-domain.com` (Eğer ilerde değişirse)
4.  Wildcard (Joker Karakter) Kullanımı:
    *   Eğer Netlify deploy preview'ları gibi dinamik alt domainler kullanıyorsanız, sonuna `*` koyabilirsiniz:
    *   `https://*.netlify.app`

> **Önemli:** Sitenizin adresi her değiştiğinde bu ayarları güncellemeyi unutmayın, aksi takdirde kullanıcılar "Email Doğrula" butonuna bastığında hata alabilir veya yanlış adrese gidebilir.
