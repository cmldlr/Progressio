import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Dumbbell, Copy, Plus, Eye, EyeOff, GripVertical } from 'lucide-react';
import ExerciseEditor from './ExerciseEditor';
import CustomColorPicker from './CustomColorPicker';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    THEME_COLORS,
    COLOR_OPTIONS,
    getHeaderStyles,
    getRowStyles,
    getCellStyles,
    getDisabledCellStyles,
    extractColorId,
    getPreviewStyles // Updated import
} from '../utils/themeColors';

// --- Sortable Components ---
function SortableTableRow({ id, children, disabled }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative',
    };

    return (
        <tr ref={setNodeRef} style={style} {...attributes} className={isDragging ? 'opacity-50 bg-gray-100 dark:bg-slate-800' : ''}>
            {children(listeners, disabled)}
        </tr>
    );
}

function SortableMobileItem({ id, children, disabled }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className={isDragging ? 'opacity-50 ring-2 ring-indigo-500 rounded-2xl' : ''}>
            {children(listeners, disabled)}
        </div>
    );
}




// Helper for Portal
const Modal = ({ children, onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-gray-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default function WeeklyGrid({
    activeWeek,
    onCellChange,
    onAddExercise,
    onUpdateExercises,
    onUpdateRowColor,
    onUpdateDay,
    muscleGroups = {},
    workoutTypes = [],
    exerciseDetails = {},
    workoutColors = {}, // Yeni prop
    onUpdateExerciseDetails,
    focusMode = false, // Yeni prop: Akıllı Filtreleme
    onDeleteExercise, // Yeni prop: Egzersiz Silme
    onReorderExercises // Yeni prop: Sürükle Bırak Sıralama
}) {
    const { exercises, exerciseIds = [], gridData, rowColors = {}, days: allDays = [] } = activeWeek;

    // Dnd-Kit Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id && onReorderExercises && active.id && over.id) {
            // ID format: desktop-UUID or mobile-UUID
            // We need to find the index of the exercise with this UUID
            const activeType = active.id.split('-')[0]; // desktop or mobile
            const activeUuid = active.id.replace(`${activeType}-`, '');

            const overType = over.id.split('-')[0];
            const overUuid = over.id.replace(`${overType}-`, '');

            // Fallback for old index-based IDs (if mixed state)
            let oldIndex = -1;
            let newIndex = -1;

            if (exerciseIds.length > 0) {
                oldIndex = exerciseIds.indexOf(activeUuid);
                newIndex = exerciseIds.indexOf(overUuid);
            } else {
                oldIndex = parseInt(activeUuid);
                newIndex = parseInt(overUuid);
            }

            if (oldIndex !== -1 && newIndex !== -1) {
                onReorderExercises(activeWeek.id, oldIndex, newIndex);
            }
        }
    };


    // Filter days for Focus Mode
    const days = React.useMemo(() => {
        if (!focusMode) return allDays;

        // Get local date string for comparison (YYYY-MM-DD)
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const todayDay = allDays.find(d => {
            if (!d.date) return false;
            return d.date.split('T')[0] === todayStr;
        });

        // If today is in this week, show only today. Otherwise show all.
        return todayDay ? [todayDay] : allDays;
    }, [allDays, focusMode]);

    // UI State
    const [filterType, setFilterType] = useState('All');
    const [filterMuscle, setFilterMuscle] = useState('All');
    const [showAllExercises, setShowAllExercises] = useState(false); // Mobile: Show hidden exercises
    const [collapsedCards, setCollapsedCards] = useState({}); // Mobil: açılır/kapanır kartlar

    // Swipe Navigation State
    const touchStartRef = React.useRef({ x: 0, y: 0 });
    const touchEndRef = React.useRef({ x: 0, y: 0 });
    const swipeContainerRef = React.useRef(null);

    // Exercise Editor State
    const [editingExercise, setEditingExercise] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [editingDay, setEditingDay] = useState(null);

    // Mobil Görünüm için State
    const [mobileDayIndex, setMobileDayIndex] = useState(() => {
        const today = new Date().getDay(); // 0 (Sun) - 6 (Sat)
        // Adjust to match our days array: Mon(0)..Sun(6)
        const adjustedIndex = today === 0 ? 6 : today - 1;
        return Math.max(0, Math.min(adjustedIndex, 6));
    });

    // Reset mobile view to 0 when entering focus mode (since days array will have only 1 item)
    useEffect(() => {
        if (focusMode) {
            setTimeout(() => setMobileDayIndex(0), 0);
        } else {
            // Restore to actual today index when exiting focus mode
            const today = new Date().getDay();
            setTimeout(() => setMobileDayIndex(today === 0 ? 6 : today - 1), 0);
        }
    }, [focusMode]);

    const handlePrevDay = () => setMobileDayIndex(prev => Math.max(0, prev - 1));
    const handleNextDay = () => setMobileDayIndex(prev => Math.min(days.length - 1, prev + 1));

    // Swipe Handlers
    const handleTouchStart = (e) => {
        touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        touchEndRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };
    const handleTouchMove = (e) => {
        touchEndRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };
    const handleTouchEnd = () => {
        const dx = touchStartRef.current.x - touchEndRef.current.x;
        const dy = Math.abs(touchStartRef.current.y - touchEndRef.current.y);
        const minSwipe = 50;
        // Only trigger horizontal swipe if horizontal distance > vertical distance
        if (Math.abs(dx) > minSwipe && Math.abs(dx) > dy) {
            if (dx > 0) {
                // Sola kaydırma -> sonraki gün
                handleNextDay();
            } else {
                // Sağa kaydırma -> önceki gün
                handlePrevDay();
            }
        }
    };

    // Kart açılıp kapanma toggle
    const toggleCardCollapse = (rowIndex) => {
        setCollapsedCards(prev => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
    };


    // Focus Mode Effect: Dashboard'tan tetiklenirse
    useEffect(() => {
        if (focusMode) {
            // Bugünün gününü bul (0=Pazar, 1=Pazartesi...)
            let todayIndex = new Date().getDay();
            // JS'de Pazar 0, bizim dizide Pazar son (indis 6). Pazartesi=1, Salı=2...
            // days dizisi: Mon(0), Tue(1), Wed(2), Thu(3), Fri(4), Sat(5), Sun(6)

            // Dönüşüm: (todayIndex + 6) % 7 -> Bu bize Pazartesi=0 verir.
            const dayMapIndex = (todayIndex + 6) % 7;

            const todayConfig = days[dayMapIndex];

            if (todayConfig && todayConfig.type && todayConfig.type !== 'Off') {
                setTimeout(() => setFilterType(todayConfig.type), 0);
            } else {
                setTimeout(() => setFilterType('All'), 0);
            }
        } else {
            setTimeout(() => setFilterType('All'), 0); // Focus mode kapandığında filtreyi sıfırla
        }
    }, [focusMode, days]);


    const openExerciseEditor = (index, name) => {
        setEditingExercise({ index, name });
        setContextMenu(null);
    };

    const handleExerciseSave = ({ name, muscles, workoutTypes, targetReps, rowColor }) => {
        // Yeni Egzersiz Ekleme Modu
        if (editingExercise.index === -1) {
            if (name) {
                const newLength = exercises.length;
                onAddExercise(activeWeek.id, [...exercises, name]);

                // Diğer detayları da son indexe ekle
                // Not: React state update asenkron olduğu için index kayması olabilir ama
                // burada basitce listenin sonuna ekliyoruz.

                // Detayları güncelle
                if (onUpdateExerciseDetails) {
                    onUpdateExerciseDetails(newLength, { muscles, workoutTypes, targetReps });
                }

                // Rengi güncelle
                if (rowColor && onUpdateRowColor) {
                    onUpdateRowColor(activeWeek.id, newLength, rowColor);
                }
            }
        }
        // Düzenleme Modu
        else {
            if (name && name !== exercises[editingExercise.index]) {
                const newExercises = [...exercises];
                newExercises[editingExercise.index] = name;
                onUpdateExercises(activeWeek.id, newExercises);
            }
            if (onUpdateExerciseDetails) {
                onUpdateExerciseDetails(editingExercise.index, { muscles, workoutTypes, targetReps });
            }
            // Renk güncelleme
            if (rowColor && onUpdateRowColor) {
                onUpdateRowColor(activeWeek.id, editingExercise.index, rowColor);
            }
        }
    };

    const openNewExerciseModal = () => {
        setEditingExercise({ index: -1, name: '' });
        setContextMenu(null);
    }

    const handleContextMenu = (e, index) => {
        e.preventDefault();
        setContextMenu({
            index,
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleColorSelect = (colorClass) => {
        if (contextMenu && onUpdateRowColor) {
            onUpdateRowColor(activeWeek.id, contextMenu.index, colorClass);
        }
        setContextMenu(null);
    };

    const handleExerciseDelete = () => {
        if (editingExercise && editingExercise.index !== -1 && onDeleteExercise) {
            // Confirmation is handled in the action
            onDeleteExercise(activeWeek.id, editingExercise.index);
            setEditingExercise(null);
        }
    };

    const openDayEditor = (day, index) => {
        setEditingDay({ ...day, index });
    };

    const saveDayEditor = (updates) => {
        if (editingDay && onUpdateDay) {
            onUpdateDay(activeWeek.id, editingDay.index, {
                label: editingDay.label,
                type: updates.type,
                color: updates.color
            });
        }
        setEditingDay(null);
    };

    // Filtreleme mantığı
    const visibleExercises = exercises.map((ex, i) => ({ name: ex, originalIndex: i }))
        .filter(({ originalIndex }) => {
            const details = exerciseDetails[originalIndex] || {};
            const rawWorkoutTypes = details.workoutTypes || details.workoutType;
            const exerciseWorkoutTypes = Array.isArray(rawWorkoutTypes)
                ? rawWorkoutTypes
                : (rawWorkoutTypes ? [rawWorkoutTypes] : []);

            const exerciseMuscles = details.muscles || [];

            // Antrenman tipi filtresi (Dropdown)
            if (filterType !== 'All') {
                if (exerciseWorkoutTypes.length === 0) return false;
                if (!exerciseWorkoutTypes.includes(filterType)) return false;
            }

            // Focus Mode Otomatik Filtreleme: Günün antrenman tipine uymayanları gizle
            if (focusMode && days.length === 1) {
                const day = days[0];
                if (day.type && day.type !== 'Mix' && day.type !== 'Off') {
                    // Egzersiz "Mix" veya "Full Body" ise göster
                    if (exerciseWorkoutTypes.includes('Mix') || exerciseWorkoutTypes.includes('Full Body')) {
                        // keep it
                    } else if (exerciseWorkoutTypes.length === 0) {
                        // keep it (universal)
                    } else {
                        // Strict check: Egzersizin tiplerinden biri günün tipiyle eşleşmeli
                        const dayTypeLower = day.type.toLowerCase();
                        const hasMatch = exerciseWorkoutTypes.some(t => t.toLowerCase() === dayTypeLower);
                        if (!hasMatch) return false;
                    }
                }
            }

            // Kas grubu filtresi
            if (filterMuscle !== 'All' && !exerciseMuscles.includes(filterMuscle)) {
                return false;
            }

            return true;
        });

    const groupedMusclesForFilter = Object.values(muscleGroups).reduce((acc, muscle) => {
        const category = muscle.category || 'Diğer';
        if (!acc[category]) acc[category] = [];
        acc[category].push(muscle);
        return acc;
    }, {});

    // Renk ID'sini eski class formatından çıkar (geriye uyumluluk)
    const getColorIdFromClass = (colorClass) => {
        return extractColorId(colorClass);
    };

    // Sorting Check
    const isReorderDisabled = visibleExercises.length !== exercises.length;

    // Prep IDs for Sortable Context
    // Use ephemeral IDs if available, else fallback to index (should not happen if hook works)
    const getStableId = (index) => exerciseIds[index] || index; // Fallback to index if no ID (prevent crash)

    const desktopIds = visibleExercises.map(({ originalIndex }) => `desktop-${getStableId(originalIndex)}`);
    const mobileIds = visibleExercises.map(({ originalIndex }) => `mobile-${getStableId(originalIndex)}`);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
            <div className="p-4 space-y-6" onClick={() => setContextMenu(null)}>

                {/* Controls Bar */}
                <div className="flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Antrenman Tipi Filtresi */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Antrenman:</span>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className={`p-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-gray-400 dark:focus:ring-white transition-colors bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 ${focusMode ? 'ring-2 ring-gray-900 dark:ring-white border-gray-500' : ''}`}
                            >
                                <option value="All">Tümü</option>
                                {workoutTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Kas Grubu Filtresi */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Kas:</span>
                            <select
                                value={filterMuscle}
                                onChange={(e) => setFilterMuscle(e.target.value)}
                                className="p-1.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-gray-400 dark:focus:ring-white"
                            >
                                <option value="All">Tümü</option>
                                {Object.entries(groupedMusclesForFilter).map(([category, muscles]) => (
                                    <optgroup key={category} label={category}>
                                        {muscles.map(m => (
                                            <option key={m.id} value={m.id}>{m.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        💡 Başlıklara tıklayarak antrenman renklerini ayarlayabilirsiniz
                    </div>
                </div>

                {/* Desktop View (Hidden on Mobile/Tablet) */}
                <div className={`hidden lg:block overflow-x-auto shadow-xl rounded-xl border border-gray-200 dark:border-slate-800 transition-colors ${focusMode ? 'max-w-4xl mx-auto' : ''}`}>
                    <table className="min-w-full border-collapse bg-white dark:bg-slate-950">
                        <thead>
                            <tr>
                                <th className={`p-3 border-b border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-left sticky left-0 z-10 shadow-sm relative group ${focusMode ? 'w-1/3 min-w-[250px]' : 'min-w-[220px]'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 dark:text-gray-300 font-bold text-lg pl-2">Egzersizler</span>
                                        {!focusMode && (
                                            <button
                                                onClick={openNewExerciseModal}
                                                className="text-xs bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-md shadow-sm transition-all flex items-center gap-1"
                                            >
                                                <span>+</span> EKLE
                                            </button>
                                        )}
                                    </div>
                                </th>
                                {days.map((day, index) => {
                                    const { className, style } = getHeaderStyles(getColorIdFromClass(day.color));
                                    return (
                                        <th
                                            key={day.id || index}
                                            className={`p-3 border-b border-r text-center cursor-pointer hover:brightness-105 dark:hover:brightness-110 transition resize-x overflow-hidden ${className} ${focusMode ? 'w-2/3' : 'min-w-[120px]'}`}
                                            style={{ ...style, resize: focusMode ? 'none' : 'horizontal', overflow: 'hidden', maxWidth: focusMode ? 'none' : '300px' }}
                                            onClick={() => openDayEditor(day, index)}
                                            title="Türü ve rengi değiştirmek için tıklayın"
                                        >
                                            <div className="font-bold text-base flex flex-col items-center justify-center gap-1">
                                                <span className="uppercase tracking-wide">{day.label}</span>
                                                {day.type && (
                                                    <span className="text-xs font-normal opacity-90 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 whitespace-nowrap">
                                                        {day.type}
                                                    </span>
                                                )}
                                            </div>
                                            {day.displayDate && (
                                                <div className="text-[10px] bg-black/5 dark:bg-black/20 rounded-full px-2 py-0.5 mt-1.5 inline-block font-medium opacity-80">
                                                    {day.displayDate}
                                                </div>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <SortableContext
                            items={desktopIds}
                            strategy={verticalListSortingStrategy}
                        >
                            <tbody>
                                {visibleExercises.map(({ name: exercise, originalIndex: rowIndex }) => {
                                    const rowBgColor = rowColors[rowIndex] || '';
                                    const { className: rowClass, style: rowStyle } = getRowStyles(getColorIdFromClass(rowBgColor));

                                    const details = exerciseDetails[rowIndex] || {};
                                    const exerciseMuscles = details.muscles || [];
                                    // Handle both array (new) and string (old) formats
                                    const rawWorkoutTypes = details.workoutTypes || details.workoutType;
                                    const exerciseWorkoutTypes = Array.isArray(rawWorkoutTypes)
                                        ? rawWorkoutTypes
                                        : (rawWorkoutTypes ? [rawWorkoutTypes] : []);
                                    const targetReps = details.targetReps || '';

                                    const stableId = getStableId(rowIndex);

                                    return (
                                        <SortableTableRow
                                            key={stableId}
                                            id={`desktop-${stableId}`}
                                            disabled={isReorderDisabled}
                                        >
                                            {(listeners, disabled) => (
                                                <>
                                                    <td
                                                        className={`p-3 border-r border-gray-200 dark:border-slate-800 font-semibold sticky left-0 z-10 shadow-sm text-sm relative group cursor-pointer ${rowClass} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]`}
                                                        style={rowStyle}
                                                        onClick={() => openExerciseEditor(rowIndex, exercise)}
                                                        onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {/* Drag Handle */}
                                                            {!disabled && (
                                                                <div
                                                                    {...listeners}
                                                                    className="mt-0.5 cursor-grab touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <GripVertical size={16} />
                                                                </div>
                                                            )}

                                                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors break-words">{exercise}</span>
                                                                        {targetReps && (
                                                                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold tracking-tight border border-emerald-200 dark:border-emerald-800">
                                                                                {targetReps}
                                                                            </span>
                                                                        )}
                                                                        {/* Veri göstergesi noktaları - Desktop */}
                                                                        <div className="flex gap-0.5 ml-1">
                                                                            {days.map((d, di) => {
                                                                                const ck = `${rowIndex}-${d.id || di}`;
                                                                                const hasData = gridData[ck] && gridData[ck].trim().length > 0;
                                                                                return <span key={di} className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-700'}`} title={`${d.label}: ${hasData ? 'Veri var' : 'Boş'}`} />;
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                    <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400">✎</span>
                                                                </div>

                                                                {(exerciseWorkoutTypes.length > 0 || exerciseMuscles.length > 0) && (
                                                                    <div className='flex flex-wrap gap-1'>
                                                                        {exerciseWorkoutTypes.map(type => (
                                                                            <span key={type} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded w-fit font-medium border border-indigo-100 dark:border-indigo-800/50">
                                                                                {type}
                                                                            </span>
                                                                        ))}

                                                                        {exerciseMuscles.slice(0, 3).map(muscleId => (
                                                                            <span key={muscleId} className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                                                                                {muscleGroups[muscleId]?.label || muscleId}
                                                                            </span>
                                                                        ))}
                                                                        {exerciseMuscles.length > 3 && (
                                                                            <span className="text-[10px] text-gray-400 dark:text-slate-600">+{exerciseMuscles.length - 3}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {days.map((day, index) => {
                                                        const cellKey = `${rowIndex}-${day.id || index}`;


                                                        // Validation: Can we enter data here?
                                                        // If day has a type (e.g., "Push"), check if exercise matches that type
                                                        const isMismatch = (() => {
                                                            if (!day.type) return false;
                                                            if (day.type === 'Off' || day.type === 'Mix') return false;
                                                            if (exerciseWorkoutTypes.length === 0) return false; // No types logic defined = allow all
                                                            if (exerciseWorkoutTypes.includes('Mix') || exerciseWorkoutTypes.includes('Full Body')) return false;

                                                            // Check if ANY of the exercise types match the day type (case-insensitive)
                                                            const dayTypeLower = day.type.toLowerCase();
                                                            return !exerciseWorkoutTypes.some(t => t.toLowerCase() === dayTypeLower);
                                                        })();

                                                        // Dynamic Styles
                                                        const colorId = getColorIdFromClass(day.color);
                                                        const { className: cellClass, style: cellStyle } = isMismatch
                                                            ? getDisabledCellStyles(colorId)
                                                            : getCellStyles(colorId);

                                                        return (
                                                            <td
                                                                key={day.id || index}
                                                                className={`p-0 border-r border-gray-200 dark:border-slate-800 relative align-top ${cellClass}`}
                                                                style={cellStyle}
                                                            >
                                                                <textarea
                                                                    disabled={isMismatch}
                                                                    value={gridData[cellKey] || ''}
                                                                    onChange={(e) => onCellChange(activeWeek.id, cellKey, e.target.value)}
                                                                    className="w-full h-full min-h-[80px] p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all text-center text-sm font-medium resize-none overflow-y-auto bg-transparent"
                                                                    placeholder={isMismatch ? '' : '-'}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </SortableTableRow>
                                    )
                                })}
                            </tbody>
                        </SortableContext>
                    </table>
                </div>

                {/* Mobile/Tablet View (< lg) - "Day View" */}
                <div
                    className="lg:hidden flex flex-col h-full bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                    ref={swipeContainerRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Mobile Day Navigation Header */}
                    <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between p-3">
                            <button
                                onClick={handlePrevDay}
                                disabled={mobileDayIndex === 0}
                                className={`p-2.5 rounded-full transition ${mobileDayIndex === 0 ? 'text-gray-300 dark:text-slate-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700'}`}
                            >
                                <ChevronLeft className="w-7 h-7" />
                            </button>

                            <div className="flex flex-col items-center flex-1">
                                {(() => {
                                    const day = days[mobileDayIndex] || days[0] || {};
                                    const { className, style } = getHeaderStyles(getColorIdFromClass(day.color));
                                    return (
                                        <div
                                            className={`flex flex-col items-center justify-center max-w-[280px] w-full py-1.5 px-4 rounded-xl transition-colors cursor-pointer ${className}`}
                                            style={style}
                                            onClick={() => openDayEditor(days[mobileDayIndex], mobileDayIndex)}
                                        >
                                            {/* Row 1: Day Name + Badge */}
                                            <div className="flex items-center justify-center gap-2 mb-0.5 w-full">
                                                <span className="font-bold text-lg truncate leading-tight">
                                                    {day.label}
                                                </span>
                                                {day.type && (
                                                    <span className="text-[10px] font-bold opacity-90 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 uppercase tracking-wide whitespace-nowrap">
                                                        {day.type}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Row 2: Day Count + Date + Swipe hint */}
                                            <div className="flex items-center gap-2 opacity-70 text-xs font-medium">
                                                <span>Gün {mobileDayIndex + 1}/{days.length}</span>
                                                {day.displayDate && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{day.displayDate}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Day Progress Dots */}
                                            <div className="flex gap-1.5 mt-1.5">
                                                {days.map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === mobileDayIndex
                                                                ? 'bg-current scale-125'
                                                                : 'bg-current opacity-30'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Show All Toggle */}
                                <button
                                    onClick={() => setShowAllExercises(!showAllExercises)}
                                    className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${showAllExercises ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'}`}
                                >
                                    {showAllExercises ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    {showAllExercises ? 'Tümü Açık' : 'Filtreli Görünüm'}
                                </button>
                            </div>

                            <button
                                onClick={handleNextDay}
                                disabled={mobileDayIndex === days.length - 1}
                                className={`p-2.5 rounded-full transition ${mobileDayIndex === days.length - 1 ? 'text-gray-300 dark:text-slate-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700'}`}
                            >
                                <ChevronRight className="w-7 h-7" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Exercises List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                        <SortableContext items={mobileIds} strategy={verticalListSortingStrategy}>
                            {visibleExercises.filter(({ originalIndex: rowIndex }) => {
                                // User Override: Show all if toggled
                                if (showAllExercises) return true;

                                // Smart Filtering Logic for Mobile
                                const details = exerciseDetails[rowIndex] || {};
                                const rawWorkoutTypes = details.workoutTypes || details.workoutType;
                                const exerciseWorkoutTypes = Array.isArray(rawWorkoutTypes)
                                    ? rawWorkoutTypes
                                    : (rawWorkoutTypes ? [rawWorkoutTypes] : []);

                                const day = days[mobileDayIndex] || days[0];
                                if (!day) return true; // Safety fallback

                                // Scenario 1: Day is "Mix" or "Off" -> Show Everything
                                if (day.type === 'Mix' || day.type === 'Full Body') return true;
                                if (!day.type) return true;

                                // Scenario 2: Exercise is Universal ("Mix" or "Full Body") -> Show it on any day
                                if (exerciseWorkoutTypes.includes('Mix') || exerciseWorkoutTypes.includes('Full Body')) return true;
                                if (exerciseWorkoutTypes.length === 0) return true; // No type = universal

                                // Scenario 3: Strict Match
                                const dayTypeLower = day.type.toLowerCase();
                                return exerciseWorkoutTypes.some(t => t.toLowerCase() === dayTypeLower);
                            }).map(({ name: exercise, originalIndex: rowIndex }) => {
                                const rowBgColor = rowColors[rowIndex] || '';
                                const { className: rowClass, style: rowStyle } = getRowStyles(getColorIdFromClass(rowBgColor));

                                const details = exerciseDetails[rowIndex] || {};
                                const rawWorkoutTypes = details.workoutTypes || details.workoutType;
                                const exerciseWorkoutTypes = Array.isArray(rawWorkoutTypes)
                                    ? rawWorkoutTypes
                                    : (rawWorkoutTypes ? [rawWorkoutTypes] : []);
                                const targetReps = details.targetReps || '';

                                const day = days[mobileDayIndex] || days[0];
                                if (!day) return null;

                                const cellKey = `${rowIndex}-${day.id || mobileDayIndex}`;
                                const cellValue = gridData[cellKey] || '';
                                const hasData = cellValue.trim().length > 0;
                                const isCollapsed = collapsedCards[rowIndex] && hasData;

                                const stableId = getStableId(rowIndex);

                                return (
                                    <SortableMobileItem
                                        key={stableId}
                                        id={`mobile-${stableId}`}
                                        disabled={isReorderDisabled}
                                    >
                                        {(listeners, disabled) => (
                                            <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 ${hasData
                                                    ? 'border-emerald-200 dark:border-emerald-800/50'
                                                    : 'border-gray-100 dark:border-slate-800'
                                                }`}>
                                                {/* Header (Exercise Name + Data Indicator) */}
                                                <div
                                                    className={`flex items-center justify-between p-3 ${isCollapsed ? '' : 'border-b border-gray-100 dark:border-slate-800'} ${rowClass} active:opacity-80 transition-opacity`}
                                                    style={rowStyle}
                                                >
                                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                        {/* Mobile Drag Handle */}
                                                        {!disabled && (
                                                            <div
                                                                {...listeners}
                                                                className="p-1.5 text-black/30 dark:text-white/30 cursor-grab touch-none flex-shrink-0"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <GripVertical size={20} />
                                                            </div>
                                                        )}

                                                        {/* Data Indicator Dot */}
                                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${hasData ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'
                                                            }`} />

                                                        <div className="flex-1 min-w-0" onClick={() => openExerciseEditor(rowIndex, exercise)}>
                                                            <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{exercise}</div>
                                                            {(targetReps || exerciseWorkoutTypes.length > 0) && (
                                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                                    {targetReps && <span className="text-[10px] opacity-80 bg-black/5 dark:bg-black/20 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{targetReps}</span>}
                                                                    {exerciseWorkoutTypes.map(type => (
                                                                        <span key={type} className="text-[10px] opacity-80 bg-black/5 dark:bg-black/20 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{type}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Collapse/Expand Toggle + Edit */}
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        {hasData && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleCardCollapse(rowIndex); }}
                                                                className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 active:bg-black/10 transition-colors"
                                                            >
                                                                {isCollapsed ? <Eye size={16} /> : <EyeOff size={16} />}
                                                            </button>
                                                        )}
                                                        <div
                                                            onClick={() => openExerciseEditor(rowIndex, exercise)}
                                                            className="text-xs font-bold px-3 py-1.5 bg-black/5 dark:bg-white/10 rounded-lg text-gray-600 dark:text-white active:bg-black/10 dark:active:bg-white/20 transition-colors"
                                                        >
                                                            Düzenle
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Collapsed Preview */}
                                                {isCollapsed && (
                                                    <div
                                                        className="px-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer active:bg-emerald-100/50 dark:active:bg-emerald-900/20 transition-colors"
                                                        onClick={() => toggleCardCollapse(rowIndex)}
                                                    >
                                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate">
                                                            ✅ {cellValue.split('\n')[0]}{cellValue.includes('\n') ? '...' : ''}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Data Input Cell - Hidden when collapsed */}
                                                {!isCollapsed && (
                                                    <div className="relative">
                                                        {(() => {
                                                            const { className, style } = getCellStyles(getColorIdFromClass(day.color));
                                                            return (
                                                                <textarea
                                                                    value={cellValue}
                                                                    onChange={(e) => onCellChange(activeWeek.id, cellKey, e.target.value)}
                                                                    placeholder={`${exercise} detayları...`}
                                                                    className={`w-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${className}`}
                                                                    style={{ ...style, fontSize: '16px', minHeight: hasData ? '100px' : '80px' }}
                                                                />
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </SortableMobileItem>
                                );
                            })}
                        </SortableContext>

                        {/* Hidden Exercises Summary */}
                        <div className="text-center p-3">
                            <p className="text-xs text-gray-400 dark:text-slate-600">
                                {visibleExercises.length - visibleExercises.filter(({ name: exercise, originalIndex: rowIndex }) => {
                                    const details = exerciseDetails[rowIndex] || {};
                                    const rawWorkoutTypes = details.workoutTypes || details.workoutType;
                                    const exerciseWorkoutTypes = Array.isArray(rawWorkoutTypes)
                                        ? rawWorkoutTypes
                                        : (rawWorkoutTypes ? [rawWorkoutTypes] : []);
                                    const day = days[mobileDayIndex] || days[0];
                                    if (!day) return false;

                                    if (showAllExercises) return true;
                                    if (day.type === 'Mix' || !day.type) return true;
                                    if (exerciseWorkoutTypes.includes('Mix') || exerciseWorkoutTypes.includes('Full Body') || exerciseWorkoutTypes.length === 0) return true;

                                    const dayTypeLower = day.type.toLowerCase();
                                    return exerciseWorkoutTypes.some(t => t.toLowerCase() === dayTypeLower);
                                }).length} egzersiz bu günün antrenman tipiyle eşleşmediği için gizlendi.
                            </p>
                        </div>

                        <button
                            onClick={openNewExerciseModal}
                            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-medium">Yeni Egzersiz Ekle</span>
                        </button>

                        {/* Padding for bottom scrolling */}
                        <div className="h-8"></div>
                    </div>
                </div>

                {/* EXERCISE EDITOR MODAL */}
                <ExerciseEditor
                    isOpen={editingExercise !== null}
                    onClose={() => setEditingExercise(null)}
                    // Düzenleme veya Ekleme modu (index -1 ise ekleme)
                    isNew={editingExercise?.index === -1}
                    exerciseName={editingExercise?.name || ''}
                    exerciseIndex={editingExercise?.index}
                    exerciseDetails={editingExercise && editingExercise.index !== -1 ? exerciseDetails[editingExercise.index] : null}
                    rowColor={editingExercise && editingExercise.index !== -1 ? rowColors[editingExercise.index] : ''} // Mevcut rengi gönder
                    muscleGroups={muscleGroups}
                    workoutTypes={workoutTypes}
                    onSave={handleExerciseSave}
                    onDelete={handleExerciseDelete}
                />

                {/* COLOR CONTEXT MENU PORTAL */}
                {
                    contextMenu && createPortal(
                        <div
                            className="fixed z-[9999] bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 rounded-lg p-2 w-48"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-xs font-bold text-gray-400 dark:text-slate-500 mb-1 px-2 border-b border-gray-100 dark:border-slate-700 pb-1">SATIR RENGİ</div>
                            {/* Simplified Context Menu - Just open Editor? Or show simplified palette? 
                        Let's keep it simple for now, using the new style helpers. 
                    */}
                            {['gray', 'red', 'blue', 'green', 'purple'].map(cId => {
                                const { className, style } = getPreviewStyles(cId);
                                return (
                                    <button
                                        key={cId}
                                        onClick={() => handleColorSelect(cId)}
                                        className="text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 w-full text-gray-700 dark:text-slate-300"
                                    >
                                        <span className={`w-4 h-4 rounded-full border border-gray-300 dark:border-slate-600 ${className}`} style={style}></span>
                                        <span className="capitalize">{cId}</span>
                                    </button>
                                )
                            })}
                            <button
                                onClick={() => {
                                    // If we want to open the full picker, we might need a different UI flow.
                                    // For now, let's just fix the crash.
                                }}
                                className="text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 w-full text-gray-700 dark:text-gray-300"
                            >
                                <Palette size={14} />
                                <span>Detaylı Düzenle</span>
                            </button>
                        </div>,
                        document.body
                    )
                }

                {/* DAY EDIT MODAL */}
                {
                    editingDay && (
                        <Modal onClose={() => setEditingDay(null)}>
                            <div className="flex flex-col gap-4">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editingDay.label}</h3>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">Antrenman türünü belirleyin</p>
                                </div>

                                {/* Workout Type Selector */}
                                <div className="flex flex-wrap gap-2 justify-center mb-2">
                                    {workoutTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                // Auto-apply custom color if defined in settings
                                                const typeColor = workoutColors?.[type];
                                                setEditingDay(prev => ({
                                                    ...prev,
                                                    type: type,
                                                    color: typeColor || prev.color
                                                }));
                                            }}
                                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${editingDay.type === type
                                                ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => setEditingDay(null)}
                                        className="flex-1 px-4 py-2 text-sm text-gray-500 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={() => saveDayEditor(editingDay)}
                                        className="flex-1 px-4 py-2 text-sm text-white dark:text-gray-900 bg-gray-900 dark:bg-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg"
                                    >
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )
                }

            </div >
        </DndContext>
    );
}
