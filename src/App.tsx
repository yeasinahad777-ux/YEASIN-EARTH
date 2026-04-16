import { useState, useEffect } from 'react';
import { countries, continents } from './data';
import { Moon, Sun, Search, X, Loader2, MapPin, PenTool } from 'lucide-react';
import GlobeViz from './GlobeViz';
import QuizSection from './QuizSection';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API only when needed to prevent crashes if key is missing
let ai: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({ apiKey });
    }
  }
  return ai;
};

interface CountryDetails {
  name: string;
  officialName: string;
  population: number;
  currencies: string;
  languages: string;
  region: string;
  subregion: string;
  flagUrl: string;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [globeFocusCode, setGlobeFocusCode] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(null);
  const [countrySummary, setCountrySummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedYEASINEARTH');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedYEASINEARTH', 'true');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchCountryDetails = async (code: string, localName: string) => {
    setSelectedCountryCode(code);
    setGlobeFocusCode(code);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // স্ক্রল করে গ্লোবে নিয়ে যাবে
    setIsLoadingDetails(true);
    setIsLoadingSummary(true);
    setCountryDetails(null);
    setCountrySummary(null);
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
      const data = await res.json();
      if (data && data[0]) {
        const country = data[0];
        const currencies = country.currencies 
          ? Object.values(country.currencies).map((c: any) => c.name).join(', ') 
          : 'অজানা';
        const languages = country.languages 
          ? Object.values(country.languages).join(', ') 
          : 'অজানা';
          
        setCountryDetails({
          name: localName,
          officialName: country.name.official,
          population: country.population,
          currencies,
          languages,
          region: country.region,
          subregion: country.subregion || 'অজানা',
          flagUrl: country.flags.svg || country.flags.png
        });
        
        // Show details immediately without waiting for AI
        setIsLoadingDetails(false);

        // Fetch summary from Gemini
        try {
          const aiClient = getAiClient();
          if (!aiClient) {
            setCountrySummary("AI সারাংশ দেখার জন্য API Key সেট করা নেই।");
            return;
          }
          
          const response = await aiClient.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Provide a short, engaging geographical summary of ${localName} in Bengali. Mention its capital, key geographical features, and a famous landmark. Keep it under 3-4 sentences.`,
            config: {
              tools: [{ googleSearch: {} }],
            }
          });
          setCountrySummary(response.text);
        } catch (geminiError: any) {
          console.error("Failed to fetch summary from Gemini", geminiError);
          setCountrySummary(`তথ্য লোড করতে সমস্যা হয়েছে: ${geminiError?.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch country details", error);
    } finally {
      setIsLoadingDetails(false);
      setIsLoadingSummary(false);
    }
  };

  const filteredCountries = countries.filter(country => {
    const matchesContinent = selectedContinent === 'All' || country.continent === selectedContinent;
    const searchLower = searchQuery.toLowerCase();
    
    let englishName = '';
    try {
      englishName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country.code.toUpperCase()) || '';
    } catch (e) {
      // Fallback if Intl API fails
    }

    const matchesSearch = country.country.toLowerCase().includes(searchLower) || 
                          country.capital.toLowerCase().includes(searchLower) ||
                          englishName.toLowerCase().includes(searchLower) ||
                          country.code.toLowerCase() === searchLower;
                          
    return matchesContinent && matchesSearch;
  });

  useEffect(() => {
    if (searchQuery.trim() !== '' && filteredCountries.length === 1) {
      setGlobeFocusCode(filteredCountries[0].code);
    } else if (searchQuery.trim() === '') {
      setGlobeFocusCode(null);
    }
  }, [searchQuery, filteredCountries.length]);

  const filterOptions = ['All', 'এশিয়া', 'ইউরোপ', 'আফ্রিকা', 'উত্তর আমেরিকা', 'দক্ষিণ আমেরিকা', 'ওশেনিয়া'];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text-main)] font-sans transition-colors duration-300">
      
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 mx-auto mb-6 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center">
              <span className="text-4xl">🌍</span>
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-main)] mb-4">Welcome to YEASIN EARTH</h2>
            <p className="text-[var(--text-muted)] mb-8">
              Explore the 196 countries of the world, learn exciting geographical facts, and test your knowledge with our global quiz!
            </p>
            <button 
              onClick={() => setShowWelcome(false)}
              className="bg-[var(--primary)] text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity w-full shadow-lg"
            >
              Let's Explore
            </button>
          </div>
        </div>
      )}

      <header className="bg-[var(--surface)] px-6 md:px-10 py-5 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <img 
              src="https://i.postimg.cc/hjm8xZYr/1000105481-01-2.jpg" 
              alt="YEASIN EARTH" 
              className="w-full h-full rounded-full object-cover border-2 border-[var(--primary)] shadow-sm"
              onError={(e) => {
                e.currentTarget.src = "https://ui-avatars.com/api/?name=YE&background=0d9488&color=fff";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">YEASIN EARTH</h1>
            <p className="text-xs text-[var(--text-muted)]">বিশ্বের ১৯৬ দেশের সম্পূর্ণ তথ্যভাণ্ডার ও কুইজ টেস্ট</p>
            <p className="text-sm md:text-base text-[var(--primary)] font-bold mt-1.5 animate-pulse">
              আরও তথ্য নিচে দেওয়া হলো 👇
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
          {!isExamMode && (
            <div className="relative flex-1 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border-2 border-[var(--border)] rounded-full text-sm bg-[var(--bg)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition-colors shadow-sm"
                placeholder="দেশ বা রাজধানী খুঁজুন..."
              />
            </div>
          )}
          <button 
            onClick={() => setIsExamMode(!isExamMode)}
            className={`px-4 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
              isExamMode 
                ? 'bg-[var(--hover-bg)] text-[var(--text-main)] border border-[var(--border)] hover:bg-[var(--border)]' 
                : 'bg-red-500 text-white hover:bg-red-600 animate-[pulse_2s_infinite]'
            }`}
          >
            <PenTool size={16} />
            {isExamMode ? 'হোম পেজ' : 'MCQ পরীক্ষা দিন'}
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-[var(--hover-bg)] text-[var(--text-main)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors flex items-center justify-center shrink-0"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {isExamMode ? (
        <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
          <QuizSection onExit={() => setIsExamMode(false)} />
        </main>
      ) : (
        <main className="flex-1 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 md:gap-10 max-w-[1400px] mx-auto w-full">
          <aside className="flex flex-col gap-6">
          <div>
            <h3 className="text-[11px] uppercase text-[var(--text-muted)] mb-4 tracking-widest font-semibold">মহাদেশসমূহ</h3>
            <ul className="flex flex-col">
              {filterOptions.map(option => {
                const isActive = selectedContinent === option;
                const count = option === 'All' ? countries.length : countries.filter(c => c.continent === option).length;
                const label = option === 'All' ? '🌍 সব দেশ' : 
                              option === 'এশিয়া' ? '🌏 এশিয়া' :
                              option === 'ইউরোপ' ? '🌍 ইউরোপ' :
                              option === 'আফ্রিকা' ? '🌍 আফ্রিকা' :
                              option === 'উত্তর আমেরিকা' ? '🌎 উঃ আমেরিকা' : 
                              option === 'দক্ষিণ আমেরিকা' ? '🌎 দঃ আমেরিকা' : '🌊 ওশেনিয়া';
                return (
                  <li key={option}>
                    <button
                      onClick={() => setSelectedContinent(option)}
                      className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex justify-between items-center text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[var(--primary)] text-white' 
                          : 'text-[var(--text-main)] hover:bg-[var(--hover-bg)]'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? 'bg-black/20' : 'bg-black/5 dark:bg-white/10'}`}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <section className="flex flex-col gap-6 min-w-0">
          <div className="flex flex-col gap-4 mb-2">
            <h2 className="text-center text-[var(--primary)] text-xl font-bold tracking-tight">ঘুরিয়ে দেখুন আমাদের পৃথিবী</h2>
            <GlobeViz focusCountryCode={globeFocusCode} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {continents.map((cont, idx) => (
              <div key={idx} className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] transition-colors duration-300">
                <span className="block text-xs text-[var(--text-muted)] mb-1">{cont.location}</span>
                <strong className="block text-2xl text-[var(--primary)] mb-1">{cont.count.replace('টি দেশ', '').replace('কোনো দেশ নেই', '০')}</strong>
                <span className="block text-sm font-medium text-[var(--text-main)]">{cont.icon} {cont.name}</span>
              </div>
            ))}
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden flex-1 flex flex-col transition-colors duration-300">
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="bg-[var(--bg)] p-4 text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] font-semibold whitespace-nowrap">মহাদেশ</th>
                    <th className="bg-[var(--bg)] p-4 text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] font-semibold whitespace-nowrap">পতাকা ও দেশ</th>
                    <th className="bg-[var(--bg)] p-4 text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] font-semibold whitespace-nowrap">রাজধানী</th>
                    <th className="bg-[var(--bg)] p-4 text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] font-semibold whitespace-nowrap">প্রতিবেশী দেশ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCountries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">
                        কোনো দেশ পাওয়া যায়নি!
                      </td>
                    </tr>
                  ) : (
                    filteredCountries.map((country, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => fetchCountryDetails(country.code, country.country)}
                        className="hover:bg-[var(--hover-bg)] transition-colors duration-150 cursor-pointer"
                      >
                        <td className="p-4 text-sm border-b border-[var(--border)] text-[var(--text-muted)] whitespace-nowrap">{country.continent}</td>
                        <td className="p-4 text-sm border-b border-[var(--border)] whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://flagcdn.com/w40/${country.code}.png`} 
                              className="w-6 h-4 object-cover rounded-sm bg-[#cbd5e1] shadow-sm" 
                              alt={`${country.country} Flag`}
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-semibold text-[var(--text-main)]">{country.country}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm border-b border-[var(--border)] text-[var(--text-main)] whitespace-nowrap">{country.capital}</td>
                        <td className="p-4 text-sm border-b border-[var(--border)] text-[var(--text-muted)]">{country.neighbors}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden flex flex-col gap-4 p-4 bg-[var(--bg)]">
              <h2 className="text-center text-[var(--primary)] text-xl font-bold mb-2">দেশের তালিকা</h2>
              {filteredCountries.length === 0 ? (
                <div className="text-center p-8 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <p className="text-[var(--text-muted)]">কোনো দেশ পাওয়া যায়নি!</p>
                </div>
              ) : (
                filteredCountries.map((country, idx) => {
                  const neighbors = country.neighbors.split(',').map(n => n.trim());
                  return (
                    <div 
                      key={idx} 
                      onClick={() => fetchCountryDetails(country.code, country.country)}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm cursor-pointer relative transition-transform active:scale-95"
                    >
                      <span className="absolute top-5 right-5 text-xs font-bold bg-[var(--hover-bg)] text-[var(--primary)] px-3 py-1 rounded-full">
                        {country.continent}
                      </span>
                      
                      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-dashed border-[var(--border)]">
                        <img 
                          src={`https://flagcdn.com/w80/${country.code}.png`} 
                          alt={`${country.country} flag`} 
                          className="w-12 rounded-md border border-gray-200 shadow-sm"
                          loading="lazy"
                        />
                        <div className="text-2xl font-bold text-[var(--text-main)]">{country.country}</div>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div className="text-left">
                          <div className="text-[13px] text-slate-500 mb-1 font-semibold">রাজধানী</div>
                          <div className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                            🏛️ {country.capital}
                          </div>
                        </div>
                        
                        <div className="text-left">
                          <div className="text-[13px] text-slate-500 mb-1 font-semibold">প্রতিবেশী দেশ</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {country.neighbors === 'নেই, নেই' ? (
                              <span className="bg-[var(--badge-bg)] text-[var(--badge-text)] px-3 py-1.5 rounded-full text-sm font-semibold border border-black/5">
                                কোনো প্রতিবেশী নেই
                              </span>
                            ) : (
                              neighbors.map((n, i) => (
                                <span key={i} className="bg-[var(--badge-bg)] text-[var(--badge-text)] px-3 py-1.5 rounded-full text-sm font-semibold border border-black/5">
                                  {n}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
      )}

      {/* Country Details Modal */}
      {selectedCountryCode && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedCountryCode(null)}
        >
          <div 
            className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--border)] transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-[var(--border)] bg-[var(--bg)]">
              <h2 className="text-lg font-bold text-[var(--text-main)]">দেশের বিস্তারিত তথ্য</h2>
              <button 
                onClick={() => setSelectedCountryCode(null)} 
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)] p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="animate-spin text-[var(--primary)]" size={36} />
                  <p className="text-sm text-[var(--text-muted)]">তথ্য লোড হচ্ছে...</p>
                </div>
              ) : countryDetails ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-5">
                    <img 
                      src={countryDetails.flagUrl} 
                      alt="Flag" 
                      className="w-24 h-auto rounded shadow-sm border border-[var(--border)] object-cover" 
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--text-main)] mb-1">{countryDetails.name}</h3>
                      <p className="text-sm text-[var(--text-muted)] font-medium">{countryDetails.officialName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] col-span-2">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-semibold">
                        <MapPin size={14} className="text-[var(--primary)]" />
                        ভৌগোলিক তথ্য (Google Maps)
                      </span>
                      {isLoadingSummary ? (
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Loader2 className="animate-spin" size={14} />
                          তথ্য সংগ্রহ করা হচ্ছে...
                        </div>
                      ) : (
                        <p className="text-[var(--text-main)] text-sm leading-relaxed">
                          {countrySummary}
                        </p>
                      )}
                    </div>
                    <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
                      <span className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider font-semibold">জনসংখ্যা</span>
                      <strong className="text-[var(--text-main)] text-lg">{countryDetails.population.toLocaleString()}</strong>
                    </div>
                    <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
                      <span className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider font-semibold">মুদ্রা (Currency)</span>
                      <strong className="text-[var(--text-main)] text-sm">{countryDetails.currencies}</strong>
                    </div>
                    <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] col-span-2">
                      <span className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider font-semibold">সরকারি ভাষা</span>
                      <strong className="text-[var(--text-main)] text-sm">{countryDetails.languages}</strong>
                    </div>
                    <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] col-span-2">
                      <span className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider font-semibold">অঞ্চল (Region)</span>
                      <strong className="text-[var(--text-main)] text-sm">{countryDetails.region} {countryDetails.subregion ? `(${countryDetails.subregion})` : ''}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-[var(--text-muted)]">
                  তথ্য পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
