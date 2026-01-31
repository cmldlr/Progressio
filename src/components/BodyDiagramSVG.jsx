import React, { useState, useCallback, useMemo } from 'react';
import Model from 'react-body-highlighter';

// Kütüphane kas isimleri -> Uygulama kas ID'leri
const MUSCLE_ID_MAP = {
    // Ön görünüm kasları
    'chest': ['upper_chest', 'mid_chest', 'lower_chest'], // Göğse tıklayınca 3 kas birden
    'abs': 'abs',
    'obliques': 'obliques',
    'front-deltoids': 'front_delt',
    'biceps': 'biceps',
    'forearm': 'forearm',
    'quadriceps': 'quads',
    'adductors': 'inner_thigh',
    'calves': 'calves',

    // Arka görünüm kasları
    'trapezius': 'traps',
    'back-deltoids': 'rear_delt',
    'upper-back': 'rhomboids',
    'lower-back': 'lower_back',
    'triceps': 'triceps',
    'gluteal': 'glutes',
    'hamstring': 'hamstrings',
};

// Uygulama kas ID'leri -> Kütüphane kas isimleri (ters mapping)
const REVERSE_MUSCLE_MAP = Object.fromEntries(
    Object.entries(MUSCLE_ID_MAP).map(([lib, app]) => [app, lib])
);

const MUSCLE_LABELS = {
    'upper_chest': 'Üst Göğüs',
    'mid_chest': 'Orta Göğüs',
    'lower_chest': 'Alt Göğüs',
    'abs': 'Karın',
    'obliques': 'Yan Karın',
    'front_delt': 'Ön Omuz',
    'biceps': 'Biceps',
    'forearm': 'Ön Kol',
    'quads': 'Quadriceps',
    'inner_thigh': 'İç Bacak',
    'calves': 'Baldır',
    'traps': 'Trapez',
    'rear_delt': 'Arka Omuz',
    'rhomboids': 'Orta Sırt',
    'lower_back': 'Bel',
    'triceps': 'Triceps',
    'glutes': 'Kalça',
    'hamstrings': 'Hamstring',
};

export default function BodyDiagramSVG({ selectedMuscles = [], onToggleMuscle, muscleGroups = {} }) {
    const [view, setView] = useState('anterior');
    const [hoveredMuscle, setHoveredMuscle] = useState(null);

    // Seçili kasları kütüphane formatına çevir
    const highlightData = useMemo(() => {
        const libMuscles = selectedMuscles
            .map(appId => REVERSE_MUSCLE_MAP[appId])
            .filter(Boolean);

        if (libMuscles.length === 0) return [];

        // Kütüphane formatı: { name: string, muscles: string[], frequency?: number }
        return libMuscles.map(muscle => ({
            name: muscle,
            muscles: [muscle],
            frequency: 1
        }));
    }, [selectedMuscles]);

    // Kas tıklama
    const handleClick = useCallback((e) => {
        const muscleName = e?.muscle || e;
        if (typeof muscleName === 'string' && MUSCLE_ID_MAP[muscleName]) {
            const target = MUSCLE_ID_MAP[muscleName];
            // Göğüs için array kontrolü
            if (Array.isArray(target)) {
                target.forEach(id => onToggleMuscle(id));
            } else {
                onToggleMuscle(target);
            }
        }
    }, [onToggleMuscle]);

    // Label alma
    const getLabel = useCallback((id) => {
        return muscleGroups[id]?.label || MUSCLE_LABELS[id] || id;
    }, [muscleGroups]);

    // Kütüphane kas isminden Türkçe label al
    const getLibraryLabel = useCallback((libMuscle) => {
        const appId = MUSCLE_ID_MAP[libMuscle];
        if (Array.isArray(appId)) {
            return 'Göğüs (Üst/Orta/Alt)';
        }
        return MUSCLE_LABELS[appId] || libMuscle;
    }, []);

    // Hover handler
    const handleMouseEnter = useCallback((e) => {
        const muscleName = e?.muscle || e;
        if (typeof muscleName === 'string') {
            setHoveredMuscle(muscleName);
        }
    }, []);

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            {/* Görünüm Seçici */}
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm">
                <button
                    onClick={() => setView('anterior')}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'anterior'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
                        }`}
                >
                    Önden
                </button>
                <button
                    onClick={() => setView('posterior')}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'posterior'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
                        }`}
                >
                    Arkadan
                </button>
            </div>

            {/* Hover Label */}
            <div className="h-8 flex items-center justify-center">
                {hoveredMuscle && (
                    <div className="bg-slate-800 dark:bg-slate-600 text-white text-sm px-4 py-1.5 rounded-full shadow-lg font-medium animate-pulse">
                        {getLibraryLabel(hoveredMuscle)}
                    </div>
                )}
            </div>

            {/* Vücut Modeli */}
            <div
                className="w-full max-w-[220px] sm:max-w-[280px] body-model-wrapper"
                onMouseLeave={() => setHoveredMuscle(null)}
            >
                <style>{`
                    .body-model-wrapper svg {
                        width: 100%;
                        height: auto;
                    }
                    .body-model-wrapper svg polygon,
                    .body-model-wrapper svg path {
                        cursor: pointer;
                        transition: fill 0.2s ease, opacity 0.2s ease;
                    }
                    .body-model-wrapper svg polygon:hover,
                    .body-model-wrapper svg path:hover {
                        fill: #818cf8 !important;
                        opacity: 0.9;
                    }
                `}</style>
                <Model
                    type={view}
                    data={highlightData}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    highlightedColors={['#6366f1']}
                />
            </div>

            {/* Seçili Kaslar */}
            {selectedMuscles.length > 0 && (
                <div className="w-full max-w-[320px]">
                    <div className="text-xs text-gray-500 dark:text-slate-400 mb-2 text-center font-medium">
                        Seçili Kaslar ({selectedMuscles.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {selectedMuscles.map(id => (
                            <button
                                key={id}
                                onClick={() => onToggleMuscle(id)}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full font-medium transition-all shadow-sm flex items-center gap-1"
                            >
                                {getLabel(id)}
                                <span className="opacity-70">×</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center">
                Kas bölgesine tıklayarak seçin
            </p>
        </div>
    );
}
