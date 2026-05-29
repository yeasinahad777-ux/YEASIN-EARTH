import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
	Volume2, VolumeX, Play, Pause, FastForward, RotateCcw, 
	Info, Orbit, Compass, Globe, Radio, ShieldAlert, X, ChevronRight, Star, Moon as MoonIcon
} from "lucide-react";

interface CelestialBody {
	id: string;
	nameBengali: string;
	nameEnglish: string;
	type: "star" | "planet" | "moon" | "satellite";
	color: string;
	glowColor: string;
	radius: number; // For visualization
	orbitRadius: number; // For visual layout
	speed: number; // orbital speed divisor
	facts: string[];
	bengaliFacts: string[];
	distanceFromSun: string;
	orbitalPeriod: string;
	diameter: string;
	temperature: string;
	mass: string;
}

const CELESTIAL_DATA: CelestialBody[] = [
	{
		id: "sun",
		nameBengali: "সূর্য",
		nameEnglish: "Sun",
		type: "star",
		color: "from-amber-400 via-orange-500 to-red-600",
		glowColor: "rgba(245, 158, 11, 0.8)",
		radius: 28,
		orbitRadius: 0,
		speed: 0,
		distanceFromSun: "০ কিমি (কেন্দ্রবিন্দু)",
		orbitalPeriod: "প্রযোজ্য নয় (গ্যালাক্সির চারপাশে ঘোরে)",
		diameter: "১৩,৯২,৭০০ কিমি",
		temperature: "৫,৫০০° সেলসিয়াস (পৃষ্ঠ)",
		mass: "১.৯৮৯ × ১০^৩০ কেজি",
		facts: [
			"The Sun is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions.",
			"It accounts for 99.86% of the total mass of the solar system."
		],
		bengaliFacts: [
			"সূর্য আমাদের সৌরজগতের কেন্দ্রবিন্দু এবং এর মোট ভরের ৯৯.৮৬% ধারণ করে।",
			"সূর্যের অভ্যন্তরের তাপমাত্রা প্রায় ১৫,০০০,০০০° সেলসিয়াস যেখানে নিউক্লিয়ার ফিউশন বিক্রিয়া ঘটে।"
		]
	},
	{
		id: "mercury",
		nameBengali: "বুধ",
		nameEnglish: "Mercury",
		type: "planet",
		color: "from-gray-400 via-slate-500 to-gray-600",
		glowColor: "rgba(148, 163, 184, 0.4)",
		radius: 6,
		orbitRadius: 45,
		speed: 4.15, // Fastest orbit
		distanceFromSun: "৫ কোটি ৭৯ লাখ কিমি",
		orbitalPeriod: "৮৮ দিন",
		diameter: "৪,৮৭৯ কিমি",
		temperature: "-১৮০°C থেকে ৪৩০°C",
		mass: "৩.৩ × ১০^২৩ কেজি",
		facts: [
			"Mercury is the smallest and closest planet to the Sun.",
			"It has no atmosphere to trap heat, resulting in extreme temperature swings."
		],
		bengaliFacts: [
			"বুধ সৌরজগতের ক্ষুদ্রতম এবং সূর্যের সবথেকে কাছের গ্রহ।",
			"এর কোনো বায়ুমণ্ডল নেই, তাই দিনের বেলা অতিরিক্ত গরম এবং রাতে অতিরিক্ত ঠান্ডা থাকে।"
		]
	},
	{
		id: "venus",
		nameBengali: "শুক্র",
		nameEnglish: "Venus",
		type: "planet",
		color: "from-orange-300 via-amber-500 to-yellow-600",
		glowColor: "rgba(245, 158, 11, 0.5)",
		radius: 9,
		orbitRadius: 70,
		speed: 1.62,
		distanceFromSun: "১০ কোটি ৮২ লাখ কিমি",
		orbitalPeriod: "২২৫ দিন",
		diameter: "১২,১০৪ কিমি",
		temperature: "৪৬৫°C (ধ্রুব অতি উত্তপ্ত)",
		mass: "৪.৮৭ × ১০^২৪ কেজি",
		facts: [
			"Venus is the hottest planet in our solar system because of its runaway greenhouse effect.",
			"It spins backwards on its axis compared to most other planets."
		],
		bengaliFacts: [
			"শুক্র সৌরজগতের সবচেয়ে উষ্ণতম গ্রহ। এর ঘন কার্বন-ডাই-অক্সাইডের বায়ুমণ্ডল তাপ আটকে রাখে।",
			"একে আকাশে 'শুকতারা' বা 'সন্ধ্যাতারা' হিসেবেও দেখা যায়। এটি বিপরীত দিকে ঘোরে।"
		]
	},
	{
		id: "earth",
		nameBengali: "পৃথিবী",
		nameEnglish: "Earth",
		type: "planet",
		color: "from-blue-500 via-emerald-500 to-blue-700",
		glowColor: "rgba(59, 130, 246, 0.5)",
		radius: 11,
		orbitRadius: 100,
		speed: 1.0, // Earth is the reference speed
		distanceFromSun: "১৪ কোটি ৯৬ লাখ কিমি",
		orbitalPeriod: "৩৬৫.২৫ দিন",
		diameter: "১২,৭৪২ কিমি",
		temperature: "-৮৯°C থেকে ৫৮°C",
		mass: "৫.৯৭ × ১০^২৪ কেজি",
		facts: [
			"Earth is the only known planet that supports life, with liquid water covering 71% of its surface.",
			"Our planet has a powerful magnetic field that protects us from cosmic rays."
		],
		bengaliFacts: [
			"জীবজগৎ টিকে থাকার মতো একমাত্র পরিচিত গ্রহ পৃথিবী। এর ৭১% ভাগ তরল পানি দ্বারা আবৃত।",
			"পৃথিবীর একটি শক্তিশালী চুম্বকক্ষেত্র আছে যা ক্ষতিকর মহাজাগতিক ও সৌর বিকিরণ থেকে রক্ষা করে।"
		]
	},
	{
		id: "moon",
		nameBengali: "চাঁদ",
		nameEnglish: "Moon (Luna)",
		type: "moon",
		color: "from-zinc-300 to-slate-400",
		glowColor: "rgba(255, 255, 255, 0.3)",
		radius: 4,
		orbitRadius: 18, // Inside Earth's local framework
		speed: 12.0, // Orbits fast around Earth
		distanceFromSun: "১৪ কোটি ৯৯ লাখ কিমি (পৃথিবী থেকে ৩,৮৪,৪০০ কিমি)",
		orbitalPeriod: "২৭.৩ দিন",
		diameter: "৩,৪৭৪ কিমি",
		temperature: "-১৩০°C থেকে ১২০°C",
		mass: "৭.৩ × ১০^২২ কেজি",
		facts: [
			"The Moon is Earth's only natural satellite, causing ocean tides through gravitational pull.",
			"It is in synchronous rotation, meaning it always shows the same face to Earth."
		],
		bengaliFacts: [
			"চাঁদ হলো পৃথিবীর একমাত্র প্রাকৃতিক উপগ্রহ। এর মহাকর্ষের প্রভাবেই সমুদ্রে জোয়ার-ভাটার সৃষ্টি হয়।",
			"এটি পৃথিবীর সাথে সমকালীন ঘূর্ণনে আবদ্ধ, তাই চিরকাল আমরা চাঁদের একই পিঠ বা পাশ দেখতে পাই।"
		]
	},
	{
		id: "bangabandhu_sat",
		nameBengali: "বঙ্গবন্ধু স্যাটেলাইট-১",
		nameEnglish: "Bangabandhu-1",
		type: "satellite",
		color: "from-rose-500 via-red-500 to-emerald-500",
		glowColor: "rgba(244, 63, 94, 0.6)",
		radius: 3,
		orbitRadius: 12, // Geo orbit
		speed: 24.0, // Very swift representation
		distanceFromSun: "পৃথিবী থেকে ৩৬,০০০ কিমি (ভূস্থির কক্ষপথ)",
		orbitalPeriod: "২৪ ঘণ্টা (পৃথিবীর সাথে সিঙ্কড)",
		diameter: "কমপ্যাক্ট কমিউনিকেশন স্যাটেলাইট",
		temperature: "নিয়ন্ত্রিত অভ্যন্তরীণ তাপমাত্রা",
		mass: "৩,৭০০ কেজি",
		facts: [
			"Launched on May 11, 2018, it is the first Bangladeshi geostationary communications satellite.",
			"Located at 119.1° East longitude, providing high-speed internet and telecom services."
		],
		bengaliFacts: [
			"১১ মে ২০১৮ সালে উৎক্ষেপণ করা হয়। এটি বাংলাদেশের প্রথম ভূস্থির যোগাযোগ স্যাটেলাইট।",
			" Indonesian দ্বীপ সুমাত্রার উত্তর আকাশে ১১৯.১ ডিগ্রী পূর্ব দ্রাঘিমাংশে এটি মহাকাশে অবস্থান করছে এবং দেশকে সম্প্রচার সেবা জোগাচ্ছে।"
		]
	},
	{
		id: "mars",
		nameBengali: "মঙ্গল গ্রহ",
		nameEnglish: "Mars",
		type: "planet",
		color: "from-orange-600 via-red-600 to-amber-700",
		glowColor: "rgba(239, 68, 68, 0.5)",
		radius: 8,
		orbitRadius: 135,
		speed: 0.53,
		distanceFromSun: "২২ কোটি ৭৯ লাখ কিমি",
		orbitalPeriod: "৬৮৭ দিন",
		diameter: "৬,৭৭৯ কিমি",
		temperature: "-১৫৩°C থেকে ২০°C",
		mass: "৬.৪২ × ১০^২৩ কেজি",
		facts: [
			"Mars is known as the 'Red Planet' due to iron oxide (rust) on its surface.",
			"It is home to Olympus Mons, the tallest volcano in the solar system, three times taller than Mt. Everest."
		],
		bengaliFacts: [
			"পৃষ্ঠের আয়রন অক্সাইড বা মরিচার কারণে একে 'লাল গ্রহ' বলা হয়।",
			"এখানে সৌরজগতের বৃহত্তম আগ্নেয়গিরি 'অলিম্পাস মন্স' রয়েছে যা এভারেস্টের চেয়ে প্রায় তিন গুণ উঁচু।"
		]
	},
	{
		id: "jupiter",
		nameBengali: "বৃহস্পতি",
		nameEnglish: "Jupiter",
		type: "planet",
		color: "from-amber-600 via-amber-300 to-orange-850",
		glowColor: "rgba(217, 119, 6, 0.4)",
		radius: 18,
		orbitRadius: 185,
		speed: 0.084,
		distanceFromSun: "৭৭ কোটি ৮৫ লাখ কিমি",
		orbitalPeriod: "১১.৯ বছর",
		diameter: "১,৩৯,৮২০ কিমি",
		temperature: "-১১০°C (গড় তাপমাত্রা)",
		mass: "১.৮৯৮ × ১০^২৭ কেজি (অন্য সব গ্রহের যোগফলের দ্বিগুণের বেশি)",
		facts: [
			"Jupiter is the largest planet in our solar system, with a Great Red Spot that is a massive hurricane twice as wide as Earth.",
			"It has at least 95 moons, including Ganymede, the biggest moon in the solar system."
		],
		bengaliFacts: [
			"বৃহস্পতি সৌরজগতের সবচেয়ে বড় গ্রহ (গ্রহরাজ)। এর বিখ্যাত 'গ্রেট রেড স্পট' হলো ৩০০ বছরের পুরনো এক ঝড়।",
			"এর ৯৫টিরও বেশি চাঁদ আছে, যার মধ্যে 'গ্যানিমিড' সৌরজগতের সর্ববৃহৎ প্রাকৃতিক উপগ্রহ।"
		]
	},
	{
		id: "saturn",
		nameBengali: "শনি",
		nameEnglish: "Saturn",
		type: "planet",
		color: "from-amber-200 via-amber-400 to-yellow-600",
		glowColor: "rgba(251, 191, 36, 0.4)",
		radius: 15,
		orbitRadius: 235,
		speed: 0.034,
		distanceFromSun: "১৪৩ কোটি কিমি",
		orbitalPeriod: "২৯.৪ বছর",
		diameter: "১,১৬,৪৬০ কিমি",
		temperature: "-১৪০°C",
		mass: "৫.৬৮ × ১০^২৬ কেজি",
		facts: [
			"Saturn has the most spectacular ring system, made of ice particles, rocky debris, and dust.",
			"It has the lowest density of all planets; if there were a bathtub big enough, Saturn would float on water."
		],
		bengaliFacts: [
			"শনি গ্রহটি তার চমৎকার বরফ ও ধূলিকণার তৈরি বলয় (Rings) বা বলয়জগতের জন্য বিখ্যাত।",
			"এর ঘনত্ব এতটাই কম যে একটি বড় পানির পাত্রে একে ছেড়ে দিলে এটি সম্পূর্ণ ভেসে থাকবে।"
		]
	},
	{
		id: "uranus",
		nameBengali: "ইউরেনাস",
		nameEnglish: "Uranus",
		type: "planet",
		color: "from-cyan-300 via-teal-400 to-blue-500",
		glowColor: "rgba(34, 211, 238, 0.4)",
		radius: 12,
		orbitRadius: 285,
		speed: 0.012,
		distanceFromSun: "২৮৭ কোটি কিমি",
		orbitalPeriod: "৮৪ বছর",
		diameter: "৫০,৭২৪ কিমি",
		temperature: "-১৯৭°C (সরাসরি হিমশীতল চরম হিমবাহ)",
		mass: "৮.৬৮ × ১০^২৫ কেজি",
		facts: [
			"Uranus is uniquely tilted almost 98 degrees on its side, making it roll around the Sun like a ball.",
			"Its atmosphere contains methane, which gives it a beautiful pale blue-green color."
		],
		bengaliFacts: [
			"ইউরেনাস প্রায় ৯৮ ডিগ্রি কোণে কাত হয়ে মহাকাশে ঘোরে, তাই এটি সূর্যের চারপাশে বলের মতো গড়ায়।",
			"এর বায়ুমণ্ডলে মিথেন গ্যাসের কারণে এটি হালকা নীল ও সবুজ রঙের মনোরম আভায় জ্বলজ্বল করে।"
		]
	},
	{
		id: "neptune",
		nameBengali: "নেপচুন",
		nameEnglish: "Neptune",
		type: "planet",
		color: "from-blue-600 via-indigo-600 to-blue-900",
		glowColor: "rgba(79, 70, 229, 0.5)",
		radius: 11,
		orbitRadius: 335,
		speed: 0.006,
		distanceFromSun: "৪৪৯ কোটি ৫০ লাখ কিমি",
		orbitalPeriod: "১৬৪.৮ বছর",
		diameter: "৪৯,২৪৪ কিমি",
		temperature: "-২০১°C",
		mass: "১.০২ × ১০^২৬ কেজি",
		facts: [
			"Neptune is the farthest planet in our solar system and has the strongest winds recorded, reaching up to 2,100 km/h.",
			"It was the first planet discovered by mathematical calculations before it was seen through a telescope."
		],
		bengaliFacts: [
			"নেপচুন সূর্যের সবচেয়ে দূরের গ্রহ এবং এখানে সৌরজগতের সবচেয়ে তীব্র ঝড় বয়ে যায় (ঘণ্টায় প্রায় ২,১০০ কিমি)।",
			"টেলিস্কোপে সরাসরি দেখার আগে, এটি বিশুদ্ধ গণিত ও ফিজিক্স ব্যবহার করে কাগজে-কলমে আবিষ্কৃত হয়েছিল।"
		]
	}
];

