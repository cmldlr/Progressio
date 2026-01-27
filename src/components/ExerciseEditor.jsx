import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BodyDiagram from './BodyDiagram';
import CustomColorPicker from './CustomColorPicker'; // NEW IMPORT
import {
    COLOR_OPTIONS,
    getPreviewStyles,
    extractColorId,
    THEME_COLORS
} from '../utils/themeColors';
import { X, Check, Search, ChevronDown, Palette, ChevronUp } from 'lucide-react';

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
    const [selectedColor, setSelectedColor] = useState(extractColorId(rowColor) || '#3b82f6'); // Default blue hex if empty
    const [selectionMode, setSelectionMode] = useState('buttons');
    const [isComboboxOpen, setIsComboboxOpen] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false); // Toggle picker visibility
    const inputRef = useRef(null);


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

    // Otomatik Seçim Haritası (Kısaltıldı..)
    // ...

    // ... (Existing useEffects) ...
    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setName(exerciseName || '');
            setSelectedMuscles(exerciseDetails?.muscles || []);
            setSelectedWorkoutType(exerciseDetails?.workoutType || '');
            setTargetReps(exerciseDetails?.targetReps || '');
            setSelectedColor(extractColorId(rowColor) || '#3b82f6');
            setSelectionMode('buttons');
            setIsComboboxOpen(false);
            setShowColorPicker(false); // Reset color picker visibility
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; }
    }, [isOpen, exerciseName, exerciseDetails, rowColor]);


    // Validation for hex vs preset
    const isCustomColor = (color) => color && color.startsWith('#');

    // ... (Existing helpers) ...
    const handleNameSelect = (selectedName) => {
        // ... (Kısaltıldı)
        setName(selectedName);
        setIsComboboxOpen(false);
        // ...
    };

    // ...

    // Helper to get button style (simplified for HEX usage)
    const getButtonStyle = (color) => {
        return { backgroundColor: color };
    };


    if (!isOpen) return null;

    // ... groupedMuscles ... (Kısaltıldı) ...
    const groupedMuscles = Object.values(muscleGroups || {}).reduce((acc, muscle) => {
        const category = muscle.category || 'Diğer';
        if (!acc[category]) acc[category] = [];
        acc[category].push(muscle);
        return acc;
    }, {});


    const toggleMuscle = (muscleId) => {
        // ... (Kısaltıldı)
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full h-[95dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out transform translate-y-0">

                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-20 relative rounded-t-3xl sm:rounded-t-2xl">
                    {/* Mobile Handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full sm:hidden" />

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 sm:mt-0">
                        {isNew ? 'Yeni Egzersiz' : 'Egzersiz Düzenle'}
                    </h3>

                    <div className="flex items-center gap-2">
                        {/* Color Trigger (Mobile & Desktop) */}
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showColorPicker ? 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-600' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <div
                                className="w-6 h-6 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm"
                                style={{ backgroundColor: selectedColor }}
                            />
                            {showColorPicker ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:flex"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modern Color Picker Expansion */}
                {showColorPicker && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-slate-800 animation-expand">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Renk Seçimi</span>
                            <span className="text-xs font-mono text-gray-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">{selectedColor}</span>
                        </div>
                        <CustomColorPicker
                            color={selectedColor}
                            onChange={setSelectedColor}
                        />
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Exercise Name Input */}
                    <div className="relative" ref={inputRef}>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Egzersiz İsmi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setIsComboboxOpen(true);
                                }}
                                onFocus={() => setIsComboboxOpen(true)}
                                onBlur={() => setTimeout(() => setIsComboboxOpen(false), 200)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white transition-all font-medium text-lg placeholder:text-gray-400"
                                placeholder="Egzersiz ara..."
                            />
                        </div>

                        {/* Autocomplete Dropdown */}
                        {isComboboxOpen && filteredExercises.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {filteredExercises.map((ex, i) => (
                                    <button
                                        key={i}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleNameSelect(ex);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 text-sm border-b last:border-0 border-gray-100 dark:border-slate-700/50 flex items-center justify-between group"
                                    >
                                        {ex}
                                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Target Reps */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Hedef (Set x Tekrar)
                            </label>
                            <input
                                type="text"
                                value={targetReps}
                                onChange={(e) => setTargetReps(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white transition-all text-center font-medium"
                                placeholder="3 x 12"
                            />
                        </div>

                        {/* Workout Type */}
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Antrenman Tipi
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedWorkoutType}
                                    onChange={(e) => setSelectedWorkoutType(e.target.value)}
                                    className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white transition-all font-medium pr-10"
                                >
                                    <option value="">Seçiniz...</option>
                                    {(workoutTypes || []).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Muscle Groups */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Kas Grupları
                            </label>
                            {/* Toggle View Buttons */}
                            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setSelectionMode('buttons')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectionMode === 'buttons'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                                        }`}
                                >
                                    Liste
                                </button>
                                <button
                                    onClick={() => setSelectionMode('body')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectionMode === 'body'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                                        }`}
                                >
                                    Vücut
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 min-h-[300px]">
                            {selectionMode === 'body' ? (
                                <div className="flex justify-center h-full">
                                    <BodyDiagram
                                        selectedMuscles={selectedMuscles}
                                        onToggleMuscle={toggleMuscle}
                                        muscleGroups={muscleGroups}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(groupedMuscles).map(([category, muscles]) => (
                                        <div key={category}>
                                            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-wider">
                                                {category}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {muscles.map(muscle => (
                                                    <button
                                                        key={muscle.id}
                                                        onClick={() => toggleMuscle(muscle.id)}
                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedMuscles.includes(muscle.id)
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-300'
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

                {/* Footer Buttons */}
                <div className="flex-none p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sm:rounded-b-2xl pb-safe">
                    <div className="flex gap-3">
                        {!isNew && onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-3.5 rounded-xl text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
                        >
                            {isNew ? 'Egzersiz Ekle' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Icons (if not imported from lucide-react globally in your project, ensure these are available)
// Adding minimal icon definition for safety if standard import fails
const ArrowUpRight = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" /></svg>
);
const Trash2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
