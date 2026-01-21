import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BodyDiagram from './BodyDiagram';

export default function ExerciseEditor({
    isOpen,
    onClose,
    exerciseName,
    exerciseIndex,
    exerciseDetails,
    muscleGroups,
    workoutTypes,
    onSave
}) {
    const [name, setName] = useState(exerciseName || '');
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [selectedWorkoutType, setSelectedWorkoutType] = useState('');
    const [targetReps, setTargetReps] = useState('');
    const [selectionMode, setSelectionMode] = useState('buttons'); // 'buttons' or 'body'

    useEffect(() => {
        if (isOpen) {
            setName(exerciseName || '');
            setSelectedMuscles(exerciseDetails?.muscles || []);
            setSelectedWorkoutType(exerciseDetails?.workoutType || '');
            setTargetReps(exerciseDetails?.targetReps || '');
        }
    }, [isOpen, exerciseName, exerciseDetails]);

    if (!isOpen) return null;

    // Kas gruplarını kategorilere göre grupla
    const groupedMuscles = Object.values(muscleGroups || {}).reduce((acc, muscle) => {
        const category = muscle.category || 'Diğer';
        if (!acc[category]) acc[category] = [];
        acc[category].push(muscle);
        return acc;
    }, {});

    const toggleMuscle = (muscleId) => {
        setSelectedMuscles(prev =>
            prev.includes(muscleId)
                ? prev.filter(m => m !== muscleId)
                : [...prev, muscleId]
        );
    };

    const handleSave = () => {
        onSave({
            name: name.trim(),
            muscles: selectedMuscles,
            workoutType: selectedWorkoutType,
            targetReps: targetReps.trim()
        });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <h3 className="text-lg font-bold text-white">Egzersiz Düzenle</h3>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1 space-y-4">
                    {/* Egzersiz İsmi */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Egzersiz İsmi
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Örn: Bench Press"
                        />
                    </div>

                    {/* Hedef Set/Tekrar */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Hedef Set × Tekrar
                        </label>
                        <input
                            type="text"
                            value={targetReps}
                            onChange={(e) => setTargetReps(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Örn: 3×12-14, 4×8-10, 5×5"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Bu hafta için hedeflenen set ve tekrar sayısı
                        </p>
                    </div>

                    {/* Antrenman Tipi */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Antrenman Tipi
                        </label>
                        <select
                            value={selectedWorkoutType}
                            onChange={(e) => setSelectedWorkoutType(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                        >
                            <option value="">Seçiniz...</option>
                            {(workoutTypes || []).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Kas Grupları - Mode Selector */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Çalışan Kas Grupları
                            </label>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setSelectionMode('buttons')}
                                    className={`px-2 py-1 text-xs rounded transition ${selectionMode === 'buttons'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    📝 Liste
                                </button>
                                <button
                                    onClick={() => setSelectionMode('body')}
                                    className={`px-2 py-1 text-xs rounded transition ${selectionMode === 'body'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    🏃 Vücut
                                </button>
                            </div>
                        </div>

                        {selectionMode === 'body' ? (
                            /* Body Diagram View */
                            <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                                <BodyDiagram
                                    selectedMuscles={selectedMuscles}
                                    onToggleMuscle={toggleMuscle}
                                    muscleGroups={muscleGroups}
                                />
                            </div>
                        ) : (
                            /* Button List View */
                            <div className="space-y-3">
                                {Object.entries(groupedMuscles).map(([category, muscles]) => (
                                    <div key={category} className="bg-gray-50 rounded-lg p-3">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            {category}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {muscles.map(muscle => (
                                                <button
                                                    key={muscle.id}
                                                    onClick={() => toggleMuscle(muscle.id)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedMuscles.includes(muscle.id)
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    {muscle.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Seçilen kaslar özeti */}
                        {selectedMuscles.length > 0 && (
                            <div className="mt-3 p-2 bg-indigo-50 rounded-lg">
                                <span className="text-xs text-indigo-600 font-medium">
                                    Seçili: {selectedMuscles.map(id => muscleGroups[id]?.label || id).filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition font-medium"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md"
                    >
                        Kaydet
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
