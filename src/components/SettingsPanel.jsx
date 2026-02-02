import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
    THEME_COLORS,
    COLOR_OPTIONS,
    getPreviewClasses,
    extractColorId
} from '../utils/themeColors';
import WheelColorPicker from './WheelColorPicker';

export default function SettingsPanel({
    isOpen,
    onClose,
    muscleGroups,
    workoutTypes,
    workoutColors,
    onAddMuscleGroup,
    onRemoveMuscleGroup,
    onAddWorkoutType,
    onRemoveWorkoutType,
    onUpdateWorkoutColor,
    startDate,
    onUpdateStartDate
}) {
    const [activeTab, setActiveTab] = useState('muscles');
    const [expandedType, setExpandedType] = useState(null);

    // Yeni kas grubu form state
    const [newMuscleId, setNewMuscleId] = useState('');
    const [newMuscleLabel, setNewMuscleLabel] = useState('');
    const [newMuscleCategory, setNewMuscleCategory] = useState('');

    // Yeni antrenman tipi state
    const [newWorkoutType, setNewWorkoutType] = useState('');

    if (!isOpen) return null;

    // Mevcut kategorileri çıkar
    const existingCategories = [...new Set(Object.values(muscleGroups || {}).map(m => m.category))];

    // Kas gruplarını kategorilere göre grupla
    const groupedMuscles = Object.values(muscleGroups || {}).reduce((acc, muscle) => {
        const category = muscle.category || 'Diğer';
        if (!acc[category]) acc[category] = [];
        acc[category].push(muscle);
        return acc;
    }, {});

    const handleAddMuscle = () => {
        if (newMuscleLabel.trim() && newMuscleCategory.trim()) {
            const id = newMuscleId.trim() || newMuscleLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            onAddMuscleGroup(id, newMuscleLabel.trim(), newMuscleCategory.trim());
            setNewMuscleId('');
            setNewMuscleLabel('');
            setNewMuscleCategory('');
        }
    };

    const handleAddWorkoutType = () => {
        if (newWorkoutType.trim() && !workoutTypes.includes(newWorkoutType.trim())) {
            onAddWorkoutType(newWorkoutType.trim());
            setNewWorkoutType('');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-slate-800 dark:to-slate-950">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>⚙️</span> Ayarlar
                    </h3>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button
                        onClick={() => setActiveTab('muscles')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'muscles'
                            ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-800'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        💪 Kas Grupları
                    </button>
                    <button
                        onClick={() => setActiveTab('workouts')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'workouts'
                            ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-800'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        🏋️ Tipler
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'colors'
                            ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-800'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        🎨 Renkler
                    </button>
                    <button
                        onClick={() => setActiveTab('program')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'program'
                            ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-800'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        📅 Program
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
                    {activeTab === 'muscles' && (
                        <div className="space-y-4">
                            {/* Yeni Kas Grubu Ekle */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">+ Yeni Kas Grubu Ekle</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        placeholder="İsim (örn: Trapez)"
                                        value={newMuscleLabel}
                                        onChange={(e) => setNewMuscleLabel(e.target.value)}
                                        className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Kategori (örn: Sırt)"
                                        value={newMuscleCategory}
                                        onChange={(e) => setNewMuscleCategory(e.target.value)}
                                        list="categories"
                                        className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                                    />
                                    <datalist id="categories">
                                        {existingCategories.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                    <button
                                        onClick={handleAddMuscle}
                                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition font-medium text-sm"
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>

                            {/* Mevcut Kas Grupları */}
                            <div className="space-y-3">
                                {Object.entries(groupedMuscles).map(([category, muscles]) => (
                                    <div key={category} className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-100 dark:border-slate-800">
                                        <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                            {category}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {muscles.map(muscle => (
                                                <div
                                                    key={muscle.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-slate-700 text-sm group text-gray-700 dark:text-slate-300"
                                                >
                                                    <span>{muscle.label}</span>
                                                    <button
                                                        onClick={() => onRemoveMuscleGroup(muscle.id)}
                                                        className="text-red-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition ml-1"
                                                        title="Sil"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'workouts' && (
                        <div className="space-y-4">
                            {/* Yeni Antrenman Tipi Ekle */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">+ Yeni Antrenman Tipi Ekle</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Örn: Upper Body, Arms Day..."
                                        value={newWorkoutType}
                                        onChange={(e) => setNewWorkoutType(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddWorkoutType()}
                                        className="flex-1 p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                                    />
                                    <button
                                        onClick={handleAddWorkoutType}
                                        className="px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition font-medium text-sm"
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>

                            {/* Mevcut Tipler */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-100 dark:border-slate-800">
                                <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                    Mevcut Antrenman Tipleri
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(workoutTypes || []).map(type => (
                                        <div
                                            key={type}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-slate-700 text-sm group text-gray-700 dark:text-slate-300"
                                        >
                                            <span>{type}</span>
                                            <button
                                                onClick={() => onRemoveWorkoutType(type)}
                                                className="text-red-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition ml-1"
                                                title="Sil"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* YENİ: Renk Antrenman Eşleşmeleri */}
                    {activeTab === 'colors' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    Antrenman tiplerine özel renkler atayın. Gün düzenlerken seçtiğiniz tipe göre günün rengi otomatik ayarlanır.
                                </p>

                                <div className="space-y-2">
                                    {workoutTypes.map(type => {
                                        const currentColor = workoutColors?.[type] || '#9ca3af';

                                        return (
                                            <div key={type} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{type}</span>

                                                <button
                                                    onClick={() => setExpandedType(type)} // expandedType'ı artık aktif modal tipi olarak kullanıyoruz
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <span className="text-xs text-gray-500 font-mono">{currentColor}</span>
                                                    <div
                                                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 shadow-inner"
                                                        style={{ backgroundColor: currentColor }}
                                                    />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Color Picker Modal Overlay */}
                    {expandedType && activeTab === 'colors' && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setExpandedType(null)}
                            />

                            {/* Modal */}
                            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs border border-gray-100 dark:border-slate-800 animation-expand">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                        {expandedType} Rengi
                                    </h3>
                                    <button
                                        onClick={() => setExpandedType(null)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <WheelColorPicker
                                    color={workoutColors?.[expandedType] || '#9ca3af'}
                                    onChange={(newColor) => onUpdateWorkoutColor(expandedType, newColor)}
                                />

                                <button
                                    onClick={() => setExpandedType(null)}
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl transition-colors"
                                >
                                    Kaydet & Kapat
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Program Tab */}
                    {activeTab === 'program' && (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-3">📅 Program Başlangıç Tarihi</h4>
                                <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                                    Bu tarih, 1. Haftanın başlangıcı olarak kabul edilir. Hafta numaraları bu tarihe göre hesaplanır.
                                </p>
                                <input
                                    type="date"
                                    value={startDate ? startDate.split('T')[0] : ''}
                                    onChange={(e) => {
                                        if (onUpdateStartDate && e.target.value) {
                                            onUpdateStartDate(new Date(e.target.value).toISOString());
                                        }
                                    }}
                                    className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {startDate && (
                                    <p className="mt-3 text-xs text-indigo-600 dark:text-indigo-400">
                                        Mevcut başlangıç: {new Date(startDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition font-semibold shadow-lg"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
