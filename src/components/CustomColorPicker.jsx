import React, { useState, useEffect, useRef } from 'react';
// Custom Color Picker (No external libraries)
import { Check, ChevronRight } from 'lucide-react';

const SATURATION_LEVELS = [95, 85, 75, 65, 55, 45, 35, 25];
const LIGHTNESS_LEVELS = [95, 85, 75, 65, 55, 45, 35];

export default function CustomColorPicker({ color, onChange }) {
    // Parse initial color to HSL or fallback to red
    const [hue, setHue] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Simple HSL to Hex helper
    const hslToHex = (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    // Shades generator based on current Hue
    const shades = [
        // Pastel / Light
        { s: 100, l: 90 }, { s: 100, l: 80 }, { s: 100, l: 70 },
        // Vibrant
        { s: 90, l: 60 }, { s: 100, l: 50 }, { s: 100, l: 40 },
        // Dark / Muted
        { s: 60, l: 40 }, { s: 80, l: 20 }, { s: 0, l: 0 } // Black/Gray
    ];

    const handleHueChange = (e) => {
        const newHue = parseInt(e.target.value);
        setHue(newHue);
        // Automatically select a vibrant version of this hue
        onChange(hslToHex(newHue, 90, 50));
    };

    return (
        <div className="w-full">
            {/* Hue Slider (Rainbow) */}
            <div className="relative h-6 rounded-full overflow-hidden mb-4 ring-1 ring-black/5">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }} />
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={handleHueChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {/* Thumb Indicator (Approximate) */}
                <div
                    className="absolute top-0 bottom-0 w-4 bg-white border-2 border-gray-300 rounded-full shadow-md pointer-events-none transform -translate-x-1/2 transition-transform"
                    style={{ left: `${(hue / 360) * 100}%` }}
                />
            </div>

            {/* Generated Palette for this Hue */}
            <div className="grid grid-cols-5 gap-2">
                {shades.map((shade, idx) => {
                    const hex = hslToHex(hue, shade.s, shade.l);
                    const isSelected = color === hex;
                    return (
                        <button
                            key={idx}
                            onClick={() => onChange(hex)}
                            className={`w-full aspect-square rounded-xl shadow-sm transition-all hover:scale-110 active:scale-95 border-2 ${isSelected ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: hex }}
                        >
                            {isSelected && <Check size={16} className={`mx-auto ${shade.l > 70 ? 'text-black' : 'text-white'}`} />}
                        </button>
                    );
                })}
                {/* Current Preview / Manual Input */}
                <div className="col-span-2 flex items-center justify-center p-1">
                    <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-full border border-gray-200 dark:border-slate-700">
                        <span className="text-xs text-gray-500 select-none px-2 py-1">#</span>
                        <input
                            type="text"
                            value={color.replace('#', '')}
                            onChange={(e) => onChange(`#${e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)}`)}
                            className="bg-transparent text-sm font-mono w-full focus:outline-none uppercase text-gray-700 dark:text-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
