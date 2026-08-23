import React, { useState } from 'react';
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

// -------------------------------------------------------------
// Verified Authentic Official Corporate Logos (High-Res CDN / Wikimedia Assets)
// -------------------------------------------------------------
const OFFICIAL_BRAND_LOGOS: Record<string, string> = {
  // Reliance Industries (Official Blue & Red Flame Logo)
  'RELIANCE': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Reliance_Industries_Logo.svg/120px-Reliance_Industries_Logo.svg.png',
  'RIL': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Reliance_Industries_Logo.svg/120px-Reliance_Industries_Logo.svg.png',

  // Infosys (Official Corporate Signature Logo)
  'INFY': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/120px-Infosys_logo.svg.png',
  'INFOSYS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/120px-Infosys_logo.svg.png',

  // HDFC Bank (Official Blue and Red Square Emblem)
  'HDFCBANK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/120px-HDFC_Bank_Logo.svg.png',
  'HDFC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/120px-HDFC_Bank_Logo.svg.png',

  // Tata Consultancy Services & Tata Group
  'TCS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/120px-Tata_Consultancy_Services_Logo.svg.png',
  'TATAMOTORS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/120px-Tata_logo.svg.png',
  'TATASTEEL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/120px-Tata_logo.svg.png',
  'TATAPOWER': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/120px-Tata_logo.svg.png',
  'TATACONSUM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/120px-Tata_logo.svg.png',

  // ICICI Bank
  'ICICIBANK': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/ICICI_Bank_Logo.svg/120px-ICICI_Bank_Logo.svg.png',
  'ICICI': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/ICICI_Bank_Logo.svg/120px-ICICI_Bank_Logo.svg.png',

  // State Bank of India
  'SBIN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/120px-SBI-logo.svg.png',
  'SBI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/120px-SBI-logo.svg.png',

  // Other Major Indian Corporates
  'KOTAKBANK': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Kotak_Mahindra_Bank_logo.svg/120px-Kotak_Mahindra_Bank_logo.svg.png',
  'AXISBANK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Axis_Bank_logo.svg/120px-Axis_Bank_logo.svg.png',
  'BAJFINANCE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bajaj_Finserv_Logo.svg/120px-Bajaj_Finserv_Logo.svg.png',
  'BAJAJFINSV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bajaj_Finserv_Logo.svg/120px-Bajaj_Finserv_Logo.svg.png',
  'BHARTIARTL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Bharti_Airtel_Logo.svg/120px-Bharti_Airtel_Logo.svg.png',
  'AIRTEL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Bharti_Airtel_Logo.svg/120px-Bharti_Airtel_Logo.svg.png',
  'ITC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/ITC_Limited_Logo.svg/120px-ITC_Limited_Logo.svg.png',
  'WIPRO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/120px-Wipro_Primary_Logo_Color_RGB.svg.png',
  'HCLTECH': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/HCL_Tech_logo.svg/120px-HCL_Tech_logo.svg.png',
  'LT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Larsen%26Toubro_logo.svg/120px-Larsen%26Toubro_logo.svg.png',
  'MARUTI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Maruti_Suzuki_logo.svg/120px-Maruti_Suzuki_logo.svg.png',
  'TITAN': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Titan_Company_Logo.svg/120px-Titan_Company_Logo.svg.png',
  'ZOMATO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Zomato_logo.png/120px-Zomato_logo.png',
  'SWIGGY': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/120px-Swiggy_logo.svg.png',
  'HINDUNILVR': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Hindustan_Unilever_Logo.svg/120px-Hindustan_Unilever_Logo.svg.png',
  'SUNPHARMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sun_Pharma_logo.svg/120px-Sun_Pharma_logo.svg.png',
  'CIPLA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Cipla_logo.svg/120px-Cipla_logo.svg.png',

  // Global Giants
  'AAPL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/120px-Apple_logo_black.svg.png',
  'MSFT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/120px-Microsoft_logo_%282012%29.svg.png',
  'GOOGL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/120px-Google_2015_logo.svg.png',
  'GOOG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/120px-Google_2015_logo.svg.png',
  'NVDA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/120px-Nvidia_logo.svg.png',
  'TSLA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/120px-Tesla_logo.png',
  'AMZN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/120px-Amazon_logo.svg.png',
  'META': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/120px-Meta_Platforms_Inc._logo.svg.png',
};

