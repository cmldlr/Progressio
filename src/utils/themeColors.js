/**
 * Tema-Uyumlu Renk Paleti (Smart Disabled Edition)
 * 
 * Update: Added 'disabled' state for cells.
 * - Disabled state is darker/blocked version of the column color.
 * - Light Mode: bg-[color]-200 (Darker than active 50/100)
 * - Dark Mode: bg-[color]-950/50 (Darker/Saturated void)
 */

export const THEME_COLORS = {
    gray: {
        id: 'gray',
        label: 'Varsayılan',
        light: {
            headerBg: 'bg-gray-100',
            headerText: 'text-gray-900',
            headerBorder: 'border-b border-gray-200 border-r border-gray-200',

            rowBg: 'bg-white',
            rowText: 'text-gray-900',
            rowBorder: 'border-l-4 border-l-gray-300 border-y border-r border-gray-200',
            rowHover: 'hover:bg-gray-50',

            cellBg: 'bg-gray-50/50',
            cellText: 'text-gray-900',
            cellFocus: 'focus:bg-white',

            disabled: 'bg-gray-200 text-gray-400',
        },
        dark: {
            headerBg: 'dark:bg-slate-800',
            headerText: 'dark:text-gray-100',
            headerBorder: 'dark:border-b dark:border-slate-700 dark:border-r dark:border-slate-700',

            rowBg: 'dark:bg-slate-900',
            rowText: 'dark:text-gray-300',
            rowBorder: 'dark:border-l-4 dark:border-l-slate-600 dark:border-y dark:border-r dark:border-slate-800',
            rowHover: 'dark:hover:bg-slate-800',

            cellBg: 'dark:bg-slate-800/50',
            cellText: 'dark:text-gray-300',
            cellFocus: 'dark:focus:bg-slate-800',

            disabled: 'dark:bg-slate-800 dark:text-slate-600',
        }
    },
    red: {
        id: 'red',
        label: 'Kırmızı',
        light: {
            headerBg: 'bg-red-100',
            headerText: 'text-red-900',
            headerBorder: 'border-b border-red-200 border-r border-gray-200',

            rowBg: 'bg-red-50',
            rowText: 'text-gray-900',
            rowBorder: 'border-l-4 border-l-red-500 border-y border-r border-red-100',
            rowHover: 'hover:bg-red-100',

            cellBg: 'bg-red-50',
            cellText: 'text-gray-900',
            cellFocus: 'focus:bg-white',

            // Koyu Kırmızı (Light Mode için "blocked" hissi)
            disabled: 'bg-red-100/80 text-red-300', // bg-red-200 çok koyu kaçabilir, 100 opak
        },
        dark: {
            headerBg: 'dark:bg-red-500/20',
            headerText: 'dark:text-red-50',
            headerBorder: 'dark:border-b dark:border-red-500/30 dark:border-r dark:border-slate-700',

            rowBg: 'dark:bg-slate-900',
            rowText: 'dark:text-white',
            rowBorder: 'dark:border-l-4 dark:border-l-red-500 dark:border-y dark:border-r dark:border-slate-800',
            rowHover: 'dark:hover:bg-slate-800',

            cellBg: 'dark:bg-red-500/10',
            cellText: 'dark:text-white',
            cellFocus: 'dark:focus:bg-slate-900',

            // Koyu Kırmızı Void (Dark Mode) - "sütun rengi kırmızı ise koyu kırmızı olsun"
            disabled: 'dark:bg-red-950/40 dark:text-red-900/50',
        }
    },
    blue: {
        id: 'blue',
        label: 'Mavi',
        light: {
            headerBg: 'bg-blue-100',
            headerText: 'text-blue-900',
            headerBorder: 'border-b border-blue-200 border-r border-gray-200',

            rowBg: 'bg-blue-50',
            rowText: 'text-gray-900',
            rowBorder: 'border-l-4 border-l-blue-500 border-y border-r border-blue-200',
            rowHover: 'hover:bg-blue-100',

            cellBg: 'bg-blue-50',
            cellText: 'text-gray-900',
            cellFocus: 'focus:bg-white',

            disabled: 'bg-blue-100/80 text-blue-300',
        },
        dark: {
            headerBg: 'dark:bg-blue-500/20',
            headerText: 'dark:text-blue-50',
            headerBorder: 'dark:border-b dark:border-blue-500/30 dark:border-r dark:border-slate-700',

            rowBg: 'dark:bg-slate-900',
            rowText: 'dark:text-white',
            rowBorder: 'dark:border-l-4 dark:border-l-blue-500 dark:border-y dark:border-r dark:border-slate-800',
            rowHover: 'dark:hover:bg-slate-800',

            cellBg: 'dark:bg-blue-500/10',
            cellText: 'dark:text-white',
            cellFocus: 'dark:focus:bg-slate-900',

            disabled: 'dark:bg-blue-950/40 dark:text-blue-900/50',
        }
    },
    green: {
        id: 'green',
        label: 'Yeşil',
        light: {
            headerBg: 'bg-emerald-100',
            headerText: 'text-emerald-900',
            headerBorder: 'border-b border-emerald-200 border-r border-gray-200',

            rowBg: 'bg-emerald-50',
            rowText: 'text-gray-900',
            rowBorder: 'border-l-4 border-l-emerald-500 border-y border-r border-emerald-100',
            rowHover: 'hover:bg-emerald-100',

            cellBg: 'bg-emerald-50',
            cellText: 'text-gray-900',
            cellFocus: 'focus:bg-white',

            disabled: 'bg-emerald-100/80 text-emerald-300',
        },
        dark: {
            headerBg: 'dark:bg-emerald-500/20',
            headerText: 'dark:text-emerald-50',
            headerBorder: 'dark:border-b dark:border-emerald-500/30 dark:border-r dark:border-slate-700',

            rowBg: 'dark:bg-slate-900',
            rowText: 'dark:text-white',
            rowBorder: 'dark:border-l-4 dark:border-l-emerald-500 dark:border-y dark:border-r dark:border-slate-800',
            rowHover: 'dark:hover:bg-slate-800',

            cellBg: 'dark:bg-emerald-500/10',
            cellText: 'dark:text-white',
            cellFocus: 'dark:focus:bg-slate-900',

            disabled: 'dark:bg-emerald-950/40 dark:text-emerald-900/50',
        }
    },
    yellow: {
        id: 'yellow',
        label: 'Sarı',
        light: {
            headerBg: 'bg-amber-100',
            headerText: 'text-amber-900',
            headerBorder: 'border-b border-amber-200 border-r border-gray-200',

            rowBg: 'bg-amber-50',
            rowText: 'text-gray-900',
            rowBorder: 'border-l-4 border-l-amber-400 border-y border-r border-amber-100',
            rowHover: 'hover:bg-amber-100',

            cellBg: 'bg-amber-50',
            cellText: 'text-gray-900',
            cellFocus: 'focus:bg-white',

            disabled: 'bg-amber-100/80 text-amber-300',
        },
        dark: {
            headerBg: 'dark:bg-amber-400/15',
            headerText: 'dark:text-amber-50',
            headerBorder: 'dark:border-b dark:border-amber-400/30 dark:border-r dark:border-slate-700',

            rowBg: 'dark:bg-slate-900',
            rowText: 'dark:text-white',
            rowBorder: 'dark:border-l-4 dark:border-l-amber-400 dark:border-y dark:border-r dark:border-slate-800',
            rowHover: 'dark:hover:bg-slate-800',

            cellBg: 'dark:bg-amber-400/10',
            cellText: 'dark:text-white',
            cellFocus: 'dark:focus:bg-slate-900',

            disabled: 'dark:bg-amber-900/30 dark:text-amber-900/50',
        }
    },
    purple: {
        id: 'purple',
        label: 'Mor',
        light: {
            headerBg: 'bg-violet-100',
            headerText: 'text-violet-900',
            headerBorder: 'border-b border-violet-200 border-r border-gray-200',

            rowBg: 'bg-violet-50',
            rowText: 'text-gray-900',
            rowBorder: 'border-l-4 border-l-violet-500 border-y border-r border-violet-100',
            rowHover: 'hover:bg-violet-100',

            cellBg: 'bg-violet-50',
            cellText: 'text-gray-900',
            cellFocus: 'focus:bg-white',

            disabled: 'bg-violet-100/80 text-violet-300',
        },
        dark: {
            headerBg: 'dark:bg-violet-500/20',
            headerText: 'dark:text-violet-50',
            headerBorder: 'dark:border-b dark:border-violet-500/30 dark:border-r dark:border-slate-700',

            rowBg: 'dark:bg-slate-900',
            rowText: 'dark:text-white',
            rowBorder: 'dark:border-l-4 dark:border-l-violet-500 dark:border-y dark:border-r dark:border-slate-800',
            rowHover: 'dark:hover:bg-slate-800',

            cellBg: 'dark:bg-violet-500/10',
            cellText: 'dark:text-white',
            cellFocus: 'dark:focus:bg-slate-900',

            disabled: 'dark:bg-violet-950/40 dark:text-violet-900/50',
        }
    },
    orange: {
        id: 'orange',
        label: 'Turuncu',
        light: {
            headerBg: 'bg-orange-100',
            headerText: 'text-orange-900',
            headerBorder: 'border-b border-orange-200 border-r border-gray-200',

            rowBg: 'bg-orange-50',
            rowText: 'text-gray-900',
            rowBorder: 'border-l-4 border-l-orange-500 border-y border-r border-orange-100',
            rowHover: 'hover:bg-orange-100',

            cellBg: 'bg-orange-50',
            cellText: 'text-gray-900',
            cellFocus: 'focus:bg-white',

            disabled: 'bg-orange-100/80 text-orange-300',
        },
        dark: {
            headerBg: 'dark:bg-orange-500/20',
            headerText: 'dark:text-orange-50',
            headerBorder: 'dark:border-b dark:border-orange-500/30 dark:border-r dark:border-slate-700',

            rowBg: 'dark:bg-slate-900',
            rowText: 'dark:text-white',
            rowBorder: 'dark:border-l-4 dark:border-l-orange-500 dark:border-y dark:border-r dark:border-slate-800',
            rowHover: 'dark:hover:bg-slate-800',

            cellBg: 'dark:bg-orange-500/10',
            cellText: 'dark:text-white',
            cellFocus: 'dark:focus:bg-slate-900',

            disabled: 'dark:bg-orange-950/40 dark:text-orange-900/50',
        }
    }
};

