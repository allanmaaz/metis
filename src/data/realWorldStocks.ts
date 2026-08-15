export interface RealWorldStock {
  symbol: string;
  name: string;
  sector: string;
  defaultPrice: number;
}

export const REAL_WORLD_CATEGORIES = [
  'All Sectors',
  'IT & Tech',
  'Banking & Finance',
  'Automotive & EV',
  'Energy & Power',
  'FMCG & Consumer',
  'Pharma & Healthcare',
  'Metals & Infra',
  'Global Giants',
] as const;

export const REAL_WORLD_STOCKS: RealWorldStock[] = [
  // IT & Tech
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT & Tech', defaultPrice: 3850 },
  { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT & Tech', defaultPrice: 1720 },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'IT & Tech', defaultPrice: 480 },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT & Tech', defaultPrice: 1650 },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT & Tech', defaultPrice: 1420 },
  { symbol: 'LTIM', name: 'LTIMindtree Limited', sector: 'IT & Tech', defaultPrice: 5200 },

  // Banking & Finance
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking & Finance', defaultPrice: 1680 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Banking & Finance', defaultPrice: 1240 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking & Finance', defaultPrice: 810 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking & Finance', defaultPrice: 1790 },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', sector: 'Banking & Finance', defaultPrice: 1150 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', sector: 'Banking & Finance', defaultPrice: 6950 },

  // Automotive & EV
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Automotive & EV', defaultPrice: 960 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Automotive & EV', defaultPrice: 2850 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', sector: 'Automotive & EV', defaultPrice: 11800 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Limited', sector: 'Automotive & EV', defaultPrice: 9400 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Automotive & EV', defaultPrice: 4600 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Automotive & EV', defaultPrice: 4800 },

  // Energy & Power
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy & Power', defaultPrice: 2980 },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy', sector: 'Energy & Power', defaultPrice: 1820 },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd', sector: 'Energy & Power', defaultPrice: 420 },
  { symbol: 'NTPC', name: 'NTPC Limited', sector: 'Energy & Power', defaultPrice: 380 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Energy & Power', defaultPrice: 260 },
  { symbol: 'POWERGRID', name: 'Power Grid Corp of India', sector: 'Energy & Power', defaultPrice: 310 },

  // FMCG & Consumer
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG & Consumer', defaultPrice: 475 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG & Consumer', defaultPrice: 2520 },
  { symbol: 'NESTLEIND', name: 'Nestle India Limited', sector: 'FMCG & Consumer', defaultPrice: 2450 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG & Consumer', defaultPrice: 5100 },
  { symbol: 'TITAN', name: 'Titan Company Limited', sector: 'FMCG & Consumer', defaultPrice: 3450 },
  { symbol: 'ZOMATO', name: 'Zomato Limited', sector: 'FMCG & Consumer', defaultPrice: 260 },
  { symbol: 'SWIGGY', name: 'Swiggy Limited', sector: 'FMCG & Consumer', defaultPrice: 480 },

  // Pharma & Healthcare
  { symbol: 'SUNPHARMA', name: 'Sun Pharma Industries', sector: 'Pharma & Healthcare', defaultPrice: 1750 },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", sector: 'Pharma & Healthcare', defaultPrice: 6600 },
  { symbol: 'CIPLA', name: 'Cipla Limited', sector: 'Pharma & Healthcare', defaultPrice: 1520 },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', sector: 'Pharma & Healthcare', defaultPrice: 6800 },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd", sector: 'Pharma & Healthcare', defaultPrice: 4900 },

  // Metals & Infrastructure
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', sector: 'Metals & Infra', defaultPrice: 155 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', sector: 'Metals & Infra', defaultPrice: 940 },
  { symbol: 'LT', name: 'Larsen & Toubro Limited', sector: 'Metals & Infra', defaultPrice: 3600 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ', sector: 'Metals & Infra', defaultPrice: 1420 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited', sector: 'Metals & Infra', defaultPrice: 11200 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Metals & Infra', defaultPrice: 1580 },

  // Global Giants
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Global Giants', defaultPrice: 11800 },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Global Giants', defaultPrice: 19500 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Global Giants', defaultPrice: 36500 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', sector: 'Global Giants', defaultPrice: 14500 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Global Giants', defaultPrice: 21000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Global Giants', defaultPrice: 16800 },
];
