import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, Lock, MapPin, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signup, loginWithGoogle } = useApp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('Austin, TX — South Congress');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const result = await signup(fullName, email, phone, password, city);
    setLoading(false);

    if (result === undefined) {
      // Success — navigate to dashboard
      onNavigate('dashboard');
    } else if (typeof result === 'string') {
      setError(result);
    }
  };

  return (
    <div className="max-w-md mx-auto py-14 px-4 sm:px-6 space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3.5 mb-3">
          <img src="/logo.png?v=assetex_v7" alt="ASSETEX Logo" className="h-16 w-auto object-contain drop-shadow" />
          <span className="font-outfit text-3xl font-black tracking-tight text-slate-900">
            ASSETEX
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">
          One account lets you both borrow tools nearby and list your own to earn.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-rose-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 border-b-2 border-b-slate-300 shadow-elevated space-y-4">
        
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

        <div className="relative pt-2 pb-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-500 font-medium uppercase tracking-wider">Or sign up with email</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">First Name <span className="text-rose-500">*</span></label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-navy-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Last Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-navy-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Email Address <span className="text-rose-500">*</span></label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-navy-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-navy-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">City / Neighborhood</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-navy-900 focus:bg-white focus:border-brand-500 focus:outline-none cursor-pointer"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Nashik">Nashik</option>
              <option value="Aurangabad">Aurangabad</option>
              <option value="Solapur">Solapur</option>
              <option value="Amravati">Amravati</option>
              <option value="Kolhapur">Kolhapur</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Create Password <span className="text-rose-500">*</span></label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-navy-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password.length > 0 && password.length < 6 && (
            <p className="text-[11px] text-rose-500 font-semibold pl-1">Must be at least 6 characters</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Confirm Password <span className="text-rose-500">*</span></label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="password"
              required
              minLength={6}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border text-sm font-medium text-navy-900 focus:bg-white focus:outline-none ${
                confirmPassword && confirmPassword !== password
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-slate-200 focus:border-brand-500'
              }`}
            />
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-[11px] text-rose-500 font-semibold pl-1">Passwords do not match</p>
          )}
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-navy-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            No separate account types needed
          </div>
          <p className="text-[11px] pl-5">You can immediately browse and rent tools, or list your own anytime.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account & Start Sharing →'}
        </button>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-blue-600 hover:text-blue-700 underline ml-1"
            >
              Log In
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
