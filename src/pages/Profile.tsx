import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ToolCard } from '../components/ToolCard';
import { 
  User as UserIcon, 
  Star, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  Phone, 
  Mail, 
  Award, 
  Wrench
} from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate, onSelectTool }) => {
  const { user, listings, updateUserProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Please Log In</h2>
        <p className="text-slate-600">You must be logged in to view your profile and settings.</p>
        <button onClick={() => onNavigate('login')} className="btn-primary">Go to Login</button>
      </div>
    );
  }

  const userListings = listings.filter(l => l.ownerId === user.id);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ name, email, phone, city, bio, avatar });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      {/* Top Banner & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
            <UserIcon className="w-3.5 h-3.5" />
            Unified Profile & Settings
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">{user.name}</h1>
          <p className="text-sm text-slate-600 mt-1">
            This profile is shared across both your tool rentals and your tool listings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn-secondary text-sm gap-2 ${isEditing ? 'bg-slate-200 font-bold' : ''}`}
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile & Settings'}
          </button>
        </div>
      </div>

      {isEditing ? (
        /* Edit Profile Form */
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-elevated max-w-3xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-navy-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-brand-600" />
            Edit Your Account Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">City / Neighborhood</label>
              <select 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium"
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
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Avatar URL</label>
            <input 
              type="text" 
              value={avatar} 
              onChange={(e) => setAvatar(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">Bio</label>
            <textarea 
              rows={4} 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium resize-none" 
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary gap-2"><Save className="w-4 h-4" /> Save Changes</button>
          </div>
        </form>
      ) : (
        /* Public Profile View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Owner Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft space-y-6 text-center">
            <div className="relative w-32 h-32 mx-auto">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-3xl object-cover ring-4 ring-brand-500/20 shadow-md"
              />
              {user.verified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-extrabold shadow-md border-2 border-white uppercase tracking-wider">
                  Verified
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-navy-900 flex items-center justify-center gap-1.5">
                {user.name}
              </h2>
              <p className="text-xs font-semibold text-brand-600 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {user.city}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rating</p>
                <p className="text-lg font-extrabold text-navy-900 flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {user.rating}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reviews</p>
                <p className="text-lg font-extrabold text-navy-900 mt-0.5">{user.reviewsCount}</p>
              </div>
            </div>

            <div className="text-left space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Member since <strong className="text-navy-800">{user.memberSince}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
              <div>
                <span className="font-semibold text-emerald-700 text-xs bg-emerald-50 px-2 py-1 rounded-md">Identity & Phone Verified</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary w-full text-xs gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Settings
            </button>
          </div>

          {/* Right Column: Bio & Listed Tools */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-600" />
                About {user.name.split(' ')[0]}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {user.bio || 'No biography written yet.'}
              </p>
            </div>

            {/* Tools Listed Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-navy-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-brand-600" />
                  Tools Listed by {user.name.split(' ')[0]} ({userListings.length})
                </h3>
                <button 
                  onClick={() => onNavigate('add-tool')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  + Add New Tool
                </button>
              </div>

              {userListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {userListings.map(tool => (
                    <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm space-y-3">
                  <Wrench className="w-10 h-10 mx-auto text-slate-300" />
                  <p>You currently don't have any tools listed.</p>
                  <button onClick={() => onNavigate('add-tool')} className="btn-primary text-xs">
                    List Your First Tool
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
