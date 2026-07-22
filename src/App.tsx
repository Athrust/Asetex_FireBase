
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { ToolDetail } from './pages/ToolDetail';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { MyListings } from './pages/MyListings';
import { AddTool } from './pages/AddTool';
import { MyBookings } from './pages/MyBookings';
import { BookingRequests } from './pages/BookingRequests';
import { Profile } from './pages/Profile';
import { AssetCash } from './pages/AssetCash';

const MainContent: React.FC = () => {
  const { user, isLoading, error, retryConnection } = useApp();

  // Restore page state from localStorage on mount
  const [activePage, setActivePage] = useState<string>(() => {
    const saved = localStorage.getItem('assetex_active_page');
    return saved || 'home';
  });
  const [selectedToolId, setSelectedToolId] = useState<string | null>(() => {
    return localStorage.getItem('assetex_selected_tool') || null;
  });
  // When a user is not logged in and clicks a tool, we remember it so we can redirect after login
  const [pendingToolId, setPendingToolId] = useState<string | null>(null);

  // Persist navigation state to localStorage
  useEffect(() => {
    localStorage.setItem('assetex_active_page', activePage);
    if (selectedToolId) {
      localStorage.setItem('assetex_selected_tool', selectedToolId);
    } else {
      localStorage.removeItem('assetex_selected_tool');
    }
  }, [activePage, selectedToolId]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, selectedToolId]);

  // After user logs in or signs up, redirect to the pending tool if any
  useEffect(() => {
    if (user && pendingToolId) {
      setSelectedToolId(pendingToolId);
      setActivePage('tool-detail');
      setPendingToolId(null);
    }
  }, [user, pendingToolId]);

  const handleSelectTool = useCallback((toolId: string) => {
    if (!user) {
      // Not logged in — remember the tool and redirect to login
      setPendingToolId(toolId);
      setSelectedToolId(null);
      setActivePage('login');
      return;
    }
    setSelectedToolId(toolId);
    setActivePage('tool-detail');
  }, [user]);

  const handleNavigate = useCallback((page: string) => {
    setSelectedToolId(null);
    setActivePage(page);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigate}
        setSelectedToolId={setSelectedToolId}
      />

      <main className="flex-1">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-slate-500 font-medium">Connecting to Database...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in zoom-in duration-300">
            <div className="text-red-500 bg-red-50 p-4 rounded-full">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-slate-700 font-medium text-lg">{error}</p>
            <button 
              onClick={retryConnection}
              className="mt-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {activePage === 'home' && (
              <Home onSelectTool={handleSelectTool} onNavigate={handleNavigate} />
            )}
            {activePage === 'browse' && (
              <Browse onSelectTool={handleSelectTool} />
            )}
            {activePage === 'tool-detail' && selectedToolId && (
              <ToolDetail toolId={selectedToolId} onNavigate={handleNavigate} />
            )}
            {activePage === 'how-it-works' && (
              <HowItWorks onNavigate={handleNavigate} />
            )}
            {activePage === 'login' && (
              <Login onNavigate={handleNavigate} />
            )}
            {activePage === 'signup' && (
              <SignUp onNavigate={handleNavigate} />
            )}
            {activePage === 'dashboard' && (
              <Dashboard onNavigate={handleNavigate} onSelectTool={handleSelectTool} />
            )}
            {activePage === 'my-listings' && (
              <MyListings onNavigate={handleNavigate} onSelectTool={handleSelectTool} />
            )}
            {activePage === 'add-tool' && (
              <AddTool onNavigate={handleNavigate} onSelectTool={handleSelectTool} />
            )}
            {activePage === 'my-bookings' && (
              <MyBookings onNavigate={handleNavigate} onSelectTool={handleSelectTool} />
            )}
            {activePage === 'booking-requests' && (
              <BookingRequests onNavigate={handleNavigate} onSelectTool={handleSelectTool} />
            )}
            {activePage === 'profile' && (
              <Profile onNavigate={handleNavigate} onSelectTool={handleSelectTool} />
            )}
            {activePage === 'asset-cash' && (
              <AssetCash onNavigate={handleNavigate} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 pt-16 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-800">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png?v=assetex_v7" alt="Assetex Logo" className="h-14 w-auto object-contain drop-shadow-md" />
              <span className="text-2xl font-extrabold text-white tracking-tight">Assetex</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The peer-to-peer equipment sharing marketplace. Borrow tools you need for the day, or earn extra income from the tools you own.
            </p>
            <div className="text-xs font-bold text-emerald-400">
              100% Insured & Verified Neighbors
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Explore Equipment</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => handleNavigate('browse')} className="hover:text-brand-300 transition-colors">All Categories</button></li>
              <li><button onClick={() => handleNavigate('browse')} className="hover:text-brand-300 transition-colors">3D Printing & Fabrication</button></li>
              <li><button onClick={() => handleNavigate('browse')} className="hover:text-brand-300 transition-colors">Power Tools & Carpentry</button></li>
              <li><button onClick={() => handleNavigate('browse')} className="hover:text-brand-300 transition-colors">Gardening & Outdoor</button></li>
              <li><button onClick={() => handleNavigate('browse')} className="hover:text-brand-300 transition-colors">Home Improvement</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Lending & Earning</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => handleNavigate('how-it-works')} className="hover:text-brand-300 transition-colors">How Peer-to-Peer Works</button></li>
              <li><button onClick={() => handleNavigate('add-tool')} className="hover:text-brand-300 transition-colors">List Your Tools</button></li>
              <li><button onClick={() => handleNavigate('how-it-works')} className="hover:text-brand-300 transition-colors">Insurance & Damage Protection</button></li>
              <li><button onClick={() => handleNavigate('how-it-works')} className="hover:text-brand-300 transition-colors">Service Fee Transparency</button></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Assetex Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Trust & Safety</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
