import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

interface HomeProps {
  onSelectTool?: (toolId: string) => void;
  onNavigate: (page: string) => void;
}

const categories = [
  'All Categories',
  '3D Printing & Fabrication',
  'Power Tools & Carpentry',
  'Gardening & Outdoor',
  'Home Improvement',
  'Photography & Video'
];

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { setFilterState } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Neighborhoods');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterState({
      searchQuery: searchTerm,
      category: selectedCat === 'All Categories' ? 'All Categories' : selectedCat
    });
    onNavigate('browse');
  };

  return (
    <div className="min-h-screen pb-20 bg-white text-slate-900 animate-in fade-in duration-300">
      {/* Full-Screen Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/50 min-h-screen flex flex-col justify-start lg:justify-center py-6 sm:py-10 lg:py-0 px-4 sm:px-6 lg:px-8">

        {/* Background Image scoped to Hero only */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-slate-50">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530124566582-a618bc2615dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-40 lg:opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
        </div>

        <div className="relative pt-2 pb-6 flex justify-center items-center z-20 lg:absolute lg:top-3 lg:left-0 lg:w-full lg:pt-0 lg:pb-0">
          <img src="/logo-full.png?v=assetex_v7" alt="ASSETEX Logo" className="h-28 sm:h-40 lg:h-52 max-w-[92%] sm:max-w-[85%] lg:max-w-none w-auto object-contain drop-shadow-lg cursor-pointer hover:scale-105 transition-all duration-200" onClick={() => {
            setFilterState({
              searchQuery: '',
              category: 'All Categories',
              sortBy: 'rating',
              maxPrice: Infinity,
              locations: []
            });
            onNavigate('browse');
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">

          {/* LEFT SIDE (Half): Site Info & Mission */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                Peer-to-Peer Equipment Sharing
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-black tracking-tight text-slate-900 leading-[1.05]">
                Borrow any tool. <br />
                <span className="text-slate-500">
                  Earn from the ones<br /> you own.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                Why spend hundreds on specialized equipment you'll only use twice a year?
                Assetex connects local makers, craftsmen, and homeowners so you can rent industrial-grade tools right down the street.
              </p>
            </div>

            {/* Clean, high-impact trust highlights without flooding the page */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs sm:text-sm font-semibold text-slate-600 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ₹80,000+ Damage Protection
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Zero Upfront Checkout
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-slate-800" />
                Verified Neighbors
              </span>
            </div>
          </div>

          {/* RIGHT SIDE (Half): Searching Options (Equipment Finder Card) */}
          <div className="lg:col-span-6 space-y-6 relative z-10">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-[-15px_0_40px_rgba(0,0,0,0.06)] space-y-6 text-left border border-slate-100">
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  What equipment do you need?
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Search local peer-to-peer listings from verified owners in your neighborhood.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-5">
                {/* Tool Name Input */}
                <div className="space-y-1.5">
                  <label className="text-base sm:text-lg font-black text-slate-900 tracking-tight block">
                    Tool Name
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Prusa 3D Printer, Chainsaw, Tile Cutter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-md bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Category & Location Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                      Category
                    </label>
                    <div className="relative">
                      <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedCat}
                        onChange={(e) => setSelectedCat(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 rounded-md bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none cursor-pointer transition-all shadow-sm"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                      Neighborhood
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 rounded-md bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none cursor-pointer transition-all shadow-sm"
                      >
                        <option value="All Neighborhoods">All Neighborhoods</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Pune">Pune</option>
                        <option value="Nagpur">Nagpur</option>
                        <option value="Nashik">Nashik</option>
                        <option value="Aurangabad">Aurangabad</option>
                        <option value="Solapur">Solapur</option>
                        <option value="Amravati">Amravati</option>
                        <option value="Kolhapur">Kolhapur</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CTA Button & Lend Link */}
                <div className="flex flex-col items-center gap-3 mt-4">
                  <button
                    type="submit"
                    className="btn-primary !rounded-md w-full py-4 text-base bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-sm border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <span>Find Available Equipment →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('add-tool')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer"
                  >
                    Lend Equipment
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Scroll Down Arrow Button */}
        <div className="w-full flex flex-col items-center justify-center gap-1 mt-10 lg:mt-0 lg:absolute lg:bottom-8 lg:left-0 animate-bounce z-20">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('below-hero');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center hover:border-blue-500 hover:shadow-xl transition-all group"
            aria-label="Scroll down for more"
          >
            <ChevronDown className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
          </button>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explore More</span>
        </div>
      </section>

      {/* Content below the fold */}
      <div id="below-hero" className="space-y-20 pt-20">

        {/* How It Works 3-Step Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Simple & Secure Process</span>
            <h2 className="text-3xl font-black text-slate-900">How Assetex Works</h2>
            <p className="text-sm sm:text-base text-slate-600">
              Whether you need a heavy-duty router for a weekend project or want to earn daily passive income from your table saw, our platform makes peer-to-peer sharing effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 border-b-2 border-b-slate-300/80 shadow-card hover:shadow-elevated relative overflow-hidden group transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                Find & Browse Tools
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search equipment listed by verified owners right in your neighborhood. Review daily rental rates, high-resolution photos, exact tool specs, and owner response times.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 border-b-2 border-b-slate-300/80 shadow-card hover:shadow-elevated relative overflow-hidden group transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200 font-extrabold text-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                Request to Rent
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Select your exact project dates and send a booking request with a brief note. <strong>No upfront checkout is required</strong> — you only pay once the owner approves your dates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 border-b-2 border-b-slate-300/80 shadow-card hover:shadow-elevated relative overflow-hidden group transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-blue-600 border border-slate-200 font-extrabold text-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                Pick Up & Create
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Once confirmed, coordinate a quick neighborhood pickup. Complete your DIY project, then return the equipment cleanly on the agreed date.
              </p>
            </div>
          </div>

          {/* Safety, Deposits & Lending Rules Section */}
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Safety, Deposits & Lending Rules</h3>
              <p className="text-sm text-slate-500 max-w-xl mx-auto">Everything you need to know before your first rental.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Damage Protection</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Every rental is backed by ₹80,000+ damage protection. Accidents happen — you're covered from the moment you pick up to the moment you return.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Refundable Deposits</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Owners may set an optional refundable deposit. It's held securely and returned in full once the equipment comes back in good condition.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Lending Rules</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Owners approve every request manually. Late returns incur a daily fee. All users are ID-verified and community-rated for mutual trust.
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => onNavigate('how-it-works')}
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
              >
                Read the full policy & FAQ
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Lender Value Prop Callout Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 border-b-2 border-b-slate-300/80 rounded-3xl p-8 sm:p-12 text-slate-900 shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-left">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider">
                Unified Renter & Lender Account
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Got tools collecting dust? Turn them into passive income.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Most drills, saws, and 3D printers sit idle 95% of the year. List your equipment on Assetex, set your daily rate, approve requests on your schedule, and earn while helping local makers.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-500">
                <span>• Free to list anytime</span>
                <span>• You approve every renter</span>
                <span>• Optional refundable deposits</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() => onNavigate('add-tool')}
                className="btn-primary py-4 px-8 text-base bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-sm border border-slate-700"
              >
                List Your First Tool →
              </button>
              <button
                onClick={() => onNavigate('how-it-works')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-sm text-center transition-all"
              >
                Read Lender FAQ
              </button>
            </div>
          </div>
        </section>
      </div>{/* end below-hero */}
    </div>
  );
};
