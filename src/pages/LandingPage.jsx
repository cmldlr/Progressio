import React, { useState } from 'react';
import { ArrowRight, Activity, Calendar, Shield, Users, BarChart } from 'lucide-react';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            P
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Progressio
                        </span>
                    </div>
                    <div>
                        <button
                            onClick={() => setShowAuth(true)}
                            className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                        >
                            Giriş Yap
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -z-10" />

                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        v2.3 Yayında: Bulut Senkronizasyonu
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                        Antrenmanlarını <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Akıllıca Yönet
                        </span>
                    </h1>

                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Progressio ile gelişimini takip et, antrenman programını planla ve hedeflerine ulaş.
                        Artık tüm cihazlarında senkronize.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => setShowAuth(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 group"
                        >
                            Hemen Başla
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 transition">
                            Detaylı Bilgi
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6 text-indigo-600" />}
                            title="Haftalık Planlama"
                            desc="Sürükle bırak özelliği ile tüm haftanı saniyeler içinde planla."
                        />
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 text-purple-600" />}
                            title="Detaylı Takip"
                            desc="Set, tekrar ve ağırlıklarını kaydet, gelişimini gör."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-blue-600" />}
                            title="Bulut Yedekleme"
                            desc="Verilerin güvende. Telefondan bilgisayara sorunsuz geçiş."
                        />
                    </div>
                </div>
            </section>

            {/* Preview Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="bg-gray-900 rounded-3xl p-4 md:p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div className="text-white space-y-6">
                                <h2 className="text-3xl font-bold">Profesyonel Antrenman Analizi</h2>
                                <p className="text-gray-400">
                                    Hangi kas gruarını ne kadar çalıştırdığını görselleştir.
                                    Dengesiz antrenman programlarına son ver.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'İnteraktif Vücut Haritası',
                                        'Haftalık Hacim Dengesi',
                                        'Otomatik Renklendirme'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative">
                                {/* Mockup Image Placeholders - using CSS shapes for now */}
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 aspect-video flex items-center justify-center">
                                    <BarChart className="w-32 h-32 text-indigo-200 opacity-50" />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 w-48">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">Mon</div>
                                        <div className="h-2 bg-white/20 rounded-full flex-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 bg-white/10 rounded-full w-3/4" />
                                        <div className="h-1.5 bg-white/10 rounded-full w-1/2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>&copy; 2024 Progressio. Tüm hakları saklıdır.</p>
                </div>
            </footer>

            <AuthModal
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                onAuthSuccess={() => { }}
            />
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}
