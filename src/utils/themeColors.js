/**
 * Tema-Uyumlu Renk Paleti (Dynamic CSS Variable Edition)
 * Supports both Presets (Tailwind classes) and Custom Hex Colors (CSS Variables).
 */

// --- 1. PRESETS (Legacy & Standard) ---
export const THEME_COLORS = {
    gray: {
        id: 'gray', label: 'Varsayılan',
        light: {
            headerBg: 'bg-gray-100', headerText: 'text-gray-900', headerBorder: 'border-b border-gray-200 border-r border-gray-200',
            rowBg: 'bg-white', rowText: 'text-gray-900', rowBorder: 'border-l-4 border-l-gray-300 border-y border-r border-gray-200', rowHover: 'hover:bg-gray-50',
            cellBg: 'bg-gray-50/50', cellText: 'text-gray-900', cellFocus: 'focus:bg-white',
            disabled: 'bg-gray-200 text-gray-400',
        },
        dark: {
            headerBg: 'dark:bg-slate-800', headerText: 'dark:text-gray-100', headerBorder: 'dark:border-b dark:border-slate-700 dark:border-r dark:border-slate-700',
            rowBg: 'dark:bg-slate-900', rowText: 'dark:text-gray-300', rowBorder: 'dark:border-l-4 dark:border-l-slate-600 dark:border-y dark:border-r dark:border-slate-800', rowHover: 'dark:hover:bg-slate-800',
            cellBg: 'dark:bg-slate-800/50', cellText: 'dark:text-gray-300', cellFocus: 'dark:focus:bg-slate-800',
            disabled: 'dark:bg-slate-800 dark:text-slate-600',
        }
    },
    red: {
        id: 'red', label: 'Kırmızı',
        light: {
            headerBg: 'bg-red-100', headerText: 'text-red-900', headerBorder: 'border-b border-red-200 border-r border-gray-200',
            rowBg: 'bg-red-50', rowText: 'text-gray-900', rowBorder: 'border-l-4 border-l-red-500 border-y border-r border-red-100', rowHover: 'hover:bg-red-100',
            cellBg: 'bg-red-50', cellText: 'text-gray-900', cellFocus: 'focus:bg-white',
            disabled: 'bg-red-100/80 text-red-300',
        },
        dark: {
            headerBg: 'dark:bg-red-500/20', headerText: 'dark:text-red-50', headerBorder: 'dark:border-b dark:border-red-500/30 dark:border-r dark:border-slate-700',
            rowBg: 'dark:bg-slate-900', rowText: 'dark:text-white', rowBorder: 'dark:border-l-4 dark:border-l-red-500 dark:border-y dark:border-r dark:border-slate-800', rowHover: 'dark:hover:bg-slate-800',
            cellBg: 'dark:bg-red-500/10', cellText: 'dark:text-white', cellFocus: 'dark:focus:bg-slate-900',
            disabled: 'dark:bg-red-950/40 dark:text-red-900/50',
        }
    },
    blue: {
        id: 'blue', label: 'Mavi',
        light: {
            headerBg: 'bg-blue-100', headerText: 'text-blue-900', headerBorder: 'border-b border-blue-200 border-r border-gray-200',
            rowBg: 'bg-blue-50', rowText: 'text-gray-900', rowBorder: 'border-l-4 border-l-blue-500 border-y border-r border-blue-200', rowHover: 'hover:bg-blue-100',
            cellBg: 'bg-blue-50', cellText: 'text-gray-900', cellFocus: 'focus:bg-white',
            disabled: 'bg-blue-100/80 text-blue-300',
        },
        dark: {
            headerBg: 'dark:bg-blue-500/20', headerText: 'dark:text-blue-50', headerBorder: 'dark:border-b dark:border-blue-500/30 dark:border-r dark:border-slate-700',
            rowBg: 'dark:bg-slate-900', rowText: 'dark:text-white', rowBorder: 'dark:border-l-4 dark:border-l-blue-500 dark:border-y dark:border-r dark:border-slate-800', rowHover: 'dark:hover:bg-slate-800',
            cellBg: 'dark:bg-blue-500/10', cellText: 'dark:text-white', cellFocus: 'dark:focus:bg-slate-900',
            disabled: 'dark:bg-blue-950/40 dark:text-blue-900/50',
        }
    },
    green: {
        id: 'green', label: 'Yeşil',
        light: {
            headerBg: 'bg-emerald-100', headerText: 'text-emerald-900', headerBorder: 'border-b border-emerald-200 border-r border-gray-200',
            rowBg: 'bg-emerald-50', rowText: 'text-gray-900', rowBorder: 'border-l-4 border-l-emerald-500 border-y border-r border-emerald-100', rowHover: 'hover:bg-emerald-100',
            cellBg: 'bg-emerald-50', cellText: 'text-gray-900', cellFocus: 'focus:bg-white',
            disabled: 'bg-emerald-100/80 text-emerald-300',
        },
        dark: {
            headerBg: 'dark:bg-emerald-500/20', headerText: 'dark:text-emerald-50', headerBorder: 'dark:border-b dark:border-emerald-500/30 dark:border-r dark:border-slate-700',
            rowBg: 'dark:bg-slate-900', rowText: 'dark:text-white', rowBorder: 'dark:border-l-4 dark:border-l-emerald-500 dark:border-y dark:border-r dark:border-slate-800', rowHover: 'dark:hover:bg-slate-800',
            cellBg: 'dark:bg-emerald-500/10', cellText: 'dark:text-white', cellFocus: 'dark:focus:bg-slate-900',
            disabled: 'dark:bg-emerald-950/40 dark:text-emerald-900/50',
        }
    },
    yellow: {
        id: 'yellow', label: 'Sarı',
        light: {
            headerBg: 'bg-amber-100', headerText: 'text-amber-900', headerBorder: 'border-b border-amber-200 border-r border-gray-200',
            rowBg: 'bg-amber-50', rowText: 'text-gray-900', rowBorder: 'border-l-4 border-l-amber-400 border-y border-r border-amber-100', rowHover: 'hover:bg-amber-100',
            cellBg: 'bg-amber-50', cellText: 'text-gray-900', cellFocus: 'focus:bg-white',
            disabled: 'bg-amber-100/80 text-amber-300',
        },
        dark: {
            headerBg: 'dark:bg-amber-400/15', headerText: 'dark:text-amber-50', headerBorder: 'dark:border-b dark:border-amber-400/30 dark:border-r dark:border-slate-700',
            rowBg: 'dark:bg-slate-900', rowText: 'dark:text-white', rowBorder: 'dark:border-l-4 dark:border-l-amber-400 dark:border-y dark:border-r dark:border-slate-800', rowHover: 'dark:hover:bg-slate-800',
            cellBg: 'dark:bg-amber-400/10', cellText: 'dark:text-white', cellFocus: 'dark:focus:bg-slate-900',
            disabled: 'dark:bg-amber-900/30 dark:text-amber-900/50',
        }
    },
    purple: {
        id: 'purple', label: 'Mor',
        light: {
            headerBg: 'bg-violet-100', headerText: 'text-violet-900', headerBorder: 'border-b border-violet-200 border-r border-gray-200',
            rowBg: 'bg-violet-50', rowText: 'text-gray-900', rowBorder: 'border-l-4 border-l-violet-500 border-y border-r border-violet-100', rowHover: 'hover:bg-violet-100',
            cellBg: 'bg-violet-50', cellText: 'text-gray-900', cellFocus: 'focus:bg-white',
            disabled: 'bg-violet-100/80 text-violet-300',
        },
        dark: {
            headerBg: 'dark:bg-violet-500/20', headerText: 'dark:text-violet-50', headerBorder: 'dark:border-b dark:border-violet-500/30 dark:border-r dark:border-slate-700',
            rowBg: 'dark:bg-slate-900', rowText: 'dark:text-white', rowBorder: 'dark:border-l-4 dark:border-l-violet-500 dark:border-y dark:border-r dark:border-slate-800', rowHover: 'dark:hover:bg-slate-800',
            cellBg: 'dark:bg-violet-500/10', cellText: 'dark:text-white', cellFocus: 'dark:focus:bg-slate-900',
            disabled: 'dark:bg-violet-950/40 dark:text-violet-900/50',
        }
    },
    orange: {
        id: 'orange', label: 'Turuncu',
        light: {
            headerBg: 'bg-orange-100', headerText: 'text-orange-900', headerBorder: 'border-b border-orange-200 border-r border-gray-200',
            rowBg: 'bg-orange-50', rowText: 'text-gray-900', rowBorder: 'border-l-4 border-l-orange-500 border-y border-r border-orange-100', rowHover: 'hover:bg-orange-100',
            cellBg: 'bg-orange-50', cellText: 'text-gray-900', cellFocus: 'focus:bg-white',
            disabled: 'bg-orange-100/80 text-orange-300',
        },
        dark: {
            headerBg: 'dark:bg-orange-500/20', headerText: 'dark:text-orange-50', headerBorder: 'dark:border-b dark:border-orange-500/30 dark:border-r dark:border-slate-700',
            rowBg: 'dark:bg-slate-900', rowText: 'dark:text-white', rowBorder: 'dark:border-l-4 dark:border-l-orange-500 dark:border-y dark:border-r dark:border-slate-800', rowHover: 'dark:hover:bg-slate-800',
            cellBg: 'dark:bg-orange-500/10', cellText: 'dark:text-white', cellFocus: 'dark:focus:bg-slate-900',
            disabled: 'dark:bg-orange-950/40 dark:text-orange-900/50',
        }
    }
};

