import React from 'react';
import {
  Zap,
  Activity,
  Leaf,
  Shield,
  Plane,
  Cpu,
  TrendingUp,
  Building,
  Fuel,
  Car,
  ShoppingBag,
} from 'lucide-react';

interface StockLogoProps {
  symbol?: string;
  name?: string;
  sector?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({
  symbol = '',
  name = '',
  sector = '',
  size = 'md',
  className = '',
}) => {
  const cleanSymbol = symbol.trim().toUpperCase();

  // Dimensions
  const sizeMap = {
    xs: { container: 'w-5 h-5 rounded-md text-[9px]', icon: 'w-3 h-3', svg: 20 },
    sm: { container: 'w-7 h-7 rounded-lg text-[10px]', icon: 'w-3.5 h-3.5', svg: 28 },
    md: { container: 'w-9 h-9 rounded-xl text-xs', icon: 'w-4 h-4', svg: 36 },
    lg: { container: 'w-11 h-11 rounded-2xl text-sm', icon: 'w-5 h-5', svg: 44 },
    xl: { container: 'w-14 h-14 rounded-2xl text-base', icon: 'w-7 h-7', svg: 56 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // -------------------------------------------------------------
  // 1. OFFICIAL BRAND LOGOS (High-Precision SVG Vector Marks)
  // -------------------------------------------------------------

  // HDFC BANK (Official Royal Blue circle + Red/White Cross)
  if (cleanSymbol === 'HDFCBANK' || cleanSymbol === 'HDFC') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#004C8F] flex items-center justify-center p-1 shadow-sm border border-[#003B70] ${className}`}
        title="HDFC Bank"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Blue background square */}
          <rect width="100" height="100" rx="16" fill="#004C8F" />
          {/* Outer Red Cross frame */}
          <rect x="18" y="38" width="64" height="24" fill="#ED1C24" rx="2" />
          <rect x="38" y="18" width="24" height="64" fill="#ED1C24" rx="2" />
          {/* White inner Cross */}
          <rect x="26" y="42" width="48" height="16" fill="#FFFFFF" rx="1" />
          <rect x="42" y="26" width="16" height="48" fill="#FFFFFF" rx="1" />
          {/* Center Blue Square */}
          <rect x="38" y="38" width="24" height="24" fill="#004C8F" />
        </svg>
      </div>
    );
  }

  // RELIANCE INDUSTRIES (Official Blue Circle + Red/Orange/Cyan Flame)
  if (cleanSymbol === 'RELIANCE' || cleanSymbol === 'RIL') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#0B2A78] to-[#041238] flex items-center justify-center p-1 shadow-sm border border-[#1A3D94] ${className}`}
        title="Reliance Industries"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#0B2A78" />
          {/* Outer Flame (Orange-Red) */}
          <path
            d="M50 16 C66 32 74 48 70 66 C67 80 54 86 50 86 C46 86 33 80 30 66 C26 48 34 32 50 16 Z"
            fill="url(#relGrad)"
          />
          {/* Inner Flame (Cyan Glow) */}
          <path
            d="M50 36 C58 46 62 56 60 68 C58 76 52 80 50 80 C48 80 42 76 40 68 C38 56 42 46 50 36 Z"
            fill="#00E5FF"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3D00" />
              <stop offset="60%" stopColor="#FF9100" />
              <stop offset="100%" stopColor="#FFD600" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // TATA CONSULTANCY SERVICES (TCS) / TATA
  if (cleanSymbol === 'TCS' || cleanSymbol === 'TATA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#0F2D6B] flex items-center justify-center p-1 shadow-sm border border-[#1E4596] ${className}`}
        title="Tata Consultancy Services"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#0F2D6B" />
          <path
            d="M25 35 L75 35 M50 35 L50 75"
            stroke="#FFFFFF"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M32 48 Q50 38 68 48"
            fill="none"
            stroke="#40C4FF"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // INFOSYS (INFY)
  if (cleanSymbol === 'INFY' || cleanSymbol === 'INFOSYS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#007CC3] flex items-center justify-center p-1 shadow-sm border border-[#0091E6] ${className}`}
        title="Infosys Limited"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#007CC3" />
          <text
            x="50"
            y="62"
            fill="#FFFFFF"
            fontSize="34"
            fontFamily="sans-serif"
            fontWeight="900"
            textAnchor="middle"
            letterSpacing="-1"
          >
            infy
          </text>
        </svg>
      </div>
    );
  }

