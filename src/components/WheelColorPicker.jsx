import React, { useState, useEffect, useRef, useCallback } from 'react';
import { extractColorId, THEME_COLORS } from '../utils/themeColors';

// Helper: Hex to HSV
const hexToHsv = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt('0x' + hex[1] + hex[1]);
        g = parseInt('0x' + hex[2] + hex[2]);
        b = parseInt('0x' + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt('0x' + hex[1] + hex[2]);
        g = parseInt('0x' + hex[3] + hex[4]);
        b = parseInt('0x' + hex[5] + hex[6]);
    }
    r /= 255; g /= 255; b /= 255;

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0, s = 0, v = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    v = Math.round(cmax * 100);
    s = cmax === 0 ? 0 : Math.round((delta / cmax) * 100);

    return { h, s, v };
};

// Helper: HSV to Hex
const hsvToHex = ({ h, s, v }) => {
    s /= 100;
    v /= 100;
    let c = v * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = v - c;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`.toUpperCase();
};

export default function WheelColorPicker({ color, onChange, swatches = true }) {
    // Current HSV state
    const [hsv, setHsv] = useState(hexToHsv(color || '#EF4444'));
    const [isDraggingWheel, setIsDraggingWheel] = useState(false);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const wheelRef = useRef(null);
    const sliderRef = useRef(null);

    // Sync state if prop changes remotely (and not dragging)
    useEffect(() => {
        if (!isDraggingWheel && !isDraggingSlider) {
            setHsv(hexToHsv(color || '#EF4444'));
        }
    }, [color]);

    // Handle Wheel Interaction (Hue & Saturation)
    const handleWheelChange = useCallback((e) => {
        if (!wheelRef.current) return;
        const rect = wheelRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = clientX - rect.left - centerX;
        const y = clientY - rect.top - centerY;

        // Angle for Hue
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = angle + 90; // Adjust starting point to top
        if (angle < 0) angle += 360;

        // Distance for Saturation
        const radius = Math.min(centerX, centerY);
        const distance = Math.sqrt(x * x + y * y);
        const saturation = Math.min(100, Math.round((distance / radius) * 100));

        const newHsv = { ...hsv, h: Math.round(angle), s: saturation };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv));
    }, [hsv, onChange]);

    // Handle Slider Interaction (Value/Brightness)
    const handleSliderChange = useCallback((e) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;

        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));

        const newHsv = { ...hsv, v: Math.round(percentage * 100) };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv));
    }, [hsv, onChange]);

    // Mouse/Touch Events for Wheel
    const onWheelMouseDown = (e) => {
        setIsDraggingWheel(true);
        handleWheelChange(e);
        // Event listeners are handled by useEffect when isDraggingWheel becomes true
    };

    // Mouse/Touch Events for Wheel Dragging
    useEffect(() => {
        const move = (e) => { if (isDraggingWheel) handleWheelChange(e); };
        const up = () => { setIsDraggingWheel(false); };

        if (isDraggingWheel) {
            window.addEventListener('mousemove', move);
            window.addEventListener('touchmove', move);
            window.addEventListener('mouseup', up);
            window.addEventListener('touchend', up);
        }
        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchend', up);
        };
    }, [isDraggingWheel, handleWheelChange]);



    // Mouse/Touch Events for Slider
    useEffect(() => {
        const move = (e) => { if (isDraggingSlider) handleSliderChange(e); };
        const up = () => { setIsDraggingSlider(false); };
        if (isDraggingSlider) {
            window.addEventListener('mousemove', move);
            window.addEventListener('touchmove', move);
            window.addEventListener('mouseup', up);
            window.addEventListener('touchend', up);
        }
        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchend', up);
        };
    }, [isDraggingSlider, handleSliderChange]);


    // Common Swatches
    const presetColors = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
        '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e',
        '#64748b', '#000000'
    ];

    return (
        <div className="flex flex-col items-center gap-6 p-4 select-none">

            {/* 1. COLOR WHEEL */}
            <div
                ref={wheelRef}
                onMouseDown={onWheelMouseDown}
                onTouchStart={(e) => { setIsDraggingWheel(true); handleWheelChange(e); }}
                className="relative w-48 h-48 rounded-full shadow-xl cursor-crosshair touch-none"
                style={{
                    background: `
                        radial-gradient(circle, white 0%, transparent 100%),
                        conic-gradient(
                            red 0deg, 
                            yellow 60deg, 
                            lime 120deg, 
                            aqua 180deg, 
                            blue 240deg, 
                            magenta 300deg, 
                            red 360deg
                        )
                    `
                }}
            >
                {/* Thumb */}
                <div
                    className="absolute w-6 h-6 rounded-full border-2 border-white shadow-md pointer-events-none"
                    style={{
                        backgroundColor: color,
                        left: '50%',
                        top: '50%',
                        transform: `
                            translate(-50%, -50%) 
                            rotate(${hsv.h - 90}deg) 
                            translateX(${hsv.s * 0.96}px) 
                            rotate(${-(hsv.h - 90)}deg)
                        `
                        // Math logic: Rotate to angle -> push out by saturation -> rotate back to keep thumb upright (optional)
                        // Actually easier: calculate X/Y from H/S
                        // x = r * cos(theta), y = r * sin(theta)
                        // radius = (hsv.s / 100) * (width/2)
                    }}
                />
            </div>

            {/* 2. BRIGHTNESS SLIDER */}
            <div className="w-full space-y-2">
                <div className="relative w-full h-8 rounded-full shadow-inner cursor-pointer"
                    ref={sliderRef}
                    onMouseDown={(e) => { setIsDraggingSlider(true); handleSliderChange(e); }}
                    onTouchStart={(e) => { setIsDraggingSlider(true); handleSliderChange(e); }}
                    style={{
                        background: `linear-gradient(to right, #000 0%, ${hsvToHex({ h: hsv.h, s: hsv.s, v: 100 })} 100%)`
                    }}
                >
                    {/* Slider Thumb */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full shadow-md pointer-events-none"
                        style={{
                            left: `${hsv.v}%`,
                            transform: 'translateX(-50%)'
                        }}
                    />
                </div>
            </div>

            {/* 3. SWATCHES */}
            {swatches && (
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                    {presetColors.map(c => (
                        <button
                            key={c}
                            onClick={() => {
                                setHsv(hexToHsv(c));
                                onChange(c);
                            }}
                            className={`w-8 h-8 rounded-full border border-gray-200 transition-transform active:scale-95 shadow-sm ${color === c ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            )}

            {/* Hex Display */}
            <div className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded font-mono text-sm tracking-wider text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                {color}
            </div>

        </div>
    );
}
