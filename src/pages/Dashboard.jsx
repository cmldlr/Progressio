import React, { useState, useEffect } from 'react';
import CalendarView from '../components/CalendarView';
import WeeklyGrid from '../components/WeeklyGrid';
import WeekSelector from '../components/WeekSelector';
import SettingsPanel from '../components/SettingsPanel';
import MeasurementsModal from '../components/MeasurementsModal';
import ProgressCharts from '../components/ProgressCharts';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { useMeasurements } from '../hooks/useMeasurements';
import { LogOut, Settings, Upload, Download, RefreshCw, Menu, Calendar, Clock, Filter, Moon, Sun, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { data, activeWeek, actions, user, loading, syncStatus, syncError, signOut } = useWorkoutData();
    const { measurements, addMeasurement, updateMeasurement, deleteMeasurement, loading: measurementsLoading } = useMeasurements();

    const [showSettings, setShowSettings] = useState(false);
    const [showMeasurements, setShowMeasurements] = useState(false);
    const [editingMeasurement, setEditingMeasurement] = useState(null);

    const handleEditMeasurement = (m) => {
        setEditingMeasurement(m);
        setShowMeasurements(true);
    };

    const handleSaveMeasurement = async (data) => {
        if (editingMeasurement) {
            await updateMeasurement(editingMeasurement.id, data);
        } else {
            await addMeasurement(data);
        }
    };

    // viewMode'u localStorage'dan oku, yoksa 'weekly' kullan
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('viewMode') || 'weekly';
        }
        return 'weekly';
    });

    // viewMode değiştiğinde localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('viewMode', viewMode);
    }, [viewMode]);

    // Anlık Tarih/Saat State'i
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Akıllı Filtreleme (Bugüne Odaklan)
    const [focusMode, setFocusMode] = useState(false);

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    // Dark Mode Effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Pull-to-refresh prevention
    useEffect(() => {
        let touchStartY = 0;
        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };
        const handleTouchMove = (e) => {
            const touchY = e.touches[0].clientY;
            const touchDiff = touchY - touchStartY;
            if (window.scrollY === 0 && touchDiff > 0) {
                if (e.cancelable) e.preventDefault();
            }
        };
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    // Saati her dakika güncelle
    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 30000); // 30s güncelleme
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
    const formattedTime = currentDateTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const handleExport = () => {
        const dataStr = JSON.stringify(data);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'progressio_v2_backup.json';

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try {
                const parsed = JSON.parse(e.target.result);
                // Basit bir kontrol
                if (parsed.muscleGroups || parsed.weeks) {
                    actions.importData(parsed);
                    alert("Yedek başarıyla yüklendi!");
                } else {
                    alert("Geçersiz yedek dosyası.");
                }
            } catch (err) {
                alert("Dosya okunamadı.");
            }
        };
    };

    const SyncIndicator = () => {
        const statusConfig = {
            idle: { icon: 'check-circle', color: 'text-gray-400', label: 'Hazır' },
            syncing: { icon: 'refresh-ccw', color: 'text-blue-500 animate-spin', label: 'Senkronize...' },
            synced: { icon: 'check-circle', color: 'text-green-500', label: 'Senkronize' },
            error: { icon: 'alert-circle', color: 'text-red-500', label: syncError || 'Hata' }
        };
        const status = statusConfig[syncStatus] || statusConfig.idle;

        return (
            <div
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 bg-opacity-70 dark:bg-slate-800 dark:bg-opacity-50 rounded-full border border-gray-200 dark:border-slate-700 cursor-help transition-all"
                title={syncError || "Senkronizasyon Durumu"}
                onClick={() => syncStatus === 'error' && alert(syncError)}
            >
                <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' :
                    syncStatus === 'syncing' ? 'bg-blue-500' :
                        syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    } `} />
                <span className={`text-xs font-medium hidden sm:inline ${syncStatus === 'error' ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    {status.label.length > 20 ? status.label.substring(0, 17) + '...' : status.label}
                </span>
            </div>
        );
    };

    if (loading) return null; // Or a skeleton loader

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 transition-colors duration-300">
            {/* Dashboard Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                    {/* LEFT: Logo & Sync */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-500/30 shadow-lg">P</div>
                            <span className="font-bold text-gray-900 dark:text-white hidden md:block text-lg tracking-tight">Progressio</span>
                        </div>
                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden md:block" />

                        {/* Sync Indicator - Visible on Mobile now */}
                        <div className="flex md:block">
                            <SyncIndicator />
                        </div>
                    </div>

                    {/* CENTER: Date & Time & Focus Toggle & Theme Toggle */}
                    <div className="hidden lg:flex items-center gap-4 bg-gray-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-gray-100 dark:border-slate-700/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            {formattedDate}
                        </div>
                        <div className="w-px h-4 bg-gray-300 dark:bg-slate-600" />
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm font-medium">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            {formattedTime}
                        </div>
                        <div className="w-px h-4 bg-gray-300 dark:bg-slate-600" />

                        {/* Focus Mode Toggle */}
                        <button
                            onClick={() => setFocusMode(!focusMode)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${focusMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                            title="Sadece bugünün antrenmanlarını göster"
                        >
                            <Filter className="w-3 h-3" />
                            {focusMode ? 'GÜN ODAKLI' : 'TÜM HAFTA'}
                        </button>
                    </div>

                    {/* RIGHT: Tools & Profile */}
                    <div className="flex items-center gap-2">
                        {/* Toggle Theme Button (Mobile & Desktop) */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            title={darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Mobile Focus Toggle (visible only on small screens) */}
                        <button
                            onClick={() => setFocusMode(!focusMode)}
                            className={`lg:hidden p-2 rounded-lg transition ${focusMode ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}
                        >
                            <Filter className="w-5 h-5" />
                        </button>

                        {/* Tools Menu */}
                        <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4 border-l border-gray-200 dark:border-slate-700 pl-2 ml-2">
                            {/* Ölçüm Ekle Butonu */}
                            <button
                                onClick={() => setShowMeasurements(true)}
                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                                title="Ölçüm Ekle"
                            >
                                <Activity className="w-5 h-5" />
                            </button>

                            <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition" title="Ayarlar">
                                <Settings className="w-5 h-5" />
                            </button>
                            <button onClick={handleExport} className="hidden md:block p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition" title="Yedek İndir">
                                <Download className="w-5 h-5" />
                            </button>
                            <label className="hidden md:block p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer" title="Yedek Yükle">
                                <Upload className="w-5 h-5" />
                                <input type="file" onChange={handleImport} className="hidden" accept=".json" />
                            </label>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium shadow-md shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-transform" title={user?.email}>
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <button onClick={signOut} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition ml-1" title="Çıkış Yap">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* View Toggle */}
            <div className="container mx-auto px-4 mt-6">
                <div className="flex p-1 bg-gray-200 dark:bg-slate-800 rounded-xl w-fit">
                    <button
                        onClick={() => setViewMode('weekly')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'weekly'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Haftalık Program
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Takvim
                    </button>
                    <button
                        onClick={() => setViewMode('progress')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'progress'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <TrendingUp size={16} />
                        İlerleme
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {viewMode === 'weekly' && (
                    <>
                        <div className="mb-8 overflow-visible">
                            <WeekSelector
                                weeks={data.weeksList || []}
                                activeWeekId={data.activeWeekId}
                                onSelectWeek={actions.goToWeek}
                                onAddWeek={actions.addWeek}
                                onDeleteWeek={actions.deleteWeek}
                                onResetWeek={actions.resetWeek}
                                startDate={data.startDate}
                            />
                        </div>

                        <WeeklyGrid
                            activeWeek={activeWeek}
                            onCellChange={actions.updateGridData}
                            onAddExercise={actions.updateExercises}
                            onUpdateExercises={actions.updateExercises}
                            onUpdateRowColor={actions.updateRowColor}
                            onUpdateDay={actions.updateDay}
                            onUpdateGroup={actions.updateExerciseGroup}
                            onClearData={() => { }}
                            muscleGroups={data.muscleGroups}
                            workoutTypes={data.workoutTypes}
                            exerciseDetails={data.exerciseDetails}
                            onUpdateExerciseDetails={actions.updateExerciseDetails}
                            workoutColors={data.workoutColors}
                            focusMode={focusMode}
                            onDeleteExercise={actions.deleteExercise}
                        />
                    </>
                )}

                {viewMode === 'calendar' && (
                    <CalendarView
                        data={data}
                        actions={actions}
                        onNavigate={(weekNum) => {
                            actions.goToWeek(weekNum);
                            setViewMode('weekly');
                        }}
                    />
                )}

                {viewMode === 'progress' && (
                    <ProgressCharts measurements={measurements} onEdit={handleEditMeasurement} onDelete={deleteMeasurement} />
                )}
            </main>

            {/* Modals */}
            <SettingsPanel
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                muscleGroups={data.muscleGroups}
                workoutTypes={data.workoutTypes}
                workoutColors={data.workoutColors}
                startDate={data.startDate} // Program Başlangıç Tarihi
                onAddMuscleGroup={actions.addMuscleGroup}
                onRemoveMuscleGroup={actions.removeMuscleGroup}
                onAddWorkoutType={actions.addWorkoutType}
                onRemoveWorkoutType={actions.removeWorkoutType}
                onUpdateWorkoutColor={actions.updateWorkoutColor}
                onUpdateStartDate={actions.setStartDate} // Tarih güncelleme aksiyonu
            />

            <MeasurementsModal
                isOpen={showMeasurements}
                onClose={() => { setShowMeasurements(false); setEditingMeasurement(null); }}
                onSave={handleSaveMeasurement}
                initialData={editingMeasurement}
            />
        </div>
    );
}
