import React, { useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function WeekSelector({
    weeks,
    activeWeekId,
    onSelectWeek,
    onAddWeek,
    onDeleteWeek,
    onResetWeek,
    startDate
}) {
    const scrollRef = useRef(null);
    const maxWeekId = weeks.length > 0 ? Math.max(...weeks.map(w => w.id)) : 1;

    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeWeekId]);

    const weeksWithDates = useMemo(() => {
        const globalStart = startDate ? new Date(startDate) : new Date();
        return weeks.map(week => {
            const weekStart = addDays(globalStart, (week.id - 1) * 7);
            const weekEnd = addDays(weekStart, 6);
            return {
                ...week,
                dateRange: `${format(weekStart, 'd MMM', { locale: tr })} - ${format(weekEnd, 'd MMM', { locale: tr })}`
            };
        });
    }, [weeks, startDate]);

    const handlePrev = () => {
        if (activeWeekId > 1) onSelectWeek(activeWeekId - 1);
    };

    const handleNext = () => {
        if (activeWeekId < maxWeekId) onSelectWeek(activeWeekId + 1);
    };

    const isFirst = activeWeekId <= 1;
    const isLast = activeWeekId >= maxWeekId;

    return (
        <div className="flex items-center gap-2 mb-6 pt-4">
            <button
                onClick={handlePrev}
                disabled={isFirst}
                className={`p-2 rounded-xl border transition-all ${isFirst
                    ? 'border-gray-200 dark:border-slate-800 text-gray-300 dark:text-slate-700 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white shadow-sm'}`}
            >
                <ChevronLeft size={20} />
            </button>

            <div
                ref={scrollRef}
                className="flex-1 flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide mask-fade px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {weeksWithDates.map(week => {
                    const isActive = activeWeekId === week.id;
                    const isLastWeek = week.id === maxWeekId;
                    const canDelete = isLastWeek && maxWeekId > 1;

                    return (
                        <div key={week.id} className="relative group flex-shrink-0">
                            <button
                                onClick={() => onSelectWeek(week.id)}
                                data-active={isActive}
                                className={`
                                    relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform border flex flex-col items-center gap-0.5
                                    ${isActive
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-100 border-gray-900 dark:border-white'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 scale-95'
                                    }
                                `}
                            >
                                <span className="font-bold">{week.label}</span>
                                <span className={`text-[10px] ${isActive ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-slate-500'}`}>
                                    {week.dateRange}
                                </span>
                            </button>

                            {/* Hover'da görünen butonlar - sağ tarafta */}
                            <div className="absolute top-1/2 -translate-y-1/2 -right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                {/* Sıfırla butonu */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onResetWeek(week.id); }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    title="İçeriği Sıfırla"
                                >
                                    <RotateCcw size={12} />
                                </button>

                                {/* Sil butonu - sadece son haftada */}
                                {canDelete && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteWeek(week.id); }}
                                        className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                        title="Haftayı Sil"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleNext}
                disabled={isLast}
                className={`p-2 rounded-xl border transition-all ${isLast
                    ? 'border-gray-200 dark:border-slate-800 text-gray-300 dark:text-slate-700 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white shadow-sm'}`}
            >
                <ChevronRight size={20} />
            </button>

            <div className="w-px h-8 bg-gray-200 dark:bg-slate-800 mx-1"></div>

            <button
                onClick={onAddWeek}
                className="flex-shrink-0 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border border-dashed border-gray-300 dark:border-slate-600 p-2.5 rounded-xl transition-all hover:scale-105 shadow-sm"
                title="Yeni Hafta Ekle"
            >
                <Plus size={20} strokeWidth={2.5} />
            </button>
        </div>
    );
}
