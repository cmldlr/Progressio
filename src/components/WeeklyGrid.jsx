import React, { useState } from 'react';
import { createPortal } from 'react-dom';

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

const EXERCISE_GROUPS = ['Push', 'Pull', 'Legs', 'Cardio', 'Mix', 'Other'];

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

export default function WeeklyGrid({ activeWeek, onCellChange, onAddExercise, onUpdateExercises, onUpdateRowColor, onUpdateDay, onUpdateExerciseGroup }) {
    const { exercises, gridData, rowColors = {}, days = [], exerciseGroups = {} } = activeWeek;

    // UI State
    const [filterType, setFilterType] = useState('All'); // All, Push, Pull, ...

    // Local state for editing exercise name
    const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
    const [editingName, setEditingName] = useState("");

    // Color/Group Picker State
    const [contextMenu, setContextMenu] = useState(null); // { index, x, y }

    // Column Editing State
    const [editingDay, setEditingDay] = useState(null); // { index, label, type, color }

    const startEditing = (index, currentName) => {
        setEditingExerciseIndex(index);
        setEditingName(currentName);
        setContextMenu(null);
    };

    const saveEditing = (index) => {
        if (editingName.trim()) {
            const newExercises = [...exercises];
            newExercises[index] = editingName.trim();
            onUpdateExercises(activeWeek.id, newExercises);
        }
        setEditingExerciseIndex(null);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') saveEditing(index);
        if (e.key === 'Escape') setEditingExerciseIndex(null);
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

    const handleGroupSelect = (group) => {
        if (contextMenu && onUpdateExerciseGroup) {
            onUpdateExerciseGroup(activeWeek.id, contextMenu.index, group);
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

    // Determine which rows to show based on filter
    const visibleExercises = exercises.map((ex, i) => ({ name: ex, originalIndex: i }))
        .filter(({ originalIndex }) => {
            if (filterType === 'All') return true;
            const group = exerciseGroups[originalIndex] || 'Other';
            return group === filterType;
        });

    return (
        <div className="p-4 space-y-6" onClick={() => setContextMenu(null)}>

            {/* Controls Bar */}
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">Filtre:</span>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="p-1 border border-gray-300 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="All">Tümü</option>
                        {EXERCISE_GROUPS.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                        <option value="Unassigned">Grubu Yok</option>
                    </select>
                </div>
                <div className="text-xs text-blue-600">
            Sağ tık > Grup Seç ile hareketleri gruplayabilirsiniz.
                </div>
            </div>

            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200 pb-20">
                <table className="min-w-full border-collapse bg-white">
                    <thead>
                        <tr>
                            <th className="p-3 border-b-2 border-r border-gray-200 bg-gray-50 text-left min-w-[200px] sticky left-0 z-10 shadow-sm relative group">
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
                                    className={`p-3 border-b-2 border-r border-gray-200 min-w-[120px] text-center cursor-pointer hover:brightness-95 transition ${day.color}`}
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
                            const group = exerciseGroups[rowIndex];

                            return (
                                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                    {/* Exercise Name Cell */}
                                    <td
                                        className={`p-3 border-r border-b border-gray-200 font-semibold text-gray-700 ${rowBgColor} sticky left-0 z-10 shadow-sm text-sm relative group`}
                                        onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                                    >
                                        <div className="flex flex-col">
                                            {editingExerciseIndex === rowIndex ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onBlur={() => saveEditing(rowIndex)}
                                                    onKeyDown={(e) => handleKeyDown(e, rowIndex)}
                                                    className="w-full p-1 border border-indigo-300 rounded text-sm"
                                                />
                                            ) : (
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); startEditing(rowIndex, exercise); }}
                                                    className="cursor-pointer hover:text-indigo-600 flex justify-between items-center"
                                                    title="İsmi düzenlemek için tıkla, Grup/Renk için sağ tıkla"
                                                >
                                                    <span>{exercise}</span>
                                                    <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400">✎</span>
                                                </div>
                                            )}

                                            {/* Group Label Badge */}
                                            {group && (
                                                <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded w-fit mt-1">
                                                    {group}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {days.map((day, index) => {
                                        const cellKey = `${rowIndex}-${day.id || index}`;

                                        // SMART DISABLE LOGIC
                                        // If both Exercise Group and Day Type are set, and they DON'T match, and Day Type isn't "Mix" or "Off"
                                        // Then we visually disable it.
                                        const isMismatch = group && day.type &&
                                            day.type !== 'Off' &&
                                            day.type !== 'Mix' &&
                                            group !== 'Mix' &&
                                            group.toLowerCase() !== day.type.toLowerCase();

                                        return (
                                            <td key={day.id || index} className={`p-0 border-r border-b border-gray-200 relative ${isMismatch ? 'bg-gray-100 bg-opacity-50' : ''}`}>
                                                <input
                                                    type="text"
                                                    disabled={isMismatch} // Physically disable input
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

            {/* FIXED CONTEXT MENU PORTAL */}
            {contextMenu && createPortal(
                <div
                    className="fixed z-[9999] bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 flex flex-col gap-1"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-xs font-bold text-gray-400 mb-1 px-2 border-b pb-1">HAREKET GRUBU</div>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                        {EXERCISE_GROUPS.map(g => (
                            <button key={g} onClick={() => handleGroupSelect(g)} className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-left">
                                {g}
                            </button>
                        ))}
                        <button onClick={() => handleGroupSelect(null)} className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded text-left">Sıfırla</button>
                    </div>

                    <div className="text-xs font-bold text-gray-400 mb-1 px-2 border-b pb-1">RENK SEÇİN</div>
                    {COLORS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => handleColorSelect(c.value)}
                            className={`text-left px-2 py-1 text-sm rounded hover:bg-gray-100 flex items-center gap-2`}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Antrenman Türü (Push, Pull, Legs...)</label>
                        <div className="text-xs text-gray-500 mb-2">Doğru eşleşme için "Push", "Pull", "Legs" türlerini kullanın.</div>
                        <input
                            type="text"
                            value={editingDay.type}
                            onChange={e => setEditingDay({ ...editingDay, type: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
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
