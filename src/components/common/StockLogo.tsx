import React from 'react';
import {
  Zap,
  Activity,
  Leaf,
  Shield,
  Plane,
  Cpu,
  Fuel,
  ShoppingBag,
} from 'lucide-react';

interface StockLogoProps {
  symbol?: string;
  name?: string;
  sector?: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({
  symbol = '',
  name = '',
  sector = '',
  logoUrl,
  size = 'md',
  className = '',
}) => {
  const cleanSymbol = symbol.trim().toUpperCase();

  // Dimensions
  const sizeMap = {
    xs: { container: 'w-5 h-5 rounded-md text-[9px]', icon: 'w-3 h-3' },
    sm: { container: 'w-7 h-7 rounded-lg text-[10px]', icon: 'w-3.5 h-3.5' },
    md: { container: 'w-9 h-9 rounded-xl text-xs', icon: 'w-4 h-4' },
    lg: { container: 'w-11 h-11 rounded-2xl text-sm', icon: 'w-5 h-5' },
    xl: { container: 'w-14 h-14 rounded-2xl text-base', icon: 'w-7 h-7' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // If a custom direct logo URL is provided (e.g. from admin)
  if (logoUrl) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-white flex items-center justify-center p-1 shadow-xs border border-slate-200/80 dark:border-white/15 overflow-hidden ${className}`}
        title={name || cleanSymbol}
      >
        <img
          src={logoUrl}
          alt={name || cleanSymbol}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  // =========================================================================
  // 1. BANKING & FINANCIAL SERVICES
  // =========================================================================

  // HDFC BANK
  if (cleanSymbol === 'HDFCBANK' || cleanSymbol === 'HDFC') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#004C8F] flex items-center justify-center p-1.5 shadow-sm border border-[#003A70] ${className}`}
        title="HDFC Bank"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="14" y="36" width="72" height="28" fill="#ED1C24" rx="3" />
          <rect x="36" y="14" width="28" height="72" fill="#ED1C24" rx="3" />
          <rect x="24" y="42" width="52" height="16" fill="#FFFFFF" rx="2" />
          <rect x="42" y="24" width="16" height="52" fill="#FFFFFF" rx="2" />
          <rect x="36" y="36" width="28" height="28" fill="#004C8F" />
        </svg>
      </div>
    );
  }

