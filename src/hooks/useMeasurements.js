import { useState, useEffect, useCallback } from 'react';
import { auth, measurementsDB } from '../lib/supabaseClient';

export function useMeasurements(dialogCallbacks = {}) {
    const { showConfirm: _showConfirm } = dialogCallbacks;
    const confirmAction = (title, message, onConfirm) => {
        if (_showConfirm) _showConfirm({ title, message, type: 'confirm', onConfirm });
        else if (window.confirm(message)) onConfirm();
    };

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
            setMeasurements(prev => [newMeasurement, ...prev]);
            return newMeasurement;
        } catch (err) {
            console.error('Error adding measurement:', err);
            setError('Ölçüm kaydedilemedi.');
            throw err;
        }
    };

    // Update Measurement
    const updateMeasurement = async (id, data) => {
        try {
            setError(null);
            const updatedMeasurement = await measurementsDB.update(id, data);
            setMeasurements(prev => prev.map(m => m.id === id ? updatedMeasurement : m));
            return updatedMeasurement;
        } catch (err) {
            console.error('Error updating measurement:', err);
            setError('Güncelleme başarısız.');
            throw err;
        }
    };

    // Delete Measurement
    const deleteMeasurement = (id) => {
        confirmAction(
            'Ölçümü Sil',
            'Bu ölçüm kaydını silmek istediğinize emin misiniz?',
            async () => {
                try {
                    await measurementsDB.delete(id);
                    setMeasurements(prev => prev.filter(m => m.id !== id));
                } catch (err) {
                    console.error('Error deleting measurement:', err);
                    setError('Silme işlemi başarısız.');
                }
            }
        );
    };

    return {
        measurements,
        loading,
        error,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,
        refresh: loadMeasurements
    };
}
