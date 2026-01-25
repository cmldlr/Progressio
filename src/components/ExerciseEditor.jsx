import React, { useState, useEffect, useRef } from 'react';
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
    const [selectionMode, setSelectionMode] = useState('buttons');
    const [isComboboxOpen, setIsComboboxOpen] = useState(false);
    const inputRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({});

    const COMMON_EXERCISES = [
        'Abductor Machine', 'Adductor Machine', 'Arnold Press', 'Barbell Curl', 'Barbell Row',
        'Bench Press', 'Bicep Curl', 'Bulgarian Split Squat', 'Cable Crossover',
        'Cable Lateral Raise', 'Calf Raise', 'Chest Fly', 'Chest Press', 'Chin Up',
        'Deadlift', 'Dips', 'Face Pull', 'Front Raise', 'Glute Bridge', 'Hack Squat',
        'Hammer Curl', 'Hip Thrust', 'Incline Bench Press', 'Incline Dumbbell Press',
        'Lat Pulldown', 'Lateral Raise', 'Leg Curl', 'Leg Extension', 'Leg Press', 'Lunges',
        'One Arm Dumbbell Row', 'Overhead Press', 'Pec Deck', 'Plank', 'Preacher Curl',
        'Pull Up', 'Push Up', 'Reverse Fly', 'Romanian Deadlift', 'Seated Row',
        'Shoulder Press', 'Shrugs', 'Skullcrusher', 'Squat', 'Sumo Deadlift',
        'Tricep Extension', 'Tricep Pushdown', 'Upright Row', 'Walking Lunges'
    ].sort((a, b) => a.localeCompare(b, 'tr'));

    // Dropdown pozisyon hesaplama
    useEffect(() => {
        if (isComboboxOpen && inputRef.current) {
            const updatePosition = () => {
                const rect = inputRef.current.getBoundingClientRect();
                setDropdownPos({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width
                });
            };
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isComboboxOpen]);

    // Modal açıldığında state'leri sıfırla
    useEffect(() => {
        if (isOpen) {
            setName(exerciseName || '');
            setSelectedMuscles(exerciseDetails?.muscles || []);
            setSelectedWorkoutType(exerciseDetails?.workoutType || '');
            setTargetReps(exerciseDetails?.targetReps || '');
            setSelectedColor(extractColorId(rowColor) || 'gray');
            setSelectionMode('buttons'); // Mobil için varsayılan olarak liste
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

    const filteredExercises = COMMON_EXERCISES.filter(ex =>
        ex.toLocaleLowerCase('tr').includes(name.toLocaleLowerCase('tr'))
    );

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={onClose}
        >
            {/* Modal Container - Mobilde tam ekran, masaüstünde normal */}
            <div
                className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col border-0 sm:border border-gray-100 dark:border-slate-800 max-h-[100dvh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Sticky */}
                <div className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-t-2xl">
                    {/* Mobile drag handle */}
                    <div className="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-3 sm:hidden" />

                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                                {isNew ? 'Yeni Egzersiz' : 'Egzersiz Düzenle'}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                                {isNew ? 'Programınıza yeni bir hareket ekleyin' : 'Detayları güncelleyin'}
                            </p>
                        </div>

                        {/* Renk seçici - Compact */}
                        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                            {COLOR_OPTIONS.slice(0, 6).map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedColor(c.id)}
                                    title={c.label}
                                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 transition-all ${getPreviewClasses(c.id)} ${selectedColor === c.id ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : 'hover:scale-105 border-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    <div className="px-4 sm:px-6 py-4 space-y-4">

                        {/* Egzersiz İsmi */}
                        <div ref={inputRef}>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                Egzersiz İsmi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setIsComboboxOpen(true);
                                }}
                                onFocus={() => setIsComboboxOpen(true)}
                                onBlur={() => setTimeout(() => setIsComboboxOpen(false), 150)}
                                className="w-full px-4 py-3 text-base bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition dark:text-white"
                                placeholder="Örn: Bench Press"
                                autoComplete="off"
                            />

                            {/* Dropdown - Portal */}
                            {isComboboxOpen && filteredExercises.length > 0 && createPortal(
                                <div
                                    className="fixed z-[9999] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <div className="max-h-64 overflow-y-auto">
                                        {filteredExercises.map((ex, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setName(ex);
                                                    setIsComboboxOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 text-sm transition-colors border-b last:border-0 border-gray-100 dark:border-slate-700/50"
                                            >
                                                {ex}
                                            </button>
                                        ))}
                                    </div>
                                </div>,
                                document.body
                            )}
                        </div>

                        {/* Hedef Set/Tekrar */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                Hedef Set × Tekrar
                            </label>
                            <input
                                type="text"
                                value={targetReps}
                                onChange={(e) => setTargetReps(e.target.value)}
                                className="w-full px-4 py-3 text-base bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition dark:text-white"
                                placeholder="Örn: 3×12"
                            />
                        </div>

                        {/* Antrenman Tipi */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Antrenman Tipi
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(workoutTypes || []).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedWorkoutType(type === selectedWorkoutType ? '' : type)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border touch-manipulation ${selectedWorkoutType === type
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 active:bg-gray-100 dark:active:bg-slate-700'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Kas Grupları Bölümü */}
                        <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300">
                                    Kas Grupları
                                    {selectedMuscles.length > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">
                                            {selectedMuscles.length} seçili
                                        </span>
                                    )}
                                </label>

                                {/* View toggle - Sadece masaüstünde */}
                                <div className="hidden sm:flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg">
                                    <button
                                        onClick={() => setSelectionMode('buttons')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition ${selectionMode === 'buttons'
                                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-slate-400'
                                            }`}
                                    >
                                        Liste
                                    </button>
                                    <button
                                        onClick={() => setSelectionMode('body')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition ${selectionMode === 'body'
                                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-slate-400'
                                            }`}
                                    >
                                        Vücut
                                    </button>
                                </div>
                            </div>

                            {/* Mobilde her zaman liste, masaüstünde seçime göre */}
                            <div className="sm:hidden">
                                {/* Mobile: Compact Muscle Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(groupedMuscles).map(([category, muscles]) => (
                                        <div key={category} className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2">
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1.5">
                                                {category}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {muscles.map(muscle => (
                                                    <button
                                                        key={muscle.id}
                                                        onClick={() => toggleMuscle(muscle.id)}
                                                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all touch-manipulation ${selectedMuscles.includes(muscle.id)
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-600'
                                                            }`}
                                                    >
                                                        {muscle.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop view */}
                            <div className="hidden sm:block">
                                {selectionMode === 'body' ? (
                                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 flex justify-center overflow-y-auto max-h-[450px]">
                                        <BodyDiagram
                                            selectedMuscles={selectedMuscles}
                                            onToggleMuscle={toggleMuscle}
                                            muscleGroups={muscleGroups}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {Object.entries(groupedMuscles).map(([category, muscles]) => (
                                            <div key={category} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-800">
                                                <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                                    {category}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {muscles.map(muscle => (
                                                        <button
                                                            key={muscle.id}
                                                            onClick={() => toggleMuscle(muscle.id)}
                                                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${selectedMuscles.includes(muscle.id)
                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-300'
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
                    </div>
                </div>

                {/* Footer - Sticky */}
                <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 sm:gap-3 safe-area-inset-bottom">
                    {!isNew && onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                            title="Sil"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    <div className="flex-1" />

                    <button
                        onClick={onClose}
                        className="px-4 sm:px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium text-sm"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="px-5 sm:px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition font-semibold text-sm shadow-lg shadow-indigo-600/20"
                    >
                        {isNew ? 'Ekle' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
