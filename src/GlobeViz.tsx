import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { countries } from './data';

interface GlobeVizProps {
  focusCountryCode?: string | null;
}

export default function GlobeViz({ focusCountryCode }: GlobeVizProps) {
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
             .polygonCapColor(() => 'rgba(0, 107, 94, 0.2)')
             .polygonSideColor(() => 'rgba(0, 100, 0, 0.1)')
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
                    return d === hoverD ? 'rgba(255, 152, 0, 0.7)' : (isFocused ? 'rgba(255, 152, 0, 0.8)' : 'rgba(0, 107, 94, 0.2)');
                 });
             });

        // গ্লোবের ওপর সব সময় দেশের নাম ভাসিয়ে রাখা (Labels)
        const labelData: any[] = [];
        geoData.forEach((d: any) => {
            let iso = getCorrectISO(d);
            let bdData = countries.find(c => c.code === iso);
            if(bdData && d.properties.LABEL_Y && d.properties.LABEL_X) {
                labelData.push({ 
                  lat: d.properties.LABEL_Y, 
                  lng: d.properties.LABEL_X, 
                  name: bdData.country,
                  pop: d.properties.POP_EST || 0
                });
            }
        });

        globe.labelsData(labelData)
             .labelLat('lat').labelLng('lng').labelText('name')
             .labelSize((d: any) => d.pop > 50000000 ? 1.8 : d.pop > 10000000 ? 1.2 : 0.8)
             .labelDotRadius(0)
             .labelColor(() => 'rgba(255, 255, 255, 1)')
             .labelResolution(4)
             .labelAltitude(0.01);

        // If a country is already selected when data loads, focus it
        if (focusCountryCode) {
          const targetGeo = geoData.find((d: any) => getCorrectISO(d) === focusCountryCode.toLowerCase());
          if (targetGeo && targetGeo.properties.LABEL_Y && targetGeo.properties.LABEL_X) {
            globe.pointOfView({ lat: targetGeo.properties.LABEL_Y, lng: targetGeo.properties.LABEL_X, altitude: 0.8 }, 1000);
          }
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
          return isFocused ? 'rgba(255, 152, 0, 0.8)' : 'rgba(0, 107, 94, 0.2)';
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
