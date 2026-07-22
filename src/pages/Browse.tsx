import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ToolCard } from '../components/ToolCard';
import type { FilterState } from '../types';
import { 
  Wrench, 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  MapPin, 
  Tag, 
  IndianRupee, 
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface BrowseProps {
  onSelectTool: (toolId: string) => void;
}

const AVAILABLE_CATEGORIES = [
  'All Categories',
  '3D Printing & Fabrication',
  'Power Tools & Carpentry',
  'Gardening & Outdoor',
  'Home Improvement',
  'Photography & Video'
];

const AVAILABLE_LOCATIONS = [
  'Mumbai',
  'Pune',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Solapur',
  'Amravati',
  'Kolhapur'
];

const SORT_OPTIONS: Array<{ id: FilterState['sortBy']; label: string }> = [
  { id: 'rating', label: 'Highest Rated (★)' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'distance', label: 'Nearest First' }
];

export const Browse: React.FC<BrowseProps> = ({ onSelectTool }) => {
  const { listings, filterState, setFilterState, resetFilters } = useApp();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Collapsible section states for sidebar
  const [openSections, setOpenSections] = useState({
    sort: true,
    category: true,
    price: true,
    location: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredListings = useMemo(() => {
    return listings.filter(tool => {
      // search query match
      if (filterState.searchQuery) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesTitle = tool.title.toLowerCase().includes(query);
        const matchesDesc = tool.shortDescription.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query);
        const matchesCat = tool.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // category match
      if (filterState.category && filterState.category !== 'All Categories') {
        if (tool.category !== filterState.category) return false;
      }

      // max price
      if (tool.dailyRate > filterState.maxPrice) {
        return false;
      }

      // location match (multi-select)
      if (filterState.locations && filterState.locations.length > 0) {
        if (!filterState.locations.includes(tool.location)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'price-asc') {
        return a.dailyRate - b.dailyRate;
      }
      if (filterState.sortBy === 'price-desc') {
        return b.dailyRate - a.dailyRate;
      }
      if (filterState.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [listings, filterState]);

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.category && filterState.category !== 'All Categories') count++;
    if (filterState.locations && filterState.locations.length > 0) count++;
    if (filterState.maxPrice !== Infinity) count++;
    if (filterState.sortBy !== 'rating') count++;
    return count;
  }, [filterState]);

  const FilterSidebarContent = () => (
    <div className="flex flex-col h-full min-h-0 bg-white text-slate-800">
      {/* Sidebar Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span className="font-extrabold text-navy-900 text-sm tracking-tight">Filters & Sorting</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-extrabold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={resetFilters}
          type="button"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-brand-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Scrollable Body - Has its own independent scrollbar */}
      <div className="p-5 overflow-y-auto space-y-6 flex-1 min-h-0 divide-y divide-slate-100">
        
        {/* Section 1: Sort By */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => toggleSection('sort')}
            className="w-full flex items-center justify-between py-1 text-xs font-extrabold text-slate-400 uppercase tracking-wider group"
          >
            <span className="flex items-center gap-1.5 text-navy-900 font-bold text-xs group-hover:text-brand-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-500" />
              Sort By
            </span>
            {openSections.sort ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.sort && (
            <div className="mt-3 space-y-1.5">
              {SORT_OPTIONS.map(opt => {
                const isSelected = filterState.sortBy === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setFilterState({ sortBy: opt.id })}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-50/80 text-brand-700 font-bold border border-brand-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900 border border-transparent'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Category */}
        <div className="pt-5">
          <button
            type="button"
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between py-1 text-xs font-extrabold text-slate-400 uppercase tracking-wider group"
          >
            <span className="flex items-center gap-1.5 text-navy-900 font-bold text-xs group-hover:text-brand-600">
              <Tag className="w-3.5 h-3.5 text-brand-500" />
              Category
            </span>
            {openSections.category ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.category && (
            <div className="mt-3 space-y-1 max-h-56 overflow-y-auto pr-1">
              {AVAILABLE_CATEGORIES.map(cat => {
                const isSelected = filterState.category === cat || (!filterState.category && cat === 'All Categories');
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterState({ category: cat })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-navy-900 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 font-medium hover:text-navy-900'
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Daily Rate Price */}
        <div className="pt-5">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-1 text-xs font-extrabold text-slate-400 uppercase tracking-wider group"
          >
            <span className="flex items-center gap-1.5 text-navy-900 font-bold text-xs group-hover:text-brand-600">
              <IndianRupee className="w-3.5 h-3.5 text-brand-500" />
              Max Daily Rate
            </span>
            {openSections.price ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.price && (
            <div className="mt-3 space-y-4 px-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Up to:</span>
                <span className="text-sm font-extrabold text-navy-900 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                  {filterState.maxPrice === Infinity ? 'Max' : `₹${filterState.maxPrice} / day`}
                </span>
              </div>

              <input
                type="range"
                min={500}
                max={10000}
                step={500}
                value={filterState.maxPrice === Infinity ? 10000 : filterState.maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFilterState({ maxPrice: val >= 10000 ? Infinity : val });
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>₹500</span>
                <span>₹5,000</span>
                <span>₹10,000+</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Location */}
        <div className="pt-5">
          <button
            type="button"
            onClick={() => toggleSection('location')}
            className="w-full flex items-center justify-between py-1 text-xs font-extrabold text-slate-400 uppercase tracking-wider group"
          >
            <span className="flex items-center gap-1.5 text-navy-900 font-bold text-xs group-hover:text-brand-600">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              Location
            </span>
            {openSections.location ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.location && (
            <div className="mt-3 space-y-1">
              {AVAILABLE_LOCATIONS.map(loc => {
                const isSelected = filterState.locations?.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      const newLocations = isSelected
                        ? (filterState.locations || []).filter(l => l !== loc)
                        : [...(filterState.locations || []), loc];
                      setFilterState({ locations: newLocations });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-brand-700 font-bold border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 font-medium hover:text-navy-900 border border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{loc}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Bar spanning full width above grid (Desktop) */}
      <div className="hidden lg:flex items-center justify-between bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-navy-900">
            Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          </span>
          {filterState.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-bold">
              "{filterState.searchQuery}"
              <X 
                className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" 
                onClick={() => setFilterState({ searchQuery: '' })} 
              />
            </span>
          )}
          {filterState.category && filterState.category !== 'All Categories' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
              {filterState.category}
              <X 
                className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" 
                onClick={() => setFilterState({ category: 'All Categories' })} 
              />
            </span>
          )}
          {filterState.locations?.map((loc) => (
            <span key={loc} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              {loc}
              <X 
                className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" 
                onClick={() => setFilterState({ 
                  locations: filterState.locations?.filter(l => l !== loc) || []
                })} 
              />
            </span>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Sorted by: <strong className="text-navy-900 font-bold">{SORT_OPTIONS.find(o => o.id === filterState.sortBy)?.label || 'Highest Rated'}</strong>
        </div>
      </div>

      {/* Mobile Header Bar & Search / Filter Button */}
      <div className="lg:hidden mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-extrabold text-navy-900">
              {filteredListings.length} {filteredListings.length === 1 ? 'tool available' : 'tools available'}
            </span>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>Filter & Sort</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Collapsible Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="lg:hidden bg-white rounded-3xl border border-slate-200 shadow-elevated overflow-hidden max-h-[70vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            <FilterSidebarContent />
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                type="button"
                className="btn-primary py-2 px-6 text-xs font-bold w-full"
              >
                Show {filteredListings.length} Results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout: Left Sidebar docked to left edge + Right Grid taking remaining width */}
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        
        {/* DESKTOP SIDEBAR docked to left side */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start z-30">
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-soft overflow-hidden flex flex-col h-[calc(100vh-6.5rem)] max-h-[800px]">
            <FilterSidebarContent />
          </div>
        </aside>

        {/* RIGHT COLUMN: Tool Listings Grid filling all remaining horizontal space */}
        <main className="flex-1 min-w-0 w-full">
          
          {/* Grid of Listings */}
          {filteredListings.length > 0 ? (
            <div className={
              filteredListings.length === 1 
                ? "max-w-[360px] sm:max-w-[400px] mx-auto lg:mx-0" 
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 sm:gap-8"
            }>
              {filteredListings.map(tool => (
                <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-soft">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Wrench className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">No equipment matches your criteria</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We couldn't find any listings matching your current filter selection under ₹{filterState.maxPrice}/day. Try adjusting the sidebar filters on the left.
              </p>
              <button
                onClick={resetFilters}
                type="button"
                className="btn-primary py-2.5 px-6 text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
