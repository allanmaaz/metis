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
// Real Company Official Domain Mapping
// -------------------------------------------------------------
const REAL_COMPANY_DOMAINS: Record<string, string> = {
  // Banking & Financial Services
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
  'INDUSINDBK': 'indusind.com',
  'PNB': 'pnbindia.in',
  'BANKBARODA': 'bankofbaroda.in',
  'YESBANK': 'yesbank.in',
  'IDFCFIRSTB': 'idfcfirstbank.com',

  // IT, Tech & Software
  'TCS': 'tcs.com',
  'INFY': 'infosys.com',
  'INFOSYS': 'infosys.com',
  'WIPRO': 'wipro.com',
  'HCLTECH': 'hcltech.com',
  'TECHM': 'techmahindra.com',
  'LTIM': 'ltimindtree.com',
  'PERSISTENT': 'persistent.com',
  'COFORGE': 'coforge.com',
  'MPHASIS': 'mphasis.com',
  'ORCL': 'oracle.com',
  'ACCENTURE': 'accenture.com',

  // Automotive & EV
  'TATAMOTORS': 'tatamotors.com',
  'M&M': 'mahindra.com',
  'MARUTI': 'marutisuzuki.com',
  'BAJAJ-AUTO': 'bajajauto.com',
  'HEROMOTOCO': 'heromotocorp.com',
  'EICHERMOT': 'eicher.in',
  'TVSMOTOR': 'tvsmotor.com',
  'ASHOKLEY': 'ashokleyland.com',
  'BOSCHLTD': 'bosch.in',
  'MRF': 'mrftyres.com',

  // Energy, Power, Oil & Gas
  'RELIANCE': 'ril.com',
  'RIL': 'ril.com',
  'ADANIGREEN': 'adanigreenenergy.com',
  'ADANIENT': 'adanienterprises.com',
  'ADANIPORTS': 'adaniports.com',
  'TATAPOWER': 'tatapower.com',
  'NTPC': 'ntpc.co.in',
  'ONGC': 'ongcindia.com',
  'POWERGRID': 'powergrid.in',
  'IOC': 'iocl.com',
  'BPCL': 'bharatpetroleum.in',
  'COALINDIA': 'coalindia.in',
  'GAIL': 'gailonline.com',

  // FMCG, Retail & Consumer
  'ITC': 'itcportal.com',
  'HINDUNILVR': 'hul.co.in',
  'NESTLEIND': 'nestle.in',
  'BRITANNIA': 'britannia.co.in',
  'TITAN': 'titancompany.in',
  'ZOMATO': 'zomato.com',
  'SWIGGY': 'swiggy.com',
  'NYKAA': 'nykaa.com',
  'PAYTM': 'paytm.com',
  'DMART': 'dmartindia.com',
  'DABUR': 'dabur.com',
  'MARICO': 'marico.com',
  'GODREJCP': 'godrejcp.com',
  'ASIANPAINT': 'asianpaints.com',
  'BERGEPAINT': 'bergerpaints.com',
  'PIDILITIND': 'pidilite.com',
  'TRENT': 'trentlimited.com',
  'TATACONSUM': 'tataconsumer.com',

  // Telecom & Media
  'BHARTIARTL': 'airtel.in',
  'AIRTEL': 'airtel.in',
  'IDEA': 'myvi.in',
  'ZEEL': 'zee.com',
  'PVRINOX': 'pvrcinemas.com',

  // Pharma & Healthcare
  'SUNPHARMA': 'sunpharma.com',
  'DRREDDY': 'drreddys.com',
  'CIPLA': 'cipla.com',
  'APOLLOHOSP': 'apollohospitals.com',
  'DIVISLAB': 'divislabs.com',
  'LUPIN': 'lupin.com',
  'BIOCON': 'biocon.com',
  'MANKIND': 'mankindpharma.com',
  'MAXHEALTH': 'maxhealthcare.in',
  'TORNTPHARM': 'torrentpharma.com',

  // Metals, Infrastructure & Cement
  'TATASTEEL': 'tatasteel.com',
  'JSWSTEEL': 'jsw.in',
  'HINDALCO': 'hindalco.com',
  'LT': 'larsentoubro.com',
  'ULTRACEMCO': 'ultratechcement.com',
  'GRASIM': 'grasim.com',
  'VEDL': 'vedantalimited.com',
  'JINDALSTEL': 'jindalsteelpower.com',
  'SHREECEM': 'shreecement.com',
  'AMBUJACEM': 'ambujacement.com',

  // Global Giants
  'NVDA': 'nvidia.com',
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'TSLA': 'tesla.com',
  'AMZN': 'amazon.com',
  'META': 'meta.com',
  'NFLX': 'netflix.com',
  'AMD': 'amd.com',
  'INTC': 'intel.com',
  'BABA': 'alibaba.com',
};

