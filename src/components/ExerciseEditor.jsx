import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BodyDiagram from './BodyDiagram';
import {
    COLOR_OPTIONS,
    getPreviewClasses,
    extractColorId
} from '../utils/themeColors';

export default function ExerciseEditor({
    isOpen,
    onClose,
    isNew = false,
    exerciseName,
    exerciseIndex,
    exerciseDetails,
    muscleGroups,
    workoutTypes,
    rowColor,
    onSave,
    onDelete
}) {
    const [name, setName] = useState(exerciseName || '');
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [selectedWorkoutType, setSelectedWorkoutType] = useState('');
    const [targetReps, setTargetReps] = useState('');
    const [selectedColor, setSelectedColor] = useState(extractColorId(rowColor) || 'gray');
    const [selectionMode, setSelectionMode] = useState('buttons'); // 'buttons' or 'body'

    useEffect(() => {
        if (isOpen) {
            setName(exerciseName || '');
            setSelectedMuscles(exerciseDetails?.muscles || []);
            setSelectedWorkoutType(exerciseDetails?.workoutType || '');
            setTargetReps(exerciseDetails?.targetReps || '');
            setSelectedColor(extractColorId(rowColor) || 'gray');
        }
    }, [isOpen, exerciseName, exerciseDetails, rowColor]);

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
            targetReps: targetReps.trim(),
            rowColor: selectedColor
        });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800 transition-all"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isNew ? 'Yeni Egzersiz Ekle' : 'Egzersiz Düzenle'}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            {isNew ? 'Antrenman programınıza yeni bir hareket ekleyin.' : 'Egzersiz detaylarını güncelleyin.'}
                        </p>
                    </div>
                    {/* Color Picker (Mini) */}
                    <div className="flex gap-1.5 p-1.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                        {COLOR_OPTIONS.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedColor(c.id)}
                                title={c.label}
                                className={`w-6 h-6 rounded-md border transition-all ${getPreviewClasses(c.id)} ${selectedColor === c.id ? 'ring-2 ring-indigo-500 scale-110 border-indigo-300 dark:border-indigo-500' : 'hover:scale-105'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Row 1: Name & Reps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Egzersiz İsmi */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                Egzersiz İsmi
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition dark:text-white"
                                placeholder="Örn: Bench Press"
                                autoFocus={isNew}
                            />
                        </div>

                        {/* Hedef Set/Tekrar */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                Hedef Set × Tekrar
                            </label>
                            <input
                                type="text"
                                value={targetReps}
                                onChange={(e) => setTargetReps(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition dark:text-white"
                                placeholder="Örn: 3×12, 4×8-10"
                            />
                        </div>
                    </div>

                    {/* Antrenman Tipi */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                            Antrenman Tipi
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(workoutTypes || []).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedWorkoutType(type === selectedWorkoutType ? '' : type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${selectedWorkoutType === type
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-750'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kas Grupları - Mode Selector */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                                Çalışan Kas Grupları
                            </label>
                            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setSelectionMode('buttons')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${selectionMode === 'buttons'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Liste
                                </button>
                                <button
                                    onClick={() => setSelectionMode('body')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${selectionMode === 'body'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Vücut
                                </button>
                            </div>
                        </div>

                        {selectionMode === 'body' ? (
                            /* Body Diagram View */
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 flex justify-center border border-gray-100 dark:border-slate-700">
                                <BodyDiagram
                                    selectedMuscles={selectedMuscles}
                                    onToggleMuscle={toggleMuscle}
                                    muscleGroups={muscleGroups}
                                />
                            </div>
                        ) : (
                            /* Button List View */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(groupedMuscles).map(([category, muscles]) => (
                                    <div key={category} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-800">
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 ml-1">
                                            {category}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {muscles.map(muscle => (
                                                <button
                                                    key={muscle.id}
                                                    onClick={() => toggleMuscle(muscle.id)}
                                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${selectedMuscles.includes(muscle.id)
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
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
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3 z-10">
                    {!isNew && onDelete && (
                        <button
                            onClick={onDelete}
                            className="mr-auto px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition font-medium text-sm flex items-center gap-2"
                        >
                            <span className="text-lg leading-none">🗑️</span> <span className="hidden sm:inline">Sil</span>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition font-medium text-sm"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium shadow-lg shadow-indigo-600/20 text-sm flex items-center gap-2"
                    >
                        {isNew ? 'Egzersizi Ekle' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
