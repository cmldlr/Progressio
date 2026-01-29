import React, { useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function WeekSelector({ weeks, activeWeekId, onSelectWeek, onAddWeek, onDeleteWeek }) {
    const scrollRef = useRef(null);

    // Aktif hafta değiştiğinde otomatik kaydır
    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                // Smooth scroll yerine auto scroll, kullanıcı tıkladığında rahatsız etmesin
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeWeekId]);

    const handlePrev = () => {
        if (activeWeekId > 1) {
            onSelectWeek(activeWeekId - 1);
        }
    };

    const handleNext = () => {
        // weeks listesinde son haftanın ID'sini bul
        const maxId = weeks.length > 0 ? Math.max(...weeks.map(w => w.id)) : 1;
        if (activeWeekId < maxId) {
            onSelectWeek(activeWeekId + 1);
        } else {
            // Eğer son haftadaysak ve ileri basılırsa yeni hafta sorulabilir veya sadece disabled olur
            // Şimdilik disabled mantığı UI da
        }
    };

    const isFirst = activeWeekId <= 1;
    const isLast = weeks.length > 0 && activeWeekId >= Math.max(...weeks.map(w => w.id));

    return (
        <div className="flex items-center gap-2 mb-6">
            {/* Prev Button */}
            <button
                onClick={handlePrev}
                disabled={isFirst}
                className={`p-2 rounded-xl border transition-all ${isFirst
                    ? 'border-gray-100 dark:border-slate-800 text-gray-300 dark:text-slate-700 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 shadow-sm'}`}
            >
                <ChevronLeft size={20} />
            </button>

            {/* Scrollable List */}
            <div
                ref={scrollRef}
                className="flex-1 flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide mask-fade px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {weeks.map(week => {
                    const isActive = activeWeekId === week.id;
                    return (
                        <div key={week.id} className="relative group flex-shrink-0">
                            <button
                                onClick={() => onSelectWeek(week.id)}
                                data-active={isActive}
                                className={`
                                    relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform border
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-100 border-indigo-600'
                                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 scale-95'
                                    }
                                `}
                            >
                                {week.label}
                            </button>

                            {/* Delete Button (Visible on Hover & if not only item) */}
                            {weeks.length > 1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteWeek(week.id); }}
                                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 scale-90 hover:scale-100"
                                    title="Haftayı Sil"
                                >
                                    <Trash2 size={10} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={isLast}
                className={`p-2 rounded-xl border transition-all ${isLast
                    ? 'border-gray-100 dark:border-slate-800 text-gray-300 dark:text-slate-700 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 shadow-sm'}`}
            >
                <ChevronRight size={20} />
            </button>

            <div className="w-px h-8 bg-gray-200 dark:bg-slate-800 mx-1"></div>

            {/* Add Button (Fixed Right) */}
            <button
                onClick={onAddWeek}
                className="flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-200 dark:border-indigo-800 p-2.5 rounded-xl transition-all hover:scale-105 shadow-sm"
                title="Yeni Hafta Ekle"
            >
                <Plus size={20} strokeWidth={2.5} />
            </button>
        </div>
    );
}

