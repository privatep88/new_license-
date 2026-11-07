
import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import type { License, Contract, RecordDataType, RecordType } from '../types';
import { RecordStatus } from '../types';
import { AllRecordsIcon } from './icons/TabIcons';
import { CheckIcon, ClipboardListIcon } from './icons/ActionIcons';
import { formatCost, calculateRemainingDays, getStatusWeight } from '../utils';

interface AllRecordsManagementProps {
    commercialLicenses: License[];
    operationalLicenses: License[];
    civilDefenseCerts: License[];
    leaseContracts: Contract[];
    generalContracts: License[];
    specialAgencies: License[];
    trademarkCerts: License[];
    otherTopics: License[];
    onEdit: (item: RecordType, type: RecordDataType) => void;
    onDelete: (item: RecordType, type: RecordDataType) => void;
}

// Unified Record Type that allows for properties from both Licenses and Contracts
interface UnifiedRecord {
    id: number;
    uniqueKey?: string;
    name: string;
    number: string;
    status: RecordStatus;
    cost: number;
    expiryDate: string; // Unified date field
    notes?: string;
    attachments?: any[];
    
    // Metadata
    originalType: RecordDataType;
    recordTypeLabel: string;
    displayCost: number;
    originalRecord: RecordType;
    subDetail?: string; 
}

