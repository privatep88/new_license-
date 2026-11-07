
import React, { useState } from 'react';
import DataTable from './DataTable';
import type { ArchivedRecord } from '../types';
import { ArchiveIcon } from './icons/TabIcons';

interface ArchiveManagementProps {
    archivedRecords: ArchivedRecord[];
    onRestore: (item: ArchivedRecord) => void;
    onDeleteForever: (item: ArchivedRecord) => void;
    onEdit: (item: ArchivedRecord) => void;
}

const ArchiveManagement: React.FC<ArchiveManagementProps> = ({
    archivedRecords,
    onRestore,
    onDeleteForever,
    onEdit
}) => {
    
    // Helper to format date
    const formatDate = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
        } catch {
            return isoString;
        }
    };

    const getRecordTypeLabel = (type: string) => {
        const map: Record<string, string> = {
            'commercialLicense': 'رخصة تجارية',
            'operationalLicense': 'رخصة تشغيلية',
            'civilDefenseCert': 'دفاع مدني',
            'specialAgency': 'وكالة خاصة',
            'leaseContract': 'عقد إيجار',
            'generalContract': 'عقد موردين',
            'procedure': 'إجراء/خدمة',
            'otherTopic': 'موضوع آخر',
            'trademarkCert': 'علامة تجارية'
        };
        return map[type] || type;
    };

    const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
    const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center text-sm";
    
    const columns: { key: keyof ArchivedRecord | 'actions' | 'serial' | 'typeLabel' | 'deletedAt'; header: string; render?: (item: ArchivedRecord) => React.ReactNode; headerClassName?: string; cellClassName?: string; }[] = [
        { 
            key: 'serial', 
            header: 'م', 
            headerClassName: "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-px", 
            cellClassName: "whitespace-nowrap px-1 py-4 text-gray-700 font-bold align-middle text-center text-sm bg-slate-50 border-l border-slate-100 w-px" 
        },
        { 
            key: 'name', 
            header: 'الاسم / الموضوع', 
            headerClassName: baseHeaderClass, 
            cellClassName: "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[200px]" 
        },
        { 
            key: 'typeLabel', 
            header: 'نوع السجل', 
            headerClassName: baseHeaderClass, 
            cellClassName: baseCellClass,
            render: (item) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{getRecordTypeLabel(item.originalType)}</span>
        },
        { 
            key: 'deletedAt', 
            header: 'تاريخ الحذف', 
            headerClassName: baseHeaderClass, 
            cellClassName: baseCellClass,
            render: (item) => <span dir="ltr" className="font-mono text-xs text-gray-500">{formatDate(item.deletionDate)}</span>
        },
        { 
            key: 'actions', 
            header: 'إجراءات', 
            headerClassName: baseHeaderClass, 
            cellClassName: baseCellClass,
            render: (item) => (
                <div className="flex gap-2 justify-center">
                    <button 
                        onClick={() => onRestore(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 text-xs font-bold transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        استعادة
                    </button>
                    <button 
                        onClick={() => onEdit(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 text-xs font-bold transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                        تعديل
                    </button>
                    <button 
                        onClick={() => onDeleteForever(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 text-xs font-bold transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        حذف نهائي
                    </button>
                </div>
            )
        },
    ];

    const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

    return (
        <DataTable
            title={
                <div className={titleStyle}>
                    <span className="text-red-400"><ArchiveIcon /></span>
                    <span className="font-bold text-lg tracking-wide">أرشيف السجلات المحذوفة</span>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">{archivedRecords.length}</span>
                </div>
            }
            exportFileName="أرشيف_السجلات"
            data={archivedRecords}
            // @ts-ignore
            columns={columns}
            onEdit={() => {}} // Not used via datatable generic edit
            onDelete={() => {}} // Not used via datatable generic delete
            disableSorting={false}
        />
    );
};

export default ArchiveManagement;
