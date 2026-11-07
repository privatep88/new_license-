
import React, { useState } from 'react';
import DataTable from './DataTable';
import StatusFilter from './StatusFilter';
import type { Contract, RecordDataType } from '../types';
import { RecordStatus } from '../types';
import { ContractIcon } from './icons/TabIcons';
import { formatCost, getStatusClass, calculateRemainingDays, calculateRemainingPeriod, getRemainingPeriodClass } from '../utils';

interface ContractManagementProps {
    contracts: Contract[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: Contract, type: RecordDataType) => void;
    onDelete: (item: Contract, type: RecordDataType) => void;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ contracts, onAdd, onEdit, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

  const filteredContracts = contracts.filter(c => statusFilter === 'all' || c.status === statusFilter);

  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
  
  // --- Compact Styles for Optimized Widths ---
  const compactHeaderClass = "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-px";
  const compactCellClass = "whitespace-nowrap px-1 py-3 text-gray-700 align-middle text-center text-sm w-px";
  
  // Fluid Name Cell: Expands to fill space, wraps text properly
  const fluidNameCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[200px] leading-snug";

  // Note Cell: Reduced width for better table fit
  const wideCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[100px] max-w-[150px] leading-snug";

  // Helper for internal rows (Label + Value close together) - Fonts normalized to match other tables (text-sm for value)
  const renderRow = (label: string, value: React.ReactNode, colorClass: string = "text-gray-900") => (
     <div className="flex items-center gap-1.5 justify-start">
        <span className="text-xs text-gray-500 font-medium">{label}:</span>
        <span className={`text-sm ${colorClass}`}>{value}</span>
     </div>
  );

  const columns: { 
    key: keyof Contract | 'actions' | 'remaining' | 'attachments' | 'serial'; 
    header: string;
    render?: (item: Contract) => React.ReactNode;
    exportValue?: (item: Contract) => string | number | null | undefined;
    headerClassName?: string;
    cellClassName?: string;
  }[] = [
    { 
        key: 'serial', 
        header: 'م', 
        headerClassName: "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-px", 
        cellClassName: "whitespace-nowrap px-1 py-4 text-gray-500 font-bold align-middle text-center text-xs bg-slate-50 border-l border-slate-100 w-px" 
    },
    { key: 'name', header: 'اسم العقد', headerClassName: baseHeaderClass, cellClassName: fluidNameCellClass },
    { key: 'number', header: 'رقم العقد', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'contractType', header: 'نوع العقد', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { 
      key: 'documentedExpiryDate', 
      header: 'تاريخ الانتهاء', 
      headerClassName: compactHeaderClass,
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          {item.documentedExpiryDate && renderRow('الموثق', item.documentedExpiryDate)}
          {item.internalExpiryDate && renderRow('البيني', item.internalExpiryDate)}
        </div>
      ),
      exportValue: (item) => `الموثق: ${item.documentedExpiryDate || 'N/A'}, البيني: ${item.internalExpiryDate || 'N/A'}`
    },
    { 
      key: 'status', 
      header: 'الحالة',
      headerClassName: compactHeaderClass,
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1.5 items-start">
          {item.documentedStatus && (
            <div className="flex items-center gap-1.5 justify-start">
               <span className="text-xs text-gray-500 font-medium">الموثق:</span>
               <span className={`px-2 py-0.5 rounded text-xs font-bold leading-none ${getStatusClass(item.documentedStatus)}`}>
                  {item.documentedStatus}
               </span>
            </div>
          )}
          {item.internalStatus && (
            <div className="flex items-center gap-1.5 justify-start">
               <span className="text-xs text-gray-500 font-medium">البيني:</span>
               <span className={`px-2 py-0.5 rounded text-xs font-bold leading-none ${getStatusClass(item.internalStatus)}`}>
                  {item.internalStatus}
               </span>
            </div>
          )}
        </div>
      ),
      exportValue: (item) => `الموثق: ${item.documentedStatus || 'N/A'}, البيني: ${item.internalStatus || 'N/A'}`
    },
    { 
      key: 'remaining', 
      header: 'المدة المتبقية', 
      headerClassName: compactHeaderClass,
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          {item.documentedExpiryDate && renderRow('الموثق', calculateRemainingPeriod(item.documentedExpiryDate), `${getRemainingPeriodClass(item.documentedExpiryDate)} font-bold`)}
          {item.internalExpiryDate && renderRow('البيني', calculateRemainingPeriod(item.internalExpiryDate), `${getRemainingPeriodClass(item.internalExpiryDate)} font-bold`)}
        </div>
      ),
      exportValue: (item) => {
        const docText = item.documentedExpiryDate ? `الموثق: ${calculateRemainingPeriod(item.documentedExpiryDate)}` : '';
        const internalText = item.internalExpiryDate ? `البيني: ${calculateRemainingPeriod(item.internalExpiryDate)}` : '';
        return [docText, internalText].filter(Boolean).join(' | ');
      }
    },
    { 
      key: 'documentedCost', 
      header: 'التكلفة', 
      headerClassName: compactHeaderClass,
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          {item.documentedCost != null && renderRow('الموثق', formatCost(item.documentedCost))}
          {item.internalCost != null && renderRow('البيني', formatCost(item.internalCost))}
        </div>
      ),
      exportValue: (item) => {
        const docCost = item.documentedCost != null ? `الموثق: ${item.documentedCost}` : '';
        const internalCost = item.internalCost != null ? `البيني: ${item.internalCost}` : '';
        return [docCost, internalCost].filter(Boolean).join(' | ');
      }
    },
    { key: 'attachments', header: 'المرفقات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
  ];

  const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

  return (
    <DataTable
      title={
        <div className={titleStyle}>
            <span className="text-[#eab308]"><ContractIcon /></span>
            <span className="font-bold text-lg tracking-wide">العقود الايجارية</span>
            <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredContracts.length}</span>
        </div>
      }
      exportFileName="العقود الايجارية"
      data={filteredContracts}
      columns={columns}
      onAdd={() => onAdd('leaseContract')}
      onEdit={(item) => onEdit(item, 'leaseContract')}
      onDelete={(item) => onDelete(item, 'leaseContract')}
      filterComponent={
        <StatusFilter 
          value={statusFilter}
          onChange={setStatusFilter}
        />
      }
    />
  );
};

export default ContractManagement;
