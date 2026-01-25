import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Dumbbell, Copy, Plus } from 'lucide-react';
import ExerciseEditor from './ExerciseEditor';
import {
    THEME_COLORS,
    COLOR_OPTIONS,
    getHeaderClasses,
    getRowClasses,
    getCellClasses,
    getDisabledCellClasses,
    extractColorId,
    getPreviewClasses
} from '../utils/themeColors';



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
    onDeleteExercise // Yeni prop: Egzersiz Silme
}) {
    const { exercises, gridData, rowColors = {}, days = [] } = activeWeek;

    // UI State
    const [filterType, setFilterType] = useState('All');
    const [filterMuscle, setFilterMuscle] = useState('All');

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

    const handlePrevDay = () => setMobileDayIndex(prev => Math.max(0, prev - 1));
    const handleNextDay = () => setMobileDayIndex(prev => Math.min(days.length - 1, prev + 1));


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
                setFilterType(todayConfig.type);
            } else {
                setFilterType('All'); // Eğer Off ise veya bulunamazsa hepsini göster
            }
        } else {
            setFilterType('All'); // Focus mode kapandığında filtreyi sıfırla
        }
    }, [focusMode, days]);


    const openExerciseEditor = (index, name) => {
        setEditingExercise({ index, name });
        setContextMenu(null);
    };

    const handleExerciseSave = ({ name, muscles, workoutType, targetReps, rowColor }) => {
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
                    onUpdateExerciseDetails(newLength, { muscles, workoutType, targetReps });
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
                onUpdateExerciseDetails(editingExercise.index, { muscles, workoutType, targetReps });
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

    const saveDayEditor = (colorOption) => {
        if (editingDay && onUpdateDay) {
            onUpdateDay(activeWeek.id, editingDay.index, {
                label: editingDay.label, // Label değişmiyor
                type: colorOption.type, // Type renge göre otomatik atanıyor
                color: colorOption.value
            });
        }
        setEditingDay(null);
    };

    // Filtreleme mantığı
    const visibleExercises = exercises.map((ex, i) => ({ name: ex, originalIndex: i }))
        .filter(({ originalIndex }) => {
            const details = exerciseDetails[originalIndex] || {};
            const exerciseWorkoutType = details.workoutType || '';
            const exerciseMuscles = details.muscles || [];

            // Antrenman tipi filtresi
            if (filterType !== 'All' && exerciseWorkoutType !== filterType) {
                return false;
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

    return (
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
                            className={`p-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-colors bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 ${focusMode ? 'ring-2 ring-indigo-500 border-indigo-400' : ''}`}
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
                            className="p-1.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500"
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
            <div className="hidden lg:block overflow-x-auto shadow-xl rounded-xl border border-gray-200 dark:border-slate-800 transition-colors">
                <table className="min-w-full border-collapse bg-white dark:bg-slate-950">
                    <thead>
                        <tr>
                            <th className="p-3 border-b border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-left min-w-[220px] sticky left-0 z-10 shadow-sm relative group">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300 font-bold">Egzersizler</span>
                                    <button
                                        onClick={openNewExerciseModal}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md shadow-sm transition-all flex items-center gap-1"
                                    >
                                        <span>+</span> EKLE
                                    </button>
                                </div>
                            </th>
                            {days.map((day, index) => (
                                <th
                                    key={day.id || index}
                                    className={`p-3 border-b border-r min-w-[120px] text-center cursor-pointer hover:brightness-105 dark:hover:brightness-110 transition resize-x overflow-hidden ${getHeaderClasses(getColorIdFromClass(day.color))}`}
                                    style={{ resize: 'horizontal', overflow: 'hidden', minWidth: '120px', maxWidth: '300px' }}
                                    onClick={() => openDayEditor(day, index)}
                                    title="Türü ve rengi değiştirmek için tıklayın"
                                >
                                    <div className="font-bold text-sm">{day.label}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleExercises.map(({ name: exercise, originalIndex: rowIndex }) => {
                            const rowBgColor = rowColors[rowIndex] || '';
                            const details = exerciseDetails[rowIndex] || {};
                            const exerciseMuscles = details.muscles || [];
                            const exerciseWorkoutType = details.workoutType || '';
                            const targetReps = details.targetReps || '';

                            return (
                                <tr key={rowIndex} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group/row">
                                    <td
                                        className={`p-3 border-r border-gray-200 dark:border-slate-800 font-semibold sticky left-0 z-10 shadow-sm text-sm relative group cursor-pointer ${getRowClasses(getColorIdFromClass(rowBgColor))} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]`}
                                        onClick={() => openExerciseEditor(rowIndex, exercise)}
                                        onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{exercise}</span>
                                                    {targetReps && (
                                                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold tracking-tight border border-emerald-200 dark:border-emerald-800">
                                                            {targetReps}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400">✎</span>
                                            </div>

                                            {(exerciseWorkoutType || exerciseMuscles.length > 0) && (
                                                <div className='flex flex-wrap gap-1'>
                                                    {exerciseWorkoutType && (
                                                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded w-fit font-medium border border-indigo-100 dark:border-indigo-800/50">
                                                            {exerciseWorkoutType}
                                                        </span>
                                                    )}

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
                                    </td>

                                    {days.map((day, index) => {
                                        const cellKey = `${rowIndex}-${day.id || index}`;
                                        const isMismatch = exerciseWorkoutType &&
                                            day.type &&
                                            day.type !== 'Off' &&
                                            day.type !== 'Mix' &&
                                            exerciseWorkoutType !== 'Mix' &&
                                            exerciseWorkoutType !== 'Full Body' &&
                                            exerciseWorkoutType.toLowerCase() !== day.type.toLowerCase();

                                        return (
                                            <td key={day.id || index} className="p-0 border-r border-gray-200 dark:border-slate-800 relative align-top">
                                                <textarea
                                                    disabled={isMismatch}
                                                    value={gridData[cellKey] || ''}
                                                    onChange={(e) => onCellChange(activeWeek.id, cellKey, e.target.value)}
                                                    className={`w-full h-full min-h-[60px] p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all text-center text-sm font-medium resize-none overflow-hidden ${isMismatch ? getDisabledCellClasses(getColorIdFromClass(day.color)) : getCellClasses(getColorIdFromClass(day.color))}`}
                                                    placeholder={isMismatch ? '' : '-'}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet View (< lg) - "Day View" */}
            <div className="lg:hidden flex flex-col h-full bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                {/* Mobile Day Navigation Header */}
                <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                    <div className="flex items-center justify-between p-3">
                        <button
                            onClick={handlePrevDay}
                            disabled={mobileDayIndex === 0}
                            className={`p-2 rounded-full transition ${mobileDayIndex === 0 ? 'text-gray-300 dark:text-slate-700' : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div
                            className={`flex flex-col items-center flex-1 max-w-[200px] py-1.5 px-4 rounded-xl transition-colors cursor-pointer ${getHeaderClasses(getColorIdFromClass(days[mobileDayIndex]?.color))}`}
                            onClick={() => openDayEditor(days[mobileDayIndex], mobileDayIndex)}
                        >
                            <span className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-0.5">
                                Gün {mobileDayIndex + 1} / 7
                            </span>
                            <span className="font-bold text-lg block truncate px-2">
                                {days[mobileDayIndex]?.label}
                            </span>
                        </div>

                        <button
                            onClick={handleNextDay}
                            disabled={mobileDayIndex === days.length - 1}
                            className={`p-2 rounded-full transition ${mobileDayIndex === days.length - 1 ? 'text-gray-300 dark:text-slate-700' : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Exercises List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                    {visibleExercises.map(({ name: exercise, originalIndex: rowIndex }) => {
                        const rowBgColor = rowColors[rowIndex] || '';
                        const details = exerciseDetails[rowIndex] || {};
                        const exerciseMuscles = details.muscles || [];
                        const exerciseWorkoutType = details.workoutType || '';
                        const targetReps = details.targetReps || '';

                        const day = days[mobileDayIndex];
                        const cellKey = `${rowIndex}-${day.id || mobileDayIndex}`;

                        // Mismatch Logic (Same as Desktop)
                        const isMismatch = exerciseWorkoutType &&
                            day.type &&
                            day.type !== 'Off' &&
                            day.type !== 'Mix' &&
                            exerciseWorkoutType !== 'Mix' &&
                            exerciseWorkoutType !== 'Full Body' &&
                            exerciseWorkoutType.toLowerCase() !== day.type.toLowerCase();

                        return (
                            <div key={rowIndex} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                                {/* Header (Exercise Name) */}
                                <div
                                    className={`flex items-center justify-between p-3 border-b border-gray-100 dark:border-slate-800 ${getRowClasses(getColorIdFromClass(rowBgColor))}`}
                                    onClick={() => openExerciseEditor(rowIndex, exercise)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Dumbbell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{exercise}</div>
                                            {(targetReps || exerciseWorkoutType) && (
                                                <div className="flex gap-1 mt-0.5">
                                                    {targetReps && <span className="text-[10px] opacity-80 bg-black/10 px-1 rounded">{targetReps}</span>}
                                                    {exerciseWorkoutType && <span className="text-[10px] opacity-80 bg-black/10 px-1 rounded">{exerciseWorkoutType}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium px-2 py-1 bg-white/20 rounded opacity-80">Düzenle</div>
                                </div>

                                {/* Data Input Cell */}
                                <div className="relative">
                                    <textarea
                                        disabled={isMismatch}
                                        value={gridData[cellKey] || ''}
                                        onChange={(e) => onCellChange(activeWeek.id, cellKey, e.target.value)}
                                        placeholder={isMismatch ? 'Bu gün için uygun değil' : `${exercise} detayları...`}
                                        className={`w-full min-h-[120px] p-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${isMismatch ? getDisabledCellClasses(getColorIdFromClass(day.color)) : getCellClasses(getColorIdFromClass(day.color))}`}
                                    />

                                    {!isMismatch && (
                                        <div className="absolute bottom-3 right-3 opacity-50">
                                            <Copy className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={openNewExerciseModal}
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
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
            {contextMenu && createPortal(
                <div
                    className="fixed z-[9999] bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 rounded-lg p-2 w-44"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-xs font-bold text-gray-400 dark:text-slate-500 mb-1 px-2 border-b border-gray-100 dark:border-slate-700 pb-1">SATIR RENGİ</div>
                    {COLOR_OPTIONS.map(c => (
                        <button
                            key={c.id}
                            onClick={() => handleColorSelect(c.id)}
                            className="text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 w-full text-gray-700 dark:text-slate-300"
                        >
                            <span className={`w-4 h-4 rounded-full border border-gray-300 dark:border-slate-600 ${getPreviewClasses(c.id)}`}></span>
                            {c.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {/* DAY EDIT MODAL - SİMPLEŞTİRİLDİ */}
            {editingDay && (
                <Modal onClose={() => setEditingDay(null)}>
                    <div className="flex flex-col gap-4">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editingDay.label}</h3>
                            <p className="text-xs text-gray-400 dark:text-slate-500">Bu gün için antrenman türü ve rengi seçin</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {workoutColors && Object.entries(workoutColors).map(([className, config]) => {
                                // Renk ID'sini çıkar
                                const colorMatch = className.match(/bg-(\w+)-\d+/);
                                const colorId = colorMatch ? colorMatch[1] : 'gray';

                                return (
                                    <button
                                        key={config.label}
                                        onClick={() => saveDayEditor({ value: className, type: config.type })}
                                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 ${getPreviewClasses(colorId)} ${editingDay.color === className ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/50' : 'border-transparent'}`}
                                    >
                                        {editingDay.color === className && <span className="text-xs">✓</span>}
                                        <span className="font-semibold text-sm">{config.label}</span>
                                        <span className="text-[10px] uppercase opacity-60 bg-white/50 dark:bg-black/20 px-1 rounded">{config.type}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-2 text-center">
                            <button onClick={() => setEditingDay(null)} className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 underline">Vazgeç</button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
}