// -------------------------------------------------------------
// Direct High-Resolution Official Brand Assets / CDN URLs
// -------------------------------------------------------------
const DIRECT_BRAND_LOGOS: Record<string, string> = {
  'HDFCBANK': 'https://companiesmarketcap.com/img/company-logos/64/HDB.webp',
  'HDFC': 'https://companiesmarketcap.com/img/company-logos/64/HDB.webp',
  'RELIANCE': 'https://companiesmarketcap.com/img/company-logos/64/RELIANCE.NS.webp',
  'RIL': 'https://companiesmarketcap.com/img/company-logos/64/RELIANCE.NS.webp',
  'TCS': 'https://companiesmarketcap.com/img/company-logos/64/TCS.NS.webp',
  'INFY': 'https://companiesmarketcap.com/img/company-logos/64/INFY.webp',
  'INFOSYS': 'https://companiesmarketcap.com/img/company-logos/64/INFY.webp',
  'ICICIBANK': 'https://companiesmarketcap.com/img/company-logos/64/IBN.webp',
  'SBIN': 'https://companiesmarketcap.com/img/company-logos/64/SBIN.NS.webp',
  'SBI': 'https://companiesmarketcap.com/img/company-logos/64/SBIN.NS.webp',
  'TATAMOTORS': 'https://companiesmarketcap.com/img/company-logos/64/TTM.webp',
  'BHARTIARTL': 'https://companiesmarketcap.com/img/company-logos/64/BHARTIARTL.NS.webp',
  'ITC': 'https://companiesmarketcap.com/img/company-logos/64/ITC.NS.webp',
  'KOTAKBANK': 'https://companiesmarketcap.com/img/company-logos/64/KOTAKBANK.NS.webp',
  'LT': 'https://companiesmarketcap.com/img/company-logos/64/LT.NS.webp',
  'WIPRO': 'https://companiesmarketcap.com/img/company-logos/64/WIT.webp',
  'MARUTI': 'https://companiesmarketcap.com/img/company-logos/64/MARUTI.NS.webp',
  'TITAN': 'https://companiesmarketcap.com/img/company-logos/64/TITAN.NS.webp',
  'ZOMATO': 'https://companiesmarketcap.com/img/company-logos/64/ZOMATO.NS.webp',
  'HINDUNILVR': 'https://companiesmarketcap.com/img/company-logos/64/HINDUNILVR.NS.webp',
  'SUNPHARMA': 'https://companiesmarketcap.com/img/company-logos/64/SUNPHARMA.NS.webp',
  'TATASTEEL': 'https://companiesmarketcap.com/img/company-logos/64/TATASTEEL.NS.webp',
  'AAPL': 'https://companiesmarketcap.com/img/company-logos/64/AAPL.webp',
  'MSFT': 'https://companiesmarketcap.com/img/company-logos/64/MSFT.webp',
  'GOOGL': 'https://companiesmarketcap.com/img/company-logos/64/GOOG.webp',
  'GOOG': 'https://companiesmarketcap.com/img/company-logos/64/GOOG.webp',
  'NVDA': 'https://companiesmarketcap.com/img/company-logos/64/NVDA.webp',
  'TSLA': 'https://companiesmarketcap.com/img/company-logos/64/TSLA.webp',
  'AMZN': 'https://companiesmarketcap.com/img/company-logos/64/AMZN.webp',
  'META': 'https://companiesmarketcap.com/img/company-logos/64/META.webp',
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
    xs: { container: 'w-5 h-5 rounded-md text-[9px]', img: 'w-4 h-4', icon: 'w-3 h-3' },
    sm: { container: 'w-7 h-7 rounded-lg text-[10px]', img: 'w-5 h-5', icon: 'w-3.5 h-3.5' },
    md: { container: 'w-9 h-9 rounded-xl text-xs', img: 'w-7 h-7', icon: 'w-4 h-4' },
    lg: { container: 'w-11 h-11 rounded-2xl text-sm', img: 'w-9 h-9', icon: 'w-5 h-5' },
    xl: { container: 'w-14 h-14 rounded-2xl text-base', img: 'w-11 h-11', icon: 'w-7 h-7' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Determine Real Logo Candidates
  const domain = REAL_COMPANY_DOMAINS[cleanSymbol];
  const directUrl = DIRECT_BRAND_LOGOS[cleanSymbol] || logoUrl;

  const candidateUrls: string[] = [];
  if (directUrl) candidateUrls.push(directUrl);
  if (domain) {
    candidateUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    candidateUrls.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  const currentLogoSrc = candidateUrls[imgErrorIndex];

  // If a real logo URL is available and hasn't failed all sources
  if (currentLogoSrc) {
    return (
      <div
        className={`${currentSize.container} shrink-0 bg-white dark:bg-slate-900/90 flex items-center justify-center p-1 shadow-xs border border-slate-200/80 dark:border-white/10 overflow-hidden ${className}`}
        title={name || cleanSymbol}
      >
        <img
          src={currentLogoSrc}
          alt={name || cleanSymbol}
          className={`${currentSize.img} object-contain rounded-sm transition-opacity duration-200`}
          loading="lazy"
          onError={() => {
            setImgErrorIndex((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SECTOR-TAILORED BADGES (For Custom / Simulated Stocks: NOVA, MEDIX, GREENX, etc.)
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
      className={`${currentSize.container} shrink-0 bg-gradient-to-br from-slate-800 to-slate-950 text-white font-mono font-black flex items-center justify-center tracking-tighter shadow-xs border border-slate-700/80 ${className}`}
      title={name || cleanSymbol}
    >
      {initials}
    </div>
  );
};

export default StockLogo;
