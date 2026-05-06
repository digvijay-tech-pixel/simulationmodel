import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import GlobeView from './pages/GlobeView';
import DiseaseDetails from './pages/DiseaseDetails';
import { Activity, Globe, BookOpen, LogOut, LogIn } from 'lucide-react';

function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            SimPlatform
          </Link>
          <div className="hidden md:flex gap-4">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/globe" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"><Globe className="w-4 h-4"/> Globe View</Link>
            <Link to="/details" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"><BookOpen className="w-4 h-4"/> Disease Details</Link>

          </div>
        </div>
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="text-sm text-slate-400">
                Logged in as <span className="text-indigo-400 capitalize">{role}</span>
              </span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-300 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/globe" element={<GlobeView />} />
          <Route path="/details" element={<DiseaseDetails />} />

        </Routes>
      </div>
    </Router>
  );
}
