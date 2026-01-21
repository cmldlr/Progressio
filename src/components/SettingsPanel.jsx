import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function SettingsPanel({
    isOpen,
    onClose,
    muscleGroups,
    workoutTypes,
    onAddMuscleGroup,
    onRemoveMuscleGroup,
    onAddWorkoutType,
    onRemoveWorkoutType
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
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-700 to-gray-900">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>⚙️</span> Ayarlar
                    </h3>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('muscles')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'muscles'
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        💪 Kas Grupları
                    </button>
                    <button
                        onClick={() => setActiveTab('workouts')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'workouts'
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        🏋️ Antrenman Tipleri
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    {activeTab === 'muscles' && (
                        <div className="space-y-4">
                            {/* Yeni Kas Grubu Ekle */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-green-800 mb-3">+ Yeni Kas Grubu Ekle</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        placeholder="İsim (örn: Trapez)"
                                        value={newMuscleLabel}
                                        onChange={(e) => setNewMuscleLabel(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Kategori (örn: Sırt)"
                                        value={newMuscleCategory}
                                        onChange={(e) => setNewMuscleCategory(e.target.value)}
                                        list="categories"
                                        className="p-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <datalist id="categories">
                                        {existingCategories.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                    <button
                                        onClick={handleAddMuscle}
                                        className="bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>

                            {/* Mevcut Kas Grupları */}
                            <div className="space-y-3">
                                {Object.entries(groupedMuscles).map(([category, muscles]) => (
                                    <div key={category} className="bg-gray-50 rounded-lg p-3">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            {category}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {muscles.map(muscle => (
                                                <div
                                                    key={muscle.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-sm group"
                                                >
                                                    <span>{muscle.label}</span>
                                                    <button
                                                        onClick={() => onRemoveMuscleGroup(muscle.id)}
                                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition ml-1"
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
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-blue-800 mb-3">+ Yeni Antrenman Tipi Ekle</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Örn: Upper Body, Arms Day..."
                                        value={newWorkoutType}
                                        onChange={(e) => setNewWorkoutType(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddWorkoutType()}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <button
                                        onClick={handleAddWorkoutType}
                                        className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>

                            {/* Mevcut Tipler */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                    Mevcut Antrenman Tipleri
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(workoutTypes || []).map(type => (
                                        <div
                                            key={type}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-sm group"
                                        >
                                            <span>{type}</span>
                                            <button
                                                onClick={() => onRemoveWorkoutType(type)}
                                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition ml-1"
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
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