export const COLOR_OPTIONS = Object.values(THEME_COLORS).map(color => ({
    id: color.id,
    label: color.label,
}));

// --- 2. HELPERS (Hex Logic) ---

// Hex to HSL
const hexToHSL = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
};

// Generate CSS Variables for a given Hex
export const generateThemeStyles = (hex) => {
    if (!hex || !hex.startsWith('#')) return null;

    const { h, s } = hexToHSL(hex);

    // Light Mode Palette
    const bgLight = `hsl(${h}, ${s}%, 96%)`; // Very pale
    const borderLight = `hsl(${h}, ${s}%, 85%)`; // Subtle border
    const textLight = `hsl(${h}, ${Math.min(s + 10, 100)}%, 15%)`; // Dark readable text
    const accentLight = `hsl(${h}, ${Math.min(s + 10, 100)}%, 50%)`; // Main color
    const disabledBgLight = `hsl(${h}, ${s}%, 90%)`;
    const disabledTextLight = `hsl(${h}, ${s}%, 70%)`;

    // Dark Mode Palette
    // For dark mode, we want the background to be dark but tinted with the color
    const bgDark = `hsl(${h}, ${s * 0.5}%, 12%)`; // Dark slate-ish with tint
    const borderDark = `hsl(${h}, ${s * 0.5}%, 20%)`;
    const textDark = `hsl(${h}, ${Math.min(s, 50)}%, 90%)`; // Light text
    const accentDark = `hsl(${h}, ${Math.min(s + 10, 100)}%, 60%)`; // Brighter accent for dark mode
    const disabledBgDark = `hsl(${h}, ${s * 0.3}%, 15%)`;
    const disabledTextDark = `hsl(${h}, ${s * 0.3}%, 30%)`;
    const darkRowBg = `hsl(${h}, ${s * 0.3}%, 10%)`; // Very dark row bg

    return {
        '--t-light-bg': bgLight,
        '--t-light-text': textLight,
        '--t-light-border': borderLight,
        '--t-light-accent': accentLight,
        '--t-light-disabled-bg': disabledBgLight,
        '--t-light-disabled-text': disabledTextLight,

        '--t-dark-bg': bgDark,
        '--t-dark-row-bg': darkRowBg,
        '--t-dark-text': textDark,
        '--t-dark-border': borderDark,
        '--t-dark-accent': accentDark,
        '--t-dark-disabled-bg': disabledBgDark,
        '--t-dark-disabled-text': disabledTextDark,
    };
};