// Human-made Satellite coordinates and orbit facts
const MAN_MADE_SATELLITES = [
	{
		name: "বঙ্গবন্ধু স্যাটেলাইট-১ (BD-1)",
		launchDate: "১১ মে ২০১৮",
		position: "১১৯.১° পূর্ব দ্রাঘিমাংশ (ভূস্থির কক্ষপথ)",
		altitude: "প্রায় ৩৫,৭৮৬ কিমি",
		purpose: "টেলিযোগাযোগ সেবা, টিভি ব্রডকাস্ট ও ডিরেক্ট-টু-হোম (DTH)"
	},
	{
		name: "আন্তর্জাতিক মহাকাশ স্টেশন (ISS)",
		launchDate: "২০ নভেম্বর ১৯৯৮",
		position: "আবর্তনশীল নিচু কক্ষপথ (LEO)",
		altitude: "৪০০-৪২০ কিমি",
		purpose: "বহুজাতিক বৈজ্ঞানিক গবেষণাগার ও মানব বসতি"
	},
	{
		name: "হাবল স্পেস টেলিস্কোপ (HST)",
		launchDate: "২৪ এপ্রিল ১৯৯০",
		position: "আবর্তনশীল নিচু কক্ষপথ (LEO)",
		altitude: "৫৪০ কিমি",
		purpose: "মহাজাগতিক গ্যালাক্সি, ব্ল্যাকহোল এবং নেবুলার ছবি ও গবেষণা"
	}
];

