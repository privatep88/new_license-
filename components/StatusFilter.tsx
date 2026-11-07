import React from 'react';
import { RecordStatus } from '../types';

interface StatusFilterProps {
  value: RecordStatus | 'all';
  onChange: (newValue: RecordStatus | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const options = [
    { value: 'all', label: 'الكل', activeClass: 'bg-[#334155] text-white shadow-sm ring-1 ring-slate-400/30' },
    { value: RecordStatus.Active, label: RecordStatus.Active, activeClass: 'bg-green-600 text-white shadow-sm ring-1 ring-green-400/30' },
    { value: RecordStatus.SoonToExpire, label: RecordStatus.SoonToExpire, activeClass: 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-300/30' },
    { value: RecordStatus.Expired, label: RecordStatus.Expired, activeClass: 'bg-red-600 text-white shadow-sm ring-1 ring-red-400/30' },
  ];

  const baseClass = "px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex-shrink-0 min-h-[38px] flex items-center justify-center";
  const inactiveClass = "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/80 shadow-xs";

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto no-scrollbar touch-scroll max-w-full">
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
