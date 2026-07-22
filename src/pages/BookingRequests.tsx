import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ListOrdered, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Star
} from 'lucide-react';

interface BookingRequestsProps {
  onNavigate: (page: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const BookingRequests: React.FC<BookingRequestsProps> = ({ onNavigate, onSelectTool }) => {
  const { user, listings, bookings, updateBookingStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'Pending' | 'Approved' | 'Declined'>('all');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Please Log In</h2>
        <p className="text-slate-600">You must be logged in to manage booking requests for your tools.</p>
        <button onClick={() => onNavigate('login')} className="btn-primary">Go to Login</button>
      </div>
    );
  }

  const myToolIds = listings
    .filter(l => Boolean(user && (
      l.ownerId === user.id || 
      l.owner?.id === user.id || 
      (user.name && l.owner?.name && l.owner.name.trim().toLowerCase() === user.name.trim().toLowerCase())
    )))
    .map(l => l.id);

  // Incoming requests where I am the OWNER
  const incomingRequests = bookings.filter(b => Boolean(user && (
    b.ownerId === user.id ||
    (user.name && b.ownerName && user.name.trim().toLowerCase() === b.ownerName.trim().toLowerCase()) ||
    myToolIds.includes(b.toolId)
  )));

  const filteredRequests = incomingRequests.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const pendingCount = incomingRequests.filter(b => b.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-matte-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/30 text-amber-500 text-xs font-bold mb-2 border border-amber-900/50">
            <ListOrdered className="w-3.5 h-3.5" />
            Lender Approvals Hub
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
            Incoming Booking Requests
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-sm font-extrabold">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review community ratings, project notes, and rental dates to Approve or Decline neighbor requests.
          </p>
        </div>

        <button
          onClick={() => onNavigate('add-tool')}
          className="btn-secondary py-3 px-5 gap-2 text-sm whitespace-nowrap"
        >
          + List Another Tool
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-matte-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all' 
              ? 'bg-matte-700 text-white shadow-sm border border-matte-600' 
              : 'bg-matte-900 text-slate-400 hover:bg-matte-800 border border-matte-800'
          }`}
        >
          All Requests ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('Pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'Pending' 
              ? 'bg-amber-500 text-white shadow-sm' 
              : 'bg-matte-900 text-slate-400 hover:bg-matte-800 border border-matte-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Approval ({incomingRequests.filter(b => b.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('Approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'Approved' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'bg-matte-900 text-slate-400 hover:bg-matte-800 border border-matte-800'
          }`}
        >
          Approved ({incomingRequests.filter(b => b.status === 'Approved').length})
        </button>
        <button
          onClick={() => setActiveTab('Declined')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'Declined' 
              ? 'bg-rose-600 text-white shadow-sm' 
              : 'bg-matte-900 text-slate-400 hover:bg-matte-800 border border-matte-800'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Declined ({incomingRequests.filter(b => b.status === 'Declined').length})
        </button>
      </div>

      {filteredRequests.length > 0 ? (
        <div className="space-y-6">
          {filteredRequests.map(req => (
            <div 
              key={req.id}
              className={`rounded-3xl p-6 sm:p-8 border transition-all shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                req.status === 'Pending' 
                  ? 'bg-amber-950/20 border-amber-900/50 ring-2 ring-amber-500/20' 
                  : 'bg-matte-900 border-matte-800'
              }`}
            >
              {/* Tool & Renter Info */}
              <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
                <img 
                  src={req.toolImage} 
                  alt={req.toolTitle} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-matte-700 shadow-sm"
                />

                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-matte-800 text-slate-300 border border-matte-700 text-xs font-bold">
                      {req.toolCategory}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Requested on {req.createdAt}</span>
                  </div>

                  <h3 
                    onClick={() => onSelectTool(req.toolId)}
                    className="text-lg sm:text-xl font-extrabold text-slate-100 hover:text-brand-500 cursor-pointer transition-colors"
                  >
                    {req.toolTitle}
                  </h3>

                  {/* Renter Profile Pill */}
                  <div className="flex flex-wrap items-center gap-3 bg-matte-800 px-4 py-2 rounded-2xl border border-matte-700 w-fit">
                    <img src={req.renterAvatar} alt={req.renterName} className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20" />
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      {req.renterName}
                      <span className="text-[10px] bg-emerald-950/50 text-emerald-500 px-1.5 py-0.5 rounded font-bold">Verified</span>
                    </span>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {req.renterRating}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• Verified ID</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium pt-1">
                    <span className="flex items-center gap-1.5 bg-matte-800 px-3 py-1 rounded-xl font-bold">
                      <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                      {req.startDate} → {req.endDate} ({req.days} {req.days === 1 ? 'day' : 'days'})
                    </span>
                    <span className="text-matte-600">•</span>
                    <span className="text-xs text-slate-400">Rate: ₹{req.dailyRate}/day</span>
                  </div>

                  {req.message && (
                    <div className="bg-matte-800 p-3.5 rounded-2xl border border-matte-700 text-xs sm:text-sm text-slate-300 italic">
                      <strong className="font-bold text-slate-100 not-italic block mb-0.5 text-xs">Note from {req.renterName}:</strong>
                      "{req.message}"
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Action Panel */}
              <div className="bg-matte-800 p-5 rounded-2xl border border-matte-700 w-full lg:w-72 shrink-0 space-y-4 text-center">
                <div className="flex justify-between items-baseline pb-3 border-b border-matte-700">
                  <span className="text-xs font-semibold text-slate-400">Your Potential Payout:</span>
                  <span className="text-2xl font-extrabold text-emerald-500">₹{req.totalEstimate}</span>
                </div>

                {req.status === 'Pending' ? (
                  <div className="space-y-2.5">
                    <button
                      onClick={async () => await updateBookingStatus(req.id, 'Approved')}
                      className="btn-primary w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-sm gap-2 shadow-md shadow-emerald-600/20 border border-emerald-500"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Rental
                    </button>
                    <button
                      onClick={async () => await updateBookingStatus(req.id, 'Declined')}
                      className="w-full py-2.5 px-4 rounded-xl bg-matte-900 hover:bg-matte-950 text-rose-500 border border-rose-900/50 hover:border-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline Request
                    </button>
                    <p className="text-[10px] text-slate-400">
                      Approving reserves these dates on your calendar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider ${
                      req.status === 'Approved'
                        ? 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/50'
                        : 'bg-rose-950/30 text-rose-500 border border-rose-900/50'
                    }`}>
                      {req.status === 'Approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      Status: {req.status}
                    </span>

                    <div className="flex gap-2 pt-1">
                      {req.status === 'Approved' && (
                        <button
                          onClick={async () => await updateBookingStatus(req.id, 'Declined')}
                          className="text-[11px] text-rose-500 hover:underline mx-auto block font-semibold"
                        >
                          Change to Declined
                        </button>
                      )}
                      {req.status === 'Declined' && (
                        <button
                          onClick={async () => await updateBookingStatus(req.id, 'Approved')}
                          className="text-[11px] text-emerald-500 hover:underline mx-auto block font-semibold"
                        >
                          Change to Approved
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-matte-900 rounded-3xl border border-matte-800 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-amber-950/30 text-amber-500 border border-amber-900/50 flex items-center justify-center mx-auto">
            <ListOrdered className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No requests under "{activeTab === 'all' ? 'All' : activeTab}"</h3>
          <p className="text-sm text-slate-400">
            When neighbors request to rent your listed tools, they will appear right here for your review and approval.
          </p>
          <button onClick={() => setActiveTab('all')} className="btn-secondary text-xs bg-matte-800 border-matte-700 text-slate-200">
            Show All Requests
          </button>
        </div>
      )}
    </div>
  );
};
