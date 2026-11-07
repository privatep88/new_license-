import React from 'react';

interface OfficialLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  containerClassName?: string;
  variant?: 'light-box' | 'clean';
}

export const OFFICIAL_LOGO_PATH = '/assets/aistudio/logo_1afd1154.png';

const OfficialLogo: React.FC<OfficialLogoProps> = ({
  size = 'md',
  className = '',
  containerClassName = '',
  variant = 'light-box',
}) => {
  const sizeClasses = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-10 sm:h-12 md:h-13 w-auto',
    lg: 'h-12 sm:h-14 md:h-16 w-auto',
    xl: 'h-14 sm:h-16 md:h-20 w-auto',
  };

  if (variant === 'clean') {
    return (
      <div className={`inline-flex items-center justify-center flex-shrink-0 select-none ${containerClassName}`}>
        <img
          src={OFFICIAL_LOGO_PATH}
          alt="شعار ساعد الرسمي - SAAED Official Logo"
          className={`${sizeClasses[size]} object-contain block ${className}`}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-[#eab308]/60 shadow-[0_4px_18px_rgba(0,0,0,0.28)] ring-1 ring-white/80 flex-shrink-0 select-none transition-transform duration-200 ${containerClassName}`}
    >
      <img
        src={OFFICIAL_LOGO_PATH}
        alt="شعار ساعد الرسمي - SAAED Official Logo"
        className={`${sizeClasses[size]} object-contain block ${className}`}
        draggable={false}
      />
    </div>
  );
};

export default OfficialLogo;
