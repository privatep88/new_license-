import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }[size];

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 transition-opacity duration-300" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[94vh] sm:max-h-[90vh] flex flex-col transform transition-all duration-300 animate-modal-pop border border-slate-100 overflow-hidden`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Touch-Friendly Close Button */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/80 bg-slate-50/80 sticky top-0 z-20 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{title}</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 hover:bg-slate-200/60 rounded-xl w-10 h-10 flex items-center justify-center transition-colors text-2xl leading-none"
            aria-label="إغلاق النافذة"
          >
            &times;
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto touch-scroll flex-grow overscroll-contain">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modal-pop {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-pop {
            animation: modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
