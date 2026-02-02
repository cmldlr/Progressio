import { useState, useEffect } from 'react';
import { supabase, auth } from '../lib/supabaseClient';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, X, Dumbbell } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Kayıtlı bilgileri yükle
    useEffect(() => {
        const savedEmail = localStorage.getItem('progressio-saved-email');
        const savedRemember = localStorage.getItem('progressio-remember-me') === 'true';
        if (savedEmail && savedRemember) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'login') {
                let loginIdentifier = email.trim();
                let finalEmail = loginIdentifier;

                if (!loginIdentifier.includes('@')) {
                    const { data: resolvedEmail, error: rpcError } = await supabase
                        .rpc('get_email_by_username', { username_input: loginIdentifier });

                    if (rpcError) throw rpcError;
                    if (!resolvedEmail) throw new Error('Bu kullanıcı adı ile kayıtlı kullanıcı bulunamadı.');

                    finalEmail = resolvedEmail;
                }

                const { data: authData, error } = await auth.signInWithPassword({
                    email: finalEmail,
                    password: password
                });

                if (error) throw error;

                let user = authData?.user || authData?.session?.user;

                if (!user) {
                    const { data: sessionData } = await supabase.auth.getSession();
                    user = sessionData?.session?.user;

                    if (!user) {
                        const { data: userData } = await auth.getUser();
                        user = userData?.user;
                    }
                }

                if (user) {
                    if (rememberMe) {
                        localStorage.setItem('progressio-saved-email', email.trim());
                        localStorage.setItem('progressio-remember-me', 'true');
                    } else {
                        localStorage.removeItem('progressio-saved-email');
                        localStorage.removeItem('progressio-remember-me');
                    }

                    onAuthSuccess(user);
                    onClose();
                } else {
                    throw new Error('Giriş başarılı fakat kullanıcı bilgisi alınamadı.');
                }

            } else {
                const validUsername = username.trim().toLowerCase();

                if (validUsername.length < 4 || validUsername.length > 15) {
                    throw new Error('Kullanıcı adı 4-15 karakter arasında olmalıdır.');
                }
                if (!/^[a-z0-9_]+$/.test(validUsername)) {
                    throw new Error('Kullanıcı adı sadece küçük harf, rakam ve alt çizgi (_) içerebilir.');
                }

                // Şifre güçlülük kontrolü
                if (password.length < 8) {
                    throw new Error('Şifre en az 8 karakter olmalıdır.');
                }
                if (!/[A-Z]/.test(password)) {
                    throw new Error('Şifre en az bir büyük harf içermelidir.');
                }
                if (!/[a-z]/.test(password)) {
                    throw new Error('Şifre en az bir küçük harf içermelidir.');
                }
                if (!/[0-9]/.test(password)) {
                    throw new Error('Şifre en az bir rakam içermelidir.');
                }

                const { data: existingUser } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', validUsername)
                    .single();

                if (existingUser) {
                    throw new Error('Bu kullanıcı adı zaten alınmış.');
                }

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
        setPassword('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">

                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-8 text-white overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Logo & Title */}
                    <div className="relative text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <Dumbbell size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {mode === 'login' ? 'Tekrar Hoş geldin' : 'Hesap Oluştur'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-300">
                            {mode === 'login'
                                ? 'Antrenmanlarına kaldığın yerden devam et'
                                : 'Kişiselleştirilmiş antrenman deneyimine başla'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
                            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {message && (
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl">
                            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
                        </div>
                    )}

                    {/* Username field - only for signup */}
                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kullanıcı Adı
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
                                    placeholder="kullanici_adi"
                                    required
                                    minLength={4}
                                    maxLength={15}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">4-15 karakter, küçük harf ve rakam</p>
                        </div>
                    )}

                    {/* Email field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {mode === 'login' ? 'Email veya Kullanıcı Adı' : 'Email Adresi'}
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
                                placeholder={mode === 'login' ? "ornek@email.com veya kullanici_adi" : "ornek@email.com"}
                                required
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Şifre
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {mode === 'signup' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Minimum 6 karakter</p>
                        )}
                    </div>

                    {/* Remember me - only for login */}
                    {mode === 'login' && (
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="remember-me"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                Beni hatırla
                            </label>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                İşleniyor...
                            </>
                        ) : (
                            <>
                                {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="px-6 pb-6 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900">
                                veya
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
