import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, ArrowRightLeft, Search, ChevronDown, Check } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface CurrencyInfo {
  code: string;
  name: string;
  country: string;
  flag: string;
}

interface CurrencyConverterProps {
  onClose: () => void;
}

const FALLBACK_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', country: 'United States', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'BDT', name: 'Bangladeshi Taka', country: 'Bangladesh', flag: 'https://flagcdn.com/w40/bd.png' },
  { code: 'EUR', name: 'Euro', country: 'European Union', flag: 'https://flagcdn.com/w40/eu.png' },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'INR', name: 'Indian Rupee', country: 'India', flag: 'https://flagcdn.com/w40/in.png' },
  { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
  { code: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', flag: 'https://flagcdn.com/w40/ae.png' },
  { code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', flag: 'https://flagcdn.com/w40/sa.png' },
];

function CustomSelect({ 
  value, 
  options, 
  onChange,
  alignRight = false
}: { 
  value: string, 
  options: CurrencyInfo[], 
  onChange: (code: string) => void,
  alignRight?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If option is not found initially (maybe still loading), fallback gracefully
  const selectedOption = options.find(o => o.code === value) 
    || FALLBACK_CURRENCIES.find(o => o.code === value) 
    || { code: value, name: '', country: '', flag: 'https://flagcdn.com/w40/un.png' };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.code.toLowerCase().includes(search.toLowerCase()) || 
    o.country.toLowerCase().includes(search.toLowerCase()) ||
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative shrink-0 min-w-[140px]" ref={dropdownRef}>
      <div 
        className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors w-full justify-end"
        onClick={() => setIsOpen(!isOpen)}
        title={`${selectedOption.country} - ${selectedOption.name}`}
      >
        <img src={selectedOption.flag} alt={selectedOption.code} className="w-7 h-5 object-cover rounded shadow-sm shrink-0" onError={(e) => { e.currentTarget.src = 'https://flagcdn.com/w40/un.png' }} />
        <span className="font-bold text-[var(--text-main)] text-lg md:text-xl shrink-0">{selectedOption.code}</span>
        <span className="text-[var(--text-muted)] text-sm truncate hidden sm:block max-w-[100px]">- {selectedOption.name || selectedOption.country}</span>
        <ChevronDown size={20} className={`text-[var(--text-muted)] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-[calc(100%+8px)] ${alignRight ? 'right-0' : 'left-0 sm:right-auto right-0'} w-[280px] sm:w-[320px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden`}
          >
            <div className="p-3 border-b border-[var(--border)] bg-[var(--surface)]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  placeholder="Search 196+ currencies..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--hover-bg)] text-[var(--text-main)] text-sm rounded-xl py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 border border-transparent transition-colors shadow-inner"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto p-2 custom-scrollbar bg-[var(--surface)]">
              {filteredOptions.length > 0 ? filteredOptions.map(c => (
                <div 
                  key={c.code}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${value === c.code ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-[var(--hover-bg)]'}`}
                  onClick={() => {
                    onChange(c.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <img src={c.flag} alt={c.code} className="w-8 h-5 object-cover rounded-sm shadow-sm shrink-0" onError={(e) => { e.currentTarget.src = 'https://flagcdn.com/w40/un.png' }} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[var(--text-main)] text-sm">{c.code}</span>
                    <span className="text-xs text-[var(--text-muted)] truncate">{c.country} - {c.name}</span>
                  </div>
                  {value === c.code && <Check size={16} className="text-blue-500 ml-auto shrink-0" />}
                </div>
              )) : (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">No currencies found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CurrencyConverter({ onClose }: CurrencyConverterProps) {
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(FALLBACK_CURRENCIES);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BDT');
  const [amount, setAmount] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(true);
  
  // Gemini Insight State
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currencyMap = new Map<string, CurrencyInfo>();
        
        // 1. Fetch RestCountries API for comprehensive Currency/Flag mapping
        try {
          const countriesRes = await fetch('https://restcountries.com/v3.1/all');
          const countriesData = await countriesRes.json();
          if (Array.isArray(countriesData)) {
            countriesData.forEach((country: any) => {
              if (country.currencies) {
                Object.entries(country.currencies).forEach(([code, details]: [string, any]) => {
                  if (!currencyMap.has(code)) {
                    currencyMap.set(code, {
                      code,
                      name: details.name,
                      country: country.name.common,
                      flag: country.flags.svg || country.flags.png || 'https://flagcdn.com/w40/un.png'
                    });
                  }
                });
              }
            });
          }
        } catch (e) {
          console.error("Countries API failed, falling back to cached map", e);
          FALLBACK_CURRENCIES.forEach(c => currencyMap.set(c.code, c));
        }

        // Add robust fallback mappings if totally broken
        if (currencyMap.size === 0) {
          FALLBACK_CURRENCIES.forEach(c => currencyMap.set(c.code, c));
        }

        // 2. Fetch Live Exchange Rates (Base USD)
        const ratesRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const ratesData = await ratesRes.json();
        
        if (ratesData && ratesData.rates) {
          setRates(ratesData.rates);
          
          // Generate a fallback dynamically based on fetched rates if the currencyMap is missing items
          Object.keys(ratesData.rates).forEach(code => {
             if (!currencyMap.has(code)) {
                currencyMap.set(code, {
                   code,
                   name: code,
                   country: 'Global',
                   flag: `https://flagcdn.com/w40/${code.toLowerCase().slice(0, 2)}.png` // best effort guess
                });
             }
          });

          // Filter to only what we have rates for
          const availableCurrencies = Array.from(currencyMap.values())
            .filter(c => ratesData.rates[c.code])
            .sort((a, b) => {
              // Push popular currencies to the top somewhat naturally or alphabetically
              return a.code.localeCompare(b.code);
            });
          setCurrencies(availableCurrencies.length > 0 ? availableCurrencies : FALLBACK_CURRENCIES);
        } else {
          throw new Error("Invalid exchange rates object");
        }
      } catch (error) {
        console.error("Failed to fetch currency data", error);
        // Fallback for extreme offline/error scenarios
        setCurrencies(FALLBACK_CURRENCIES);
        setRates({ USD: 1, BDT: 110, EUR: 0.92, GBP: 0.79, INR: 83.3 });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const calculateConvertedAmount = () => {
    if (!rates[fromCurrency] || !rates[toCurrency] || isNaN(Number(amount))) return '0.00';
    
    const amountNum = Number(amount);
    const amountInUSD = amountNum / rates[fromCurrency];
    const convertedAmount = amountInUSD * rates[toCurrency];
    
    return convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const getAiInsight = async () => {
    // Keep insight functionality intact
    setIsLoadingInsight(true);
    setInsight(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setInsight("AI সুবিধা পাওয়ার জন্য API Key সেট করা নেই।");
        setIsLoadingInsight(false);
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the live market today, what is the economic context or trend between the currency ${fromCurrency} and ${toCurrency}? Mention recent factors affecting this exchange rate. Keep it brief and in Bengali. Make it interesting.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      
      setInsight(response.text || "দুঃখিত, কোনো তথ্য পাওয়া যায়নি।");
    } catch (error) {
      console.error("Gemini Error:", error);
      setInsight("লাইভ তথ্য আনতে সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-[var(--surface)] text-[var(--text-main)] w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden"
      >
        <div className="p-6 md:p-10 overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8 sm:mb-10 shrink-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3 mb-1">
                <span className="p-2 sm:p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl sm:rounded-2xl shadow-sm">
                  <ArrowRightLeft size={24} className="sm:hidden" />
                  <ArrowRightLeft size={28} className="hidden sm:block" />
                </span>
                মুদ্রা রূপান্তর
              </h2>
              <p className="text-[var(--text-muted)] text-sm sm:text-base font-medium ml-[52px] sm:ml-[60px]">
                লাইভ এক্সচেঞ্জ রেট এবং ১৯৬+ দেশের কারেন্সি কনভার্টার
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-[var(--hover-bg)] bg-[var(--bg)] border border-[var(--border)] rounded-full transition-colors shadow-sm self-start"
            >
              <X size={20} className="text-[var(--text-main)]" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="text-[var(--text-muted)] font-medium">লাইভ ডাটা লোড হচ্ছে...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* XE.com Style Layout (Side-by-Side Boxes) */}
              <div className="flex flex-col lg:flex-row items-center gap-4 relative w-full mb-8">
                
                {/* FROM BOX */}
                <div className="w-full flex-1 bg-[var(--bg)] rounded-2xl border-2 border-[var(--border)] hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all p-4">
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-3 uppercase">হতে (From)</label>
                  <div className="flex items-center justify-between gap-4">
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-1/3 min-w-[80px] bg-transparent text-3xl sm:text-4xl font-black text-[var(--text-main)] outline-none"
                      placeholder="0.00"
                    />
                    <div className="w-px flex-self-stretch bg-[var(--border)] relative -top-2 -bottom-2 shrink-0"></div>
                    <CustomSelect 
                      value={fromCurrency} 
                      options={currencies} 
                      onChange={setFromCurrency} 
                    />
                  </div>
                </div>

                {/* SWAP BUTTON */}
                <button 
                  onClick={handleSwap}
                  className="z-10 p-3 sm:p-4 bg-[var(--surface)] border-2 border-[var(--border)] text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 rounded-full shadow-lg mx-auto lg:mx-[-24px] my-[-16px] lg:my-0 shrink-0 transition-all active:scale-90"
                  aria-label="Swap currencies"
                >
                  <ArrowRightLeft size={24} />
                </button>

                {/* TO BOX */}
                <div className="w-full flex-1 bg-[var(--bg)] rounded-2xl border-2 border-[var(--border)] hover:border-blue-400 transition-all p-4">
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-3 uppercase">তে (To)</label>
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-1/2 min-w-[80px] text-3xl sm:text-4xl font-black text-[var(--text-main)] truncate overflow-hidden" title={calculateConvertedAmount()}>
                      {calculateConvertedAmount()}
                    </div>
                    <div className="w-px flex-self-stretch bg-[var(--border)] relative -top-2 -bottom-2 shrink-0"></div>
                    <CustomSelect 
                      value={toCurrency} 
                      options={currencies} 
                      onChange={setToCurrency} 
                      alignRight={true}
                    />
                  </div>
                </div>

              </div>

              {/* Conversion Result Summary Text */}
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-6 py-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-center font-medium shadow-sm mb-6">
                ১ <span className="font-bold">{fromCurrency}</span> = <span className="font-bold">{rates[toCurrency] && rates[fromCurrency] ? (rates[toCurrency] / rates[fromCurrency]).toFixed(4) : '0.00'}</span> <span className="font-bold">{toCurrency}</span>
              </div>

              {/* Live Market Insights (Gemini) */}
              <div className="mt-8 pt-6 border-t border-[var(--border)] shrink-0 pb-16">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                      <Search size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-lg text-[var(--text-main)]">
                      Google Search Grounding <span className="text-xs ml-2 font-normal text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">Beta</span>
                    </h3>
                  </div>
                  {!insight && !isLoadingInsight && (
                    <button 
                      onClick={getAiInsight}
                      className="text-sm bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-full font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-md flex items-center gap-2"
                    >
                      <img src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2cbc7df27f9e1tx.gif" alt="AI" className="w-4 h-4 brightness-200" />
                      লাইভ ইনসাইট দেখুন
                    </button>
                  )}
                </div>
                
                {isLoadingInsight ? (
                  <div className="flex items-center justify-center p-8 bg-[var(--bg)] rounded-2xl border border-[var(--border)] border-dashed">
                    <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] font-medium">
                      <Loader2 className="animate-spin text-blue-500" size={20} /> 
                      Gemini AI লাইভ মার্কেট থেকে তথ্য সংগ্রহ করছে...
                    </div>
                  </div>
                ) : insight ? (
                  <div className="text-[var(--text-main)] leading-loose bg-[var(--bg)] p-6 md:p-8 rounded-2xl border border-[var(--border)] shadow-sm text-sm sm:text-base">
                    {insight}
                  </div>
                ) : null}
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
