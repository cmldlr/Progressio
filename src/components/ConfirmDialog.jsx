import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

/**
 * Reusable React confirmation/alert dialog.
 * 
 * Props:
 *   isOpen       : boolean
 *   onClose      : () => void
 *   onConfirm    : () => void   (optional — if missing, shows only "Tamam" button)
 *   title        : string
 *   message      : string
 *   type         : 'confirm' | 'success' | 'error' | 'info'  (default: 'confirm')
 *   confirmText  : string (default: 'Onayla')
 *   cancelText   : string (default: 'İptal')
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Onay',
    message = '',
    type = 'confirm',
    confirmText = 'Onayla',
    cancelText = 'İptal'
}) {
    if (!isOpen) return null;

    const iconMap = {
        confirm: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        success: <CheckCircle className="w-8 h-8 text-emerald-500" />,
        error: <XCircle className="w-8 h-8 text-red-500" />,
        info: <Info className="w-8 h-8 text-blue-500" />,
    };

    const confirmButtonStyles = {
        confirm: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white',
        success: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
        error: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
        info: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white',
    };

    const isAlertOnly = !onConfirm;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-4 p-3 rounded-full bg-gray-50 dark:bg-slate-800">
                        {iconMap[type] || iconMap.confirm}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {/* Buttons */}
                <div className="px-6 pb-6 flex gap-3">
                    {isAlertOnly ? (
                        <button
                            onClick={onClose}
                            className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${confirmButtonStyles[type] || confirmButtonStyles.info}`}
                        >
                            Tamam
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-sm font-bold rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 active:bg-gray-300 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${confirmButtonStyles[type]}`}
                            >
                                {confirmText}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
