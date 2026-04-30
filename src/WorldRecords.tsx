import React, { useState } from "react";

// --- ১০০টি দেশের ডেটাবেস ---
const areaLarge = [
	"রাশিয়া",
	"কানাডা",
	"চীন",
	"যুক্তরাষ্ট্র",
	"ব্রাজিল",
	"অস্ট্রেলিয়া",
	"ভারত",
	"আর্জেন্টিনা",
	"কাজাখস্তান",
	"আলজেরিয়া",
	"ডিআর কঙ্গো",
	"সৌদি আরব",
	"মেক্সিকো",
	"ইন্দোনেশিয়া",
	"সুদান",
	"লিবিয়া",
	"ইরান",
	"মঙ্গোলিয়া",
	"পেরু",
	"চাদ",
	"নাইজার",
	"অ্যাঙ্গোলা",
	"মালি",
	"দক্ষিণ আফ্রিকা",
	"কলম্বিয়া",
	"ইথিওপিয়া",
	"বলিভিয়া",
	"মৌরিতানিয়া",
	"মিশর",
	"তানজানিয়া",
	"নাইজেরিয়া",
	"ভেনেজুয়েলা",
	"নামিবিয়া",
	"মোজাম্বিক",
	"পাকিস্তান",
	"তুরস্ক",
	"চিলি",
	"জাম্বিয়া",
	"মিয়ানমার",
	"আফগানিস্তান",
	"দক্ষিণ সুদান",
	"ফ্রান্স",
	"সোমালিয়া",
	"মধ্য আফ্রিকান প্রজাতন্ত্র",
	"ইউক্রেন",
	"মাদাগাস্কার",
	"বতসোয়ানা",
	"কেনিয়া",
	"ইয়েমেন",
	"থাইল্যান্ড",
	"স্পেন",
	"তুর্কমেনিস্তান",
	"ক্যামেরুন",
	"পাপুয়া নিউ গিনি",
	"সুইডেন",
	"উজবেকিস্তান",
	"মরক্কো",
	"ইরাক",
	"প্যারাগুয়ে",
	"জিম্বাবুয়ে",
	"নরওয়ে",
	"জাপান",
	"জার্মানি",
	"প্রজাতন্ত্রী কঙ্গো",
	"ফিনল্যান্ড",
	"ভিয়েতনাম",
	"মালয়েশিয়া",
	"আইভরি কোস্ট",
	"পোল্যান্ড",
	"ওমান",
	"ইতালি",
	"ফিলিপাইন",
	"ইকুয়েডর",
	"বুরকিনা ফাসো",
	"নিউজিল্যান্ড",
	"গ্যাবন",
	"গিনি",
	"যুক্তরাজ্য",
	"উগান্ডা",
	"ঘানা",
	"রোমানিয়া",
	"লাওস",
	"গায়ানা",
	"বেলারুশ",
	"কিরগিজস্তান",
	"সেনেগাল",
	"সিরিয়া",
	"কম্বোডিয়া",
	"উরুগুয়ে",
	"সুরিনাম",
	"তিউনিসিয়া",
	"বাংলাদেশ",
	"নেপাল",
	"তাজিকিস্তান",
	"গ্রিস",
	"নিকারাগুয়া",
	"উত্তর কোরিয়া",
	"মালাউই",
	"ইরিত্রিয়া",
	"বেনিন",
];

