import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    differenceInCalendarDays
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Dumbbell, ClipboardList } from 'lucide-react';
import { weeksDB } from '../lib/supabaseClient';

// Helper Component for Day Cell
const DayCell = React.memo(({ day, info, isCurrentMonth, isToday, onClick }) => {
    let dotColor = null;
    if (info.dayData?.type && info.dayData?.color) {
        const colorCode = info.dayData.color;
        if (colorCode && colorCode.startsWith('#')) {
            dotColor = colorCode;
        }
    }

    return (
        <div
            onClick={() => onClick(day, info)}
            className={`
                min-h-[100px] p-2 rounded-xl border transition-all relative group cursor-pointer
                ${isCurrentMonth ? 'border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md' : 'opacity-40 border-transparent'}
                ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                bg-gray-50 dark:bg-slate-800/50
            `}
        >
            <span className={`text-sm font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                {format(day, 'd')}
            </span>

            {info.hasData && info.dayData?.type ? (
                <div className="mt-2">
                    <div
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold shadow-sm w-full truncate"
                        style={{
                            backgroundColor: dotColor ? `${dotColor}20` : undefined,
                            color: dotColor || undefined,
                            border: dotColor ? `1px solid ${dotColor}40` : undefined
                        }}
                    >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                        <span className="truncate">{info.dayData.type}</span>
                    </div>
                </div>
            ) : info.hasData ? (
                <div className="mt-2 flex justify-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full" title="Veri var" />
                </div>
            ) : null}

            {info.weekNumber && isCurrentMonth && (
                <div className="absolute bottom-1 right-2 text-[10px] text-gray-300 dark:text-slate-700">
                    H{info.weekNumber}
                </div>
            )}
        </div>
    );
});

export default function CalendarView({ data, actions, onNavigate }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    // Initial cache from data.weeks if available to avoid first fetch
    const [weeksCache, setWeeksCache] = useState(() => {
        const initialCache = {};
        if (data.weeks && data.weeks.length > 0) {
            data.weeks.forEach(w => {
                initialCache[w.weekNumber] = w;
            });
        }
        return initialCache;
    });
    const [loadingWeeks, setLoadingWeeks] = useState(false);
    const [selectedDateDetails, setSelectedDateDetails] = useState(null);

    // Program Başlangıç Tarihi
    const startDate = data.startDate ? new Date(data.startDate) : new Date();

    // Takvim Grid sınırlarını hesapla (memoized)
    const { monthStart, monthEnd, startDateGrid, endDateGrid, calendarDays } = useMemo(() => {
        const ms = startOfMonth(currentDate);
        const me = endOfMonth(ms);
        const sdg = startOfWeek(ms, { weekStartsOn: 1 });
        const edg = endOfWeek(me, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: sdg, end: edg });
        return { monthStart: ms, monthEnd: me, startDateGrid: sdg, endDateGrid: edg, calendarDays: days };
    }, [currentDate]);

    // Bu ayda görünen hafta numaralarını hesapla
    const visibleWeekNumbers = useMemo(() => {
        const weeks = new Set();
        let current = new Date(startDateGrid);
        while (current <= endDateGrid) {
            const diffDays = differenceInCalendarDays(current, startDate);
            if (diffDays >= 0) {
                const weekNum = Math.floor(diffDays / 7) + 1;
                weeks.add(weekNum);
            }
            current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
        }
        return Array.from(weeks);
    }, [startDateGrid, endDateGrid, startDate]);

    // Ay değiştiğinde o ayın haftalarını yükle
    useEffect(() => {
        const loadMonthWeeks = async () => {
            if (!data.userId) return;

            // Cache check: Sadece undefined olanları (hiç kontrol edilmemiş) bul
            // null veya {empty:true} olanlar zaten kontrol edildi demektir.
            const missingWeeks = visibleWeekNumbers.filter(w => weeksCache[w] === undefined);

            if (missingWeeks.length === 0) return;

            try {
                setLoadingWeeks(true);
                // Eksik haftalar için DB'den tüm haftaları çek (optimization: query only needed weeks later)
                // Şimdilik getAllWeeks güvenli, çünkü cache doldukça bir daha çalışmaz.
                const weeks = await weeksDB.getAllWeeks(data.userId);

                setWeeksCache(prev => {
                    const newCache = { ...prev };

                    // 1. Gelen verileri cache'e işle
                    const foundWeekNumbers = new Set();
                    if (weeks && weeks.length > 0) {
                        weeks.forEach(w => {
                            foundWeekNumbers.add(w.week_number);
                            newCache[w.week_number] = {
                                weekNumber: w.week_number,
                                exercises: w.exercises || [],
                                gridData: w.grid_data || {},
                                days: w.days_config || [],
                                hasData: true
                            };
                        });
                    }

                    // 2. Bulunamayan (DB'de olmayan) haftaları 'empty' olarak işaretle
                    // Böylece tekrar tekrar sormayız.
                    missingWeeks.forEach(wNum => {
                        if (!foundWeekNumbers.has(wNum)) {
                            newCache[wNum] = { hasData: false, empty: true };
                        }
                    });

                    return newCache;
                });

            } catch (err) {
                console.error('Failed to load weeks for calendar:', err);
            } finally {
                setLoadingWeeks(false);
            }
        };

        loadMonthWeeks();
    }, [visibleWeekNumbers, data.userId]); // removed weeksCache dependency to be safe, added missingWeeks logic inside

    // Belirli bir tarihin programdaki hafta numarasını ve verisini bul
    const getWorkoutInfo = (date) => {
        const diffDays = differenceInCalendarDays(date, startDate);
        if (diffDays < 0) return { weekNumber: null, status: 'before_program' };

        const weekNumber = Math.floor(diffDays / 7) + 1;
        const dayIndex = diffDays % 7;

        // Cache'den hafta verisini al
        const weekData = weeksCache[weekNumber];

        let dayData = null;
        let exercises = [];
        let gridData = {};

        // Sadece dolu veri varsa (empty değilse) kullan
        const hasData = weekData && !weekData.empty;

        if (hasData) {
            dayData = weekData.days?.[dayIndex];
            exercises = weekData.exercises || [];
            gridData = weekData.gridData || {};
        }

        return {
            weekNumber,
            dayIndex,
            hasData,
            dayData,
            exercises,
            gridData,
            weekData: hasData ? weekData : null
        };
    };

    // Günlük Logları Çıkar
    const getDayLogs = (info) => {
        if (!info.exercises || !info.gridData) return [];

        const DAY_IDS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return info.exercises.map((exName, rowIndex) => {
            // DB keys use day IDs (Mon, Tue...), not numeric index
            const dayId = DAY_IDS[info.dayIndex];
            // Fallback to index if something is weird, but dayId is primary
            const cellKey = `${rowIndex}-${dayId}`;
            const val = info.gridData[cellKey];
            return { name: exName, value: val };
        }).filter(log => log.value);
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const handleDayClick = useCallback((day, info) => {
        if (!info.weekNumber) return;
        setSelectedDateDetails({
            date: day,
            ...info,
            dayLogs: getDayLogs(info)
        });
    }, []);

    const handleGoToWeek = (weekNumber) => {
        setSelectedDateDetails(null);
        if (onNavigate) {
            onNavigate(weekNumber);
        } else {
            actions.goToWeek(weekNumber);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize flex items-center gap-2">
                    <CalendarIcon className="text-indigo-500" />
                    {format(currentDate, 'MMMM yyyy', { locale: tr })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-4 text-center">
                {weekDays.map(day => (
                    <div key={day} className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Loading State */}
            {loadingWeeks && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-2xl z-10 backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 text-indigo-600 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Güncelleniyor...</span>
                    </div>
                </div>
            )}

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                    const info = getWorkoutInfo(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <DayCell
                            key={day.toISOString()}
                            day={day}
                            info={info}
                            isCurrentMonth={isCurrentMonth}
                            isToday={isToday}
                            onClick={handleDayClick}
                        />
                    );
                })}
            </div>

            {/* Details Modal */}
            {selectedDateDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDateDetails(null)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-800 max-h-[85vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {format(selectedDateDetails.date, 'd MMMM yyyy', { locale: tr })}
                                </h3>
                                {selectedDateDetails.dayData?.type && (
                                    <div
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold mt-2"
                                        style={{
                                            backgroundColor: selectedDateDetails.dayData.color ? `${selectedDateDetails.dayData.color}20` : '#e5e7eb',
                                            color: selectedDateDetails.dayData.color || '#6b7280'
                                        }}
                                    >
                                        <Dumbbell size={12} />
                                        {selectedDateDetails.dayData.type}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedDateDetails(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedDateDetails.dayLogs && selectedDateDetails.dayLogs.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        <ClipboardList size={16} />
                                        <span>Yapılan Egzersizler</span>
                                    </div>
                                    {selectedDateDetails.dayLogs.map((log, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800"
                                        >
                                            <span className="font-medium text-gray-700 dark:text-slate-200">{log.name}</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                                                {log.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : selectedDateDetails.hasData && selectedDateDetails.dayData?.type ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Dumbbell className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                                        <strong>{selectedDateDetails.dayData.type}</strong> antrenmanı planlandı
                                    </p>
                                    <p className="text-sm text-gray-400">Henüz set/tekrar bilgisi girilmemiş.</p>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CalendarIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-400 mb-2">Bu gün için antrenman planı yok.</p>
                                    <p className="text-sm text-gray-400">Hafta {selectedDateDetails.weekNumber || '?'}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                            <button
                                onClick={() => handleGoToWeek(selectedDateDetails.weekNumber)}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <ClipboardList size={18} />
                                Hafta {selectedDateDetails.weekNumber}'e Git
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
