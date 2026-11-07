import React from 'react';
import { RecordStatus } from '../types';

interface StatusFilterProps {
  value: RecordStatus | 'all';
  onChange: (newValue: RecordStatus | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const options = [
    { value: 'all', label: 'الكل', activeClass: 'bg-[#1e293b] text-white shadow-sm ring-1 ring-slate-700' },
    { value: RecordStatus.Active, label: RecordStatus.Active, activeClass: 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500' },
    { value: RecordStatus.SoonToExpire, label: RecordStatus.SoonToExpire, activeClass: 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400' },
    { value: RecordStatus.Expired, label: RecordStatus.Expired, activeClass: 'bg-red-600 text-white shadow-sm ring-1 ring-red-500' },
  ];

  const baseClass = "px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none flex-shrink-0 min-h-[36px] flex items-center justify-center";
  const inactiveClass = "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs";

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl overflow-x-auto no-scrollbar touch-scroll max-w-full">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value as RecordStatus | 'all')}
          className={`${baseClass} ${value === opt.value ? opt.activeClass : inactiveClass}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
