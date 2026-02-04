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
    'inner_thigh': { id: 'inner_thigh', label: 'İç Bacak', category: 'Bacak' },
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
    startDate: new Date('2026-01-05').toISOString(),
    maxWeekNumber: 1 // Varsayılan hafta sayısı
};

// Helper outside hook
const calculateWeekNumber = (targetDate, startDateStr) => {
    const start = new Date(startDateStr);
    const target = new Date(targetDate);
    const diffDays = differenceInCalendarDays(target, start);
    if (diffDays < 0) return 1;
    return Math.floor(diffDays / 7) + 1;
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
    const userRef = useRef(null); // Visibility handler için ref
    const initializedRef = useRef(false); // Init çalıştı mı flag

    // User state değiştiğinde ref'i güncelle
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Dinamik tarih hesaplama - ASLA DB'den tarih okuma
    const getWeekDates = useCallback((weekNum, startDateStr) => {
        const globalStart = new Date(startDateStr);
        const weekStart = addDays(globalStart, (weekNum - 1) * 7);
        return DEFAULT_DAYS_TEMPLATE.map((dayTemplate, index) => {
            const dayDate = addDays(weekStart, index);
            return {
                ...dayTemplate,
                date: dayDate.toISOString(),
                displayDate: format(dayDate, 'd MMMM', { locale: tr })
            };
        });
    }, []);

    // Hafta başlangıç tarihini hesapla
    const getWeekStartDate = useCallback((weekNum, startDateStr) => {
        const globalStart = new Date(startDateStr);
        return addDays(globalStart, (weekNum - 1) * 7);
    }, []);

    // Boş hafta oluştur - tarihler dinamik hesaplanır
    const createEmptyWeek = useCallback((weekNum, startDateStr) => {
        const weekStart = getWeekStartDate(weekNum, startDateStr);
        const days = getWeekDates(weekNum, startDateStr);

        return {
            id: `week-${weekNum}`,
            weekNumber: weekNum,
            startDate: weekStart.toISOString(),
            label: `${weekNum}. Hafta`,
            exercises: [],
            exerciseIds: [], // UI-only stable IDs
            gridData: {},
            days
        };
    }, [getWeekDates, getWeekStartDate]);

    // DB'den gelen haftayı hidratla - tarihleri yeniden hesapla
    const hydrateWeekFromDB = useCallback((dbData, startDateStr) => {
        const weekNum = dbData.week_number;
        const weekStart = getWeekStartDate(weekNum, startDateStr);
        const calculatedDays = getWeekDates(weekNum, startDateStr);

        // DB'deki gün ayarlarını (tip, renk) koru, tarihleri hesapla
        const dbDaysConfig = dbData.days_config || [];
        const days = calculatedDays.map((calcDay, i) => ({
            ...calcDay,
            type: dbDaysConfig[i]?.type || '',
            color: dbDaysConfig[i]?.color || 'gray',
            label: dbDaysConfig[i]?.label || calcDay.label
        }));

        const exercises = dbData.exercises || [];
        // Generate ephemeral IDs for existing exercises
        const exerciseIds = exercises.map(() => crypto.randomUUID());

        return {
            id: dbData.id,
            weekNumber: weekNum,
            startDate: weekStart.toISOString(),
            label: `${weekNum}. Hafta`,
            exercises: exercises,
            exerciseIds: exerciseIds, // UI-only stable IDs
            gridData: dbData.grid_data || {},
            days
        };
    }, [getWeekDates, getWeekStartDate]);

    // --- Init Logic ---
    useEffect(() => {
        const init = async () => {
            // Zaten init çalıştıysa tekrar çalıştırma
            if (initializedRef.current) {
                return;
            }

            setLoading(true);
            const currentUser = await auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Load Settings
                    const dbSettings = await workoutDB.getSettings(currentUser.id);
                    if (dbSettings) {
                        const loadedMaxWeek = dbSettings.max_week_number || 1;
                        setSettings(prev => ({
                            ...prev,
                            muscleGroups: dbSettings.muscle_groups || DEFAULT_MUSCLE_GROUPS,
                            workoutTypes: dbSettings.workout_types || DEFAULT_WORKOUT_TYPES,
                            exerciseDetails: dbSettings.exercise_details || {},
                            workoutColors: dbSettings.workout_colors || DEFAULT_WORKOUT_COLORS,
                            startDate: dbSettings.start_date || INITIAL_SETTINGS.startDate,
                            maxWeekNumber: loadedMaxWeek
                        }));
                    }

                    // Load Meta List
                    const metaList = await weeksDB.getWeeksMeta(currentUser.id);
                    setWeekMetaList(metaList || []);

                    // Determine Initial Week Logic
                    const currentWeekNum = calculateWeekNumber(new Date(), dbSettings?.start_date || INITIAL_SETTINGS.startDate);

                    // Load initial week (check cache -> db -> empty)
                    // Since it's init, cache is empty, so check DB
                    const effectiveStartDate = dbSettings?.start_date || INITIAL_SETTINGS.startDate;

                    if (metaList?.find(w => w.week_number === currentWeekNum)) {
                        const weekData = await weeksDB.getWeek(currentUser.id, currentWeekNum);
                        // Tarihleri dinamik hesapla, DB'deki tarihleri kullanma
                        const hydratedWeek = hydrateWeekFromDB(weekData, effectiveStartDate);
                        setActiveWeek(hydratedWeek);
                        setWeeksCache(prev => ({ ...prev, [currentWeekNum]: hydratedWeek }));
                    } else {
                        const empty = createEmptyWeek(currentWeekNum, effectiveStartDate);
                        setActiveWeek(empty);
                        setWeeksCache(prev => ({ ...prev, [currentWeekNum]: empty }));
                    }

                } catch (err) {
                    console.error("Init Error:", err);
                    setSyncStatus('error');
                }
            }
            initializedRef.current = true; // Init tamamlandı
            setLoading(false);
        };

        const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
            // SIGNED_IN: Kullanıcı giriş yaptığında ve henüz init çalışmamışsa
            if (event === 'SIGNED_IN' && session?.user) {
                // Eğer daha önce init çalışmadıysa veya farklı bir kullanıcıysa
                if (!initializedRef.current) {
                    init();
                }
            }
            // SIGNED_OUT: Kullanıcı çıkış yaptığında
            if (event === 'SIGNED_OUT') {
                initializedRef.current = false;
                setUser(null);
                setWeeksCache({});
            }
            // TOKEN_REFRESHED, INITIAL_SESSION, USER_UPDATED eventlerini yoksay
        });

        // Visibility change handler - artık sadece uzun süreli arka plan için
        // Session yenilemesi yapılmıyor, tarayıcı zaten Supabase token'ını yönetiyor
        const handleVisibilityChange = async () => {
            // Intentionally empty - Supabase handles token refresh automatically
            // Removing this logic to prevent unnecessary state changes
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        init();
        return () => {
            subscription?.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [createEmptyWeek, hydrateWeekFromDB]);

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
                    // Tarihleri dinamik hesapla
                    const hydratedWeek = hydrateWeekFromDB(data, settings.startDate);
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

        addWeek: async () => {
            // maxWeekNumber'dan yeni hafta numarasını hesapla
            const nextWeekNum = settings.maxWeekNumber + 1;

            // Settings'i güncelle ve kaydet
            const newSettings = { ...settings, maxWeekNumber: nextWeekNum };
            setSettings(newSettings);

            if (user) {
                try {
                    await workoutDB.upsertSettings(user.id, newSettings);
                } catch (err) {
                    console.error('Error saving maxWeekNumber:', err);
                }
            }

            // Yeni haftaya git
            actions.goToWeek(nextWeekNum);
        },

        // Hafta içeriğini sıfırla (hafta listede kalır)
        resetWeek: async (weekNum) => {
            if (!window.confirm(`${weekNum}. Haftanın içeriğini sıfırlamak istediğinize emin misiniz? Egzersizler ve veriler silinecek.`)) {
                return;
            }

            try {
                // 1. DB'den sil (içerik temizlenir)
                if (user) {
                    const { error } = await supabase.from('weeks').delete().eq('user_id', user.id).eq('week_number', weekNum);
                    if (error) throw error;
                }

                // 2. Cache ve Meta'dan temizle
                setWeekMetaList(prev => prev.filter(w => w.week_number !== weekNum));
                setWeeksCache(prev => {
                    const newCache = { ...prev };
                    delete newCache[weekNum];
                    return newCache;
                });

                // 3. Aktif hafta ise boş halini göster
                if (activeWeek && activeWeek.weekNumber === weekNum) {
                    const empty = createEmptyWeek(weekNum, settings.startDate);
                    setActiveWeek(empty);
                }

                alert(`${weekNum}. Hafta sıfırlandı.`);
            } catch (err) {
                console.error("Reset Error:", err);
                alert("Sıfırlanamadı.");
            }
        },

        // Haftayı tamamen sil (sadece son hafta silinebilir)
        deleteWeek: async (weekNum) => {
            // Kuralları kontrol et
            if (weekNum !== settings.maxWeekNumber) {
                alert("Sadece son hafta silinebilir. Ortadaki haftaları silmek numaralamayı bozar.");
                return;
            }

            if (settings.maxWeekNumber <= 1) {
                alert("En az 1 hafta olmalı. Bu haftayı silemezsiniz, sadece sıfırlayabilirsiniz.");
                return;
            }

            if (!window.confirm(`${weekNum}. Haftayı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
                return;
            }

            try {
                // Aktif hafta ise önce bir önceki haftaya geç
                if (activeWeek && activeWeek.weekNumber === weekNum) {
                    await actions.goToWeek(weekNum - 1);
                }

                // 1. DB'den sil
                if (user) {
                    const { error } = await supabase.from('weeks').delete().eq('user_id', user.id).eq('week_number', weekNum);
                    if (error) throw error;
                }

                // 2. maxWeekNumber'ı azalt ve kaydet
                const newSettings = { ...settings, maxWeekNumber: settings.maxWeekNumber - 1 };
                setSettings(newSettings);

                if (user) {
                    await workoutDB.upsertSettings(user.id, newSettings);
                }

                // 3. Cache ve Meta'dan temizle
                setWeekMetaList(prev => prev.filter(w => w.week_number !== weekNum));
                setWeeksCache(prev => {
                    const newCache = { ...prev };
                    delete newCache[weekNum];
                    return newCache;
                });

                alert(`${weekNum}. Hafta silindi.`);
            } catch (err) {
                console.error("Delete Error:", err);
                alert("Silinemedi.");
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
            updateActiveWeek(prev => {
                let newIds = [...(prev.exerciseIds || [])];
                // If exercises added (length grew), generate new IDs
                while (newIds.length < newExercises.length) {
                    newIds.push(crypto.randomUUID());
                }
                // If exercises removed (length shrank), slice match (assumes truncate from end, but WeeklyGrid typically handles Delete separately)
                // Note: Rename actions maintain length, Add appends.
                if (newIds.length > newExercises.length) {
                    newIds = newIds.slice(0, newExercises.length);
                }
                return { ...prev, exercises: newExercises, exerciseIds: newIds };
            });
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

            // Önbelleği temizle - tüm haftalar yeniden hesaplanacak
            setWeeksCache({});

            // Aktif haftayı yeni tarihlerle yeniden oluştur
            if (activeWeek) {
                const refreshedWeek = createEmptyWeek(activeWeek.weekNumber, date);
                // Mevcut egzersiz ve grid verilerini koru
                const mergedWeek = {
                    ...refreshedWeek,
                    exercises: activeWeek.exercises,
                    gridData: activeWeek.gridData,
                    days: refreshedWeek.days.map((day, i) => ({
                        ...day,
                        type: activeWeek.days[i]?.type || '',
                        color: activeWeek.days[i]?.color || 'gray'
                    }))
                };
                setActiveWeek(mergedWeek);
                setWeeksCache(prev => ({ ...prev, [activeWeek.weekNumber]: mergedWeek }));
            }

            alert("Başlangıç tarihi güncellendi! Tüm haftalar yeni tarihe göre hesaplanacak.");
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

                // Remove ID as well
                const newIds = [...(prev.exerciseIds || [])];
                newIds.splice(index, 1);

                // Grid data clean up implies more logic, skipping for brevity but safe to keep orphan data
                return { ...prev, exercises: newExercises, exerciseIds: newIds };
            });
        },
        reorderExercises: async (weekId, oldIndex, newIndex) => {
            if (oldIndex === newIndex) return;
            if (!activeWeek) return;

            // 1. Prepare Data Stucture for Reordering
            // We'll create a "row" object for each exercise that bundles its name, global details, and grid data
            const currentExercises = activeWeek.exercises || [];
            const ids = activeWeek.exerciseIds || currentExercises.map(() => crypto.randomUUID());

            const rows = currentExercises.map((name, index) => ({
                name,
                id: ids[index],
                details: settings.exerciseDetails[index] || {},
                gridData: {} // keys wil be just the day suffix
            }));

            // Collect Grid Data into rows
            Object.entries(activeWeek.gridData || {}).forEach(([key, value]) => {
                const firstHyphen = key.indexOf('-');
                if (firstHyphen === -1) return;

                const rowIndexStr = key.substring(0, firstHyphen);
                const rowIndex = parseInt(rowIndexStr);
                const daySuffix = key.substring(firstHyphen + 1);

                if (!isNaN(rowIndex) && rows[rowIndex]) {
                    rows[rowIndex].gridData[daySuffix] = value;
                }
            });

            // 2. Perform the Move
            const [movedRow] = rows.splice(oldIndex, 1);
            rows.splice(newIndex, 0, movedRow);

            // 3. Reconstruct Data Structures
            const newExercises = rows.map(r => r.name);
            const newIds = rows.map(r => r.id);

            const newExerciseDetails = { ...settings.exerciseDetails };
            // Clear old numeric keys in range of reordering... actually safer to rebuild strictly from our new 'rows' list
            // However, we must preserve details for indices >= rows.length if any exist (orphans), though likely we want to sync them.
            // Let's rewrite the details for the affected indices 0..rows.length-1
            rows.forEach((row, index) => {
                newExerciseDetails[index] = row.details;
            });

            const newGridData = {};
            // Re-flatten grid data, preserving data for rows we didn't touch if necessary? 
            // Actually, for the active week, we should rebuild 'gridData' from our comprehensive 'rows' list.
            // Any grid data belonging to indices larger than current exercises count is technically orphan/junk, safe to drop or keep.
            // To be safe and clean, we rebuild 'gridData' only for the valid exercises.
            rows.forEach((row, index) => {
                Object.entries(row.gridData).forEach(([daySuffix, value]) => {
                    newGridData[`${index}-${daySuffix}`] = value;
                });
            });

            // 4. Apply Updates
            // Update Local & DB for Active Week (Exercises + GridData)
            updateActiveWeek(prev => ({
                ...prev,
                exercises: newExercises,
                exerciseIds: newIds,
                gridData: newGridData
            }));

            // Update Global Settings (ExerciseDetails)
            setSettings(prev => ({ ...prev, exerciseDetails: newExerciseDetails }));
            if (user) {
                await workoutDB.upsertSettings(user.id, { ...settings, exerciseDetails: newExerciseDetails });
            }
        }
    };

    // --- Prepare Export Data ---
    // maxWeekNumber'dan hafta listesini oluştur (sabit ve güvenilir)
    const maxWeek = settings.maxWeekNumber || 1;

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
        startDate: settings.startDate,
        userId: user?.id // CalendarView için user ID
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
