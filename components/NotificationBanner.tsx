import React, { useMemo } from 'react';
import type { License, Contract } from '../types';

interface NotificationBannerProps {
  items: Array<License | Contract>;
  onSendEmail: () => void;
  onDismiss: () => void;
}

const NotificationIcon: React.FC = () => (
    <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#13284c] border border-[#eab308]/50 shadow-inner flex-shrink-0">
        <svg className="h-5 w-5 text-[#fde047]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    </div>
);

const NotificationBanner: React.FC<NotificationBannerProps> = ({ items, onSendEmail, onDismiss }) => {
  const getItemDate = (item: any) => {
      return item.expiryDate || item.documentedExpiryDate || item.internalExpiryDate || 'غير محدد';
  };

  const isExpired = (item: any) => {
      const dateStr = getItemDate(item);
      if(!dateStr || dateStr === 'غير محدد') return false;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return false;
      const expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return expiry < today;
  };

  const { expiredCount, soonCount } = useMemo(() => {
    let exp = 0;
    let soon = 0;
    items.forEach(item => {
        if(isExpired(item)) exp++;
        else soon++;
    });
    return { expiredCount: exp, soonCount: soon };
  }, [items]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 animate-fade-in-down relative z-20 print:hidden">
        <div className="bg-gradient-to-r from-[#071326] via-[#112546] to-[#071326] rounded-2xl shadow-[0_10px_28px_rgba(9,21,38,0.25)] border border-[#1e3a5f] overflow-hidden relative flex flex-col">
            
            <div className="py-3 px-4 sm:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                
                {/* Right Side: Icon & Alert Summary */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-right">
                    <NotificationIcon />
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                            تنبيه انتهاء الصلاحية
                        </h3>
                        <span className="hidden sm:inline-block h-4 w-px bg-slate-600" />
                        <p className="text-slate-200 text-xs sm:text-sm font-medium">
                            يوجد
                            {expiredCount > 0 && (
                                <> <span className="text-red-400 font-extrabold mx-1 text-sm sm:text-base font-mono">{expiredCount}</span> رخصة <span className="text-[#fde047] font-bold">منتهية</span> </>
                            )}
                            {expiredCount > 0 && soonCount > 0 && <span> و </span>}
                            {soonCount > 0 && (
                                <> <span className="text-red-400 font-extrabold mx-1 text-sm sm:text-base font-mono">{soonCount}</span> رخص تقارب على الانتهاء</>
                            )}
                            .
                        </p>
                    </div>
                </div>

                {/* Left Side: Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                     <button
                        type="button"
                        onClick={onSendEmail}
                        className="bg-gradient-to-b from-[#fde047] via-[#facc15] to-[#eab308] hover:from-[#fef08a] hover:to-[#ca8a04] text-[#091526] px-4 sm:px-5 py-1.5 rounded-full font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md active:scale-95 min-h-[36px]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span>إرسال تقرير بالبريد</span>
                    </button>
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="text-slate-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-xl min-w-[34px] min-h-[34px] flex items-center justify-center"
                        title="إغلاق التنبيه"
                        aria-label="إغلاق التنبيه"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Ticker Bar Section */}
            <div className="bg-[#06101f] border-t border-slate-800/90 flex items-center py-1.5 px-3 sm:px-5 gap-3 relative overflow-hidden">
                {/* Pill Label */}
                <div className="bg-gradient-to-b from-[#fde047] to-[#eab308] text-[#091526] font-extrabold text-[11px] sm:text-xs px-3.5 py-0.5 rounded-full flex items-center justify-center flex-shrink-0 z-20 shadow-xs">
                    شريط التنبيهات
                </div>
                
                {/* Scrolling Content */}
                <div className="flex-grow relative overflow-hidden flex items-center">
                    <div className="ticker-wrapper w-full">
                         <div className="ticker-content flex items-center gap-6 pr-4">
                            {[...items, ...items].map((item, idx) => {
                                 const expired = isExpired(item);
                                 return (
                                 <div key={`${item.id}-${idx}`} className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-200">
                                     <span className="font-bold text-white">{item.name}</span>
                                     <span className="text-slate-400 font-mono">[{item.number}]</span>
                                     <span className={`dir-ltr inline-block font-mono font-bold ${expired ? 'text-red-400' : 'text-[#fde047]'}`}>
                                        [ {getItemDate(item)} ]
                                     </span>
                                     <span className="text-slate-600 mx-1">|</span>
                                 </div>
                            )})}
                         </div>
                    </div>
                </div>
            </div>
            
        </div>
        <style>{`
            @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down {
                animation: fade-in-down 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .ticker-content {
                 display: inline-flex;
                 animation: ticker-rtl 55s linear infinite;
            }
            .ticker-content:hover {
                animation-play-state: paused;
            }
            @keyframes ticker-rtl {
                0% { transform: translateX(0); }
                100% { transform: translateX(50%); } 
            }
        `}</style>
    </div>
  );
};

export default NotificationBanner;