interface CelestialModelProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function SolarSystemExplorer({ isOpen, onClose }: CelestialModelProps) {
	const [activeBody, setActiveBody] = useState<CelestialBody | null>(CELESTIAL_DATA[0]);
	const [isAnimating, setIsAnimating] = useState(true);
	const [speedMultiplier, setSpeedMultiplier] = useState(1);
	const [viewMode, setViewMode] = useState<"orbit" | "grid">("orbit");
	const [timeState, setTimeState] = useState(0);
	const [selectedTab, setSelectedTab] = useState<"planets" | "satellites">("planets");
	const requestRef = useRef<number | null>(null);

	// Multiplier setup for celestial rendering
	useEffect(() => {
		if (!isAnimating) {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
			return;
		}

		let lastTime = performance.now();
		const updateOrbit = (time: number) => {
			const delta = (time - lastTime) * 0.001; // in seconds
			lastTime = time;
			setTimeState((prev) => prev + delta * speedMultiplier);
			requestRef.current = requestRef.current = requestAnimationFrame(updateOrbit);
		};

		requestRef.current = requestRef.current = requestAnimationFrame(updateOrbit);
		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [isAnimating, speedMultiplier]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-[#02020a] z-[120] text-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
			{/* Stars Starfield background */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-[#010103] pointer-events-none z-0" />
			<div className="absolute inset-0 opacity-35 bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80')] pointer-events-none z-0 bg-cover bg-center mix-blend-color-dodge" />

			{/* Interactive Left Solar System visualizer */}
			<div className="w-full md:w-3/5 h-[45vh] md:h-full relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 z-10 select-none">
				
				{/* Top Panel */}
				<div className="flex justify-between items-center relative z-25 w-full">
					<div>
						<h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
							<Orbit className="text-amber-500 animate-pulse" size={24} />
							কসমিক মহাকাশ ও সৌরজগৎ গাইড
						</h1>
						<p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
							মহাবিশ্বের কক্ষপথ, গ্রহসমূহ এবং কৃত্রিম উপগ্রহের ত্রিমাত্রিক অফলাইন নকশা
						</p>
					</div>

					{/* Close and minimize button */}
					<button
						onClick={onClose}
						className="bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-white p-2 rounded-2xl transition-all duration-300"
						id="close-solar-sys-explorer"
					>
						<X size={18} />
					</button>
				</div>

				{/* 2D Orbital Map View */}
				<div className="flex-1 flex items-center justify-center relative overflow-hidden my-2">
					<svg 
						viewBox="-400 -400 800 800" 
						className="w-full max-w-[550px] aspect-square object-contain"
					>
						{/* Background Star grid */}
						<defs>
							<radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#f59e0b" />
								<stop offset="30%" stopColor="#f97316" />
								<stop offset="70%" stopColor="#dc2626" />
								<stop offset="100%" stopColor="transparent" stopOpacity="0" />
							</radialGradient>
						</defs>

						{/* Delicate Orbit paths (dotted circles) */}
						{CELESTIAL_DATA.filter(b => b.id !== "sun" && b.id !== "moon" && b.id !== "bangabandhu_sat").map((body) => (
							<circle
								key={`orbit-${body.id}`}
								r={body.orbitRadius}
								fill="none"
								stroke="rgba(255, 255, 255, 0.05)"
								strokeWidth="1"
								strokeDasharray="4,6"
								className="transition-all"
							/>
						))}

						{/* Earth Orbit detail containing moon and satellites */}
						<circle
							r={100}
							fill="none"
							stroke="rgba(59, 130, 246, 0.12)"
							strokeWidth="1.5"
						/>

						{/* 1. CENTRAL GLOWING SUN */}
						<circle 
							r={50} 
							fill="url(#sun-grad)" 
							className="animate-pulse" 
						/>
						<circle
							r={22}
							fill="none"
							stroke="rgba(245,158,11,0.6)"
							strokeWidth="2"
							className="cursor-pointer"
							onClick={() => setActiveBody(CELESTIAL_DATA[0])}
						/>

						{/* 2. PLANETS & MOONS & SATELLITES orbits */}
						{CELESTIAL_DATA.filter(b => b.id !== "sun" && b.id !== "moon" && b.id !== "bangabandhu_sat").map((body) => {
							// Determine calculated angle
							// angle = time * speed
							const angle = timeState * (body.speed * 0.15);
							const x = body.orbitRadius * Math.cos(angle);
							const y = body.orbitRadius * Math.sin(angle);
							const isActive = activeBody?.id === body.id;

							return (
								<g key={`group-${body.id}`}>
									{/* Active glow pointer */}
									{isActive && (
										<circle
											cx={x}
											cy={y}
											r={body.radius + 10}
											fill="none"
											stroke="rgba(168, 85, 247, 0.4)"
											strokeWidth="1.5"
											className="animate-ping"
										/>
									)}

									{/* The Planet Circle */}
									<circle
										cx={x}
										cy={y}
										r={body.radius}
										className={`cursor-pointer transition-all hover:scale-125 duration-150`}
										fill={`url(#grad-${body.id})` || "#94a3b8"}
										filter={isActive ? "drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))" : ""}
										onClick={() => setActiveBody(body)}
									/>

									{/* Gradients declaration inside SVG */}
									<defs>
										<linearGradient id={`grad-${body.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor={body.color.split(" ")[1]?.replace("via-", "") || "#1e293b"} />
											<stop offset="100%" stopColor={body.color.split(" ")[2]?.replace("to-", "") || "#0f172a"} />
										</linearGradient>
									</defs>

									{/* Labels for main planets */}
									<text
										x={x}
										y={y - body.radius - 6}
										fill={isActive ? "#c084fc" : "#94a3b8"}
										fontSize="10"
										fontWeight={isActive ? "bold" : "normal"}
										textAnchor="middle"
										className="pointer-events-none select-none bg-black/80 font-semibold"
									>
										{body.nameBengali}
									</text>

									{/* Earth local satellites representation */}
									{body.id === "earth" && (
										<>
											{/* Moon orbit and position */}
											{(() => {
												const moonOrbit = CELESTIAL_DATA.find(b => b.id === "moon")!;
												const mAngle = timeState * (moonOrbit.speed * 0.15);
												const mx = x + moonOrbit.orbitRadius * Math.cos(mAngle);
												const my = y + moonOrbit.orbitRadius * Math.sin(mAngle);
												const isMoonActive = activeBody?.id === "moon";
												return (
													<g key="moon-suborbit">
														<circle
															cx={x}
															cy={y}
															r={moonOrbit.orbitRadius}
															fill="none"
															stroke="rgba(255, 255, 255, 0.08)"
															strokeWidth="0.5"
														/>
														<circle
															cx={mx}
															cy={my}
															r={moonOrbit.radius}
															fill="#cbd5e1"
															className="cursor-pointer"
															onClick={(e) => {
																e.stopPropagation();
																setActiveBody(moonOrbit);
															}}
														/>
														{isMoonActive && (
															<circle cx={mx} cy={my} r={moonOrbit.radius + 4} fill="none" stroke="#a855f7" strokeWidth="0.8" />
														)}
													</g>
												);
											})()}

											{/* Bangabandhu-1 Satellite orbit and position */}
											{(() => {
												const satData = CELESTIAL_DATA.find(b => b.id === "bangabandhu_sat")!;
												const sAngle = timeState * (satData.speed * 0.15);
												const sx = x + satData.orbitRadius * Math.cos(sAngle);
												const sy = y + satData.orbitRadius * Math.sin(sAngle);
												const isSatActive = activeBody?.id === "bangabandhu_sat";
												return (
													<g key="sat-suborbit">
														<circle
															cx={x}
															cy={y}
															r={satData.orbitRadius}
															fill="none"
															stroke="rgba(244, 63, 94, 0.15)"
															strokeWidth="0.5"
															strokeDasharray="1,1"
														/>
														{/* Satellite micro rect indicator */}
														<rect
															x={sx - 2}
															y={sy - 2}
															width="4"
															height="4"
															fill="#f43f5e"
															transform={`rotate(${(sAngle * 180) / Math.PI}, ${sx}, ${sy})`}
															className="cursor-pointer animate-pulse"
															onClick={(e) => {
																e.stopPropagation();
																setActiveBody(satData);
															}}
														/>
														{isSatActive && (
															<circle cx={sx} cy={sy} r={6} fill="none" stroke="#f43f5e" strokeWidth="0.8" className="animate-ping" />
														)}
													</g>
												);
											})()}
										</>
									)}
								</g>
							);
						})}
					</svg>

					{/* Background galaxy hint message */}
					<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full text-[10px] text-gray-400 pointer-events-none flex items-center gap-1.5 z-20">
						<Compass size={11} className="text-amber-400 rotate-180 animate-spin" style={{ animationDuration: '10s' }} />
						যেকোনো গ্রহে ক্লিক করে তার গভীর তথ্য বিশ্লেষণ করুন
					</div>
				</div>

				{/* Controls Bottom Drawer */}
				<div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between relative z-25">
					<div className="flex items-center gap-2">
						{/* Play/Pause Button */}
						<button
							onClick={() => setIsAnimating(!isAnimating)}
							className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-gray-200"
							title={isAnimating ? "গতি বন্ধ করুন" : "কক্ষপথ গতি বাড়ান"}
						>
							{isAnimating ? <Pause size={15} /> : <Play size={15} />}
						</button>

						{/* Reset alignment */}
						<button
							onClick={() => setTimeState(0)}
							className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-gray-200"
							title="কক্ষপথের পুনর্স্থাপন"
						>
							<RotateCcw size={15} />
						</button>
					</div>

					{/* Time Multipliers */}
					<div className="flex items-center gap-1.5 bg-black/50 border border-white/5 p-1 rounded-xl">
						{[
							{ v: 0.2, label: "0.2x" },
							{ v: 1, label: "1x" },
							{ v: 5, label: "5x" },
							{ v: 15, label: "15x" }
						].map((item) => (
							<button
								key={item.label}
								onClick={() => setSpeedMultiplier(item.v)}
								className={`text-2xs font-extrabold px-2 py-1 rounded-lg transition-colors ${
									speedMultiplier === item.v 
										? "bg-amber-500 text-black font-black" 
										: "text-gray-400 hover:text-white hover:bg-white/5"
								}`}
							>
								{item.label}
							</button>
						))}
					</div>

					{/* Indicators Legend */}
					<div className="flex gap-3 text-[10px] text-gray-400 shrink-0 font-medium font-mono">
						<span className="flex items-center gap-1">
							<span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> সূর্য/নক্ষত্র
						</span>
						<span className="flex items-center gap-1">
							<span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> গ্রহসমূহ
						</span>
						<span className="flex items-center gap-1">
							<span className="w-1.5 h-1.5 rounded-full bg-red-400" /> কৃত্রিম উপগ্রহ
						</span>
					</div>
				</div>

			</div>

			{/* Informative Right Data panel */}
			<div className="w-full md:w-2/5 h-[55vh] md:h-full bg-slate-950/40 relative z-10 flex flex-col overflow-y-auto border-t md:border-t-0 border-white/10">
				
				{/* Right Navigation tab */}
				<div className="flex border-b border-white/10 bg-black/60 sticky top-0 z-40">
					<button
						onClick={() => setSelectedTab("planets")}
						className={`flex-1 py-4 text-center text-xs font-black tracking-widest uppercase border-b-2 flex items-center justify-center gap-2 transition-all ${
							selectedTab === "planets" 
								? "border-amber-500 text-white font-black bg-white/5" 
								: "border-transparent text-gray-400 hover:text-white"
						}`}
					>
						<Globe size={13} /> মহাজাগতিক ও গ্রহরাজ্য
					</button>
					<button
						onClick={() => setSelectedTab("satellites")}
						className={`flex-1 py-4 text-center text-xs font-black tracking-widest uppercase border-b-2 flex items-center justify-center gap-2 transition-all ${
							selectedTab === "satellites" 
								? "border-amber-500 text-white font-black bg-white/5" 
								: "border-transparent text-gray-400 hover:text-white"
						}`}
					>
						<Radio size={13} /> স্যাটেলাইট ও ট্র্যাকার
					</button>
				</div>

				{selectedTab === "planets" && (
					<div className="p-4 md:p-6 flex-1 flex flex-col">
						{activeBody ? (
							<div className="flex-1 flex flex-col justify-between">
								<div>
									{/* Interactive Selected Body Title */}
									<div className="flex items-start justify-between gap-4 mb-4">
										<div>
											<span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
												{activeBody.type === "star" ? "☀️ নক্ষত্র" : activeBody.type === "planet" ? "🪐 সৌর গ্রহ" : activeBody.type === "moon" ? "🌙 উপগ্রহ" : "🛰️ কৃত্রিম স্পেসক্রাফট"}
											</span>
											<h2 className="text-3xl font-black text-white mt-1 border-b-2 border-white/5 pb-1 flex items-baseline gap-2">
												{activeBody.nameBengali}
												<span className="text-sm font-medium text-gray-400 font-mono">
													({activeBody.nameEnglish})
												</span>
											</h2>
										</div>

										{/* Realistic visual node container */}
										<div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${activeBody.color} flex items-center justify-center shadow-lg transform shrink-0 hover:rotate-45 transition-transform duration-500 ring-2 ring-purple-500/20`} />
									</div>

									{/* Key Stats Grid */}
									<div className="grid grid-cols-2 gap-3 mb-5 font-mono text-xs">
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">সূর্য হতে গড় দূরত্ব</span>
											<strong className="text-white text-xs block">{activeBody.distanceFromSun}</strong>
										</div>
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">কক্ষপথ আবর্তন কাল</span>
											<strong className="text-white text-xs block">{activeBody.orbitalPeriod}</strong>
										</div>
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">গ্রহের ব্যাস (ব্যাস)</span>
											<strong className="text-white text-xs block">{activeBody.diameter}</strong>
										</div>
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">গড় তাপমাত্রা</span>
											<strong className="text-amber-400 text-xs block">{activeBody.temperature}</strong>
										</div>
										<div className="col-span-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">মোট ভর (Mass)</span>
											<strong className="text-white text-xs block truncate">{activeBody.mass}</strong>
										</div>
									</div>

									{/* Detailed Explanations / Facts */}
									<div className="space-y-3">
										<h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
											<Info size={14} className="animate-bounce" /> বিশেষ বৈজ্ঞানিক তথ্য ও সত্যতা
										</h4>
										
										{activeBody.bengaliFacts.map((fact, index) => (
											<div key={`bfact-${index}`} className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-300 leading-relaxed shadow-sm">
												{fact}
											</div>
										))}

										{/* Supplementary English Quote */}
										<div className="p-3 border-l-2 border-purple-500 bg-purple-500/5 rounded-r-xl text-2xs italic text-purple-200 leading-relaxed font-mono">
											{activeBody.facts[0]}
										</div>
									</div>
								</div>

								{/* Side selection navigation map */}
								<div className="pt-6 border-t border-white/5 mt-6">
									<span className="block text-2xs uppercase text-gray-500 font-bold mb-2">গাইড বুক সূচি</span>
									<div className="flex flex-wrap gap-1.5">
										{CELESTIAL_DATA.map((item) => (
											<button
												key={`tabBtn-${item.id}`}
												onClick={() => setActiveBody(item)}
												className={`text-2xs px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
													activeBody.id === item.id 
														? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20" 
														: "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
												}`}
											>
												{item.nameBengali}
											</button>
										))}
									</div>
								</div>
							</div>
						) : (
							<div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
								<Compass className="animate-spin text-gray-600 mb-3" size={32} />
								বিশ্লেষণ করার জন্য তালিকায় থাকা যেকোনো বস্তু নির্বাচন করুন
							</div>
						)}
					</div>
				)}

				{selectedTab === "satellites" && (
					<div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
						<div>
							<h3 className="text-base font-black text-rose-400 mb-0.5 flex items-center gap-2">
								<Radio className="animate-pulse" size={16} /> কৃত্রিম উপগ্রহ এবং মহাকাশ কেন্দ্র ট্র্যাকার
							</h3>
							<p className="text-xs text-gray-400 mb-4 leading-relaxed">
								পৃথিবীর কক্ষপথে মানবজাতির পাঠানো উল্লেখযোগ্য উপগ্রহ ও বৈজ্ঞানিক স্টেশনসমূহের বর্তমান স্থানাঙ্ক এবং বর্ণনা:
							</p>

							{/* Satellite blocks */}
							<div className="space-y-4">
								{MAN_MADE_SATELLITES.map((sat, i) => (
									<div 
										key={sat.name}
										className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-rose-400/30 transition-all duration-300 relative group overflow-hidden"
									>
										<div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
										
										<div className="flex items-center gap-2 mb-2">
											<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 animate-pulse">
												নিরাপদ কক্ষপথ {i+1}
											</span>
											<span className="text-xs font-mono text-gray-500">উৎক্ষেপণ: {sat.launchDate}</span>
										</div>

										<h4 className="text-sm font-black text-white hover:text-rose-300 transition-colors">
											{sat.name}
										</h4>

										<div className="mt-3 space-y-1 text-xs text-gray-300 font-medium">
											<p><span className="text-gray-500">অবস্থান ও উচ্চতা:</span> <span className="font-mono text-xs">{sat.position} ({sat.altitude})</span></p>
											<p className="leading-relaxed mt-1 text-gray-400"><span className="text-gray-500">উদ্দেশ্য বা কাজ:</span> {sat.purpose}</p>
										</div>
									</div>
								))}
							</div>

							{/* Extra warning panel on Satellite Communication */}
							<div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl mt-4 flex items-start gap-3">
								<ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
								<div className="text-xs text-amber-200/90 leading-relaxed font-semibold">
									<strong className="block text-amber-400 font-bold mb-0.5">বঙ্গবন্ধু স্যাটেলাইট-১ নোট:</strong>
									বঙ্গবন্ধু স্যাটেলাইট-১ রাশিয়ার স্পেস ফার্ম 'থার্লেস অ্যালেনিয়া স্পেস' থেকে নির্মিত এবং যুক্তরাষ্ট্রের স্পেসক্রাফট ফ্যালকন-৯ রকেট দিয়ে সফলভাবে ফ্লোরিডা থেকে উৎক্ষেপিত ও স্থাপিত হয়।
								</div>
							</div>
						</div>

						{/* Quick Link/Call to explore earth again */}
						<div className="pt-6 border-t border-white/5 mt-6 self-bottom text-center">
							<p className="text-2xs text-gray-500 font-semibold mb-2">
								সৌরজগৎ থেকে পুনরায় ভূপৃষ্ঠে ফিরে যেতে চান?
							</p>
							<button
								onClick={() => {
									setSelectedTab("planets");
									const earthObj = CELESTIAL_DATA.find(b => b.id === "earth");
									if (earthObj) setActiveBody(earthObj);
								}}
								className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 justify-center mx-auto transition-transform active:scale-95 duration-200"
							>
								আমাদের নীল গ্রহ 'পৃথিবী' সিলেক্ট করুন <ChevronRight size={14} />
							</button>
						</div>
					</div>
				)}

			</div>
		</div>
	);
}
