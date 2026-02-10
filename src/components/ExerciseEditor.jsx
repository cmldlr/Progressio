import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BodyDiagramSVG from './BodyDiagramSVG';
import WheelColorPicker from './WheelColorPicker';
import {
    COLOR_OPTIONS,
    extractColorId,
    colorIdToHex
} from '../utils/themeColors';
import { X, Check, Search, ChevronDown, Palette, ChevronUp, Minus, Plus } from 'lucide-react';

export default function ExerciseEditor({
    isOpen,
    onClose,
    isNew = false,
    exerciseName,
    exerciseDetails,
    muscleGroups,
    workoutTypes,
    rowColor,
    onSave,
    onDelete
}) {
    const [name, setName] = useState(exerciseName || '');
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState([]); // Changed to array
    const [targetReps, setTargetReps] = useState('');
    const [setCount, setSetCount] = useState(3);
    const [repMin, setRepMin] = useState(12);
    const [repMax, setRepMax] = useState(12);
    const [rangeMode, setRangeMode] = useState(false); // false = single rep, true = rep range
    const [freeTextMode, setFreeTextMode] = useState(false);
    const [selectedColor, setSelectedColor] = useState(colorIdToHex(extractColorId(rowColor)));
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

    // Otomatik Seçim Haritası - TÜM COMMON_EXERCISES için default değerler
    const EXERCISE_DEFAULTS = {
        // Push Exercises
        'Arnold Press': { workoutType: 'Push', muscles: ['front_delt', 'side_delt'] },
        'Bench Press': { workoutType: 'Push', muscles: ['mid_chest', 'front_delt', 'triceps'] },
        'Cable Crossover': { workoutType: 'Push', muscles: ['mid_chest', 'lower_chest'] },
        'Cable Lateral Raise': { workoutType: 'Push', muscles: ['side_delt'] },
        'Chest Fly': { workoutType: 'Push', muscles: ['mid_chest'] },
        'Chest Press': { workoutType: 'Push', muscles: ['mid_chest', 'triceps'] },
        'Dips': { workoutType: 'Push', muscles: ['lower_chest', 'triceps'] },
        'Front Raise': { workoutType: 'Push', muscles: ['front_delt'] },
        'Incline Bench Press': { workoutType: 'Push', muscles: ['upper_chest', 'front_delt'] },
        'Incline Dumbbell Press': { workoutType: 'Push', muscles: ['upper_chest', 'front_delt'] },
        'Lateral Raise': { workoutType: 'Push', muscles: ['side_delt'] },
        'Overhead Press': { workoutType: 'Push', muscles: ['front_delt', 'triceps'] },
        'Pec Deck': { workoutType: 'Push', muscles: ['mid_chest'] },
        'Push Up': { workoutType: 'Push', muscles: ['mid_chest', 'triceps', 'front_delt'] },
        'Shoulder Press': { workoutType: 'Push', muscles: ['front_delt', 'side_delt', 'triceps'] },
        'Skullcrusher': { workoutType: 'Push', muscles: ['triceps'] },
        'Tricep Extension': { workoutType: 'Push', muscles: ['triceps'] },
        'Tricep Pushdown': { workoutType: 'Push', muscles: ['triceps'] },

        // Pull Exercises
        'Barbell Curl': { workoutType: 'Pull', muscles: ['biceps'] },
        'Barbell Row': { workoutType: 'Pull', muscles: ['lats', 'rhomboids'] },
        'Bicep Curl': { workoutType: 'Pull', muscles: ['biceps'] },
        'Chin Up': { workoutType: 'Pull', muscles: ['lats', 'biceps'] },
        'Deadlift': { workoutType: 'Pull', muscles: ['lower_back', 'glutes', 'hamstrings'] },
        'Face Pull': { workoutType: 'Pull', muscles: ['rear_delt', 'rhomboids'] },
        'Hammer Curl': { workoutType: 'Pull', muscles: ['biceps', 'forearm'] },
        'Lat Pulldown': { workoutType: 'Pull', muscles: ['lats', 'biceps'] },
        'One Arm Dumbbell Row': { workoutType: 'Pull', muscles: ['lats', 'rhomboids'] },
        'Preacher Curl': { workoutType: 'Pull', muscles: ['biceps'] },
        'Pull Up': { workoutType: 'Pull', muscles: ['lats', 'biceps'] },
        'Reverse Fly': { workoutType: 'Pull', muscles: ['rear_delt', 'rhomboids'] },
        'Seated Row': { workoutType: 'Pull', muscles: ['lats', 'rhomboids', 'traps'] },
        'Shrugs': { workoutType: 'Pull', muscles: ['traps'] },
        'Sumo Deadlift': { workoutType: 'Pull', muscles: ['lower_back', 'glutes', 'inner_thigh'] },
        'Upright Row': { workoutType: 'Pull', muscles: ['traps', 'side_delt'] },

        // Leg Exercises
        'Abductor Machine': { workoutType: 'Legs', muscles: ['glutes'] },
        'Adductor Machine': { workoutType: 'Legs', muscles: ['inner_thigh'] },
        'Bulgarian Split Squat': { workoutType: 'Legs', muscles: ['quads', 'glutes'] },
        'Calf Raise': { workoutType: 'Legs', muscles: ['calves'] },
        'Glute Bridge': { workoutType: 'Legs', muscles: ['glutes', 'hamstrings'] },
        'Hack Squat': { workoutType: 'Legs', muscles: ['quads', 'glutes'] },
        'Hip Thrust': { workoutType: 'Legs', muscles: ['glutes', 'hamstrings'] },
        'Leg Curl': { workoutType: 'Legs', muscles: ['hamstrings'] },
        'Leg Extension': { workoutType: 'Legs', muscles: ['quads'] },
        'Leg Press': { workoutType: 'Legs', muscles: ['quads', 'glutes'] },
        'Lunges': { workoutType: 'Legs', muscles: ['quads', 'glutes', 'hamstrings'] },
        'Romanian Deadlift': { workoutType: 'Legs', muscles: ['hamstrings', 'glutes', 'lower_back'] },
        'Squat': { workoutType: 'Legs', muscles: ['quads', 'glutes', 'lower_back'] },
        'Walking Lunges': { workoutType: 'Legs', muscles: ['quads', 'glutes', 'hamstrings'] },

        // Core Exercises
        'Crunch': { workoutType: 'Core', muscles: ['abs'] },
        'Plank': { workoutType: 'Core', muscles: ['abs', 'core'] }
    };

    // ... (Existing useEffects) ...
    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setName(exerciseName || '');
            setSelectedMuscles(exerciseDetails?.muscles || []);
            const existingTypes = exerciseDetails?.workoutTypes ||
                (exerciseDetails?.workoutType ? [exerciseDetails.workoutType] : []);
            setSelectedWorkoutTypes(existingTypes);
            const rawReps = exerciseDetails?.targetReps || '';
            setTargetReps(rawReps);
            // Parse formats: "3 x 6-8", "3 x 12", "3 x Max"
            const matchRange = rawReps.match(/^\s*(\d+)\s*[xX×]\s*(\d+)\s*[-–]\s*(\d+)\s*$/);
            const matchMax = rawReps.match(/^\s*(\d+)\s*[xX×]\s*[Mm]ax\s*$/);
            const matchSingle = rawReps.match(/^\s*(\d+)\s*[xX×]\s*(\d+)\s*$/);
            if (matchRange) {
                setSetCount(parseInt(matchRange[1], 10));
                setRepMin(parseInt(matchRange[2], 10));
                setRepMax(parseInt(matchRange[3], 10));
                setRangeMode(true);
                setFreeTextMode(false);
            } else if (matchMax) {
                setSetCount(parseInt(matchMax[1], 10));
                setRepMin(0); // 0 = Max
                setRepMax(0);
                setRangeMode(false);
                setFreeTextMode(false);
            } else if (matchSingle) {
                setSetCount(parseInt(matchSingle[1], 10));
                setRepMin(parseInt(matchSingle[2], 10));
                setRepMax(parseInt(matchSingle[2], 10));
                setRangeMode(false);
                setFreeTextMode(false);
            } else if (rawReps.trim()) {
                setFreeTextMode(true);
            } else {
                setSetCount(3);
                setRepMin(12);
                setRepMax(12);
                setRangeMode(false);
                setFreeTextMode(false);
            }
            setSelectedColor(colorIdToHex(extractColorId(rowColor)));
            setSelectionMode('buttons');
            setIsComboboxOpen(false);
            setShowColorPicker(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; }
    }, [isOpen, exerciseName, exerciseDetails, rowColor]);


    // ... (Existing helpers) ...
    const handleNameSelect = (selectedName) => {
        setName(selectedName);
        setIsComboboxOpen(false);

        // Otomatik Doldurma Mantığı
        const defaults = EXERCISE_DEFAULTS[selectedName];
        if (defaults) {
            // workoutTypes array veya workoutType string olabilir
            if (defaults.workoutTypes) {
                setSelectedWorkoutTypes(defaults.workoutTypes);
            } else if (defaults.workoutType) {
                setSelectedWorkoutTypes([defaults.workoutType]);
            }
            if (defaults.muscles) {
                setSelectedMuscles(defaults.muscles);
            }
        }
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
        let finalReps;
        if (freeTextMode) {
            finalReps = targetReps.trim();
        } else if (repMin === 0) {
            finalReps = `${setCount} x Max`;
        } else if (rangeMode && repMin !== repMax) {
            finalReps = `${setCount} x ${repMin}-${repMax}`;
        } else {
            finalReps = `${setCount} x ${repMin}`;
        }
        onSave({
            name: name.trim(),
            muscles: selectedMuscles,
            workoutTypes: selectedWorkoutTypes,
            targetReps: finalReps,
            rowColor: selectedColor
        });
        onClose();
    };

    const applyPreset = (p) => {
        setSetCount(p.s);
        if (p.rMin !== undefined) {
            setRepMin(p.rMin);
            setRepMax(p.rMax);
            setRangeMode(true);
        } else {
            setRepMin(p.r);
            setRepMax(p.r);
            setRangeMode(p.r === 0 ? false : false);
        }
    };

    const matchesPreset = (p) => {
        if (p.rMin !== undefined) {
            return setCount === p.s && repMin === p.rMin && repMax === p.rMax && rangeMode;
        }
        return setCount === p.s && repMin === p.r && !rangeMode;
    };

    const QUICK_PRESETS = [
        { s: 3, r: 8, label: '3×8' },
        { s: 3, r: 10, label: '3×10' },
        { s: 3, r: 12, label: '3×12' },
        { s: 4, r: 8, label: '4×8' },
        { s: 4, r: 10, label: '4×10' },
        { s: 4, r: 12, label: '4×12' },
        { s: 5, r: 5, label: '5×5' },
        { s: 3, rMin: 6, rMax: 8, label: '3×6-8' },
        { s: 3, rMin: 8, rMax: 12, label: '3×8-12' },
        { s: 4, rMin: 6, rMax: 8, label: '4×6-8' },
        { s: 3, r: 0, label: '3×Max' }
    ];

    // Toggle workout type selection
    const toggleWorkoutType = (type) => {
        setSelectedWorkoutTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
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
                <div className="flex-none px-6 py-4 border-b border-gray-700 dark:border-slate-700 flex items-center justify-between bg-gray-900 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 z-20 relative rounded-t-3xl sm:rounded-t-xl">
                    {/* Mobile Handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-600 rounded-full sm:hidden" />

                    <h3 className="text-xl font-bold text-white mt-2 sm:mt-0">
                        {isNew ? 'Yeni Egzersiz' : 'Egzersiz Düzenle'}
                    </h3>

                    <div className="flex items-center gap-2">
                        {/* Color Trigger (Mobile & Desktop) */}
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showColorPicker ? 'bg-white/20 border-white/30' : 'border-transparent hover:bg-white/10'}`}
                        >
                            <div
                                className="w-6 h-6 rounded-full border-2 border-white/30 shadow-sm"
                                style={{ backgroundColor: selectedColor }}
                            />
                            {showColorPicker ? <ChevronUp size={18} className="text-gray-300" /> : <ChevronDown size={18} className="text-gray-300" />}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-300 hover:bg-white/10 rounded-full transition-colors hidden sm:flex"
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
                        <WheelColorPicker
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
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm border-b last:border-0 border-gray-100 dark:border-slate-700/50 flex items-center justify-between group"
                                    >
                                        {ex}
                                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Set × Tekrar — Interactive Stepper */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Hedef (Set × Tekrar)
                            </label>
                            <button
                                type="button"
                                onClick={() => setFreeTextMode(!freeTextMode)}
                                className="text-[11px] font-medium text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {freeTextMode ? 'Seçici Modu' : 'Serbest Yazı'}
                            </button>
                        </div>

                        {freeTextMode ? (
                            /* Serbest metin girişi */
                            <input
                                type="text"
                                value={targetReps}
                                onChange={(e) => setTargetReps(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gray-400 dark:focus:ring-white outline-none text-gray-900 dark:text-white transition-all text-center font-medium"
                                placeholder="3 x 12, Drop set, vb."
                            />
                        ) : (
                            <div className="space-y-3">
                                {/* Stepper Row */}
                                <div className="flex items-center gap-3">
                                    {/* Set Stepper */}
                                    <div className="flex-1 flex items-center gap-0 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setSetCount(prev => Math.max(1, prev - 1))}
                                            className="p-3 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <div className="flex-1 text-center">
                                            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">{setCount}</div>
                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Set</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSetCount(prev => Math.min(20, prev + 1))}
                                            className="p-3 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* × Divider */}
                                    <span className="text-xl font-black text-gray-300 dark:text-slate-600 select-none">×</span>

                                    {/* Rep Stepper(s) */}
                                    {repMin === 0 && !rangeMode ? (
                                        /* Max mode */
                                        <div
                                            className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => { setRepMin(12); setRepMax(12); }}
                                        >
                                            <div className="text-center">
                                                <div className="text-lg font-black text-amber-500 dark:text-amber-400 leading-none">Max</div>
                                                <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Tekrar</div>
                                            </div>
                                        </div>
                                    ) : rangeMode ? (
                                        /* Range mode: Min — Max */
                                        <div className="flex-1 flex items-center gap-1">
                                            <div className="flex-1 flex items-center gap-0 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                                <button type="button" onClick={() => setRepMin(prev => Math.max(1, prev - 1))} className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 transition-colors">
                                                    <Minus size={14} />
                                                </button>
                                                <div className="flex-1 text-center">
                                                    <div className="text-xl font-black text-gray-900 dark:text-white leading-none">{repMin}</div>
                                                    <div className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Min</div>
                                                </div>
                                                <button type="button" onClick={() => setRepMin(prev => Math.min(repMax - 1, prev + 1))} className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="text-sm font-bold text-gray-300 dark:text-slate-600">–</span>
                                            <div className="flex-1 flex items-center gap-0 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                                <button type="button" onClick={() => setRepMax(prev => Math.max(repMin + 1, prev - 1))} className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 transition-colors">
                                                    <Minus size={14} />
                                                </button>
                                                <div className="flex-1 text-center">
                                                    <div className="text-xl font-black text-gray-900 dark:text-white leading-none">{repMax}</div>
                                                    <div className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Max</div>
                                                </div>
                                                <button type="button" onClick={() => setRepMax(prev => Math.min(100, prev + 1))} className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Single rep mode */
                                        <div className="flex-1 flex items-center gap-0 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                            <button type="button" onClick={() => setRepMin(prev => Math.max(1, prev - 1))} className="p-3 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors">
                                                <Minus size={16} />
                                            </button>
                                            <div className="flex-1 text-center">
                                                <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">{repMin}</div>
                                                <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Tekrar</div>
                                            </div>
                                            <button type="button" onClick={() => { setRepMin(prev => Math.min(100, prev + 1)); setRepMax(prev => Math.min(100, prev + 1)); }} className="p-3 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mode Toggles + Quick Presets */}
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setRangeMode(false); setRepMin(repMin || 12); setRepMax(repMin || 12); }}
                                            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${!rangeMode && repMin !== 0 ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-slate-500'}`}
                                        >Tek</button>
                                        <button
                                            type="button"
                                            onClick={() => { setRangeMode(true); if (repMin === 0) { setRepMin(6); } setRepMax(Math.max((repMin || 6) + 2, repMax)); }}
                                            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${rangeMode ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-slate-500'}`}
                                        >Aralık</button>
                                        <button
                                            type="button"
                                            onClick={() => { setRangeMode(false); setRepMin(0); setRepMax(0); }}
                                            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${repMin === 0 && !rangeMode ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-gray-400 dark:text-slate-500'}`}
                                        >Max</button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_PRESETS.map(p => {
                                        const isSelected = matchesPreset(p);
                                        return (
                                            <button
                                                key={p.label}
                                                type="button"
                                                onClick={() => applyPreset(p)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${isSelected
                                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-sm'
                                                    : 'bg-white dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                                                    }`}
                                            >
                                                {p.label || `${p.s}×${p.r}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Workout Types - Multi Select */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Antrenman Tipleri
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(workoutTypes || []).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleWorkoutType(type)}
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedWorkoutTypes.includes(type)
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-400'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
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
                                    <BodyDiagramSVG
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
                                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md transform scale-105'
                                                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-400'
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
                <div className="flex-none p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:rounded-b-2xl pb-safe">
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
                            className="flex-1 py-3.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className="flex-[2] py-3.5 rounded-xl font-bold text-white dark:text-gray-900 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-[0.98]"
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
