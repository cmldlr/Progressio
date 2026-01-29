import React, { useState } from 'react';
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
    addDays,
    differenceInCalendarDays
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarView({ data, actions }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // 1. Program Başlangıç Tarihi (Yoksa bugün kabul et)
    const startDate = data.startDate ? new Date(data.startDate) : new Date();

    // 2. Takvim Grid'ini Oluştur
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 }); // Pazartesi başlar
    const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDateGrid,
        end: endDateGrid
    });

    // 3. Helper: Belirli bir tarihin programdaki hafta numarasını ve verisini bul
    const getWorkoutInfo = (date) => {
        const diffDays = differenceInCalendarDays(date, startDate);
        if (diffDays < 0) return { weekNumber: null, status: 'future' }; // Programdan önceki tarih

        const weekNumber = Math.floor(diffDays / 7) + 1;

        // Bu hafta sistemde var mı? (Metadata kontrolü)
        // Dashboard'dan gelen data.weeksList veya data.weeks içinde ara
        // Not: data.weeks sadece aktif haftayı içeriyor olabilir, o yüzden weeksList (meta) daha güvenli
        const hasWeekData = data.weeksList?.some(w => w.id === weekNumber) || false;

        // Detaylı veri (Sadece o an bellekte yüklü olan aktif hafta için detay gösterebiliriz)
        // Diğer haftalar için sadece "Var" işareti veya "Git" butonu koyacağız.
        const activeWeek = data.weeks.find(w => w.weekNumber === weekNumber);

        let dayData = null;
        if (activeWeek) {
            const dayIndex = diffDays % 7;
            dayData = activeWeek.days?.[dayIndex];
        }

        return {
            weekNumber,
            dayIndex: diffDays % 7,
            hasData: hasWeekData, // DB'de kayıtlı mı?
            isActiveWeek: !!activeWeek, // Şu an ekranda açık mı?
            dayData: dayData // Varsa antrenman detayı
        };
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const [selectedDateDetails, setSelectedDateDetails] = useState(null);

    const handleDayClick = (day, info) => {
        if (!info.weekNumber) return;

        // Eğer o hafta zaten aktifse ve detay varsa modal aç
        if (info.isActiveWeek && info.dayData) {
            setSelectedDateDetails({
                date: day,
                ...info
            });
        } else {
            // Değilse, o haftaya gitmek ister misin?
            if (window.confirm(`${format(day, 'd MMMM yyyy', { locale: tr })} tarihine gitmek (Hafta ${info.weekNumber}) ve veri girmek istiyor musunuz?`)) {
                actions.goToWeek(info.weekNumber);
                // View modunu değiştirmek için dashboard switch yapmalı, ama action sadece data değiştiriyor.
                // Dashboard'da onSelectDate prop'u varsa onu tetikleyelim.
                if (actions.onSelectDate) {
                    actions.onSelectDate(day);
                } else {
                    // Fallback: Dashboard'un weekly moda geçmesi lazım.
                    // Bunu dashboard componentinde handle etmeliyiz.
                    // Şimdilik sadece goToWeek çağırıyoruz. kullanıcının manuel geçmesi gerekebilir.
                }
            }
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

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                    const info = getWorkoutInfo(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    // Renk Logic
                    let bgColorClass = 'bg-gray-50 dark:bg-slate-800/50';
                    let textColorClass = 'text-gray-700 dark:text-gray-300';
                    let dotColor = null;

                    if (info.dayData?.type) {
                        const colorCode = info.dayData.color;
                        if (colorCode && colorCode.startsWith('#')) {
                            dotColor = colorCode;
                        }
                    }

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => handleDayClick(day, info)}
                            className={`
                                min-h-[100px] p-2 rounded-xl border transition-all relative group cursor-pointer
                                ${isCurrentMonth ? 'border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md' : 'opacity-40 border-transparent'}
                                ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                                ${bgColorClass}
                            `}
                        >
                            {/* Date Number */}
                            <span className={`text-sm font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : textColorClass}`}>
                                {format(day, 'd')}
                            </span>

                            {/* Content */}
                            {info.isActiveWeek && info.dayData?.type ? (
                                // Aktif hafta ve veri var -> Detay Göster
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
                                // Veri var ama bellekte yüklü değil -> Nokta Göster
                                <div className="mt-2 flex justify-center">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full" title="Veri var (Tıkla ve Git)" />
                                </div>
                            ) : (
                                // Veri yok
                                null
                            )}

                            {/* Week Helper */}
                            {info.weekNumber && isCurrentMonth && (
                                <div className="absolute bottom-1 right-2 text-[10px] text-gray-300 dark:text-slate-700">
                                    H{info.weekNumber}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Details Modal */}
            {selectedDateDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDateDetails(null)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-slate-800 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b pb-4 mb-4">
                            {format(selectedDateDetails.date, 'd MMMM yyyy', { locale: tr })}
                        </h3>
                        {/* Details Content */}
                        {selectedDateDetails.dayData?.type ? (
                            <div className="space-y-3">
                                {(() => {
                                    // Aktif haftanın verisi zaten 'selectedDateDetails' içinde var (dayData)
                                    // Ama egzersiz listesi ve gridData lazım.
                                    // isActiveWeek=true ise activeWeek bellekte var demektir.
                                    // data.weeks içinden bulalım.
                                    const activeWeek = data.weeks.find(w => w.weekNumber === selectedDateDetails.weekNumber);

                                    if (!activeWeek) {
                                        return (
                                            <div className="text-center py-6">
                                                <p className="text-gray-500 mb-4">Bu haftanın verisi henüz yüklenmedi.</p>
                                                <button
                                                    onClick={() => props.onNavigate && props.onNavigate(selectedDateDetails.weekNumber)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                                >
                                                    Haftayı Görüntüle / Düzenle
                                                </button>
                                            </div>
                                        );
                                    }

                                    const exercises = activeWeek.exercises || [];
                                    const gridData = activeWeek.gridData || {};
                                    const dayIndex = selectedDateDetails.dayIndex; // getWorkoutInfo'da hesaplamıştık

                                    // Günlük Logları Çıkar
                                    const dayLogs = exercises.map((exName, rowIndex) => {
                                        const cellKey = `${rowIndex}-${dayIndex}`;
                                        const val = gridData[cellKey];
                                        return { name: exName, value: val };
                                    }).filter(log => log.value);

                                    if (dayLogs.length === 0) {
                                        return (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 italic mb-4">Girilmiş antrenman verisi yok.</p>
                                                <button
                                                    onClick={() => props.onNavigate && props.onNavigate(selectedDateDetails.weekNumber)}
                                                    className="text-sm text-indigo-600 hover:underline"
                                                >
                                                    Veri Girmek İçin Git &rarr;
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            {dayLogs.map((log, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                                                    <span className="font-medium text-gray-700 dark:text-slate-200">{log.name}</span>
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.value}</span>
                                                </div>
                                            ))}
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={() => props.onNavigate && props.onNavigate(selectedDateDetails.weekNumber)}
                                                    className="text-xs text-gray-400 hover:text-indigo-500 transition-colors"
                                                >
                                                    Detaylı Düzenle
                                                </button>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">Bugün için planlanmış bir antrenman yok.</p>
                                <button
                                    onClick={() => props.onNavigate && props.onNavigate(selectedDateDetails.weekNumber)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-lg hover:bg-gray-200"
                                >
                                    Plan Ekle
                                </button>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 mr-4" onClick={() => setSelectedDateDetails(null)}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
