import { useState, useEffect, useCallback } from 'react';
import { supabase, auth, measurementsDB } from '../lib/supabaseClient';

export function useMeasurements() {
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load Data
    const loadMeasurements = useCallback(async () => {
        try {
            setLoading(true);
            const user = (await auth.getUser());
            if (!user) return;

            const data = await measurementsDB.getAll(user.id);
            setMeasurements(data || []);
            setError(null);
        } catch (err) {
            console.error('Error loading measurements:', err);
            setError('Ölçümler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        loadMeasurements();
    }, [loadMeasurements]);

    // Add Measurement
    const addMeasurement = async (data) => {
        try {
            setError(null);
            const user = (await auth.getUser());
            if (!user) throw new Error("Kullanıcı bulunamadı");

            const newMeasurement = await measurementsDB.add(user.id, data);

            // Optimistic update or reload
            setMeasurements(prev => [newMeasurement, ...prev]);
            return newMeasurement;
        } catch (err) {
            console.error('Error adding measurement:', err);
            setError('Ölçüm kaydedilemedi.');
            throw err;
        }
    };

    // Delete Measurement
    const deleteMeasurement = async (id) => {
        if (!window.confirm("Bu ölçüm kaydını silmek istediğinize emin misiniz?")) return;

        try {
            await measurementsDB.delete(id);
            setMeasurements(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error('Error deleting measurement:', err);
            setError('Silme işlemi başarısız.');
        }
    };

    return {
        measurements,
        loading,
        error,
        addMeasurement,
        deleteMeasurement,
        refresh: loadMeasurements
    };
}