const areaSmall = [
	"ভ্যাটিকান সিটি",
	"মোনাকো",
	"নাউরু",
	"টুভালু",
	"সান ম্যারিনো",
	"লিশটেনস্টাইন",
	"মার্শাল দ্বীপপুঞ্জ",
	"সেন্ট কিটস ও নেভিস",
	"মালদ্বীপ",
	"মাল্টা",
	"গ্রেনাডা",
	"সেন্ট ভিনসেন্ট",
	"বার্বাডোস",
	"অ্যান্টিগুয়া ও বারবুডা",
	"সেশেলস",
	"পালাউ",
	"অ্যান্ডোরা",
	"সেন্ট লুসিয়া",
	"মাইক্রোনেশিয়া",
	"সিঙ্গাপুর",
	"টোঙ্গা",
	"ডোমিনিকা",
	"বাহরাইন",
	"কিরিবাতি",
	"সাঁও টোমে ও প্রিন্সিপি",
	"সামোয়া",
	"মরিশাস",
	"কোমোরোস",
	"লুক্সেমবার্গ",
	"কেপ ভার্দে",
	"ট্রিনিদাদ ও টোবাগো",
	"ব্রুনাই",
	"সাইপ্রাস",
	"লেবানন",
	"জামাইকা",
	"গাম্বিয়া",
	"কাতার",
	"ভানুয়াতু",
	"মন্টিনিগ্রো",
	"বাহামা",
	"তিমুর-লেস্তে",
	"এসওয়াতিনি",
	"কুয়েত",
	"ফিজি",
	"স্লোভেনিয়া",
	"ইসরায়েল",
	"এল সালভাদর",
	"বেলিজ",
	"জিবুতি",
	"উত্তর মেসিডোনিয়া",
	"রুয়ান্ডা",
	"বুরুন্ডি",
	"নিরক্ষীয় গিনি",
	"আলবেনিয়া",
	"সলোমন দ্বীপপুঞ্জ",
	"আর্মেনিয়া",
	"লেসোথো",
	"বেলজিয়াম",
	"মলদোভা",
	"গিনি-বিসাউ",
	"তাইওয়ান",
	"ভুটান",
	"সুইজারল্যান্ড",
	"নেদারল্যান্ডস",
	"ডেনমার্ক",
	"এস্তোনিয়া",
	"ডমিনিকান রিপাবলিক",
	"স্লোভাকিয়া",
	"কোস্টারিকা",
	"বসনিয়া",
	"ক্রোয়েশিয়া",
	"টোগো",
	"লাটভিয়া",
	"লিথুয়ানিয়া",
	"শ্রীলঙ্কা",
	"জর্জিয়া",
	"আয়ারল্যান্ড",
	"সিয়েরা লিওন",
	"পানামা",
	"চেকিয়া",
	"সার্বিয়া",
	"সংযুক্ত আরব আমিরাত",
	"অস্ট্রিয়া",
	"আজারবাইজান",
	"পর্তুগাল",
	"জর্ডান",
	"হাঙ্গেরি",
	"দক্ষিণ কোরিয়া",
	"আইসল্যান্ড",
	"গুয়াতেমালা",
	"কিউবা",
	"বুলগেরিয়া",
	"লাইবেরিয়া",
	"হন্ডুরাস",
	"বেনিন",
	"ইরিত্রিয়া",
	"মালাউই",
	"উত্তর কোরিয়া",
	"নিকারাগুয়া",
	"গ্রিস",
];

const popHigh = [
	"ভারত",
	"চীন",
	"যুক্তরাষ্ট্র",
	"ইন্দোনেশিয়া",
	"পাকিস্তান",
	"নাইজেরিয়া",
	"ব্রাজিল",
	"বাংলাদেশ",
	"রাশিয়া",
	"মেক্সিকো",
	"ইথিওপিয়া",
	"জাপান",
	"ফিলিপাইন",
	"মিশর",
	"ডিআর কঙ্গো",
	"ভিয়েতনাম",
	"ইরান",
	"তুরস্ক",
	"জার্মানি",
	"থাইল্যান্ড",
	"যুক্তরাজ্য",
	"তানজানিয়া",
	"ফ্রান্স",
	"দক্ষিণ আফ্রিকা",
	"ইতালি",
	"কেনিয়া",
	"মিয়ানমার",
	"কলম্বিয়া",
	"দক্ষিণ কোরিয়া",
	"উগান্ডা",
	"সুদান",
	"স্পেন",
	"আর্জেন্টিনা",
	"আলজেরিয়া",
	"ইরাক",
	"আফগানিস্তান",
	"পোল্যান্ড",
	"কানাডা",
	"মরক্কো",
	"সৌদি আরব",
	"ইউক্রেন",
	"অ্যাঙ্গোলা",
	"উজবেকিস্তান",
	"ইয়েমেন",
	"পেরু",
	"মালয়েশিয়া",
	"ঘানা",
	"মোজাম্বিক",
	"নেপাল",
	"মাদাগাস্কার",
	"ভেনেজুয়েলা",
	"আইভরি কোস্ট",
	"ক্যামেরুন",
	"নাইজার",
	"অস্ট্রেলিয়া",
	"উত্তর কোরিয়া",
	"তাইওয়ান",
	"মালি",
	"বুরকিনা ফাসো",
	"সিরিয়া",
	"শ্রীলঙ্কা",
	"মালাউই",
	"জাম্বিয়া",
	"রোমানিয়া",
	"চিলি",
	"কাজাখস্তান",
	"চাদ",
	"ইকুয়েডর",
	"সোমালিয়া",
	"গুয়াতেমালা",
	"সেনেগাল",
	"নেদারল্যান্ডস",
	"কম্বোডিয়া",
	"জিম্বাবুয়ে",
	"গিনি",
	"রুয়ান্ডা",
	"বেনিন",
	"বুরুন্ডি",
	"তিউনিসিয়া",
	"বলিভিয়া",
	"বেলজিয়াম",
	"হাইতি",
	"কিউবা",
	"দক্ষিণ সুদান",
	"ডমিনিকান রিপাবলিক",
	"চেকিয়া",
	"গ্রিস",
	"জর্ডান",
	"পর্তুগাল",
	"আজারবাইজান",
	"সুইডেন",
	"হন্ডুরাস",
	"সংযুক্ত আরব আমিরাত",
	"হাঙ্গেরি",
	"তাজিকিস্তান",
	"বেলারুশ",
	"অস্ট্রিয়া",
	"পাপুয়া নিউ গিনি",
	"সার্বিয়া",
	"ইসরায়েল",
];

