import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCategoryIcon } from '../components/ToolCard';
import { 
  Plus,
  Wrench, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  CheckCircle2,
  Edit3,
  X,
  IndianRupee
} from 'lucide-react';

interface MyListingsProps {
  onNavigate: (page: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const MyListings: React.FC<MyListingsProps> = ({ onNavigate, onSelectTool }) => {
  const { user, listings, bookings, toggleListingStatus, deleteListing, updateListing } = useApp();

  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [editDailyRate, setEditDailyRate] = useState<string>('');
  const [editHourlyRate, setEditHourlyRate] = useState<string>('');
  const [editDeposit, setEditDeposit] = useState<string>('');
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);

  const openPricingModal = (tool: any) => {
    setEditingPricingId(tool.id);
    setEditDailyRate(tool.dailyRate.toString());
    setEditHourlyRate(tool.hourlyRate ? tool.hourlyRate.toString() : '');
    setEditDeposit(tool.deposit ? tool.deposit.toString() : '');
  };

  const handlePricingSubmit = async () => {
    if (!editingPricingId || !editDailyRate) return;
    setIsUpdatingPricing(true);
    try {
      await updateListing(editingPricingId, {
        dailyRate: Number(editDailyRate),
        hourlyRate: editHourlyRate ? Number(editHourlyRate) : undefined,
        deposit: editDeposit ? Number(editDeposit) : undefined
      });
      setEditingPricingId(null);
    } catch (err) {
      console.error('Failed to update pricing', err);
    } finally {
      setIsUpdatingPricing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Please Log In</h2>
        <p className="text-slate-600">You must be logged in to view your listed tools.</p>
        <button onClick={() => onNavigate('login')} className="btn-primary">Go to Login</button>
      </div>
    );
  }

  const myListings = listings.filter(l => Boolean(
    user && (
      l.ownerId === user.id ||
      l.owner?.id === user.id ||
      (user.name && l.owner?.name && user.name.trim().toLowerCase() === l.owner.name.trim().toLowerCase())
    )
  ));

  const totalPendingRequests = bookings.filter(b => myListings.some(l => l.id === b.toolId) && b.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            Lender Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">My Tool Listings ({myListings.length})</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your equipment availability, pricing, and active rentals.
          </p>
        </div>

        <button
          onClick={() => onNavigate('add-tool')}
          className="btn-primary py-3 px-6 gap-2 text-sm shadow-md shadow-brand-600/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Add New Tool
        </button>
      </div>

      {totalPendingRequests > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
              {totalPendingRequests}
            </span>
            <div>
              <h3 className="text-base font-extrabold text-navy-900">Incoming Rental Applications Need Your Approval!</h3>
              <p className="text-xs text-amber-900">Neighbors have requested dates to borrow your equipment. Review and accept/decline right now.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('booking-requests')}
            className="btn-primary py-2.5 px-5 bg-amber-600 hover:bg-amber-700 border-amber-500 text-xs shadow-sm whitespace-nowrap"
          >
            Review Applications →
          </button>
        </div>
      )}

      {myListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map(tool => {
            const pendingToolBookings = bookings.filter(b => b.toolId === tool.id && b.status === 'Pending').length;
            return (
            <div 
              key={tool.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-soft flex flex-col justify-between transition-all ${
                tool.status === 'inactive' ? 'border-slate-300 opacity-85 bg-slate-50/50' : 'border-slate-200/80 hover:border-brand-300'
              }`}
            >
              <div>
                {pendingToolBookings > 0 && (
                  <button
                    onClick={() => onNavigate('booking-requests')}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    🔔 {pendingToolBookings} Pending Request{pendingToolBookings > 1 ? 's' : ''} — Review Now →
                  </button>
                )}
                {/* Image header */}
                <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                  <img src={tool.image} alt={tool.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-navy-800 shadow-sm flex items-center gap-1.5 border border-slate-100">
                      {getCategoryIcon(tool.category)}
                      {tool.category.split('&')[0].trim()}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                      tool.status === 'active' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-600 text-white'
                    }`}>
                      {tool.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {tool.status}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-navy-900/90 text-white px-3 py-1 rounded-xl text-sm font-extrabold shadow-md">
                    ₹{tool.dailyRate} <span className="text-[10px] text-slate-300 font-normal">/ day</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {tool.location.split('—')[1] || tool.location}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-navy-800">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {tool.rating} ({tool.reviewCount})
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectTool(tool.id)}
                    className="font-bold text-navy-900 text-base leading-snug line-clamp-2 hover:text-brand-600 cursor-pointer transition-colors"
                  >
                    {tool.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={async () => await toggleListingStatus(tool.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tool.status === 'active' 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {tool.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {tool.status === 'active' ? 'Pause Listing' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPricingModal(tool)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                    title="Edit Pricing"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Price
                  </button>

                  <button
                    onClick={() => onSelectTool(tool.id)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                    title="View detail page"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete "${tool.title}"?`)) {
                        await deleteListing(tool.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-semibold"
                    title="Delete listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-navy-900">You haven't listed any tools yet</h3>
          <p className="text-sm text-slate-600">
            Earn ₹2,000 - ₹6,500 per day by sharing equipment you aren't currently using with trusted neighbors.
          </p>
          <button
            onClick={() => onNavigate('add-tool')}
            className="btn-primary"
          >
            + Add Your First Tool Listing
          </button>
          </button>
        </div>
      )}

      {/* Edit Pricing Modal */}
      {editingPricingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-brand-600" />
                Edit Pricing
              </h3>
              <button 
                onClick={() => setEditingPricingId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy-900 block">Daily Rate (₹) *</label>
                <input 
                  type="number"
                  value={editDailyRate}
                  onChange={(e) => setEditDailyRate(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 500"
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy-900 block">Hourly Rate (₹) <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="number"
                  value={editHourlyRate}
                  onChange={(e) => setEditHourlyRate(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 100"
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy-900 block">Security Deposit (₹) <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="number"
                  value={editDeposit}
                  onChange={(e) => setEditDeposit(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 2000"
                  min="0"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={handlePricingSubmit}
                  disabled={!editDailyRate || isUpdatingPricing}
                  className="btn-primary w-full py-3.5"
                >
                  {isUpdatingPricing ? 'Saving...' : 'Save Pricing Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
