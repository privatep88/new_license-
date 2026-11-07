import React, { useMemo, useState } from 'react';
import type { License, Contract, Procedure } from '../types';
import { RecordStatus, ContractType } from '../types';
import { DashboardIcon, LicenseIcon, ContractIcon, AgencyIcon, SupplierIcon, OtherTopicsIcon, ProcedureIcon, TrademarkIcon } from './icons/TabIcons';
import { formatCost, calculateRemainingDays, getStatusClass } from '../utils';
import { CheckIcon, ShieldIcon, ClipboardListIcon, SearchIcon } from './icons/ActionIcons';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area
} from 'recharts';

interface DashboardProps {
    commercialLicenses: License[];
    operationalLicenses: License[];
    civilDefenseCerts: License[];
    leaseContracts: Contract[];
    generalContracts: License[];
    specialAgencies: License[];
    trademarkCerts: License[];
    otherTopics: License[];
    procedures: Procedure[];
}

const COLORS = {
    active: '#10b981', // Emerald-500
    soon: '#f59e0b',   // Amber-500
    expired: '#ef4444', // Red-500
    blue: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f97316',
    cyan: '#06b6d4',
    slate: '#64748b'
};

const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export interface ExpiringItem {
    id: string;
    name: string;
    category: string;
    type: 'license' | 'contract';
    number: string;
    cost: number;
    expiryDate: string;
    status: RecordStatus;
    remainingDays: number | null;
}