const popLow = [
	"ভ্যাটিকান সিটি",
	"টুভালু",
	"নাউরু",
	"পালাউ",
	"সান ম্যারিনো",
	"লিশটেনস্টাইন",
	"মোনাকো",
	"মার্শাল দ্বীপপুঞ্জ",
	"সেন্ট কিটস ও নেভিস",
	"ডোমিনিকা",
	"অ্যান্ডোরা",
	"সেশেলস",
	"অ্যান্টিগুয়া ও বারবুডা",
	"মাইক্রোনেশিয়া",
	"টোঙ্গা",
	"গ্রেনাডা",
	"সেন্ট ভিনসেন্ট",
	"কিরিবাতি",
	"সাঁও টোমে ও প্রিন্সিপি",
	"সামোয়া",
	"সেন্ট লুসিয়া",
	"বার্বাডোস",
	"ভানুয়াতু",
	"বাহামা",
	"বেলিজ",
	"ব্রুনাই",
	"মাল্টা",
	"মালদ্বীপ",
	"কেপ ভার্দে",
	"জিবুতি",
	"কোমোরোস",
	"গায়ানা",
	"ভুটান",
	"নিরক্ষীয় গিনি",
	"ফিজি",
	"সাইপ্রাস",
	"এসওয়াতিনি",
	"মরিশাস",
	"এস্তোনিয়া",
	"ট্রিনিদাদ ও টোবাগো",
	"বাহরাইন",
	"তিমুর-লেস্তে",
	"গিনি-বিসাউ",
	"লাটভিয়া",
	"স্লোভেনিয়া",
	"উত্তর মেসিডোনিয়া",
	"লেসোথো",
	"গাম্বিয়া",
	"গ্যাবন",
	"বতসোয়ানা",
	"নামিবিয়া",
	"কাতার",
	"লিথুয়ানিয়া",
	"জামাইকা",
	"আর্মেনিয়া",
	"আলবেনিয়া",
	"কুয়েত",
	"মঙ্গোলিয়া",
	"উরুগুয়ে",
	"বসনিয়া",
	"ওমান",
	"পানামা",
	"জর্জিয়া",
	"ক্রোয়েশিয়া",
	"মৌরিতানিয়া",
	"মধ্য আফ্রিকান প্রজাতন্ত্র",
	"আয়ারল্যান্ড",
	"নিউজিল্যান্ড",
	"কোস্টারিকা",
	"লাইবেরিয়া",
	"স্লোভাকিয়া",
	"নরওয়ে",
	"লেবানন",
	"প্রজাতন্ত্রী কঙ্গো",
	"সিঙ্গাপুর",
	"ডেনমার্ক",
	"ফিনল্যান্ড",
	"নিকারাগুয়া",
	"কিরগিজস্তান",
	"তুর্কমেনিস্তান",
	"এল সালভাদর",
	"সিয়েরা লিওন",
	"লিবিয়া",
	"বুলগেরিয়া",
	"প্যারাগুয়ে",
	"লাওস",
	"সার্বিয়া",
	"পাপুয়া নিউ গিনি",
	"অস্ট্রিয়া",
	"বেলারুশ",
	"তাজিকিস্তান",
	"হাঙ্গেরি",
	"সংযুক্ত আরব আমিরাত",
	"হন্ডুরাস",
	"সুইডেন",
	"আজারবাইজান",
	"পর্তুগাল",
	"জর্ডান",
	"গ্রিস",
	"চেকিয়া",
];

