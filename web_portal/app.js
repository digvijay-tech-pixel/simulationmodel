const { useState, useEffect } = React;

// Main App Component
function App() {
    // Basic routing state: 'home', 'viewer', 'publisher'
    const [currentRoute, setCurrentRoute] = useState('home');
    
    // Shared state (in a real app, this would be in a DB)
    const [simulationData, setSimulationData] = useState({
        diseaseType: 'Viral',
        transmission: 'Airborne',
        r0: '2.5-4.0',
        totalCases: '770 million',
        deaths: '6.9 million',
        mortality: '8.96%',
        origin: 'China',
        citations: '891',
        scientificNotes: 'Multiple effective vaccines developed in record time using mRNA and viral vector platforms. Antiviral treatments (Paxlovid, molnupiravir) reduce severe outcomes. Long COVID affects significant proportion of survivors.',
        transmissionNotes: 'Spreads primarily through respiratory droplets and aerosols when an infected person breathes, speaks, coughs, or sneezes. Can also spread by touching contaminated surfaces and then touching the face.',
        preventionNotes: 'Vaccination is highly effective in preventing severe disease. Other measures include wearing masks in crowded indoor settings, maintaining physical distance.',
        symptomsNotes: 'Common symptoms include fever, cough, fatigue, loss of taste or smell. Some patients experience shortness of breath, body aches, headache, sore throat, congestion, nausea, or diarrhea. Symptoms may appear 2-14 days after exposure.'
    });

    useEffect(() => {
        // Initialize lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    const handleLogin = (role) => {
        setCurrentRoute(role);
    };

    const handleLogout = () => {
        setCurrentRoute('home');
    };

    return (
        <div>
            {currentRoute === 'home' && <Home onLogin={handleLogin} />}
            {currentRoute === 'viewer' && <ViewerDashboard data={simulationData} onLogout={handleLogout} />}
            {currentRoute === 'publisher' && <PublisherDashboard data={simulationData} setData={setSimulationData} onLogout={handleLogout} />}
        </div>
    );
}

function Home({ onLogin }) {
    return (
        <div className="auth-container">
            <h1 className="auth-title">Disease Spread Simulation Platform</h1>
            <p className="auth-subtitle">Welcome to the central portal for monitoring and updating global epidemiological models.</p>
            
            <div className="auth-buttons">
                <div className="auth-btn" onClick={() => onLogin('viewer')}>
                    <i data-lucide="globe" style={{width: '48px', height: '48px', color: '#0ea5e9'}}></i>
                    <h2>Login as Viewer</h2>
                    <p style={{fontSize: '0.9rem', color: '#94a3b8'}}>Monitor live simulations and view disease data.</p>
                </div>
                
                <div className="auth-btn" onClick={() => onLogin('publisher')}>
                    <i data-lucide="microscope" style={{width: '48px', height: '48px', color: '#22c55e'}}></i>
                    <h2>Login as Publisher</h2>
                    <p style={{fontSize: '0.9rem', color: '#94a3b8'}}>Publish research and update simulation parameters.</p>
                </div>
            </div>
        </div>
    );
}

function ViewerDashboard({ data, onLogout }) {
    const [day, setDay] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Simple simulation playback loop
    useEffect(() => {
        let interval;
        if (isPlaying && day < 180) {
            interval = setInterval(() => {
                setDay(prev => prev + 1);
            }, 100);
        } else if (day >= 180) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, day]);

    return (
        <div>
            <nav className="dashboard-nav">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <i data-lucide="activity" style={{color: '#0ea5e9'}}></i>
                    <h2>Viewer Dashboard</h2>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </nav>

            <div className="dashboard-content">
                {/* Left Column: Map & Simulation */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="glass-card map-container" style={{padding: 0}}>
                        <div className="map-header">
                            <div className="map-title">
                                <div className="map-icon">
                                    <i data-lucide="globe-2" color="white"></i>
                                </div>
                                <div>
                                    <h3 style={{fontSize: '1.25rem'}}>Global Spread Visualization</h3>
                                    <p style={{color: '#94a3b8', fontSize: '0.85rem'}}>Origin: {data.origin} • 1 countries affected</p>
                                </div>
                            </div>
                            <div className="day-counter">
                                <span>DAY</span>
                                <strong>{day}</strong>
                            </div>
                        </div>

                        {/* Abstract Map Background */}
                        <svg className="world-map-svg" viewBox="0 0 1000 500">
                            {/* Simplified world map shapes */}
                            <path d="M100,100 C150,80 200,120 250,100 C300,150 200,200 150,250 Z" fill="#334155"/>
                            <path d="M400,100 C450,50 600,80 650,150 C700,250 500,300 450,250 Z" fill="#334155"/>
                            {/* Animated Origin Zone */}
                            <circle cx="600" cy="180" r="30" className="infected-zone" />
                        </svg>

                        <div className="map-controls">
                            <button className={`map-control-btn ${isPlaying ? 'active' : ''}`} onClick={() => setIsPlaying(!isPlaying)}>
                                <i data-lucide={isPlaying ? "pause" : "play"} size="20"></i>
                            </button>
                            <button className="map-control-btn" onClick={() => {setDay(0); setIsPlaying(false);}}>
                                <i data-lucide="rotate-ccw" size="20"></i>
                            </button>
                        </div>

                        <div className="sim-bottom-bar">
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <span style={{color: '#0ea5e9'}}>●</span>
                                <strong>SIR • COVID-19</strong>
                            </div>
                            
                            <div className="sim-metrics">
                                <div className="metric">
                                    <span className="metric-label">PEAK DAY</span>
                                    <span className="metric-value" style={{color: '#ef4444'}}>D57</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">PEAK INFECTED</span>
                                    <span className="metric-value" style={{color: '#ef4444'}}>2.75M</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">POPULATION</span>
                                    <span className="metric-value" style={{color: '#0ea5e9'}}>8.00M</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">R₀</span>
                                    <span className="metric-value" style={{color: '#eab308'}}>{data.r0}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">RECOVERY</span>
                                    <span className="metric-value" style={{color: '#22c55e'}}>96.1%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 className="card-title">Scientific Notes</h3>
                        <p style={{lineHeight: '1.6', color: '#cbd5e1'}}>{data.scientificNotes}</p>
                    </div>

                    <div className="glass-card">
                        <h3 className="card-title">Transmission</h3>
                        <p style={{lineHeight: '1.6', color: '#cbd5e1'}}>{data.transmissionNotes}</p>
                    </div>

                    <div className="glass-card">
                        <h3 className="card-title">Symptoms</h3>
                        <p style={{lineHeight: '1.6', color: '#cbd5e1'}}>{data.symptomsNotes}</p>
                    </div>
                </div>

                {/* Right Column: Info Panels */}
                <div>
                    <div className="glass-card">
                        <h3 className="card-title">Quick Facts</h3>
                        <div className="fact-row">
                            <span className="fact-label">DISEASE TYPE</span>
                            <span className="fact-value">{data.diseaseType}</span>
                        </div>
                        <div className="fact-row">
                            <span className="fact-label">TRANSMISSION</span>
                            <span className="fact-value">{data.transmission}</span>
                        </div>
                        <div className="fact-row">
                            <span className="fact-label">R₀</span>
                            <span className="fact-value highlight-blue">{data.r0}</span>
                        </div>
                        <div className="fact-row">
                            <span className="fact-label">TOTAL CASES</span>
                            <span className="fact-value highlight-blue">{data.totalCases}</span>
                        </div>
                        <div className="fact-row">
                            <span className="fact-label">DEATHS</span>
                            <span className="fact-value highlight-red">{data.deaths}</span>
                        </div>
                        <div className="fact-row">
                            <span className="fact-label">MORTALITY</span>
                            <span className="fact-value highlight-yellow">{data.mortality}</span>
                        </div>
                        <div className="fact-row">
                            <span className="fact-label">ORIGIN</span>
                            <span className="fact-value">{data.origin}</span>
                        </div>
                        <div className="fact-row">
                            <span className="fact-label">CITATIONS</span>
                            <span className="fact-value highlight-blue">{data.citations}</span>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 className="card-title">Data Sources</h3>
                        <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Johns Hopkins University, WHO COVID-19 Dashboard, Our World in Data, CDC</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PublisherDashboard({ data, setData, onLogout }) {
    // Form state
    const [formData, setFormData] = useState(data);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setData(formData);
        alert("Research successfully published to the simulation model!");
    };

    return (
        <div>
            <nav className="dashboard-nav">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <i data-lucide="microscope" style={{color: '#22c55e'}}></i>
                    <h2>Publisher Dashboard</h2>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-content" style={{gridTemplateColumns: '1fr', maxWidth: '800px'}}>
                <div className="glass-card">
                    <h3 className="card-title">Publish Research Updates</h3>
                    <p style={{color: '#94a3b8', marginBottom: '2rem'}}>Update the core parameters of the epidemiological model. Your changes will reflect instantly on the Viewer Dashboard.</p>
                    
                    <form className="publisher-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Basic Reproduction Number (R₀)</label>
                            <input type="text" name="r0" value={formData.r0} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Total Cases</label>
                            <input type="text" name="totalCases" value={formData.totalCases} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Total Deaths</label>
                            <input type="text" name="deaths" value={formData.deaths} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Mortality Rate</label>
                            <input type="text" name="mortality" value={formData.mortality} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Scientific Notes</label>
                            <textarea name="scientificNotes" rows="4" value={formData.scientificNotes} onChange={handleChange}></textarea>
                        </div>
                        <div className="form-group">
                            <label>Transmission Details</label>
                            <textarea name="transmissionNotes" rows="4" value={formData.transmissionNotes} onChange={handleChange}></textarea>
                        </div>
                        
                        <button type="submit" className="submit-btn">Publish to Simulation Model</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
