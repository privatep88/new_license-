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

    // Smoothly scroll active tab into view when activeTab changes
    useEffect(() => {
        if (activeTabRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const tab = activeTabRef.current;
            const containerWidth = container.offsetWidth;
            const tabLeft = tab.offsetLeft;
            const tabWidth = tab.offsetWidth;

            // In RTL, scrollLeft can be negative or positive depending on browser engine
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
        <div className="mt-3 sm:mt-5 relative z-20">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="bg-[#091526] border-b-4 border-[#eab308] shadow-lg rounded-2xl overflow-hidden">
                    
                    {/* Mobile Quick Tab Bar & Selector Trigger (< lg screens) */}
                    <div className="lg:hidden p-2.5 border-b border-slate-800 flex items-center justify-between gap-2 bg-[#0c1b33]">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="p-1.5 bg-[#eab308] text-[#091526] rounded-lg flex-shrink-0">
                                {React.createElement(activeTab.icon)}
                            </span>
                            <div className="min-w-0">
                                <span className="text-[10px] text-gray-400 block font-medium">القسم المختار</span>
                                <h2 className="text-sm font-bold text-white truncate">{activeTab.name}</h2>
                            </div>
                        </div>

                        {/* Button to open quick navigation sheet / list */}
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-[#334155] text-[#eab308] border border-[#eab308]/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex-shrink-0 min-h-[38px]"
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
                        <div className="lg:hidden p-3 bg-[#0d1c35] border-b border-slate-800 animate-fade-in-down grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto touch-scroll">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab.id === tab.id;
                                const count = counts[tab.id] || 0;

                                return (
                                    <button
                                        key={`mobile-dropdown-${tab.id}`}
                                        onClick={() => handleSelectTab(tab)}
                                        className={`flex items-center justify-between p-3 rounded-xl text-right transition-all min-h-[46px] border ${
                                            isActive
                                                ? 'bg-[#eab308]/15 border-[#eab308] text-[#eab308] font-bold shadow-sm'
                                                : 'bg-[#152542] border-slate-700/60 text-gray-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className={`p-1 rounded-lg ${isActive ? 'text-[#eab308]' : 'text-gray-400'}`}>
                                                <Icon />
                                            </span>
                                            <span className="text-xs sm:text-sm font-semibold truncate">{tab.name}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                                            isActive 
                                                ? 'bg-[#eab308] text-[#091526]' 
                                                : 'bg-slate-700 text-slate-300'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Horizontal Tab Strip: Swipeable on Mobile, Responsive Wrap on Desktop */}
                    <div className="relative">
                        <nav 
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto no-scrollbar touch-scroll lg:flex-wrap items-center lg:justify-center gap-1.5 sm:gap-2 p-2 sm:p-3 scroll-smooth" 
                            aria-label="Tabs"
                        >
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab.id === tab.id;
                                const count = counts[tab.id] || 0;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        ref={isActive ? activeTabRef : null}
                                        onClick={() => onTabChange(tab)}
                                        className={`
                                            group flex items-center gap-2 py-2.5 px-3.5 sm:px-4 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 relative rounded-xl flex-shrink-0 min-h-[42px] sm:min-h-[44px]
                                            ${isActive
                                                ? 'text-[#eab308] bg-white/10 font-bold shadow-xs ring-1 ring-[#eab308]/30'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <span className={`transition-colors ${isActive ? 'text-[#eab308]' : 'text-gray-400 group-hover:text-white'}`}>
                                            <Icon />
                                        </span>
                                        <span className="tracking-tight">{tab.name}</span>
                                        
                                        {/* Count Badge */}
                                        <span className={`
                                            inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] font-mono transition-colors
                                            ${isActive 
                                                ? 'bg-[#eab308] text-[#091526]' 
                                                : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600 group-hover:text-white'
                                            }
                                        `}>
                                            {count}
                                        </span>

                                        {/* Active Golden Bar Indicator */}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#eab308] rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SecondaryHeader;