// -------------------------------------------------------------
// Real Corporate Website Domains (Tier 2 Icon Fallback)
// -------------------------------------------------------------
const REAL_COMPANY_DOMAINS: Record<string, string> = {
  'HDFCBANK': 'hdfcbank.com',
  'HDFC': 'hdfcbank.com',
  'ICICIBANK': 'icicibank.com',
  'ICICI': 'icicibank.com',
  'SBIN': 'sbi.co.in',
  'SBI': 'sbi.co.in',
  'KOTAKBANK': 'kotak.com',
  'AXISBANK': 'axisbank.com',
  'BAJFINANCE': 'bajajfinserv.in',
  'BAJAJFINSV': 'bajajfinserv.in',
  'TCS': 'tcs.com',
  'INFY': 'infosys.com',
  'INFOSYS': 'infosys.com',
  'WIPRO': 'wipro.com',
  'HCLTECH': 'hcltech.com',
  'TECHM': 'techmahindra.com',
  'LTIM': 'ltimindtree.com',
  'TATAMOTORS': 'tatamotors.com',
  'M&M': 'mahindra.com',
  'MARUTI': 'marutisuzuki.com',
  'RELIANCE': 'ril.com',
  'RIL': 'ril.com',
  'ADANIGREEN': 'adanigreenenergy.com',
  'ADANIENT': 'adanienterprises.com',
  'ADANIPORTS': 'adaniports.com',
  'TATAPOWER': 'tatapower.com',
  'NTPC': 'ntpc.co.in',
  'ONGC': 'ongcindia.com',
  'POWERGRID': 'powergrid.in',
  'ITC': 'itcportal.com',
  'HINDUNILVR': 'hul.co.in',
  'NESTLEIND': 'nestle.in',
  'BRITANNIA': 'britannia.co.in',
  'TITAN': 'titancompany.in',
  'ZOMATO': 'zomato.com',
  'SWIGGY': 'swiggy.com',
  'SUNPHARMA': 'sunpharma.com',
  'DRREDDY': 'drreddys.com',
  'CIPLA': 'cipla.com',
  'APOLLOHOSP': 'apollohospitals.com',
  'TATASTEEL': 'tatasteel.com',
  'JSWSTEEL': 'jsw.in',
  'LT': 'larsentoubro.com',
  'BHARTIARTL': 'airtel.in',
  'NVDA': 'nvidia.com',
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'TSLA': 'tesla.com',
  'AMZN': 'amazon.com',
  'META': 'meta.com',
};

export const StockLogo: React.FC<StockLogoProps> = ({
  symbol = '',
  name = '',
  sector = '',
  logoUrl,
  size = 'md',
  className = '',
}) => {
  const [imgErrorIndex, setImgErrorIndex] = useState(0);

  const cleanSymbol = symbol.trim().toUpperCase();

  // Dimensions
  const sizeMap = {
    xs: { container: 'w-5 h-5 rounded-md', img: 'w-3.5 h-3.5', icon: 'w-3 h-3' },
    sm: { container: 'w-7 h-7 rounded-lg', img: 'w-5 h-5', icon: 'w-3.5 h-3.5' },
    md: { container: 'w-9 h-9 rounded-xl', img: 'w-6 h-6', icon: 'w-4 h-4' },
    lg: { container: 'w-11 h-11 rounded-2xl', img: 'w-8 h-8', icon: 'w-5 h-5' },
    xl: { container: 'w-14 h-14 rounded-2xl', img: 'w-10 h-10', icon: 'w-7 h-7' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Build candidate URL list
  const verifiedUrl = OFFICIAL_BRAND_LOGOS[cleanSymbol] || logoUrl;
  const domain = REAL_COMPANY_DOMAINS[cleanSymbol];

  const candidateUrls: string[] = [];
  if (verifiedUrl) candidateUrls.push(verifiedUrl);
  if (domain) {
    candidateUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    candidateUrls.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  const currentLogoSrc = candidateUrls[imgErrorIndex];

  // If a real logo URL is available
  if (currentLogoSrc) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-white flex items-center justify-center p-1 shadow-xs border border-slate-200/80 dark:border-white/20 overflow-hidden ${className}`}
        title={name || cleanSymbol}
      >
        <img
          src={currentLogoSrc}
          alt={name || cleanSymbol}
          className={`${currentSize.img} object-contain transition-opacity duration-200`}
          loading="lazy"
          onError={() => {
            setImgErrorIndex((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SECTOR-TAILORED BADGES (For Custom Event Stocks: NOVA, MEDIX, etc.)
  // -------------------------------------------------------------
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

  if (sector.includes('Bank') || sector.includes('Finance') || sector.includes('Capital') || cleanSymbol === 'FINEDGE') {
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

  // -------------------------------------------------------------
  // UNIVERSAL DYNAMIC MONOGRAM FALLBACK
  // -------------------------------------------------------------
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
