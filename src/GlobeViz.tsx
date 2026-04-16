import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { countries } from './data';

interface GlobeVizProps {
  focusCountryCode?: string | null;
}

export default function GlobeViz({ focusCountryCode }: GlobeVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const countriesDataRef = useRef<Record<string, { lat: number, lng: number }>>({});
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize globe
    const globe = (Globe as any)()(containerRef.current)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png');

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5; // Reduced speed for slower rotation
    globe.controls().enableZoom = true;

    globeInstance.current = globe;

    // Fetch GeoJSON Country Data
    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countriesGeoData => {
        setIsLoadingGeo(false);
        
        globe.polygonsData(countriesGeoData.features)
             .polygonAltitude(0.01)
             .polygonCapColor(() => 'rgba(0, 107, 94, 0.2)') // Transparent green fill
             .polygonSideColor(() => 'rgba(0, 100, 0, 0.1)')
             .polygonStrokeColor(() => '#ffffff') // White borders
             
             // Show Tooltip with Bengali Name & Flag
             .polygonLabel(({ properties: d }: any) => {
                 // Find ISO Code
                 let iso = d.ISO_A2 ? d.ISO_A2.toLowerCase() : '';
                 if(iso === '-99' && d.ISO_A3 === 'FRA') iso = 'fr'; // Fix for France
                 if(iso === '-99' && d.ISO_A3 === 'NOR') iso = 'no'; // Fix for Norway
                 
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
                 // Fallback for missing mapping
                 return `<div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 5px; color: white;"><b>${d.ADMIN}</b></div>`;
             })
             
             // Hover Effect (Make country Pop-up)
             .onPolygonHover((hoverD: any) => {
                 globe.polygonAltitude((d: any) => d === hoverD ? 0.08 : 0.01)
                      .polygonCapColor((d: any) => d === hoverD ? 'rgba(255, 152, 0, 0.7)' : 'rgba(0, 107, 94, 0.2)');
             });
      })
      .catch(err => console.error("Error fetching GeoJSON data:", err));

    // Fetch country coordinates and names to display on the globe
    fetch('https://restcountries.com/v3.1/all')
      .then(res => res.json())
      .then(countries => {
        const labelsData = countries
          .filter((c: any) => c.latlng && c.latlng.length === 2)
          .map((c: any) => {
            const lat = c.latlng[0];
            const lng = c.latlng[1];
            const code = (c.cca2 || '').toLowerCase();
            
            if (code) {
              countriesDataRef.current[code] = { lat, lng };
            }

            return {
              lat,
              lng,
              name: c.translations?.ben?.common || c.name.common,
              pop: c.population
            };
          });

        globe
          .labelsData(labelsData)
          .labelLat('lat')
          .labelLng('lng')
          .labelText('name')
          .labelSize((d: any) => d.pop > 50000000 ? 1.8 : d.pop > 10000000 ? 1.2 : 0.8)
          .labelDotRadius(0) // Remove the dot to look like Google Earth
          .labelColor(() => 'rgba(255, 255, 255, 1)') // Solid white text
          .labelResolution(4) // High resolution for crisp text
          .labelAltitude(0.01);

        // If a country is already selected when data loads, focus it
        if (focusCountryCode && countriesDataRef.current[focusCountryCode.toLowerCase()]) {
          const { lat, lng } = countriesDataRef.current[focusCountryCode.toLowerCase()];
          globe.pointOfView({ lat, lng, altitude: 1.2 }, 1000);
        }
      })
      .catch(err => console.error("Error fetching country data for globe:", err));

    const handleResize = () => {
      if (containerRef.current && globeInstance.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.min(width * 0.6, 500); // Cap height
        globeInstance.current.width(width);
        globeInstance.current.height(height);
      }
    };

    // Initial size
    handleResize();

    // Resize observer for container to handle responsive layouts
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
    if (focusCountryCode && globeInstance.current && countriesDataRef.current) {
      const code = focusCountryCode.toLowerCase();
      const coords = countriesDataRef.current[code];
      if (coords) {
        // Stop auto-rotation temporarily when focusing
        globeInstance.current.controls().autoRotate = false;
        globeInstance.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.2 }, 1000);
        
        // Resume auto-rotation after a delay
        setTimeout(() => {
           if (globeInstance.current) {
             globeInstance.current.controls().autoRotate = true;
           }
        }, 5000);
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
