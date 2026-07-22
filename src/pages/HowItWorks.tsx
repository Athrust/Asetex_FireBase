import React from 'react';
import { 
  Search, 
  Wrench, 
  HeartHandshake
} from 'lucide-react';

interface HowItWorksProps {
  onNavigate: (page: string) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
          Community Marketplace Guide
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
          How Assetex Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Assetex connects people who need specialized tools with neighbors who own them. 
          Every member can be both a renter and a lender on a single unified account.
        </p>
      </div>

      {/* For Renters Section */}
      <div className="space-y-10">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">Borrowing Tools & Equipment</h2>
            <p className="text-sm text-slate-600">Save hundreds of dollars and reduce equipment waste by renting locally.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-base flex items-center justify-center">01</span>
            <h3 className="text-xl font-bold text-navy-900">Search & Check Availability</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Browse listings across Maharashtra by category or price. Check real-time owner ratings, verification badges, and exact tool specifications before you request.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-base flex items-center justify-center">02</span>
            <h3 className="text-xl font-bold text-navy-900">Send a Booking Request</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Select your dates and include a quick note about your project. <strong>No payment is collected during the request</strong> — the owner reviews and approves first.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-base flex items-center justify-center">03</span>
            <h3 className="text-xl font-bold text-navy-900">Pick Up & Build</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Once confirmed, meet up with your neighbor for a quick 2-minute handoff and walkthrough. When your project is done, return the tool cleaned and ready.
            </p>
          </div>
        </div>
      </div>

      {/* For Lenders Section */}
      <div className="space-y-10">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">Lending Out Your Idle Tools</h2>
            <p className="text-sm text-slate-600">Turn your workshop into a reliable stream of passive income.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-base flex items-center justify-center">01</span>
            <h3 className="text-xl font-bold text-navy-900">List Your Equipment in 2 Mins</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Take clear photos of your tools, describe their specs and condition, and set your daily rate. You can add an optional refundable security deposit for peace of mind.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-base flex items-center justify-center">02</span>
            <h3 className="text-xl font-bold text-navy-900">Approve on Your Terms</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When someone requests your tool, you get an instant notification. Review the renter’s star rating and profile, then click <strong>Approve</strong> or <strong>Decline</strong> right from your dashboard.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-base flex items-center justify-center">03</span>
            <h3 className="text-xl font-bold text-navy-900">Safe & Rewarding</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Assetex charges a small transparent service fee on completed bookings to maintain platform safety, identity checks, and peer-to-peer equipment protection.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Safety Highlights */}
      <div className="bg-navy-900 text-white rounded-3xl p-8 sm:p-12 shadow-elevated grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-bold uppercase tracking-wider">
            Community Trust
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Built on Mutual Respect & Verification</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Strangers sharing expensive power equipment requires genuine trust. That's why every single account on Assetex includes verified badges, community star reviews, and response-time trackers.
          </p>
          <div className="space-y-3 pt-2 text-sm font-semibold text-slate-200">
            <div>• Two-way reviews after every completed rental</div>
            <div>• Optional refundable security deposits for high-value items</div>
            <div>• Unified role: treat borrowed tools as you want yours treated</div>
          </div>
        </div>

        <div className="bg-navy-800/80 p-8 rounded-2xl border border-navy-700/80 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Ready to join the community?</h4>
              <p className="text-xs text-slate-300">Start exploring available equipment or list your own today.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigate('browse')}
              className="btn-primary py-3 text-sm w-full"
            >
              Browse Tools
            </button>
            <button
              onClick={() => onNavigate('add-tool')}
              className="btn-secondary py-3 text-sm w-full bg-white/10 hover:bg-white/20 text-white border-white/10"
            >
              List a Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
