import { useState, useEffect } from 'react';
import initialData from '../data_import.json';

const STORAGE_KEY = 'progressio_data_v2';

const DEFAULT_EXERCISES = initialData.exercises;
const DEFAULT_GRID_DATA = initialData.gridData;

const DEFAULT_DAYS = [
    { id: 'Mon', label: 'Pazartesi', type: 'Off', color: 'bg-gray-100 border-gray-300' },
    { id: 'Tue', label: 'Salı', type: 'Push', color: 'bg-red-100 border-red-300' },
    { id: 'Wed', label: 'Çarşamba', type: 'Pull', color: 'bg-blue-100 border-blue-300' },
    { id: 'Thu', label: 'Perşembe', type: 'Off', color: 'bg-gray-100 border-gray-300' },
    { id: 'Fri', label: 'Cuma', type: 'Push', color: 'bg-red-100 border-red-300' },
    { id: 'Sat', label: 'Cumartesi', type: 'Pull', color: 'bg-blue-100 border-blue-300' },
    { id: 'Sun', label: 'Pazar', type: 'Legs', color: 'bg-green-100 border-green-300' },
];

// Initial state structure
const INITIAL_STATE = {
    weeks: [
        {
            id: 1,
            label: '1. Hafta',
            exercises: DEFAULT_EXERCISES,
            gridData: DEFAULT_GRID_DATA,
            rowColors: {},
            exerciseGroups: {}, // [NEW] Key: rowIndex, Value: groupType (Push, Pull, Legs, etc.)
            days: DEFAULT_DAYS
        }
    ],
    activeWeekId: 1
};

export function useWorkoutData() {
    const [data, setData] = useState(() => {
        // Try to load v2 data
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration: Ensure new fields exist
            parsed.weeks = parsed.weeks.map(w => ({
                ...w,
                days: w.days || DEFAULT_DAYS,
                exerciseGroups: w.exerciseGroups || {}
            }));
            return parsed;
        }

        // Fallback: Try to migrate v1 data (from previous phase)
        const v1Data = localStorage.getItem('fitness_data');
        const v1Exercises = localStorage.getItem('fitness_exercises');

        if (v1Data || v1Exercises) {
            const migratedGrid = v1Data ? JSON.parse(v1Data) : DEFAULT_GRID_DATA;
            const migratedEx = v1Exercises ? JSON.parse(v1Exercises) : DEFAULT_EXERCISES;

            return {
                weeks: [
                    {
                        id: 1,
                        label: '1. Hafta',
                        exercises: migratedEx,
                        gridData: migratedGrid,
                        rowColors: {},
                        exerciseGroups: {},
                        days: DEFAULT_DAYS
                    }
                ],
                activeWeekId: 1
            };
        }

        return INITIAL_STATE;
    });

    // Auto-save whenever data changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const activeWeek = data.weeks.find(w => w.id === data.activeWeekId) || data.weeks[0];

    const actions = {
        setActiveWeek: (id) => {
            setData(prev => ({ ...prev, activeWeekId: id }));
        },

        addWeek: () => {
            setData(prev => {
                const newId = Math.max(...prev.weeks.map(w => w.id)) + 1;
                // Clone the last week's exercises, row colors, days, AND GROUPS
                const lastWeek = prev.weeks[prev.weeks.length - 1];

                const newWeek = {
                    id: newId,
                    label: `${newId}. Hafta`,
                    exercises: [...lastWeek.exercises],
                    rowColors: { ...(lastWeek.rowColors || {}) },
                    exerciseGroups: { ...(lastWeek.exerciseGroups || {}) }, // Clone groups
                    days: lastWeek.days ? JSON.parse(JSON.stringify(lastWeek.days)) : DEFAULT_DAYS,
                    gridData: {}
                };

                return {
                    ...prev,
                    weeks: [...prev.weeks, newWeek],
                    activeWeekId: newId
                };
            });
        },

        deleteWeek: (id) => {
            if (!window.confirm("Bu haftayı silmek istediğinize emin misiniz?")) return;

            setData(prev => {
                if (prev.weeks.length <= 1) {
                    alert("En az bir hafta kalmalıdır.");
                    return prev;
                }

                const newWeeks = prev.weeks.filter(w => w.id !== id);
                const newActiveId = prev.activeWeekId === id ? newWeeks[newWeeks.length - 1].id : prev.activeWeekId;

                return {
                    ...prev,
                    weeks: newWeeks,
                    activeWeekId: newActiveId
                };
            });
        },

        updateGridData: (weekId, cellKey, value) => {
            setData(prev => ({
                ...prev,
                weeks: prev.weeks.map(week => {
                    if (week.id !== weekId) return week;
                    return {
                        ...week,
                        gridData: { ...week.gridData, [cellKey]: value }
                    };
                })
            }));
        },

        updateExercises: (weekId, newExercises) => {
            setData(prev => ({
                ...prev,
                weeks: prev.weeks.map(week => {
                    if (week.id !== weekId) return week;
                    return { ...week, exercises: newExercises };
                })
            }));
        },

        updateRowColor: (weekId, rowIndex, colorClass) => {
            setData(prev => ({
                ...prev,
                weeks: prev.weeks.map(week => {
                    if (week.id !== weekId) return week;
                    return {
                        ...week,
                        rowColors: { ...(week.rowColors || {}), [rowIndex]: colorClass }
                    };
                })
            }));
        },

        // [NEW] Update Exercise Group
        updateExerciseGroup: (weekId, rowIndex, group) => {
            setData(prev => ({
                ...prev,
                weeks: prev.weeks.map(week => {
                    if (week.id !== weekId) return week;
                    return {
                        ...week,
                        exerciseGroups: { ...(week.exerciseGroups || {}), [rowIndex]: group }
                    };
                })
            }));
        },

        updateDay: (weekId, dayIndex, newDayConfig) => {
            setData(prev => ({
                ...prev,
                weeks: prev.weeks.map(week => {
                    if (week.id !== weekId) return week;

                    const newDays = [...(week.days || DEFAULT_DAYS)];
                    newDays[dayIndex] = { ...newDays[dayIndex], ...newDayConfig };

                    return { ...week, days: newDays };
                })
            }));
        },

        // Global reset
        resetAll: () => {
            if (window.confirm("Tüm veri silinecek. Emin misiniz?")) {
                setData(INITIAL_STATE);
                localStorage.removeItem('fitness_data'); // Cleanup v1
                localStorage.removeItem('fitness_exercises'); // Cleanup v1
            }
        },

        importData: (jsonData) => {
            setData(jsonData);
        }
    };

    return { data, activeWeek, actions };
}
