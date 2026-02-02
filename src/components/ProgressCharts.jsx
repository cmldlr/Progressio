import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Ruler, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { format, subDays, subMonths, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';

// Metrik tanımları
const METRICS = {
    weight: { label: 'Kilo', unit: 'kg', color: '#6366f1', category: 'general' },
    body_fat_percent: { label: 'Yağ Oranı', unit: '%', color: '#ef4444', category: 'general' },
    muscle_mass: { label: 'Kas Kütlesi', unit: 'kg', color: '#10b981', category: 'general' },
    water_percent: { label: 'Su Oranı', unit: '%', color: '#0ea5e9', category: 'general' },
    visceral_fat: { label: 'İç Yağ', unit: '', color: '#f59e0b', category: 'general' },
    bmr: { label: 'BMR', unit: 'kcal', color: '#8b5cf6', category: 'general' },
    // Tape measurements
    chest: { label: 'Göğüs', unit: 'cm', color: '#6366f1', category: 'tape' },
    shoulder: { label: 'Omuz', unit: 'cm', color: '#8b5cf6', category: 'tape' },
    arm_right: { label: 'Sağ Kol', unit: 'cm', color: '#ec4899', category: 'tape' },
    arm_left: { label: 'Sol Kol', unit: 'cm', color: '#f472b6', category: 'tape' },
    waist: { label: 'Bel', unit: 'cm', color: '#f59e0b', category: 'tape' },
    belly: { label: 'Karın', unit: 'cm', color: '#ef4444', category: 'tape' },
    hip: { label: 'Kalça', unit: 'cm', color: '#14b8a6', category: 'tape' },
    leg_right: { label: 'Sağ Bacak', unit: 'cm', color: '#22c55e', category: 'tape' },
    leg_left: { label: 'Sol Bacak', unit: 'cm', color: '#84cc16', category: 'tape' },
};

const DATE_RANGES = [
    { id: 'all', label: 'Tümü', filter: () => true },
    { id: '30d', label: 'Son 30 Gün', filter: (date) => isAfter(new Date(date), subDays(new Date(), 30)) },
    { id: '3m', label: 'Son 3 Ay', filter: (date) => isAfter(new Date(date), subMonths(new Date(), 3)) },
    { id: '6m', label: 'Son 6 Ay', filter: (date) => isAfter(new Date(date), subMonths(new Date(), 6)) },
    { id: '1y', label: 'Son 1 Yıl', filter: (date) => isAfter(new Date(date), subMonths(new Date(), 12)) },
];

export default function ProgressCharts({ measurements = [], onEdit, onDelete }) {
    const [activeTab, setActiveTab] = useState('general'); // general, tape
    const [selectedMetrics, setSelectedMetrics] = useState(['weight', 'body_fat_percent', 'muscle_mass']);
    const [dateRange, setDateRange] = useState('all');

    // Filter and prepare chart data
    const chartData = useMemo(() => {
        const rangeFilter = DATE_RANGES.find(r => r.id === dateRange)?.filter || (() => true);

        return measurements
            .filter(m => rangeFilter(m.date))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(m => {
                const tape = m.tape_measurements || {};
                return {
                    id: m.id,
                    originalData: m,
                    date: m.date,
                    displayDate: format(new Date(m.date), 'd MMM', { locale: tr }),
                    fullDate: format(new Date(m.date), 'd MMMM yyyy', { locale: tr }),
                    weight: m.weight,
                    body_fat_percent: m.body_fat_percent,
                    muscle_mass: m.muscle_mass,
                    water_percent: m.water_percent,
                    visceral_fat: m.visceral_fat,
                    bmr: m.bmr,
                    // Tape measurements
                    chest: tape.chest ? parseFloat(tape.chest) : null,
                    shoulder: tape.shoulder ? parseFloat(tape.shoulder) : null,
                    arm_right: tape.arm_right ? parseFloat(tape.arm_right) : null,
                    arm_left: tape.arm_left ? parseFloat(tape.arm_left) : null,
                    waist: tape.waist ? parseFloat(tape.waist) : null,
                    belly: tape.belly ? parseFloat(tape.belly) : null,
                    hip: tape.hip ? parseFloat(tape.hip) : null,
                    leg_right: tape.leg_right ? parseFloat(tape.leg_right) : null,
                    leg_left: tape.leg_left ? parseFloat(tape.leg_left) : null,
                };
            });
    }, [measurements, dateRange]);

    // Calculate stats for summary cards
    const stats = useMemo(() => {
        if (chartData.length < 2) return null;

        const first = chartData[0];
        const last = chartData[chartData.length - 1];

        const calcChange = (key) => {
            const firstVal = first[key];
            const lastVal = last[key];
            if (firstVal == null || lastVal == null) return null;
            return {
                value: lastVal,
                change: lastVal - firstVal,
                percent: ((lastVal - firstVal) / firstVal * 100).toFixed(1)
            };
        };

        return {
            weight: calcChange('weight'),
            body_fat_percent: calcChange('body_fat_percent'),
            muscle_mass: calcChange('muscle_mass'),
        };
    }, [chartData]);

    const toggleMetric = (metricId) => {
        setSelectedMetrics(prev =>
            prev.includes(metricId)
                ? prev.filter(m => m !== metricId)
                : [...prev, metricId]
        );
    };

    const currentCategoryMetrics = Object.entries(METRICS)
        .filter(([_, m]) => m.category === activeTab)
        .map(([id, m]) => ({ id, ...m }));

    if (measurements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-900/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <Activity className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-slate-300 mb-2">
                    Henüz Ölçüm Yok
                </h3>
                <p className="text-gray-500 dark:text-slate-500 max-w-md">
                    İlerlemenizi takip etmek için vücut ölçümlerinizi girmeye başlayın.
                    Sağ üstteki "Ölçüm Ekle" butonunu kullanabilirsiniz.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        label="Kilo"
                        value={stats.weight?.value}
                        unit="kg"
                        change={stats.weight?.change}
                        isInverse={true} // Weight down is good
                    />
                    <StatCard
                        label="Yağ Oranı"
                        value={stats.body_fat_percent?.value}
                        unit="%"
                        change={stats.body_fat_percent?.change}
                        isInverse={true}
                    />
                    <StatCard
                        label="Kas Kütlesi"
                        value={stats.muscle_mass?.value}
                        unit="kg"
                        change={stats.muscle_mass?.change}
                        isInverse={false} // Muscle up is good
                    />
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 p-4 rounded-xl border border-gray-700 dark:border-slate-700 shadow-lg">
                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => { setActiveTab('general'); setSelectedMetrics(['weight', 'body_fat_percent', 'muscle_mass']); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                            ${activeTab === 'general'
                                ? 'bg-white text-gray-900 shadow-lg'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                    >
                        <Activity size={16} />
                        Genel
                    </button>
                    <button
                        onClick={() => { setActiveTab('tape'); setSelectedMetrics(['chest', 'waist', 'arm_right']); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                            ${activeTab === 'tape'
                                ? 'bg-white text-gray-900 shadow-lg'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                    >
                        <Ruler size={16} />
                        Mezura
                    </button>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-white/30 cursor-pointer"
                    >
                        {DATE_RANGES.map(range => (
                            <option key={range.id} value={range.id} className="bg-gray-900 text-white">{range.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Metric Selection */}
            <div className="flex flex-wrap gap-2">
                {currentCategoryMetrics.map(metric => (
                    <button
                        key={metric.id}
                        onClick={() => toggleMetric(metric.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                            ${selectedMetrics.includes(metric.id)
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                            }`}
                    >
                        <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: metric.color }}></span>
                        {metric.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            {selectedMetrics.map(metricId => (
                                <linearGradient key={metricId} id={`gradient-${metricId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={METRICS[metricId]?.color || '#6366f1'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={METRICS[metricId]?.color || '#6366f1'} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            width={45}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                            }}
                            labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                            formatter={(value, name) => {
                                const metric = METRICS[name];
                                return [`${value} ${metric?.unit || ''}`, metric?.label || name];
                            }}
                        />
                        <Legend
                            formatter={(value) => METRICS[value]?.label || value}
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                        {selectedMetrics.map(metricId => (
                            <Area
                                key={metricId}
                                type="monotone"
                                dataKey={metricId}
                                stroke={METRICS[metricId]?.color || '#6366f1'}
                                strokeWidth={2}
                                fill={`url(#gradient-${metricId})`}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                                connectNulls
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="font-bold text-gray-800 dark:text-white">Son Ölçümler</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400">Tarih</th>
                                {selectedMetrics.slice(0, 4).map(metricId => (
                                    <th key={metricId} className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-slate-400">
                                        {METRICS[metricId]?.label}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-slate-400 w-20">
                                    İşlemler
                                </th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {chartData.slice(-10).reverse().map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">{row.fullDate}</td>
                                    {selectedMetrics.slice(0, 4).map(metricId => (
                                        <td key={metricId} className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                                            {row[metricId] != null ? `${row[metricId]} ${METRICS[metricId]?.unit || ''}` : '-'}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEdit && onEdit(row.originalData)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete && onDelete(row.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ label, value, unit, change, isInverse }) {
    if (value == null) return null;

    const isPositive = change > 0;
    const isGood = isInverse ? !isPositive : isPositive;
    const TrendIcon = change === 0 ? Minus : (isPositive ? TrendingUp : TrendingDown);

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
                    </p>
                </div>
                {change !== null && change !== 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                        ${isGood
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}
                    >
                        <TrendIcon size={12} />
                        {Math.abs(change).toFixed(1)}
                    </div>
                )}
            </div>
        </div>
    );
}
