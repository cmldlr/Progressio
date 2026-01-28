import { useState } from 'react';
import { supabase, auth } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState(''); // Login modunda 'username' de tutabilir
    const [username, setUsername] = useState(''); // Sadece signup için
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'login') {
                let loginIdentifier = email.trim(); // Email veya Username
                let finalEmail = loginIdentifier;

                // 1. Eğer email formatında değilse, username olarak kabul et ve email'ini bul
                if (!loginIdentifier.includes('@')) {
                    const { data: resolvedEmail, error: rpcError } = await supabase
                        .rpc('get_email_by_username', { username_input: loginIdentifier });

                    if (rpcError) throw rpcError;
                    if (!resolvedEmail) throw new Error('Bu kullanıcı adı ile kayıtlı kullanıcı bulunamadı.');

                    finalEmail = resolvedEmail;
                }

                // 2. Email ile giriş yap
                const { data: authData, error } = await auth.signInWithPassword({
                    email: finalEmail,
                    password: password
                });

                if (error) {
                    console.error("Login Error:", error);
                    throw error;
                }

                console.log("Login Response Data:", authData);

                // Supabase v2: data structure is { user, session }
                // My wrapper returns exactly what supabase returns.
                let user = authData?.user || authData?.session?.user;

                // Fallback attempt if user is missing but no error
                if (!user) {
                    // Force session refresh
                    const { data: sessionData } = await supabase.auth.getSession();
                    user = sessionData?.session?.user;
                    console.log("User retrieved from session fallback:", user);

                    if (!user) {
                        const { data: userData } = await auth.getUser();
                        user = userData?.user;
                        console.log("User retrieved from getUser fallback:", user);
                    }
                }

                if (user) {
                    onAuthSuccess(user);
                    onClose();
                } else {
                    console.error("CRITICAL: Login successful but no user object found.", authData);
                    throw new Error('Giriş başarılı fakat kullanıcı bilgisi alınamadı. (No User Object)');
                }

            } else {
                // SIGNUP MODE
                const validUsername = username.trim().toLowerCase();

                // 1. Validasyonlar
                if (validUsername.length < 4 || validUsername.length > 15) {
                    throw new Error('Kullanıcı adı 4-15 karakter arasında olmalıdır.');
                }
                if (!/^[a-z0-9_]+$/.test(validUsername)) {
                    throw new Error('Kullanıcı adı sadece küçük harf, rakam ve alt çizgi (_) içerebilir.');
                }

                // 2. Username Unique Kontrolü (Client-side pre-check)
                const { data: existingUser } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', validUsername)
                    .single();

                if (existingUser) {
                    throw new Error('Bu kullanıcı adı zaten alınmış.');
                }

                // 3. Kayıt Ol (Metadata olarak username gönderilir)
                const { error } = await auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            username: validUsername
                        },
                        emailRedirectTo: window.location.origin
                    }
                });

                if (error) throw error;
                setMessage('Kayıt başarılı! Email adresini kontrol et ve hesabını doğrula.');
                // Modu değiştirme, kullanıcı mesajı görsün
            }
        } catch (err) {
            console.error('Auth Error:', err);
            setError(err.message === 'Invalid login credentials'
                ? 'Giriş bilgileri hatalı veya kullanıcı bulunamadı.'
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
        setMessage('');
        setEmail('');
        setUsername('');
        setPassword('');
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: '16px',
                overflowY: 'auto'
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '28rem',
                    overflow: 'hidden',
                }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 transition-colors rounded-2xl shadow-2xl"
            >
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white relative">
                    <h2 className="text-2xl font-bold text-center">
                        {mode === 'login' ? '🏋️ Giriş Yap' : '🎯 Kayıt Ol'}
                    </h2>
                    <p className="text-center text-indigo-100 text-sm mt-1">
                        Antrenmanlarını her yerden takip et
                    </p>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
                            ✅ {message}
                        </div>
                    )}

                    {mode === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kullanıcı Adı <span className="text-xs text-gray-400 font-normal">(4-15 karakter, küçük harf)</span>
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="kullanici_adi"
                                required
                                minLength={4}
                                maxLength={15}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {mode === 'login' ? 'Email veya Kullanıcı Adı' : 'Email'}
                        </label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder={mode === 'login' ? "ornek@email.com veya kullanici_adi" : "ornek@email.com"}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Şifre
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                İşleniyor...
                            </span>
                        ) : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                </form>

                {/* Footer */}
                <div className="px-6 pb-6 text-center">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium underline-offset-4 hover:underline"
                    >
                        {mode === 'login'
                            ? 'Hesabın yok mu? Kayıt ol'
                            : 'Zaten hesabın var mı? Giriş yap'}
                    </button>
                </div>
            </div>
        </div>
    );
}