// --- 3. EXPORTED UTILS (Updated to return { className, style }) ---

export const getHeaderStyles = (colorId) => {
    const preset = THEME_COLORS[colorId];
    if (preset) {
        return {
            className: `${preset.light.headerBg} ${preset.dark.headerBg} ${preset.light.headerText} ${preset.dark.headerText} ${preset.light.headerBorder} ${preset.dark.headerBorder}`,
            style: {}
        };
    }
    // Custom Color
    return {
        className: 'bg-[var(--t-light-bg)] dark:bg-[var(--t-dark-bg)] text-[var(--t-light-text)] dark:text-[var(--t-dark-text)] border-b border-r border-[var(--t-light-border)] dark:border-[var(--t-dark-border)]',
        style: generateThemeStyles(colorId) || {}
    };
};

export const getRowStyles = (colorId) => {
    const preset = THEME_COLORS[colorId];
    if (preset) {
        return {
            className: `${preset.light.rowBg} ${preset.dark.rowBg} ${preset.light.rowText} ${preset.dark.rowText} ${preset.light.rowBorder} ${preset.dark.rowBorder} ${preset.light.rowHover} ${preset.dark.rowHover} transition-all`,
            style: {}
        };
    }
    // Custom Color
    return {
        className: 'bg-[var(--t-light-bg)] dark:bg-[var(--t-dark-row-bg)] text-[var(--t-light-text)] dark:text-[var(--t-dark-text)] border-l-4 border-y border-r border-[var(--t-light-border)] dark:border-[var(--t-dark-border)] border-l-[var(--t-light-accent)] dark:border-l-[var(--t-dark-accent)] hover:brightness-95 dark:hover:brightness-110 transition-all',
        style: generateThemeStyles(colorId) || {}
    };
};