export default function WorldRecords() {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("areaLarge");

	// কোন ট্যাবে কোন ডেটা দেখাবে তার লজিক
	const getActiveData = () => {
		switch (activeTab) {
			case "areaLarge":
				return {
					data: areaLarge,
					title: "আয়তনে সবচেয়ে বড় ১০০ দেশ",
					color: "#38bdf8",
				};
			case "areaSmall":
				return {
					data: areaSmall,
					title: "আয়তনে সবচেয়ে ছোট ১০০ দেশ",
					color: "#facc15",
				};
			case "popHigh":
				return {
					data: popHigh,
					title: "জনসংখ্যায় সবচেয়ে বড় ১০০ দেশ",
					color: "#f87171",
				};
			case "popLow":
				return {
					data: popLow,
					title: "জনসংখ্যায় সবচেয়ে ছোট ১০০ দেশ",
					color: "#a78bfa",
				};
			default:
				return { data: areaLarge, title: "", color: "" };
		}
	};

	const currentList = getActiveData();

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="bg-[#030712] p-4 rounded-2xl border border-white/10 hover:border-yellow-500/50 hover:bg-white/5 transition-all duration-300 shadow-sm flex flex-col items-center text-center justify-center group active:scale-95 h-full w-full"
			>
				<span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">
					🏆
				</span>
				<strong className="block text-xl text-yellow-500 mb-1 font-black">
					বিশ্ব রেকর্ড
				</strong>
				<span className="block text-xs font-semibold text-gray-400">
					বড়-ছোট দেশের তালিকা
				</span>
			</button>

			{isOpen && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(0,0,0,0.6)",
						backdropFilter: "blur(5px)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 9999,
					}}
				>
					<div
						style={{
							background: "#0a0a12",
							width: "95%",
							maxWidth: "800px",
							borderRadius: "24px",
							border: "1px solid rgba(255,255,255,0.1)",
							overflow: "hidden",
							boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
							animation: "fadeIn 0.2s ease-out",
							display: "flex",
							flexDirection: "column",
							maxHeight: "90vh",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "24px",
								borderBottom: "1px solid rgba(255,255,255,0.05)",
								background: "rgba(255,255,255,0.02)",
							}}
						>
							<h2
								style={{
									color: "white",
									margin: 0,
									fontSize: "24px",
									display: "flex",
									alignItems: "center",
									gap: "12px",
									fontWeight: "bold",
								}}
							>
								<span style={{ fontSize: "28px" }}>🏆</span> পৃথিবীর শীর্ষ ১০০ দেশ
							</h2>
							<button
								onClick={() => setIsOpen(false)}
								className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer"
								style={{ border: "none" }}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
						</div>

						<div
							style={{
								display: "flex",
								overflowX: "auto",
								background: "#030712",
								padding: "16px 24px",
								gap: "12px",
								borderBottom: "1px solid rgba(255,255,255,0.05)",
							}}
							className="hide-scrollbar"
						>
							<button
								onClick={() => setActiveTab("areaLarge")}
								style={tabStyle(activeTab === "areaLarge", "#38bdf8")}
							>
								🌍 আয়তনে বড়
							</button>
							<button
								onClick={() => setActiveTab("areaSmall")}
								style={tabStyle(activeTab === "areaSmall", "#facc15")}
							>
								🏝️ আয়তনে ছোট
							</button>
							<button
								onClick={() => setActiveTab("popHigh")}
								style={tabStyle(activeTab === "popHigh", "#f87171")}
							>
								👥 জনসংখ্যায় বেশি
							</button>
							<button
								onClick={() => setActiveTab("popLow")}
								style={tabStyle(activeTab === "popLow", "#a78bfa")}
							>
								👤 জনসংখ্যায় কম
							</button>
						</div>

						<div
							style={{ padding: "32px", overflowY: "auto", flex: 1 }}
							className="scroll-smooth bg-[#0a0a12]"
						>
							<h3
								style={{
									color: currentList.color,
									textAlign: "center",
									marginBottom: "32px",
									fontSize: "1.5rem",
									fontWeight: "900",
								}}
							>
								{currentList.title}
							</h3>

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
									gap: "16px",
								}}
							>
								{currentList.data.map((country, index) => (
									<div
										key={index}
										style={{
											background: "#030712",
											padding: "16px 20px",
											borderRadius: "16px",
											color: "#e2e8f0",
											display: "flex",
											gap: "12px",
											alignItems: "center",
											fontSize: "16px",
											border: "1px solid rgba(255,255,255,0.05)",
											borderLeft: `6px solid ${currentList.color}`,
										}}
										className="hover:bg-white/5 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
									>
										<span
											style={{
												fontWeight: "900",
												color: currentList.color,
												minWidth: "36px",
												fontSize: "18px",
												opacity: 0.8,
											}}
										>
											{index + 1}.
										</span>
										<span style={{ fontWeight: "700" }}>{country}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

const tabStyle = (isActive: boolean, color: string) => ({
	padding: "12px 20px",
	margin: "0",
	background: isActive ? color : "transparent",
	color: isActive ? "#030712" : "#9ca3af",
	border: `1px solid ${isActive ? color : "rgba(255,255,255,0.1)"}`,
	borderRadius: "12px",
	cursor: "pointer",
	fontWeight: "bold",
	fontSize: "15px",
	whiteSpace: "nowrap" as const,
	transition: "all 0.2s ease",
});