  // ICICI BANK
  if (cleanSymbol === 'ICICIBANK' || cleanSymbol === 'ICICI') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#A82810] to-[#E65100] flex items-center justify-center p-1 shadow-sm border border-[#BF360C] ${className}`}
        title="ICICI Bank"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#A82810" />
          <path
            d="M35 25 C65 20 78 45 65 65 C52 80 25 72 25 50 C25 35 40 32 50 38 C58 44 55 58 45 60 C38 62 35 52 42 48"
            fill="none"
            stroke="#FFB300"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // STATE BANK OF INDIA (SBIN / SBI)
  if (cleanSymbol === 'SBIN' || cleanSymbol === 'SBI') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#0082CA] flex items-center justify-center p-1 shadow-sm border border-[#006BA6] ${className}`}
        title="State Bank of India"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#0082CA" />
          {/* Keyhole aperture */}
          <circle cx="50" cy="45" r="18" fill="#FFFFFF" />
          <rect x="44" y="45" width="12" height="42" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // TATA MOTORS
  if (cleanSymbol === 'TATAMOTORS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#1A365D] to-[#0F172A] flex items-center justify-center p-1 shadow-sm border border-slate-700 ${className}`}
        title="Tata Motors"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#1A365D" />
          <ellipse cx="50" cy="50" rx="38" ry="24" fill="none" stroke="#60A5FA" strokeWidth="6" />
          <path d="M30 45 Q50 30 70 45" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <path d="M40 55 Q50 65 60 55" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // BHARTI AIRTEL
  if (cleanSymbol === 'BHARTIARTL' || cleanSymbol === 'AIRTEL') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#E60000] flex items-center justify-center p-1 shadow-sm border border-[#B30000] ${className}`}
        title="Bharti Airtel"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#E60000" />
          <path
            d="M32 68 C30 52 42 32 62 30 C72 28 78 36 74 46 C70 56 56 64 42 64 C36 64 32 60 32 54 C32 46 42 40 58 40"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. SECTOR-TAILORED GRADIENT BADGES (For Custom & Simulated Stocks)
  // -------------------------------------------------------------

  // Sector 1: EV & Automotive (NOVA, etc.)
  if (sector.includes('EV') || sector.includes('Auto') || cleanSymbol === 'NOVA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-sm border border-cyan-400/40 ${className}`}
        title={`${cleanSymbol} - EV & Auto`}
      >
        <Zap className={currentSize.icon} />
      </div>
    );
  }

  // Sector 2: Pharma & Biotech (MEDIX, etc.)
  if (sector.includes('Pharma') || sector.includes('Health') || sector.includes('Bio') || cleanSymbol === 'MEDIX') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-sm border border-rose-400/40 ${className}`}
        title={`${cleanSymbol} - Healthcare`}
      >
        <Activity className={currentSize.icon} />
      </div>
    );
  }

  // Sector 3: Clean & Renewable Energy (GREENX, etc.)
  if (sector.includes('Renewable') || sector.includes('Clean') || sector.includes('Solar') || cleanSymbol === 'GREENX') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm border border-emerald-400/40 ${className}`}
        title={`${cleanSymbol} - Clean Energy`}
      >
        <Leaf className={currentSize.icon} />
      </div>
    );
  }

  // Sector 4: Banking & Financial Services (FINEDGE, etc.)
  if (sector.includes('Bank') || sector.includes('Finance') || sector.includes('Capital') || cleanSymbol === 'FINEDGE') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-sm border border-indigo-400/40 ${className}`}
        title={`${cleanSymbol} - Banking & Finance`}
      >
        <Shield className={currentSize.icon} />
      </div>
    );
  }

  // Sector 5: Aerospace & Defense (AEROTECH, etc.)
  if (sector.includes('Aero') || sector.includes('Defense') || cleanSymbol === 'AEROTECH') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-sm border border-amber-400/40 ${className}`}
        title={`${cleanSymbol} - Aerospace`}
      >
        <Plane className={currentSize.icon} />
      </div>
    );
  }

  // Sector 6: IT, Tech, AI, Cloud
  if (sector.includes('IT') || sector.includes('Tech') || sector.includes('Software') || sector.includes('AI')) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-violet-600 to-purple-700 text-white flex items-center justify-center shadow-sm border border-violet-400/40 ${className}`}
        title={`${cleanSymbol} - Technology`}
      >
        <Cpu className={currentSize.icon} />
      </div>
    );
  }

  // Sector 7: Oil, Gas, Energy
  if (sector.includes('Oil') || sector.includes('Gas') || sector.includes('Energy')) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-sm border border-orange-400/40 ${className}`}
        title={`${cleanSymbol} - Energy`}
      >
        <Fuel className={currentSize.icon} />
      </div>
    );
  }

  // Sector 8: FMCG & Retail
  if (sector.includes('FMCG') || sector.includes('Retail') || sector.includes('Consumer')) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white flex items-center justify-center shadow-sm border border-fuchsia-400/40 ${className}`}
        title={`${cleanSymbol} - Consumer Goods`}
      >
        <ShoppingBag className={currentSize.icon} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. UNIVERSAL DYNAMIC MONOGRAM FALLBACK
  // -------------------------------------------------------------
  const initials = cleanSymbol.slice(0, 3) || 'STK';

  return (
    <div
      className={`${currentSize.container} shrink-0 bg-gradient-to-br from-slate-800 to-slate-950 text-white font-mono font-black flex items-center justify-center tracking-tighter shadow-sm border border-slate-700/80 ${className}`}
      title={name || cleanSymbol}
    >
      {initials}
    </div>
  );
};

export default StockLogo;
