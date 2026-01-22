import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    THEME_COLORS,
    COLOR_OPTIONS,
    getPreviewClasses,
    extractColorId
} from '../utils/themeColors';

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
    onUpdateWorkoutColor
}) {
    const [activeTab, setActiveTab] = useState('muscles');

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
                <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setActiveTab('muscles')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'muscles'
                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        💪 Kas Grupları
                    </button>
                    <button
                        onClick={() => setActiveTab('workouts')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'workouts'
                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        🏋️ Tipler
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'colors'
                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        🎨 Renkler
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
                    {activeTab === 'muscles' && (
                        <div className="space-y-4">
                            {/* Yeni Kas Grubu Ekle */}
                            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-3">+ Yeni Kas Grubu Ekle</h4>
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
                                        className="bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition font-medium text-sm"
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
                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">+ Yeni Antrenman Tipi Ekle</h4>
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
                                        className="px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium text-sm"
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
                            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4">
                                <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">
                                    Hangi rengin hangi antrenman tipini temsil ettiğini buradan ayarlayabilirsiniz.
                                    Bu seçim, "Sütunu Düzenle" ekranındaki butonların işlevini belirler.
                                </p>

                                <div className="grid gap-3">
                                    {workoutColors && Object.entries(workoutColors).map(([className, config]) => {
                                        const colorId = extractColorId(className);

                                        return (
                                            <div key={className} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                                                {/* Renk Göstergesi - Tema uyumlu */}
                                                <div className={`w-10 h-10 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center ${getPreviewClasses(colorId)}`}>
                                                    <span className="text-xs font-bold opacity-60">{config.label[0]}</span>
                                                </div>

                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-gray-700 dark:text-slate-200">{config.label}</h5>
                                                </div>

                                                {/* Antrenman Tipi Seçimi */}
                                                <select
                                                    value={config.type}
                                                    onChange={(e) => onUpdateWorkoutColor(className, e.target.value)}
                                                    className="p-2 border border-gray-300 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="Off">Off</option>
                                                    {workoutTypes.map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-700 dark:bg-slate-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
