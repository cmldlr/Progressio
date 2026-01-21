import React, { useState } from 'react';

// 265×532 piksel boyutundaki görüntüye göre koordinatlar (yüzdesel)
// Görüntü: Kollar hafif açık, vücut tam ortalı

const FRONT_MUSCLE_REGIONS = {
    // GÖĞÜS - 3 ayrı yatay şerit (görüntüde net ayrılmış)
    'upper_chest': { x: 50, y: 19, width: 30, height: 4, label: 'Üst Göğüs' },
    'mid_chest': { x: 50, y: 24, width: 34, height: 5, label: 'Orta Göğüs' },
    'lower_chest': { x: 50, y: 30, width: 30, height: 4, label: 'Alt Göğüs' },

    // OMUZ - yanlarda üst kısım
    'front_delt': { x: 28, y: 17, width: 12, height: 7, label: 'Ön Omuz', mirror: 72 },
    'side_delt': { x: 22, y: 16, width: 8, height: 8, label: 'Yan Omuz', mirror: 78 },

    // KOLLAR - hafif açık
    'biceps': { x: 18, y: 28, width: 8, height: 12, label: 'Biceps', mirror: 82 },
    'forearm': { x: 14, y: 42, width: 7, height: 12, label: 'Ön Kol', mirror: 86 },

    // KARIN - ortada belirgin six-pack
    'abs': { x: 50, y: 40, width: 20, height: 14, label: 'Karın' },
    'obliques': { x: 35, y: 38, width: 8, height: 12, label: 'Yan Karın', mirror: 65 },

    // BACAK - geniş quad bölgesi
    'quads': { x: 38, y: 62, width: 14, height: 20, label: 'Quadriceps', mirror: 62 },
    'calves': { x: 40, y: 88, width: 10, height: 10, label: 'Baldır', mirror: 60 },
};

const BACK_MUSCLE_REGIONS = {
    // ÜST SIRT - trapez omuzlardan boyuna
    'traps': { x: 50, y: 14, width: 26, height: 10, label: 'Trapez' },
    'rear_delt': { x: 26, y: 17, width: 10, height: 7, label: 'Arka Omuz', mirror: 74 },

    // SIRT - belirgin lat ve orta sırt
    'rhomboids': { x: 50, y: 24, width: 16, height: 8, label: 'Orta Sırt' },
    'lats': { x: 32, y: 32, width: 14, height: 14, label: 'Kanat (Lat)', mirror: 68 },
    'lower_back': { x: 50, y: 44, width: 18, height: 10, label: 'Bel' },

    // KOLLAR - triceps
    'triceps': { x: 18, y: 28, width: 8, height: 10, label: 'Triceps', mirror: 82 },

    // ALT VÜCUT
    'glutes': { x: 40, y: 54, width: 16, height: 10, label: 'Kalça', mirror: 60 },
    'hamstrings': { x: 38, y: 68, width: 14, height: 16, label: 'Hamstring', mirror: 62 },
    'calves': { x: 40, y: 88, width: 10, height: 10, label: 'Baldır', mirror: 60 },
};

export default function BodyDiagram({ selectedMuscles = [], onToggleMuscle, muscleGroups = {} }) {
    const [view, setView] = useState('front');
    const [hoveredMuscle, setHoveredMuscle] = useState(null);

    const regions = view === 'front' ? FRONT_MUSCLE_REGIONS : BACK_MUSCLE_REGIONS;
    const imageSrc = view === 'front' ? '/body_front.png' : '/body_back.png';

    const getMuscleStyle = (isSelected, isHovered) => {
        if (isSelected) {
            return 'bg-indigo-500/50 border-2 border-indigo-500';
        }
        if (isHovered) {
            return 'bg-blue-400/40 border-2 border-blue-400';
        }
        return 'bg-transparent hover:bg-white/30 hover:border hover:border-gray-400';
    };

    const renderMuscleRegion = (muscleId, region) => {
        const isSelected = selectedMuscles.includes(muscleId);
        const isHovered = hoveredMuscle === muscleId;
        const style = getMuscleStyle(isSelected, isHovered);

        const createRegion = (x, key) => (
            <div
                key={key}
                className={`absolute cursor-pointer transition-all duration-200 rounded ${style}`}
                style={{
                    left: `${x - region.width / 2}%`,
                    top: `${region.y - region.height / 2}%`,
                    width: `${region.width}%`,
                    height: `${region.height}%`,
                }}
                onClick={(e) => { e.stopPropagation(); onToggleMuscle(muscleId); }}
                onMouseEnter={() => setHoveredMuscle(muscleId)}
                onMouseLeave={() => setHoveredMuscle(null)}
            />
        );

        const mainRegion = createRegion(region.x, muscleId);
        const mirrorRegion = region.mirror ? createRegion(region.mirror, `${muscleId}-mirror`) : null;

        return [mainRegion, mirrorRegion];
    };

    const getLabel = (id) => {
        return muscleGroups[id]?.label ||
            FRONT_MUSCLE_REGIONS[id]?.label ||
            BACK_MUSCLE_REGIONS[id]?.label ||
            id;
    };

    // Görüntü oranı: 265/532 = 0.498 (yaklaşık 1:2)
    // Container boyutu buna göre ayarlandı
    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* View Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => setView('front')}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'front'
                            ? 'bg-white text-indigo-600 shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Önden
                </button>
                <button
                    onClick={() => setView('back')}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'back'
                            ? 'bg-white text-indigo-600 shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Arkadan
                </button>
            </div>

            {/* Body Container - 265:532 oranında (1:2) */}
            <div
                className="relative select-none"
                style={{ width: '265px', height: '532px' }}
            >
                {/* Hover Label */}
                {hoveredMuscle && regions[hoveredMuscle] && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-full shadow-lg font-medium whitespace-nowrap">
                        {regions[hoveredMuscle].label}
                    </div>
                )}

                {/* Body Image - Tam boyut */}
                <img
                    src={imageSrc}
                    alt={`Vücut ${view === 'front' ? 'ön' : 'arka'} görünüm`}
                    className="w-full h-full"
                    draggable={false}
                />

                {/* Muscle Regions Overlay */}
                {Object.entries(regions).map(([muscleId, region]) =>
                    renderMuscleRegion(muscleId, region)
                )}
            </div>

            {/* Selected Muscles */}
            {selectedMuscles.length > 0 && (
                <div className="w-full max-w-[280px]">
                    <div className="text-xs text-gray-500 mb-2 text-center font-medium">
                        Seçili ({selectedMuscles.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {selectedMuscles.map(id => (
                            <button
                                key={id}
                                onClick={() => onToggleMuscle(id)}
                                className="text-[11px] bg-indigo-600 text-white px-2 py-1 rounded-full font-medium hover:bg-indigo-700 transition flex items-center gap-1"
                            >
                                {getLabel(id)} ×
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-[10px] text-gray-400 text-center">
                Kas bölgesine tıkla = seç/kaldır
            </p>
        </div>
    );
}