export const getCellStyles = (colorId) => {
    const preset = THEME_COLORS[colorId];
    if (preset) {
        return {
            className: `${preset.light.cellBg} ${preset.dark.cellBg} ${preset.light.cellText} ${preset.dark.cellText} ${preset.light.cellFocus} ${preset.dark.cellFocus} placeholder-gray-300 dark:placeholder-slate-700`,
            style: {}
        };
    }
    // Custom Color
    return {
        className: 'bg-[var(--t-light-bg)] dark:bg-[var(--t-dark-bg)] text-[var(--t-light-text)] dark:text-[var(--t-dark-text)] focus:brightness-105 dark:focus:brightness-110 placeholder-gray-400/50',
        style: generateThemeStyles(colorId) || {}
    };
};

export const getDisabledCellStyles = (colorId) => {
    const preset = THEME_COLORS[colorId];
    if (preset) {
        return {
            className: `${preset.light.disabled} ${preset.dark.disabled} cursor-not-allowed select-none`,
            style: {}
        };
    }
    // Custom Color
    return {
        className: 'bg-[var(--t-light-disabled-bg)] dark:bg-[var(--t-dark-disabled-bg)] text-[var(--t-light-disabled-text)] dark:text-[var(--t-dark-disabled-text)] cursor-not-allowed select-none',
        style: generateThemeStyles(colorId) || {}
    };
};

export const getPreviewStyles = (colorId) => {
    const preset = THEME_COLORS[colorId];
    if (preset) {
        // Fallback for simple preview badges (using Map for safety)
        const bgMap = {
            gray: 'bg-gray-200 dark:bg-slate-600',
            red: 'bg-red-500',
            blue: 'bg-blue-500',
            green: 'bg-emerald-500',
            yellow: 'bg-amber-400',
            purple: 'bg-violet-500',
            orange: 'bg-orange-500',
        };
        return {
            className: bgMap[colorId] || 'bg-gray-500',
            style: {}
        };
    }
    // Custom Color
    return {
        className: '',
        style: { backgroundColor: colorId }
    };
};

