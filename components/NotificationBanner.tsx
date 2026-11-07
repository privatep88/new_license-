
import React, { useMemo } from 'react';
import type { License, Contract } from '../types';

interface NotificationBannerProps {
  items: Array<License | Contract>;
  onSendEmail: () => void;
  onDismiss: () => void;
}

const NotificationIcon: React.FC = () => (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1e293b] border border-[#eab308]/30 shadow-inner">
        <svg className="h-5.5 w-5.5 text-[#eab308]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eab308] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#eab308]"></span>
        </span>
    </div>
);

const NotificationBanner: React.FC<NotificationBannerProps> = ({ items, onSendEmail, onDismiss }) => {
  const count = items.length;
  
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 animate-fade-in-down relative z-20">
        <div className="bg-[#091526] rounded-xl shadow-xl border border-[#1e293b] overflow-hidden relative flex flex-col">
            
            <div className="py-4 px-5 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Right Side: Icon & Text */}
                <div className="flex items-center gap-4 w-full md:w-auto text-right">
                    <NotificationIcon />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <h3 className="text-lg font-bold text-white tracking-wide">تنبيه انتهاء الصلاحية</h3>
                             <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/30">
                                هام جداً
                             </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            يرجى الانتباه، هناك 
                            {expiredCount > 0 && (
                                <> <span className="text-red-500 font-bold mx-1 text-base">{expiredCount}</span> سجلات <span className="text-red-500 border-b border-red-500 border-dashed pb-0.5 font-medium">منتهية</span> </>
                            )}
                            {expiredCount > 0 && soonCount > 0 && <span> و </span>}
                            {soonCount > 0 && (
                                <> <span className="text-[#eab308] font-bold mx-1 text-base">{soonCount}</span> سجلات <span className="text-[#eab308] border-b border-[#eab308] border-dashed pb-0.5 font-medium">قاربت على الانتهاء</span></>
                            )}
                            .
                        </p>
                    </div>
                </div>

                {/* Left Side: Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                     <button
                        type="button"
                        onClick={onSendEmail}
                        className="bg-[#eab308] hover:bg-[#ca9a07] text-[#091526] px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-95 min-h-[40px]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span>إرسال تقرير بالبريد</span>
                    </button>
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title="إغلاق التنبيه"
                        aria-label="إغلاق التنبيه"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Ticker Bar Section */}
            <div className="bg-[#111e33] border-t border-[#1e293b] flex items-stretch h-8 relative overflow-hidden">
                {/* Label */}
                <div className="bg-[#eab308] text-[#091526] font-bold text-xs px-4 flex items-center justify-center flex-shrink-0 z-20 shadow-md">
                    شريط التنبيهات
                </div>
                
                {/* Scrolling Content */}
                <div className="flex-grow relative overflow-hidden flex items-center bg-[#111e33]">
                    <div className="ticker-wrapper w-full">
                         <div className="ticker-content flex items-center gap-8 pr-4">
                            {[...items, ...items].map((item, idx) => {
                                 const expired = isExpired(item);
                                 return ( // Duplicate for seamless
                                 <div key={`${item.id}-${idx}`} className="flex items-center gap-2 whitespace-nowrap text-xs text-gray-300">
                                     <span className="font-bold text-white">{item.name}</span>
                                     <span className="text-gray-500">[{item.number}]</span>
                                     <span className={`dir-ltr inline-block font-mono ${expired ? 'text-red-500 font-bold' : 'text-[#eab308]'}`}>
                                        [{getItemDate(item)}]
                                     </span>
                                     <span className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-red-500' : 'bg-[#eab308]'} animate-pulse`}></span>
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
                animation: fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .ticker-content {
                 display: inline-flex;
                 animation: ticker-rtl 60s linear infinite;
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
