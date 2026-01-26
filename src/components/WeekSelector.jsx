import React from 'react';

export default function WeekSelector({ weeks, activeWeekId, onSelectWeek, onAddWeek, onDeleteWeek }) {
    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-4 border-b border-gray-200 dark:border-slate-800">
            {weeks.map(week => (
                <div key={week.id} className="relative group flex items-center">
                    <button
                        onClick={() => onSelectWeek(week.id)}
                        className={`
                            px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors
                            ${activeWeekId === week.id
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-x border-t border-gray-200 dark:border-slate-700 -mb-px relative z-10'
                                : 'bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'}
                        `}
                    >
                        {week.label}
                    </button>
                    {/* Delete button - always show on hover */}
                    {weeks.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteWeek(week.id); }}
                            className="ml-1 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                            title="Haftayı Sil"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
            <button
                onClick={onAddWeek}
                className="px-3 py-1 ml-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
            >
                + Hafta Ekle
            </button>
        </div>
    );
}

