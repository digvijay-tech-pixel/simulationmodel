import { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import axios from 'axios';
import { Globe as GlobeIcon, MapPin, TrendingUp, Skull, Activity, Search } from 'lucide-react';

export default function GlobeView() {
  const [countriesGeo, setCountriesGeo] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const globeEl = useRef();

  // Create a lookup map: ISO3 -> live data
  const liveDataMap = useRef({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch countries GeoJSON for the area-based global view
        const geoRes = await fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
        const geoData = await geoRes.json();
        setCountriesGeo(geoData.features);

        // Fetch live COVID data from disease.sh
        const liveRes = await axios.get('https://disease.sh/v3/covid-19/countries');
        const live = liveRes.data;
        setLiveData(live);

        // Build ISO lookup map
        const map = {};
        live.forEach(c => {
          if (c.countryInfo?.iso3) {
            map[c.countryInfo.iso3] = c;
          }
        });
        liveDataMap.current = map;

        // Sort by active cases descending for the top countries sidebar
        const sorted = [...live].sort((a, b) => b.active - a.active);
        setTopCountries(sorted.slice(0, 20));

        setLoading(false);

        // Point globe to a global view and enable auto-rotation
        setTimeout(() => {
          if (globeEl.current) {
            globeEl.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 2000);
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.4;
          }
        }, 500);

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Dynamic choropleth coloring based on actual cases per million
  const getPolygonColor = (feat) => {
    const iso3 = feat.properties.ISO_A3;
    const countryData = liveDataMap.current[iso3];

    if (!countryData) return 'rgba(47, 54, 64, 0.6)'; // Unmatched / no data

    const casesPerMillion = countryData.casesPerOneMillion || 0;

    // Color scale based on cases per million
    if (casesPerMillion > 200000) return 'rgba(220, 20, 60, 0.85)';   // Crimson - Very High
    if (casesPerMillion > 100000) return 'rgba(232, 65, 24, 0.80)';   // Red-Orange - High
    if (casesPerMillion > 50000) return 'rgba(194, 54, 22, 0.75)';    // Dark Red - Moderate-High
    if (casesPerMillion > 20000) return 'rgba(255, 165, 2, 0.70)';    // Orange - Moderate
    if (casesPerMillion > 5000) return 'rgba(255, 195, 18, 0.60)';    // Amber - Low-Moderate
    if (casesPerMillion > 1000) return 'rgba(39, 174, 96, 0.55)';     // Green - Low
    return 'rgba(44, 62, 80, 0.50)';                                   // Dark - Very Low
  };

  const getTooltip = (d) => {
    const iso3 = d.properties.ISO_A3;
    const c = liveDataMap.current[iso3];
    if (!c) {
      return `
        <div style="background: rgba(15, 23, 42, 0.95); padding: 14px 18px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 8px 32px rgba(0,0,0,0.5); color: white; font-family: 'Inter', sans-serif; min-width: 180px;">
          <h4 style="margin: 0; font-size: 15px; color: #94a3b8;">${d.properties.ADMIN}</h4>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">No data available</p>
        </div>
      `;
    }
    return `
      <div style="background: rgba(15, 23, 42, 0.95); padding: 16px 20px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 8px 32px rgba(0,0,0,0.5); color: white; font-family: 'Inter', sans-serif; min-width: 240px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">
          <img src="${c.countryInfo?.flag}" style="width: 28px; height: 18px; border-radius: 3px; object-fit: cover; box-shadow: 0 1px 3px rgba(0,0,0,0.4);" />
          <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #f1f5f9;">${c.country}</h4>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div>
            <span style="color: #64748b;">Total Cases</span>
            <div style="color: #fbbf24; font-weight: 600; font-size: 14px;">${c.cases?.toLocaleString()}</div>
          </div>
          <div>
            <span style="color: #64748b;">Active</span>
            <div style="color: #f97316; font-weight: 600; font-size: 14px;">${c.active?.toLocaleString()}</div>
          </div>
          <div>
            <span style="color: #64748b;">Recovered</span>
            <div style="color: #22c55e; font-weight: 600; font-size: 14px;">${c.recovered?.toLocaleString()}</div>
          </div>
          <div>
            <span style="color: #64748b;">Deaths</span>
            <div style="color: #ef4444; font-weight: 600; font-size: 14px;">${c.deaths?.toLocaleString()}</div>
          </div>
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
          Cases/Million: <span style="color: #a5b4fc; font-weight: 600;">${c.casesPerOneMillion?.toLocaleString()}</span>
        </div>
      </div>
    `;
  };

  // Filter top countries by search
  const filteredCountries = searchTerm
    ? liveData
        .filter(c => c.country.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.active - a.active)
        .slice(0, 20)
    : topCountries;

  // Navigate globe to a country
  const focusCountry = (country) => {
    if (globeEl.current && country.countryInfo) {
      globeEl.current.pointOfView(
        { lat: country.countryInfo.lat, lng: country.countryInfo.long, altitude: 1.2 },
        1000
      );
    }
  };

  // Global stats summary
  const globalStats = liveData.length > 0 ? {
    totalCases: liveData.reduce((acc, c) => acc + (c.cases || 0), 0),
    totalActive: liveData.reduce((acc, c) => acc + (c.active || 0), 0),
    totalDeaths: liveData.reduce((acc, c) => acc + (c.deaths || 0), 0),
    totalRecovered: liveData.reduce((acc, c) => acc + (c.recovered || 0), 0),
  } : null;

  return (
    <div className="p-6 font-sans">
      <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
            <GlobeIcon className="w-8 h-8 text-emerald-400" />
            Global Disease Monitor
          </h1>
          <p className="text-slate-400 mt-2">Real-time worldwide COVID-19 data visualization powered by disease.sh</p>
        </div>

        {/* Global Stats Summary Bar */}
        {globalStats && (
          <div className="flex gap-4 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-center">
              <p className="text-slate-500 text-xs uppercase font-semibold">Total Cases</p>
              <p className="text-amber-400 font-bold text-lg">{(globalStats.totalCases / 1e6).toFixed(1)}M</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-center">
              <p className="text-slate-500 text-xs uppercase font-semibold">Active</p>
              <p className="text-orange-400 font-bold text-lg">{(globalStats.totalActive / 1e6).toFixed(2)}M</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-center">
              <p className="text-slate-500 text-xs uppercase font-semibold">Deaths</p>
              <p className="text-red-400 font-bold text-lg">{(globalStats.totalDeaths / 1e6).toFixed(1)}M</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-center">
              <p className="text-slate-500 text-xs uppercase font-semibold">Recovered</p>
              <p className="text-emerald-400 font-bold text-lg">{(globalStats.totalRecovered / 1e6).toFixed(1)}M</p>
            </div>
          </div>
        )}
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative h-[700px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-slate-400 text-sm">Loading live global data...</p>
          </div>
        )}
        
        {/* Top Countries Sidebar */}
        <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl w-72">
          <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Most Impacted Countries
          </h3>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
            {filteredCountries.map(c => (
              <div
                key={c.country}
                className="flex items-center gap-3 text-xs p-2 hover:bg-slate-800/70 rounded-lg cursor-pointer transition-colors group"
                onClick={() => focusCountry(c)}
              >
                <img
                  src={c.countryInfo?.flag}
                  alt=""
                  className="w-6 h-4 rounded shadow-sm object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 font-medium truncate group-hover:text-white transition-colors">{c.country}</p>
                  <p className="text-slate-500 text-[10px]">{c.cases?.toLocaleString()} cases</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-orange-400 font-semibold">{c.active?.toLocaleString()}</p>
                  <p className="text-slate-500 text-[10px]">active</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Legend Overlay */}
        <div className="absolute bottom-6 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-xl">
          <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Cases Per Million</h4>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(220,20,60,0.6)]" style={{ backgroundColor: 'rgba(220, 20, 60, 0.85)' }}></div>
              <span className="text-slate-200 text-xs font-medium">&gt; 200k · Critical</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shadow-[0_0_8px_rgba(232,65,24,0.5)]" style={{ backgroundColor: 'rgba(232, 65, 24, 0.80)' }}></div>
              <span className="text-slate-200 text-xs font-medium">&gt; 100k · Very High</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shadow-[0_0_6px_rgba(194,54,22,0.4)]" style={{ backgroundColor: 'rgba(194, 54, 22, 0.75)' }}></div>
              <span className="text-slate-200 text-xs font-medium">&gt; 50k · High</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 165, 2, 0.70)' }}></div>
              <span className="text-slate-200 text-xs font-medium">&gt; 20k · Moderate</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 195, 18, 0.60)' }}></div>
              <span className="text-slate-200 text-xs font-medium">&gt; 5k · Low-Moderate</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(39, 174, 96, 0.55)' }}></div>
              <span className="text-slate-200 text-xs font-medium">&gt; 1k · Low</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(44, 62, 80, 0.50)' }}></div>
              <span className="text-slate-400 text-xs font-medium">&lt; 1k · Very Low</span>
            </div>
          </div>
        </div>

        {/* Data Source Tag */}
        <div className="absolute bottom-6 right-4 z-10 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg">
          <p className="text-[10px] text-slate-500">Live data from <span className="text-emerald-400 font-semibold">disease.sh</span> API</p>
        </div>

        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          polygonsData={countriesGeo}
          polygonAltitude={0.01}
          polygonCapColor={d => getPolygonColor(d)}
          polygonSideColor={() => 'rgba(0, 0, 0, 0.15)'}
          polygonStrokeColor={() => '#111827'}
          polygonLabel={getTooltip}
        />
      </div>
    </div>
  );
}
