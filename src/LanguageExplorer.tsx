import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Globe, Users } from "lucide-react";
import { countries as internalCountries } from "./data";

interface RestCountry {
	cca2: string;
	population: number;
	region: string;
	languages?: Record<string, string>;
}

interface LanguageExplorerProps {
	onClose: () => void;
	restCountriesData: RestCountry[];
}

export default function LanguageExplorer({ onClose, restCountriesData }: LanguageExplorerProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const languageMap = useMemo(() => {
		const map = new Map<string, { name: string; countries: { code: string; name: string }[]; speakers: number }>();
		
		restCountriesData.forEach(rc => {
			if (rc.languages) {
				const intC = internalCountries.find(c => c.code.toLowerCase() === rc.cca2.toLowerCase());
				const countryName = intC ? intC.country : rc.cca2;
				
				Object.values(rc.languages).forEach(lang => {
					if (!map.has(lang)) {
						map.set(lang, { name: lang, countries: [], speakers: 0 });
					}
					const entry = map.get(lang)!;
					entry.countries.push({ code: rc.cca2, name: countryName });
					entry.speakers += rc.population || 0; // rough proxy, true speaker count is nuanced
				});
			}
		});
		
		return Array.from(map.values()).sort((a, b) => b.speakers - a.speakers);
	}, [restCountriesData]);

	const filteredLanguages = languageMap.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.countries.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())));

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			></div>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				className="bg-[#0a0a12] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:h-[85vh] flex flex-col relative z-10"
			>
				<div className="flex justify-between items-center p-4 sm:p-5 border-b border-white/5 bg-white/5 shrink-0">
					<div>
						<h2 className="text-xl font-bold text-white flex items-center gap-2">
							<span className="text-2xl">🗣️</span> পৃথিবীর ভাষাসমূহ
						</h2>
						<p className="text-xs text-blue-400 mt-1 font-medium tracking-wide">
							কোন ভাষায় কারা কথা বলে, জানুন বিস্তারিত
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors bg-[#030712] sm:bg-transparent"
					>
						<X size={24} />
					</button>
				</div>

				<div className="p-4 border-b border-white/5 shrink-0 bg-[#0a0a12]">
					<div className="relative w-full max-w-md mx-auto sm:mx-0">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
						<input
							type="text"
							placeholder="ভাষা অথবা দেশের নাম দিয়ে খুঁজুন..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-[#030712] border border-white/10 text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
					<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
						{filteredLanguages.map((lang, idx) => (
							<div key={idx} className="bg-[#030712] flex flex-col border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 sm:p-5 transition-colors group">
								<div className="flex justify-between items-start mb-4 gap-2">
									<h3 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight">
										{lang.name}
									</h3>
									{lang.speakers > 0 && (
										<div className="bg-indigo-500/10 text-indigo-400 text-[10px] sm:text-xs px-2 py-1 rounded flex-shrink-0 border border-indigo-500/20 font-bold whitespace-nowrap">
											~{(lang.speakers / 1000000).toFixed(1)}M বক্তা
										</div>
									)}
								</div>
								
								<div className="flex-1 flex flex-col">
									<div className="flex items-center gap-2 mb-2.5">
										<Globe size={14} className="text-emerald-500" />
										<span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest">
											{lang.countries.length} টি দেশে প্রচলিত
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-32 custom-scrollbar pr-1">
										{lang.countries.map(c => (
											<span key={c.code} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] sm:text-xs text-gray-300">
												{c.name}
											</span>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
					{filteredLanguages.length === 0 && (
						<div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center">
							<span className="text-4xl mb-4">🔍</span>
							<p>কোনো ফলাফল পাওয়া যায়নি।</p>
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}
