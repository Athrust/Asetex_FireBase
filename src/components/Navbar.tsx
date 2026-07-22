import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  Search,
  PlusCircle,
  LayoutDashboard,
  ListOrdered,
  Calendar,
  User as UserIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  setSelectedToolId: (id: string | null) => void;
}

const navCategories = [
  'All',
  '3D Printing & Fabrication',
  'Power Tools & Carpentry',
  'Gardening & Outdoor',
  'Home Improvement',
  'Photography & Video'
];

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage, setSelectedToolId }) => {
  const { user, logout, listings, bookings, setFilterState } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');
  const [navCat, setNavCat] = useState('All');

  // Hide Navbar completely on the Home page as requested
  if (activePage === 'home') {
    return null;
  }

  const myToolIds = listings
    .filter(l => Boolean(user && (
      l.ownerId === user.id || 
      l.owner?.id === user.id || 
      (user.name && l.owner?.name && l.owner.name.trim().toLowerCase() === user.name.trim().toLowerCase())
    )))
    .map(l => l.id);

  // Count incoming requests that are Pending for user's tools
  const pendingIncomingRequests = bookings.filter(b => Boolean(user && b.status === 'Pending' && (
    b.ownerId === user.id ||
    (user.name && b.ownerName && user.name.trim().toLowerCase() === b.ownerName.trim().toLowerCase()) ||
    myToolIds.includes(b.toolId)
  ))).length;

  const handleNav = (page: string) => {
    setSelectedToolId(null);
    setActivePage(page);
    setUserDropdownOpen(false);
  };

  const handleLogoClick = () => {
    setSelectedToolId(null);
    setNavQuery('');
    setNavCat('All');
    setFilterState({
      searchQuery: '',
      category: 'All Categories',
      sortBy: 'rating',
      maxPrice: Infinity,
      locations: []
    });
    setActivePage('browse');
    setUserDropdownOpen(false);
  };

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterState({
      searchQuery: navQuery,
      category: navCat === 'All' ? 'All Categories' : navCat
    });
    setSelectedToolId(null);
    setActivePage('browse');
  };

  return (
    <header className="glass-header w-full shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 min-h-20 sm:min-h-24 py-2 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">

        {/* Brand Logo (Left) */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
        >
          <img src="/logo.png?v=assetex_v7" alt="Assetex Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-all duration-200" />
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center">
              Assetex
            </span>
            <span className="block text-[9px] sm:text-[10px] font-semibold text-blue-200 tracking-wider uppercase -mt-1">
              Peer-to-Peer Rentals
            </span>
          </div>
        </div>

        {/* Amazon-Style Wide Search Bar (Desktop Large Screens Only) */}
        <form
          onSubmit={handleNavSearchSubmit}
          className="flex-1 max-w-4xl hidden lg:flex items-center shadow-sm rounded-xl overflow-hidden border-2 border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all bg-white"
        >
          {/* Category Dropdown (Left side of input) */}
          <select
            value={navCat}
            onChange={(e) => setNavCat(e.target.value)}
            className="bg-slate-200/90 hover:bg-slate-300 text-slate-800 font-bold text-xs px-2.5 py-3 border-r border-slate-300 focus:outline-none cursor-pointer transition-colors max-w-[100px] truncate"
          >
            {navCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat.split('&')[0].trim()}
              </option>
            ))}
          </select>

          {/* Search Input Box */}
          <input
            type="text"
            placeholder="Search tools, 3D printers, saws, cameras..."
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          {/* Amazon-style Amber Search Button */}
          <button
            type="submit"
            className="bg-[#febd69] hover:bg-[#f3a847] active:bg-[#e39837] text-slate-950 font-extrabold px-6 py-3 transition-all flex items-center justify-center cursor-pointer border-l border-[#e39837]/30"
            title="Search Equipment"
          >
            <Search className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </button>
        </form>

        {/* Right Action Area: My Products/Rentals/ListProduct (Desktop >= 1024px), Tablet List Product, Profile (Universal) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-3 shrink-0">

            {/* My Products Option (Manage requests) */}
            <button
              onClick={() => {
                if (!user) {
                  handleNav('login');
                } else {
                  handleNav('booking-requests');
                }
              }}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl hover:bg-white/15 transition-all cursor-pointer group border border-transparent hover:border-white/20"
              title="My Products & Approvals"
            >
              <div className="relative">
                <ListOrdered className="w-7 h-7 text-white group-hover:scale-105 transition-transform stroke-[2]" />
                {pendingIncomingRequests > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-1.5 py-0.5 rounded-full border-2 border-[#7575a3] shadow-sm leading-none min-w-[1.25rem] text-center">
                    {pendingIncomingRequests}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-sm font-extrabold text-white leading-none mt-0.5 block">My Products</span>
              </div>
            </button>

            {/* My Past Rentals Option */}
            <button
              onClick={() => {
                if (!user) {
                  handleNav('login');
                } else {
                  handleNav('my-bookings');
                }
              }}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl hover:bg-white/15 transition-all cursor-pointer group border border-transparent hover:border-white/20"
              title="Past Rentals"
            >
              <div className="relative">
                <Calendar className="w-7 h-7 text-white group-hover:scale-105 transition-transform stroke-[2]" />
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-sm font-extrabold text-white leading-none mt-0.5 block">Past Rentals</span>
              </div>
            </button>

            {/* List Product Option (Desktop) */}
            <button
              onClick={() => {
                if (!user) {
                  handleNav('login');
                } else {
                  handleNav('add-tool');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-black transition-all cursor-pointer shadow-sm group border border-[#a88734]/30 shrink-0"
              title="List Your Product to Earn"
            >
              <PlusCircle className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform stroke-[2.5]" />
              <span className="text-sm font-extrabold tracking-tight leading-none">List Product</span>
            </button>
          </div>

          {/* Tablet-Specific List Product Button (Shown on sm to lg screens in top row) */}
          <button
            onClick={() => {
              if (!user) {
                handleNav('login');
              } else {
                handleNav('add-tool');
              }
            }}
            className="hidden sm:flex lg:hidden items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-black transition-all cursor-pointer shadow-sm border border-[#a88734]/30 shrink-0"
            title="List Your Product to Earn"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-extrabold tracking-tight leading-none">List Product</span>
          </button>

          {/* Account & Menu Dropdown - shifted rightmost */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-white/15 transition-all text-left border border-transparent hover:border-white/20 cursor-pointer shrink-0"
            >
              {user ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/40 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white leading-none">
                  {user ? user.name : 'Sign In'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/70 shrink-0" />
              </div>
            </button>

            {/* Dropdown containing all navigation and account options */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">

                {user ? (
                  <div className="px-4 py-3 border-b border-slate-100 mb-1 flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 truncate">{user.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 border-b border-slate-100 mb-1 flex items-center gap-2">
                    <button
                      onClick={() => handleNav('login')}
                      className="btn-primary flex-1 py-2 text-xs bg-slate-900 text-white font-bold text-center"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => handleNav('signup')}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs text-center border border-slate-200"
                    >
                      Sign Up Free
                    </button>
                  </div>
                )}

                {/* Navigation Options for Guest */}
                {!user && (
                  <div className="py-1 border-b border-slate-100">
                    <button
                      onClick={() => handleNav('how-it-works')}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3"
                    >
                      How Assetex Works
                    </button>
                  </div>
                )}

                {/* Account & Dashboard Options */}
                {user && (
                  <>
                    <div className="border-t border-slate-100 my-1 pt-1">
                      <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        My Account & Hub
                      </p>
                      <button
                        onClick={() => handleNav('asset-cash')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">₹</span>
                          Asset Cash Details
                        </span>
                        <span className="font-bold text-emerald-600">₹{user.assetCash || 0}</span>
                      </button>

                      <button
                        onClick={() => handleNav('dashboard')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        Dashboard Overview
                      </button>

                      <button
                        onClick={() => handleNav('my-bookings')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          My Bookings (Rented)
                        </span>
                      </button>

                      <button
                        onClick={() => handleNav('booking-requests')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-3">
                          <ListOrdered className="w-4 h-4 text-blue-600" />
                          Incoming Requests
                        </span>
                        {pendingIncomingRequests > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                            {pendingIncomingRequests} new
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => handleNav('my-listings')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <Wrench className="w-4 h-4 text-blue-600" />
                        My Tool Listings
                      </button>

                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        Profile & Settings
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => handleNav('how-it-works')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3"
                      >
                        How Assetex Works
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          handleNav('home');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tablet & Mobile Quick Action Bar & Search Bar (Shown on < 1024px below the top row) */}
      <div className="lg:hidden px-4 pt-2 pb-3.5 space-y-3 border-t border-white/10">
        
        {/* Mobile Grid (Small phone screens < 640px) */}
        <div className="grid sm:hidden grid-cols-3 gap-1.5">
          {/* My Products / Approvals */}
          <button
            onClick={() => {
              if (!user) {
                handleNav('login');
              } else {
                handleNav('booking-requests');
              }
            }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer border border-white/15 shadow-sm"
          >
            <div className="relative shrink-0">
              <ListOrdered className="w-4 h-4 text-white stroke-[2.5]" />
              {pendingIncomingRequests > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded-full border border-[#7575a3] shadow-sm leading-none">
                  {pendingIncomingRequests}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold tracking-tight truncate">My Products</span>
          </button>

          {/* Past Rentals / Timings */}
          <button
            onClick={() => {
              if (!user) {
                handleNav('login');
              } else {
                handleNav('my-bookings');
              }
            }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer border border-white/15 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-white stroke-[2.5] shrink-0" />
            <span className="text-[11px] font-bold tracking-tight truncate">Past Rentals</span>
          </button>

          {/* List Product */}
          <button
            onClick={() => {
              if (!user) {
                handleNav('login');
              } else {
                handleNav('add-tool');
              }
            }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#febd69] hover:bg-[#f3a847] rounded-xl text-slate-950 font-black transition-all cursor-pointer shadow-sm border border-[#a88734]/30"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950 stroke-[2.5] shrink-0" />
            <span className="text-[11px] font-black tracking-tight truncate">List Product</span>
          </button>
        </div>

        {/* Tablet Horizontal Actions (Tablet screens 640px to 1024px) */}
        <div className="hidden sm:flex items-center justify-center gap-4">
          {/* My Products / Approvals */}
          <button
            onClick={() => {
              if (!user) {
                handleNav('login');
              } else {
                handleNav('booking-requests');
              }
            }}
            className="flex items-center gap-2.5 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer border border-white/15 shadow-sm"
          >
            <div className="relative shrink-0">
              <ListOrdered className="w-5 h-5 text-white stroke-[2]" />
              {pendingIncomingRequests > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-[#7575a3] shadow-sm leading-none">
                  {pendingIncomingRequests}
                </span>
              )}
            </div>
            <div className="text-left leading-none">
              <span className="text-xs font-extrabold text-white">My Products</span>
            </div>
          </button>

          {/* Past Rentals / Timings */}
          <button
            onClick={() => {
              if (!user) {
                handleNav('login');
              } else {
                handleNav('my-bookings');
              }
            }}
            className="flex items-center gap-2.5 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer border border-white/15 shadow-sm"
          >
            <Calendar className="w-5 h-5 text-white stroke-[2] shrink-0" />
            <div className="text-left leading-none">
              <span className="text-xs font-extrabold text-white">Past Rentals</span>
            </div>
          </button>
        </div>

        {/* Full-Width Search Bar for Tablet & Mobile */}
        <form onSubmit={handleNavSearchSubmit} className="w-full max-w-3xl mx-auto flex items-center shadow-sm rounded-xl overflow-hidden border border-slate-300 bg-white">
          <input
            type="text"
            placeholder="Search equipment, cameras, drills, power tools..."
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-extrabold px-5 py-2.5 flex items-center justify-center cursor-pointer"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </header>
  );
};
