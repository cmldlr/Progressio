import React, { useState, useEffect } from 'react';

// Initial default exercises if nothing is in local storage
const DEFAULT_EXERCISES = [
    'Lat Pulldown',
    'Bench Press',
    'Squat',
    'Deadlift',
    'Overhead Press',
    'Leg Curl',
    'Bicep Curl',
    'Tricep Extension'
];

const DAYS = [
    { id: 'Mon', label: 'Pazartesi', type: 'Off', color: 'bg-gray-100 border-gray-300' },
    { id: 'Tue', label: 'Salı', type: 'Push', color: 'bg-red-100 border-red-300' },
    { id: 'Wed', label: 'Çarşamba', type: 'Pull', color: 'bg-blue-100 border-blue-300' },
    { id: 'Thu', label: 'Perşembe', type: 'Off', color: 'bg-gray-100 border-gray-300' },
    { id: 'Fri', label: 'Cuma', type: 'Push', color: 'bg-red-100 border-red-300' },
    { id: 'Sat', label: 'Cumartesi', type: 'Pull', color: 'bg-blue-100 border-blue-300' },
    { id: 'Sun', label: 'Pazar', type: 'Legs', color: 'bg-green-100 border-green-300' },
];

export default function WeeklyGrid() {
    const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
    const [gridData, setGridData] = useState({});

    // LOAD DATA ON MOUNT
    useEffect(() => {
        const savedData = localStorage.getItem('fitness_data');
        const savedExercises = localStorage.getItem('fitness_exercises');

        if (savedData) {
            setGridData(JSON.parse(savedData));
        }
        if (savedExercises) {
            setExercises(JSON.parse(savedExercises));
        }
    }, []);

    // INSTANT SAVE FUNCTION
    const handleCellChange = (rowIndex, dayId, value) => {
        const key = `${rowIndex}-${dayId}`;
        const newGridData = { ...gridData, [key]: value };

        setGridData(newGridData);
        localStorage.setItem('fitness_data', JSON.stringify(newGridData));
    };

    const handleAddExercise = () => {
        const newExercise = prompt("Yeni hareket ismi:");
        if (newExercise) {
            const newExercises = [...exercises, newExercise];
            setExercises(newExercises);
            localStorage.setItem('fitness_exercises', JSON.stringify(newExercises));
        }
    };

    const handleClearData = () => {
        if (window.confirm("Tüm verileri silmek istediğinize emin misiniz?")) {
            setGridData({});
            localStorage.removeItem('fitness_data');
            // We keep exercises list, or should we clear that too? Usually users just want to clear the inputs.
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify({ gridData, exercises });
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'fitness_backup.json';

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed.gridData) {
                    setGridData(parsed.gridData);
                    localStorage.setItem('fitness_data', JSON.stringify(parsed.gridData));
                }
                if (parsed.exercises) {
                    setExercises(parsed.exercises);
                    localStorage.setItem('fitness_exercises', JSON.stringify(parsed.exercises));
                }
                alert("Yedek başarıyla yüklendi!");
            } catch (err) {
                alert("Dosya okunamadı. Geçersiz JSON formatı.");
            }
        };
    };

    return (
        <div className="p-4 space-y-6">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Progressio Tracker</h1>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleAddExercise}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                        + Hareket Ekle
                    </button>
                    <button
                        onClick={handleClearData}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition border border-red-200"
                    >
                        Verileri Temizle
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition border border-gray-300"
                    >
                        Yedek İndir (JSON)
                    </button>
                    <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition border border-gray-300 cursor-pointer">
                        Yedek Yükle
                        <input type="file" onChange={handleImport} className="hidden" accept=".json" />
                    </label>
                </div>
            </div>

            {/* GRID */}
            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
                <table className="min-w-full border-collapse bg-white">
                    <thead>
                        <tr>
                            <th className="p-3 border-b-2 border-r border-gray-200 bg-gray-50 text-left min-w-[150px] sticky left-0 z-10 shadow-sm">
                                Egzersiz / Gün
                            </th>
                            {DAYS.map(day => (
                                <th key={day.id} className={`p-3 border-b-2 border-r border-gray-200 min-w-[120px] text-center ${day.color}`}>
                                    <div className="font-bold text-gray-800">{day.label}</div>
                                    <div className="text-xs text-gray-600 font-medium uppercase tracking-wider">{day.type}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {exercises.map((exercise, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 border-r border-b border-gray-200 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10 shadow-sm">
                                    {exercise}
                                </td>
                                {DAYS.map(day => {
                                    const cellKey = `${rowIndex}-${day.id}`;
                                    return (
                                        <td key={day.id} className={`p-0 border-r border-b border-gray-200 relative`}>
                                            <input
                                                type="text"
                                                value={gridData[cellKey] || ''}
                                                onChange={(e) => handleCellChange(rowIndex, day.id, e.target.value)}
                                                className={`w-full h-full p-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-center text-gray-800 font-medium placeholder-gray-300 ${day.color.replace('border-', '')} bg-opacity-30`}
                                                placeholder="-"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="text-center text-sm text-gray-400 mt-4">
                Veriler tarayıcınızda otomatik olarak saklanmaktadır.
            </div>
        </div>
    );
}
