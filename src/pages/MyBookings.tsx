import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  MessageSquare, 
  ExternalLink
} from 'lucide-react';

interface MyBookingsProps {
  onNavigate: (page: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onNavigate, onSelectTool }) => {
  const { user, bookings, updateBookingStatus } = useApp();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Please Log In</h2>
        <p className="text-slate-600">You must be logged in to view your bookings.</p>
        <button onClick={() => onNavigate('login')} className="btn-primary">Go to Login</button>
      </div>
    );
  }

  const myRentals = bookings.filter(b => Boolean(
    user && (
      b.renterId === user.id ||
      (user.name && b.renterName && user.name.trim().toLowerCase() === b.renterName.trim().toLowerCase())
    )
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Renter Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">My Rental Bookings ({myRentals.length})</h1>
          <p className="text-sm text-slate-600 mt-1">
            Track equipment you requested to borrow from neighbors and view approval status.
          </p>
        </div>

        <button
          onClick={() => onNavigate('browse')}
          className="btn-primary py-3 px-6 gap-2 text-sm shadow-md shadow-brand-600/20 whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Browse More Tools
        </button>
      </div>

      {myRentals.length > 0 ? (
        <div className="space-y-6">
          {myRentals.map(book => (
            <div 
              key={book.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
                <img 
                  src={book.toolImage} 
                  alt={book.toolTitle} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-slate-300 shadow-md"
                />

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {book.toolCategory}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Requested on {book.createdAt}</span>
                  </div>

                  <h3 
                    onClick={() => onSelectTool(book.toolId)}
                    className="text-lg sm:text-xl font-extrabold text-navy-900 hover:text-brand-600 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {book.toolTitle}
                    <ExternalLink className="w-4 h-4 text-slate-400 inline" />
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                      <strong>{book.startDate}</strong> → <strong>{book.endDate}</strong> ({book.days} {book.days === 1 ? 'day' : 'days'})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Owner: <strong className="text-navy-900">{book.ownerName}</strong></span>
                  </div>

                  {book.message && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-500 inline mr-1.5" />
                      "{book.message}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status & Estimate Breakdown Right Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 w-full lg:w-64 shrink-0 space-y-3 text-center sm:text-right flex flex-col justify-between">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    book.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : book.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : book.status === 'Declined'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {book.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {book.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                    {book.status === 'Declined' && <XCircle className="w-3.5 h-3.5" />}
                    {book.status}
                  </span>

                  <p className="text-[11px] text-slate-500 mt-2">
                    {book.status === 'Pending' && 'Owner usually responds within 24 hours'}
                    {book.status === 'Approved' && 'Coordinate pickup with the owner'}
                    {book.status === 'Declined' && 'Try requesting dates on another tool'}
                  </p>
                  {book.status === 'Pending' && (
                    <button
                      onClick={() => updateBookingStatus(book.id, 'Declined')}
                      className="mt-2 w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-[11px] transition-all cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between sm:justify-end gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Total Estimate:</span>
                  <span className="text-lg font-extrabold text-navy-900">₹{book.totalEstimate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-navy-900">You have no rental requests</h3>
          <p className="text-sm text-slate-600">
            Browse our catalog of 3D printers, saws, and outdoor power equipment to start your next DIY project.
          </p>
          <button onClick={() => onNavigate('browse')} className="btn-primary">
            Explore Equipment Nearby
          </button>
        </div>
      )}
    </div>
  );
};
