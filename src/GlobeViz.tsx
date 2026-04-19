import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { countries } from './data';

interface GlobeVizProps {
  focusCountryCode?: string | null;
  onCountryClick?: (code: string) => void;
}

export default function GlobeViz({ focusCountryCode, onCountryClick }: GlobeVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const geoDataRef = useRef<any[]>([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);

  // ISO ঠিক করার ফাংশন
  const getCorrectISO = (d: any) => {
    if (!d || !d.properties) return '';
    let iso = d.properties.ISO_A2 ? d.properties.ISO_A2.toLowerCase() : '';
    if(iso === '-99' && d.properties.ISO_A3 === 'FRA') iso = 'fr';
    if(iso === '-99' && d.properties.ISO_A3 === 'NOR') iso = 'no';
    return iso;
  };

  const getContinentColor = (continent: string, opacity: number) => {
    switch (continent) {
      case 'Asia': return `rgba(255, 152, 0, ${opacity})`; // Orange
      case 'Europe': return `rgba(33, 150, 243, ${opacity})`; // Blue
      case 'Africa': return `rgba(255, 193, 7, ${opacity})`; // Yellow
      case 'North America': return `rgba(76, 175, 80, ${opacity})`; // Green
      case 'South America': return `rgba(233, 30, 99, ${opacity})`; // Pink
      case 'Oceania': return `rgba(156, 39, 176, ${opacity})`; // Purple
      case 'Antarctica': return `rgba(158, 158, 158, ${opacity})`; // Grey
      default: return `rgba(0, 107, 94, ${opacity})`; // Default
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize globe
    const globe = (Globe as any)()(containerRef.current)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png');

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableZoom = true;

    globeInstance.current = globe;

    // Fetch GeoJSON Country Data
    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countriesGeoData => {
        setIsLoadingGeo(false);
        const geoData = countriesGeoData.features;
        geoDataRef.current = geoData;
        
        // ম্যাপের বর্ডার এবং কালার
        globe.polygonsData(geoData)
             .polygonAltitude(0.01)
             .polygonCapColor((d: any) => getContinentColor(d.properties.CONTINENT, 0.4))
             .polygonSideColor((d: any) => getContinentColor(d.properties.CONTINENT, 0.1))
             .polygonStrokeColor(() => '#ffffff')
             
             // পপ-আপ ইনফরমেশন
             .polygonLabel(({ properties: d }: any) => {
                 let iso = getCorrectISO({ properties: d });
                 let bdData = countries.find(c => c.code === iso);
                 if(bdData) {
                     return `
                        <div style="background: rgba(0,0,0,0.85); padding: 10px; border-radius: 8px; color: white; font-family: 'Hind Siliguri', sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid #444;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                <img src="https://flagcdn.com/w40/${bdData.code}.png" style="width: 30px; border-radius:3px;">
                                <span style="font-size: 18px; font-weight: bold; color: #4CAF50;">${bdData.country}</span>
                            </div>
                            <div style="font-size: 14px;"><b>রাজধানী:</b> ${bdData.capital}</div>
                            <div style="font-size: 14px;"><b>মহাদেশ:</b> ${bdData.continent}</div>
                        </div>
                     `;
                 }
                 return `<div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 5px; color: white;"><b>${d.ADMIN}</b></div>`;
             })
             // Hover Effect
             .onPolygonHover((hoverD: any) => {
                 globe.polygonAltitude((d: any) => {
                    const isFocused = focusCountryCode && getCorrectISO(d) === focusCountryCode.toLowerCase();
                    return d === hoverD ? 0.08 : (isFocused ? 0.08 : 0.01);
                 })
                 .polygonCapColor((d: any) => {
                    const isFocused = focusCountryCode && getCorrectISO(d) === focusCountryCode.toLowerCase();
                    if (d === hoverD) return getContinentColor(d.properties.CONTINENT, 0.8);
                    if (isFocused) return getContinentColor(d.properties.CONTINENT, 0.9);
                    return getContinentColor(d.properties.CONTINENT, 0.4);
                 });
             })
             // Click Effect
             .onPolygonClick((d: any) => {
                 const iso = getCorrectISO(d);
                 if (iso && onCountryClick) {
                     onCountryClick(iso);
                 }
             });

        // গ্লোবের ওপর সব সময় দেশের নাম ভাসিয়ে রাখা (Labels)
        const labelData: any[] = [
            // মহাদেশ (Continents)
            { lat: 45, lng: 90, name: 'এশিয়া', type: 'continent' },
            { lat: 50, lng: 15, name: 'ইউরোপ', type: 'continent' },
            { lat: 5, lng: 20, name: 'আফ্রিকা', type: 'continent' },
            { lat: 45, lng: -100, name: 'উত্তর আমেরিকা', type: 'continent' },
            { lat: -15, lng: -60, name: 'দক্ষিণ আমেরিকা', type: 'continent' },
            { lat: -25, lng: 140, name: 'ওশেনিয়া', type: 'continent' },
            { lat: -75, lng: 0, name: 'অ্যান্টার্কটিকা', type: 'continent' },
            // মহাসাগর (Oceans)
            { lat: 0, lng: -160, name: 'প্রশান্ত মহাসাগর', type: 'ocean' },
            { lat: 20, lng: -45, name: 'আটলান্টিক মহাসাগর', type: 'ocean' },
            { lat: -20, lng: 80, name: 'ভারত মহাসাগর', type: 'ocean' },
            { lat: 80, lng: 0, name: 'উত্তর মহাসাগর', type: 'ocean' },
            { lat: -60, lng: -90, name: 'দক্ষিণ মহাসাগর', type: 'ocean' }
        ];
        
        geoData.forEach((d: any) => {
            let iso = getCorrectISO(d);
            let bdData = countries.find(c => c.code === iso);
            if(bdData && d.properties.LABEL_Y && d.properties.LABEL_X) {
                labelData.push({ 
                  lat: d.properties.LABEL_Y, 
                  lng: d.properties.LABEL_X, 
                  name: bdData.country,
                  pop: d.properties.POP_EST || 0,
                  type: 'country'
                });
            }
        });

        // গ্লোবের ওপর সব সময় দেশের নাম ভাসিয়ে রাখা (HTML Elements দিয়ে, যা বাংলা ১০০% সাপোর্ট করে)
        globe.labelsData([]); // Clear any existing canvas labels
        
        globe.htmlElementsData(labelData)
             .htmlLat('lat')
             .htmlLng('lng')
             .htmlAltitude((d: any) => {
                 if (d.type === 'ocean') return 0.05;
                 if (d.type === 'continent') return 0.04;
                 return 0.01;
             })
             .htmlElement((d: any) => {
                 const el = document.createElement('div');
                 el.innerText = d.name;
                 
                 // Native CSS styling for perfect font rendering
                 el.style.fontFamily = '"Hind Siliguri", "Segoe UI", sans-serif';
                 el.style.whiteSpace = 'nowrap';
                 el.style.pointerEvents = 'none'; // Prevent glob interacting block
                 el.style.textShadow = '0px 2px 4px rgba(0,0,0,1), 0px -1px 2px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.8)';
                 el.style.textAlign = 'center';
                 el.style.transform = 'translate(-50%, -50%)'; // Center pivot
                 el.style.transition = 'opacity 0.2s';

                 if (d.type === 'ocean') {
                     el.style.color = '#7de3ff'; 
                     el.style.fontSize = '16px';
                     el.style.fontWeight = '600';
                     el.style.fontStyle = 'italic';
                 } else if (d.type === 'continent') {
                     el.style.color = '#ffffff';
                     el.style.fontSize = '18px';
                     el.style.fontWeight = '700';
                     el.style.letterSpacing = '1px';
                 } else {
                     el.style.color = 'rgba(255, 255, 255, 0.8)';
                     el.style.fontSize = d.pop > 50000000 ? '12px' : d.pop > 10000000 ? '10px' : '0px'; // Hide very small country labels to prevent clutter
                     el.style.fontWeight = '500';
                     if (d.pop <= 10000000) el.style.display = 'none'; // Ensure small ones are completely hidden
                 }
                 
                 return el;
             });

        // If a country is already selected when data loads, focus it
        if (focusCountryCode) {
          const targetGeo = geoData.find((d: any) => getCorrectISO(d) === focusCountryCode.toLowerCase());
          if (targetGeo && targetGeo.properties.LABEL_Y && targetGeo.properties.LABEL_X) {
            globe.pointOfView({ lat: targetGeo.properties.LABEL_Y, lng: targetGeo.properties.LABEL_X, altitude: 0.8 }, 1000);
          }
        } else {
          // Default view
          globe.pointOfView({ lat: 23.68, lng: 90.35, altitude: 1.8 }, 2000); // Focus gently over Asia/Bangladesh by default
        }
      })
      .catch(err => console.error("Error fetching GeoJSON data:", err));

    const handleResize = () => {
      if (containerRef.current && globeInstance.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.min(width * 0.6, 500);
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
          const isFocused = focusCountryCode && getCorrectISO(d) === focusCountryCode.toLowerCase();
          return isFocused ? 0.08 : 0.01;
        })
        .polygonCapColor((d: any) => {
          const isFocused = focusCountryCode && getCorrectISO(d) === focusCountryCode.toLowerCase();
          return isFocused ? getContinentColor(d.properties.CONTINENT, 0.9) : getContinentColor(d.properties.CONTINENT, 0.4);
        });

      if (focusCountryCode) {
        const targetGeo = geoDataRef.current.find((d: any) => getCorrectISO(d) === focusCountryCode.toLowerCase());
        
        if (targetGeo && targetGeo.properties.LABEL_Y && targetGeo.properties.LABEL_X) {
          // Stop auto-rotation temporarily when focusing
          globeInstance.current.controls().autoRotate = false;
          
          // ওই দেশে উড়ে যাওয়া (Fly)
          globeInstance.current.pointOfView({ 
            lat: targetGeo.properties.LABEL_Y, 
            lng: targetGeo.properties.LABEL_X, 
            altitude: 0.8 
          }, 1500);
          
        }
      } else {
        globeInstance.current.controls().autoRotate = true;
      }
    }
  }, [focusCountryCode]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black flex justify-center items-center border border-[var(--border)]" style={{ minHeight: '300px' }}>
      {isLoadingGeo && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-sm font-medium animate-pulse">
            ম্যাপ লোড হচ্ছে... ⏳
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full"></div>
    </div>
  );
}
