import React, { useRef, useEffect, useState } from 'react';
import { Tab } from '../types';
import { TABS } from '../constants';

interface SecondaryHeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    counts: Record<string, number>;
}

const SecondaryHeader: React.FC<SecondaryHeaderProps> = ({ activeTab, onTabChange, counts }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const activeTabRef = useRef<HTMLButtonElement>(null);

    // Smoothly scroll active tab into view on horizontal mobile strip when activeTab changes
    useEffect(() => {
        if (activeTabRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const tab = activeTabRef.current;
            const containerWidth = container.offsetWidth;
            const tabLeft = tab.offsetLeft;
            const tabWidth = tab.offsetWidth;

            const targetScroll = tabLeft - (containerWidth / 2) + (tabWidth / 2);
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    }, [activeTab]);

    const handleSelectTab = (tab: Tab) => {
        onTabChange(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <section
            aria-label="أقسام النظام الرئيسية"
            className="mt-4 sm:mt-6 relative z-20 print:hidden"
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4fb] border border-slate-200/95 shadow-[0_8px_26px_rgba(9,21,38,0.08)] rounded-2xl p-2 sm:p-3">
                    
                    {/* Mobile Quick Tab Bar & Selector Trigger (< md screens) */}
                    <div className="md:hidden p-2.5 mb-2 rounded-xl flex items-center justify-between gap-2 bg-[#091526] text-white shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="p-1.5 bg-gradient-to-b from-[#fde047] to-[#eab308] text-[#091526] rounded-lg flex-shrink-0 shadow-xs">
                                {React.createElement(activeTab.icon)}
                            </span>
                            <div className="min-w-0">
                                <span className="text-[10px] text-[#fde047] block font-medium">القسم النشط</span>
                                <h2 className="text-xs sm:text-sm font-bold text-white truncate">{activeTab.name}</h2>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="cursor-pointer flex items-center gap-1.5 bg-[#162a47] hover:bg-[#1e385d] text-[#fde047] border border-[#eab308]/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex-shrink-0 min-h-[38px]"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="قائمة التبويبات"
                        >
                            <span>جميع الأقسام ({TABS.length})</span>
                            <svg 
                                className={`w-4 h-4 transform transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Dropdown / Drawer List when opened */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden p-2.5 mb-2.5 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto touch-scroll shadow-inner">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab.id === tab.id;
                                const count = counts[tab.id] ?? 0;

                                return (
                                    <button
                                        key={`mobile-dropdown-${tab.id}`}
                                        type="button"
                                        onClick={() => handleSelectTab(tab)}
                                        className={`cursor-pointer flex items-center justify-between p-2.5 rounded-xl text-right transition-all min-h-[46px] border ${
                                            isActive
                                                ? 'bg-gradient-to-l from-[#fde047] via-[#facc15] to-[#eab308] border-[#ca8a04] text-[#091526] font-extrabold shadow-xs'
                                                : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className={`p-1 rounded-lg flex-shrink-0 ${isActive ? 'text-[#091526]' : 'text-[#0f2342]'}`}>
                                                <Icon />
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold leading-snug">{tab.name}</span>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono flex-shrink-0 ${
                                            isActive 
                                                ? 'bg-[#713f12] text-white' 
                                                : 'bg-[#85581a] text-white'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Main Enterprise Navigation Tab Cards Container */}
                    <div className="relative">
                        <nav 
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto no-scrollbar touch-scroll md:grid md:grid-cols-5 xl:grid-cols-10 items-stretch gap-2 scroll-smooth" 
                            aria-label="التبويبات الرئيسية"
                        >
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab.id === tab.id;
                                const count = counts[tab.id] ?? 0;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        ref={isActive ? activeTabRef : null}
                                        onClick={() => onTabChange(tab)}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`
                                            group cursor-pointer select-none flex flex-col items-center justify-between text-center px-2.5 py-3 rounded-xl transition-all duration-200 relative flex-shrink-0 w-[126px] sm:w-[136px] md:w-auto min-h-[102px] sm:min-h-[108px] h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308]
                                            ${isActive
                                                ? 'bg-gradient-to-b from-[#fde047] via-[#facc15] to-[#eab308] text-[#091526] font-extrabold shadow-md border border-[#ca8a04]/70'
                                                : 'bg-white/95 hover:bg-white text-[#0f2342] font-bold border border-slate-200/85 hover:border-[#eab308]/60 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        {/* 1. Top: Clear Centered Icon */}
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                                            isActive 
                                                ? 'bg-[#091526]/10 text-[#091526]' 
                                                : 'bg-slate-100/80 text-[#0f2342] group-hover:bg-[#eab308]/15'
                                        }`}>
                                            <Icon />
                                        </span>
                                        
                                        {/* 2. Middle: Centered Arabic Title (Supports 2 lines without clipping) */}
                                        <span className={`text-[11px] xl:text-xs leading-snug tracking-tight my-1.5 flex items-center justify-center min-h-[2.25rem] w-full break-words px-0.5 ${
                                            isActive ? 'text-[#091526] font-extrabold' : 'text-[#0f2342] font-bold'
                                        }`}>
                                            {tab.name}
                                        </span>
                                        
                                        {/* 3. Bottom: Independent Record Count Badge */}
                                        <span className={`
                                            inline-flex items-center justify-center px-2.5 py-0.5 text-[11px] font-extrabold rounded-full min-w-[28px] font-mono leading-none shadow-2xs transition-colors flex-shrink-0
                                            ${isActive 
                                                ? 'bg-[#713f12] text-white' 
                                                : 'bg-[#85581a] text-white group-hover:bg-[#091526]'
                                            }
                                        `}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SecondaryHeader;
