import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import ExerciseEditor from './ExerciseEditor';

const COLORS = [
    { label: 'Varsayılan', value: 'bg-gray-50' },
    { label: 'Kırmızı', value: 'bg-red-50' },
    { label: 'Mavi', value: 'bg-blue-50' },
    { label: 'Yeşil', value: 'bg-green-50' },
    { label: 'Sarı', value: 'bg-yellow-50' },
    { label: 'Mor', value: 'bg-purple-50' },
    { label: 'Turuncu', value: 'bg-orange-50' },
];

const COLUMN_COLORS = [
    { label: 'Gri (Off)', value: 'bg-gray-100 border-gray-300', type: 'Off' },
    { label: 'Kırmızı (Push)', value: 'bg-red-100 border-red-300', type: 'Push' },
    { label: 'Mavi (Pull)', value: 'bg-blue-100 border-blue-300', type: 'Pull' },
    { label: 'Yeşil (Legs)', value: 'bg-green-100 border-green-300', type: 'Legs' },
];

// Helper for Portal
const Modal = ({ children, onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
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
    // Yeni props
    muscleGroups = {},
    workoutTypes = [],
    exerciseDetails = {},
    onUpdateExerciseDetails
}) {
    const { exercises, gridData, rowColors = {}, days = [] } = activeWeek;

    // UI State
    const [filterType, setFilterType] = useState('All');
    const [filterMuscle, setFilterMuscle] = useState('All');

    // Exercise Editor State
    const [editingExercise, setEditingExercise] = useState(null); // { index, name }

    // Color Picker State (sağ tık için)
    const [contextMenu, setContextMenu] = useState(null);

    // Column Editing State
    const [editingDay, setEditingDay] = useState(null);

    const openExerciseEditor = (index, name) => {
        setEditingExercise({ index, name });
        setContextMenu(null);
    };

    const handleExerciseSave = ({ name, muscles, workoutType, targetReps }) => {
        // İsmi güncelle
        if (name && name !== exercises[editingExercise.index]) {
            const newExercises = [...exercises];
            newExercises[editingExercise.index] = name;
            onUpdateExercises(activeWeek.id, newExercises);
        }
        // Kas grupları, antrenman tipi ve hedef set/tekrar güncelle
        if (onUpdateExerciseDetails) {
            onUpdateExerciseDetails(editingExercise.index, { muscles, workoutType, targetReps });
        }
    };

    const handleAddExerciseLocal = () => {
        const name = prompt("Yeni hareket ismi:");
        if (name) {
            onAddExercise(activeWeek.id, [...exercises, name]);
        }
    };

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

    const openDayEditor = (day, index) => {
        setEditingDay({ ...day, index });
    };

    const saveDayEditor = () => {
        if (editingDay && onUpdateDay) {
            onUpdateDay(activeWeek.id, editingDay.index, {
                label: editingDay.label,
                type: editingDay.type,
                color: editingDay.color
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

    // Kas gruplarını kategorilere göre grupla (filtre için)
    const groupedMusclesForFilter = Object.values(muscleGroups).reduce((acc, muscle) => {
        const category = muscle.category || 'Diğer';
        if (!acc[category]) acc[category] = [];
        acc[category].push(muscle);
        return acc;
    }, {});

    return (
        <div className="p-4 space-y-6" onClick={() => setContextMenu(null)}>

            {/* Controls Bar */}
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Antrenman Tipi Filtresi */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-600">Antrenman:</span>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="p-1.5 border border-gray-300 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">Tümü</option>
                            {workoutTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Kas Grubu Filtresi */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-600">Kas:</span>
                        <select
                            value={filterMuscle}
                            onChange={(e) => setFilterMuscle(e.target.value)}
                            className="p-1.5 border border-gray-300 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500"
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
                <div className="text-xs text-blue-600">
                    💡 Egzersiz satırına tıklayarak kas/antrenman tipi ayarlayabilirsiniz
                </div>
            </div>

            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200 pb-20">
                <table className="min-w-full border-collapse bg-white">
                    <thead>
                        <tr>
                            <th className="p-3 border-b-2 border-r border-gray-200 bg-gray-50 text-left min-w-[220px] sticky left-0 z-10 shadow-sm relative group">
                                Egzersizler
                                <button
                                    onClick={handleAddExerciseLocal}
                                    className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                                >
                                    + YENİ EKLE
                                </button>
                            </th>
                            {days.map((day, index) => (
                                <th
                                    key={day.id || index}
                                    className={`p-3 border-b-2 border-r border-gray-200 min-w-[120px] text-center cursor-pointer hover:brightness-95 transition resize-x overflow-hidden ${day.color}`}
                                    style={{ resize: 'horizontal', overflow: 'hidden', minWidth: '120px', maxWidth: '300px' }}
                                    onClick={() => openDayEditor(day, index)}
                                >
                                    <div className="font-bold text-gray-800">{day.label}</div>
                                    <div className="text-xs text-gray-600 font-medium uppercase tracking-wider">{day.type}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleExercises.map(({ name: exercise, originalIndex: rowIndex }) => {
                            const rowBgColor = rowColors[rowIndex] || 'bg-gray-50';
                            const details = exerciseDetails[rowIndex] || {};
                            const exerciseMuscles = details.muscles || [];
                            const exerciseWorkoutType = details.workoutType || '';
                            const targetReps = details.targetReps || '';

                            return (
                                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                    {/* Exercise Name Cell */}
                                    <td
                                        className={`p-3 border-r border-b border-gray-200 font-semibold text-gray-700 ${rowBgColor} sticky left-0 z-10 shadow-sm text-sm relative group cursor-pointer`}
                                        onClick={() => openExerciseEditor(rowIndex, exercise)}
                                        onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="hover:text-indigo-600">{exercise}</span>
                                                    {/* Hedef Set/Tekrar */}
                                                    {targetReps && (
                                                        <span className="text-[11px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                                            {targetReps}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400">✎</span>
                                            </div>

                                            {/* Antrenman Tipi Badge */}
                                            {exerciseWorkoutType && (
                                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded w-fit font-medium">
                                                    {exerciseWorkoutType}
                                                </span>
                                            )}

                                            {/* Kas Grupları Badges */}
                                            {exerciseMuscles.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {exerciseMuscles.slice(0, 3).map(muscleId => (
                                                        <span key={muscleId} className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded">
                                                            {muscleGroups[muscleId]?.label || muscleId}
                                                        </span>
                                                    ))}
                                                    {exerciseMuscles.length > 3 && (
                                                        <span className="text-[9px] text-gray-400">+{exerciseMuscles.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {days.map((day, index) => {
                                        const cellKey = `${rowIndex}-${day.id || index}`;

                                        // Akıllı devre dışı bırakma
                                        const isMismatch = exerciseWorkoutType &&
                                            day.type &&
                                            day.type !== 'Off' &&
                                            day.type !== 'Mix' &&
                                            exerciseWorkoutType !== 'Mix' &&
                                            exerciseWorkoutType !== 'Full Body' &&
                                            exerciseWorkoutType.toLowerCase() !== day.type.toLowerCase();

                                        return (
                                            <td key={day.id || index} className={`p-0 border-r border-b border-gray-200 relative ${isMismatch ? 'bg-gray-100 bg-opacity-50' : ''}`}>
                                                <input
                                                    type="text"
                                                    disabled={isMismatch}
                                                    value={gridData[cellKey] || ''}
                                                    onChange={(e) => onCellChange(activeWeek.id, cellKey, e.target.value)}
                                                    className={`w-full h-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-center text-gray-800 text-sm font-medium placeholder-gray-300 ${day.color?.replace('border-', '') || ''} ${isMismatch ? 'cursor-not-allowed opacity-30' : 'bg-opacity-30'}`}
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

            {/* EXERCISE EDITOR MODAL */}
            <ExerciseEditor
                isOpen={editingExercise !== null}
                onClose={() => setEditingExercise(null)}
                exerciseName={editingExercise?.name || ''}
                exerciseIndex={editingExercise?.index}
                exerciseDetails={editingExercise ? exerciseDetails[editingExercise.index] : null}
                muscleGroups={muscleGroups}
                workoutTypes={workoutTypes}
                onSave={handleExerciseSave}
            />

            {/* COLOR CONTEXT MENU PORTAL */}
            {contextMenu && createPortal(
                <div
                    className="fixed z-[9999] bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-40"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-xs font-bold text-gray-400 mb-1 px-2 border-b pb-1">SATIR RENGİ</div>
                    {COLORS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => handleColorSelect(c.value)}
                            className={`text-left px-2 py-1 text-sm rounded hover:bg-gray-100 flex items-center gap-2 w-full`}
                        >
                            <span className={`w-3 h-3 rounded-full border border-gray-300 ${c.value}`}></span>
                            {c.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {/* DAY EDIT MODAL */}
            {editingDay && (
                <Modal onClose={() => setEditingDay(null)}>
                    <h3 className="text-lg font-bold mb-4">Sütunu Düzenle</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gün İsmi</label>
                        <input
                            type="text"
                            value={editingDay.label}
                            onChange={e => setEditingDay({ ...editingDay, label: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Antrenman Türü</label>
                        <select
                            value={editingDay.type}
                            onChange={e => setEditingDay({ ...editingDay, type: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded bg-white"
                        >
                            {workoutTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                        <div className="grid grid-cols-2 gap-2">
                            {COLUMN_COLORS.map(c => (
                                <button
                                    key={c.label}
                                    onClick={() => setEditingDay({ ...editingDay, color: c.value })}
                                    className={`p-2 rounded text-sm border ${editingDay.color === c.value ? 'ring-2 ring-indigo-500' : 'border-gray-200'} ${c.value.split(' ')[0]}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingDay(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">İptal</button>
                        <button onClick={saveDayEditor} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Kaydet</button>
                    </div>
                </Modal>
            )}

        </div>
    );
}
