import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import { countries } from "./data";
import { Lock, Unlock } from "lucide-react";

interface GlobeVizProps {
	focusCountryCode?: string | null;
}

export default function GlobeViz({ focusCountryCode }: GlobeVizProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const globeInstance = useRef<any>(null);
	const geoDataRef = useRef<any[]>([]);
	const [isLoadingGeo, setIsLoadingGeo] = useState(true);
	const [isInteractive, setIsInteractive] = useState(true);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth <= 768;
			setIsMobile(mobile);
			if (mobile) {
				setIsInteractive(false);
			} else {
				setIsInteractive(true);
			}
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// ISO ঠিক করার ফাংশন
	const getCorrectISO = (d: any) => {
		if (!d || !d.properties) return "";
		let iso = d.properties.ISO_A2 ? d.properties.ISO_A2.toLowerCase() : "";
		if (iso === "-99" && d.properties.ISO_A3 === "FRA") iso = "fr";
		if (iso === "-99" && d.properties.ISO_A3 === "NOR") iso = "no";
		return iso;
	};

	// মহাদেশ অনুযায়ী কালার
	const continentColors: Record<string, string> = {
		এশিয়া: "rgba(255, 87, 34, 0.35)", // Deep Orange
		ইউরোপ: "rgba(33, 150, 243, 0.35)", // Blue
		আফ্রিকা: "rgba(255, 193, 7, 0.35)", // Amber
		"উত্তর আমেরিকা": "rgba(76, 175, 80, 0.35)", // Green
		"দক্ষিণ আমেরিকা": "rgba(156, 39, 176, 0.35)", // Purple
		ওশেনিয়া: "rgba(233, 30, 99, 0.35)", // Pink
	};

	const getBaseColor = (d: any) => {
		const iso = getCorrectISO(d);
		const bdData = countries.find((c) => c.code === iso);
		if (bdData && bdData.continent) {
			return continentColors[bdData.continent] || "rgba(0, 107, 94, 0.2)";
		}
		return "rgba(0, 107, 94, 0.2)";
	};

	useEffect(() => {
		if (!containerRef.current) return;

		// Initialize globe
		const globe = (Globe as any)()(containerRef.current)
			.globeImageUrl(
				"https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
			)
			.bumpImageUrl(
				"https://unpkg.com/three-globe/example/img/earth-topology.png",
			)
			.backgroundImageUrl(
				"https://unpkg.com/three-globe/example/img/night-sky.png",
			);

		globe.controls().autoRotate = true;
		globe.controls().autoRotateSpeed = 0.5;
		globe.controls().enableZoom = true;

		// Resume rotation after user interaction ends
		let resumeTimeout: ReturnType<typeof setTimeout>;
		globe.controls().addEventListener("start", () => {
			clearTimeout(resumeTimeout);
			globe.controls().autoRotate = false;
		});
		globe.controls().addEventListener("end", () => {
			clearTimeout(resumeTimeout);
			resumeTimeout = setTimeout(() => {
				if (globeInstance.current) {
					globeInstance.current.controls().autoRotateSpeed = 0.5;
					globeInstance.current.controls().autoRotate = true;
				}
			}, 1000);
		});

		globeInstance.current = globe;

		// Fetch GeoJSON Country Data
		fetch(
			"https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson",
		)
			.then((res) => res.json())
			.then((countriesGeoData) => {
				setIsLoadingGeo(false);
				const geoData = countriesGeoData.features;
				geoDataRef.current = geoData;

				// ম্যাপের বর্ডার এবং কালার
				globe
					.polygonsData(geoData)
					.polygonAltitude(0.01)
					.polygonCapColor((d: any) => getBaseColor(d))
					.polygonSideColor(() => "rgba(0, 0, 0, 0.2)")
					.polygonStrokeColor(() => "rgba(255, 255, 255, 0.3)")

					// পপ-আপ ইনফরমেশন
					.polygonLabel(({ properties: d }: any) => {
						let iso = getCorrectISO({ properties: d });
						let bdData = countries.find((c) => c.code === iso);

						const countryName = bdData ? bdData.country : d.ADMIN;
						const continentName = bdData
							? bdData.continent
							: d.CONTINENT || d.REGION_UN || "N/A";

						return `
                    <div style="background: rgba(3, 7, 18, 0.95); padding: 12px 16px; border-radius: 16px; color: white; font-family: 'Hind Siliguri', sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(8px); min-width: 180px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                            <img src="https://flagcdn.com/w40/${iso}.png" onerror="this.src='https://flagcdn.com/w40/un.png'" style="width: 32px; height: 22px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <span style="font-size: 16px; font-weight: 800; color: #f8fafc; letter-spacing: 0.5px;">${countryName}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${
															bdData
																? `
                            <div style="font-size: 13px; color: #cbd5e1; display: flex; align-items: center;">
                                <span style="color: #94a3b8; font-size: 11px; width: 65px; font-weight: 700; text-transform: uppercase;">রাজধানী:</span> 
                                <span style="font-weight: 700; color: #60a5fa; flex: 1;">${bdData.capital}</span>
                            </div>`
																: ""
														}
                            <div style="font-size: 13px; color: #cbd5e1; display: flex; align-items: center;">
                                <span style="color: #94a3b8; font-size: 11px; width: ${bdData ? "65px" : "auto"}; font-weight: 700; margin-right: ${bdData ? "0" : "8px"}; text-transform: uppercase;">${bdData ? "মহাদেশ:" : "Continent:"}</span> 
                                <span style="font-weight: 700; color: #34d399; flex: 1;">${continentName}</span>
                            </div>
                        </div>
                    </div>
                 `;
					})
					// Hover Effect
					.onPolygonHover((hoverD: any) => {
						globe
							.polygonAltitude((d: any) => {
								const isFocused =
									focusCountryCode &&
									getCorrectISO(d) === focusCountryCode.toLowerCase();
								return d === hoverD ? 0.08 : isFocused ? 0.08 : 0.01;
							})
							.polygonCapColor((d: any) => {
								const isFocused =
									focusCountryCode &&
									getCorrectISO(d) === focusCountryCode.toLowerCase();
								return d === hoverD
									? "rgba(255, 152, 0, 0.9)"
									: isFocused
										? "rgba(255, 152, 0, 0.9)"
										: getBaseColor(d);
							});
					});

				// গ্লোবের ওপর সব সময় দেশের নাম, মহাদেশ ও মহাসাগরের নাম ভাসিয়ে রাখা (HTML Elements)
				const elementData: any[] = [];
				geoData.forEach((d: any) => {
					let iso = getCorrectISO(d);
					let bdData = countries.find((c) => c.code === iso);
					if (bdData && d.properties.LABEL_Y && d.properties.LABEL_X) {
						elementData.push({
							lat: d.properties.LABEL_Y,
							lng: d.properties.LABEL_X,
							name: bdData.country,
							pop: d.properties.POP_EST || 0,
							type: "country",
						});
					}
				});

				// মহাদেশ ও মহাসাগরের তথ্য
				const regionsData = [
					{ lat: 0, lng: -140, name: "প্রশান্ত মহাসাগর", pop: 0, type: "ocean" },
					{ lat: 15, lng: -40, name: "আটলান্টিক মহাসাগর", pop: 0, type: "ocean" },
					{ lat: -20, lng: 80, name: "ভারত মহাসাগর", pop: 0, type: "ocean" },
					{ lat: 80, lng: 0, name: "উত্তর মহাসাগর", pop: 0, type: "ocean" },
					{ lat: -60, lng: 0, name: "দক্ষিণ মহাসাগর", pop: 0, type: "ocean" },
					{ lat: 45, lng: 90, name: "এশিয়া", pop: 0, type: "continent" },
					{ lat: 10, lng: 20, name: "আফ্রিকা", pop: 0, type: "continent" },
					{ lat: 50, lng: 15, name: "ইউরোপ", pop: 0, type: "continent" },
					{
						lat: 40,
						lng: -100,
						name: "উত্তর আমেরিকা",
						pop: 0,
						type: "continent",
					},
					{
						lat: -15,
						lng: -60,
						name: "দক্ষিণ আমেরিকা",
						pop: 0,
						type: "continent",
					},
					{ lat: -25, lng: 135, name: "ওশেনিয়া", pop: 0, type: "continent" },
					{ lat: -80, lng: 0, name: "অ্যান্টার্কটিকা", pop: 0, type: "continent" },
				];

				globe
					.htmlElementsData([...elementData, ...regionsData])
					.htmlElement((d: any) => {
						const el = document.createElement("div");
						el.innerHTML = d.name;
						el.style.fontFamily = "'Hind Siliguri', sans-serif";
						el.style.pointerEvents = "none";
						el.style.textAlign = "center";
						el.style.whiteSpace = "nowrap";
						// To center the div precisely over its coordinate
						el.style.transform = "translate(-50%, -50%)";

						if (d.type === "ocean") {
							el.style.color = "#38bdf8"; // Light Blue
							el.style.fontStyle = "italic";
							el.style.fontWeight = "600";
							el.style.fontSize = "14px";
							el.style.textShadow = "0px 2px 4px rgba(0,0,0,0.8)";
						} else if (d.type === "continent") {
							el.style.color = "#ffffff";
							el.style.fontWeight = "900";
							el.style.fontSize = "24px";
							el.style.textShadow =
								"0px 2px 10px rgba(0,0,0,1), 0px 0px 5px rgba(0,0,0,0.8)";
							el.style.letterSpacing = "1px";
						} else {
							// country
							const isLarge = d.pop > 50000000;
							const isMedium = d.pop > 10000000;
							el.style.color = "#ffffff";
							el.style.fontWeight = isLarge ? "bold" : "normal";
							el.style.fontSize = isLarge ? "14px" : isMedium ? "11px" : "9px";
							el.style.opacity = isLarge ? "1" : isMedium ? "0.7" : "0.2";
							el.style.textShadow = "0px 1px 3px rgba(0,0,0,0.9)";
						}
						return el;
					});

				// If a country is already selected when data loads, focus it
				if (focusCountryCode) {
					const targetGeo = geoData.find(
						(d: any) => getCorrectISO(d) === focusCountryCode.toLowerCase(),
					);
					if (
						targetGeo &&
						targetGeo.properties.LABEL_Y &&
						targetGeo.properties.LABEL_X
					) {
						globe.pointOfView(
							{
								lat: targetGeo.properties.LABEL_Y,
								lng: targetGeo.properties.LABEL_X,
								altitude: 0.8,
							},
							1000,
						);
					}
				}
			})
			.catch((err) => console.error("Error fetching GeoJSON data:", err));

		const handleResize = () => {
			if (containerRef.current && globeInstance.current) {
				const width = containerRef.current.clientWidth;
				const height = containerRef.current.clientHeight;
				globeInstance.current.width(width);
				globeInstance.current.height(height);
			}
		};

		handleResize();

		const resizeObserver = new ResizeObserver(() => {
			handleResize();
		});
		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
			if (globeInstance.current && globeInstance.current._destructor) {
				globeInstance.current._destructor();
			}
		};
	}, []);

	// Handle focus country changes
	useEffect(() => {
		if (globeInstance.current && geoDataRef.current.length > 0) {
			// Trigger an update immediately for the current focus colors
			globeInstance.current
				.polygonAltitude((d: any) => {
					const isFocused =
						focusCountryCode &&
						getCorrectISO(d) === focusCountryCode.toLowerCase();
					return isFocused ? 0.08 : 0.01;
				})
				.polygonCapColor((d: any) => {
					const isFocused =
						focusCountryCode &&
						getCorrectISO(d) === focusCountryCode.toLowerCase();
					return isFocused ? "rgba(255, 152, 0, 0.9)" : getBaseColor(d);
				});

			if (focusCountryCode) {
				const targetGeo = geoDataRef.current.find(
					(d: any) => getCorrectISO(d) === focusCountryCode.toLowerCase(),
				);

				if (
					targetGeo &&
					targetGeo.properties.LABEL_Y &&
					targetGeo.properties.LABEL_X
				) {
					// We can keep it rotating slowly, or temporarily suspend. We'll let it rotate.
					globeInstance.current.controls().autoRotateSpeed = 0.2;

					// ওই দেশে উড়ে যাওয়া (Fly)
					globeInstance.current.pointOfView(
						{
							lat: targetGeo.properties.LABEL_Y,
							lng: targetGeo.properties.LABEL_X,
							altitude: 0.8,
						},
						1500,
					);
				}
			} else {
				globeInstance.current.controls().autoRotateSpeed = 0.5;
				globeInstance.current.controls().autoRotate = true;
			}
		}
	}, [focusCountryCode]);

	return (
		<div
			className={`relative w-full rounded-2xl overflow-hidden shadow-lg flex justify-center items-center transition-all bg-transparent touch-pan-y h-full`}
		>
			{isLoadingGeo && (
				<div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
					<div className="bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-sm font-medium animate-pulse border border-white/10">
						ম্যাপ লোড হচ্ছে... ⏳
					</div>
				</div>
			)}
			<div
				ref={containerRef}
				className={`w-full flex justify-center items-center h-full pointer-events-auto cursor-grab active:cursor-grabbing hover:cursor-grab`}
			></div>
		</div>
	);
}
