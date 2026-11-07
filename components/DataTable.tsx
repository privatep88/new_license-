import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { RecordStatus, Attachment } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon, ExportIcon, SortIcon, SortAscIcon, SortDescIcon, ExcelSheetIcon, ChevronDownIcon } from './icons/ActionIcons';
import { formatCost, getStatusClass, calculateRemainingPeriod, getRemainingPeriodClass, calculateRemainingDays, getStatusWeight } from '../utils';

// Relaxed constraints for T to allow flexibility
interface Column<T> {
  key: keyof T | 'actions' | 'remaining' | 'attachments' | 'serial';
  header: string;
  render?: (item: T) => React.ReactNode;
  exportValue?: (item: T) => string | number | null | undefined;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  title: React.ReactNode;
  exportFileName: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  filterComponent?: React.ReactNode;
  disableSorting?: boolean;
  hideSortIcons?: boolean;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  showTotalRow?: boolean;
}

const getReadableFileType = (name: string, type: string): string => {
    const n = (name || '').toLowerCase();
    const t = (type || '').toLowerCase();
    
    if (t.includes('pdf') || n.endsWith('.pdf')) return 'PDF';
    if (t.includes('word') || t.includes('document') || n.match(/\.(doc|docx)$/)) return 'Word';
    if (t.includes('excel') || t.includes('sheet') || t.includes('spreadsheet') || n.match(/\.(xls|xlsx|csv)$/)) return 'Excel';
    if (t.includes('powerpoint') || t.includes('presentation') || n.match(/\.(ppt|pptx)$/)) return 'PPT';
    if (t.startsWith('image/') || n.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'صورة';
    
    return 'ملف';
};

const DataTable = <T extends { id: number; [key: string]: any }>({
  title,
  exportFileName,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  filterComponent,
  disableSorting = false,
  hideSortIcons = false,
  isCollapsible = false,
  defaultOpen = true,
  showTotalRow
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // View mode: 'table' or 'cards'. Defaults to 'cards' on very small screens, 'table' otherwise.
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const sortedData = useMemo(() => {
    if (disableSorting) {
      return data;
    }

    // Default Sorting Logic
    let activeKey = sortConfig.key;
    let activeDirection = sortConfig.direction;

    // If no user-selected sort key, default to 'status' if the data has it
    if (!activeKey) {
        if (data.length > 0 && (data[0] as any).status) {
            activeKey = 'status';
            activeDirection = 'asc'; // Ascending weight: Expired(1) -> Soon(2) -> Active(3)
        } else {
            return data;
        }
    }

    const sortableItems = [...data];
    sortableItems.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      const key = activeKey as keyof T | 'remaining';

      if (key === 'remaining') {
        aValue = calculateRemainingDays(a.expiryDate || a.documentedExpiryDate);
        bValue = calculateRemainingDays(b.expiryDate || b.documentedExpiryDate);
      } else {
        aValue = a[key as keyof T];
        bValue = b[key as keyof T];
      }
      
      if (aValue === null || typeof aValue === 'undefined') return 1;
      if (bValue === null || typeof bValue === 'undefined') return -1;
      
      let comparison = 0;
      
      const isDateKey = ['expiryDate', 'documentedExpiryDate', 'internalExpiryDate', 'registrationDate', 'deletedAt'].includes(key as string);
      const isStatusKey = key === 'status';

      if (isStatusKey) {
          // Primary Sort: Status Group
          const weightA = getStatusWeight(aValue);
          const weightB = getStatusWeight(bValue);
          comparison = weightA - weightB;

          // Secondary Sort: Date (Automatic tie-breaker for same status)
          if (comparison === 0) {
              const getDate = (item: any) => item.expiryDate || item.documentedExpiryDate || item.internalExpiryDate || item.registrationDate;
              const dateAStr = getDate(a);
              const dateBStr = getDate(b);

              const dateA = dateAStr ? new Date(dateAStr).getTime() : 9999999999999;
              const dateB = dateBStr ? new Date(dateBStr).getTime() : 9999999999999;

              comparison = dateA - dateB;
          }
      }
      else if (isDateKey && typeof aValue === 'string' && typeof bValue === 'string') {
          const dateA = new Date(aValue).getTime();
          const dateB = new Date(bValue).getTime();
          if (dateA < dateB) comparison = -1;
          if (dateA > dateB) comparison = 1;
      } 
      else if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;
      }
      else {
          comparison = String(aValue).localeCompare(String(bValue), 'ar');
      }

      return activeDirection === 'desc' ? comparison * -1 : comparison;
    });

    return sortableItems;
  }, [data, sortConfig, disableSorting]);

  const requestSort = (key: string) => {
    if (disableSorting) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const exportData = sortedData.map((item, index) => {
      const row: Record<string, any> = { 'م': index + 1 };
      columns.forEach(col => {
        if (col.key !== 'actions' && col.key !== 'attachments' && col.key !== 'serial') {
             if (col.exportValue) {
                 row[col.header] = col.exportValue(item);
             } else if (col.key === 'remaining') {
                 row[col.header] = calculateRemainingPeriod(item.expiryDate || item.documentedExpiryDate);
             } else {
                 row[col.header] = item[col.key as keyof T];
             }
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-fit column widths
    const max_widths: { [key: string]: number } = {};
    exportData.forEach(row => {
        Object.keys(row).forEach(key => {
            const val = row[key];
            const len = val ? String(val).length : 10;
            max_widths[key] = Math.max(max_widths[key] || 10, len);
        });
    });
    
    worksheet['!cols'] = Object.keys(max_widths).map(key => ({
        wch: Math.min(Math.max(max_widths[key] + 4, 12), 40)
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'البيانات');
    
    // Generate clean file name with date
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${exportFileName}_${dateStr}.xlsx`);
  };

  const renderCellContent = (col: Column<T>, item: T, index: number) => {
    if (col.render) {
      return col.render(item);
    }
    if (col.key === 'actions') {
      return (
        <div className="flex gap-2 justify-center items-center">
          <button 
            type="button"
            onClick={() => onEdit(item)} 
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center" 
            title="تعديل"
            aria-label="تعديل السجل"
          >
            <PencilIcon />
          </button>
          <button 
            type="button"
            onClick={() => onDelete(item)} 
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center" 
            title="حذف"
            aria-label="حذف السجل"
          >
            <TrashIcon />
          </button>
        </div>
      );
    }
    if (col.key === 'serial') {
      return <span className="font-bold text-gray-500 text-xs font-mono">{index + 1}</span>;
    }
    if (col.key === 'status' && item.status) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(item.status)}`}>
          {item.status}
        </span>
      );
    }
    if (col.key === 'remaining') {
      return (
        <span className={getRemainingPeriodClass(item.expiryDate || item.documentedExpiryDate)}>
          {calculateRemainingPeriod(item.expiryDate || item.documentedExpiryDate)}
        </span>
      );
    }
    if (col.key === 'attachments') {
      if (item.attachments && item.attachments.length > 0) {
        return (
          <div className="flex items-center gap-1.5 justify-center flex-wrap max-w-[160px] mx-auto">
            {item.attachments.map((att: Attachment, attIdx: number) => (
              <a 
                href={att.data} 
                key={attIdx} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={`${att.name || 'عرض الملف'} (${getReadableFileType(att.name, att.type)})`} 
                className="hover:scale-110 active:scale-95 transition-transform"
              >
                {(() => {
                  const type = (att.type || '').toLowerCase();
                  const name = (att.name || '').toLowerCase();
                  
                  if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                    return <img src={att.data} alt="file" className="h-8 w-8 object-cover rounded shadow-sm border border-gray-200" />;
                  }
                  if (type.includes('pdf') || name.endsWith('.pdf')) return <div className="h-8 w-8"><PdfIcon /></div>;
                  if (type.includes('word') || type.includes('document') || name.match(/\.(doc|docx)$/)) return <div className="h-8 w-8"><WordIcon /></div>;
                  if (type.includes('excel') || type.includes('sheet') || type.includes('spreadsheet') || name.match(/\.(xls|xlsx|csv)$/)) return <div className="h-8 w-8"><ExcelIcon /></div>;
                  if (type.includes('powerpoint') || type.includes('presentation') || name.match(/\.(ppt|pptx)$/)) return <div className="h-8 w-8"><PowerPointIcon /></div>;
                  
                  return <div className="h-8 w-8"><DocumentIcon /></div>;
                })()}
              </a>
            ))}
          </div>
        );
      }
      return <span className="text-gray-300 text-xs">-</span>;
    }
    return String(item[col.key as keyof T] ?? '');
  };

  // Check if cost columns exist
  const hasCostColumns = columns.some(c => ['cost', 'documentedCost', 'internalCost'].includes(String(c.key)));
  const shouldShowTotal = (showTotalRow !== undefined ? showTotalRow : hasCostColumns) && sortedData.length > 0;

  // Calculate total costs for summary
  const totalSums = useMemo(() => {
    if (!shouldShowTotal) return {};
    const sums: Record<string, number> = {};
    columns.forEach(col => {
      const keyStr = String(col.key);
      if (['cost', 'documentedCost', 'internalCost'].includes(keyStr)) {
        sums[keyStr] = sortedData.reduce((acc, row: any) => acc + (Number(row[col.key]) || 0), 0);
      }
    });
    return sums;
  }, [columns, sortedData, shouldShowTotal]);

  return (
    <div className="mb-6 last:mb-0">
      {/* Top Header & Toolbar Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-4 pb-2 border-b border-gray-100">
        
        {/* Title & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            {isCollapsible ? (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-right focus:outline-none group select-none min-h-[40px]"
                aria-expanded={isOpen}
              >
                <span className="transform transition-transform duration-200 text-gray-500 group-hover:text-gray-800 p-1">
                  <ChevronDownIcon isOpen={isOpen} />
                </span>
                {title}
              </button>
            ) : (
              <div>{title}</div>
            )}
          </div>
          
          {/* Status Filter Component */}
          {filterComponent && (
            <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
              {filterComponent}
            </div>
          )}
        </div>

        {/* Action Controls & View Mode Toggle */}
        <div className={`flex flex-wrap items-center gap-2 w-full md:w-auto justify-between sm:justify-end transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          
          {/* View Mode Toggle (Table vs Cards) - Accessible on all screen sizes */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض كجدول"
              aria-label="عرض كجدول"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">جدول</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض كبطاقات (مخصص للهواتف)"
              aria-label="عرض كبطاقات"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">بطاقات</span>
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 bg-white text-blue-700 border border-blue-600 px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow-xs text-xs sm:text-sm font-medium min-h-[38px]"
            title="تصدير إلى ملف إكسل"
          >
            <ExcelSheetIcon />
            <span>تصدير Excel</span>
          </button>

          {/* Add Button */}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center justify-center gap-1.5 bg-[#334155] text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-[#1e293b] active:scale-95 transition-all shadow-xs text-xs sm:text-sm font-semibold min-h-[38px]"
              title="إضافة سجل جديد"
            >
              <PlusIcon />
              <span>إضافة جديد</span>
            </button>
          )}

        </div>
      </div>
      
      {isOpen && (
        <div className="animate-fade-in">
          
          {/* MODE 1: CARD VIEW (Mobile-First, Adaptive Grid) */}
          {viewMode === 'cards' ? (
            <div className="space-y-4">
              {sortedData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedData.map((item, index) => {
                    const rowKey = item.uniqueKey || (item.originalType ? `${item.originalType}-${item.id}` : `${item.id}-${index}`);
                    const primaryTitle = item.name || item.title || `سجل #${index + 1}`;
                    
                    return (
                      <div 
                        key={rowKey}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between relative group overflow-hidden"
                      >
                        {/* Status Bar on Right Edge */}
                        {item.status && (
                          <div 
                            className={`absolute top-0 right-0 w-1.5 h-full ${
                              item.status === RecordStatus.Expired 
                                ? 'bg-red-500' 
                                : item.status === RecordStatus.SoonToExpire 
                                  ? 'bg-amber-400' 
                                  : 'bg-emerald-500'
                            }`}
                          />
                        )}

                        <div>
                          {/* Card Top: Serial, Title & Status */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 min-w-0 pr-1">
                              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg flex-shrink-0">
                                #{index + 1}
                              </span>
                              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug truncate" title={primaryTitle}>
                                {primaryTitle}
                              </h3>
                            </div>
                            
                            {item.status && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border flex-shrink-0 ${getStatusClass(item.status)}`}>
                                {item.status}
                              </span>
                            )}
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 bg-slate-50/50 rounded-xl px-2.5 mb-3">
                            {columns.filter(c => !['actions', 'serial', 'name', 'status'].includes(String(c.key))).map(col => {
                              const keyStr = String(col.key);
                              const isFullWidth = keyStr === 'notes' || keyStr === 'attachments' || keyStr === 'requirements';
                              
                              return (
                                <div 
                                  key={keyStr} 
                                  className={`${isFullWidth ? 'col-span-2' : 'col-span-1'} flex flex-col`}
                                >
                                  <span className="text-[10px] text-slate-400 font-medium mb-0.5">{col.header}</span>
                                  <div className="font-semibold text-slate-700">
                                    {renderCellContent(col, item, index)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Card Footer: Quick Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 mt-2">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
                            title="تعديل السجل"
                          >
                            <PencilIcon />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
                            title="حذف السجل"
                          >
                            <TrashIcon />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  لا توجد بيانات للعرض
                </div>
              )}

              {/* Total Summary Card in Card View */}
              {shouldShowTotal && (
                <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl shadow-md border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-sm">التكلفة الإجمالية المحتسبة:</span>
                    <span className="text-xs text-slate-300">({sortedData.length} سجل)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {(Object.entries(totalSums) as [string, number][]).map(([key, val]) => (
                      <div key={key} className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                        <span className="text-base font-black font-mono text-emerald-300">{formatCost(Number(val))}</span>
                        <span className="text-xs font-bold text-white mr-1.5">AED</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (

            /* MODE 2: TABLE VIEW (With Smooth Touch Scroll & Total Row) */
            <div className="relative rounded-2xl border border-gray-200 shadow-xs overflow-hidden bg-white">
              {/* Mobile Swipe Notice Badge */}
              <div className="md:hidden bg-slate-100 text-slate-500 text-[11px] px-3 py-1.5 flex items-center justify-between border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <span>↔</span>
                  <span>يمكنك التمرير أفقياً للاطلاع على كافة الأعمدة</span>
                </span>
                <span className="font-bold font-mono text-slate-700">{sortedData.length} سجل</span>
              </div>

              <div className="overflow-x-auto touch-scroll">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                  <thead className="bg-[#1e293b]">
                    <tr>
                      {columns.map((col) => {
                        const isSortable = !disableSorting && !['actions', 'attachments', 'serial'].includes(String(col.key));
                        return (
                          <th 
                            key={String(col.key)} 
                            className={col.headerClassName || "whitespace-nowrap px-3 sm:px-4 py-3 text-center font-medium text-white text-xs sm:text-sm select-none"}
                          >
                            {isSortable ? (
                              <button 
                                type="button"
                                onClick={() => requestSort(String(col.key))} 
                                className="flex items-center justify-center gap-1.5 group w-full focus:outline-none hover:text-blue-200 transition-colors"
                              >
                                <span>{col.header}</span>
                                {!hideSortIcons && (
                                  <span className={`transition-opacity ${sortConfig.key === String(col.key) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                    {sortConfig.key === String(col.key)
                                      ? (sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />)
                                      : <SortIcon />}
                                  </span>
                                )}
                              </button>
                            ) : (
                              <span>{col.header}</span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedData.length > 0 ? (
                      sortedData.map((item, index) => {
                        const rowKey = item.uniqueKey || (item.originalType ? `${item.originalType}-${item.id}` : `${item.id}-${index}`);
                        return (
                          <tr key={rowKey} className="hover:bg-slate-50/80 transition-colors">
                            {columns.map((col) => {
                              const defaultTdClass = ['name', 'notes', 'recordTypeLabel'].includes(String(col.key))
                                ? 'px-3 sm:px-4 py-3 text-gray-700 align-middle text-xs sm:text-sm min-w-[180px]'
                                : 'whitespace-nowrap px-3 sm:px-4 py-3 text-gray-700 align-middle text-xs sm:text-sm text-center';
                            
                              const tdClass = col.cellClassName || defaultTdClass;

                              return (
                                <td key={`${rowKey}-${String(col.key)}`} className={tdClass}>
                                  {renderCellContent(col, item, index)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 bg-gray-50/50">
                          لا توجد بيانات للعرض
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {/* Foot Total Row */}
                  {shouldShowTotal && (
                    <tfoot className="bg-slate-100/95 font-bold border-t-2 border-slate-300">
                      <tr>
                        {columns.map((col, cIdx) => {
                          const keyStr = String(col.key);
                          if (keyStr === 'serial') {
                            return (
                              <td key="total-serial" className="whitespace-nowrap px-1 py-3 text-center align-middle text-xs text-slate-500 font-bold bg-slate-200/50">
                                -
                              </td>
                            );
                          }
                          if (keyStr === 'name' || (!columns.some(c => String(c.key) === 'name') && cIdx === (columns.some(c => String(c.key) === 'serial') ? 1 : 0))) {
                            return (
                              <td key="total-label" className="px-4 py-3 text-center align-middle text-sm font-bold text-slate-800">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                  <span>التكلفة الإجمالية:</span>
                                </div>
                              </td>
                            );
                          }
                          if (['cost', 'documentedCost', 'internalCost'].includes(keyStr)) {
                            const totalSum = totalSums[keyStr] || 0;
                            return (
                              <td key={`total-${keyStr}`} className="whitespace-nowrap px-2 py-3 text-center align-middle text-sm">
                                <span className="font-mono font-black text-blue-900 bg-blue-100/80 px-2.5 py-1 rounded-md border border-blue-300 inline-block shadow-xs">
                                  {formatCost(totalSum)}
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={`total-empty-${keyStr}`} className="whitespace-nowrap px-2 py-3 text-center align-middle text-xs text-slate-400">
                              -
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DataTable;
