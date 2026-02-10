import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw, Copy, X } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function WeekSelector({
    weeks,
    activeWeekId,
    onSelectWeek,
    onAddWeek,
    onDeleteWeek,
    onResetWeek,
    onCopyWeek,
    startDate
}) {
    const scrollRef = useRef(null);
    const maxWeekId = weeks.length > 0 ? Math.max(...weeks.map(w => w.id)) : 1;

    const [copySource, setCopySource] = useState(null);

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

    const handleWeekClick = (weekId) => {
        if (copySource !== null) {
            if (onCopyWeek) onCopyWeek(copySource, weekId);
            setCopySource(null);
        } else {
            onSelectWeek(weekId);
        }
    };

    const isFirst = activeWeekId <= 1;
    const isLast = activeWeekId >= maxWeekId;
    const canDeleteActive = activeWeekId === maxWeekId && maxWeekId > 1;

    return (
        <div className="flex flex-col gap-0">
            {/* Kopyalama Modu Banner */}
            {copySource !== null && (
                <div
                    className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2.5 mb-2"
                    style={{ animation: 'weekActionSlideIn 0.25s ease-out' }}
                >
                    <div className="flex items-center gap-2">
                        <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                            {copySource}. Hafta kopyalanıyor
                        </span>
                        <span className="text-xs text-indigo-500 dark:text-indigo-400">
                            — Hedef haftayı seçin
                        </span>
                    </div>
                    <button
                        onClick={() => setCopySource(null)}
                        className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Hafta Kartları Satırı */}
            <div className="flex items-center gap-2 pt-4">
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
                        const isCopyTarget = copySource !== null && copySource !== week.id;

                        return (
                            <div key={week.id} className="flex-shrink-0 flex flex-col items-center">
                                <button
                                    onClick={() => handleWeekClick(week.id)}
                                    data-active={isActive}
                                    className={`
                                        relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform border flex flex-col items-center gap-0.5
                                        ${isCopyTarget
                                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 scale-100 ring-2 ring-indigo-400 dark:ring-indigo-500 animate-pulse'
                                            : copySource === week.id
                                                ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 scale-100 shadow-lg'
                                                : isActive
                                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-100 border-gray-900 dark:border-white'
                                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 scale-95'
                                        }
                                    `}
                                >
                                    <span className="font-bold">{week.label}</span>
                                    <span className={`text-[10px] ${isCopyTarget ? 'text-indigo-500 dark:text-indigo-400'
                                            : copySource === week.id ? 'text-indigo-200'
                                                : isActive ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-slate-500'
                                        }`}>
                                        {isCopyTarget ? '📋 Buraya kopyala' : week.dateRange}
                                    </span>
                                </button>

                                {/* Aktif kart altı aksiyon ikonları — yumuşak animasyonlu */}
                                {isActive && copySource === null && (
                                    <div
                                        className="flex items-center gap-0.5 mt-1"
                                        style={{ animation: 'weekActionSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCopySource(week.id); }}
                                            className="p-1.5 rounded-md text-gray-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200"
                                            title="Kopyala"
                                        >
                                            <Copy size={13} strokeWidth={2} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onResetWeek(week.id); }}
                                            className="p-1.5 rounded-md text-gray-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200"
                                            title="Sıfırla"
                                        >
                                            <RotateCcw size={13} strokeWidth={2} />
                                        </button>
                                        {canDeleteActive && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDeleteWeek(week.id); }}
                                                className="p-1.5 rounded-md text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200"
                                                title="Sil"
                                            >
                                                <Trash2 size={13} strokeWidth={2} />
                                            </button>
                                        )}
                                    </div>
                                )}
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

            {/* Animasyon stili */}
            <style>{`
                @keyframes weekActionSlideIn {
                    0% { opacity: 0; transform: translateY(-6px) scale(0.9); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
