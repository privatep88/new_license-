import React, { useRef } from 'react';
import { SearchIcon, PrintIcon, BackupIcon, RestoreIcon } from './icons/ActionIcons';

const SaherLogo: React.FC = () => (
  <div className="flex items-center gap-2.5 sm:gap-3.5 origin-right transition-transform">
    {/* Square Icon Container */}
    <div className="relative flex h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-700 border border-blue-600 shadow-md sm:shadow-lg overflow-hidden group flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white relative z-10 font-sans">S</span>
        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 flex h-2 w-2 sm:h-2.5 sm:w-2.5 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eab308] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-[#eab308]"></span>
        </span>
    </div>

    {/* Text Branding */}
    <div className="flex flex-col items-start select-none">
      <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">SAHER</span>
      <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-[#eab308] tracking-widest uppercase mt-0.5 sm:mt-1">FOR SMART SERVICES</span>
    </div>
  </div>
);

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBackup: () => void;
    onRestore: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onBackup, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
    }
    // Reset input to allow selecting the same file again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleClearSearch = () => {
    // Synthetic event to clear search
    const event = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(event);
  };

  return (
    <header className="bg-[#091526] border-b-4 border-[#eab308] shadow-md relative z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Desktop & Tablet Main Header Row */}
        <div className="flex items-center justify-between py-3 sm:py-4 gap-3 sm:gap-4">
          
          {/* Right Side: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <SaherLogo />
          </div>

          {/* Center: Department & Title (Responsive: full on xl, compact on md/lg, hidden on mobile) */}
          <div className="hidden lg:flex flex-col items-center mx-2 text-center flex-shrink-0">
            <h1 className="text-xs font-semibold text-[#eab308] border border-[#1e293b] px-3.5 py-1 rounded-full bg-[#12244d]/40 mb-1">
              إدارة الخدمات العامة / قسم إدارة المرافق
            </h1>
            <p className="text-base xl:text-lg font-bold text-white tracking-tight">نظام تسجيل الرخص التجارية والأنشطة والعقود</p>
          </div>

          {/* Left Side: Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end flex-shrink-0">
            
            {/* Search Input on Tablet & Desktop (Hidden on Mobile, rendered in mobile search row below) */}
            <div className="hidden sm:block relative w-44 md:w-56 lg:w-64 print:hidden group">
              <input
                type="text"
                placeholder="بحث في السجلات..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pr-9 pl-8 py-2 bg-slate-900/60 border border-slate-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eab308]/60 focus:border-[#eab308] transition-all text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#eab308] transition-colors">
                <SearchIcon />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 hover:text-white transition-colors"
                  title="مسح البحث"
                >
                  <span className="text-xs font-bold bg-slate-700 hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center">&times;</span>
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Backup Button */}
              <button
                type="button"
                onClick={onBackup}
                className="bg-[#1e293b] p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] rounded-xl hover:bg-[#334155] active:scale-95 transition-all shadow-sm flex items-center justify-center print:hidden border border-gray-700/80 text-white flex-shrink-0 group"
                aria-label="نسخ احتياطي للبيانات"
                title="نسخ احتياطي للبيانات (تحميل ملف JSON)"
              >
                <BackupIcon />
              </button>

              {/* Restore Button */}
              <button
                type="button"
                onClick={handleRestoreClick}
                className="bg-[#1e293b] p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] rounded-xl hover:bg-[#334155] active:scale-95 transition-all shadow-sm flex items-center justify-center print:hidden border border-gray-700/80 text-white flex-shrink-0 group"
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

              {/* Print Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#1e293b] p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] rounded-xl hover:bg-[#334155] active:scale-95 transition-all shadow-sm flex items-center justify-center print:hidden border border-gray-700/80 text-white flex-shrink-0"
                aria-label="طباعة الصفحة"
                title="طباعة الصفحة"
              >
                <PrintIcon />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Search Row (Smooth Full-Width on Small Screens) */}
        <div className="sm:hidden pb-3 pt-1">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="بحث في جميع الرخص والعقود..."
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full pr-10 pl-8 py-2.5 bg-slate-900/70 border border-slate-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eab308]/60 focus:border-[#eab308] transition-all text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#eab308] transition-colors">
              <SearchIcon />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-white transition-colors"
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
