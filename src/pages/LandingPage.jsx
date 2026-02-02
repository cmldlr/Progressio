import React, { useState, useEffect } from 'react';
import {
    ArrowRight, Activity, Calendar, Shield, BarChart,
    Dumbbell, TrendingUp, Smartphone, Cloud, Zap, Target,
    ChevronRight, Star, Users, CheckCircle
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">

            {/* Animated Background Blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-300/20 dark:bg-blue-900/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-700 dark:border-slate-700 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl border border-white/20">
                            P
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-white">
                            Progressio
                        </span>
                    </div>
                    <button
                        onClick={() => setShowAuth(true)}
                        className="px-5 sm:px-6 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base shadow-lg"
                    >
                        Giriş Yap
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                        {/* Version Badge */}
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900/10 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-gray-200 dark:border-white/20 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Açık Kaynak · Ücretsiz
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight leading-[1.1]">
                            Antrenmanlarını
                            <br />
                            <span className="bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 dark:from-gray-300 dark:via-white dark:to-gray-300 text-transparent bg-clip-text">
                                Akıllıca Yönet
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                            Haftalık antrenman programını oluştur, setlerini kaydet, gelişimini takip et.
                            <span className="hidden sm:inline"> Tüm cihazlarında senkronize çalış.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                            <button
                                onClick={() => setShowAuth(true)}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group text-sm sm:text-base shadow-xl"
                            >
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                                Ücretsiz Başla
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a href="#features" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                                Özellikler
                            </a>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Ücretsiz</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-500" />
                                <span>Güvenli</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Cloud className="w-4 h-4 text-purple-500" />
                                <span>Bulut Senkronizasyon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Temel Özellikler
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                            Antrenman takibi için ihtiyacın olan her şey tek bir yerde
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6" />}
                            color="indigo"
                            title="Haftalık Program"
                            desc="7 günlük antrenman programını oluştur ve düzenle"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            color="purple"
                            title="Set & Tekrar Takibi"
                            desc="Her egzersiz için set, tekrar ve ağırlık kaydet"
                        />
                        <FeatureCard
                            icon={<Cloud className="w-6 h-6" />}
                            color="blue"
                            title="Bulut Senkronizasyon"
                            desc="Verilerini güvenle sakla, tüm cihazlarından eriş"
                        />
                        <FeatureCard
                            icon={<Target className="w-6 h-6" />}
                            color="green"
                            title="Vücut Ölçümleri"
                            desc="Kilo, yağ oranı ve çevre ölçümlerini takip et"
                        />
                        <FeatureCard
                            icon={<Smartphone className="w-6 h-6" />}
                            color="orange"
                            title="Responsive Tasarım"
                            desc="Mobil ve masaüstünde sorunsuz kullanım"
                        />
                        <FeatureCard
                            icon={<BarChart className="w-6 h-6" />}
                            color="pink"
                            title="Görsel Grafikler"
                            desc="İlerlemenizi grafiklerle görselleştirin"
                        />
                    </div>
                </div>
            </section>

            {/* App Preview Section */}
            <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="text-white space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm">
                                <Star className="w-4 h-4 text-yellow-400" />
                                Profesyonel Araçlar
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                                İnteraktif Vücut Haritası ile
                                <br />
                                <span className="text-gray-300">Kaslarını Görselleştir</span>
                            </h2>
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                                Hangi kas grubunu ne kadar çalıştırdığını gör.
                                Dengesiz antrenman programlarına son ver.
                            </p>
                            <ul className="space-y-3 sm:space-y-4 text-left inline-block">
                                {[
                                    'Tıklanabilir Anatomi Diyagramı',
                                    'Haftalık Hacim Dengesi',
                                    'Otomatik Renk Kodlaması',
                                    'Detaylı İstatistikler'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm sm:text-base">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <ChevronRight className="w-4 h-4 text-gray-300" />
                                        </div>
                                        <span className="text-gray-200">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/20">
                                <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden">
                                    <div className="text-center p-4">
                                        <BarChart className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400/60 mx-auto mb-4" />
                                        <p className="text-gray-400 text-xs sm:text-sm">Dashboard Önizleme</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIgY3g9IjIwIiBjeT0iMjAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-30" />

                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                                Antrenmanlarını Bir Üst Seviyeye Taşı
                            </h2>
                            <p className="text-gray-300 mb-8 max-w-xl mx-auto text-sm sm:text-base">
                                Binlerce kullanıcı gibi sen de Progressio ile hedeflerine ulaş
                            </p>
                            <button
                                onClick={() => setShowAuth(true)}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base shadow-lg"
                            >
                                Hemen Başla
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 sm:py-16 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-900 dark:bg-white/10 rounded-lg flex items-center justify-center text-white font-bold border border-gray-700 dark:border-white/20">
                                P
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Progressio</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Gizlilik</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Kullanım Şartları</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">İletişim</a>
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                            © 2025 Progressio
                        </p>
                    </div>
                </div>
            </footer>

            <AuthModal
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                onAuthSuccess={() => {
                    // Login başarılı - dashboard'a yönlendir
                    window.location.href = '/dashboard';
                }}
            />

            {/* Custom Styles */}
            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 4s ease infinite;
                }
            `}</style>
        </div>
    );
}

function StatItem({ number, label, icon }) {
    return (
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 mb-3">
                {icon}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {number}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {label}
            </div>
        </div>
    );
}

function FeatureCard({ icon, color, title, desc }) {
    const colorClasses = {
        indigo: 'from-gray-700 to-gray-800 shadow-gray-500/20',
        purple: 'from-gray-600 to-gray-700 shadow-gray-500/20',
        blue: 'from-gray-700 to-gray-800 shadow-gray-500/20',
        green: 'from-gray-600 to-gray-700 shadow-gray-500/20',
        orange: 'from-gray-700 to-gray-800 shadow-gray-500/20',
        pink: 'from-gray-600 to-gray-700 shadow-gray-500/20',
    };

    return (
        <div className="group bg-white dark:bg-slate-800/50 p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4 shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
