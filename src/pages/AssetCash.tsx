import React from 'react';
import { Award, ArrowRight, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AssetCashProps {
  onNavigate: (page: string) => void;
}

export const AssetCash: React.FC<AssetCashProps> = ({ onNavigate }) => {
  const { user } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl mx-auto flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
          <Award className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-navy-900 tracking-tight">
          What is Asset Cash?
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The ultimate rewards program for equipment rentals. Earn cashback on every rental and use it to save on your next project. It’s that simple.
        </p>
      </div>

      {/* User Balance Banner (if logged in) */}
      {user && (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-8 text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-emerald-100 font-semibold text-sm uppercase tracking-wider mb-1">Your Current Balance</h3>
              <p className="text-4xl font-black">₹{user.assetCash || 0}</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('browse')}
            className="w-full md:w-auto px-6 py-3.5 bg-white text-emerald-700 font-bold rounded-xl shadow hover:bg-emerald-50 transition-colors"
          >
            Start Renting to Earn More
          </button>
        </div>
      )}

      {/* How It Works Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-200 space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">1. Rent & Earn</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every time you rent equipment on Assetex, you automatically earn <strong>10% of what you actually pay</strong> back as Asset Cash.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-200 space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">2. Accumulate</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your earned Asset Cash is instantly credited to your wallet as soon as your booking is confirmed. Each cashback amount expires exactly 1 month after it is earned.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-200 space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">3. Apply & Save</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            During your next checkout, apply your Asset Cash balance to directly reduce the total cost of your rental. 
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 space-y-6">
        <h2 className="text-2xl font-extrabold text-navy-900 mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-navy-900">Can I withdraw Asset Cash to my bank account?</h4>
            <p className="text-sm text-slate-600 mt-2">No. Asset Cash is an exclusive internal currency that can only be used to pay for equipment rentals directly on the Assetex platform.</p>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-navy-900">Is there a limit to how much Asset Cash I can earn?</h4>
            <p className="text-sm text-slate-600 mt-2">There is absolutely no limit. The more you rent, the more you earn. Big project rentals equal massive cashback opportunities.</p>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-navy-900">Can I use Asset Cash and earn it on the same rental?</h4>
            <p className="text-sm text-slate-600 mt-2">Yes! However, you only earn cashback on the portion of the rental that you pay for out of pocket. If you cover the entire rental with Asset Cash, you won't earn cashback on that transaction.</p>
          </div>
        </div>
      </div>
      
      {/* Ledger Section */}
      {user && user.assetCashLedger && user.assetCashLedger.length > 0 && (
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-soft space-y-6">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-4">Your Active Asset Cash</h2>
          <div className="space-y-3">
            {user.assetCashLedger.map((entry, idx) => {
              if (entry.amount <= 0) return null;
              return (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      ₹
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">₹{entry.amount}</p>
                      <p className="text-xs text-slate-500">Expires: {new Date(entry.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    Active
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* CTA Footer */}
      {!user && (
        <div className="text-center pt-8">
          <button 
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all group"
          >
            Create an Account to Start Earning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
      
    </div>
  );
};