export const extractColorId = (colorInput) => {
    if (!colorInput) return 'gray';
    // If it's a valid hex, return it as is
    if (colorInput.startsWith('#')) return colorInput;
    // If it's a preset key
    if (THEME_COLORS[colorInput]) return colorInput;
    // Legacy support: extract 'red' from 'bg-red-500'
    const match = colorInput.match(/bg-(\w+)-\d+/);
    if (match && THEME_COLORS[match[1]]) {
        return match[1];
    }
    return 'gray';
};

// Convert preset color key to representative hex (for color pickers)
const PRESET_HEX_MAP = {
    gray: '#6b7280',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    orange: '#f97316',
};

export const colorIdToHex = (colorId) => {
    if (!colorId) return '#6b7280';
    if (colorId.startsWith('#')) return colorId;
    return PRESET_HEX_MAP[colorId] || '#6b7280';
};

// --- LEGACY COMPATIBILITY WRAPPERS (Deprecated but needed for now) ---
// These will break customized colors if used directly expecting just a string class.
// But we will update consumers to use the *Styles functions.

export const getHeaderClasses = (id) => getHeaderStyles(id).className;
export const getRowClasses = (id) => getRowStyles(id).className;
export const getCellClasses = (id) => getCellStyles(id).className;
export const getDisabledCellClasses = (id) => getDisabledCellStyles(id).className;
export const getPreviewClasses = (id) => getPreviewStyles(id).className;

// Inline style helpers (Mobile) - UPDATED
export const getHeaderInlineStyle = (colorId, isDark = false) => {
    const preset = THEME_COLORS[colorId];
    if (preset) {
        // Fallback static map for preset colors (simplified)
        const COLOR_HEX_MAP = {
            gray: { bg: '#f3f4f6', text: '#111827', border: '#e5e7eb', darkBg: '#1e293b', darkText: '#f3f4f6' },
            red: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', darkBg: '#450a0a', darkText: '#fef2f2' },
            blue: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', darkBg: '#172554', darkText: '#eff6ff' },
            green: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', darkBg: '#022c22', darkText: '#ecfdf5' },
            yellow: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', darkBg: '#451a03', darkText: '#fffbeb' },
            purple: { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe', darkBg: '#2e1065', darkText: '#f5f3ff' },
            orange: { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa', darkBg: '#431407', darkText: '#fff7ed' },
        };
        const colors = COLOR_HEX_MAP[colorId] || COLOR_HEX_MAP.gray;
        return {
            backgroundColor: isDark ? colors.darkBg : colors.bg,
            color: isDark ? colors.darkText : colors.text,
            borderColor: colors.border,
        };
    }
    // Custom
    const vars = generateThemeStyles(colorId);
    if (!vars) return {};
    return {
        backgroundColor: isDark ? vars['--t-dark-bg'] : vars['--t-light-bg'],
        color: isDark ? vars['--t-dark-text'] : vars['--t-light-text'],
        borderColor: isDark ? vars['--t-dark-border'] : vars['--t-light-border'], // Note: Inline styles need direct values, not css vars if used in canvas/etc, but here it's fine
    };
};

export const getRowInlineStyle = (colorId, isDark = false) => {
    const base = getHeaderInlineStyle(colorId, isDark);
    if (THEME_COLORS[colorId]) {
        return {
            ...base,
            borderLeftWidth: '4px',
            borderLeftColor: base.borderColor
        };
    }
    // Custom
    const vars = generateThemeStyles(colorId);
    return {
        ...base,
        backgroundColor: isDark ? vars['--t-dark-row-bg'] : vars['--t-light-bg'],
        borderLeftWidth: '4px',
        borderLeftColor: isDark ? vars['--t-dark-accent'] : vars['--t-light-accent']
    };
};

export default THEME_COLORS;