  // ICICI BANK
  if (cleanSymbol === 'ICICIBANK' || cleanSymbol === 'ICICI') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#9E1B00] via-[#C43800] to-[#E65100] flex items-center justify-center p-1.5 shadow-sm border border-[#801500] ${className}`}
        title="ICICI Bank"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M32 24 C68 18 82 45 68 68 C54 84 24 74 24 50 C24 34 40 30 52 38 C60 44 56 60 44 62 C36 64 34 52 42 48"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="5" fill="#FFB300" />
        </svg>
      </div>
    );
  }

  // STATE BANK OF INDIA (SBIN / SBI)
  if (cleanSymbol === 'SBIN' || cleanSymbol === 'SBI') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#0082CA] flex items-center justify-center p-1.5 shadow-sm border border-[#0068A3] ${className}`}
        title="State Bank of India"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="44" fill="#0082CA" stroke="#FFFFFF" strokeWidth="6" />
          <circle cx="50" cy="42" r="14" fill="#FFFFFF" />
          <rect x="44" y="42" width="12" height="46" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // KOTAK MAHINDRA BANK
  if (cleanSymbol === 'KOTAKBANK' || cleanSymbol === 'KOTAK') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#ED1C24] flex items-center justify-center p-1.5 shadow-sm border border-[#BA0D13] ${className}`}
        title="Kotak Mahindra Bank"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M32 50 C22 34 35 24 48 36 L52 40 C65 52 78 42 68 26"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M68 50 C78 66 65 76 52 64 L48 60 C35 48 22 58 32 74"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // AXIS BANK
  if (cleanSymbol === 'AXISBANK' || cleanSymbol === 'AXIS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#97144D] flex items-center justify-center p-1.5 shadow-sm border border-[#7A0D3C] ${className}`}
        title="Axis Bank"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 18 L24 78 L42 78 L50 58 L58 78 L76 78 Z" fill="#FFFFFF" />
          <path d="M50 36 L42 56 L58 56 Z" fill="#97144D" />
        </svg>
      </div>
    );
  }

  // BAJAJ FINANCE / BAJAJ FINSERV
  if (cleanSymbol === 'BAJFINANCE' || cleanSymbol === 'BAJAJFINSV') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#003366] flex items-center justify-center p-1.5 shadow-sm border border-[#002244] ${className}`}
        title="Bajaj Finserv"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M28 20 L58 20 C72 20 80 30 80 40 C80 48 74 54 66 56 C76 58 82 66 82 76 C82 86 72 94 56 94 L28 94 Z" fill="none" stroke="#00A3E0" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 20 L42 94" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 2. ENERGY, POWER & OIL
  // =========================================================================

  // RELIANCE INDUSTRIES
  if (cleanSymbol === 'RELIANCE' || cleanSymbol === 'RIL') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#0A266E] to-[#041542] flex items-center justify-center p-1.5 shadow-sm border border-[#16388A] ${className}`}
        title="Reliance Industries"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M50 12 C68 28 78 46 74 66 C70 82 56 88 50 88 C44 88 30 82 26 66 C22 46 32 28 50 12 Z"
            fill="url(#relFlame)"
          />
          <path
            d="M50 36 C59 47 63 58 60 70 C58 78 52 82 50 82 C48 82 42 78 40 70 C37 58 41 47 50 36 Z"
            fill="#00E5FF"
          />
          <defs>
            <linearGradient id="relFlame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF1E00" />
              <stop offset="55%" stopColor="#FF8000" />
              <stop offset="100%" stopColor="#FFC800" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // NTPC (National Thermal Power Corporation)
  if (cleanSymbol === 'NTPC') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#0B2545] to-[#133C55] flex items-center justify-center p-1 shadow-sm border border-[#1D4E89] ${className}`}
        title="NTPC Limited"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#FF6B00" strokeWidth="8" />
          <path d="M30 65 L45 35 L55 35 L70 65" stroke="#FFFFFF" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M38 52 L62 52" stroke="#FF6B00" strokeWidth="6" strokeLinecap="round" />
          <text x="50" y="86" fill="#00E5FF" fontSize="14" fontWeight="900" textAnchor="middle" letterSpacing="1">NTPC</text>
        </svg>
      </div>
    );
  }

  // ONGC (Oil & Natural Gas Corporation)
  if (cleanSymbol === 'ONGC') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#800000] to-[#550000] flex items-center justify-center p-1 shadow-sm border border-[#A00000] ${className}`}
        title="ONGC Limited"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 18 L76 72 L24 72 Z" fill="#FFC800" />
          <path d="M50 30 L66 66 L34 66 Z" fill="#800000" />
          <circle cx="50" cy="52" r="8" fill="#FF1E00" />
          <text x="50" y="88" fill="#FFFFFF" fontSize="15" fontWeight="900" textAnchor="middle" letterSpacing="1">ONGC</text>
        </svg>
      </div>
    );
  }

  // POWERGRID (Power Grid Corporation of India)
  if (cleanSymbol === 'POWERGRID') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#0D5C3A] to-[#0A3D27] flex items-center justify-center p-1 shadow-sm border border-[#118050] ${className}`}
        title="Power Grid Corp"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 16 L28 80 L72 80 Z" fill="none" stroke="#FFC800" strokeWidth="6" strokeLinejoin="round" />
          <path d="M35 55 L65 55 M40 40 L60 40 M45 25 L55 25" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 45 L78 45" stroke="#00E5FF" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="18" r="5" fill="#FF1E00" />
        </svg>
      </div>
    );
  }

  // ADANI GREEN ENERGY
  if (cleanSymbol === 'ADANIGREEN' || cleanSymbol === 'ADANI') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#004B87] via-[#008542] to-[#6EB43F] flex items-center justify-center p-1 shadow-sm border border-emerald-500/40 ${className}`}
        title="Adani Green Energy"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeDasharray="50 10" />
          <path d="M50 25 C65 25 75 40 70 55 C65 70 50 75 45 75 C45 75 42 60 50 50 C58 40 50 25 50 25 Z" fill="#6EB43F" />
        </svg>
      </div>
    );
  }

  // TATA POWER
  if (cleanSymbol === 'TATAPOWER') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#00338D] flex items-center justify-center p-1 shadow-sm border border-[#002266] ${className}`}
        title="Tata Power"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="44" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="1.5">TATA</text>
          <path d="M48 52 L36 70 L48 70 L44 86 L64 64 L52 64 Z" fill="#FFC800" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 3. AUTOMOTIVE & EV
  // =========================================================================

  // TATA MOTORS
  if (cleanSymbol === 'TATAMOTORS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#00338D] flex items-center justify-center p-1 shadow-sm border border-[#002266] ${className}`}
        title="Tata Motors"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="44" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="1.5">TATA</text>
          <ellipse cx="50" cy="68" rx="30" ry="14" fill="none" stroke="#60A5FA" strokeWidth="4" />
          <path d="M35 68 Q50 58 65 68" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // MAHINDRA & MAHINDRA (M&M)
  if (cleanSymbol === 'M&M' || cleanSymbol === 'MAHINDRA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#C8102E] flex items-center justify-center p-1 shadow-sm border border-[#960B21] ${className}`}
        title="Mahindra & Mahindra"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Twin Peaks Chrome M */}
          <path d="M22 68 L36 32 L50 54 L64 32 L78 68 L66 68 L58 48 L50 62 L42 48 L34 68 Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // MARUTI SUZUKI
  if (cleanSymbol === 'MARUTI' || cleanSymbol === 'SUZUKI') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#003B7A] flex items-center justify-center p-1.5 shadow-sm border border-[#002854] ${className}`}
        title="Maruti Suzuki"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M68 22 L32 22 L24 46 L76 46 L68 78 L24 78"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // BAJAJ AUTO
  if (cleanSymbol === 'BAJAJ-AUTO' || cleanSymbol === 'BAJAJAUTO') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#004B87] flex items-center justify-center p-1.5 shadow-sm border border-[#003366] ${className}`}
        title="Bajaj Auto"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M30 25 L55 25 C68 25 75 34 75 44 C75 52 70 58 60 60 C72 62 78 70 78 80 C78 90 68 95 52 95 L30 95 Z" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 25 L42 95" stroke="#00A3E0" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // HERO MOTOCORP
  if (cleanSymbol === 'HEROMOTOCO' || cleanSymbol === 'HERO') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#E31B23] flex items-center justify-center p-1.5 shadow-sm border border-[#B51219] ${className}`}
        title="Hero MotoCorp"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M28 20 L44 20 L44 48 L64 48 L64 20 L80 20 L80 80 L64 80 L64 58 L44 58 L44 80 L28 80 Z" fill="#FFFFFF" />
          <path d="M20 50 L44 50 L36 80 L20 80 Z" fill="#000000" opacity="0.3" />
        </svg>
      </div>
    );
  }

  // EICHER MOTORS (Royal Enfield)
  if (cleanSymbol === 'EICHERMOT' || cleanSymbol === 'ROYALENFIELD') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-black flex items-center justify-center p-1 shadow-sm border border-amber-500/40 ${className}`}
        title="Royal Enfield (Eicher)"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#D4AF37" strokeWidth="5" />
          <path d="M30 40 L50 24 L70 40 L64 65 L36 65 Z" fill="#D4AF37" />
          <path d="M38 45 L50 35 L62 45 L58 60 L42 60 Z" fill="#000000" />
          <circle cx="50" cy="48" r="4" fill="#D4AF37" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 4. IT & TECH
  // =========================================================================

  // TCS
  if (cleanSymbol === 'TCS' || cleanSymbol === 'TATA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#00338D] flex items-center justify-center p-1 shadow-sm border border-[#002266] ${className}`}
        title="Tata Consultancy Services"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="48" fill="#FFFFFF" fontSize="24" fontFamily="system-ui, sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="2.5">TATA</text>
          <text x="50" y="74" fill="#00D4FF" fontSize="16" fontFamily="system-ui, sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="3">TCS</text>
        </svg>
      </div>
    );
  }

  // INFOSYS (INFY)
  if (cleanSymbol === 'INFY' || cleanSymbol === 'INFOSYS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#007CC3] flex items-center justify-center p-1 shadow-sm border border-[#00629B] ${className}`}
        title="Infosys Limited"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="64" fill="#FFFFFF" fontSize="30" fontFamily="system-ui, sans-serif" fontWeight="900" fontStyle="italic" textAnchor="middle" letterSpacing="-0.5">infosys</text>
        </svg>
      </div>
    );
  }

  // WIPRO
  if (cleanSymbol === 'WIPRO') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-white flex items-center justify-center p-1 shadow-sm border border-slate-200 ${className}`}
        title="Wipro"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="35" cy="40" r="12" fill="#E60000" />
          <circle cx="65" cy="40" r="12" fill="#007CC3" />
          <circle cx="50" cy="65" r="12" fill="#FFB300" />
          <circle cx="50" cy="45" r="7" fill="#10B981" />
        </svg>
      </div>
    );
  }

  // HCL TECHNOLOGIES
  if (cleanSymbol === 'HCLTECH' || cleanSymbol === 'HCL') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#0057B8] flex items-center justify-center p-1 shadow-sm border border-[#00418A] ${className}`}
        title="HCL Technologies"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="66" fill="#FFFFFF" fontSize="36" fontFamily="system-ui, sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="1">HCL</text>
        </svg>
      </div>
    );
  }

  // TECH MAHINDRA
  if (cleanSymbol === 'TECHM') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#E31837] flex items-center justify-center p-1 shadow-sm border border-[#B31028] ${className}`}
        title="Tech Mahindra"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="38" cy="50" r="16" fill="#FFFFFF" />
          <circle cx="62" cy="50" r="16" fill="#000000" />
          <circle cx="50" cy="50" r="10" fill="#E31837" />
        </svg>
      </div>
    );
  }

  // LTIMINDTREE
  if (cleanSymbol === 'LTIM') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#002D72] to-[#0072CE] flex items-center justify-center p-1 shadow-sm border border-[#001D4A] ${className}`}
        title="LTIMindtree"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M25 35 L50 18 L75 35 L75 70 L50 86 L25 70 Z" fill="none" stroke="#FF6B00" strokeWidth="6" />
          <text x="50" y="60" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">LTIM</text>
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 5. FMCG & CONSUMER
  // =========================================================================

  // ITC
  if (cleanSymbol === 'ITC') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#0B1E40] flex items-center justify-center p-1 shadow-sm border border-[#061024] ${className}`}
        title="ITC Limited"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20 20 L80 20 L80 50 Q80 80 50 90 Q20 80 20 50 Z" fill="#D4AF37" />
          <path d="M25 24 L75 24 L75 48 Q75 75 50 84 Q25 75 25 48 Z" fill="#0B1E40" />
          <text x="50" y="58" fill="#D4AF37" fontSize="22" fontWeight="900" textAnchor="middle">ITC</text>
        </svg>
      </div>
    );
  }

  // HINDUSTAN UNILEVER (HINDUNILVR / HUL)
  if (cleanSymbol === 'HINDUNILVR' || cleanSymbol === 'HUL') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-white flex items-center justify-center p-1 shadow-sm border border-slate-200 ${className}`}
        title="Hindustan Unilever"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M30 25 C30 65 42 80 50 80 C58 80 70 65 70 25 C64 45 58 55 50 55 C42 55 36 45 30 25 Z" fill="#1F36C7" />
          <circle cx="50" cy="30" r="6" fill="#1F36C7" />
        </svg>
      </div>
    );
  }

  // NESTLE INDIA
  if (cleanSymbol === 'NESTLEIND' || cleanSymbol === 'NESTLE') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#005CA9] flex items-center justify-center p-1 shadow-sm border border-[#00437A] ${className}`}
        title="Nestle India"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M25 65 C40 75 60 75 75 65 C68 58 32 58 25 65 Z" fill="#FFFFFF" />
          <circle cx="42" cy="48" r="8" fill="#FFFFFF" />
          <circle cx="58" cy="50" r="6" fill="#FFFFFF" />
          <path d="M38 35 C45 28 55 28 62 35" stroke="#FFFFFF" strokeWidth="4" fill="none" />
        </svg>
      </div>
    );
  }

  // BRITANNIA INDUSTRIES
  if (cleanSymbol === 'BRITANNIA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#C8102E] flex items-center justify-center p-1 shadow-sm border border-[#990A20] ${className}`}
        title="Britannia Industries"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M30 35 L40 45 L50 25 L60 45 L70 35 L66 60 L34 60 Z" fill="#FFC800" />
          <text x="50" y="82" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle" letterSpacing="0.5">BRITANNIA</text>
        </svg>
      </div>
    );
  }

  // TITAN
  if (cleanSymbol === 'TITAN') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-slate-900 to-black flex items-center justify-center p-1 shadow-sm border border-amber-500/40 ${className}`}
        title="Titan Company"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="65" fill="#D4AF37" fontSize="36" fontFamily="serif" fontWeight="900" textAnchor="middle">TITAN</text>
        </svg>
      </div>
    );
  }

  // ZOMATO
  if (cleanSymbol === 'ZOMATO') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#E23744] flex items-center justify-center p-1 shadow-sm border border-[#BA2530] ${className}`}
        title="Zomato"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="62" fill="#FFFFFF" fontSize="26" fontFamily="system-ui, sans-serif" fontWeight="900" fontStyle="italic" textAnchor="middle">zomato</text>
        </svg>
      </div>
    );
  }

  // SWIGGY
  if (cleanSymbol === 'SWIGGY') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#FC8019] flex items-center justify-center p-1.5 shadow-sm border border-[#D96504] ${className}`}
        title="Swiggy"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 18 C36 18 26 28 26 42 C26 58 50 82 50 82 C50 82 74 58 74 42 C74 28 64 18 50 18 Z" fill="#FFFFFF" />
          <circle cx="50" cy="40" r="10" fill="#FC8019" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 6. PHARMA & HEALTHCARE
  // =========================================================================

  // SUN PHARMA
  if (cleanSymbol === 'SUNPHARMA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#E85D04] to-[#DC2F02] flex items-center justify-center p-1 shadow-sm border border-[#BA2200] ${className}`}
        title="Sun Pharma"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="24" fill="#FFBA08" />
          <path d="M50 14 L50 22 M50 78 L50 86 M14 50 L22 50 M78 50 L86 50 M25 25 L31 31 M69 69 L75 75 M25 75 L31 69 M69 31 L75 25" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // DR. REDDY'S LABORATORIES
  if (cleanSymbol === 'DRREDDY' || cleanSymbol === 'DRREDDYS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#5B2D90] flex items-center justify-center p-1 shadow-sm border border-[#431F6B] ${className}`}
        title="Dr. Reddy's"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M32 50 Q50 30 68 50 Q50 70 32 50" fill="#FFC800" />
        </svg>
      </div>
    );
  }

  // CIPLA
  if (cleanSymbol === 'CIPLA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#0B2545] flex items-center justify-center p-1 shadow-sm border border-[#133C55] ${className}`}
        title="Cipla Limited"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 20 L58 42 L80 50 L58 58 L50 80 L42 58 L20 50 L42 42 Z" fill="#FF6B00" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // APOLLO HOSPITALS
  if (cleanSymbol === 'APOLLOHOSP' || cleanSymbol === 'APOLLO') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#004B87] flex items-center justify-center p-1 shadow-sm border border-[#003366] ${className}`}
        title="Apollo Hospitals"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#FF6B00" strokeWidth="6" />
          <path d="M50 26 L50 74 M26 50 L74 50" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // DIVI'S LABORATORIES
  if (cleanSymbol === 'DIVISLAB' || cleanSymbol === 'DIVIS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#006699] to-[#003366] flex items-center justify-center p-1 shadow-sm border border-[#004C73] ${className}`}
        title="Divi's Laboratories"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="35" cy="35" r="12" fill="#00D4FF" />
          <circle cx="65" cy="45" r="10" fill="#FFB300" />
          <circle cx="45" cy="70" r="14" fill="#FFFFFF" />
          <line x1="35" y1="35" x2="65" y2="45" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="65" y1="45" x2="45" y2="70" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="35" y1="35" x2="45" y2="70" stroke="#FFFFFF" strokeWidth="4" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 7. METALS, INFRASTRUCTURE & TELECOM
  // =========================================================================

  // TATA STEEL
  if (cleanSymbol === 'TATASTEEL') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#00338D] flex items-center justify-center p-1 shadow-sm border border-[#002266] ${className}`}
        title="Tata Steel"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="44" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="1.5">TATA</text>
          <path d="M26 62 L74 62 M26 76 L74 76 M36 62 L36 76 M50 62 L50 76 M64 62 L64 76" stroke="#00D4FF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // JSW STEEL
  if (cleanSymbol === 'JSWSTEEL' || cleanSymbol === 'JSW') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#002D62] flex items-center justify-center p-1 shadow-sm border border-[#001D40] ${className}`}
        title="JSW Steel"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20 30 L80 30 L65 75 L35 75 Z" fill="#D9222A" />
          <text x="50" y="60" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle">JSW</text>
        </svg>
      </div>
    );
  }

  // LARSEN & TOUBRO (LT / L&T)
  if (cleanSymbol === 'LT' || cleanSymbol === 'L&T') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#002664] flex items-center justify-center p-1 shadow-sm border border-[#001840] ${className}`}
        title="Larsen & Toubro"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#FFCC00" strokeWidth="6" />
          <text x="50" y="62" fill="#FFFFFF" fontSize="26" fontWeight="900" textAnchor="middle" letterSpacing="1">L&T</text>
        </svg>
      </div>
    );
  }

  // ADANI PORTS
  if (cleanSymbol === 'ADANIPORTS') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-[#004B87] to-[#00284D] flex items-center justify-center p-1 shadow-sm border border-[#003B6B] ${className}`}
        title="Adani Ports"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20 65 Q50 45 80 65" fill="none" stroke="#00A3E0" strokeWidth="8" strokeLinecap="round" />
          <path d="M50 20 L50 65 M35 35 L50 20 L65 35" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // ULTRATECH CEMENT
  if (cleanSymbol === 'ULTRACEMCO' || cleanSymbol === 'ULTRATECH') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#FFD100] flex items-center justify-center p-1 shadow-sm border border-[#CCA700] ${className}`}
        title="UltraTech Cement"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M25 25 L75 25 L75 75 L25 75 Z" fill="#000000" />
          <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="#FFD100" />
          <text x="50" y="58" fill="#000000" fontSize="16" fontWeight="900" textAnchor="middle">ULTRA</text>
        </svg>
      </div>
    );
  }

  // BHARTI AIRTEL
  if (cleanSymbol === 'BHARTIARTL' || cleanSymbol === 'AIRTEL') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#E60000] flex items-center justify-center p-1.5 shadow-sm border border-[#B30000] ${className}`}
        title="Bharti Airtel"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M30 68 C28 50 42 30 64 28 C74 26 80 34 76 45 C72 56 56 64 42 64 C35 64 30 60 30 54 C30 46 42 40 58 40"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 8. GLOBAL GIANTS
  // =========================================================================

  // APPLE (AAPL)
  if (cleanSymbol === 'AAPL' || cleanSymbol === 'APPLE') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-black flex items-center justify-center p-1.5 shadow-sm border border-slate-700 ${className}`}
        title="Apple"
      >
        <svg viewBox="0 0 170 170" className="w-full h-full fill-white">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.83-11.89-14.34-6.42-9.9-11.39-20.91-14.91-33.02-3.52-12.11-5.28-23.47-5.28-34.08 0-14.35 3.69-26.4 11.08-36.14 7.39-9.74 16.73-14.73 28.02-14.98 4.9.13 10.42 1.45 16.57 3.96 6.15 2.51 10.15 3.82 11.99 3.93 1.63-.11 5.79-1.42 12.48-3.93 6.69-2.51 12.06-3.73 16.12-3.67 11.85.64 21.39 4.93 28.61 12.87-10.43 6.35-15.54 15.17-15.34 26.46.2 9.04 3.74 16.7 10.63 22.99 6.89 6.29 15.14 9.94 24.75 10.96-2.03 6.08-4.59 12.44-7.67 19.08zM119.22 33.56c0-6.73 2.5-13.11 7.51-19.14 5.01-6.03 11.13-9.84 18.36-11.42.22 1.3.33 2.5.33 3.59 0 6.62-2.6 13.06-7.81 19.33-5.21 6.27-11.33 10.02-18.39 11.24v-3.6z" />
        </svg>
      </div>
    );
  }

  // TESLA (TSLA)
  if (cleanSymbol === 'TSLA' || cleanSymbol === 'TESLA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#E82127] flex items-center justify-center p-1.5 shadow-sm border border-[#B01419] ${className}`}
        title="Tesla"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
          <path d="M50 25 C62 25 76 28 85 34 L80 44 C72 39 62 36 50 36 C38 36 28 39 20 44 L15 34 C24 28 38 25 50 25 Z" />
          <path d="M45 42 L55 42 L55 85 L45 85 Z" />
        </svg>
      </div>
    );
  }

  // NVIDIA (NVDA)
  if (cleanSymbol === 'NVDA' || cleanSymbol === 'NVIDIA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-[#76B900] flex items-center justify-center p-1 shadow-sm border border-[#5B8F00] ${className}`}
        title="NVIDIA"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
          <path d="M30 35 C50 20 70 30 75 45 C80 60 65 75 50 75 C35 75 25 65 25 50 C25 40 30 35 30 35 Z M36 44 C34 50 38 60 50 60 C60 60 65 52 62 44 C58 35 44 35 36 44 Z" />
        </svg>
      </div>
    );
  }

  // GOOGLE (GOOGL / GOOG)
  if (cleanSymbol === 'GOOGL' || cleanSymbol === 'GOOG' || cleanSymbol === 'GOOGLE') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-white flex items-center justify-center p-1 shadow-sm border border-slate-200 ${className}`}
        title="Google"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M88 50 C88 47 87 43 86 40 L50 40 L50 60 L72 60 C71 66 67 72 61 76 L61 88 L78 75 C84 69 88 60 88 50 Z" fill="#4285F4" />
          <path d="M50 88 C61 88 71 84 78 75 L61 62 C58 64 54 66 50 66 C40 66 31 59 28 50 L11 63 C18 78 33 88 50 88 Z" fill="#34A853" />
          <path d="M28 50 C27 47 27 43 27 40 C27 37 27 33 28 30 L11 17 C7 24 5 32 5 40 C5 48 7 56 11 63 L28 50 Z" fill="#FBBC05" />
          <path d="M50 14 C58 14 65 17 70 22 L84 8 C75 0 63 -3 50 0 C33 0 18 10 11 25 L28 38 C31 29 40 22 50 14 Z" fill="#EA4335" />
        </svg>
      </div>
    );
  }

  // MICROSOFT (MSFT)
  if (cleanSymbol === 'MSFT' || cleanSymbol === 'MICROSOFT') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-slate-900 flex items-center justify-center p-1.5 shadow-sm border border-slate-700 ${className}`}
        title="Microsoft"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="32" height="32" fill="#F25022" />
          <rect x="53" y="15" width="32" height="32" fill="#7FBA00" />
          <rect x="15" y="53" width="32" height="32" fill="#00A4EF" />
          <rect x="53" y="53" width="32" height="32" fill="#FFB900" />
        </svg>
      </div>
    );
  }

  // AMAZON (AMZN)
  if (cleanSymbol === 'AMZN' || cleanSymbol === 'AMAZON') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-black flex items-center justify-center p-1.5 shadow-sm border border-slate-700 ${className}`}
        title="Amazon"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="48" fill="#FFFFFF" fontSize="24" fontWeight="900" textAnchor="middle">amazon</text>
          <path d="M25 64 Q50 82 75 64" fill="none" stroke="#FF9900" strokeWidth="6" strokeLinecap="round" />
          <polygon points="75,64 78,54 68,58" fill="#FF9900" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 9. SECTOR-TAILORED GRADIENT BADGES (For Custom Event Stocks: NOVA, MEDIX, etc.)
  // =========================================================================
  if (sector.includes('EV') || sector.includes('Auto') || cleanSymbol === 'NOVA') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xs border border-cyan-400/40 ${className}`}
        title={`${cleanSymbol} - EV & Auto`}
      >
        <Zap className={currentSize.icon} />
      </div>
    );
  }

  if (sector.includes('Pharma') || sector.includes('Health') || sector.includes('Bio') || cleanSymbol === 'MEDIX') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-xs border border-rose-400/40 ${className}`}
        title={`${cleanSymbol} - Healthcare`}
      >
        <Activity className={currentSize.icon} />
      </div>
    );
  }

  if (sector.includes('Renewable') || sector.includes('Clean') || sector.includes('Solar') || cleanSymbol === 'GREENX') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs border border-emerald-400/40 ${className}`}
        title={`${cleanSymbol} - Clean Energy`}
      >
        <Leaf className={currentSize.icon} />
      </div>
    );
  }

  if (sector.includes('Bank') || sector.includes('Finance') || sector.includes('Capital') || cleanSymbol === 'FINEDG' || cleanSymbol === 'FINEDGE') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-xs border border-indigo-400/40 ${className}`}
        title={`${cleanSymbol} - Banking & Finance`}
      >
        <Shield className={currentSize.icon} />
      </div>
    );
  }

  if (sector.includes('Aero') || sector.includes('Defense') || cleanSymbol === 'AEROTECH') {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-xs border border-amber-400/40 ${className}`}
        title={`${cleanSymbol} - Aerospace`}
      >
        <Plane className={currentSize.icon} />
      </div>
    );
  }

  if (sector.includes('IT') || sector.includes('Tech') || sector.includes('Software') || sector.includes('AI')) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-violet-600 to-purple-700 text-white flex items-center justify-center shadow-xs border border-violet-400/40 ${className}`}
        title={`${cleanSymbol} - Technology`}
      >
        <Cpu className={currentSize.icon} />
      </div>
    );
  }

  if (sector.includes('Oil') || sector.includes('Gas') || sector.includes('Energy')) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-xs border border-orange-400/40 ${className}`}
        title={`${cleanSymbol} - Energy`}
      >
        <Fuel className={currentSize.icon} />
      </div>
    );
  }

  if (sector.includes('FMCG') || sector.includes('Retail') || sector.includes('Consumer')) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white flex items-center justify-center shadow-xs border border-fuchsia-400/40 ${className}`}
        title={`${cleanSymbol} - Consumer Goods`}
      >
        <ShoppingBag className={currentSize.icon} />
      </div>
    );
  }

  // =========================================================================
  // 10. DYNAMIC MONOGRAM FALLBACK
  // =========================================================================
  const initials = cleanSymbol.slice(0, 3) || 'STK';

  return (
    <div
      className={`${currentSize.container} shrink-0 bg-gradient-to-br from-slate-800 to-slate-950 text-white font-mono font-black text-xs flex items-center justify-center tracking-tighter shadow-xs border border-slate-700/80 ${className}`}
      title={name || cleanSymbol}
    >
      {initials}
    </div>
  );
};

export default StockLogo;