const AllRecordsManagement: React.FC<AllRecordsManagementProps> = ({
    commercialLicenses,
    operationalLicenses,
    civilDefenseCerts,
    leaseContracts,
    generalContracts,
    specialAgencies,
    trademarkCerts,
    otherTopics,
    onEdit,
    onDelete
}) => {
    // Merge and normalize data accurately
    const unifiedData: UnifiedRecord[] = useMemo(() => {
        // Helper for standard licenses
        const mapLicense = (list: License[], type: RecordDataType, label: string, extraInfoField?: keyof License): UnifiedRecord[] => 
            list.map(item => ({
                id: item.id,
                uniqueKey: `${type}-${item.id}`,
                name: item.name,
                number: item.number,
                status: item.status,
                expiryDate: item.expiryDate,
                cost: item.cost,
                notes: item.notes,
                attachments: item.attachments,
                
                originalType: type,
                recordTypeLabel: label,
                displayCost: item.cost,
                originalRecord: item,
                subDetail: extraInfoField && item[extraInfoField] ? String(item[extraInfoField]) : undefined
            }));

        // Helper for contracts (Complex mapping)
        const mapContracts = (list: Contract[], type: RecordDataType, label: string): UnifiedRecord[] => 
            list.map(item => ({
                id: item.id,
                uniqueKey: `${type}-${item.id}`,
                name: item.name,
                number: item.number,
                status: item.status, 
                // Logic: Prefer Documented Expiry, fallback to Internal. This ensures we always have a date for sorting/filtering.
                expiryDate: item.documentedExpiryDate || item.internalExpiryDate, 
                // Logic: Sum costs for total value
                cost: (item.documentedCost || 0) + (item.internalCost || 0),
                notes: item.notes,
                attachments: item.attachments,
                
                originalType: type,
                recordTypeLabel: label,
                displayCost: (item.documentedCost || 0) + (item.internalCost || 0),
                originalRecord: item,
                subDetail: item.contractType // Show Contract Type (Documented/Internal) as detail
            }));

        const allData = [
            ...mapLicense(commercialLicenses, 'commercialLicense', 'رخصة تجارية'),
            ...mapLicense(operationalLicenses, 'operationalLicense', 'رخصة تشغيلية'),
            ...mapLicense(civilDefenseCerts, 'civilDefenseCert', 'دفاع مدني'),
            ...mapContracts(leaseContracts, 'leaseContract', 'عقد إيجار'),
            ...mapLicense(generalContracts, 'generalContract', 'عقد موردين', 'renewalType'), // Show Renewal Type
            ...mapLicense(specialAgencies, 'specialAgency', 'وكالة خاصة'),
            ...mapLicense(trademarkCerts, 'trademarkCert', 'علامة تجارية', 'registrationDate'), // Show Registration Date if needed
            ...mapLicense(otherTopics, 'otherTopic', 'موضوع آخر'),
        ];

        return allData;

    }, [commercialLicenses, operationalLicenses, civilDefenseCerts, leaseContracts, generalContracts, specialAgencies, trademarkCerts, otherTopics]);

    // Calculate Statistics based on the Unified Data
    const stats = useMemo(() => {
        return {
            all: unifiedData.length,
            active: unifiedData.filter(i => i.status === RecordStatus.Active).length,
            soon: unifiedData.filter(i => i.status === RecordStatus.SoonToExpire).length,
            expired: unifiedData.filter(i => i.status === RecordStatus.Expired).length,
        };
    }, [unifiedData]);

    // Filter "Soon To Expire" records
    const soonToExpireData = useMemo(() => {
        return unifiedData.filter(item => item.status === RecordStatus.SoonToExpire);
    }, [unifiedData]);

    // Filter "Expired" records
    const expiredData = useMemo(() => {
        return unifiedData.filter(item => item.status === RecordStatus.Expired);
    }, [unifiedData]);

    // Filter "Active" records
    const activeData = useMemo(() => {
        return unifiedData.filter(item => item.status === RecordStatus.Active);
    }, [unifiedData]);

    const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
    const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center text-sm";
    
    // Updated class for wrapping text properly within a restricted width
    const wideCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[150px] max-w-[220px] leading-snug";

    const columns: { key: keyof UnifiedRecord | 'actions' | 'remaining' | 'attachments' | 'serial'; header: string; render?: (item: UnifiedRecord) => React.ReactNode; exportValue?: (item: UnifiedRecord) => string | number | null | undefined; headerClassName?: string; cellClassName?: string; }[] = [
        { 
            key: 'serial', 
            header: 'م', 
            // Reduced width to w-[40px] and ensured compact padding
            headerClassName: "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-[40px]", 
            cellClassName: "whitespace-nowrap px-1 py-4 text-gray-700 font-bold align-middle text-center text-sm bg-slate-50 border-l border-slate-100 w-[40px]" 
        },
        { 
            key: 'recordTypeLabel', 
            header: 'نوع السجل', 
            headerClassName: baseHeaderClass, 
            cellClassName: "whitespace-nowrap px-2 py-4 font-semibold text-blue-800 align-middle text-center text-xs bg-blue-50/50" 
        },
        { 
            key: 'name', 
            header: 'الاسم / الموضوع', 
            headerClassName: baseHeaderClass, 
            cellClassName: wideCellClass,
            render: (item) => (
                <div className="flex flex-col items-center justify-center">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    {item.subDetail && (
                        <span className="text-[10px] text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.subDetail}
                        </span>
                    )}
                </div>
            )
        },
        { key: 'number', header: 'الرقم', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'status', header: 'الحالة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'displayCost', header: 'التكلفة', render: (item) => formatCost(item.displayCost), exportValue: (item) => item.displayCost, headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { 
            key: 'actions', 
            header: 'إجراءات', 
            headerClassName: baseHeaderClass, 
            cellClassName: baseCellClass,
        },
    ];

    const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";
    const alertTitleStyle = "flex items-center gap-3 px-5 py-2.5 bg-yellow-50 text-yellow-800 rounded-xl border-r-4 border-yellow-500 shadow-md";
    const expiredTitleStyle = "flex items-center gap-3 px-5 py-2.5 bg-red-50 text-red-800 rounded-xl border-r-4 border-red-500 shadow-md";
    const activeTitleStyle = "flex items-center gap-3 px-5 py-2.5 bg-green-50 text-green-800 rounded-xl border-r-4 border-green-500 shadow-md";

    // Reusable Filter Card Component - DISPLAY ONLY (No filtering logic)
    const FilterCard = ({ 
        label, 
        count, 
        colorClass, 
        borderColorClass,
        icon 
    }: { 
        label: string, 
        count: number, 
        colorClass: string, 
        borderColorClass: string,
        icon: React.ReactNode 
    }) => (
        <div
            className={`
                relative overflow-hidden flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border-2 ${borderColorClass}
            `}
        >
             <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0
                ${colorClass}
            `}>
                {icon}
            </div>
            <div className="flex flex-col items-start z-10">
                <span className="text-sm font-bold mb-1 text-gray-500">{label}</span>
                <span className="text-2xl font-extrabold text-gray-900">{count}</span>
            </div>
             {/* Simple Background decoration */}
             <div className="absolute right-0 top-0 w-16 h-full opacity-5 bg-gray-500 transform skew-x-12" />
        </div>
    );

    return (
        <div>
            {/* Innovative Filter Dashboard (Display Only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <FilterCard 
                    label="جميع السجلات" 
                    count={stats.all} 
                    colorClass="bg-blue-500"
                    borderColorClass="border-blue-500"
                    icon={<AllRecordsIcon />}
                />
                <FilterCard 
                    label="السجلات المنتهية" 
                    count={stats.expired} 
                    colorClass="bg-red-500"
                    borderColorClass="border-red-500"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                 <FilterCard 
                    label="قاربت على الانتهاء" 
                    count={stats.soon} 
                    colorClass="bg-yellow-500"
                    borderColorClass="border-yellow-500"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <FilterCard 
                    label="السجلات النشطة" 
                    count={stats.active} 
                    colorClass="bg-green-500"
                    borderColorClass="border-green-500"
                    icon={<CheckIcon />}
                />
            </div>

             {/* Expired Table (Critical Alert Section) */}
             {expiredData.length > 0 && (
                <div className="mb-10 border-2 border-red-300 rounded-xl overflow-hidden shadow-sm relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-400"></div>
                     <DataTable
                        title={
                            <div className={expiredTitleStyle}>
                                <span className="text-red-600">
                                    <svg className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </span>
                                <span className="font-bold text-lg tracking-wide text-red-900">
                                    سجلات منتهية (تنبيه هام)
                                </span>
                            </div>
                        }
                        exportFileName="سجلات_منتهية"
                        data={expiredData}
                        columns={columns}
                        onEdit={(item) => onEdit(item.originalRecord, item.originalType)}
                        onDelete={(item) => onDelete(item.originalRecord, item.originalType)}
                        isCollapsible={true}
                        defaultOpen={true}
                    />
                </div>
            )}

            {/* Soon To Expire Table (Alert Section) */}
            {soonToExpireData.length > 0 && (
                <div className="mb-10 border-2 border-yellow-300 rounded-xl overflow-hidden shadow-sm relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400"></div>
                     <DataTable
                        title={
                            <div className={alertTitleStyle}>
                                <span className="text-yellow-600">
                                    <svg className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <span className="font-bold text-lg tracking-wide text-yellow-900">
                                    سجلات قاربت على الانتهاء (تنبيه)
                                </span>
                            </div>
                        }
                        exportFileName="سجلات_قاربت_على_الانتهاء"
                        data={soonToExpireData}
                        columns={columns}
                        onEdit={(item) => onEdit(item.originalRecord, item.originalType)}
                        onDelete={(item) => onDelete(item.originalRecord, item.originalType)}
                        isCollapsible={true}
                        defaultOpen={true}
                    />
                </div>
            )}

             {/* Active Records Table (New Section) */}
             {activeData.length > 0 && (
                <div className="mb-10 border-2 border-green-300 rounded-xl overflow-hidden shadow-sm relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-green-400"></div>
                     <DataTable
                        title={
                            <div className={activeTitleStyle}>
                                <span className="text-green-600">
                                    <CheckIcon />
                                </span>
                                <span className="font-bold text-lg tracking-wide text-green-900">
                                    سجلات نشطة (حالة ممتازة)
                                </span>
                            </div>
                        }
                        exportFileName="سجلات_نشطة"
                        data={activeData}
                        columns={columns}
                        onEdit={(item) => onEdit(item.originalRecord, item.originalType)}
                        onDelete={(item) => onDelete(item.originalRecord, item.originalType)}
                        isCollapsible={true}
                        defaultOpen={true}
                    />
                </div>
            )}

            {/* Main Table */}
            <DataTable
                title={
                    <div className={titleStyle}>
                        <span className="text-[#eab308]"><ClipboardListIcon /></span>
                        <span className="font-bold text-lg tracking-wide">
                            قائمة جميع السجلات
                        </span>
                    </div>
                }
                exportFileName="جميع_السجلات"
                data={unifiedData} // Show all data always
                columns={columns}
                onEdit={(item) => onEdit(item.originalRecord, item.originalType)}
                onDelete={(item) => onDelete(item.originalRecord, item.originalType)}
                isCollapsible={true}
                defaultOpen={true}
            />
        </div>
    );
};

export default AllRecordsManagement;
