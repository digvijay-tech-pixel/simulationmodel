import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import { Activity, Users, Bed, HeartPulse, Map, MessageSquare, Sliders, Target, CheckCircle2, Bookmark, Globe } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({ line_data: [], bar_data: [] });
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [params, setParams] = useState({
    beta: 0.35,
    inc_days: 5.1,
    inf_days: 10.0,
    initial_infected: 10,
    population: 1752000
  });

  const [loading, setLoading] = useState(true);

  // Fetch countries list
  useEffect(() => {
    axios.get('https://disease.sh/v3/covid-19/countries')
      .then(res => {
        // Sort alphabetically
        const sorted = res.data.sort((a, b) => a.country.localeCompare(b.country));
        setCountries(sorted);
      })
      .catch(err => console.error("Error fetching countries:", err));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/simulate', { params });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching simulation data:', error);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [params]);

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    const country = countries.find(c => c.country === countryName);
    if (country) {
      setSelectedCountry(country);
      setParams(prev => ({
        ...prev,
        // Use active cases if > 0, otherwise default to 10. Cap it reasonably for simulation visualization.
        initial_infected: Math.max(1, Math.min(country.active || 10, 50000)),
        population: country.population || 1000000
      }));
    } else {
      setSelectedCountry(null);
      setParams(prev => ({ ...prev, initial_infected: 10, population: 1752000 }));
    }
  };

  const lineData = data.line_data || [];
  const barData = data.bar_data || [];

  const peakInfected = lineData.length > 0 ? Math.max(...lineData.map(d => d.infected)) : 0;
  const peakBeds = lineData.length > 0 ? Math.max(...lineData.map(d => d.hospital_beds_needed)) : 0;
  const totalDeaths = lineData.length > 0 ? lineData[lineData.length - 1].total_deaths : 0;

  return (
    <div className="p-6 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            COVID-19 SEIR Simulation Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Professional disease spread modeling based on real-world datasets</p>
        </div>

        {/* Global Region Selector */}
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center gap-3 shadow-lg min-w-[300px]">
          <Globe className="text-indigo-400 w-5 h-5" />
          <div className="flex-1">
            <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold tracking-wider">Monitor Region</label>
            <select 
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none"
              onChange={handleCountryChange}
              defaultValue=""
            >
              <option value="">Shivamogga (Default Model)</option>
              {countries.map(c => (
                <option key={c.country} value={c.country}>{c.country}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {selectedCountry && (
        <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-4">
            <img src={selectedCountry.countryInfo?.flag} alt="flag" className="w-10 h-7 rounded shadow-sm object-cover" />
            <div>
              <h3 className="text-lg font-bold text-slate-100">{selectedCountry.country}</h3>
              <p className="text-sm text-indigo-300">Live Data Synchronized</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-slate-400">Total Cases</p>
              <p className="font-semibold text-slate-200">{selectedCountry.cases.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Active Cases</p>
              <p className="font-semibold text-amber-400">{selectedCountry.active.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Population</p>
              <p className="font-semibold text-blue-400">{selectedCountry.population.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Controls Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" /> Parameters
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Infection Rate (β)</span>
                <span className="text-blue-400">{params.beta.toFixed(2)}</span>
              </label>
              <input 
                type="range" name="beta" min="0.1" max="0.9" step="0.01" 
                value={params.beta} onChange={handleSliderChange}
                className="w-full accent-blue-500"
              />
            </div>
            
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Incubation (days)</span>
                <span className="text-orange-400">{params.inc_days.toFixed(1)}</span>
              </label>
              <input 
                type="range" name="inc_days" min="1" max="14" step="0.1" 
                value={params.inc_days} onChange={handleSliderChange}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Infectious (days)</span>
                <span className="text-red-400">{params.inf_days.toFixed(1)}</span>
              </label>
              <input 
                type="range" name="inf_days" min="1" max="21" step="0.1" 
                value={params.inf_days} onChange={handleSliderChange}
                className="w-full accent-red-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Initial Infected</span>
                <span className="text-purple-400">{params.initial_infected}</span>
              </label>
              <input 
                type="range" name="initial_infected" min="1" max={Math.max(500, params.initial_infected * 2)} step="1" 
                value={params.initial_infected} onChange={handleSliderChange}
                className="w-full accent-purple-500"
              />
            </div>
            
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Population</span>
                <span className="text-emerald-400">{(params.population/1000000).toFixed(2)}M</span>
              </label>
              <input 
                type="range" name="population" min="100000" max="1500000000" step="100000" 
                value={params.population} onChange={handleSliderChange}
                className="w-full accent-emerald-500"
                disabled={!!selectedCountry} // Disable if bound to a real country
              />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800">
            <button 
              onClick={() => {
                setSelectedCountry(null);
                setParams({ beta: 0.35, inc_days: 5.1, inf_days: 10.0, initial_infected: 10, population: 1752000 });
                // Also reset select dropdown
                const selectEl = document.querySelector('select');
                if(selectEl) selectEl.value = '';
              }}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium text-sm border border-slate-700"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <HeartPulse className="w-20 h-20" />
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <HeartPulse className="w-6 h-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Peak Infections</p>
                <p className="text-2xl font-bold text-slate-100">{Math.round(peakInfected).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Bed className="w-20 h-20" />
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Bed className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Peak Beds Needed</p>
                <p className={`text-2xl font-bold ${peakBeds > 5000 ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]' : 'text-slate-100'}`}>
                  {Math.round(peakBeds).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Users className="w-20 h-20" />
              </div>
              <div className="p-3 bg-slate-500/10 rounded-lg border border-slate-500/20">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Casualties</p>
                <p className="text-2xl font-bold text-slate-100">{Math.round(totalDeaths).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Main Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative min-h-[400px]">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" /> Disease Spread Over Time (365 Days)
              </h3>
              
              {loading && lineData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              )}
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{fill: '#64748b'}} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b'}} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#818cf8" tick={{fill: '#818cf8'}} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem', boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontSize: '14px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    
                    <Line yAxisId="left" type="monotone" dataKey="susceptible" stroke="#00a8ff" strokeWidth={2} dot={false} name="Susceptible" />
                    <Line yAxisId="left" type="monotone" dataKey="exposed" stroke="#fbc531" strokeWidth={2} dot={false} name="Exposed" />
                    <Line yAxisId="left" type="monotone" dataKey="infected" stroke="#ef4444" strokeWidth={3} dot={false} name="Infected" style={{ filter: 'drop-shadow(0px 0px 5px rgba(239, 68, 68, 0.5))' }}/>
                    <Line yAxisId="left" type="monotone" dataKey="recovered" stroke="#22c55e" strokeWidth={2} dot={false} name="Recovered" />
                    
                    <Line yAxisId="right" type="monotone" dataKey="hospital_beds_needed" stroke="#818cf8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Beds Needed" />
                    <ReferenceLine yAxisId="right" y={5000} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Bed Capacity (5k)', fill: '#ef4444', fontSize: 12 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Age Group Mortality Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative min-h-[300px]">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Cumulative Deaths by Age Group
              </h3>

              {loading && barData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              )}

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="week" stroke="#64748b" tick={{fill: '#64748b'}} />
                    <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="young" stackId="a" fill="#22c55e" name="Young (0-18)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="adult" stackId="a" fill="#fbc531" name="Adult (18-60)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="elderly" stackId="a" fill="#ef4444" name="Elderly (60+)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-800 my-12" />

      {/* --- EMBEDDED PROJECT DETAILS --- */}
      <div className="space-y-12 pb-12">
        {/* INNOVATIVE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <div className="lg:col-span-8 bg-[#0a1120] p-10">
            <h1 className="text-4xl font-bold text-white mb-2">What Makes This</h1>
            <h1 className="text-4xl font-bold text-teal-400 mb-10">Project Innovative?</h1>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-500/10 rounded-lg shrink-0 mt-1">
                  <LineChart className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Graph Updates</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Dynamic SEIR curves update day-by-day showing Susceptible, Exposed, Infected & Recovered trends instantly as parameters change.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg shrink-0 mt-1">
                  <Map className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Geo-Map Visualization</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    3D Globe mapping and heat-map overlays display how disease outbreaks spread across geographic regions using real API data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg shrink-0 mt-1">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Chatbot Integration</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Users can query disease symptoms, prevention tips, and outbreak data in real time using conversational AI.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg shrink-0 mt-1">
                  <Sliders className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Customizable Parameters</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Infection rate (β), incubation periods, and infectious durations are fully adjustable by the user to test scenarios.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#0d1627] p-10 border-l border-slate-800">
            <h2 className="text-2xl font-bold text-teal-400 mb-8 text-center">Future<br/>Expansion</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
                <p className="text-slate-300 text-sm">Machine Learning-based outbreak forecasting</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
                <p className="text-slate-300 text-sm">Real-time integration with WHO / CDC data feeds</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
                <p className="text-slate-300 text-sm">Mobile-responsive progressive web app</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
                <p className="text-slate-300 text-sm">Multi-region simultaneous simulation</p>
              </div>
            </div>
          </div>
        </div>

        {/* SDG GOALS SECTION */}
        <div className="bg-[#1a1a1a] rounded-2xl p-10 shadow-xl border border-slate-800">
          <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3">
            <Target className="w-7 h-7 text-white" /> SDG Goals for the simulation model
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg text-slate-300 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div> SDG 3 · Good Health & Well-being
              </h3>
              <p className="text-slate-400 pl-4 leading-relaxed">
                Stronger health systems increase the recovery rate (γ), reducing disease burden and duration of outbreaks.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-slate-300 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div> SDG 6 · Clean Water & Sanitation
              </h3>
              <p className="text-slate-400 pl-4 leading-relaxed">
                Improved sanitation directly lowers the infection transmission rate (β), slowing the spread at its source.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-slate-300 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div> SDG 10 · Reduced Inequalities
              </h3>
              <p className="text-slate-400 pl-4 leading-relaxed">
                Closing equity gaps ensures uniform treatment access across populations, preventing marginalised groups from becoming persistent reservoirs.
              </p>
            </div>
          </div>
        </div>

        {/* CONCLUSION & REFERENCES SECTION */}
        <div>
          <div className="bg-[#0a1120] rounded-t-2xl p-6 border border-b-0 border-slate-800">
            <h2 className="text-3xl font-bold text-white">Conclusion & References</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 rounded-b-2xl overflow-hidden border border-slate-800">
            <div className="bg-[#0a1120] p-10 border-r border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-teal-500 mb-6">Conclusion</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-800 p-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      The platform bridges mathematical modeling and interactive visualization for intuitive disease spread understanding.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-800 p-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      The integrated chatbot enhances user engagement and provides contextual disease awareness at every step.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-800 p-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Future expansion via ML-driven forecasting and live data feeds will further enhance its real-world applicability.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-12 bg-teal-500 py-3 px-6 rounded text-center">
                <span className="text-white font-bold text-lg">Thank you for your attention — Questions are welcome!</span>
              </div>
            </div>
            <div className="bg-[#0d1627] p-10">
              <h3 className="text-xl font-bold text-teal-500 mb-6">References</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
                  <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                  <p className="text-slate-400 text-sm leading-relaxed">
                    [1] W. O. Kermack and A. G. McKendrick, "A Contribution to the Mathematical Theory of Epidemics," Proc. R. Soc. London A, vol. 115, no. 772, pp. 700-721, 1927.
                  </p>
                </div>
                <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
                  <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                  <p className="text-slate-400 text-sm leading-relaxed">
                    [2] World Health Organization, "Dengue and Severe Dengue," WHO Fact Sheet, 2023.
                  </p>
                </div>
                <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
                  <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                  <p className="text-slate-400 text-sm leading-relaxed">
                    [3] J. Ma and D. Earn, "Generality of the Final Size Formula," Bull. Math. Biol., vol. 68, no. 3, pp. 679-702, 2006.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
