import React, { useRef } from 'react';
import { SearchIcon, PrintIcon, BackupIcon, RestoreIcon } from './icons/ActionIcons';
import OfficialLogo from './OfficialLogo';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBackup: () => void;
    onRestore: (file: File) => void;
    expiringCount?: number;
    onToggleNotification?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    searchQuery,
    onSearchChange,
    onBackup,
    onRestore,
    expiringCount = 0,
    onToggleNotification
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleClearSearch = () => {
    const event = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(event);
  };

  return (
    <header className="bg-gradient-to-r from-[#06101e] via-[#0b1b33] to-[#06101e] border-b-2 border-[#eab308] shadow-lg relative z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Desktop & Tablet Main Header Row */}
        <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-3 sm:gap-4">
          
          {/* Right Side (RTL Start): Official SAAED Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <OfficialLogo size="md" />
          </div>

          {/* Center: Department Badge & System Title */}
          <div className="hidden lg:flex flex-col items-center mx-2 text-center flex-shrink-0">
            <div className="inline-flex items-center px-4 py-0.5 rounded-full bg-[#102342]/90 border border-[#eab308]/60 shadow-inner mb-1">
              <span className="text-[11px] xl:text-xs font-bold text-[#fde047] tracking-wide">
                إدارة الخدمات العامة / قسم إدارة المرافق
              </span>
            </div>
            <h1 className="text-base xl:text-xl font-extrabold text-white tracking-tight leading-snug">
              نظام تسجيل الرخص التجارية والأنشطة والعقود
            </h1>
            <p className="text-[10px] xl:text-[11px] font-semibold text-[#eab308]/90 tracking-wide mt-0.5">
              Commercial Licenses, Activities &amp; Contracts Management System
            </p>
          </div>

          {/* Left Side (RTL End): Search, Quick Actions & Executive Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 justify-end flex-shrink-0">
            
            {/* Search Input on Tablet & Desktop */}
            <div className="hidden sm:block relative w-44 md:w-56 xl:w-64 print:hidden group">
              <input
                type="text"
                placeholder="البحث في السجلات ..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pr-9 pl-8 py-2 bg-[#0c1a30]/90 border border-slate-600/80 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eab308]/60 focus:border-[#eab308] transition-all text-xs sm:text-sm shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#eab308] transition-colors">
                <SearchIcon />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  title="مسح البحث"
                >
                  <span className="text-xs font-bold bg-slate-700 hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center">&times;</span>
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Print Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#11223d] p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl hover:bg-[#1e3458] hover:border-[#eab308]/50 active:scale-95 transition-all shadow-sm flex items-center justify-center print:hidden border border-slate-700/90 text-slate-200 hover:text-white flex-shrink-0"
                aria-label="طباعة الصفحة"
                title="طباعة الصفحة"
              >
                <PrintIcon />
              </button>

              {/* Restore Button */}
              <button
                type="button"
                onClick={handleRestoreClick}
                className="bg-[#11223d] p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl hover:bg-[#1e3458] hover:border-[#eab308]/50 active:scale-95 transition-all shadow-sm flex items-center justify-center print:hidden border border-slate-700/90 text-slate-200 hover:text-white flex-shrink-0 group"
                aria-label="استعادة نسخة احتياطية"
                title="استعادة البيانات من نسخة احتياطية"
              >
                <RestoreIcon />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
              />

              {/* Backup Button */}
              <button
                type="button"
                onClick={onBackup}
                className="bg-[#11223d] p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl hover:bg-[#1e3458] hover:border-[#eab308]/50 active:scale-95 transition-all shadow-sm flex items-center justify-center print:hidden border border-slate-700/90 text-slate-200 hover:text-white flex-shrink-0 group"
                aria-label="نسخ احتياطي للبيانات"
                title="نسخ احتياطي للبيانات (تحميل ملف JSON)"
              >
                <BackupIcon />
              </button>

              {/* Notification Bell Trigger */}
              {onToggleNotification && (
                <button
                  type="button"
                  onClick={onToggleNotification}
                  className="relative bg-[#11223d] p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl hover:bg-[#1e3458] hover:border-[#eab308]/50 active:scale-95 transition-all shadow-sm flex items-center justify-center print:hidden border border-slate-700/90 text-slate-200 hover:text-white flex-shrink-0"
                  aria-label="تنبيهات انتهاء الصلاحية"
                  title="إظهار / إخفاء شريط التنبيهات"
                >
                  <svg className="h-5 w-5 text-[#eab308]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {expiringCount > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[10px] font-extrabold font-mono px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border border-[#091526] shadow">
                      {expiringCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Executive User Profile Lockup (Matching Reference Style) */}
            <div className="hidden xl:flex items-center gap-2.5 pr-2.5 border-r border-slate-700/80 select-none">
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">خالد الهاشمي</p>
                <p className="text-[10px] text-slate-400 font-medium">مدير النظام</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#1e3458] to-[#0c1a30] border-2 border-[#eab308] flex items-center justify-center text-[#eab308] shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Tablet/Mobile Title Banner (< lg screens) */}
        <div className="lg:hidden pb-2 text-center border-t border-slate-800/80 pt-2">
          <span className="inline-block text-[10px] font-bold text-[#fde047] bg-[#102342] border border-[#eab308]/40 px-3 py-0.5 rounded-full mb-1">
            إدارة الخدمات العامة / قسم إدارة المرافق
          </span>
          <h1 className="text-sm sm:text-base font-extrabold text-white">
            نظام تسجيل الرخص التجارية والأنشطة والعقود
          </h1>
        </div>

        {/* Mobile Search Row */}
        <div className="sm:hidden pb-3 pt-1">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="بحث في جميع الرخص والعقود..."
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full pr-10 pl-8 py-2 bg-[#0c1a30]/90 border border-slate-700 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eab308]/60 focus:border-[#eab308] transition-all text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#eab308] transition-colors">
              <SearchIcon />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-white transition-colors"
                title="مسح البحث"
              >
                <span className="text-xs font-bold bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center">&times;</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
