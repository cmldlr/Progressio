import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Auth helper functions
export const auth = {
    // Kayıt ol
    signUp: async (credentials) => {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase.auth.signUp(credentials);
        if (error) throw error;
        return data;
    },

    // Giriş yap
    signInWithPassword: async (credentials) => {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
        return data;
    },

    // Çıkış yap
    signOut: async () => {
        if (!supabase) throw new Error('Supabase not configured');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Mevcut kullanıcıyı al
    getUser: async () => {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Auth state değişikliklerini dinle
    onAuthStateChange: (callback) => {
        if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } };
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Workout data CRUD operations
// Workout data CRUD operations (Global Settings)
export const workoutDB = {
    // Kullanıcı verisini al (Ayarlar + Start Date)
    getSettings: async (userId) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('workout_data')
            .select('muscle_groups, workout_types, exercise_details, workout_colors, active_week_id, updated_at') // Hafifletilmiş sorgu
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Ayarları güncelle
    upsertSettings: async (userId, settings) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('workout_data')
            .upsert({
                user_id: userId,
                muscle_groups: settings.muscleGroups,
                workout_types: settings.workoutTypes,
                exercise_details: settings.exerciseDetails,
                workout_colors: settings.workoutColors,
                // active_week_id'yi artık weeks tablosundan veya local state'ten yönetebiliriz ama burada tutmak da "son kalınan yer" için iyi.
                active_week_id: settings.activeWeekId,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// Weeks Table Operations (New Scalable Architecture)
export const weeksDB = {
    // Belirli bir haftayı getir (Hafta Numarasına göre)
    getWeek: async (userId, weekNumber) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('weeks')
            .select('*')
            .eq('user_id', userId)
            .eq('week_number', weekNumber)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Haftayı kaydet/güncelle
    upsertWeek: async (userId, weekData) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('weeks')
            .upsert({
                user_id: userId,
                week_number: weekData.weekNumber,
                start_date: weekData.startDate, // Opsiyonel, o haftanın spesifik başlangıcı
                exercises: weekData.exercises,
                grid_data: weekData.gridData,
                days_config: weekData.daysConfig, // Günlerin etiketleri/renkleri
                // created_at otomatik
            }, {
                onConflict: 'user_id, week_number'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Takvim için özet verileri çek (Sadece var olan haftaların numaralarını ve tarihlerini)
    getWeeksMeta: async (userId) => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('weeks')
            .select('week_number, start_date, days_config') // Grid data çekme, hafif olsun
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    }
};

// Measurements Table Operations (Progress Tracking)
export const measurementsDB = {
    // Tüm ölçümleri getir (Tarihe göre yeni -> eski)
    getAll: async (userId) => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('measurements')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Yeni ölçüm ekle
    add: async (userId, measurementData) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('measurements')
            .insert([{
                user_id: userId,
                ...measurementData
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Ölçüm sil
    delete: async (id) => {
        if (!supabase) return;
        const { error } = await supabase
            .from('measurements')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
