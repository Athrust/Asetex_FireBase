import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  Search, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  ListOrdered, 
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectTool }) => {
  const { user, bookings, listings, updateBookingStatus } = useApp();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Please Log In</h2>
        <p className="text-slate-600">You must be logged in to view your dashboard.</p>
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

  // Bookings where I am renting from others
  const myRentals = bookings.filter(b => Boolean(
    user && (
      b.renterId === user.id ||
      (user.name && b.renterName && user.name.trim().toLowerCase() === b.renterName.trim().toLowerCase())
    )
  ));
  
  // Bookings where OTHERS are renting MY listed tools
  const incomingRequests = bookings.filter(b => Boolean(user && (
    b.ownerId === user.id ||
    (user.name && b.ownerName && user.name.trim().toLowerCase() === b.ownerName.trim().toLowerCase()) ||
    myToolIds.includes(b.toolId)
  )));
  const pendingIncoming = incomingRequests.filter(b => b.status === 'Pending');

  // My listed tools
  const myListings = listings.filter(l => Boolean(user && (
    l.ownerId === user.id || 
    l.owner?.id === user.id || 
    (user.name && l.owner?.name && l.owner.name.trim().toLowerCase() === user.name.trim().toLowerCase())
  )));

  // Estimate potential earnings from approved/pending bookings on my tools
  const totalEarningsEstimate = incomingRequests.reduce((acc, curr) => acc + curr.totalEstimate, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      {/* Welcome & Two Clear CTAs Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-soft border border-slate-200 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            Unified Renter & Lender Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Manage your equipment rentals and review incoming requests for the tools you own—all in one place.
          </p>
        </div>

        {/* Two Clear Calls to Action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 w-full md:w-auto z-10">
          <button
            onClick={() => onNavigate('add-tool')}
            className="btn-primary py-3.5 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold gap-2 text-sm shadow-sm border border-slate-700 w-full sm:w-auto whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ List Equipment</span>
          </button>
          <button
            onClick={() => onNavigate('browse')}
            className="btn-secondary py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 gap-2 text-sm font-bold w-full sm:w-auto whitespace-nowrap"
          >
            <Search className="w-4 h-4 text-blue-600" />
            Browse Tools
          </button>
        </div>
      </div>

      {/* Alert banner if there are pending requests on user's listings */}
      {pendingIncoming.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-900">
                You have {pendingIncoming.length} pending booking {pendingIncoming.length === 1 ? 'request' : 'requests'} on your tools!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Review dates and messages from neighbors below to Approve or Decline their rentals.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('booking-requests')}
            className="btn-primary py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-xs font-bold whitespace-nowrap shrink-0"
          >
            Review All Requests →
          </button>
        </div>
      )}

      {/* Quick Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          onClick={() => onNavigate('my-bookings')}
          className="bg-white p-6 rounded-3xl border border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400 card-hover cursor-pointer space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Rentals</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-navy-900">{myRentals.length}</p>
          <p className="text-xs font-semibold text-brand-600 flex items-center gap-1">
            {myRentals.filter(r => r.status === 'Approved').length} approved, {myRentals.filter(r => r.status === 'Pending').length} pending
          </p>
        </div>

        <div 
          onClick={() => onNavigate('booking-requests')}
          className="bg-white p-6 rounded-3xl border border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400 card-hover cursor-pointer space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incoming Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <ListOrdered className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-navy-900">{incomingRequests.length}</p>
          <p className="text-xs font-semibold text-amber-600">
            {pendingIncoming.length} awaiting your approval
          </p>
        </div>

        <div 
          onClick={() => onNavigate('my-listings')}
          className="bg-white p-6 rounded-3xl border border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400 card-hover cursor-pointer space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Tool Listings</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-navy-900">{myListings.length}</p>
          <p className="text-xs font-semibold text-blue-600">
            {myListings.filter(l => l.status === 'active').length} active and earnable
          </p>
        </div>

        <div 
          onClick={() => onNavigate('booking-requests')}
          className="bg-white p-6 rounded-3xl border border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400 card-hover cursor-pointer space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-navy-900">₹{totalEarningsEstimate}</p>
          <p className="text-xs font-semibold text-emerald-600">
            Total bookings potential
          </p>
        </div>
      </div>

      {/* Main Split Content: Incoming Requests vs My Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Incoming Booking Requests (Lending Side) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Lending Activity</span>
              <h2 className="text-xl font-extrabold text-navy-900 flex items-center gap-2">
                Incoming Booking Requests ({incomingRequests.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('booking-requests')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Manage All →
            </button>
          </div>

          {incomingRequests.length > 0 ? (
            <div className="space-y-4">
              {incomingRequests.map(req => (
                <div 
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    req.status === 'Pending' 
                      ? 'bg-amber-50/50 border-amber-300 shadow-md hover:shadow-lg' 
                      : 'bg-white border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img src={req.toolImage} alt={req.toolTitle} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200" />
                      <div>
                        <span className="text-[11px] font-bold text-brand-600 flex items-center gap-1">
                          {req.toolCategory}
                        </span>
                        <h4 className="font-bold text-navy-900 text-sm line-clamp-1">{req.toolTitle}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                          <span className="font-semibold text-navy-800 flex items-center gap-1">
                            <img src={req.renterAvatar} alt="" className="w-4 h-4 rounded-full" />
                            {req.renterName}
                          </span>
                          <span>•</span>
                          <span>{req.startDate} → {req.endDate} ({req.days}d)</span>
                          <span>•</span>
                          <span className="font-extrabold text-emerald-600">₹{req.totalEstimate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Decline Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => updateBookingStatus(req.id, 'Approved')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateBookingStatus(req.id, 'Declined')}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                          req.status === 'Approved' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {req.message && (
                    <p className="text-xs text-slate-600 italic bg-white/80 p-3 rounded-xl border border-slate-200/60 mt-3 pl-4">
                      "{req.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm space-y-3">
              <Wrench className="w-10 h-10 mx-auto text-slate-300" />
              <p>You have no incoming booking requests yet.</p>
              <button onClick={() => onNavigate('add-tool')} className="btn-secondary text-xs">
                + List another tool to increase earnings
              </button>
            </div>
          )}
        </div>

        {/* Right Column: My Active & Pending Bookings (Rented by Me) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Renting Activity</span>
              <h2 className="text-xl font-extrabold text-navy-900 flex items-center gap-2">
                My Bookings ({myRentals.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('my-bookings')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              View All →
            </button>
          </div>

          {myRentals.length > 0 ? (
            <div className="space-y-4">
              {myRentals.map(book => (
                <div 
                  key={book.id}
                  onClick={() => onSelectTool(book.toolId)}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400 cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <img src={book.toolImage} alt={book.toolTitle} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-300 shadow-sm" />
                      <div>
                        <h4 className="font-bold text-navy-900 text-xs sm:text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {book.toolTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Owner: <strong className="text-navy-800">{book.ownerName}</strong>
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                      book.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : book.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      {book.startDate} ({book.days}d)
                    </span>
                    <span className="font-extrabold text-navy-900">₹{book.totalEstimate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-slate-300" />
              <p>You haven't requested any tools yet.</p>
              <button onClick={() => onNavigate('browse')} className="btn-primary text-xs">
                Browse Tools Nearby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
