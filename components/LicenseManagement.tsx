
import React, { useState } from 'react';
import DataTable from './DataTable';
import type { License, RecordDataType, RecordStatus } from '../types';
import StatusFilter from './StatusFilter';
import { LicenseIcon } from './icons/TabIcons';
import { ClipboardListIcon, ShieldIcon } from './icons/ActionIcons';
import { formatCost, calculateRemainingDays } from '../utils';

interface LicenseManagementProps {
    commercialLicenses: License[];
    operationalLicenses: License[];
    civilDefenseCerts: License[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: License, type: RecordDataType) => void;
    onDelete: (item: License, type: RecordDataType) => void;
}

type LicenseColumn = {
  key: keyof License | 'actions' | 'remaining' | 'attachments' | 'serial';
  header: string;
  render?: (item: License) => React.ReactNode;
  exportValue?: (item: License) => string | number | null | undefined;
  headerClassName?: string;
  cellClassName?: string;
};

const LicenseManagement: React.FC<LicenseManagementProps> = ({
    commercialLicenses,
    operationalLicenses,
    civilDefenseCerts,
    onAdd,
    onEdit,
    onDelete
}) => {
  const [commercialFilter, setCommercialFilter] = useState<RecordStatus | 'all'>('all');
  const [operationalFilter, setOperationalFilter] = useState<RecordStatus | 'all'>('all');
  const [civilDefenseFilter, setCivilDefenseFilter] = useState<RecordStatus | 'all'>('all');

  const filteredCommercial = commercialLicenses.filter(
    l => commercialFilter === 'all' || l.status === commercialFilter
  );
  const filteredOperational = operationalLicenses.filter(
    l => operationalFilter === 'all' || l.status === operationalFilter
  );
  const filteredCivilDefense = civilDefenseCerts.filter(
    l => civilDefenseFilter === 'all' || l.status === civilDefenseFilter
  );

  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center text-sm";
  
  // Standard wide cell for other tables (Operational & Civil Defense)
  const wideCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[150px] max-w-[200px] leading-snug";
  
  // --- Compact Styles for Commercial License Table ---
  const compactHeaderClass = "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-px";
  const compactCellClass = "whitespace-nowrap px-1 py-3 text-gray-700 align-middle text-center text-sm w-px";
  
  // Fluid Name Cell for Commercial License: Expands to fill space, wraps text
  const fluidNameCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[200px] leading-snug";
  
  const serialColumn: LicenseColumn = { 
    key: 'serial', 
    header: 'م', 
    headerClassName: "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-px", 
    cellClassName: "whitespace-nowrap px-1 py-4 text-gray-500 font-bold align-middle text-center text-xs bg-slate-50 border-l border-slate-100 w-px" 
  };

  const baseLicenseColumns: LicenseColumn[] = [
    { key: 'number', header: 'رقم الرخصة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'status', header: 'حالة الرخصة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
  ];

  // Specialized Columns for Commercial Licenses (Optimized Widths)
  const commercialLicenseColumns: LicenseColumn[] = [
    serialColumn,
    { key: 'name', header: 'اسم الرخصة التجارية', headerClassName: baseHeaderClass, cellClassName: fluidNameCellClass },
    { key: 'number', header: 'رقم الرخصة', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'status', header: 'حالة الرخصة', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
  ];
  
  // Specialized Columns for Operational Licenses (Optimized Widths)
  const operationalLicenseColumns: LicenseColumn[] = [
    serialColumn,
    { key: 'name', header: 'اسم الرخصة التشغيلية', headerClassName: baseHeaderClass, cellClassName: fluidNameCellClass },
    { key: 'number', header: 'الرقم', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'status', header: 'حالة الرخصة', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
  ];
  
  // Specialized Columns for Civil Defense Certificates (Optimized Widths)
  const civilDefenseCertColumns: LicenseColumn[] = [
    serialColumn,
    { key: 'name', header: 'اسم الشهادة', headerClassName: baseHeaderClass, cellClassName: fluidNameCellClass },
    { key: 'number', header: 'الرقم', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'status', header: 'حالة الشهادة', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
  ];

  const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

  return (
    <div>
      <DataTable
        title={
            <div className={titleStyle}>
                <span className="text-[#eab308]"><LicenseIcon /></span>
                <span className="font-bold text-lg tracking-wide">الرخص التجارية</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredCommercial.length}</span>
            </div>
        }
        exportFileName="الرخص التجارية"
        data={filteredCommercial}
        columns={commercialLicenseColumns}
        onAdd={() => onAdd('commercialLicense')}
        onEdit={(item) => onEdit(item, 'commercialLicense')}
        onDelete={(item) => onDelete(item, 'commercialLicense')}
        filterComponent={
            <StatusFilter 
                value={commercialFilter}
                onChange={(newValue) => setCommercialFilter(newValue)}
            />
        }
      />
      <DataTable
        title={
            <div className={titleStyle}>
                <span className="text-[#eab308]"><ClipboardListIcon /></span>
                <span className="font-bold text-lg tracking-wide">الرخص التشغيلية</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredOperational.length}</span>
            </div>
        }
        exportFileName="الرخص التشغيلية"
        data={filteredOperational}
        columns={operationalLicenseColumns}
        onAdd={() => onAdd('operationalLicense')}
        onEdit={(item) => onEdit(item, 'operationalLicense')}
        onDelete={(item) => onDelete(item, 'operationalLicense')}
        filterComponent={
            <StatusFilter 
                value={operationalFilter}
                onChange={(newValue) => setOperationalFilter(newValue)}
            />
        }
      />
      <DataTable
        title={
            <div className={titleStyle}>
                <span className="text-[#eab308]"><ShieldIcon /></span>
                <span className="font-bold text-lg tracking-wide">شهادات الدفاع المدني</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredCivilDefense.length}</span>
            </div>
        }
        exportFileName="شهادات الدفاع المدني"
        data={filteredCivilDefense}
        columns={civilDefenseCertColumns}
        onAdd={() => onAdd('civilDefenseCert')}
        onEdit={(item) => onEdit(item, 'civilDefenseCert')}
        onDelete={(item) => onDelete(item, 'civilDefenseCert')}
        filterComponent={
            <StatusFilter 
                value={civilDefenseFilter}
                onChange={(newValue) => setCivilDefenseFilter(newValue)}
            />
        }
      />
    </div>
  );
};

export default LicenseManagement;
