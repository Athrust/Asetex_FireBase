import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result === true) {
      onNavigate('dashboard');
    } else if (typeof result === 'string') {
      setError(result);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3.5 mb-3">
          <img src="/logo.png?v=assetex_v7" alt="ASSETEX Logo" className="h-16 w-auto object-contain drop-shadow" />
          <span className="font-outfit text-3xl font-black tracking-tight text-white">
            ASSETEX
          </span>
        </div>
        <h1 className="text-3xl font-black text-white">Welcome back to Assetex</h1>
        <p className="text-sm text-slate-400">
          Log in to your account to manage rentals and listings.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-rose-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-matte-900 p-8 rounded-3xl border border-matte-800 border-b-2 border-b-matte-700 shadow-elevated space-y-5">
        
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                setLoading(true);
                const result = await loginWithGoogle(credentialResponse.credential);
                setLoading(false);
                if (result === true) {
                  onNavigate('dashboard');
                } else if (typeof result === 'string') {
                  setError(result);
                }
              }
            }}
            onError={() => {
              setError('Google Login Failed');
            }}
            useOneTap
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-matte-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-matte-900 px-2 text-slate-500 font-medium uppercase tracking-wider">Or continue with email</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required

              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-matte-800 border border-matte-700 text-sm font-medium text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required

              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-matte-800 border border-matte-700 text-sm font-medium text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 text-base shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="text-center pt-2 border-t border-matte-800">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-bold text-brand-500 hover:text-brand-400 underline ml-1"
            >
              Sign Up Free
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
