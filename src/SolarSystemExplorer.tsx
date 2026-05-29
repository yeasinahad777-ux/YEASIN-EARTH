import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
	Volume2, VolumeX, Play, Pause, FastForward, RotateCcw, 
	Info, Orbit, Compass, Globe, Radio, ShieldAlert, X, ChevronRight, Star, Moon as MoonIcon,
	Eye, Maximize2, RotateCw
} from "lucide-react";

// Types represent full 3D and orbital parameters
interface CelestialBody {
	id: string;
	nameBengali: string;
	nameEnglish: string;
	type: "star" | "planet" | "moon" | "satellite";
	color: string;
	glowColor: string;
	radius: number; // base physics radius
	orbitRadius: number; // distance from Sun (0 for Sun)
	speed: number; // orbital speed multiplier
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
		color: "from-yellow-400 via-orange-500 to-red-600",
		glowColor: "rgba(251, 191, 36, 0.8)",
		radius: 26,
		orbitRadius: 0,
		speed: 0,
		distanceFromSun: "০ কিমি (কেন্দ্রবিন্দু)",
		orbitalPeriod: "প্রযোজ্য নয়",
		diameter: "১৩,৯২,৭০০ কিমি",
		temperature: "৫,৫০০° সেলসিয়াস",
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
		glowColor: "rgba(148, 163, 184, 0.5)",
		radius: 6,
		orbitRadius: 45,
		speed: 4.15,
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
		glowColor: "rgba(245, 158, 11, 0.6)",
		radius: 9,
		orbitRadius: 75,
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
		color: "from-[#1d4ed8] via-[#059669] to-[#1e40af]",
		glowColor: "rgba(59, 130, 246, 0.6)",
		radius: 12,
		orbitRadius: 110,
		speed: 1.0, 
		distanceFromSun: "১৪ কোটি ৯৬ লাখ কিমি",
		orbitalPeriod: "৩৬৫.২৫ দিন",
		diameter: "১২,৭৪২ কিমি",
		temperature: "-৮৯°C থেকে ৫৮°C",
		mass: "৫.৯৭ × ১০^২৪ কেজি",
		facts: [
			"Earth is the only known planet that supports life, with liquid water covering 71% of its surface.",
			"Our planet has a powerful physical field that protects us from solar radiation."
		],
		bengaliFacts: [
			"জীবজগৎ টিকে থাকার মতো একমাত্র পরিচিত মহাজাগতিক গ্রহ পৃথিবী। এর ৭১% ভাগ তরল পানি দ্বারা আবৃত।",
			"পৃথিবীর একটি শক্তিশালী প্রাকৃতিক চুম্বকক্ষেত্র আছে যা ক্ষতিকর মহাজাগতিক বিকিরণ থেকে আমাদের রক্ষা করে।"
		]
	},
	{
		id: "moon",
		nameBengali: "চাঁদ",
		nameEnglish: "Moon",
		type: "moon",
		color: "from-zinc-300 to-slate-400",
		glowColor: "rgba(203, 213, 225, 0.4)",
		radius: 3.5,
		orbitRadius: 22, 
		speed: 10.0,
		distanceFromSun: "১৪ কোটি ৯৯ লাখ কিমি (পৃথিবীর উপগ্রহ)",
		orbitalPeriod: "২৭.৩ দিন",
		diameter: "৩,৪৭৪ কিমি",
		temperature: "-১৩০°C থেকে ১২০°C",
		mass: "৭.৩ × ১০^২২ কেজি",
		facts: [
			"The Moon is Earth's only natural satellite, causing ocean tides through gravitational pull.",
			"It is in synchronous rotation, always showing the same side to Earth."
		],
		bengaliFacts: [
			"চাঁদ হলো পৃথিবীর একমাত্র প্রাকৃতিক উপগ্রহ। এর মহাকর্ষের প্রভাবেই সমুদ্রে জোয়ার-ভাটার সৃষ্টি হয়।",
			"এটি পৃথিবীর সাথে সমকালীন ঘূর্ণনে আবদ্ধ, তাই চিরকাল আমরা চাঁদের একই পিঠ দেখতে পাই।"
		]
	},
	{
		id: "bangabandhu_sat",
		nameBengali: "বঙ্গবন্ধু স্যাটেলাইট-১",
		nameEnglish: "Bangabandhu-1",
		type: "satellite",
		color: "from-rose-500 to-red-600",
		glowColor: "rgba(244, 63, 94, 0.7)",
		radius: 2.5,
		orbitRadius: 13, 
		speed: 18.0,
		distanceFromSun: "পৃথিবী হতে ৩৬,০০০ কিমি উচ্চতায় কক্ষপথ",
		orbitalPeriod: "২৪ ঘণ্টা (ভূস্থির)",
		diameter: "কমিউনিকেশন স্যাটেলাইট বাস",
		temperature: "নিয়ন্ত্রিত থার্মাল সীমানা",
		mass: "৩,৭০০ কেজি",
		facts: [
			"Launched on May 11, 2018, it is the first Bangladeshi geostationary communications satellite.",
			"Positioned at 119.1° East longitude, covering Bangladesh and surrounding regions."
		],
		bengaliFacts: [
			"১১ মে ২০১৮ সালে উৎক্ষেপণ করা হয়। এটি বাংলাদেশের সর্বপ্রথম ভূস্থির স্পেস স্যাটেলাইট।",
			"ইন্ডোনেশিয়ান সুমাত্রার আকাশে ১১৯.১ ডিগ্রী পূর্ব দ্রাঘিমাংশে থেকে এটি অবিরত দেশের ডিটিএইচ এবং ব্রডকাস্ট নিয়ন্ত্রণ করছে।"
		]
	},
	{
		id: "mars",
		nameBengali: "মঙ্গল গ্রহ",
		nameEnglish: "Mars",
		type: "planet",
		color: "from-red-600 via-orange-600 to-amber-800",
		glowColor: "rgba(239, 68, 68, 0.6)",
		radius: 8.5,
		orbitRadius: 145,
		speed: 0.53,
		distanceFromSun: "২২ কোটি ৭৯ লাখ কিমি",
		orbitalPeriod: "৬৮৭ দিন",
		diameter: "৬,৭৭৯ কিমি",
		temperature: "-১৫৩°C থেকে ২০°C",
		mass: "৬.৪২ × ১০^২৩ কেজি",
		facts: [
			"Mars is known as the 'Red Planet' due to iron oxide on its surface.",
			"It holds Olympus Mons, the tallest volcano in our solar system."
		],
		bengaliFacts: [
			"পৃষ্ঠের আয়রন অক্সাইড বা লালচে মরিচার কারণে মহাকাশে একে 'লাল গ্রহ' বলা হয়।",
			"এখানে সৌরজগতের বৃহত্তম আগ্নেয়গিরি 'অলিম্পাস মন্স' রয়েছে যা এভারেস্টের চেয়ে প্রায় তিন গুণ উঁচু।"
		]
	},
	{
		id: "jupiter",
		nameBengali: "বৃহস্পতি",
		nameEnglish: "Jupiter",
		type: "planet",
		color: "from-amber-600 via-yellow-700 to-orange-900",
		glowColor: "rgba(217, 119, 6, 0.5)",
		radius: 17,
		orbitRadius: 195,
		speed: 0.18,
		distanceFromSun: "৭৭ কোটি ৮৫ লাখ কিমি",
		orbitalPeriod: "১১.৯ বছর",
		diameter: "১,৩৯,৮২০ কিমি",
		temperature: "-১১০°C",
		mass: "১.৮৯৮ × ১০^২৭ কেজি",
		facts: [
			"Jupiter is the largest planet in our solar system, with a Great Red Spot hurricane twice as wide as Earth.",
			"It has at least 95 moons, including Ganymede."
		],
		bengaliFacts: [
			"বৃহস্পতি সৌরজগতের সবচেয়ে বড় গ্রহ। এর বিখ্যাত 'গ্রেট রেড স্পট' হলো ৩০০ বছরের পুরনো এক ঘূর্ণি ঝড়।",
			"এর ৯৫টিরও বেশি চাঁদ আছে, যার মধ্যে 'গ্যানিমিড' সৌরজগতের সর্ববৃহৎ উপগ্রহ।"
		]
	},
	{
		id: "saturn",
		nameBengali: "শনি",
		nameEnglish: "Saturn",
		type: "planet",
		color: "from-yellow-200 via-amber-400 to-yellow-700",
		glowColor: "rgba(251, 191, 36, 0.5)",
		radius: 14.5,
		orbitRadius: 245,
		speed: 0.09,
		distanceFromSun: "১৪৩ কোটি কিমি",
		orbitalPeriod: "২৯.৪ বছর",
		diameter: "১,১৬,৪৬০ কিমি",
		temperature: "-১৪০°C",
		mass: "৫.৬৮ × ১০^২৬ কেজি",
		facts: [
			"Saturn has the most spectacular rings made of ice, rock dust, and boulders.",
			"It has the lowest density of all planets and would float on water."
		],
		bengaliFacts: [
			"শনি গ্রহটি তার চমৎকার ঘূর্ণনশীল বরফ ও ধূলিকণার তৈরি চকচকে বলয় (Rings) এর জন্য বিখ্যাত।",
			"এর ঘনত্ব পানির চেয়েও কম, বড় জলাশয় থাকলে শনি গ্রহটি পানিতে অনায়াসে ভেসে থাকত।"
		]
	},
	{
		id: "uranus",
		nameBengali: "ইউরেনাস",
		nameEnglish: "Uranus",
		type: "planet",
		color: "from-cyan-300 via-teal-400 to-blue-500",
		glowColor: "rgba(34, 211, 238, 0.5)",
		radius: 11,
		orbitRadius: 295,
		speed: 0.04,
		distanceFromSun: "২৮৭ কোটি কিমি",
		orbitalPeriod: "৮৪ বছর",
		diameter: "৫০,৭২৪ কিমি",
		temperature: "-১৯৭°C",
		mass: "৮.৬৮ × ১০^২৫ কেজি",
		facts: [
			"Uranus is tilted by 98 degrees on its axis, rolling on its side around the Sun.",
			"Its atmosphere contains methane, which absorbs red light to make it look blue."
		],
		bengaliFacts: [
			"ইউরেনাস প্রায় ৯৮ ডিগ্রি কোণে কাত হয়ে মহাকাশে ঘোরে, অর্থাৎ এটি সূর্যের চারপাশ দিয়ে বলের মতো গড়ায়।",
			"এর বায়ুমণ্ডলে মিথেন গ্যাসের কারণে এটি হালকা নীল ও নিলাভ-সবুজ রঙের মনোরম আভায় জ্বলজ্বল করে।"
		]
	},
	{
		id: "neptune",
		nameBengali: "নেপচুন",
		nameEnglish: "Neptune",
		type: "planet",
		color: "from-blue-600 via-indigo-600 to-blue-900",
		glowColor: "rgba(79, 70, 229, 0.6)",
		radius: 10.5,
		orbitRadius: 345,
		speed: 0.02,
		distanceFromSun: "৪৪৯ কোটি ৫০ লাখ কিমি",
		orbitalPeriod: "১৬৪.৮ বছর",
		diameter: "৪৯,২৪৪ কিমি",
		temperature: "-২০১°C",
		mass: "১.০২ × ১০^২৬ কেজি",
		facts: [
			"Neptune is the farthest planet in our solar system, with supersonic winds reaching 2,100 km/h.",
			"It was mathematically predicted code before actually being observed physically."
		],
		bengaliFacts: [
			"নেপচুন সূর্যের সবচেয়ে দূরের গ্রহ এবং এখানে সৌরজগতের সবচেয়ে তীব্র সুপারসনিক ঝড় বয়ে যায় (ঘণ্টায় প্রায় ২,১০০ কিমি)।",
			"টেলিস্কোপে সরাসরি দেখার আগে, গণিত ও মহাকর্ষ সূত্র ব্যবহার করে কাগজে-কলমে এটি আবিষ্কৃত হয়েছিল।"
		]
	}
];

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
		purpose: "বহুজাতিক বৈজ্ঞানিক গবেষণাগার ও মহাকাশযানের নোঙরখানা"
	},
	{
		name: "হাবল স্পেস টেলিস্কোপ (HST)",
		launchDate: "২৪ এপ্রিল ১৯৯০",
		position: "আবর্তনশীল নিচু LEO কক্ষপথ",
		altitude: "৫৪০ কিমি",
		purpose: "দূর গ্যালাক্সি, ব্ল্যাকহোল এবং নেবুলার নিঁখুত আলো ও ছবি ধারণ"
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
	const [selectedTab, setSelectedTab] = useState<"planets" | "satellites">("planets");
	
	// Real camera controls supporting drag/zoom
	const [yaw, setYaw] = useState(-Math.PI / 4); // camera horizontal orbit
	const [pitch, setPitch] = useState(Math.PI / 6); // camera vertical declination
	const [zoom, setZoom] = useState(1); // general zoom scale
	const [autoOrbit, setAutoOrbit] = useState(true); // slow 3D camera pan by default
	const [focusOnActive, setFocusOnActive] = useState(false); // smoothly lock on chosen planet

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const isDragging = useRef(false);
	const lastMousePos = useRef({ x: 0, y: 0 });
	
	// 3D background stars twinkle phase representation
	const starsRef = useRef<{ x: number; y: number; z: number; size: number; color: string; phase: number }[]>([]);

	// Initialize the dense 3D starfield spherical grid
	useEffect(() => {
		if (starsRef.current.length === 0) {
			const arr = [];
			for (let i = 0; i < 180; i++) {
				const theta = Math.random() * Math.PI * 2;
				const phi = Math.acos(Math.random() * 2 - 1);
				const r = 400 + Math.random() * 600; // far boundary
				arr.push({
					x: r * Math.sin(phi) * Math.cos(theta),
					y: r * Math.sin(phi) * Math.sin(theta),
					z: r * Math.cos(phi),
					size: 0.8 + Math.random() * 1.8,
					color: Math.random() > 0.82 ? "#cbd5e1" : Math.random() > 0.92 ? "#fef08a" : "#fff",
					phase: Math.random() * Math.PI * 2
				});
			}
			starsRef.current = arr;
		}
	}, []);

	// High fidelity 3D Canvas Rendering Loop
	useEffect(() => {
		if (!isOpen || !canvasRef.current) return;

		let animId: number;
		let localTime = 0;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		if (!ctx) return;

		// Handle high-dpi context scale
		const resizeCanvas = () => {
			if (!canvas || !containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			canvas.style.width = `${rect.width}px`;
			canvas.style.height = `${rect.height}px`;
			ctx.scale(dpr, dpr);
		};

		resizeCanvas();
		const observer = new ResizeObserver(() => resizeCanvas());
		if (containerRef.current) observer.observe(containerRef.current);

		// Animation frame loops
		let lastFrameTime = performance.now();

		const frame = (time: number) => {
			const delta = (time - lastFrameTime) * 0.001;
			lastFrameTime = time;

			if (isAnimating) {
				localTime += delta * speedMultiplier;
			}

			// slow cinematic auto-orbit rotation
			if (autoOrbit) {
				setYaw((y) => y + delta * 0.04);
			}

			const W = canvas.width / (window.devicePixelRatio || 1);
			const H = canvas.height / (window.devicePixelRatio || 1);
			const centerX = W / 2;
			const centerY = H / 2;

			// Clear space backdrop with deep space dust gradients
			ctx.fillStyle = "#02020a";
			ctx.fillRect(0, 0, W, H);

			// Render soft glowing deep space nebula in the center
			const nebulaGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, Math.max(W, H) * 0.55);
			nebulaGrad.addColorStop(0, "rgba(23, 23, 56, 0.4)");
			nebulaGrad.addColorStop(0.4, "rgba(10, 10, 30, 0.2)");
			nebulaGrad.addColorStop(0.7, "rgba(5, 5, 12, 0.1)");
			nebulaGrad.addColorStop(1, "rgba(0, 0, 3, 0)");
			ctx.fillStyle = nebulaGrad;
			ctx.fillRect(0, 0, W, H);

			// Draw guidelines
			ctx.font = "bold 9px sans-serif";
			ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
			ctx.fillText("মাউস দিয়ে ড্রাগ করে ৩D প্লে ড্র্যাগ ও জুম করুন", 15, H - 15);

			// 3D Camera Focus Coordinates Definition
			// When focused on a planet, we offset everyone else relative to its positions!
			let focusX3d = 0;
			let focusY3d = 0;
			let focusZ3d = 0;

			// Find physical position of the active body
			if (focusOnActive && activeBody) {
				if (activeBody.id === "sun") {
					focusX3d = 0;
					focusY3d = 0;
					focusZ3d = 0;
				} else {
					const pAngle = localTime * (activeBody.speed * 0.15);
					if (activeBody.type === "moon" || activeBody.type === "satellite") {
						// Relative to Earth
						const earthAngle = localTime * 0.15;
						const ex = 110 * Math.cos(earthAngle);
						const ez = 110 * Math.sin(earthAngle);
						const mAngle = localTime * (activeBody.speed * 0.15);
						focusX3d = ex + activeBody.orbitRadius * Math.cos(mAngle);
						focusY3d = activeBody.type === "satellite" ? -2 : 2;
						focusZ3d = ez + activeBody.orbitRadius * Math.sin(mAngle);
					} else {
						focusX3d = activeBody.orbitRadius * Math.cos(pAngle);
						focusY3d = 0;
						focusZ3d = activeBody.orbitRadius * Math.sin(pAngle);
					}
				}
			}

			// Transform 3D coords with camera Pitch, Yaw and Perspective Projection
			const fov = 400;
			const cameraDistance = 500;

			const project = (x: number, y: number, z: number) => {
				// Offset to focus on targeted body
				const rx = x - focusX3d;
				const ry = y - focusY3d;
				const rz = z - focusZ3d;

				// 1. Yaw rotation (look horizontal around Y axis)
				const x1 = rx * Math.cos(yaw) - rz * Math.sin(yaw);
				const z1 = rx * Math.sin(yaw) + rz * Math.cos(yaw);
				const y1 = ry;

				// 2. Pitch rotation (look vertical around X axis)
				const x2 = x1;
				const y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch);
				const z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);

				// 3. Perspective projection
				// Avoid dividing by zero if z exceeds bounds
				const distFactor = cameraDistance + z2;
				const scale = fov / (distFactor <= 50 ? 50 : distFactor);

				// Zoom modifies coordinates
				const screenX = centerX + x2 * scale * zoom;
				const screenY = centerY + y2 * scale * zoom;

				return {
					sx: screenX,
					sy: screenY,
					scale: scale * zoom,
					depth: z2, // keep transformed Z as renderable depth (larger is deeper in screen)
					visible: distFactor > 10
				};
			};

			// Build depth sorted render pipeline list
			// Each item has a depth, and a draw callback.
			interface Renderable {
				depth: number;
				draw: () => void;
			}
			const renderables: Renderable[] = [];

			// A. BACKGROUND STARS RENDERING (drawn furthest behind)
			starsRef.current.forEach((star) => {
				const projected = project(star.x, star.y, star.z);
				if (!projected.visible) return;

				renderables.push({
					depth: projected.depth + 10000, // force stars back
					draw: () => {
						const twinkle = 0.4 + 0.6 * Math.sin(localTime * 2 + star.phase);
						ctx.fillStyle = star.color;
						ctx.globalAlpha = twinkle;
						
						ctx.beginPath();
						ctx.arc(projected.sx, projected.sy, star.size, 0, Math.PI * 2);
						ctx.fill();
						ctx.globalAlpha = 1.0;
					}
				});
			});

			// B. GLOWING ORBITAL PATHS (Holographic Lines)
			CELESTIAL_DATA.forEach((body) => {
				if (body.id === "sun") return;

				// Moons orbit and geostationary satellites orbit Earth
				if (body.type === "moon" || body.type === "satellite") {
					// We render their orbit path locally around rotating Earth
					const earthAngle = localTime * 0.15;
					const ex = 110 * Math.cos(earthAngle);
					const ey = 0;
					const ez = 110 * Math.sin(earthAngle);

					const numPoints = 64;
					const isFocusedEarth = activeBody?.id === "earth" || activeBody?.id === body.id;

					for (let i = 0; i < numPoints; i++) {
						const theta1 = (i / numPoints) * Math.PI * 2;
						const theta2 = ((i + 1) / numPoints) * Math.PI * 2;

						const pathHeight = body.type === "satellite" ? -2 : 2;
						const x3d_1 = ex + body.orbitRadius * Math.cos(theta1);
						const y3d_1 = pathHeight;
						const z3d_1 = ez + body.orbitRadius * Math.sin(theta1);

						const x3d_2 = ex + body.orbitRadius * Math.cos(theta2);
						const y3d_2 = pathHeight;
						const z3d_2 = ez + body.orbitRadius * Math.sin(theta2);

						const p1 = project(x3d_1, y3d_1, z3d_1);
						const p2 = project(x3d_2, y3d_2, z3d_2);

						if (!p1.visible || !p2.visible) continue;

						const avgDepth = (p1.depth + p2.depth) / 2;

						renderables.push({
							depth: avgDepth,
							draw: () => {
								ctx.strokeStyle = body.type === "satellite" ? "rgba(244, 63, 94, 0.4)" : "rgba(255, 255, 255, 0.12)";
								ctx.lineWidth = isFocusedEarth ? 0.8 : 0.4;
								ctx.beginPath();
								ctx.moveTo(p1.sx, p1.sy);
								ctx.lineTo(p2.sx, p2.sy);
								ctx.stroke();
							}
						});
					}
					return;
				}

				// Planets paths around the glowing Sun
				const numSegments = 90;
				const isActiveOrbit = activeBody?.id === body.id;

				for (let i = 0; i < numSegments; i++) {
					const angle1 = (i / numSegments) * Math.PI * 2;
					const angle2 = ((i + 1) / numSegments) * Math.PI * 2;

					const x1 = body.orbitRadius * Math.cos(angle1);
					const z1 = body.orbitRadius * Math.sin(angle1);

					const x2 = body.orbitRadius * Math.cos(angle2);
					const z2 = body.orbitRadius * Math.sin(angle2);

					const p1 = project(x1, 0, z1);
					const p2 = project(x2, 0, z2);

					if (!p1.visible || !p2.visible) continue;

					const avgDepth = (p1.depth + p2.depth) / 2;

					renderables.push({
						depth: avgDepth,
						draw: () => {
							ctx.strokeStyle = isActiveOrbit 
								? "rgba(168, 85, 247, 0.65)" 
								: "rgba(255, 255, 255, 0.055)";
							ctx.lineWidth = isActiveOrbit ? 1.5 : 0.8;
							ctx.beginPath();
							ctx.moveTo(p1.sx, p1.sy);
							ctx.lineTo(p2.sx, p2.sy);
							ctx.stroke();

							// Highlight starting focal lines
							if (isActiveOrbit && i % 15 === 0) {
								ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
								ctx.beginPath();
								ctx.arc(p1.sx, p1.sy, 1.5, 0, Math.PI * 2);
								ctx.fill();
							}
						}
					});
				}
			});

			// C. PHYSICAL CELESTIAL BODIES (Planets, Sun, Moons, Satellites)
			// Compute 3D physics coords for each body first
			const coordsMap = new Map<string, { x: number; y: number; z: number }>();
			coordsMap.set("sun", { x: 0, y: 0, z: 0 });

			// Compute Planet positions
			CELESTIAL_DATA.forEach((b) => {
				if (b.id === "sun") return;
				if (b.type === "planet") {
					const angle = localTime * (b.speed * 0.15);
					coordsMap.set(b.id, {
						x: b.orbitRadius * Math.cos(angle),
						y: 0,
						z: b.orbitRadius * Math.sin(angle)
					});
				}
			});

			// Compute Moon and Geostationary satellite positions linked to Earth
			const earthCoord = coordsMap.get("earth");
			if (earthCoord) {
				const moonObj = CELESTIAL_DATA.find((b) => b.id === "moon");
				if (moonObj) {
					const mAngle = localTime * (moonObj.speed * 0.15);
					coordsMap.set("moon", {
						x: earthCoord.x + moonObj.orbitRadius * Math.cos(mAngle),
						y: 2, // slight orbital plane shift
						z: earthCoord.z + moonObj.orbitRadius * Math.sin(mAngle)
					});
				}

				const satObj = CELESTIAL_DATA.find((b) => b.id === "bangabandhu_sat");
				if (satObj) {
					const sAngle = localTime * (satObj.speed * 0.15);
					coordsMap.set("bangabandhu_sat", {
						x: earthCoord.x + satObj.orbitRadius * Math.cos(sAngle),
						y: -2, // under
						z: earthCoord.z + satObj.orbitRadius * Math.sin(sAngle)
					});
				}
			}

			// Add rendering details for each populated body
			CELESTIAL_DATA.forEach((body) => {
				const coord = coordsMap.get(body.id);
				if (!coord) return;

				const projected = project(coord.x, coord.y, coord.z);
				if (!projected.visible) return;

				const projRadius = body.radius * projected.scale * 0.05;
				const screenRadius = projRadius < 1 ? 1 : projRadius; // guard minimal size

				// Store projected values to detect user clicks on canvas
				(body as any)._lastScreenX = projected.sx;
				(body as any)._lastScreenY = projected.sy;
				(body as any)._lastScreenRadius = screenRadius;

				const isCurrentFocus = activeBody?.id === body.id;

				renderables.push({
					depth: projected.depth,
					draw: () => {
						// Render target orbital highlight rings
						if (isCurrentFocus) {
							ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
							ctx.lineWidth = 1;
							ctx.setLineDash([3, 3]);
							ctx.beginPath();
							ctx.arc(projected.sx, projected.sy, screenRadius + 12 + 4 * Math.sin(time / 200), 0, Math.PI * 2);
							ctx.stroke();
							ctx.setLineDash([]);
						}

						// Draw Sun separate with bright dynamic flares
						if (body.type === "star") {
							// Multi-layered glowing corona
							const sunGlow = ctx.createRadialGradient(
								projected.sx, projected.sy, screenRadius * 0.2,
								projected.sx, projected.sy, screenRadius * 2.5
							);
							sunGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
							sunGlow.addColorStop(0.15, "rgba(251, 191, 36, 0.95)");
							sunGlow.addColorStop(0.45, "rgba(249, 115, 22, 0.5)");
							sunGlow.addColorStop(0.8, "rgba(239, 68, 68, 0.1)");
							sunGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

							ctx.fillStyle = sunGlow;
							ctx.beginPath();
							ctx.arc(projected.sx, projected.sy, screenRadius * 2.5, 0, Math.PI * 2);
							ctx.fill();

							// Solar core
							ctx.fillStyle = "#ffffff";
							ctx.beginPath();
							ctx.arc(projected.sx, projected.sy, screenRadius, 0, Math.PI * 2);
							ctx.fill();
							return;
						}

						// 3D SPHERE SHADING & SURFACE TEXTURES USING CANVAS COMPOSITING
						ctx.save();
						ctx.beginPath();
						ctx.arc(projected.sx, projected.sy, screenRadius, 0, Math.PI * 2);
						ctx.clip(); // Restrict surface drawing inside planet sphere circle

						// Draw base ambient colors
						const gradBase = ctx.createRadialGradient(
							projected.sx, projected.sy, 1,
							projected.sx, projected.sy, screenRadius
						);

						if (body.id === "earth") {
							// Realistic ocean-blue
							ctx.fillStyle = "#1d4ed8";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);

							// Draw continental land shapes
							ctx.fillStyle = "#15803d";
							ctx.beginPath();
							// Move slightly based on orbit for planet micro-rotation
							const spinAngle = localTime * 0.8;
							const dx = Math.sin(spinAngle) * screenRadius * 0.4;
							
							ctx.arc(projected.sx + dx - screenRadius*0.2, projected.sy, screenRadius * 0.6, 0, Math.PI * 2);
							ctx.arc(projected.sx + dx + screenRadius*0.6, projected.sy + screenRadius*0.3, screenRadius * 0.4, 0, Math.PI * 2);
							ctx.fill();

							ctx.fillStyle = "#854d0e"; // desert/rock
							ctx.beginPath();
							ctx.arc(projected.sx + dx - screenRadius*0.5, projected.sy + screenRadius*0.2, screenRadius * 0.3, 0, Math.PI * 2);
							ctx.fill();

							// Atmosphere cloud deck
							ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
							const cloudOffset = Math.sin(localTime * 0.9) * screenRadius * 0.6;
							ctx.beginPath();
							ctx.arc(projected.sx + cloudOffset, projected.sy - screenRadius*0.1, screenRadius * 0.35, 0, Math.PI * 2);
							ctx.arc(projected.sx - cloudOffset + screenRadius*0.5, projected.sy + screenRadius*0.2, screenRadius * 0.4, 0, Math.PI * 2);
							ctx.fill();

						} else if (body.id === "jupiter") {
							// Orange atmospheric stripes
							ctx.fillStyle = "#ea580c";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);

							// Draw Cream stripes
							ctx.fillStyle = "#fed7aa";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius * 0.5, screenRadius * 2, screenRadius * 0.2);
							ctx.fillRect(projected.sx - screenRadius, projected.sy + screenRadius * 0.2, screenRadius * 2, screenRadius * 0.15);
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius * 0.1, screenRadius * 2, screenRadius * 0.1);

							// Great Red Spot storm
							ctx.fillStyle = "#9a3412";
							const grsX = projected.sx + Math.sin(localTime * 0.4) * screenRadius * 0.5;
							ctx.beginPath();
							ctx.ellipse(grsX, projected.sy + screenRadius * 0.4, screenRadius * 0.28, screenRadius * 0.15, 0, 0, Math.PI * 2);
							ctx.fill();

						} else if (body.id === "saturn") {
							// Beige golden body
							ctx.fillStyle = "#fef08a";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);

							ctx.fillStyle = "#b45309"; // stripes
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius * 0.3, screenRadius * 2, screenRadius * 0.15);
							ctx.fillRect(projected.sx - screenRadius, projected.sy + screenRadius * 0.15, screenRadius * 2, screenRadius * 0.1);

						} else if (body.id === "mars") {
							// Red-orange dusty sphere
							ctx.fillStyle = "#dc2626";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);

							ctx.fillStyle = "#7f1d1d"; // iron crust craters
							ctx.beginPath();
							ctx.arc(projected.sx - screenRadius*0.3, projected.sy + screenRadius*0.2, screenRadius * 0.25, 0, Math.PI * 2);
							ctx.arc(projected.sx + screenRadius*0.4, projected.sy - screenRadius*0.3, screenRadius * 0.3, 0, Math.PI * 2);
							ctx.fill();

							// Polarcaps!
							ctx.fillStyle = "#ffffff";
							ctx.beginPath();
							ctx.ellipse(projected.sx, projected.sy - screenRadius * 0.9, screenRadius * 0.4, screenRadius * 0.15, 0, 0, Math.PI * 2);
							ctx.fill();

						} else if (body.id === "venus") {
							// Cream orange swirly hell
							ctx.fillStyle = "#d97706";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);

							ctx.fillStyle = "#fef3c7";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius * 0.6, screenRadius * 2, screenRadius * 0.3);
							ctx.fillRect(projected.sx - screenRadius, projected.sy + screenRadius * 0.3, screenRadius * 2, screenRadius * 0.2);

						} else if (body.id === "mercury" || body.id === "moon") {
							// Cratered dead moon rock
							ctx.fillStyle = "#64748b";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);

							ctx.fillStyle = "#334155";
							ctx.beginPath();
							ctx.arc(projected.sx - screenRadius*0.4, projected.sy - screenRadius*0.2, screenRadius * 0.22, 0, Math.PI * 2);
							ctx.arc(projected.sx + screenRadius*0.3, projected.sy + screenRadius*0.4, screenRadius * 0.18, 0, Math.PI * 2);
							ctx.arc(projected.sx + screenRadius*0.1, projected.sy - screenRadius*0.5, screenRadius * 0.15, 0, Math.PI * 2);
							ctx.fill();

						} else if (body.id === "bangabandhu_sat") {
							// Cyan satellite solar wings
							ctx.fillStyle = "#0c4a6e";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);
							ctx.fillStyle = "#0f172a";
							ctx.stroke();

						} else {
							// Pastel cyan/blue gas giants (Uranus, Neptune)
							ctx.fillStyle = body.id === "neptune" ? "#2563eb" : "#22d3ee";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);

							// cloud streaks
							ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius * 0.2, screenRadius * 2, screenRadius * 0.15);
						}

						// 3D SPHERICAL SHADING GRADIENT - LAMBERT LIGHT MODEL OVERLAY
						// The Sun is the light source at center (0,0,0). We shade from the light direction vector!
						// Calculate lighting vector angle in 2D Screen space
						const sunProjected = project(0, 0, 0);
						const lightDx = sunProjected.sx - projected.sx;
						const lightDy = sunProjected.sy - projected.sy;
						const lightDist = Math.sqrt(lightDx * lightDx + lightDy * lightDy);

						// Shift radial highlight center slightly toward the Sun direction
						const lightOffsetRatio = 0.35;
						const hx = projected.sx + (lightDist > 0 ? (lightDx / lightDist) : 0) * screenRadius * lightOffsetRatio;
						const hy = projected.sy + (lightDist > 0 ? (lightDy / lightDist) : 0) * screenRadius * lightOffsetRatio;

						const litOver = ctx.createRadialGradient(
							hx, hy, screenRadius * 0.15,
							projected.sx, projected.sy, screenRadius * 1.1
						);
						litOver.addColorStop(0, "rgba(255, 255, 255, 0.45)"); // Specular shine facing Sun
						litOver.addColorStop(0.3, "rgba(0, 0, 0, 0)");       // Diffuse lit color
						litOver.addColorStop(0.95, "rgba(0, 0, 0, 0.85)");   // Dark unlit crescent
						litOver.addColorStop(1, "rgba(0, 0, 0, 0.98)");      // Direct night side pitch-black

						ctx.fillStyle = litOver;
						ctx.fillRect(projected.sx - screenRadius * 1.1, projected.sy - screenRadius * 1.1, screenRadius * 2.2, screenRadius * 2.2);

						// Atmosphere rim glow
						const atmosphereGlow = ctx.createRadialGradient(
							projected.sx, projected.sy, screenRadius * 0.9,
							projected.sx, projected.sy, screenRadius * 1.05
						);
						if (body.id === "earth") {
							atmosphereGlow.addColorStop(0, "rgba(59, 130, 246, 0.0)");
							atmosphereGlow.addColorStop(1, "rgba(59, 130, 246, 0.55)");
							ctx.fillStyle = atmosphereGlow;
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);
						} else if (body.id === "venus") {
							atmosphereGlow.addColorStop(0, "rgba(245, 158, 11, 0.0)");
							atmosphereGlow.addColorStop(1, "rgba(245, 158, 11, 0.4)");
							ctx.fillStyle = atmosphereGlow;
							ctx.fillRect(projected.sx - screenRadius, projected.sy - screenRadius, screenRadius * 2, screenRadius * 2);
						}

						ctx.restore();

						// Labels next to body
						ctx.font = "bold 10px sans-serif";
						ctx.fillStyle = isCurrentFocus ? "#c084fc" : "#94a3b8";
						ctx.fillText(body.nameBengali, projected.sx + screenRadius + 4, projected.sy + 3);
					}
				});

				// D. SATURN'S RING SPLITTING DEPTH INTERPOLATION
				// Satisfies rings going behind Saturn body and crossing in front!
				if (body.id === "saturn") {
					const saturnPos = { x: coord.x, y: coord.y, z: coord.z };
					const numSegments = 64;
					const innerR_3d = body.radius * 1.5;
					const outerR_3d = body.radius * 2.55;

					for (let i = 0; i < numSegments; i++) {
						const theta1 = (i / numSegments) * Math.PI * 2;
						const theta2 = ((i + 1) / numSegments) * Math.PI * 2;

						// Local ring slice corner coords
						const lx1_in = innerR_3d * Math.cos(theta1);
						const lz1_in = innerR_3d * Math.sin(theta1);

						const lx2_in = innerR_3d * Math.cos(theta2);
						const lz2_in = innerR_3d * Math.sin(theta2);

						const lx1_out = outerR_3d * Math.cos(theta1);
						const lz1_out = outerR_3d * Math.sin(theta1);

						const lx2_out = outerR_3d * Math.cos(theta2);
						const lz2_out = outerR_3d * Math.sin(theta2);

						// Absolute 3D space corners
						const p1_in = project(saturnPos.x + lx1_in, 0, saturnPos.z + lz1_in);
						const p2_in = project(saturnPos.x + lx2_in, 0, saturnPos.z + lz2_in);
						const p1_out = project(saturnPos.x + lx1_out, 0, saturnPos.z + lz1_out);
						const p2_out = project(saturnPos.x + lx2_out, 0, saturnPos.z + lz2_out);

						if (!p1_in.visible || !p2_out.visible) return;

						const ringSegDepth = (p1_in.depth + p2_out.depth) / 2;

						renderables.push({
							depth: ringSegDepth,
							draw: () => {
								ctx.fillStyle = "rgba(180, 150, 110, 0.45)"; // Golden dusty ice rings
								ctx.strokeStyle = "rgba(220, 200, 160, 0.65)";
								ctx.lineWidth = 0.5;

								ctx.beginPath();
								ctx.moveTo(p1_out.sx, p1_out.sy);
								ctx.lineTo(p2_out.sx, p2_out.sy);
								ctx.lineTo(p2_in.sx, p2_in.sy);
								ctx.lineTo(p1_in.sx, p1_in.sy);
								ctx.closePath();
								ctx.fill();
								ctx.stroke();

								// concentric dust bands detail inside rings
								if (i % 3 === 0) {
									ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
									ctx.beginPath();
									ctx.moveTo(p1_out.sx, p1_out.sy);
									ctx.lineTo(p2_out.sx, p2_out.sy);
									ctx.stroke();
								}
							}
						});
					}
				}
			});

			// E. SEAMLESS PAINTER'S ALGORITHM ORDER EXECUTION
			// Sort our queue by depth descending (furthest drawn first, closest painted on top)
			renderables.sort((a, b) => b.depth - a.depth);
			renderables.forEach((r) => r.draw());

			animId = requestAnimationFrame(frame);
		};

		animId = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(animId);
			observer.disconnect();
		};
	}, [isOpen, isAnimating, speedMultiplier, activeBody, yaw, pitch, zoom, autoOrbit, focusOnActive]);

	if (!isOpen) return null;

	// Interactive canvas click target selector using raycasting distance
	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (isDragging.current) return; // ignore clicks during active moves

		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Find clicked body
		let closestBody: CelestialBody | null = null;
		let minDistance = Infinity;

		CELESTIAL_DATA.forEach((body) => {
			const sx = (body as any)._lastScreenX;
			const sy = (body as any)._lastScreenY;
			const radius = (body as any)._lastScreenRadius;

			if (sx === undefined || sy === undefined) return;

			const dx = mouseX - sx;
			const dy = mouseY - sy;
			const dist = Math.sqrt(dx * dx + dy * dy);

			// Tap target padding = 15px extension for easier select
			if (dist <= radius + 15 && dist < minDistance) {
				closestBody = body;
				minDistance = dist;
			}
		});

		if (closestBody) {
			setActiveBody(closestBody);
		}
	};

	// Drag mouse parameters to rotate horizontal/vertical pitch and yaw of space camera
	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		isDragging.current = false;
		lastMousePos.current = { x: e.clientX, y: e.clientY };
		
		// Setup mousemove/up global binding
		const handleGlobalMouseMove = (moveEv: MouseEvent) => {
			const dx = moveEv.clientX - lastMousePos.current.x;
			const dy = moveEv.clientY - lastMousePos.current.y;

			// Mark travel as active drag
			if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
				isDragging.current = true;
				setAutoOrbit(false); // suspend slow continuous pan
			}

			// pitch ranges -PI/2 (looking down from north pole) to PI/2 (from south pole)
			setYaw((prev) => prev - dx * 0.007);
			setPitch((prev) => Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev - dy * 0.007)));

			lastMousePos.current = { x: moveEv.clientX, y: moveEv.clientY };
		};

		const handleGlobalMouseUp = () => {
			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("mouseup", handleGlobalMouseUp);
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		window.addEventListener("mouseup", handleGlobalMouseUp);
	};

	// Scrolling slider zoom handler
	const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
		// zoom scale stays bounded securely
		setZoom((prev) => Math.max(0.2, Math.min(4.0, prev - e.deltaY * 0.00085)));
	};

	return (
		<div className="fixed inset-0 bg-[#010103] z-[120] text-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
			{/* Stars and Galaxy vector assets */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950/20 to-black pointer-events-none z-0" />

			{/* Left Canvas view */}
			<div className="w-full md:w-3/5 h-[50vh] md:h-full relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 p-4 z-10 select-none">
				
				{/* Top Panel Brand */}
				<div className="flex justify-between items-center relative z-20 w-full mb-1">
					<div>
						<h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-1.5">
							<Orbit className="text-amber-500 animate-spin" style={{ animationDuration: '40s' }} size={20} />
							৩D রিয়েলিস্টিক সৌরজগৎ গাইড
						</h1>
						<p className="text-[10px] md:text-2xs text-gray-400 font-semibold mt-0.5 tracking-wider uppercase">
							প্রকৃত থ্রি-ডি অরবিটাল ক্যামেরা, কক্ষপথ ঘূর্ণন এবং গ্রহের অবস্থান মডেল
						</p>
					</div>

					<button
						onClick={onClose}
						className="bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-white p-1.5 rounded-xl transition-all duration-300"
						title="স্পেস উইন্ডো বন্ধ করুন"
						id="close-solar-3d"
					>
						<X size={16} />
					</button>
				</div>

				{/* 3D RENDER CANVAS FRAME */}
				<div 
					ref={containerRef} 
					className="flex-1 w-full relative flex items-center justify-center overflow-hidden my-1 bg-black/40 rounded-3xl border border-white/5 cursor-grab active:cursor-grabbing shadow-inner"
				>
					<canvas
						ref={canvasRef}
						onMouseDown={handleMouseDown}
						onWheel={handleWheel}
						onClick={handleCanvasClick}
						className="w-full h-full block"
						id="solar-system-3d-canvas"
					/>

					{/* Orbit camera overlays indicators */}
					<div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none text-[10px] font-mono text-gray-400 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 z-20">
						<div className="font-bold text-amber-400 text-2xs uppercase mb-1 flex items-center gap-1">
							<Globe size={10} /> ৩ডি ক্যামেরা প্যারামিটার
						</div>
						<div>প্যান কোণ (Yaw): {((yaw * 180) / Math.PI).toFixed(0)}°</div>
						<div>উচ্চতা কোণ (Pitch): {((pitch * 180) / Math.PI).toFixed(0)}°</div>
						<div>জুম লেভেল: {(zoom * 100).toFixed(0)}%</div>
					</div>

					{/* Focus system visual notifier overlay */}
					{autoOrbit && (
						<div className="absolute top-3 right-3 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2.5 py-1 rounded-lg text-2xs font-extrabold flex items-center gap-1 animate-pulse">
							<RotateCw size={11} className="animate-spin" /> অটো-ঘূর্ণন চালু
						</div>
					)}
				</div>

				{/* Interactive 3D Controller Board */}
				<div className="bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-wrap gap-2.5 items-center justify-between relative z-20 mb-1 shadow-2xl">
					
					{/* Pitch, Yaw, Auto Rotate controls */}
					<div className="flex items-center gap-2">
						{/* Play and pausing of physical orbits */}
						<button
							onClick={() => setIsAnimating(!isAnimating)}
							className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-gray-200 text-xs flex items-center gap-1"
							title={isAnimating ? "গ্রহ আবর্তন থামান" : "গ্রহ আবর্তন পুনরায় শুরু করুন"}
						>
							{isAnimating ? <Pause size={13} /> : <Play size={13} />}
							<span className="text-2xs font-bold hidden sm:inline">{isAnimating ? "পজ" : "চালু"}</span>
						</button>

						{/* Reset alignment */}
						<button
							onClick={() => {
								setYaw(-Math.PI / 4);
								setPitch(Math.PI / 6);
								setZoom(1);
							}}
							className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-gray-200 font-bold text-2xs flex items-center gap-1"
							title="ক্যামেরার অবস্থান পুনরুদ্ধার করুন"
						>
							<RotateCcw size={12} />
							<span className="hidden sm:inline">রিসেট ক্যাম</span>
						</button>

						{/* Auto Orbit Toggle */}
						<button
							onClick={() => setAutoOrbit(!autoOrbit)}
							className={`p-1.5 rounded-lg border text-2xs font-black flex items-center gap-1 transition-all ${
								autoOrbit 
									? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md" 
									: "bg-white/5 border-white/10 text-gray-400 hover:text-white"
							}`}
							title="অটো-ক্যামেরা ঘূর্ণন"
						>
							<RotateCw size={11} className={autoOrbit ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
							<span>অটো-ক্যামেরাজগৎ</span>
						</button>

						{/* Camera Focus lock on Chosen Planet */}
						<button
							onClick={() => setFocusOnActive(!focusOnActive)}
							className={`p-1.5 rounded-lg border text-2xs font-black flex items-center gap-1 transition-all ${
								focusOnActive 
									? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-md" 
									: "bg-white/5 border-white/10 text-gray-400 hover:text-white"
							}`}
							title="নির্বাচিত গ্রহকে ক্যামেরার কেন্দ্রবিন্দু করুন"
						>
							<Eye size={12} />
							<span>গ্রহ লক: {focusOnActive ? "অন" : "অফ"}</span>
						</button>
					</div>

					{/* Zoom slider directly */}
					<div className="flex items-center gap-1.5 text-xs">
						<span className="text-gray-400 font-bold font-mono">জুম:</span>
						<input 
							type="range" 
							min="0.3" 
							max="3.0" 
							step="0.05"
							value={zoom} 
							onChange={(e) => setZoom(parseFloat(e.target.value))}
							className="w-20 md:w-28 accent-amber-500 h-1 bg-white/10 rounded-lg cursor-pointer"
						/>
					</div>

					{/* Orbits Speed controller */}
					<div className="flex items-center gap-1 bg-black/50 border border-white/5 p-1 rounded-xl">
						<span className="text-2xs text-gray-500 font-bold px-1 uppercase">গতি:</span>
						{[
							{ v: 0.1, label: "0.1x" },
							{ v: 1, label: "1x" },
							{ v: 4, label: "4x" },
							{ v: 12, label: "12x" }
						].map((item) => (
							<button
								key={item.label}
								onClick={() => setSpeedMultiplier(item.v)}
								className={`text-2xs font-extrabold px-1.5 py-0.5 rounded-md transition-colors ${
									speedMultiplier === item.v 
										? "bg-amber-500 text-black font-black" 
										: "text-gray-400 hover:text-white hover:bg-white/5"
								}`}
							>
								{item.label}
							</button>
						))}
					</div>
				</div>

			</div>

			{/* Informative Right Data panel */}
			<div className="w-full md:w-2/5 h-[50vh] md:h-full bg-slate-950/40 relative z-10 flex flex-col overflow-y-auto border-t md:border-t-0 border-white/10">
				
				{/* Right Navigation tabs */}
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
					<div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
						{activeBody ? (
							<div className="flex-1 flex flex-col justify-between">
								<div>
									{/* Interactive Selected Body Title */}
									<div className="flex items-start justify-between gap-4 mb-4">
										<div>
											<span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
												{bodyTypeLabel(activeBody.type)}
											</span>
											<h2 className="text-3xl font-black text-white mt-1 border-b-2 border-white/5 pb-1 flex items-baseline gap-2">
												{activeBody.nameBengali}
												<span className="text-sm font-medium text-gray-400 font-mono">
													({activeBody.nameEnglish})
												</span>
											</h2>
										</div>

										{/* Planet Colored Render circle node */}
										<div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${activeBody.color} flex items-center justify-center shadow-lg transform shrink-0 hover:rotate-45 transition-all duration-500 ring-2 ring-purple-500/20`} />
									</div>

									{/* Key Stats Grid */}
									<div className="grid grid-cols-2 gap-3 mb-5 font-mono text-xs">
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">গড় কক্ষপথ দূরত্ব</span>
											<strong className="text-white text-xs block">{activeBody.distanceFromSun}</strong>
										</div>
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">কক্ষপথ আবর্তন কাল</span>
											<strong className="text-white text-xs block">{activeBody.orbitalPeriod}</strong>
										</div>
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">ব্যাস (Diameter)</span>
											<strong className="text-white text-xs block">{activeBody.diameter}</strong>
										</div>
										<div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
											<span className="text-gray-400 block text-[10px] uppercase font-bold text-gray-500 mb-0.5">গড় পৃষ্ঠ তাপমাত্রা</span>
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
											<Info size={14} className="text-amber-500" /> বিশেষ বৈজ্ঞানিক তথ্য ও সত্যতা
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

								{/* Playful alert recommending focusing */}
								<div className="mt-4 p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/25 text-2xs text-purple-200 flex items-center gap-1.5">
									<Eye size={12} className="text-purple-400 shrink-0" />
									<span>তালিকায় অন্য গ্রহে ট্যাপ করুন অথবা ৩D ম্যাপে ক্লিক করে এক্সপ্লোর করুন! ওপরের <strong>'গ্রহ লক'</strong> বাটন চেপে জুম ফোকাস করতে পারেন।</span>
								</div>

								{/* Side selection navigation map */}
								<div className="pt-4 border-t border-white/5 mt-4">
									<span className="block text-2xs uppercase text-gray-500 font-bold mb-2">গাইড বুক সূচি</span>
									<div className="flex flex-wrap gap-1.5">
										{CELESTIAL_DATA.map((item) => (
											<button
												key={`tabBtn-${item.id}`}
												onClick={() => {
													setActiveBody(item);
												}}
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
								পৃথিবীর কক্ষপথে আবর্তনশীল উল্লেখযোগ্য কৃতী স্পেসক্রাফট এবং স্যাটেলাইটসমূহের প্রকৃত বর্ণনা:
							</p>

							{/* Satellite blocks */}
							<div className="space-y-4">
								{MAN_MADE_SATELLITES.map((sat, i) => {
									const isSatFocused = (sat.name.includes("বঙ্গবন্ধু") && activeBody?.id === "bangabandhu_sat") || 
														 (sat.name.includes("মহাকাশ স্টেশন") && activeBody?.id === "moon"); // demo bind
									
									return (
										<div 
											key={sat.name}
											onClick={() => {
												if (sat.name.includes("বঙ্গবন্ধু")) {
													const bsat = CELESTIAL_DATA.find(b => b.id === "bangabandhu_sat");
													if (bsat) {
														setActiveBody(bsat);
														setFocusOnActive(true);
													}
												} else {
													const earth = CELESTIAL_DATA.find(b => b.id === "earth");
													if (earth) {
														setActiveBody(earth);
														setFocusOnActive(true);
													}
												}
											}}
											className={`cursor-pointer border rounded-2xl p-4 transition-all duration-300 relative group overflow-hidden ${
												isSatFocused 
													? "bg-rose-500/10 border-rose-500/40" 
													: "bg-white/5 border-white/10 hover:border-rose-400/30"
											}`}
										>
											<div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
											
											<div className="flex items-center gap-2 mb-2">
												<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 animate-pulse">
													কক্ষপথ ট্র্যাকার {i+1}
												</span>
												<span className="text-xs font-mono text-gray-500">উৎক্ষেপণ: {sat.launchDate}</span>
											</div>

											<h4 className="text-sm font-black text-white hover:text-rose-300 transition-colors flex items-center gap-1">
												{sat.name}
												{isSatFocused && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />}
											</h4>

											<div className="mt-3 space-y-1 text-xs text-gray-300 font-medium">
												<p><span className="text-gray-500">অবস্থান ও উচ্চতা:</span> <span className="font-mono text-xs text-rose-300">{sat.position} ({sat.altitude})</span></p>
												<p className="leading-relaxed mt-1 text-gray-400"><span className="text-gray-500">উদ্দেশ্য বা কাজ:</span> {sat.purpose}</p>
											</div>

											<div className="text-[10px] text-rose-400 font-bold mt-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
												৩ডি গ্লোব ভিউতে ফোকাস করতে এখানে ক্লিক করুন →
											</div>
										</div>
									);
								})}
							</div>

							{/* Extra warning panel on Satellite Communication */}
							<div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl mt-4 flex items-start gap-3">
								<ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
								<div className="text-xs text-amber-200/90 leading-relaxed font-semibold">
									<strong className="block text-amber-400 font-bold mb-0.5">বঙ্গবন্ধু স্যাটেলাইট-১ নোট:</strong>
									বঙ্গবন্ধু স্যাটেলাইট-১ রাশিয়ার স্পেস ফার্ম 'থার্লেস অ্যালেনিয়া স্পেস' থেকে নির্মিত এবং যুক্তরাষ্ট্রের স্পেসক্রাফট ফ্যালকন-৯ রকেট দিয়ে সফলভাবে ফ্লোরিডা থেকে সফলভাবে উৎক্ষেপিত ও স্থাপিত হয়।
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
									if (earthObj) {
										setActiveBody(earthObj);
										setFocusOnActive(false);
									}
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

function bodyTypeLabel(type: "star" | "planet" | "moon" | "satellite") {
	switch (type) {
		case "star": return "☀️ নক্ষত্রমণ্ডলী";
		case "planet": return "🪐 প্রধান গ্রহরাজ্য";
		case "moon": return "🌙 স্বাভাবিক উপগ্রহ";
		case "satellite": return "🛰️ কৃত্রিম যোগাযোগ উপগ্রহ";
	}
}
