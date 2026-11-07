import React from 'react';
import OfficialLogo from './OfficialLogo';

const LocationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const EmailIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#081529] to-[#050d1a] text-white w-full border-t-4 border-[#eab308] relative overflow-hidden print:hidden">
      {/* Subtle Architectural Skyline Backdrop on Left (Matching Reference Image) */}
      <div className="hidden lg:block absolute left-0 bottom-10 w-64 h-36 pointer-events-none opacity-85 select-none">
        <img
          src="/assets/aistudio/footer_skyline.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-left-bottom"
          style={{ maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* Rightmost Column in RTL (3 cols): Official SAAED Logo */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <OfficialLogo size="lg" />
            <span className="text-xs font-bold text-[#eab308] tracking-wide mt-2.5">
              ساعد للأنظمة والخدمات الذكية
            </span>
          </div>

          {/* About Section (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-2.5 inline-block pb-1 border-b-2 border-[#eab308]">
              عن ساعد (SAAED)
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              شركة رائدة في تقديم الحلول والأنظمة الذكية، ملتزمون بالابتكار والجودة لتحقيق أعلى مستويات الكفاءة والخدمات الذكية.
            </p>
          </div>

          {/* Quick Links Section (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-2.5 inline-block pb-1 border-b-2 border-[#eab308]">
              روابط سريعة
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li><a href="#top" className="text-slate-300 hover:text-[#fde047] transition-colors duration-200">الرئيسية</a></li>
              <li><a href="#workspace" className="text-slate-300 hover:text-[#fde047] transition-colors duration-200">خدماتنا</a></li>
              <li><a href="mailto:Logistic@saher.ae" className="text-slate-300 hover:text-[#fde047] transition-colors duration-200">تواصل معنا</a></li>
            </ul>
          </div>

          {/* Contact Us Section (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-2.5 inline-block pb-1 border-b-2 border-[#eab308]">
              تواصل معنا
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <LocationIcon />
                <span className="text-slate-300 break-words leading-snug" dir="ltr">Level 3, Baynona Building, Khalif City A</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon />
                <span className="text-slate-300 font-mono" dir="ltr">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <EmailIcon />
                <a href="mailto:Logistic@saher.ae" className="text-slate-300 hover:text-[#fde047] transition-colors duration-200 font-mono" dir="ltr">Logistic@saher.ae</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Copyright Bar */}
      <div className="bg-[#040a14]/90 border-t border-slate-800/80 py-3 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-center text-xs text-slate-400 gap-2">
          <p className="text-slate-200 font-semibold">
            إعداد وتصميم / خالد الهاشمي
          </p>
          <p className="font-medium text-slate-300">
            جميع الحقوق محفوظة © {currentYear} SAAED FOR SMART SYSTEMS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
