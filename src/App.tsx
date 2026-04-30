import { useState, useEffect } from "react";
import { countries, continents } from "./data";
import {
	Moon,
	Sun,
	Search,
	X,
	Loader2,
	MapPin,
	PenTool,
	CircleDollarSign,
	MoreVertical,
	Menu,
	Filter,
	Cloud,
	CloudSun,
	CloudMoon,
	CloudRain,
	CloudSnow,
	CloudLightning,
	Thermometer,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import GlobeViz from "./GlobeViz";
import QuizSection from "./QuizSection";
import { GoogleGenAI } from "@google/genai";
import CurrencyConverter from "./CurrencyConverter";
import AIChatbot from "./AIChatbot";
import WorldRecords from "./WorldRecords";
import LanguageExplorer from "./LanguageExplorer";

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
	neighbors?: string;
	weather?: {
		temperature: number;
		condition: string;
		isDay: boolean;
	};
}

export default function App() {
	const [theme, setTheme] = useState<"light" | "dark">("dark");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedContinent, setSelectedContinent] = useState("All");

	// Advanced Filter States
	const [restCountriesData, setRestCountriesData] = useState<any[]>([]);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [populationFilter, setPopulationFilter] = useState("All");
	const [regionFilter, setRegionFilter] = useState("All");
	const [languageFilter, setLanguageFilter] = useState("");

	const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
		null,
	);
	const [globeFocusCode, setGlobeFocusCode] = useState<string | null>(null);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);
	const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(
		null,
	);
	const [countrySummary, setCountrySummary] = useState<string | null>(null);
	const [countryLeader, setCountryLeader] = useState<string | null>(null);
	const [isLoadingSummary, setIsLoadingSummary] = useState(false);
	const [isLoadingLeader, setIsLoadingLeader] = useState(false);
	const [isExamMode, setIsExamMode] = useState(false);
	const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
	const [showMenuHint, setShowMenuHint] = useState(false);
	const [showWelcome, setShowWelcome] = useState(false);
	const [showCurrency, setShowCurrency] = useState(false);
	const [showLanguageExplorer, setShowLanguageExplorer] = useState(false);

	useEffect(() => {
		// Show welcome every time the user enters
		setShowWelcome(true);

		// Initial check for menu hint
		const hasSeenMenuHint = localStorage.getItem("hasSeenMenuHint");
		if (!hasSeenMenuHint) {
			setShowMenuHint(true);
		}

		// Fetch extra data for filters
		fetch(
			"https://restcountries.com/v3.1/all?fields=cca2,population,region,languages",
		)
			.then((res) => res.json())
			.then((data) => setRestCountriesData(data))
			.catch((err) =>
				console.error("Failed to fetch advanced filter data", err),
			);
	}, []);

	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [theme]);

	const openFeaturesMenu = () => {
		setIsFeaturesMenuOpen(true);
		if (showMenuHint) {
			setShowMenuHint(false);
			localStorage.setItem("hasSeenMenuHint", "true");
		}
	};

	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	const fetchCountryDetails = async (code: string, localName: string) => {
		setSelectedCountryCode(code);
		setGlobeFocusCode(code);
		window.scrollTo({ top: 0, behavior: "smooth" }); // স্ক্রল করে গ্লোবে নিয়ে যাবে
		setIsLoadingDetails(true);
		setIsLoadingSummary(true);
		setIsLoadingLeader(true);
		setCountryDetails(null);
		setCountrySummary(null);
		setCountryLeader(null);
		try {
			const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
			const data = await res.json();
			if (data && data[0]) {
				const country = data[0];
				const currencies = country.currencies
					? Object.values(country.currencies)
							.map((c: any) => c.name)
							.join(", ")
					: "অজানা";
				const languages = country.languages
					? Object.values(country.languages).join(", ")
					: "অজানা";

				const offlineCountry = countries.find(c => c.code.toLowerCase() === code.toLowerCase());
				const neighborsStr = offlineCountry?.neighbors || "অজানা";

				setCountryDetails({
					name: localName,
					officialName: country.name.official,
					population: country.population,
					currencies,
					languages,
					region: country.region,
					subregion: country.subregion || "অজানা",
					flagUrl: country.flags.svg || country.flags.png,
					neighbors: neighborsStr,
				});

				// Show details immediately without waiting for AI
				setIsLoadingDetails(false);

				// Fetch weather data
				const latlng = country.capitalInfo?.latlng || country.latlng;
				if (latlng && latlng.length === 2) {
					const [lat, lng] = latlng;
					fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
						.then(res => res.json())
						.then(weatherData => {
							if (weatherData?.current_weather) {
								const cw = weatherData.current_weather;
								const code = cw.weathercode;
								let condition = "অজানা";
								if (code === 0) condition = "পরিষ্কার আকাশ";
								else if (code >= 1 && code <= 3) condition = "আংশিক মেঘলা";
								else if (code === 45 || code === 48) condition = "কুয়াশা";
								else if (code >= 51 && code <= 67) condition = "বৃষ্টি";
								else if (code >= 71 && code <= 86) condition = "তুষারপাত";
								else if (code >= 95) condition = "বজ্রঝড়";
								
								setCountryDetails(prev => prev ? {
									...prev,
									weather: {
										temperature: cw.temperature,
										condition,
										isDay: cw.is_day === 1
									}
								} : null);
							}
						})
						.catch(err => console.error("Failed to fetch weather", err));
				}

				// Fetch summary from Gemini
				try {
					const aiClient = getAiClient();
					if (!aiClient) {
						setCountrySummary(
							"AI সারাংশ দেখার জন্য API Key সেট করা নেই। দয়া করে ড্যাশবোর্ড থেকে API Key সেট করুন।",
						);
						return;
					}

					// Fire off secondary request to fetch current leader
					const fetchLeaderInfo = async () => {
						try {
							const res = await aiClient.models.generateContent({
								model: "gemini-3-flash-preview",
								contents: `What is the name of the current leader (Head of State or Head of Government, e.g., President or Prime Minister) of ${localName}? Reply in Bengali only with their title followed by their name (e.g., "রাষ্ট্রপতি: মোঃ সাহাবুদ্দিন"). Note: Search the internet to find the most current and accurate data. If there are both, include both separated by a comma. Do not hallucinate.`,
								config: {
									tools: [{ googleSearch: {} }],
								},
							});
							if (res && res.text) {
								setCountryLeader(res.text.replace(/\*/g, ""));
							}
						} catch (e) {
							console.error("Failed to fetch leader info", e);
							setCountryLeader("তথ্য সংগ্রহে সমস্যা হচ্ছে");
						} finally {
							setIsLoadingLeader(false);
						}
					};
					fetchLeaderInfo();

					let response;
					try {
						// First attempt: With Google Search Grounding for best data
						response = await aiClient.models.generateContent({
							model: "gemini-3-flash-preview",
							contents: `You are a teacher helping a student learn about ${localName}. Provide a comprehensive summary of ${localName} in Bengali using a question-and-answer (Q&A) format. Please structure your response using Markdown (use bold for questions and clear formatting for answers):
1. **ভৌগোলিক ও সাধারণ তথ্য (Geography & General Info)**: Formulate 2-3 questions about its capital, key geographical features, and famous landmarks, and answer them.
2. **সাম্প্রতিক খবর ও সরকার (Recent News & Government)**: Formulate 2-3 questions about its current government type/leaders and use Google Search to answer with 2-3 recent and relevant news updates.
3. **ভাষা, সংস্কৃতি ও জীবনযাত্রা (Language, Culture & Lifestyle)**: Formulate 2-3 questions about the primary language, people, and lifestyle, and answer them.`,
							config: {
								tools: [{ googleSearch: {} }],
							},
						});
					} catch (initialError: any) {
						console.warn(
							"First attempt with search failed, trying fallback...",
							initialError,
						);
						const initialErrorMsg = JSON.stringify(initialError).toLowerCase();

						// If it's a quota/rate limit error, try a simpler request without search grounding
						// as grounding often has more restrictive limits.
						if (
							initialErrorMsg.includes("429") ||
							initialErrorMsg.includes("quota") ||
							initialErrorMsg.includes("resource_exhausted")
						) {
							response = await aiClient.models.generateContent({
								model: "gemini-3-flash-preview",
								contents: `You are a teacher helping a student learn about ${localName}. Provide a comprehensive summary of ${localName} in Bengali using a question-and-answer (Q&A) format. Please structure your response using Markdown (use bold for questions and clear formatting for answers):
1. **ভৌগোলিক ও সাধারণ তথ্য (Geography & General Info)**: Formulate 2-3 questions about its capital, key geographical features, and famous landmarks, and answer them.
2. **সাম্প্রতিক খবর ও সরকার (Recent News & Government)**: Formulate 2-3 questions about its current government type/leaders and mention a notable historical event, noting that live news could not be fetched.
3. **ভাষা, সংস্কৃতি ও জীবনযাত্রা (Language, Culture & Lifestyle)**: Formulate 2-3 questions about the primary language, people, and lifestyle, and answer them.`,
							});
						} else {
							throw initialError;
						}
					}

					if (response && response.text) {
						setCountrySummary(response.text);
					} else {
						throw new Error("No response text received");
					}
				} catch (geminiError: any) {
					console.error("Critical Gemini Error:", geminiError);
					const errorMsgStr = JSON.stringify(geminiError).toLowerCase();
					const simpleMsg = geminiError?.message?.toLowerCase() || "";

					if (
						errorMsgStr.includes("429") ||
						errorMsgStr.includes("quota") ||
						errorMsgStr.includes("resource_exhausted") ||
						simpleMsg.includes("limit")
					) {
						setCountrySummary(
							"দুঃখিত, বর্তমানে এআই (AI) এর ব্যবহারের লিমিট শেষ হয়ে গেছে। দয়া করে কিছুক্ষণ পর বা আগামীকাল আবার চেষ্টা করুন।",
						);
					} else if (
						errorMsgStr.includes("api_key_invalid") ||
						errorMsgStr.includes("invalid api key")
					) {
						setCountrySummary(
							"আপনার দেওয়া API Key টি সঠিক নয়। দয়া করে সঠিক API Key ব্যবহার করুন।",
						);
					} else {
						setCountrySummary(
							"দুঃখিত, এই মুহূর্তে তথ্য লোড করা সম্ভব হচ্ছে না। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
						);
					}
				}
			}
		} catch (error) {
			console.error("Failed to fetch country details", error);
		} finally {
			setIsLoadingDetails(false);
			setIsLoadingSummary(false);
		}
	};

	const filteredCountries = countries.filter((country) => {
		const matchesContinent =
			selectedContinent === "All" || country.continent === selectedContinent;
		const searchLower = searchQuery.toLowerCase();

		let englishName = "";
		try {
			englishName =
				new Intl.DisplayNames(["en"], { type: "region" }).of(
					country.code.toUpperCase(),
				) || "";
		} catch (e) {
			// Fallback if Intl API fails
		}

		const matchesSearch =
			country.country.toLowerCase().includes(searchLower) ||
			country.capital.toLowerCase().includes(searchLower) ||
			englishName.toLowerCase().includes(searchLower) ||
			country.code.toLowerCase() === searchLower;

		// Advanced Filters Check
		let matchesAdvanced = true;
		if (
			restCountriesData.length > 0 &&
			(populationFilter !== "All" ||
				regionFilter !== "All" ||
				languageFilter.trim() !== "")
		) {
			const restData = restCountriesData.find(
				(rc) => rc.cca2.toLowerCase() === country.code.toLowerCase(),
			);
			if (restData) {
				if (populationFilter !== "All") {
					const pop = restData.population || 0;
					if (populationFilter === "<1M" && pop >= 1000000)
						matchesAdvanced = false;
					if (
						populationFilter === "1M-10M" &&
						(pop < 1000000 || pop > 10000000)
					)
						matchesAdvanced = false;
					if (
						populationFilter === "10M-50M" &&
						(pop < 10000000 || pop > 50000000)
					)
						matchesAdvanced = false;
					if (populationFilter === ">50M" && pop <= 50000000)
						matchesAdvanced = false;
				}
				if (regionFilter !== "All" && restData.region !== regionFilter)
					matchesAdvanced = false;
				if (languageFilter.trim() !== "") {
					const langs: string[] = restData.languages
						? Object.values(restData.languages)
						: [];
					const matchesLang = langs.some((L: string) =>
						L.toLowerCase().includes(languageFilter.toLowerCase()),
					);
					if (!matchesLang) matchesAdvanced = false;
				}
			} else {
				// If advanced filters are active but data not found for country, keep it out to be safe
				matchesAdvanced = false;
			}
		}

		return matchesContinent && matchesSearch && matchesAdvanced;
	});

	useEffect(() => {
		if (searchQuery.trim() !== "" && filteredCountries.length === 1) {
			setGlobeFocusCode(filteredCountries[0].code);
		} else if (searchQuery.trim() === "") {
			setGlobeFocusCode(null);
		}
	}, [searchQuery, filteredCountries.length]);

	const filterOptions = [
		"All",
		"এশিয়া",
		"ইউরোপ",
		"আফ্রিকা",
		"উত্তর আমেরিকা",
		"দক্ষিণ আমেরিকা",
		"ওশেনিয়া",
	];

	return (
		<div className="min-h-screen bg-[#030712] text-white selection:bg-blue-500/30">
			{/* Welcome Modal */}
			<AnimatePresence>
				{showWelcome && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
						transition={{ duration: 0.8 }}
						className="welcome-space-bg fixed inset-0 z-[100] flex items-center justify-center p-4"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{ delay: 0.1, duration: 0.4 }}
							className="bg-[#0a0a12]/90 backdrop-blur-xl border border-white/10 w-full max-w-[500px] p-6 md:p-10 rounded-3xl md:rounded-[32px] text-center shadow-2xl relative z-10"
						>
							<h1 className="text-2xl md:text-4xl font-black text-white mb-3 md:mb-4 flex flex-col items-center justify-center gap-2 md:gap-3 leading-tight">
								<span className="text-4xl md:text-5xl drop-shadow-lg">🌍</span>
								<span>
									3D পৃথিবী <br className="hidden md:block"/> এক্সপ্লোর করুন
								</span>
							</h1>

							<p className="text-xs md:text-[15px] text-gray-400 mb-5 md:mb-8 leading-relaxed font-medium">
								বিশ্বের ১৯৬টি দেশ, 3D ম্যাপ, AI লার্নিং এবং কুইজ—সব একসাথে! পৃথিবী
								সম্পর্কে জানুন আমাদের সাথে।
							</p>

							<div className="flex justify-center mb-6 md:mb-10 w-full">
								<ul className="grid grid-cols-2 gap-y-3 gap-x-2 md:gap-y-5 md:gap-x-8 text-left text-gray-300 font-medium w-full bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5">
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">🌎</span>
										<span className="text-[11px] md:text-base leading-tight">সব দেশের তথ্য</span>
									</li>
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">👥</span>
										<span
											className="text-[11px] md:text-base cursor-help leading-tight"
											title="অফলাইন ডাটা অনুযায়ী"
										>
											৮.১ বিলিয়ন+ লোক
										</span>
									</li>
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">💱</span>
										<span className="text-[11px] md:text-base leading-tight">কারেন্সি রেট</span>
									</li>
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">📈</span>
										<span className="text-[11px] md:text-base leading-tight">মার্কেট ইনসাইটস</span>
									</li>
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">🧠</span>
										<span className="text-[11px] md:text-base leading-tight">MCQ কুইজ</span>
									</li>
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">🤖</span>
										<span className="text-[11px] md:text-base leading-tight">AI ভিত্তিক শেখা</span>
									</li>
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">🗣️</span>
										<span
											className="text-[11px] md:text-base cursor-help leading-tight"
											title="অফলাইন ডাটা অনুযায়ী"
										>
											৭১০০+ ভাষা
										</span>
									</li>
									<li className="flex items-center gap-2 md:gap-3">
										<span className="text-base md:text-xl shrink-0">🏆</span>
										<span className="text-[11px] md:text-base leading-tight">বিশ্ব রেকর্ড</span>
									</li>
								</ul>
							</div>

							<button
								onClick={() => setShowWelcome(false)}
								className="w-full py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2"
							>
								<span>🚀</span> এক্সপ্লোর শুরু করুন
							</button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<nav className="fixed top-0 w-full z-50 bg-[#0a0a12]/80 backdrop-blur-md border-b border-white/5">
				<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
					{/* লোগো সেকশন */}
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center border border-white/20 shadow-lg shadow-blue-500/20">
							<span className="text-xl">🌍</span>
						</div>
						<div>
							<h1 className="text-lg font-black tracking-tighter leading-none">
								YEASIN EARTH
							</h1>
							<p className="text-[10px] text-blue-400 font-medium tracking-widest uppercase mt-1">
								GK Database
							</p>
						</div>
					</div>

					{/* ডেস্কটপ সার্চ বার */}
					<div className="hidden lg:flex relative group">
						<Search
							className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-blue-400"
							size={18}
						/>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="দেশ বা রাজধানী খুঁজুন..."
							className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm w-64 outline-none focus:border-blue-500/50 transition-all focus:bg-white/10"
						/>
					</div>

					{/* ডান পাশের বাটন এবং মেনু */}
					<div className="flex items-center gap-2">
						<button
							onClick={() => setShowCurrency(true)}
							className="hidden sm:flex items-center gap-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
						>
							<CircleDollarSign size={14} />
							মুদ্রা রূপান্তর
						</button>

						<button
							onClick={() => setIsExamMode(!isExamMode)}
							className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
								isExamMode
									? "bg-gray-600/10 text-gray-400 border border-gray-500/20 hover:bg-gray-600 hover:text-white"
									: "bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white"
							}`}
						>
							<PenTool size={14} />
							<span className="hidden xs:block">
								{isExamMode ? "হোম পেজ" : "MCQ টেস্ট"}
							</span>
						</button>

						<button
							onClick={toggleTheme}
							className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-white"
							title="Toggle Theme"
						>
							{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
						</button>

						<div className="relative md:hidden shrink-0 flex items-center ml-1">
							{showMenuHint && (
								<div className="absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-right-[5px] before:border-[5px] before:border-transparent before:border-l-blue-500 z-50">
									আরও ফিচারের জন্য এখানে চাপুন
								</div>
							)}
							<button
								onClick={openFeaturesMenu}
								className={`p-2.5 rounded-xl transition-colors flex items-center justify-center ${showMenuHint ? "bg-blue-500 text-white animate-pulse shadow-md" : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"}`}
								title="More Features"
							>
								{isFeaturesMenuOpen ? <X size={20} /> : <Menu size={20} />}
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Features Menu Modal (Mobile Only) */}
			<AnimatePresence>
				{isFeaturesMenuOpen && (
					<div
						className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
						onClick={() => setIsFeaturesMenuOpen(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
						>
							<div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5">
								<h2 className="text-xl font-bold text-white flex items-center gap-2">
									<span className="text-2xl">✨</span> আরও ফিচার্স
								</h2>
								<button
									onClick={() => setIsFeaturesMenuOpen(false)}
									className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
								>
									<X size={24} />
								</button>
							</div>

							<div className="p-6 overflow-y-auto hide-scrollbar">
								<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
									<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center">
										<span className="block text-2xl mb-1">🌍</span>
										<strong className="block text-xl text-blue-500 mb-1 font-black">
											১৯৬ টি
										</strong>
										<span className="block text-xs font-semibold text-gray-400">
											মোট দেশ
										</span>
									</div>

									<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center">
										<span className="block text-2xl mb-1">👥</span>
										<strong
											className="block text-xl text-indigo-500 mb-1 font-black cursor-help"
											title="অফলাইন ডাটা অনুযায়ী"
										>
											৮.১ বিলিয়ন+
										</strong>
										<span className="block text-xs font-semibold text-gray-400">
											বিশ্বের জনসংখ্যা
										</span>
									</div>

									<button
										onClick={() => {
											setIsFeaturesMenuOpen(false);
											setShowCurrency(true);
										}}
										className="bg-[#030712] p-4 rounded-2xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 shadow-sm flex flex-col items-center text-center justify-center group active:scale-95"
									>
										<span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">
											💱
										</span>
										<strong className="block text-lg text-emerald-400 mb-1 font-bold">
											লাইভ রেট
										</strong>
										<span className="block text-[10px] md:text-xs font-semibold text-gray-400">
											কারেন্সি কনভার্টার
										</span>
									</button>

									<button
										onClick={() => {
											setIsFeaturesMenuOpen(false);
											setIsExamMode(true);
										}}
										className="bg-[#030712] p-4 rounded-2xl border border-white/10 hover:border-rose-500/50 hover:bg-white/5 transition-all duration-300 shadow-sm flex flex-col items-center text-center justify-center group active:scale-95"
									>
										<span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">
											📝
										</span>
										<strong className="block text-lg text-rose-400 mb-1 font-bold">
											প্রস্তুতি নিন
										</strong>
										<span className="block text-[10px] md:text-xs font-semibold text-gray-400">
											MCQ কুইজ
										</span>
									</button>

									<button
										onClick={() => {
											setIsFeaturesMenuOpen(false);
											window.dispatchEvent(new CustomEvent("open-ai-chat"));
										}}
										className="bg-[#030712] p-4 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all duration-300 shadow-sm flex flex-col items-center text-center justify-center group active:scale-95"
									>
										<span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">
											🤖
										</span>
										<strong className="block text-lg text-blue-400 mb-1 font-bold">
											AI গাইড
										</strong>
										<span className="block text-[10px] md:text-xs font-semibold text-gray-400">
											স্মার্ট চ্যাটবট
										</span>
									</button>

									<div 
										onClick={() => {
											setIsFeaturesMenuOpen(false);
											setShowLanguageExplorer(true);
										}}
										className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:bg-white/5 active:scale-95"
									>
										<span className="block text-2xl mb-1 hover:scale-110 transition-transform">🗣️</span>
										<strong
											className="block text-xl text-blue-500 mb-1 font-black cursor-help"
											title="অফলাইন ডাটা অনুযায়ী"
										>
											৭১০০+
										</strong>
										<span className="block text-[10px] md:text-xs font-semibold text-gray-400">
											জীবিত ভাষা
										</span>
									</div>

									<div
										onClick={() => setIsFeaturesMenuOpen(false)}
										className="col-span-2 lg:col-span-4 rounded-2xl overflow-hidden border border-white/10"
									>
										<WorldRecords />
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Advanced Filter Modal */}
			<AnimatePresence>
				{isFilterModalOpen && (
					<div
						className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
						onClick={() => setIsFilterModalOpen(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-md bg-[#0a0a12] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
						>
							<div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5">
								<h2 className="text-xl font-bold text-white flex items-center gap-2">
									<Filter size={20} className="text-blue-500" /> ফিল্টার করুন
								</h2>
								<button
									onClick={() => setIsFilterModalOpen(false)}
									className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
								>
									<X size={20} />
								</button>
							</div>

							<div className="p-6 flex flex-col gap-6">
								<div>
									<label className="block text-sm font-semibold mb-2 text-gray-300">
										জনসংখ্যা (Population)
									</label>
									<select
										value={populationFilter}
										onChange={(e) => setPopulationFilter(e.target.value)}
										className="w-full p-3 rounded-xl border border-white/10 bg-[#030712] text-white outline-none focus:border-blue-500/50 appearance-none"
									>
										<option value="All">সব দেশ</option>
										<option value="<1M">১ মিলিয়নের নিচে</option>
										<option value="1M-10M">১ থেকে ১০ মিলিয়ন</option>
										<option value="10M-50M">১০ থেকে ৫০ মিলিয়ন</option>
										<option value=">50M">৫০ মিলিয়নের উপরে</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-semibold mb-2 text-gray-300">
										অঞ্চল (Region)
									</label>
									<select
										value={regionFilter}
										onChange={(e) => setRegionFilter(e.target.value)}
										className="w-full p-3 rounded-xl border border-white/10 bg-[#030712] text-white outline-none focus:border-blue-500/50 appearance-none"
									>
										<option value="All">সব অঞ্চল</option>
										<option value="Asia">এশিয়া (Asia)</option>
										<option value="Europe">ইউরোপ (Europe)</option>
										<option value="Africa">আফ্রিকা (Africa)</option>
										<option value="Americas">আমেরিকা (Americas)</option>
										<option value="Oceania">ওশেনিয়া (Oceania)</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-semibold mb-2 text-gray-300">
										ভাষা (Language){" "}
										<span className="text-[10px] text-gray-500 font-normal">
											(ইংরেজিতে লিখুন)
										</span>
									</label>
									<input
										type="text"
										value={languageFilter}
										onChange={(e) => setLanguageFilter(e.target.value)}
										placeholder="যেমন: English, Arabic, Spanish..."
										className="w-full p-3 rounded-xl border border-white/10 bg-[#030712] text-white outline-none focus:border-blue-500/50"
									/>
								</div>

								<div className="flex gap-3 mt-4">
									<button
										onClick={() => {
											setPopulationFilter("All");
											setRegionFilter("All");
											setLanguageFilter("");
										}}
										className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold transition-colors"
									>
										রিসেট
									</button>
									<button
										onClick={() => setIsFilterModalOpen(false)}
										className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors shadow-lg shadow-blue-500/20"
									>
										এপ্লাই করুন
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{isExamMode ? (
				<main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full pt-20">
					<QuizSection onExit={() => setIsExamMode(false)} />
				</main>
			) : (
				<main className="max-w-7xl mx-auto px-4 pt-28 pb-12 w-full flex-1 flex flex-col">
					{/* হিরো সেকশন */}
					<div className="text-center md:text-left mb-10">
						<h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
							বিশ্বকে জানুন <span className="text-blue-500">সহজভাবে</span>
						</h2>
						<p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto md:mx-0 mb-8">
							১৯৬টি দেশের সম্পূর্ণ তথ্যভাণ্ডার এবং ইন্টারঅ্যাক্টিভ ৩ডি ম্যাপ। একজন স্টুডেন্ট-এর
							প্রয়োজনীয় সবকিছু এখন এক জায়গায়।
						</p>

						{/* Stats and World Records Group */}
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
							<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center">
								<span className="block text-2xl mb-1">🌍</span>
								<strong className="block text-lg text-blue-500 mb-1 font-black">১৯৬ টি</strong>
								<span className="block text-[10px] md:text-xs font-semibold text-gray-400">মোট দেশ</span>
							</div>

							<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center">
								<span className="block text-2xl mb-1">👥</span>
								<strong className="block text-lg text-indigo-500 mb-1 font-black cursor-help" title="অফলাইন ডাটা অনুযায়ী">৮.১ বিলিয়ন+</strong>
								<span className="block text-[10px] md:text-xs font-semibold text-gray-400">বিশ্বের জনসংখ্যা</span>
							</div>
							
							<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:bg-white/5 active:scale-95" onClick={() => setShowLanguageExplorer(true)}>
								<span className="block text-2xl mb-1 hover:scale-110 transition-transform">🗣️</span>
								<strong className="block text-lg text-blue-500 mb-1 font-black cursor-help" title="অফলাইন ডাটা অনুযায়ী">৭১০০+</strong>
								<span className="block text-[10px] md:text-xs font-semibold text-gray-400">জীবিত ভাষা</span>
							</div>

							<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:bg-white/5 active:scale-95" onClick={() => setShowCurrency(true)}>
								<span className="block text-2xl mb-1 hover:scale-110 transition-transform">💱</span>
								<strong className="block text-lg text-emerald-400 mb-1 font-black">লাইভ রেট</strong>
								<span className="block text-[10px] md:text-xs font-semibold text-gray-400">কারেন্সি কনভার্টার</span>
							</div>

							<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:bg-white/5 active:scale-95" onClick={() => setIsExamMode(true)}>
								<span className="block text-2xl mb-1 hover:scale-110 transition-transform">📝</span>
								<strong className="block text-lg text-rose-400 mb-1 font-black">প্রস্তুতি নিন</strong>
								<span className="block text-[10px] md:text-xs font-semibold text-gray-400">MCQ কুইজ</span>
							</div>

							<div className="bg-[#030712] p-4 rounded-2xl border border-white/10 transition-colors duration-300 shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:bg-white/5 active:scale-95" onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}>
								<span className="block text-2xl mb-1 hover:scale-110 transition-transform">🤖</span>
								<strong className="block text-lg text-blue-400 mb-1 font-black">AI গাইড</strong>
								<span className="block text-[10px] md:text-xs font-semibold text-gray-400">স্মার্ট চ্যাটবট</span>
							</div>

							<div className="col-span-2 sm:col-span-3 lg:col-span-6 rounded-2xl overflow-hidden border border-white/10">
								<WorldRecords />
							</div>
						</div>
					</div>

					{/* ৩ডি গ্লোব কন্টেইনার */}
					<div className="relative w-full h-[55vh] md:h-[65vh] rounded-[40px] overflow-hidden shadow-2xl flex items-center justify-center group mb-12 border border-white/5 bg-[#030712] touch-pan-y">
						{/* Subtle gradient overlay to blend corners */}
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,7,18,0.8)_100%)] pointer-events-none z-0" />
						<GlobeViz focusCountryCode={globeFocusCode} />

						{/* মোবাইল সার্চ বার */}
						<div className="absolute bottom-6 px-4 w-full lg:hidden z-10 pointer-events-none">
							<div className="relative max-w-sm mx-auto pointer-events-auto">
								<Search
									className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
									size={18}
								/>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="দেশ বা রাজধানী খুঁজুন..."
									className="w-full bg-[#0a0a12]/95 backdrop-blur-xl border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm outline-none shadow-2xl focus:border-blue-500/50 text-white placeholder-gray-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
						<h3 className="text-xl font-bold tracking-tight">সব দেশ</h3>
						<button
							onClick={() => setIsFilterModalOpen(true)}
							className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-5 py-2.5 rounded-full border border-blue-500/20 transition-all active:scale-95 shadow-sm"
						>
							<Filter size={14} /> অ্যাডভান্সড ফিল্টার
						</button>
					</div>

					<div className="flex gap-3 overflow-x-auto pb-4 mb-6 hide-scrollbar snap-x">
						{filterOptions.map((option) => {
							const isActive = selectedContinent === option;
							const count =
								option === "All"
									? countries.length
									: countries.filter((c) => c.continent === option).length;
							const label = option === "All" ? "সব দেশ" : option;
							return (
								<button
									key={option}
									onClick={() => setSelectedContinent(option)}
									className={`snap-start shrink-0 px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold transition-all border ${
										isActive
											? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/20"
											: "bg-[#030712] text-gray-400 border-white/10 hover:bg-white/5 hover:border-white/20 hover:text-gray-200"
									}`}
								>
									<span>{label}</span>
									<span
										className={`text-[10px] px-2 py-0.5 rounded-lg ${isActive ? "bg-black/20 text-white font-black" : "bg-white/5 text-gray-500 border border-white/5"}`}
									>
										{count}
									</span>
								</button>
							);
						})}
					</div>

					<div className="bg-[#0a0a12] border border-white/10 rounded-3xl overflow-hidden flex-1 flex flex-col mb-12 max-h-[600px] shadow-2xl relative">
						{filteredCountries.length > 0 && (
							<div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#0a0a12] to-transparent pointer-events-none z-[15]" />
						)}

						<div className="overflow-y-auto w-full hide-scrollbar z-0 relative px-2">
							<div className="w-full flex object-cover flex-col text-left py-6 pb-20 relative z-10 space-y-3">
								{filteredCountries.length === 0 ? (
									<div className="p-10 text-center text-gray-500 font-medium w-full block">
										কোনো দেশ পাওয়া যায়নি!
									</div>
								) : (
									filteredCountries.map((country, idx) => (
										<div
											key={idx}
											onClick={() =>
												fetchCountryDetails(country.code, country.country)
											}
											className="hover:bg-white/5 transition-all cursor-pointer group mx-2 bg-[#030712] border border-white/5 rounded-2xl hover:border-blue-500/30 hover:shadow-lg grid grid-cols-2 sm:grid-cols-[1fr_2fr_1fr] lg:grid-cols-[1fr_2fr_1fr_1fr] items-center gap-4 p-5"
										>
											<div className="text-sm text-gray-400 align-middle hidden sm:block shrink-0">
												<span className="bg-white/5 px-4 py-2 rounded-xl text-xs border border-white/5 font-bold text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
													{country.continent}
												</span>
											</div>
											<div className="align-middle flex items-center gap-4 col-span-2 sm:col-span-1 shrink-0 min-w-0">
												<div className="relative shrink-0">
													<img
														src={`https://flagcdn.com/w40/${country.code}.png`}
														className="w-10 h-7 object-cover rounded shadow-sm border border-white/10 group-hover:scale-110 transition-transform relative z-10"
														alt={`${country.country} Flag`}
														referrerPolicy="no-referrer"
													/>
												</div>
												<span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors text-lg truncate flex-1 min-w-0">
													{country.country}
												</span>
											</div>
											<div className="text-sm text-gray-400 align-middle font-semibold group-hover:text-gray-200 transition-colors truncate">
												<span className="text-[10px] uppercase tracking-widest text-gray-600 sm:hidden block mb-1">রাজধানী</span>
												{country.capital}
											</div>
											<div className="text-xs text-gray-500 align-middle leading-relaxed line-clamp-2">
												<span className="text-[10px] uppercase tracking-widest text-gray-600 sm:hidden block mb-1">প্রতিবেশী</span>
												{country.neighbors}
											</div>
										</div>
									))
								)}
							</div>
						</div>

						{filteredCountries.length > 0 && (
							<div className="absolute bottom-0 left-0 w-full h-[60px] bg-gradient-to-t from-[#0a0a12] to-transparent pointer-events-none z-10" />
						)}
					</div>

					{/* মহাদেশের সারাংশ */}
					<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-auto">
						{continents.map((cont, idx) => (
							<div
								key={idx}
								className="bg-[#0a0a12] p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all duration-300 group shadow-lg flex flex-col justify-between items-start h-full"
							>
								<span className="inline-block px-3 py-1 bg-white/5 text-[10px] text-gray-400 uppercase font-black tracking-widest rounded-full mb-4 border border-white/5 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
									{cont.location}
								</span>
								<div>
									<strong className="block text-4xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">
										{cont.count
											.replace("টি দেশ", "")
											.replace("কোনো দেশ নেই", "০")}
									</strong>
									<span className="block text-sm font-bold text-gray-500">
										{cont.name}
									</span>
								</div>
							</div>
						))}
					</div>
				</main>
			)}

			{/* Country Details Modal */}
			<AnimatePresence>
				{selectedCountryCode && (
					<div
						className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
						onClick={() => setSelectedCountryCode(null)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
							className="bg-[#0a0a12] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10 max-h-[90vh] flex flex-col"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5 shrink-0">
								<h2 className="text-lg font-bold text-white">
									দেশের বিস্তারিত তথ্য
								</h2>
								<button
									onClick={() => setSelectedCountryCode(null)}
									className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
								>
									<X size={20} />
								</button>
							</div>

							<div className="p-6 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
								{isLoadingDetails ? (
									<div className="flex flex-col items-center justify-center py-12 gap-4">
										<Loader2 className="animate-spin text-blue-500" size={36} />
										<p className="text-sm text-gray-400">তথ্য লোড হচ্ছে...</p>
									</div>
								) : countryDetails ? (
									<div className="flex flex-col gap-6">
										<div className="flex items-center gap-5">
											<img
												src={countryDetails.flagUrl}
												alt="Flag"
												className="w-24 h-auto rounded shadow-sm border border-white/10 object-cover"
											/>
											<div>
												<h3 className="text-2xl font-bold text-white mb-0.5">
													{countryDetails.name}
												</h3>
												<p className="text-xs text-gray-400 font-medium mb-1.5">
													{countryDetails.officialName}
												</p>
												{countryDetails.neighbors && countryDetails.neighbors !== "অজানা" && countryDetails.neighbors !== "কোনো প্রতিবেশী নেই" && (
													<p className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
														<span className="text-gray-500">প্রতিবেশী:</span> {countryDetails.neighbors}
													</p>
												)}
											</div>
										</div>

										<div className="bg-[#030712] p-4 rounded-xl border border-white/10 relative overflow-hidden group">
											<div className="absolute inset-0 bg-blue-500/5 transition-colors group-hover:bg-blue-500/10" />
											<span className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 uppercase font-bold tracking-widest relative z-10">
												<span className="text-blue-400 text-base">👑</span>
												সরকার বা রাষ্ট্রপ্রধান
											</span>
											{isLoadingLeader ? (
												<div className="flex items-center gap-2 text-sm text-gray-400 font-medium relative z-10">
													<Loader2 className="animate-spin text-blue-500" size={16} />
													বর্তমান প্রধানের নাম সংগ্রহ করা হচ্ছে...
												</div>
											) : (
												<div className="text-white text-base md:text-lg font-bold leading-relaxed relative z-10">
													{countryLeader || "তথ্য পাওয়া যায়নি"}
												</div>
											)}
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="bg-[#030712] p-4 rounded-xl border border-white/10 col-span-2">
												<span className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 uppercase font-bold tracking-widest">
													<MapPin size={14} className="text-blue-500" />
													ভৌগোলিক তথ্য (Google Maps)
												</span>
												{isLoadingSummary ? (
													<div className="flex items-center gap-2 text-sm text-gray-400">
														<Loader2 className="animate-spin" size={14} />
														তথ্য সংগ্রহ করা হচ্ছে...
													</div>
												) : (
													<div className="text-gray-300 text-sm leading-relaxed markdown-summary">
														<Markdown>{countrySummary}</Markdown>
													</div>
												)}
											</div>
											<div className="bg-[#030712] p-4 rounded-xl border border-white/10">
												<span className="block text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-widest">
													জনসংখ্যা
												</span>
												<strong className="text-white text-lg">
													{countryDetails.population.toLocaleString()}
												</strong>
											</div>
											<div className="bg-[#030712] p-4 rounded-xl border border-white/10">
												<span className="block text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-widest">
													মুদ্রা (Currency)
												</span>
												<strong className="text-white text-sm">
													{countryDetails.currencies}
												</strong>
											</div>
											<div className="bg-[#030712] p-4 rounded-xl border border-white/10 col-span-2">
												<span className="block text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-widest">
													সরকারি ভাষা
												</span>
												<strong className="text-white text-sm">
													{countryDetails.languages}
												</strong>
											</div>
											<div className="bg-[#030712] p-4 rounded-xl border border-white/10 col-span-2">
												<span className="block text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-widest">
													অঞ্চল (Region)
												</span>
												<strong className="text-white text-sm">
													{countryDetails.region}{" "}
													{countryDetails.subregion
														? `(${countryDetails.subregion})`
														: ""}
												</strong>
											</div>
											
											{/* Weather Widget */}
											{countryDetails.weather && (
												<div className="bg-gradient-to-br from-blue-900/30 to-[#030712] p-4 rounded-xl border border-blue-500/20 col-span-2 flex items-center justify-between">
													<div>
														<span className="block text-[10px] text-blue-400 mb-1 uppercase font-bold tracking-widest">
															বর্তমান আবহাওয়া
														</span>
														<div className="flex items-center gap-2">
															<strong className="text-white text-3xl font-black">
																{Math.round(countryDetails.weather.temperature)}°C
															</strong>
															<span className="text-sm font-medium text-gray-300">
																{countryDetails.weather.condition}
															</span>
														</div>
													</div>
													<div className="bg-blue-500/10 p-3 rounded-full border border-blue-500/20">
														{countryDetails.weather.condition === "পরিষ্কার আকাশ" ? (countryDetails.weather.isDay ? <Sun size={28} className="text-yellow-400" /> : <Moon size={28} className="text-gray-300" />) :
														 countryDetails.weather.condition === "আংশিক মেঘলা" ? (countryDetails.weather.isDay ? <CloudSun size={28} className="text-blue-200" /> : <CloudMoon size={28} className="text-gray-400" />) :
														 countryDetails.weather.condition === "কুয়াশা" ? <Cloud size={28} className="text-gray-400" /> :
														 countryDetails.weather.condition === "বৃষ্টি" ? <CloudRain size={28} className="text-blue-400" /> :
														 countryDetails.weather.condition === "তুষারপাত" ? <CloudSnow size={28} className="text-blue-200" /> :
														 countryDetails.weather.condition === "বজ্রঝড়" ? <CloudLightning size={28} className="text-purple-400" /> :
														 <Thermometer size={28} className="text-gray-400" />}
													</div>
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="text-center py-10 text-gray-500">
										তথ্য পাওয়া যায়নি।
									</div>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			<footer className="text-center py-10 border-t border-white/5 mt-auto">
				<p className="text-[10px] text-gray-600 font-black tracking-[0.4em] uppercase">
					Developed by Yeasin | © 2026 Yeasin Earth
				</p>
			</footer>

			{/* Currency Converter Modal */}
			<AnimatePresence>
				{showCurrency && (
					<CurrencyConverter onClose={() => setShowCurrency(false)} />
				)}
			</AnimatePresence>

			{/* Language Explorer Modal */}
			<AnimatePresence>
				{showLanguageExplorer && (
					<LanguageExplorer 
						onClose={() => setShowLanguageExplorer(false)} 
						restCountriesData={restCountriesData} 
					/>
				)}
			</AnimatePresence>

			{/* Persistent Chatbot */}
			<AIChatbot />
		</div>
	);
}
