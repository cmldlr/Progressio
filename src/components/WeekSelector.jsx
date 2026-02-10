import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw, Copy, X, MoreHorizontal } from 'lucide-react';
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
    const menuRef = useRef(null);
    const maxWeekId = weeks.length > 0 ? Math.max(...weeks.map(w => w.id)) : 1;

    // Kopyalama modu state
    const [copySource, setCopySource] = useState(null);
    // Dropdown menü state
    const [menuOpenWeekId, setMenuOpenWeekId] = useState(null);

    // Dışarı tıklanınca menüyü kapat
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpenWeekId(null);
            }
        };
        if (menuOpenWeekId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [menuOpenWeekId]);

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

    const handleMenuAction = (action, weekId) => {
        setMenuOpenWeekId(null);
        switch (action) {
            case 'copy':
                setCopySource(weekId);
                break;
            case 'reset':
                onResetWeek(weekId);
                break;
            case 'delete':
                onDeleteWeek(weekId);
                break;
        }
    };

    const isFirst = activeWeekId <= 1;
    const isLast = activeWeekId >= maxWeekId;

    return (
        <div className="flex flex-col gap-2">
            {/* Kopyalama Modu Banner */}
            {copySource !== null && (
                <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2.5 animate-in fade-in">
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
                        const isLastWeek = week.id === maxWeekId;
                        const canDelete = isLastWeek && maxWeekId > 1;
                        const isCopyTarget = copySource !== null && copySource !== week.id;
                        const isMenuOpen = menuOpenWeekId === week.id;

                        return (
                            <div key={week.id} className="relative flex-shrink-0">
                                {/* Hafta Kart Butonu */}
                                <div className="flex items-center gap-0">
                                    <button
                                        onClick={() => handleWeekClick(week.id)}
                                        data-active={isActive}
                                        className={`
                                            relative px-4 py-2 font-medium text-sm transition-all duration-300 transform border flex flex-col items-center gap-0.5
                                            ${isActive && copySource === null
                                                ? 'rounded-l-xl rounded-r-none border-r-0'
                                                : 'rounded-xl'
                                            }
                                            ${isCopyTarget
                                                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 scale-100 ring-2 ring-indigo-400 dark:ring-indigo-500 animate-pulse'
                                                : copySource === week.id
                                                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 scale-100 shadow-lg rounded-xl'
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

                                    {/* ⋯ Menü butonu — sadece aktif hafta + kopyalama modu değilse */}
                                    {isActive && copySource === null && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenWeekId(isMenuOpen ? null : week.id);
                                            }}
                                            className="h-full px-2 py-2 bg-gray-900 dark:bg-white text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 border border-l-0 border-gray-900 dark:border-white rounded-r-xl transition-colors"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown Menü */}
                                {isMenuOpen && (
                                    <div
                                        ref={menuRef}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200"
                                    >
                                        {/* Kopyala */}
                                        <button
                                            onClick={() => handleMenuAction('copy', week.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                        >
                                            <Copy size={16} className="text-indigo-500" />
                                            <span className="font-medium">Kopyala</span>
                                        </button>

                                        {/* Sıfırla */}
                                        <button
                                            onClick={() => handleMenuAction('reset', week.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 dark:hover:text-amber-300 transition-colors border-t border-gray-100 dark:border-slate-700"
                                        >
                                            <RotateCcw size={16} className="text-amber-500" />
                                            <span className="font-medium">Sıfırla</span>
                                        </button>

                                        {/* Sil — sadece son hafta */}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleMenuAction('delete', week.id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors border-t border-gray-100 dark:border-slate-700"
                                            >
                                                <Trash2 size={16} />
                                                <span className="font-medium">Sil</span>
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
        </div>
    );
}
