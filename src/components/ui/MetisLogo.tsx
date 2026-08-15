import React from 'react';

interface MetisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const MetisLogo: React.FC<MetisLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Minimalist Greek Geometric 'M' with Owl Wisdom Accent */}
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(255,107,0,0.45)]"
        >
          {/* Subtle Greek geometric outer shield/hexagon */}
          <polygon
            points="20,2 37,11 37,29 20,38 3,29 3,11"
            className="stroke-orange-500/30 fill-slate-900/60"
            strokeWidth="1.5"
          />
          {/* Core Greek Column / Geometric 'M' with golden angle */}
          <path
            d="M10 28V12L20 22L30 12V28"
            className="stroke-orange-500"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wisdom Eye / Diamond Accent */}
          <polygon
            points="20,11 23,15 20,19 17,15"
            fill="#FF8A00"
            className="animate-pulse-subtle"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-extrabold tracking-wider text-white ${textMap[size]}`}>
            METIS
          </span>
          {size === 'xl' && (
            <span className="text-xs tracking-widest text-orange-400 font-medium uppercase mt-0.5">
              Where Strategy Meets Fortune
            </span>
          )}
        </div>
      )}
    </div>
  );
};
