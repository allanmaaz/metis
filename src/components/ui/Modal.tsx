import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  forceLight?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  forceLight = false,
}) => {
  const isDark = !forceLight;

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full ${maxWidthStyles[maxWidth]} rounded-3xl p-6 sm:p-7 overflow-hidden z-10 shadow-2xl transition-colors duration-200 ${
              isDark
                ? 'bg-[#131B2E] border border-white/10 text-white shadow-black/80'
                : 'bg-white border border-slate-200/90 text-slate-900 shadow-slate-900/20'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                  : 'text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-4 pr-8">
              <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Content */}
            <div className={isDark ? 'text-slate-200' : 'text-slate-700'}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
