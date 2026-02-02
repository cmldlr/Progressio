import React, { useState } from 'react';
import { X, Save, Ruler, Activity, ArrowRight } from 'lucide-react';

export default function MeasurementsModal({ isOpen, onClose, onSave, initialData = null }) {
    const [activeTab, setActiveTab] = useState('general'); // general, tape
    const [loading, setLoading] = useState(false);

    // Default State
    const defaultState = {
        date: new Date().toISOString().split('T')[0],
        weight: '',
        height: '',
        chest: '', shoulder: '', arm_right: '', arm_left: '',
        waist: '', belly: '', hip: '',
        leg_right: '', leg_left: '', calf_right: '', calf_left: '',
        body_fat_percent: '', muscle_mass: '', water_percent: '',
        visceral_fat: '', bmr: '', metabolic_age: '',
        notes: ''
    };

    const [formData, setFormData] = useState(defaultState);

    // Populate Form on Open
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const tape = initialData.tape_measurements || {};
                setFormData({
                    date: initialData.date?.split('T')[0] || new Date().toISOString().split('T')[0],
                    weight: initialData.weight || '',
                    height: initialData.height || '',
                    body_fat_percent: initialData.body_fat_percent || '',
                    muscle_mass: initialData.muscle_mass || '',
                    water_percent: initialData.water_percent || '',
                    visceral_fat: initialData.visceral_fat || '',
                    bmr: initialData.bmr || '',
                    metabolic_age: initialData.metabolic_age || '',
                    notes: initialData.notes || '',

                    // Tape
                    chest: tape.chest || '',
                    shoulder: tape.shoulder || '',
                    arm_right: tape.arm_right || '',
                    arm_left: tape.arm_left || '',
                    waist: tape.waist || '',
                    belly: tape.belly || '',
                    hip: tape.hip || '',
                    leg_right: tape.leg_right || '',
                    leg_left: tape.leg_left || '',
                    calf_right: tape.calf_right || '',
                    calf_left: tape.calf_left || ''
                });
            } else {
                setFormData(defaultState);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Veriyi hazırla (Boş stringleri null yap veya gönderme)
            const payload = {
                date: formData.date,
                weight: formData.weight || null,
                body_fat_percent: formData.body_fat_percent || null,
                muscle_mass: formData.muscle_mass || null,
                water_percent: formData.water_percent || null,
                visceral_fat: formData.visceral_fat || null,
                bmr: formData.bmr || null,
                metabolic_age: formData.metabolic_age || null,
                notes: formData.notes,
                tape_measurements: {
                    chest: formData.chest,
                    shoulder: formData.shoulder,
                    arm_right: formData.arm_right,
                    arm_left: formData.arm_left,
                    waist: formData.waist,
                    belly: formData.belly,
                    hip: formData.hip,
                    leg_right: formData.leg_right,
                    leg_left: formData.leg_left,
                    calf_right: formData.calf_right,
                    calf_left: formData.calf_left
                }
            };

            await onSave(payload);
            setLoading(false);
            onClose();
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("Kaydederken bir hata oluştu.");
        }
    };

    const tabs = [
        { id: 'general', label: 'Genel & Tanita', icon: Activity },
        { id: 'tape', label: 'Mezura Ölçüleri', icon: Ruler },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 text-white">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 left-2 w-24 h-24 bg-white rounded-full blur-3xl" />
                    </div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold">
                                {initialData ? 'Ölçümü Düzenle' : 'Yeni Ölçüm Ekle'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 px-6 pt-4 border-b border-gray-200 dark:border-slate-800 overflow-x-auto bg-white dark:bg-slate-900">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Date Input (Always Visible) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Ölçüm Tarihi</label>
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200"
                            />
                        </div>
                    </div>

                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">

                            {/* Temel Ölçümler */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 pb-1 border-b border-gray-100 dark:border-slate-800">Temel Değerler</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Kilo (kg)" name="weight" value={formData.weight} onChange={handleChange} placeholder="Örn: 84.5" />
                                    <InputGroup label="Yağ Oranı (%)" name="body_fat_percent" value={formData.body_fat_percent} onChange={handleChange} placeholder="Örn: 24.5" />
                                    <InputGroup label="Kas Kütlesi (kg)" name="muscle_mass" value={formData.muscle_mass} onChange={handleChange} placeholder="Örn: 63.2" />
                                    <InputGroup label="Vücut Sıvısı (%)" name="water_percent" value={formData.water_percent} onChange={handleChange} placeholder="Örn: 58.0" />
                                </div>
                            </div>

                            {/* Detaylı Tanita */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 pb-1 border-b border-gray-100 dark:border-slate-800">Tanita Detayları</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="İç Yağlanma (Derece)" name="visceral_fat" value={formData.visceral_fat} onChange={handleChange} placeholder="Örn: 10" />
                                    <InputGroup label="BMR (kcal)" name="bmr" value={formData.bmr} onChange={handleChange} placeholder="Örn: 1950" />
                                    <InputGroup label="Metabolik Yaş" name="metabolic_age" value={formData.metabolic_age} onChange={handleChange} placeholder="Örn: 25" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tape' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 pb-1 border-b border-gray-100 dark:border-slate-800">Üst Vücut (cm)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Omuz" name="shoulder" value={formData.shoulder} onChange={handleChange} />
                                    <InputGroup label="Göğüs" name="chest" value={formData.chest} onChange={handleChange} />
                                    <InputGroup label="Kol (Sağ)" name="arm_right" value={formData.arm_right} onChange={handleChange} />
                                    <InputGroup label="Kol (Sol)" name="arm_left" value={formData.arm_left} onChange={handleChange} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 pb-1 border-b border-gray-100 dark:border-slate-800">Orta Vücut (cm)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Bel" name="waist" value={formData.waist} onChange={handleChange} />
                                    <InputGroup label="Karın (Göbek)" name="belly" value={formData.belly} onChange={handleChange} />
                                    <InputGroup label="Kalça" name="hip" value={formData.hip} onChange={handleChange} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 pb-1 border-b border-gray-100 dark:border-slate-800">Alt Vücut (cm)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Bacak (Sağ)" name="leg_right" value={formData.leg_right} onChange={handleChange} />
                                    <InputGroup label="Bacak (Sol)" name="leg_left" value={formData.leg_left} onChange={handleChange} />
                                    <InputGroup label="Baldır (Sağ)" name="calf_right" value={formData.calf_right} onChange={handleChange} />
                                    <InputGroup label="Baldır (Sol)" name="calf_left" value={formData.calf_left} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        {!loading && <Save className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Inputs
const InputGroup = ({ label, name, value, onChange, placeholder }) => (
    <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</label>
        <div className="relative">
            <input
                type="number"
                step="0.1"
                min="0"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder || "0.0"}
                className="w-full pl-4 pr-10 py-2 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white transition-all disabled:opacity-50"
            />
        </div>
    </div>
);
