import { useState, useCallback } from 'react';

/**
 * Hook to manage ConfirmDialog state.
 * 
 * Usage:
 *   const { dialog, showConfirm, showAlert, closeDialog } = useDialog();
 *   
 *   showConfirm({
 *     title: 'Emin misiniz?',
 *     message: 'Bu işlem geri alınamaz.',
 *     onConfirm: () => doSomething()
 *   });
 *   
 *   showAlert({ title: 'Başarılı!', message: 'İşlem tamamlandı.', type: 'success' });
 *   
 *   <ConfirmDialog {...dialog} />
 */
export default function useDialog() {
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm',
        confirmText: 'Onayla',
        cancelText: 'İptal',
        onConfirm: null,
        onClose: () => { }
    });

    const closeDialog = useCallback(() => {
        setDialog(prev => ({ ...prev, isOpen: false }));
    }, []);

    const showConfirm = useCallback(({ title, message, type = 'confirm', confirmText = 'Onayla', cancelText = 'İptal', onConfirm }) => {
        setDialog({
            isOpen: true,
            title,
            message,
            type,
            confirmText,
            cancelText,
            onConfirm,
            onClose: closeDialog
        });
    }, [closeDialog]);

    const showAlert = useCallback(({ title, message, type = 'info' }) => {
        setDialog({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'Tamam',
            cancelText: 'İptal',
            onConfirm: null,
            onClose: closeDialog
        });
    }, [closeDialog]);

    return { dialog, showConfirm, showAlert, closeDialog };
}