export interface MonthForecast {
    monthIndex: number;
    year: number;
    month: number;
    label: string;
    shortLabel: string;
    totalCost: number;
    licensesCost: number;
    contractsCost: number;
    totalCount: number;
    licensesCount: number;
    contractsCount: number;
    items: ExpiringItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const itemPayload = payload[0]?.payload;
        const displayLabel = label || itemPayload?.name || '';
        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-100 shadow-xl rounded-xl text-right min-w-[170px] z-50">
                {displayLabel && <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2 text-sm">{displayLabel}</p>}
                <div className="space-y-1.5">
                    {payload.map((entry: any, index: number) => {
                        const count = entry.payload?.count;
                        const percentage = entry.payload?.percentage;
                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between gap-3 text-xs font-medium">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
                                        <span className="text-slate-600">{entry.name}</span>
                                    </span>
                                    <span className="font-bold font-mono text-sm text-slate-800">
                                        {typeof entry.value === 'number' && (entry.name.includes('تكلفة') || entry.dataKey === 'value')
                                            ? `${formatCost(entry.value)} AED` 
                                            : entry.value}
                                    </span>
                                </div>
                                {count !== undefined && (
                                    <div className="flex justify-between text-[11px] text-slate-500 pr-4">
                                        <span>عدد السجلات:</span>
                                        <span className="font-bold font-mono text-slate-700">{count}</span>
                                    </div>
                                )}
                                {percentage !== undefined && (
                                    <div className="flex justify-between text-[11px] text-slate-500 pr-4">
                                        <span>النسبة من الإجمالي:</span>
                                        <span className="font-bold font-mono text-blue-600">{percentage}%</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload as MonthForecast;
        if (!data) return null;
        return (
            <div className="bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl text-right min-w-[210px] z-50">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
                    <span className="text-[11px] font-medium text-slate-400">توقعات الاستحقاق</span>
                    <p className="font-bold text-amber-400 text-sm">{data.label}</p>
                </div>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-200">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                            <span>تكلفة الرخص ({data.licensesCount}):</span>
                        </span>
                        <span className="font-bold font-mono text-blue-300">{formatCost(data.licensesCost)} AED</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span>تكلفة العقود ({data.contractsCount}):</span>
                        </span>
                        <span className="font-bold font-mono text-amber-300">{formatCost(data.contractsCost)} AED</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-emerald-400 font-bold">
                        <span>إجمالي التكلفة المتوقعة:</span>
                        <span className="font-mono text-sm">{formatCost(data.totalCost)} AED</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-[11px] pt-0.5">
                        <span>إجمالي السجلات المستحقة:</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{data.totalCount} سجل</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({
    commercialLicenses,
    operationalLicenses,
    civilDefenseCerts,
    leaseContracts,
    generalContracts,
    specialAgencies,
    trademarkCerts,
    otherTopics,
    procedures
}) => {
    
    // Automatically get the current year and month
    const now = new Date();
    const currentYear = now.getFullYear();

    // Controls for the Expected 12-Month Costs Section
    const [filterType, setFilterType] = useState<'all' | 'licenses' | 'contracts'>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);

    const stats = useMemo(() => {
        const allLicenses = [
            ...commercialLicenses,
            ...operationalLicenses,
            ...civilDefenseCerts,
            ...generalContracts,
            ...specialAgencies,
            ...trademarkCerts,
            ...otherTopics
        ];

        // Combine all items that have status/dates
        const allItemsWithStatus = [...allLicenses, ...leaseContracts];
        
        // 1. Category Stats (Counts)
        const calculateCategoryStats = (items: (License | Contract)[]) => {
            const total = items.length;
            const active = items.filter(i => i.status === RecordStatus.Active).length;
            const soon = items.filter(i => i.status === RecordStatus.SoonToExpire).length;
            const expired = items.filter(i => i.status === RecordStatus.Expired).length;
            return { total, active, soon, expired };
        };

        // 2. Costs per Category (with strict Number conversion to handle string inputs safely)
        const catCosts = {
            commercial: commercialLicenses.reduce((sum, i) => sum + (Number(i.cost) || 0), 0),
            operational: operationalLicenses.reduce((sum, i) => sum + (Number(i.cost) || 0), 0),
            civilDefense: civilDefenseCerts.reduce((sum, i) => sum + (Number(i.cost) || 0), 0),
            lease: leaseContracts.reduce((sum, i) => sum + (Number(i.documentedCost) || 0) + (Number(i.internalCost) || 0), 0),
            general: generalContracts.reduce((sum, i) => sum + (Number(i.cost) || 0), 0),
            agency: specialAgencies.reduce((sum, i) => sum + (Number(i.cost) || 0), 0),
            trademark: trademarkCerts.reduce((sum, i) => sum + (Number(i.cost) || 0), 0),
            other: otherTopics.reduce((sum, i) => sum + (Number(i.cost) || 0), 0),
        };

        const totalCost = Object.values(catCosts).reduce((a, b) => a + b, 0);

        // Detailed category breakdown including both costs and counts for all lists
        const categoryBreakdown = [
            { id: 'commercial', name: 'الرخص التجارية', value: catCosts.commercial, count: commercialLicenses.length, fill: COLORS.blue },
            { id: 'operational', name: 'الرخص التشغيلية', value: catCosts.operational, count: operationalLicenses.length, fill: COLORS.cyan },
            { id: 'civilDefense', name: 'شهادات الدفاع المدني', value: catCosts.civilDefense, count: civilDefenseCerts.length, fill: COLORS.purple },
            { id: 'lease', name: 'العقود الايجارية', value: catCosts.lease, count: leaseContracts.length, fill: COLORS.pink },
            { id: 'general', name: 'عقود الموردين', value: catCosts.general, count: generalContracts.length, fill: COLORS.orange },
            { id: 'agency', name: 'الوكالات الخاصة', value: catCosts.agency, count: specialAgencies.length, fill: COLORS.slate },
            { id: 'trademark', name: 'العلامات التجارية', value: catCosts.trademark, count: trademarkCerts.length, fill: '#eab308' },
            { id: 'other', name: 'مواضيع أخرى', value: catCosts.other, count: otherTopics.length, fill: '#84cc16' },
        ];

        const totalCategoryCount = categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
        // Calculate totalRecords strictly based on actual existing records in the system
        const totalRecords = allItemsWithStatus.length;
        const activeCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Active).length;
        const soonCount = allItemsWithStatus.filter(i => i.status === RecordStatus.SoonToExpire).length;
        const expiredCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Expired).length;
        
        const complianceBase = allItemsWithStatus.length;
        const complianceRate = complianceBase > 0 ? Math.round((activeCount / complianceBase) * 100) : 0;

        // 3. Expiry Timeline (Per Current Year automatically)
        const expiryTimelineData = [];
        
        for (let m = 0; m < 12; m++) {
            const monthName = ARABIC_MONTHS[m];
            
            const count = allItemsWithStatus.filter(item => {
                const dateStr = ('expiryDate' in item ? (item as License).expiryDate : '') || (item as Contract).documentedExpiryDate || (item as Contract).internalExpiryDate;
                if (!dateStr) return false;
                const parts = dateStr.split('-');
                if (parts.length !== 3) return false;
                const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                return d.getFullYear() === currentYear && d.getMonth() === m;
            }).length;
            
            expiryTimelineData.push({ name: monthName, count: count });
        }

        return {
            totalRecords,
            complianceRate,
            activeCount,
            soonCount,
            expiredCount,
            totalCost,
            totalCategoryCount,
            categoryBreakdown,
            categoryCosts: catCosts,
            expiryTimeline: expiryTimelineData,
            categories: {
                commercial: calculateCategoryStats(commercialLicenses),
                operational: calculateCategoryStats(operationalLicenses),
                civilDefense: calculateCategoryStats(civilDefenseCerts),
                lease: calculateCategoryStats(leaseContracts),
                general: calculateCategoryStats(generalContracts),
                agency: calculateCategoryStats(specialAgencies),
                trademark: calculateCategoryStats(trademarkCerts),
                other: calculateCategoryStats(otherTopics),
            }
        };
    }, [commercialLicenses, operationalLicenses, civilDefenseCerts, leaseContracts, generalContracts, specialAgencies, trademarkCerts, otherTopics, procedures, currentYear]);

    // 4. Expected Costs (Next 12 Months) - Financial Distribution Engine
    const expected12MonthsForecast = useMemo(() => {
        const currentDate = new Date();
        const curY = currentDate.getFullYear();
        const curM = currentDate.getMonth();

        // Build the 12 upcoming consecutive months starting from the current month
        const months: MonthForecast[] = [];
        for (let i = 0; i < 12; i++) {
            const targetDate = new Date(curY, curM + i, 1);
            const y = targetDate.getFullYear();
            const m = targetDate.getMonth();
            months.push({
                monthIndex: i,
                year: y,
                month: m,
                label: `${ARABIC_MONTHS[m]} ${y}`,
                shortLabel: `${ARABIC_MONTHS[m]}`,
                totalCost: 0,
                licensesCost: 0,
                contractsCost: 0,
                totalCount: 0,
                licensesCount: 0,
                contractsCount: 0,
                items: []
            });
        }

        // Helper to check and assign expiring items to the matching forecast month
        const processItem = (
            rawDate: string | undefined, 
            cost: number, 
            item: any, 
            category: string, 
            type: 'license' | 'contract',
            overrideName?: string
        ) => {
            if (!rawDate) return;
            const parts = rawDate.split(/[-/]/);
            if (parts.length !== 3) return;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            if (isNaN(y) || isNaN(m)) return;

            const targetMonth = months.find(mo => mo.year === y && mo.month === m);
            if (targetMonth) {
                const numericCost = Number(cost) || 0;
                const expiringItem: ExpiringItem = {
                    id: `${type}-${item.id || item.number || Math.random()}-${rawDate}-${category}`,
                    name: overrideName || item.name || 'بدون اسم',
                    category,
                    type,
                    number: item.number || item.licenseNumber || '-',
                    cost: numericCost,
                    expiryDate: rawDate,
                    status: item.status || RecordStatus.Active,
                    remainingDays: calculateRemainingDays(rawDate)
                };
                targetMonth.items.push(expiringItem);
                targetMonth.totalCost += numericCost;
                targetMonth.totalCount += 1;
                if (type === 'license') {
                    targetMonth.licensesCost += numericCost;
                    targetMonth.licensesCount += 1;
                } else {
                    targetMonth.contractsCost += numericCost;
                    targetMonth.contractsCount += 1;
                }
            }
        };

        // Process Licenses
        commercialLicenses.forEach(lic => processItem(lic.expiryDate, lic.cost, lic, 'رخصة تجارية', 'license'));
        operationalLicenses.forEach(lic => processItem(lic.expiryDate, lic.cost, lic, 'رخصة تشغيلية', 'license'));
        civilDefenseCerts.forEach(lic => processItem(lic.expiryDate, lic.cost, lic, 'دفاع مدني', 'license'));
        specialAgencies.forEach(lic => processItem(lic.expiryDate, lic.cost, lic, 'وكالة خاصة', 'license'));
        trademarkCerts.forEach(lic => processItem(lic.expiryDate, lic.cost, lic, 'علامة تجارية', 'license'));
        otherTopics.forEach(lic => processItem(lic.expiryDate, lic.cost, lic, 'مواضيع أخرى', 'license'));

        // Process Supplier Contracts (General Contracts) -> Classified as Contract
        generalContracts.forEach(gc => processItem(gc.expiryDate, gc.cost, gc, 'عقد توريد', 'contract'));

        // Process Lease Contracts -> Classified as Contract
        leaseContracts.forEach(lc => {
            if (lc.contractType === ContractType.Documented || lc.contractType === ContractType.DocumentedAndInternal) {
                processItem(
                    lc.documentedExpiryDate,
                    lc.documentedCost || 0,
                    lc,
                    'عقد إيجار (موثق)',
                    'contract',
                    `${lc.name} (توثيق)`
                );
            }
            if (lc.contractType === ContractType.Internal || lc.contractType === ContractType.DocumentedAndInternal) {
                processItem(
                    lc.internalExpiryDate,
                    lc.internalCost || 0,
                    lc,
                    'عقد إيجار (بيني)',
                    'contract',
                    `${lc.name} (بيني)`
                );
            }
        });

        // Global 12-month aggregations
        const totalExpectedCost = months.reduce((sum, m) => sum + m.totalCost, 0);
        const totalLicensesCost = months.reduce((sum, m) => sum + m.licensesCost, 0);
        const totalContractsCost = months.reduce((sum, m) => sum + m.contractsCost, 0);
        const totalRecordsDue = months.reduce((sum, m) => sum + m.totalCount, 0);
        const totalLicensesDue = months.reduce((sum, m) => sum + m.licensesCount, 0);
        const totalContractsDue = months.reduce((sum, m) => sum + m.contractsCount, 0);
        const averageMonthlyCost = Math.round(totalExpectedCost / 12);

        // Find peak month
        let peakMonth = months[0];
        for (const m of months) {
            if (m.totalCost > peakMonth.totalCost) {
                peakMonth = m;
            }
        }

        return {
            months,
            totalExpectedCost,
            totalLicensesCost,
            totalContractsCost,
            totalRecordsDue,
            totalLicensesDue,
            totalContractsDue,
            averageMonthlyCost,
            peakMonth: peakMonth && peakMonth.totalCost > 0 ? peakMonth : null
        };
    }, [commercialLicenses, operationalLicenses, civilDefenseCerts, leaseContracts, generalContracts, specialAgencies, trademarkCerts, otherTopics]);

    // Filtered forecast data for presentation based on active filterType
    const filteredForecastMonths = useMemo(() => {
        return expected12MonthsForecast.months.map(m => {
            let activeCost = m.totalCost;
            let activeCount = m.totalCount;
            let activeItems = m.items;

            if (filterType === 'licenses') {
                activeCost = m.licensesCost;
                activeCount = m.licensesCount;
                activeItems = m.items.filter(i => i.type === 'license');
            } else if (filterType === 'contracts') {
                activeCost = m.contractsCost;
                activeCount = m.contractsCount;
                activeItems = m.items.filter(i => i.type === 'contract');
            }

            return {
                ...m,
                activeCost,
                activeCount,
                activeItems
            };
        });
    }, [expected12MonthsForecast.months, filterType]);

    const activeTotalCost = useMemo(() => {
        if (filterType === 'licenses') return expected12MonthsForecast.totalLicensesCost;
        if (filterType === 'contracts') return expected12MonthsForecast.totalContractsCost;
        return expected12MonthsForecast.totalExpectedCost;
    }, [expected12MonthsForecast, filterType]);

    const activeTotalCount = useMemo(() => {
        if (filterType === 'licenses') return expected12MonthsForecast.totalLicensesDue;
        if (filterType === 'contracts') return expected12MonthsForecast.totalContractsDue;
        return expected12MonthsForecast.totalRecordsDue;
    }, [expected12MonthsForecast, filterType]);

    const selectedMonth = selectedMonthIndex !== null ? filteredForecastMonths[selectedMonthIndex] : null;

    // Chart Data Preparation for Cost Distribution by Category
    const pieData = [
        { name: 'نشط', value: stats.activeCount, color: COLORS.active },
        { name: 'قارب على الانتهاء', value: stats.soonCount, color: COLORS.soon },
        { name: 'منتهي', value: stats.expiredCount, color: COLORS.expired },
    ];

    const costData = stats.categoryBreakdown
        .filter(item => item.value > 0)
        .map(item => ({
            ...item,
            percentage: stats.totalCost > 0 ? ((item.value / stats.totalCost) * 100).toFixed(1) : '0'
        }))
        .sort((a, b) => b.value - a.value);

    // List of categories sorted to show active items first, then others
    const sortedCategoryList = useMemo(() => {
        return [...stats.categoryBreakdown].sort((a, b) => {
            if (b.value !== a.value) return b.value - a.value;
            return b.count - a.count;
        });
    }, [stats.categoryBreakdown]);

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            
            {/* 1. Hero Section */}
            <div className="bg-[#091526] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-white gap-6">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#eab308] opacity-5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
                
                <div className="z-10 text-center md:text-right w-full md:w-auto">
                    <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-semibold mb-3">
                        نظام إدارة الرخص والعقود المؤسسي
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                        لوحة المعلومات والإحصائيات
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl">
                        نظرة شمولية وتفاعلية على مؤشرات الامتثال، الميزانيات، التكاليف المتوقعة، والتوزيع المالي لتجديد الرخص والعقود.
                    </p>
                </div>

                <div className="z-10 flex gap-3 sm:gap-4 w-full md:w-auto justify-center md:justify-end">
                    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center flex-1 md:flex-initial min-w-[120px] sm:min-w-[140px]">
                        <span className="text-slate-400 text-xs block mb-1">نسبة الامتثال الكلية</span>
                        <span className="text-2xl sm:text-3xl font-black text-green-400 font-mono">{stats.complianceRate}%</span>
                    </div>
                    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center flex-1 md:flex-initial min-w-[120px] sm:min-w-[140px]">
                        <span className="text-slate-400 text-xs block mb-1">إجمالي الميزانية</span>
                        <span className="text-lg sm:text-2xl font-black text-white font-mono">{formatCost(stats.totalCost)}</span>
                        <span className="text-[10px] text-yellow-400 font-semibold block mt-0.5">درهم إماراتي</span>
                    </div>
                </div>
            </div>

            {/* 2. Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <DashboardIcon />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{stats.totalRecords}</h3>
                        <p className="text-slate-500 font-bold text-sm">إجمالي السجلات الحالية</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-red-500"></div>
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600 shadow-sm group-hover:scale-110 transition-transform">
                            <ShieldIcon />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{stats.expiredCount}</h3>
                        <p className="text-red-600 font-bold text-sm">سجلات منتهية</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-yellow-500"></div>
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600 shadow-sm group-hover:scale-110 transition-transform">
                            <ClipboardListIcon />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{stats.soonCount}</h3>
                        <p className="text-yellow-600 font-bold text-sm">قاربت على الانتهاء</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-green-500"></div>
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                            <CheckIcon />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{stats.activeCount}</h3>
                        <p className="text-green-600 font-bold text-sm">سجلات نشطة</p>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Analytics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Cost Distribution Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    {/* Header with Title, Live Auto-Calculation Badge & Real-Time Total Metrics */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-800">التكلفة حسب الفئة</h3>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    حساب تلقائي مباشر
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">توزيع واحتساب التكاليف التقديرية لكافة القوائم تلقائياً (درهم إماراتي)</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs self-stretch sm:self-auto justify-between sm:justify-start">
                            <div className="text-right">
                                <span className="text-[10px] text-slate-500 block font-medium">مجموع التكلفة الإجمالية</span>
                                <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                                    {formatCost(stats.totalCost)} <span className="text-xs font-bold text-slate-500">AED</span>
                                </span>
                            </div>
                            <div className="h-7 w-px bg-slate-200"></div>
                            <div className="text-center">
                                <span className="text-[10px] text-slate-500 block font-medium">إجمالي السجلات</span>
                                <span className="text-sm sm:text-base font-black text-blue-600 font-mono">
                                    {stats.totalCategoryCount}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col xl:flex-row gap-6 items-start flex-grow">
                        {/* Chart and Analytical Mini-Cards */}
                        <div className="flex-1 w-full flex flex-col justify-between">
                            <div className="h-[280px] sm:h-[340px] md:h-[360px] w-full">
                                {costData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={costData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barCategoryGap={16}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide reversed={true} />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                hide
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', opacity: 0.6}} />
                                            <Bar dataKey="value" name="التكلفة" radius={[4, 0, 0, 4]} barSize={18} background={{ fill: '#f8fafc', radius: 4 }}>
                                                {costData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                        لا توجد تكاليف مسجلة لعرض الرسم البياني
                                    </div>
                                )}
                            </div>

                            {/* Summary Mini Cards under the chart */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                                    <span className="text-[11px] text-blue-700 block font-medium">أعلى فئة من حيث التكلفة</span>
                                    <span className="text-sm font-bold text-slate-800 truncate block mt-0.5" title={costData[0]?.name || '-'}>
                                        {costData[0] ? `${costData[0].name} (${formatCost(costData[0].value)} AED)` : 'لا توجد تكاليف'}
                                    </span>
                                </div>
                                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                    <span className="text-[11px] text-emerald-700 block font-medium">متوسط التكلفة لكل سجل</span>
                                    <span className="text-sm font-bold text-slate-800 block mt-0.5 font-mono">
                                        {stats.totalCategoryCount > 0 
                                            ? `${formatCost(Math.round(stats.totalCost / stats.totalCategoryCount))} AED` 
                                            : '0 AED'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Values List with Grand Total Row - Full display without scroll */}
                        <div className="w-full xl:w-80 flex flex-col gap-2 border-t xl:border-t-0 xl:border-r rtl:xl:border-r-0 rtl:xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pr-4 rtl:xl:pr-0 rtl:xl:pl-4">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-2 pb-1 border-b border-slate-100">
                                <span>الفئة والعدد</span>
                                <span>التكلفة (درهم)</span>
                            </div>

                            <div className="space-y-2.5">
                                {sortedCategoryList.map((item, index) => {
                                    const percentage = stats.totalCost > 0 ? ((item.value / stats.totalCost) * 100) : 0;
                                    return (
                                        <div key={index} className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 hover:bg-slate-100/70 transition-all group">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}></span>
                                                    <span className="text-xs text-slate-700 font-semibold truncate" title={item.name}>{item.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                                                    {formatCost(item.value)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium px-0.5">
                                                <span className="font-semibold text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded text-[10px]">{item.count} سجل</span>
                                                <span className="font-semibold text-slate-600">{percentage > 0 ? `${percentage.toFixed(1)}%` : '0%'}</span>
                                            </div>
                                            {/* Progress mini bar */}
                                            <div className="h-1 w-full bg-slate-200/60 rounded-full mt-1.5 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-500" 
                                                    style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: item.fill }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Total Cost Summary Line */}
                            <div className="mt-2 p-3.5 bg-gradient-to-br from-[#091526] via-[#10243d] to-[#091526] text-white rounded-xl shadow-md border border-slate-700/80">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className="text-xs font-bold text-white tracking-wide">التكلفة الإجمالية للقوائم</span>
                                    </div>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                        محسوب تلقائياً
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between pt-1.5 border-t border-slate-700/60">
                                    <span className="text-[11px] text-slate-300">
                                        {stats.totalCategoryCount} سجل في 8 فئات
                                    </span>
                                    <div className="flex items-baseline gap-1 text-emerald-400">
                                        <span className="text-base font-black font-mono tracking-tight">{formatCost(stats.totalCost)}</span>
                                        <span className="text-[11px] font-bold text-emerald-300">درهم</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Distribution Pie */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                     <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">حالة الامتثال</h3>
                        <p className="text-xs text-slate-500">نسبة السجلات النشطة مقابل المنتهية</p>
                    </div>
                    <div className="flex-grow flex items-center justify-center relative">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData.filter(d => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={5}
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-slate-400 text-xs font-medium mb-1">الإجمالي</p>
                            <span className="text-3xl font-black text-slate-800">{stats.activeCount + stats.soonCount + stats.expiredCount}</span>
                        </div>
                    </div>
                    
                     <div className="space-y-3 mt-4">
                        {pieData.map((entry, index) => (
                             <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                                    <span className="text-sm font-bold text-slate-700">{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-lg font-black text-slate-800">{entry.value}</span>
                                     <span className="text-xs text-slate-400 font-medium">سجل</span>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 4. Expected Costs (Next 12 Months) - Financial Distribution Section */}
            {/* بدلاً عن بطاقات تفصيلية: التكاليف المتوقعة (12 شهراً القادمة) والتوزيع المالي المتوقع لتجديد الرخص والعقود */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200 shadow-sm space-y-6">
                
                {/* Section Header with Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl text-white shadow-md shadow-amber-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                                التكاليف المتوقعة (12 شهراً القادمة)
                            </h2>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                توزيع التدفقات المالية للتجديد
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                            التوزيع والتقدير المالي المتوقع لتكاليف تجديد الرخص التجارية والتشغيلية والعقود الإيجارية وعقود الموردين بناءً على تواريخ الانتهاء المحددة لكل سجل خلال الاثني عشر شهراً القادمة.
                        </p>
                    </div>

                    {/* Filter and View Mode Toggles */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                        {/* Filter by Category Type */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    filterType === 'all' 
                                        ? 'bg-[#091526] text-white shadow-sm' 
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                الكل (رخص وعقود)
                            </button>
                            <button
                                onClick={() => setFilterType('licenses')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    filterType === 'licenses' 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                الرخص فقط
                            </button>
                            <button
                                onClick={() => setFilterType('contracts')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    filterType === 'contracts' 
                                        ? 'bg-amber-600 text-white shadow-sm' 
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                العقود فقط
                            </button>
                        </div>

                        {/* View Mode Switcher */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                            <button
                                onClick={() => setViewMode('cards')}
                                title="عرض البطاقات والمخطط"
                                className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                    viewMode === 'cards' 
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="hidden sm:inline">بطاقات</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                title="عرض جدول تفصيلي"
                                className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                    viewMode === 'table' 
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="hidden sm:inline">جدول تفصيلي</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 Executive Financial Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total 12-Month Expected Cost */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0c1a2e] to-[#091526] text-white shadow-md border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                        <span className="text-[11px] font-bold text-amber-400 block mb-1">
                            {filterType === 'licenses' ? 'إجمالي تكلفة تجديد الرخص' : filterType === 'contracts' ? 'إجمالي تكلفة تجديد العقود' : 'إجمالي الميزانية المتوقعة (12 شهراً)'}
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                                {formatCost(activeTotalCost)}
                            </span>
                            <span className="text-xs font-bold text-amber-300">AED</span>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                            <span>نسبة من إجمالي النظام:</span>
                            <span className="font-bold font-mono text-emerald-400">
                                {stats.totalCost > 0 ? ((activeTotalCost / stats.totalCost) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Total Items Due */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                            السجلات المستحقة للتجديد (12 شهراً)
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                                {activeTotalCount}
                            </span>
                            <span className="text-xs font-bold text-slate-500">سجل مستحق</span>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                            <span>التفصيل:</span>
                            <span className="font-medium text-slate-700">
                                {expected12MonthsForecast.totalLicensesDue} رخص | {expected12MonthsForecast.totalContractsDue} عقود
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Monthly Average */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                            متوسط التكلفة الشهرية المتوقعة
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                                {formatCost(Math.round(activeTotalCost / 12))}
                            </span>
                            <span className="text-xs font-bold text-slate-500">AED / شهر</span>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                            <span>معدل السيولة الشهرية:</span>
                            <span className="font-medium text-emerald-700">معدل تخطيط مالي</span>
                        </div>
                    </div>

                    {/* Card 4: Peak Expense Month */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs relative overflow-hidden group">
                        <span className="text-[11px] font-bold text-amber-800 block mb-1">
                            شهر ذروة الاستحقاق المالي
                        </span>
                        {expected12MonthsForecast.peakMonth ? (
                            <>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-lg sm:text-xl font-black text-slate-900">
                                        {expected12MonthsForecast.peakMonth.label}
                                    </span>
                                </div>
                                <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900">
                                    <span className="font-semibold">أعلى التزام:</span>
                                    <span className="font-mono font-bold text-amber-700">
                                        {formatCost(expected12MonthsForecast.peakMonth.totalCost)} AED
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="mt-2 text-slate-400 text-xs">لا توجد مصاريف متوقعة مسجلة</div>
                        )}
                    </div>
                </div>

                {/* Visual Chart: 12-Month Financial Distribution */}
                <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-6 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                المسار البياني للتوزيع المالي للتجديدات (شهرياً)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                انقر على أي شهر لاستعراض تفاصيل السجلات والرخص والعقود المستحقة فيه
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-blue-700">
                                <span className="w-3 h-3 rounded-md bg-blue-500"></span>
                                تكلفة الرخص
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-700">
                                <span className="w-3 h-3 rounded-md bg-amber-500"></span>
                                تكلفة العقود
                            </span>
                        </div>
                    </div>

                    <div className="h-64 sm:h-72 w-full" style={{ direction: 'ltr' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={filteredForecastMonths} 
                                margin={{ top: 15, right: 10, left: 10, bottom: 25 }}
                                onClick={(state) => {
                                    if (state && state.activeTooltipIndex !== undefined) {
                                        setSelectedMonthIndex(state.activeTooltipIndex);
                                    }
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="shortLabel" 
                                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickLine={false}
                                    interval={0}
                                    angle={-25}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    tickFormatter={(val) => {
                                        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                                        return String(val);
                                    }}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomForecastTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.8 }} />
                                {filterType !== 'contracts' && (
                                    <Bar 
                                        dataKey="licensesCost" 
                                        name="تكلفة الرخص" 
                                        stackId="a" 
                                        fill="#3b82f6" 
                                        radius={[0, 0, 0, 0]} 
                                        maxBarSize={36} 
                                    />
                                )}
                                {filterType !== 'licenses' && (
                                    <Bar 
                                        dataKey="contractsCost" 
                                        name="تكلفة العقود" 
                                        stackId="a" 
                                        fill="#f59e0b" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={36} 
                                    />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 12-Month Cards Grid (View Mode: Cards) */}
                {viewMode === 'cards' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                            <span>قائمة الأشهر الاثني عشر (انقر على الشهر لعرض السجلات التفصيلية):</span>
                            <span>{filteredForecastMonths.filter(m => m.activeCount > 0).length} أشهر بها استحقاقات</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                            {filteredForecastMonths.map((m, idx) => {
                                const isSelected = selectedMonthIndex === idx;
                                const isPeak = expected12MonthsForecast.peakMonth?.monthIndex === m.monthIndex && m.activeCost > 0;
                                const percentageOfTotal = activeTotalCost > 0 ? (m.activeCost / activeTotalCost) * 100 : 0;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedMonthIndex(isSelected ? null : idx)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                                            isSelected 
                                                ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-400/40' 
                                                : m.activeCost > 0 
                                                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs' 
                                                    : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60 opacity-80'
                                        }`}
                                    >
                                        {/* Top Tag & Month Label */}
                                        <div>
                                            <div className="flex items-center justify-between gap-1 mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${m.activeCost > 0 ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        {m.label}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    شهر {idx + 1}
                                                </span>
                                            </div>

                                            {/* Cost Display */}
                                            <div className="my-2">
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-xl font-black font-mono ${m.activeCost > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {formatCost(m.activeCost)}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-500">AED</span>
                                                </div>
                                            </div>

                                            {/* Progress bar of month contribution */}
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden my-2.5">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isPeak ? 'bg-amber-500' : 'bg-blue-600'}`}
                                                    style={{ width: `${Math.min(percentageOfTotal, 100)}%` }}
                                                />
                                            </div>

                                            {/* Badges and breakdown */}
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                                <span className={`px-2 py-0.5 rounded font-bold ${m.activeCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                                                    {m.activeCount > 0 ? `${m.activeCount} سجلات` : 'لا توجد مستحقات'}
                                                </span>
                                                <span className="font-medium text-slate-600">
                                                    {percentageOfTotal > 0 ? `${percentageOfTotal.toFixed(1)}%` : '0%'}
                                                </span>
                                            </div>

                                            {/* Licenses vs Contracts Mini Breakdown */}
                                            {m.activeCost > 0 && filterType === 'all' && (
                                                <div className="mt-2 text-[10px] text-slate-600 space-y-0.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    {m.licensesCost > 0 && (
                                                        <div className="flex justify-between items-center text-blue-700">
                                                            <span>رخص ({m.licensesCount}):</span>
                                                            <span className="font-mono font-bold">{formatCost(m.licensesCost)} AED</span>
                                                        </div>
                                                    )}
                                                    {m.contractsCost > 0 && (
                                                        <div className="flex justify-between items-center text-amber-700">
                                                            <span>عقود ({m.contractsCount}):</span>
                                                            <span className="font-mono font-bold">{formatCost(m.contractsCost)} AED</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action link */}
                                        <div className="mt-3 pt-2 text-center">
                                            <button
                                                type="button"
                                                className={`w-full py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                                    isSelected 
                                                        ? 'bg-blue-600 text-white' 
                                                        : m.activeCount > 0 
                                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                                                            : 'text-slate-400 cursor-default'
                                                }`}
                                            >
                                                {m.activeCount > 0 ? (isSelected ? 'إخفاء التفاصيل' : 'استعراض البنود') : 'لا توجد سجلات'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Detailed Financial Table (View Mode: Table) */}
                {viewMode === 'table' && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                        <table className="min-w-full divide-y divide-slate-200 text-right text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-bold">
                                <tr>
                                    <th className="px-4 py-3.5">الشهر والسنة</th>
                                    <th className="px-3 py-3.5 text-center">الترتيب</th>
                                    <th className="px-4 py-3.5 text-center">عدد الرخص</th>
                                    <th className="px-4 py-3.5">تكلفة الرخص (AED)</th>
                                    <th className="px-4 py-3.5 text-center">عدد العقود</th>
                                    <th className="px-4 py-3.5">تكلفة العقود (AED)</th>
                                    <th className="px-4 py-3.5">إجمالي الشهر (AED)</th>
                                    <th className="px-4 py-3.5 text-center">النسبة</th>
                                    <th className="px-4 py-3.5 text-center">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredForecastMonths.map((m, idx) => {
                                    const percentageOfTotal = activeTotalCost > 0 ? (m.activeCost / activeTotalCost) * 100 : 0;
                                    const isSelected = selectedMonthIndex === idx;

                                    return (
                                        <tr 
                                            key={idx} 
                                            className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/60' : ''}`}
                                        >
                                            <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${m.activeCost > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                    <span>{m.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center text-slate-500 font-mono font-medium">
                                                شهر {idx + 1}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-blue-600">
                                                {m.licensesCount}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                {formatCost(m.licensesCost)}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-amber-600">
                                                {m.contractsCount}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                {formatCost(m.contractsCost)}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-black text-slate-900 bg-slate-50/60">
                                                {formatCost(m.activeCost)}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-slate-600">
                                                {percentageOfTotal.toFixed(1)}%
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setSelectedMonthIndex(isSelected ? null : idx)}
                                                    disabled={m.activeCount === 0}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                        m.activeCount === 0 
                                                            ? 'text-slate-300 cursor-not-allowed' 
                                                            : isSelected 
                                                                ? 'bg-blue-600 text-white shadow-xs' 
                                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {isSelected ? 'إخفاء' : 'عرض'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-slate-900 text-white font-bold">
                                <tr>
                                    <td className="px-4 py-3.5 text-amber-400">الإجمالي (12 شهراً)</td>
                                    <td className="px-3 py-3.5 text-center text-slate-400">12 شهر</td>
                                    <td className="px-4 py-3.5 text-center font-mono text-blue-300">
                                        {expected12MonthsForecast.totalLicensesDue}
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-blue-300">
                                        {formatCost(expected12MonthsForecast.totalLicensesCost)}
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-mono text-amber-300">
                                        {expected12MonthsForecast.totalContractsDue}
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-amber-300">
                                        {formatCost(expected12MonthsForecast.totalContractsCost)}
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-lg font-black text-emerald-400">
                                        {formatCost(expected12MonthsForecast.totalExpectedCost)}
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-mono text-slate-300">100%</td>
                                    <td className="px-4 py-3.5 text-center text-slate-400">-</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* Selected Month Details Flyout / Panel */}
                {selectedMonth && (
                    <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 rounded-2xl border-2 border-blue-200 shadow-md animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-blue-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                                        تفاصيل مستحقات التجديد لشهر {selectedMonth.label}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    قائمة السجلات والرخص والعقود الواجب تجديدها في هذا الشهر وتكلفتها التقديرية
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right bg-white px-3.5 py-1.5 rounded-xl border border-blue-200 shadow-xs">
                                    <span className="text-[10px] text-slate-500 block">إجمالي تكلفة الشهر</span>
                                    <span className="text-base font-black font-mono text-blue-700">
                                        {formatCost(selectedMonth.activeCost)} AED
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedMonthIndex(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                                    title="إغلاق التفاصيل"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {selectedMonth.activeItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {selectedMonth.activeItems.map((item, i) => (
                                    <div 
                                        key={item.id || i}
                                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    item.type === 'contract' 
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                }`}>
                                                    {item.category}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusClass(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                                                {item.name}
                                            </h4>
                                            <div className="text-[11px] text-slate-500 font-mono mb-3">
                                                رقم السجل: {item.number}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">تاريخ الانتهاء</span>
                                                <span className="text-xs font-mono font-bold text-slate-700">
                                                    {item.expiryDate}
                                                </span>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-[10px] text-slate-400 block">تكلفة التجديد</span>
                                                <span className="text-sm font-black font-mono text-emerald-600">
                                                    {formatCost(item.cost)} <span className="text-[10px] font-bold text-slate-500">AED</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
                                لا توجد سجلات مستحقة للتجديد في هذا الشهر بناءً على الفلتر المختار
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 5. Expiry Timeline (Full Width) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">الجدول الزمني للانتهاء</h3>
                        <p className="text-xs text-slate-500">توقع عدد السجلات المنتهية لعام {currentYear}</p>
                    </div>
                </div>
                
                <div className="h-64 w-full" style={{ direction: 'ltr' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.expiryTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                axisLine={false} 
                                tickLine={false} 
                                interval={0}
                                reversed={true}
                            />
                            <YAxis hide />
                            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                name="عدد السجلات" 
                                stroke="#f59e0b" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                        {stats.expiryTimeline.map((item, index) => (
                            <div key={index} className={`flex flex-col items-center p-2.5 sm:p-3 rounded-xl border transition-all ${item.count > 0 ? 'bg-orange-50 border-orange-100 shadow-xs scale-102' : 'bg-slate-50/50 border-slate-100 opacity-70'}`}>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{item.name}</span>
                                <span className={`text-lg sm:text-xl font-black ${item.count > 0 ? 'text-orange-500' : 'text-slate-300'}`}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
