import { useState, useEffect, useCallback, useRef } from 'react';
import initialData from '../data_import.json';
import { supabase, auth, workoutDB } from '../lib/supabaseClient';

const STORAGE_KEY = 'progressio_data_v2';

// Varsayılan kas grupları - kategorilere ayrılmış
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

// Varsayılan antrenman tipleri (özelleştirilebilir)
const DEFAULT_WORKOUT_TYPES = ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio', 'Core', 'Off'];

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

// Varsayılan renk-antrenman eşleşmeleri
const DEFAULT_WORKOUT_COLORS = {
    'bg-gray-100 border-gray-300': { label: 'Gri', type: 'Off' },
    'bg-red-100 border-red-300': { label: 'Kırmızı', type: 'Push' },
    'bg-blue-100 border-blue-300': { label: 'Mavi', type: 'Pull' },
    'bg-green-100 border-green-300': { label: 'Yeşil', type: 'Legs' },
    'bg-yellow-100 border-yellow-300': { label: 'Sarı', type: 'Upper Body' },
    'bg-purple-100 border-purple-300': { label: 'Mor', type: 'Lower Body' },
    'bg-orange-100 border-orange-300': { label: 'Turuncu', type: 'Cardio' },
    'bg-pink-100 border-pink-300': { label: 'Pembe', type: 'Full Body' },
};

// Initial state structure
const INITIAL_STATE = {
    // Global settings (shared across all weeks)
    muscleGroups: { ...DEFAULT_MUSCLE_GROUPS },
    workoutTypes: [...DEFAULT_WORKOUT_TYPES],
    workoutColors: { ...DEFAULT_WORKOUT_COLORS }, // Yeni eklenen kısım

    // Exercise details - kas grupları ve antrenman tipi (index bazlı)
    exerciseDetails: {},

    weeks: [
        {
            id: 1,
            label: '1. Hafta',
            exercises: DEFAULT_EXERCISES,
            gridData: DEFAULT_GRID_DATA,
            rowColors: {},
            exerciseGroups: {}, // Legacy
            days: DEFAULT_DAYS
        }
    ],
    activeWeekId: 1
};

// Helper: localStorage'dan veri yükle
const loadFromLocalStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        parsed.weeks = parsed.weeks.map(w => ({
            ...w,
            days: w.days || DEFAULT_DAYS,
            exerciseGroups: w.exerciseGroups || {}
        }));
        parsed.muscleGroups = parsed.muscleGroups || { ...DEFAULT_MUSCLE_GROUPS };
        parsed.workoutTypes = parsed.workoutTypes || [...DEFAULT_WORKOUT_TYPES];
        parsed.exerciseDetails = parsed.exerciseDetails || {};
        parsed.workoutColors = parsed.workoutColors || { ...DEFAULT_WORKOUT_COLORS }; // Yüklerken kontrol et
        return parsed;
    }
    return null;
};

// Helper: Supabase'den gelen veriyi dönüştür
const transformSupabaseData = (dbData) => {
    if (!dbData) return null;
    return {
        weeks: dbData.weeks || INITIAL_STATE.weeks,
        activeWeekId: dbData.active_week_id || 1,
        muscleGroups: dbData.muscle_groups || { ...DEFAULT_MUSCLE_GROUPS },
        workoutTypes: dbData.workout_types || [...DEFAULT_WORKOUT_TYPES],
        exerciseDetails: dbData.exercise_details || {},
        // Not: Şimdilik veritabanında sütun olmadığı için state'e kaydetmiyoruz, 
        // ama tam entegrasyon için bir JSONB sütunu eklenebilir. 
        // Şimdilik default kullanıyoruz veya localStorage ile birleştirilebilir.
        workoutColors: { ...DEFAULT_WORKOUT_COLORS }
    };
};

