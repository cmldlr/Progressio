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
export const workoutDB = {
    // Kullanıcı verisini al
    getData: async (userId) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('workout_data')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
    },

    // Veri oluştur veya güncelle
    upsertData: async (userId, workoutData) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('workout_data')
            .upsert({
                user_id: userId,
                weeks: workoutData.weeks,
                active_week_id: workoutData.activeWeekId,
                muscle_groups: workoutData.muscleGroups,
                workout_types: workoutData.workoutTypes,
                exercise_details: workoutData.exerciseDetails,
                workout_colors: workoutData.workoutColors,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Realtime subscription
    subscribe: (userId, callback) => {
        if (!supabase) return { unsubscribe: () => { } };
        return supabase
            .channel(`workout_${userId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'workout_data', filter: `user_id=eq.${userId}` },
                callback
            )
            .subscribe();
    }
};