export const COLOR_OPTIONS = Object.values(THEME_COLORS).map(color => ({
    id: color.id,
    label: color.label,
}));

export const getHeaderClasses = (colorId) => {
    const color = THEME_COLORS[colorId] || THEME_COLORS.gray;
    return `${color.light.headerBg} ${color.dark.headerBg} ${color.light.headerText} ${color.dark.headerText} ${color.light.headerBorder} ${color.dark.headerBorder}`;
};

export const getRowClasses = (colorId) => {
    const color = THEME_COLORS[colorId] || THEME_COLORS.gray;
    return `${color.light.rowBg} ${color.dark.rowBg} ${color.light.rowText} ${color.dark.rowText} ${color.light.rowBorder} ${color.dark.rowBorder} ${color.light.rowHover} ${color.dark.rowHover} transition-all`;
};

export const getCellClasses = (colorId) => {
    const color = THEME_COLORS[colorId] || THEME_COLORS.gray;
    return `${color.light.cellBg} ${color.dark.cellBg} ${color.light.cellText} ${color.dark.cellText} ${color.light.cellFocus} ${color.dark.cellFocus} placeholder-gray-300 dark:placeholder-slate-700`;
};

export const getDisabledCellClasses = (colorId) => {
    const color = THEME_COLORS[colorId] || THEME_COLORS.gray;
    // Disabled için özel class
    return `${color.light.disabled} ${color.dark.disabled} cursor-not-allowed select-none`;
};

export const getPreviewClasses = (colorId) => {
    const color = THEME_COLORS[colorId] || THEME_COLORS.gray;
    if (color.id === 'gray') return 'bg-gray-200 dark:bg-slate-600';

    const bgMap = {
        red: 'bg-red-500 dark:bg-red-500',
        blue: 'bg-blue-500 dark:bg-blue-500',
        green: 'bg-emerald-500 dark:bg-emerald-500',
        yellow: 'bg-amber-400 dark:bg-amber-400',
        purple: 'bg-violet-500 dark:bg-violet-500',
        orange: 'bg-orange-500 dark:bg-orange-500',
    };
    return bgMap[colorId] || 'bg-gray-500';
};

export const extractColorId = (colorInput) => {
    if (!colorInput) return 'gray';
    if (THEME_COLORS[colorInput]) return colorInput;
    const match = colorInput.match(/bg-(\w+)-\d+/);
    if (match && THEME_COLORS[match[1]]) {
        return match[1];
    }
    return 'gray';
};

export default THEME_COLORS;
