
import React, { useState } from 'react';
import DataTable from './DataTable';
import StatusFilter from './StatusFilter';
import type { License, RecordDataType } from '../types';
import { RecordStatus } from '../types';
import { SupplierIcon } from './icons/TabIcons';
import { formatCost, calculateRemainingDays } from '../utils';

interface SupplierContractsManagementProps {
    generalContracts: License[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: License, type: RecordDataType) => void;
    onDelete: (item: License, type: RecordDataType) => void;
}

const SupplierContractsManagement: React.FC<SupplierContractsManagementProps> = ({
    generalContracts,
    onAdd,
    onEdit,
    onDelete
}) => {
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

  const filteredGeneralContracts = generalContracts.filter(c => statusFilter === 'all' || c.status === statusFilter);
  
  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
  
  // --- Compact Styles for Optimized Widths ---
  const compactHeaderClass = "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-px";
  const compactCellClass = "whitespace-nowrap px-1 py-3 text-gray-700 align-middle text-center text-sm w-px";
  
  // Fluid Name Cell: Expands to fill space, wraps text properly
  const fluidNameCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[200px] leading-snug";

  // Note Cell: slightly wider but constrained
  const wideCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal break-words min-w-[150px] max-w-[200px] leading-snug";

  const generalContractColumns: { key: keyof License | 'actions' | 'remaining' | 'attachments' | 'serial'; header: string; render?: (item: License) => React.ReactNode; exportValue?: (item: License) => string | number | null | undefined; headerClassName?: string; cellClassName?: string; }[] = [
    { 
        key: 'serial', 
        header: 'م', 
        headerClassName: "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm w-px", 
        cellClassName: "whitespace-nowrap px-1 py-4 text-gray-500 font-bold align-middle text-center text-xs bg-slate-50 border-l border-slate-100 w-px" 
    },
    { key: 'name', header: 'اسم العقد العام', headerClassName: baseHeaderClass, cellClassName: fluidNameCellClass },
    { key: 'number', header: 'رقم العقد', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'renewalType', header: 'نوع التجديد', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
    { key: 'status', header: 'حالة العقد', headerClassName: compactHeaderClass, cellClassName: compactCellClass },
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
                <span className="text-[#eab308]"><SupplierIcon /></span>
                <span className="font-bold text-lg tracking-wide">عقود الموردين</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredGeneralContracts.length}</span>
            </div>
        }
        exportFileName="عقود الموردين"
        data={filteredGeneralContracts}
        columns={generalContractColumns}
        onAdd={() => onAdd('generalContract')}
        onEdit={(item) => onEdit(item, 'generalContract')}
        onDelete={(item) => onDelete(item, 'generalContract')}
        filterComponent={
            <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
            />
        }
      />
    </div>
  );
};

export default SupplierContractsManagement;
