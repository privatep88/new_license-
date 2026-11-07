
import React from 'react';

// Icons for Contact Details
const LocationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const EmailIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#091526] text-white w-full border-t-4 border-[#eab308]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* About SAHER Section (Spanning 2 columns on larger screens) */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4 inline-block pb-1 border-b-2 border-yellow-500">عن SAHER</h3>
            <p className="text-gray-400 leading-relaxed">
              شركة رائدة في تقديم الحلول والأنظمة الذكية، ملتزمون بالابتكار والجودة لتحقيق أعلى مستويات الكفاءة والخدمات الذكية.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 inline-block pb-1 border-b-2 border-yellow-500">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">الرئيسية</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">خدماتنا</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">تواصل معنا</a></li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 inline-block pb-1 border-b-2 border-yellow-500">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <LocationIcon />
                <span className="text-gray-400 break-words text-sm">Level 3, Baynona Building, Khalif City A</span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon />
                <span className="text-gray-400" dir="ltr">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <EmailIcon />
                <a href="mailto:Logistic@saher.ae" className="text-gray-400 hover:text-white transition-colors duration-300">Logistic@saher.ae</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-[#091526] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center text-sm text-gray-500 gap-2">
          <p className="text-white border border-[#eab308] px-4 py-1.5 rounded-lg">اعداد وتصميم / خالد الجفري</p>
          <p>جميع الحقوق محفوظة لـ © {currentYear} SAHER FOR SMART SERVICES</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