export function useWorkoutData() {
    const [data, setData] = useState(() => loadFromLocalStorage() || INITIAL_STATE);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
    const saveTimeoutRef = useRef(null);

    // Kullanıcı durumunu izle
    useEffect(() => {
        const checkUser = async () => {
            const currentUser = await auth.getUser();
            setUser(currentUser);
            setLoading(false);
        };
        checkUser();

        const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (event === 'SIGNED_OUT') {
                // Çıkış yapıldığında localStorage'a geri dön
                setSyncStatus('idle');
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    // Kullanıcı giriş yaptığında Supabase'den veri çek
    useEffect(() => {
        const loadFromSupabase = async () => {
            if (!user || !supabase) return;

            try {
                setSyncStatus('syncing');
                const dbData = await workoutDB.getData(user.id);

                if (dbData) {
                    const transformedData = transformSupabaseData(dbData);
                    setData(transformedData);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(transformedData));
                } else {
                    // İlk kez giriş yapıyorsa, mevcut localStorage verisini Supabase'e kaydet
                    const localData = loadFromLocalStorage();
                    if (localData) {
                        await workoutDB.upsertData(user.id, localData);
                    }
                }
                setSyncStatus('synced');
            } catch (error) {
                console.error('Supabase sync error:', error);
                setSyncStatus('error');
            }
        };

        loadFromSupabase();
    }, [user]);

    // Debounced save - hem localStorage hem Supabase'e kaydet
    const saveData = useCallback((newData) => {
        // Hemen localStorage'a kaydet
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

        // Supabase'e debounced kaydet
        if (user && supabase) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            setSyncStatus('syncing');
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    await workoutDB.upsertData(user.id, newData);
                    setSyncStatus('synced');
                } catch (error) {
                    console.error('Save to Supabase failed:', error);
                    setSyncStatus('error');
                }
            }, 1000); // 1 saniye bekle
        }
    }, [user]);

    // State değişikliklerini kaydet
    useEffect(() => {
        if (!loading) {
            saveData(data);
        }
    }, [data, saveData, loading]);

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
        },

        // ===== YENİ: Kas Grubu ve Antrenman Tipi Yönetimi =====

        // Yeni kas grubu ekle
        addMuscleGroup: (id, label, category) => {
            setData(prev => ({
                ...prev,
                muscleGroups: {
                    ...prev.muscleGroups,
                    [id]: { id, label, category }
                }
            }));
        },

        // Kas grubu sil
        removeMuscleGroup: (id) => {
            setData(prev => {
                const newGroups = { ...prev.muscleGroups };
                delete newGroups[id];
                return { ...prev, muscleGroups: newGroups };
            });
        },

        // Yeni antrenman tipi ekle
        addWorkoutType: (name) => {
            setData(prev => ({
                ...prev,
                workoutTypes: [...prev.workoutTypes, name]
            }));
        },

        // Antrenman tipi sil
        removeWorkoutType: (name) => {
            setData(prev => ({
                ...prev,
                workoutTypes: prev.workoutTypes.filter(t => t !== name)
            }));
        },

        // Egzersiz detaylarını güncelle (kas grupları + antrenman tipi)
        updateExerciseDetails: (exerciseIndex, details) => {
            setData(prev => ({
                ...prev,
                exerciseDetails: {
                    ...prev.exerciseDetails,
                    [exerciseIndex]: {
                        ...(prev.exerciseDetails[exerciseIndex] || {}),
                        ...details
                    }
                }
            }));
        },

        // Renk - Antrenman Tipi Eşleşmesini Güncelle
        updateWorkoutColor: (colorKey, newType) => {
            setData(prev => ({
                ...prev,
                workoutColors: {
                    ...prev.workoutColors,
                    [colorKey]: { ...prev.workoutColors[colorKey], type: newType }
                }
            }));
        },

        // Egzersiz Silme (Cascading Delete & Shift)
        deleteExercise: (weekId, index) => {
            if (!window.confirm("Bu egzersizi ve tüm verilerini silmek istediğinize emin misiniz?")) return;

            setData(prev => {
                const updatedWeeks = prev.weeks.map(week => {
                    if (week.id !== weekId) return week;

                    // 1. Arrayden sil
                    const newExercises = week.exercises.filter((_, i) => i !== index);

                    // 2. Row Colors'ı kaydır
                    const newRowColors = {};
                    Object.keys(week.rowColors || {}).forEach(k => {
                        const key = parseInt(k);
                        if (key < index) newRowColors[key] = week.rowColors[key];
                        else if (key > index) newRowColors[key - 1] = week.rowColors[key];
                    });

                    // 3. Grid Data'yı kaydır
                    const newGridData = {};
                    Object.keys(week.gridData || {}).forEach(key => {
                        const parts = key.split('-');
                        // row index her zaman ilk parça
                        const rowIdx = parseInt(parts[0]);
                        // geri kalanı colId olarak birleştir (eğer tire varsa diye)
                        const colId = parts.slice(1).join('-');

                        if (rowIdx < index) newGridData[key] = week.gridData[key];
                        else if (rowIdx > index) newGridData[`${rowIdx - 1}-${colId}`] = week.gridData[key];
                    });

                    return {
                        ...week,
                        exercises: newExercises,
                        rowColors: newRowColors,
                        gridData: newGridData
                    };
                });

                // 4. Global Exercise Details'i kaydır
                // Not: Details global tutulduğu için tüm haftaları etkiler mi? 
                // Şu anki yapıda details index bazlı ve global. Yani 1. haftadaki sıra ile 2. haftaki sıra farklıysa sorun olabilir.
                // Ancak şu anki yapıda egzersiz listesini kopyaladığımız için indexler genelde tutarlı.
                // Yine de en doğrusu details'i haftalara özel tutmaktır ama şimdilik bu yapıyı koruyoruz.
                const newExerciseDetails = {};
                Object.keys(prev.exerciseDetails || {}).forEach(k => {
                    const key = parseInt(k);
                    if (key < index) newExerciseDetails[key] = prev.exerciseDetails[key];
                    else if (key > index) newExerciseDetails[key - 1] = prev.exerciseDetails[key];
                });

                return {
                    ...prev,
                    weeks: updatedWeeks,
                    exerciseDetails: newExerciseDetails
                };
            });
        }
    };

    return {
        data,
        activeWeek,
        actions,
        // Auth related
        user,
        loading,
        syncStatus,
        signOut: auth.signOut
    };
}
