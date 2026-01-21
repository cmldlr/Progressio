import React from 'react';

export default function WeekSelector({ weeks, activeWeekId, onSelectWeek, onAddWeek, onDeleteWeek }) {
    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-4 border-b border-gray-200">
            {weeks.map(week => (
                <div key={week.id} className="relative group flex items-center">
                    <button
                        onClick={() => onSelectWeek(week.id)}
                        className={`
                            px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors
                            ${activeWeekId === week.id
                                ? 'bg-white text-indigo-600 border-x border-t border-gray-200 -mb-px relative z-10'
                                : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
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
                className="px-3 py-1 ml-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
            >
                + Hafta Ekle
            </button>
        </div>
    );
}

