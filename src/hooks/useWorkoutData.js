import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, auth, workoutDB, weeksDB } from '../lib/supabaseClient';
import { differenceInCalendarDays, addDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Standart Sabitler
const DEFAULT_MUSCLE_GROUPS = {
    'upper_chest': { id: 'upper_chest', label: 'Üst Göğüs', category: 'Göğüs' },
    'mid_chest': { id: 'mid_chest', label: 'Orta Göğüs', category: 'Göğüs' },
    'lower_chest': { id: 'lower_chest', label: 'Alt Göğüs', category: 'Göğüs' },
    'front_delt': { id: 'front_delt', label: 'Ön Omuz', category: 'Omuz' },
    'side_delt': { id: 'side_delt', label: 'Yan Omuz', category: 'Omuz' },
    'rear_delt': { id: 'rear_delt', label: 'Arka Omuz', category: 'Omuz' },
    'lats': { id: 'lats', label: 'Kanat (Lat)', category: 'Sırt' },
    'traps': { id: 'traps', label: 'Trapez', category: 'Sırt' },
    'rhomboids': { id: 'rhomboids', label: 'Orta Sırt', category: 'Sırt' },
    'lower_back': { id: 'lower_back', label: 'Bel', category: 'Sırt' },
    'biceps': { id: 'biceps', label: 'Biceps', category: 'Kollar' },
    'triceps': { id: 'triceps', label: 'Triceps', category: 'Kollar' },
    'forearm': { id: 'forearm', label: 'Ön Kol', category: 'Kollar' },
    'quads': { id: 'quads', label: 'Quadriceps', category: 'Bacak' },
    'hamstrings': { id: 'hamstrings', label: 'Hamstring', category: 'Bacak' },
    'glutes': { id: 'glutes', label: 'Kalça', category: 'Bacak' },
    'calves': { id: 'calves', label: 'Baldır', category: 'Bacak' },
    'abs': { id: 'abs', label: 'Karın', category: 'Core' },
    'obliques': { id: 'obliques', label: 'Yan Karın', category: 'Core' },
};

const DEFAULT_WORKOUT_TYPES = ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio', 'Core', 'Off'];
const DEFAULT_WORKOUT_COLORS = {
    'Push': '#ef4444', 'Pull': '#3b82f6', 'Legs': '#eab308', 'Upper Body': '#8b5cf6',
    'Lower Body': '#ec4899', 'Full Body': '#10b981', 'Cardio': '#f97316', 'Core': '#06b6d4', 'Off': '#9ca3af'
};

const DEFAULT_DAYS_TEMPLATE = [
    { id: 'Mon', label: 'Pazartesi', type: '', color: 'gray' },
    { id: 'Tue', label: 'Salı', type: '', color: 'gray' },
    { id: 'Wed', label: 'Çarşamba', type: '', color: 'gray' },
    { id: 'Thu', label: 'Perşembe', type: '', color: 'gray' },
    { id: 'Fri', label: 'Cuma', type: '', color: 'gray' },
    { id: 'Sat', label: 'Cumartesi', type: '', color: 'gray' },
    { id: 'Sun', label: 'Pazar', type: '', color: 'gray' },
];

const INITIAL_SETTINGS = {
    muscleGroups: DEFAULT_MUSCLE_GROUPS,
    workoutTypes: DEFAULT_WORKOUT_TYPES,
    exerciseDetails: {},
    workoutColors: DEFAULT_WORKOUT_COLORS,
    startDate: new Date('2026-01-05').toISOString()
};

export function useWorkoutData() {
    // 1. Global Settings State
    const [settings, setSettings] = useState(INITIAL_SETTINGS);

    // 2. Data State
    const [activeWeek, setActiveWeek] = useState(null);
    const [weekMetaList, setWeekMetaList] = useState([]); // DB'den gelen liste
    const [weeksCache, setWeeksCache] = useState({}); // Session Cache: { [weekNumber]: weekData }

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('idle');
    const [syncError, setSyncError] = useState(null);
    const saveTimeoutRef = useRef(null);

    // --- Helpers ---
    const calculateWeekNumber = (targetDate, startDateStr) => {
        const start = new Date(startDateStr);
        const target = new Date(targetDate);
        const diffDays = differenceInCalendarDays(target, start);
        if (diffDays < 0) return 1;
        return Math.floor(diffDays / 7) + 1;
    };

    const createEmptyWeek = (weekNum, startDateStr) => {
        const globalStart = new Date(startDateStr);
        const thisWeekStart = addDays(globalStart, (weekNum - 1) * 7);

        const daysWithDates = DEFAULT_DAYS_TEMPLATE.map((day, index) => {
            const dayDate = addDays(thisWeekStart, index);
            return {
                ...day,
                date: dayDate.toISOString(),
                displayDate: format(dayDate, 'd MMMM', { locale: tr })
            };
        });

        return {
            id: `week-${weekNum}`, // Geçici ID
            weekNumber: weekNum,
            startDate: thisWeekStart.toISOString(),
            label: `${weekNum}. Hafta`,
            exercises: [],
            gridData: {},
            days: daysWithDates
        };
    };

    // --- Init Logic ---
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const currentUser = await auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Load Settings
                    const dbSettings = await workoutDB.getSettings(currentUser.id);
                    if (dbSettings) {
                        setSettings(prev => ({
                            ...prev,
                            muscleGroups: dbSettings.muscle_groups || DEFAULT_MUSCLE_GROUPS,
                            workoutTypes: dbSettings.workout_types || DEFAULT_WORKOUT_TYPES,
                            exerciseDetails: dbSettings.exercise_details || {},
                            workoutColors: dbSettings.workout_colors || DEFAULT_WORKOUT_COLORS,
                            startDate: dbSettings.start_date || INITIAL_SETTINGS.startDate
                        }));
                    }

                    // Load Meta List
                    const metaList = await weeksDB.getWeeksMeta(currentUser.id);
                    setWeekMetaList(metaList || []);

                    // Determine Initial Week Logic
                    const currentWeekNum = calculateWeekNumber(new Date(), dbSettings?.start_date || INITIAL_SETTINGS.startDate);

                    // Load initial week (check cache -> db -> empty)
                    // Since it's init, cache is empty, so check DB
                    if (metaList?.find(w => w.week_number === currentWeekNum)) {
                        const weekData = await weeksDB.getWeek(currentUser.id, currentWeekNum);
                        const hydratedWeek = {
                            id: weekData.id,
                            weekNumber: weekData.week_number,
                            startDate: weekData.start_date,
                            label: `${weekData.week_number}. Hafta`,
                            exercises: weekData.exercises || [],
                            gridData: weekData.grid_data || {},
                            days: weekData.days_config || DEFAULT_DAYS_TEMPLATE
                        };
                        setActiveWeek(hydratedWeek);
                        setWeeksCache(prev => ({ ...prev, [currentWeekNum]: hydratedWeek }));
                    } else {
                        const empty = createEmptyWeek(currentWeekNum, dbSettings?.start_date || INITIAL_SETTINGS.startDate);
                        setActiveWeek(empty);
                        setWeeksCache(prev => ({ ...prev, [currentWeekNum]: empty }));
                    }

                } catch (err) {
                    console.error("Init Error:", err);
                    setSyncStatus('error');
                }
            }
            setLoading(false);
        };

        const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') init();
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setWeeksCache({});
            }
        });

        init();
        return () => subscription?.unsubscribe();
    }, []);

    // --- Debounced Save ---
    const saveActiveWeek = useCallback(async (weekToSave) => {
        if (!user || !weekToSave) return;
        setSyncStatus('syncing');

        try {
            await weeksDB.upsertWeek(user.id, {
                weekNumber: weekToSave.weekNumber,
                startDate: weekToSave.startDate,
                exercises: weekToSave.exercises,
                gridData: weekToSave.gridData,
                daysConfig: weekToSave.days
            });

            setSyncStatus('synced');
            setSyncError(null);

            // Update Meta List to confirm this week is now saved in DB
            setWeekMetaList(prev => {
                const exists = prev.find(w => w.week_number === weekToSave.weekNumber);
                if (exists) return prev;
                return [...prev, { week_number: weekToSave.weekNumber, start_date: weekToSave.startDate, id: weekToSave.id }];
            });

        } catch (err) {
            console.error("Save Error:", err);
            setSyncStatus('error');
            setSyncError("Kaydedilemedi!");
        }
    }, [user]);

    // --- Update Handler ---
    const updateActiveWeek = (updater) => {
        setActiveWeek(prev => {
            const newState = typeof updater === 'function' ? updater(prev) : updater;

            // 1. Update Cache Immediately
            setWeeksCache(prevCache => ({
                ...prevCache,
                [newState.weekNumber]: newState
            }));

            // 2. Debounce DB Save
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => saveActiveWeek(newState), 2000);

            return newState;
        });
    };

    // --- Actions ---
    const actions = {
        goToWeek: async (weekIdentifier) => {
            const weekNum = typeof weekIdentifier === 'string' ? parseInt(weekIdentifier.replace('week-', '')) : weekIdentifier;
            if (isNaN(weekNum)) return;

            setLoading(true);

            // 1. Check Cache
            if (weeksCache[weekNum]) {
                setActiveWeek(weeksCache[weekNum]);
                setLoading(false);
                return;
            }

            // 2. Check DB
            try {
                const meta = weekMetaList.find(w => w.week_number === weekNum);
                if (meta) {
                    const data = await weeksDB.getWeek(user.id, weekNum);
                    const hydratedWeek = {
                        id: data.id,
                        weekNumber: data.week_number,
                        startDate: data.start_date,
                        label: `${data.week_number}. Hafta`,
                        exercises: data.exercises || [],
                        gridData: data.grid_data || {},
                        days: data.days_config || DEFAULT_DAYS_TEMPLATE
                    };
                    setActiveWeek(hydratedWeek);
                    setWeeksCache(prev => ({ ...prev, [weekNum]: hydratedWeek }));
                } else {
                    // 3. Create New (Empty)
                    const empty = createEmptyWeek(weekNum, settings.startDate);
                    setActiveWeek(empty);
                    setWeeksCache(prev => ({ ...prev, [weekNum]: empty }));
                }
            } catch (error) {
                console.error("GoToWeek Error:", error);
            }
            setLoading(false);
        },

        addWeek: () => {
            // Calculate max week from both DB and Cache (to allow consecutive adds without saving)
            const allWeekNums = [
                ...weekMetaList.map(w => w.week_number),
                ...Object.keys(weeksCache).map(k => parseInt(k))
            ];
            const maxWeek = allWeekNums.length > 0 ? Math.max(...allWeekNums) : 0;
            const nextWeekNum = maxWeek + 1;
            actions.goToWeek(nextWeekNum);
        },

        deleteWeek: async (weekIdentifier) => {
            const weekNum = typeof weekIdentifier === 'string' ? parseInt(weekIdentifier.replace('week-', '')) : weekIdentifier;

            if (window.confirm(`${weekNum}. Haftayı silmek (sıfırlamak) istediğinize emin misiniz?`)) {
                try {
                    // 1. Delete from DB
                    if (user) {
                        const { error } = await supabase.from('weeks').delete().eq('user_id', user.id).eq('week_number', weekNum);
                        if (error) throw error;
                    }

                    // 2. Clear from Cache & Meta
                    setWeekMetaList(prev => prev.filter(w => w.week_number !== weekNum));
                    setWeeksCache(prev => {
                        const newCache = { ...prev };
                        delete newCache[weekNum];
                        return newCache;
                    });

                    // 3. Reset View if Active
                    if (activeWeek && activeWeek.weekNumber === weekNum) {
                        const empty = createEmptyWeek(weekNum, settings.startDate);
                        setActiveWeek(empty);
                        // Don't add to cache yet, keep it "clean" until edit? 
                        // Actually better to have it in State but not persisted.
                    }

                    alert(`${weekNum}. Hafta sıfırlandı.`);
                } catch (err) {
                    console.error("Delete Error:", err);
                    alert("Silinemedi.");
                }
            }
        },

        // --- Data Updates ---
        updateGridData: (weekId, cellKey, value) => {
            updateActiveWeek(prev => ({
                ...prev,
                gridData: { ...prev.gridData, [cellKey]: value }
            }));
        },

        updateExercises: (weekId, newExercises) => {
            updateActiveWeek(prev => ({ ...prev, exercises: newExercises }));
        },

        updateDay: (weekId, dayIndex, updates) => {
            updateActiveWeek(prev => {
                const newDays = [...prev.days];
                newDays[dayIndex] = { ...newDays[dayIndex], ...updates };
                return { ...prev, days: newDays };
            });
        },

        updateWorkoutColor: async (type, color) => {
            const newColors = { ...settings.workoutColors, [type]: color };
            setSettings(prev => ({ ...prev, workoutColors: newColors }));
            if (user) await workoutDB.upsertSettings(user.id, { ...settings, workoutColors: newColors });

            // Update active week visuals
            updateActiveWeek(prev => ({
                ...prev,
                days: prev.days.map(d => d.type === type ? { ...d, color } : d)
            }));
        },

        // --- Settings Actions ---
        setStartDate: async (date) => {
            const newSettings = { ...settings, startDate: date };
            setSettings(newSettings);
            if (user) await workoutDB.upsertSettings(user.id, newSettings);

            // Aktif haftanın tarihlerini anlık güncelle
            if (activeWeek) {
                const globalStart = new Date(date);
                const thisWeekStart = addDays(globalStart, (activeWeek.weekNumber - 1) * 7);

                const newDays = activeWeek.days.map((day, index) => {
                    const dayDate = addDays(thisWeekStart, index);
                    return {
                        ...day,
                        date: dayDate.toISOString(),
                        displayDate: format(dayDate, 'd MMMM', { locale: tr })
                    };
                });

                // ActiveWeek'i güncelle (startDate ve days değişti)
                updateActiveWeek(prev => ({
                    ...prev,
                    startDate: thisWeekStart.toISOString(),
                    days: newDays
                }));
            }

            alert("Başlangıç tarihi güncellendi. Takvim tekrar hesaplandı.");
        },
        addMuscleGroup: async (id, label, category) => {
            const newGroups = { ...settings.muscleGroups, [id]: { id, label, category } };
            setSettings(prev => ({ ...prev, muscleGroups: newGroups }));
            if (user) await workoutDB.upsertSettings(user.id, { ...settings, muscleGroups: newGroups });
        },
        removeMuscleGroup: async (id) => {
            const newGroups = { ...settings.muscleGroups };
            delete newGroups[id];
            setSettings(prev => ({ ...prev, muscleGroups: newGroups }));
            if (user) await workoutDB.upsertSettings(user.id, { ...settings, muscleGroups: newGroups });
        },
        addWorkoutType: async (type) => {
            const newTypes = [...settings.workoutTypes, type];
            const newColors = { ...settings.workoutColors, [type]: '#9ca3af' };
            setSettings(prev => ({ ...prev, workoutTypes: newTypes, workoutColors: newColors }));
            if (user) await workoutDB.upsertSettings(user.id, { ...settings, workoutTypes: newTypes, workoutColors: newColors });
        },
        removeWorkoutType: async (type) => {
            const newTypes = settings.workoutTypes.filter(t => t !== type);
            const newColors = { ...settings.workoutColors };
            delete newColors[type];
            setSettings(prev => ({ ...prev, workoutTypes: newTypes, workoutColors: newColors }));
            if (user) await workoutDB.upsertSettings(user.id, { ...settings, workoutTypes: newTypes, workoutColors: newColors });
        },
        updateExerciseDetails: async (rowIndex, details) => {
            const newDetails = { ...settings.exerciseDetails, [rowIndex]: details };
            setSettings(prev => ({ ...prev, exerciseDetails: newDetails }));
            if (user) await workoutDB.upsertSettings(user.id, { ...settings, exerciseDetails: newDetails });
        },
        deleteExercise: (weekId, index) => {
            updateActiveWeek(prev => {
                const newExercises = [...prev.exercises];
                newExercises.splice(index, 1);
                // Grid data clean up implies more logic, skipping for brevity but safe to keep orphan data
                return { ...prev, exercises: newExercises };
            });
        }
    };

    // --- Prepare Export Data ---
    // Combine DB Meta with Cache Keys to get full list of weeks
    const allWeekNumbers = new Set([
        ...weekMetaList.map(w => w.week_number),
        ...Object.keys(weeksCache).map(k => parseInt(k)),
        activeWeek ? activeWeek.weekNumber : 1
    ]);
    const maxWeek = Math.max(...allWeekNumbers, 1);

    const weeksList = [];
    for (let i = 1; i <= maxWeek; i++) {
        weeksList.push({
            id: i,
            label: `${i}. Hafta`,
            isLoaded: activeWeek && activeWeek.weekNumber === i
        });
    }

    const synthesizedData = {
        weeks: activeWeek ? [activeWeek] : [],
        weeksList,
        activeWeekId: activeWeek ? activeWeek.weekNumber : 1, // Use Week Number as ID for UI consistency
        muscleGroups: settings.muscleGroups,
        workoutTypes: settings.workoutTypes,
        exerciseDetails: settings.exerciseDetails,
        workoutColors: settings.workoutColors,
        startDate: settings.startDate
    };

    return {
        data: synthesizedData,
        activeWeek,
        actions,
        user,
        loading,
        syncStatus,
        syncError,
        signOut: auth.signOut
    };
}
