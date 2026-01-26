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
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: 0
            }}
            onClick={onClose}
        >
            {/* Modal Container - Mobilde tam ekran, masaüstünde normal */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '42rem',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '100dvh',
                    overflow: 'hidden'
                }}
                className="bg-white dark:bg-slate-900 sm:rounded-2xl sm:max-h-[85vh] sm:m-4 transition-colors"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Sticky */}
                <div
                    style={{ borderBottom: '1px solid #f3f4f6', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
                    className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-white dark:bg-slate-900 dark:border-slate-800 transition-colors"
                >
                    {/* Mobile drag handle */}
                    <div style={{ width: '40px', height: '4px', backgroundColor: '#d1d5db', borderRadius: '9999px', margin: '0 auto 12px auto' }} className="sm:hidden" />

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {isNew ? 'Yeni Egzersiz' : 'Egzersiz Düzenle'}
                    </h3>

                    {/* Renk seçici - Mobilde scroll edilebilir yatay liste */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400 flex-shrink-0">Renk:</span>
                        <div className="flex gap-2 flex-shrink-0">
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedColor(c.id)}
                                    title={c.label}
                                    style={{
                                        backgroundColor: c.id === 'gray' ? '#9ca3af' :
                                            c.id === 'red' ? '#ef4444' :
                                                c.id === 'blue' ? '#3b82f6' :
                                                    c.id === 'green' ? '#10b981' :
                                                        c.id === 'yellow' ? '#f59e0b' :
                                                            c.id === 'purple' ? '#8b5cf6' :
                                                                c.id === 'orange' ? '#f97316' : '#6b7280'
                                    }}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all flex-shrink-0 ${selectedColor === c.id
                                        ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 border-white'
                                        : 'border-white/50 hover:scale-105'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div style={{ flex: 1, overflowY: 'auto' }} className="bg-white dark:bg-slate-900 transition-colors">
                    <div style={{ padding: '16px' }} className="space-y-4">

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
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '16px',
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    color: '#111827'
                                }}
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
                <div
                    style={{
                        flexShrink: 0,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
                    }}
                    className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 transition-colors"
                >
                    {!isNew && onDelete && (
                        <button
                            onClick={onDelete}
                            style={{ padding: '10px', color: '#ef4444', borderRadius: '12px' }}
                            title="Sil"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    <div style={{ flex: 1 }} />

                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 16px',
                            color: '#4b5563',
                            borderRadius: '12px',
                            fontWeight: 500,
                            fontSize: '14px',
                            backgroundColor: 'transparent'
                        }}
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: name.trim() ? '#4f46e5' : '#d1d5db',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '14px',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                            cursor: name.trim() ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isNew ? 'Ekle' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
