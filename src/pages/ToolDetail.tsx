import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCategoryIcon } from '../components/ToolCard';
import { 
  Star, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  Info,
  Check,
  Award,
  Building,
  Trash2,
  XCircle,
  UserCheck,
  Settings
} from 'lucide-react';

interface ToolDetailProps {
  toolId: string;
  onNavigate: (page: string) => void;
}

export const ToolDetail: React.FC<ToolDetailProps> = ({ toolId, onNavigate }) => {
  const { listings, user, bookings, requestBooking, deleteListing, updateBookingStatus } = useApp();
  const tool = listings.find(t => t.id === toolId);
  const isOwner = Boolean(
    user && tool && (
      user.id === tool.ownerId ||
      user.id === tool.owner?.id ||
      (user.name && tool.owner?.name && user.name.trim().toLowerCase() === tool.owner.name.trim().toLowerCase())
    )
  );
  const toolBookings = bookings.filter(b => b.toolId === toolId);

  const today = new Date();
  const startDefault = new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0];
  const endDefault = new Date(today.getTime() + 86400000 * 4).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startDefault);
  const [endDate, setEndDate] = useState(endDefault);
  const [rentalType, setRentalType] = useState<'daily' | 'hourly'>('daily');
  const [hours, setHours] = useState(4);
  const [message, setMessage] = useState('Hi! I have a weekend DIY project and would love to rent your equipment. I can pick up at your convenience.');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [applyAssetCash, setApplyAssetCash] = useState(true);

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Tool Not Found</h2>
        <p className="text-slate-600">The listing you're looking for might have been removed or is unavailable.</p>
        <button onClick={() => onNavigate('browse')} className="btn-primary">Back to Browse</button>
      </div>
    );
  }

  const images = tool.images && tool.images.length > 0 ? tool.images : [tool.image];

  // Calculate days & estimate
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  let totalEstimate = 0;
  if (rentalType === 'hourly' && tool.hourlyRate) {
    totalEstimate = hours * tool.hourlyRate;
  } else {
    totalEstimate = days * tool.dailyRate;
  }
  
  const platformFee = Math.round(totalEstimate * 0.1);
  const subtotal = totalEstimate + platformFee;
  const userAssetCash = user?.assetCash || 0;
  const appliedCash = applyAssetCash ? Math.min(userAssetCash, subtotal) : 0;
  const finalTotal = subtotal - appliedCash;
  const cashbackEarned = Math.round(finalTotal * 0.10);

  const handleQuickDuration = (numDays: number) => {
    const s = new Date(startDate);
    const e = new Date(s.getTime() + numDays * 86400000);
    setEndDate(e.toISOString().split('T')[0]);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login page instead of auto-logging in
      onNavigate('login');
      return;
    }
    await requestBooking(tool.id, startDate, endDate, message, rentalType, hours, appliedCash);
    setRequestSubmitted(true);
  };

  if (requestSubmitted) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-elevated border border-slate-200 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>

          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm border border-slate-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              Booking Submitted
            </span>
            <h1 className="text-3xl font-black text-slate-900">Request Sent to {tool.owner?.name || 'Owner'}!</h1>
            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
              <strong>{tool.owner?.name || 'The owner'}</strong> has received your request for <span className="font-semibold text-slate-900">"{tool.title}"</span> ({days} {days === 1 ? 'day' : 'days'}).
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-3">
            <div className="flex justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Status: <strong className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Pending Approval</strong></span>
              <span>Total Estimate: <strong className="text-slate-900">₹{finalTotal}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-900 font-semibold">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Expected response time: {tool.owner?.responseTime || 'Within 2 hours'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>No payment is processed until {tool.owner?.name || 'the owner'} approves.</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-sm border border-slate-700"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => { setRequestSubmitted(false); onNavigate('browse'); }}
              className="btn-secondary w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button 
        onClick={() => onNavigate('browse')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Browse Tools
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Photos, Description & Specs */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-soft relative">
              <img 
                src={images[activeImageIndex]} 
                alt={tool.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/1.png';
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-navy-800 shadow-sm flex items-center gap-1.5 border border-slate-100">
                  {getCategoryIcon(tool.category)}
                  {tool.category}
                </span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Basic Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="font-semibold text-navy-800">
                {tool.location}
              </span>
              <span className="flex items-center gap-1 font-bold text-navy-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {tool.rating} <span className="text-slate-500 font-normal">({tool.reviewCount} reviews)</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
              {tool.title}
            </h1>
          </div>

          {/* Detailed Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <h2 className="text-lg font-bold text-navy-900">About this equipment</h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {tool.description}
            </p>
          </div>

          {/* Specs List */}
          {tool.specs && tool.specs.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
              <h2 className="text-lg font-bold text-navy-900">Key Specifications & Included Items</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.specs.map((spec, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                    <Check className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Owner Profile Card */}
          <div className="bg-gradient-to-br from-white via-white to-brand-50/30 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={tool.owner?.avatar || '/images/default-avatar.png'} 
                  alt={tool.owner?.name} 
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-500/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-navy-900">{tool.owner?.name || 'Tool Owner'}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        Verified Member
                      </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Member since {tool.owner?.memberSince || '2023'} • {tool.location}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {tool.owner?.rating || '4.9'} ({tool.owner?.reviewsCount || '24'} reviews)
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-brand-700">{tool.owner?.responseTime || 'Fast responder'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 text-center sm:text-right shrink-0">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Response Rate</p>
                <p className="text-base font-extrabold text-emerald-600">{tool.owner?.responseRate || '100%'}</p>
              </div>
            </div>

            {tool.owner?.bio && (
              <p className="text-xs sm:text-sm text-slate-600 italic bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                "{tool.owner.bio}"
              </p>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Community Reviews ({tool.reviews?.length || 0})
              </h2>
              <span className="text-sm font-extrabold text-navy-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/60 flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {tool.rating} out of 5
              </span>
            </div>

            {tool.reviews && tool.reviews.length > 0 ? (
              <div className="space-y-4">
                {tool.reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={rev.authorAvatar} alt={rev.authorName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-navy-900">{rev.authorName}</p>
                          <p className="text-[10px] text-slate-400">{rev.date}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-10">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-sm">
                No reviews yet for this specific tool. The owner has a <strong>{tool.owner?.rating || '4.9'}</strong> rating across their other equipment rentals!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking / Owner Management Box */}
        <div className="lg:col-span-5 sticky top-28">
          {isOwner ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-500/30 shadow-elevated space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-50 text-brand-700 uppercase tracking-wider border border-brand-200">
                    👑 Owner Controls
                  </span>
                  <h2 className="text-xl font-black text-navy-900 mt-2">You Listed This Equipment</h2>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-navy-900">₹{tool.dailyRate}</span>
                  <span className="text-xs text-slate-400 block font-semibold">/ day</span>
                </div>
              </div>

              {/* Rental Applications List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-brand-600" />
                    Rental Applications ({toolBookings.length})
                  </h3>
                </div>

                {toolBookings.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No active rental requests yet.</p>
                    <p className="text-[11px] text-slate-500">When renters request dates for your equipment, you will be able to Accept or Decline right here.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {toolBookings.map((booking) => (
                      <div key={booking.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={booking.renterAvatar} alt={booking.renterName} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
                            <div>
                              <p className="text-xs font-extrabold text-navy-900">{booking.renterName}</p>
                              <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {booking.renterRating} Renter Rating
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-700 block">₹{booking.totalEstimate}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{booking.days} {booking.days === 1 ? 'day' : 'days'}</span>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                            <span>Requested Dates:</span>
                            <span className="text-navy-900">{booking.startDate} to {booking.endDate}</span>
                          </div>
                          {booking.message && (
                            <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-100">
                              "{booking.message}"
                            </p>
                          )}
                        </div>

                        {/* Status Actions */}
                        {booking.status === 'Pending' ? (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'Approved')}
                              type="button"
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'Declined')}
                              type="button"
                              className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        ) : (
                          <div className={`p-2.5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
                            booking.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {booking.status === 'Approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <XCircle className="w-4 h-4 text-slate-600" />}
                            <span>Status: {booking.status}</span>
                            {booking.status === 'Approved' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'Declined')}
                                type="button"
                                className="ml-auto text-[10px] underline text-rose-700 hover:text-rose-800 font-semibold cursor-pointer"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger Zone / Delete Listing */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  Listing Management
                </h3>
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 space-y-3">
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Want to stop renting out this item or remove it completely from Assetex? Deleting cannot be undone.
                  </p>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to permanently delete "${tool.title}"?`)) {
                        await deleteListing(tool.id);
                        onNavigate('my-listings');
                      }
                    }}
                    type="button"
                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete This Listing
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendRequest} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-elevated space-y-6">
              <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-3xl font-black text-slate-900">₹{rentalType === 'hourly' && tool.hourlyRate ? tool.hourlyRate : tool.dailyRate}</span>
                  <span className="text-sm text-slate-500 font-medium"> / {rentalType === 'hourly' ? 'hour' : 'day'}</span>
                </div>
                {tool.deposit && (
                  <span className="text-xs text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                    +₹{tool.deposit} refundable deposit
                  </span>
                )}
              </div>

              {tool.hourlyRate && (
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRentalType('daily')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'daily' ? 'bg-white shadow text-navy-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Rent by Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentalType('hourly')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'hourly' ? 'bg-white shadow text-navy-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Rent by Hours
                  </button>
                </div>
              )}

              {/* Date Range Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {rentalType === 'hourly' ? 'Select Date & Duration' : 'Select Rental Dates'}
                </label>

                {rentalType === 'daily' ? (
                  <>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(1)}
                        className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                          days === 1 ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        1 Day
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(2)}
                        className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                          days === 2 ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        2 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(3)}
                        className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                          days === 3 ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(7)}
                        className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                          days === 7 ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        1 Week
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">Start Date</span>
                        <input 
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-navy-800 focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">End Date</span>
                        <input 
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-navy-800 focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Date</span>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setEndDate(e.target.value);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-navy-800 focus:bg-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Duration</span>
                      <select 
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-navy-800 focus:bg-white focus:border-brand-500 focus:outline-none"
                      >
                        <option value={2}>2 Hours</option>
                        <option value={4}>4 Hours</option>
                        <option value={8}>8 Hours</option>
                        <option value={12}>12 Hours</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Note to owner */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  Message to Owner (Optional)
                </label>
                <textarea 
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Briefly introduce yourself and describe your project..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-500 focus:outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Estimated Total Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{rentalType === 'hourly' && tool.hourlyRate ? `Rental Charges (${hours} hours)` : `Rental Charges (${days} ${days === 1 ? 'day' : 'days'})`}</span>
                  <span className="font-semibold">₹{totalEstimate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee & Taxes (10%)</span>
                  <span className="font-semibold">₹{platformFee}</span>
                </div>
                {userAssetCash > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={applyAssetCash}
                          onChange={(e) => setApplyAssetCash(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-slate-700 group-hover:text-slate-900 transition-colors">Apply Asset Cash (Balance: ₹{userAssetCash})</span>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        {applyAssetCash ? `-₹${appliedCash}` : '₹0'}
                      </span>
                    </label>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base pt-2 border-t border-slate-200 text-navy-900">
                  <span>Estimated Total</span>
                  <span className="text-brand-700">₹{finalTotal}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-2 rounded-lg text-xs font-semibold mt-2 border border-emerald-100">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Asset Cash Earned
                  </span>
                  <span>+₹{cashbackEarned}</span>
                </div>
              </div>

              {/* Usage Location Rule Callout */}
              {tool.usageLocationType && tool.usageLocationType !== 'both' && (
                <div className={`rounded-2xl p-3.5 flex items-start gap-3 text-xs leading-relaxed border ${
                  tool.usageLocationType === 'on-site' 
                    ? 'bg-blue-50/90 border-blue-200 text-blue-900 shadow-sm' 
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-sm'
                }`}>
                  <Building className="w-4 h-4 shrink-0 mt-0.5 text-current" />
                  <div>
                    <strong className="font-bold block">Usage Rules</strong>
                    {tool.usageLocationType === 'on-site' 
                      ? "This tool must be used inside the lender's workspace. Cannot be taken off-site."
                      : "Can be taken away to the renter's home, office, or workplace."
                    }
                  </div>
                </div>
              )}
              {tool.usageLocationType === 'both' && (
                <div className="bg-purple-50/90 border border-purple-200 text-purple-900 rounded-2xl p-3.5 flex items-start gap-3 text-xs leading-relaxed shadow-sm">
                  <Building className="w-4 h-4 shrink-0 mt-0.5 text-current" />
                  <div>
                    <strong className="font-bold block">Usage Rules</strong>
                    This tool can be used at the lender's workspace or taken off-site. Both work!
                  </div>
                </div>
              )}

              {/* Important Notice Callout */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">No payment is collected now</strong>
                  You'll only pay once <strong>{tool.owner?.name || 'the owner'}</strong> reviews and approves your request dates.
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-4 text-base bg-slate-800 hover:bg-slate-900 text-white shadow-sm border border-slate-700 font-bold tracking-wide"
              >
                Request to Rent →
              </button>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-slate-400 font-semibold text-center">
                  Covered by Assetex Peace of Mind Guarantee
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
