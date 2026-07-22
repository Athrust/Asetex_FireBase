import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ToolCategory } from '../types';
import { 
  PlusCircle, 
  IndianRupee, 
  MapPin, 
  CheckCircle2, 
  Plus,
  Trash2,
  ArrowLeft,
  Building,
  Upload
} from 'lucide-react';

interface AddToolProps {
  onNavigate: (page: string) => void;
  onSelectTool: (toolId: string) => void;
}

const categories: ToolCategory[] = [
  '3D Printing & Fabrication',
  'Power Tools & Carpentry',
  'Gardening & Outdoor',
  'Home Improvement',
  'Photography & Video',
  'Other'
];



const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isCloudDeploy = (
  hostname.includes('netlify.app') || 
  hostname.includes('vercel.app') || 
  window.location.protocol === 'https:'
);
const API_URL = import.meta.env.VITE_API_URL || (isCloudDeploy ? 'https://assetex-backend.onrender.com/api' : `http://${hostname}:5001/api`);

export const AddTool: React.FC<AddToolProps> = ({ onNavigate, onSelectTool }) => {
  const { user, addListing } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ToolCategory>('Power Tools & Carpentry');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(2800);
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [deposit, setDeposit] = useState<number>(8000);
  const [location, setLocation] = useState('Mumbai');
  
  // Dynamic images list state matching "UPLOAD UP TO 12 PHOTOS" requirement
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  
  // Custom usage location rules option (Off-site vs On-site workspace usage)
  const [usageLocationType, setUsageLocationType] = useState<'off-site' | 'on-site' | 'both'>('both');
  
  const [specs, setSpecs] = useState<string[]>(['All original safety guards included', 'Inspected and cleaned prior to rental']);
  const [newSpecInput, setNewSpecInput] = useState('');

  // Helper function to compress large photos from phones before uploading
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Output compressed JPEG
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      for (const file of filesArray) {
        if (!file.type.startsWith('image/')) continue;
        
        try {
          // Compress the image before uploading to avoid memory limits
          const base64Data = await compressImage(file);
          
          const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              dataUrl: base64Data
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            setImages(prev => {
              if (prev.length >= 12) return prev;
              return [...prev, data.url];
            });
            continue;
          }
        } catch (err) {
          console.warn('Image processing or upload failed:', err);
        }
      }
      setShowPhotoPopup(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Please Log In</h2>
        <p className="text-slate-400">You must be logged in to list your equipment.</p>
        <button onClick={() => onNavigate('login')} className="btn-primary">Go to Login</button>
      </div>
    );
  }



  const handleAddSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpecInput.trim()) {
      setSpecs([...specs, newSpecInput.trim()]);
      setNewSpecInput('');
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 3) {
      setError('Please upload at least 3 photos.');
      return;
    }
    setError('');
    if (!title || !shortDescription) return;

    const newId = await addListing({
      title,
      category,
      shortDescription,
      description: description || shortDescription,
      specs,
      image: images[0],
      images: images,
      dailyRate: Number(dailyRate),
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      deposit: deposit ? Number(deposit) : undefined,
      location,
      status: 'active',
      usageLocationType
    });

    if (newId) {
      onSelectTool(newId);
    } else {
      onNavigate('my-listings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-matte-800 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => onNavigate('my-listings')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Listings
          </button>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <PlusCircle className="w-7 h-7 text-brand-500" />
            List Equipment to Lend
          </h1>
          <p className="text-sm text-slate-400">
            Create a detailed listing so local makers and neighbors can rent your idle tools.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950 border border-rose-900/50 text-rose-500 p-4 rounded-xl text-sm font-bold shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-matte-900 rounded-3xl p-6 sm:p-10 border border-matte-800 shadow-elevated space-y-8">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white pb-2 border-b border-matte-800">1. Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Listing Title <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required

                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white placeholder-slate-500 focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Category <span className="text-rose-500">*</span>
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as ToolCategory)}
                className="w-full px-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none cursor-pointer transition-all shadow-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Short Summary (1–2 sentences for search cards) <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              required

              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white placeholder-slate-500 focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Full Description & Usage Tips <span className="text-rose-500">*</span>
            </label>
            <textarea 
              rows={4}
              required

              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white placeholder-slate-500 focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm resize-none"
            ></textarea>
          </div>
        </div>

        {/* Pricing & Location */}
        <div className="space-y-6 pt-2">
          <h2 className="text-lg font-bold text-white pb-2 border-b border-matte-800">2. Pricing, Location & Rules</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Daily Rate (₹ / Day) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <input 
                  type="number"
                  required
                  min="100"
                  max="50000"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-extrabold text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Hourly Rate (₹ / Hour)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <input 
                  type="number"
                  min="50"
                  max="5000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-10 pr-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-extrabold text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Refundable Deposit (₹ Optional)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <input 
                  type="number"
                  min="0"
                  max="150000"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Pickup Neighborhood <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none cursor-pointer transition-all shadow-sm"
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Usage Location Rules <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <select
                  value={usageLocationType}
                  onChange={(e) => setUsageLocationType(e.target.value as 'off-site' | 'on-site' | 'both')}
                  className="w-full pl-10 pr-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white focus:bg-matte-900 focus:border-brand-500 focus:outline-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="off-site">Take to home/workplace</option>
                  <option value="on-site">Use in Lender's workspace</option>
                  <option value="both">Both works</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Upload & Preview Grid (UPLOAD UP TO 12 PHOTOS) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-black text-white tracking-wider uppercase">
            Upload up to 12 Photos
          </h2>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-3 max-w-lg">
            {Array.from({ length: 12 }).map((_, idx) => {
              const isUploaded = idx < images.length;
              const isActiveAdd = idx === images.length;

              if (isUploaded) {
                const src = images[idx];
                return (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-matte-700 group shadow-sm bg-matte-800">
                    <img src={src} className="w-full h-full object-cover" alt={`Tool photo ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              if (isActiveAdd) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setShowPhotoPopup(true)}
                    className="aspect-square rounded-xl bg-matte-800 border border-matte-700 hover:bg-matte-700 transition-all flex flex-col items-center justify-center p-2 text-center shadow-sm select-none group"
                  >
                    <div className="relative flex flex-col items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white rounded-full p-0.5 border border-matte-800">
                        <Plus className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-white mt-1.5 block leading-none">
                      Add Photo
                    </span>
                  </button>
                );
              }

              // Placeholder slot
              return (
                <div
                  key={idx}
                  className="aspect-square rounded-xl bg-matte-950 border border-matte-800 flex flex-col items-center justify-center p-2 text-center select-none opacity-50"
                >
                  <div className="relative flex flex-col items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="absolute -top-1.5 -right-1.5 bg-matte-800 text-slate-400 rounded-full p-0.5 border border-matte-950">
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {images.length === 0 ? (
            <p className="text-xs font-semibold text-rose-500 mt-1">
              This field is mandatory
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              At least 1 photo is required. You can add up to 12.
            </p>
          )}

          {/* Interactive Custom Photo Popup Modal */}
          {showPhotoPopup && (
            <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-matte-900 rounded-3xl p-6 max-w-md w-full border border-matte-800 shadow-elevated space-y-6 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-matte-800">
                  <h3 className="text-base font-extrabold text-white">Add Equipment Photo</h3>
                  <button 
                    type="button" 
                    onClick={() => { setShowPhotoPopup(false); setCustomPhotoUrl(''); }}
                    className="text-slate-400 hover:text-white font-black text-sm p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Option 1: Upload File directly from device */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      1. Upload Image File from Your Device
                    </label>
                    <label className="border-2 border-dashed border-brand-500/50 bg-brand-950/20 hover:bg-brand-950/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-sm">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <Upload className="w-8 h-8 text-brand-500 group-hover:scale-110 transition-transform mb-2" />
                      <span className="text-xs font-extrabold text-white block">Click to browse local image files</span>
                      <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Supports PNG, JPG, WEBP, GIF (Up to 12 photos)</span>
                    </label>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-matte-800"></div>
                    <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-black uppercase tracking-wider">Or Choose Template</span>
                    <div className="flex-grow border-t border-matte-800"></div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      2. Choose Preset Template Photo
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImages([...images, '/images/11.png']);
                          setShowPhotoPopup(false);
                        }}
                        className="p-2 rounded-xl border border-matte-700 hover:border-brand-500 bg-matte-800 text-[10px] font-bold text-slate-300 flex flex-col items-center gap-1.5 transition-all"
                      >
                        <img src="/images/11.png" className="w-10 h-10 object-cover rounded-lg shadow-sm" alt="Saw" />
                        Power Tool
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImages([...images, '/images/12.png']);
                          setShowPhotoPopup(false);
                        }}
                        className="p-2 rounded-xl border border-matte-700 hover:border-brand-500 bg-matte-800 text-[10px] font-bold text-slate-300 flex flex-col items-center gap-1.5 transition-all"
                      >
                        <img src="/images/12.png" className="w-10 h-10 object-cover rounded-lg shadow-sm" alt="Printer" />
                        3D Printer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImages([...images, '/images/13.png']);
                          setShowPhotoPopup(false);
                        }}
                        className="p-2 rounded-xl border border-matte-700 hover:border-brand-500 bg-matte-800 text-[10px] font-bold text-slate-300 flex flex-col items-center gap-1.5 transition-all"
                      >
                        <img src="/images/13.png" className="w-10 h-10 object-cover rounded-lg shadow-sm" alt="Mower" />
                        Lawn Mower
                      </button>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-matte-800"></div>
                    <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-black uppercase tracking-wider">Or</span>
                    <div className="flex-grow border-t border-matte-800"></div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Or Paste Photo URL
                    </label>
                    <input 
                      type="text"

                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white placeholder-slate-500 focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 justify-end pt-3 border-t border-matte-800">
                  <button
                    type="button"
                    onClick={() => { setShowPhotoPopup(false); setCustomPhotoUrl(''); }}
                    className="px-4 py-2 rounded-xl border border-matte-700 hover:bg-matte-800 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!customPhotoUrl}
                    onClick={() => {
                      if (customPhotoUrl) {
                        setImages([...images, customPhotoUrl]);
                        setCustomPhotoUrl('');
                        setShowPhotoPopup(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    Add Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Specs & Features */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-white pb-2 border-b border-matte-800">4. Key Specifications & Features</h2>

          <div className="flex gap-2">
            <input 
              type="text"

              value={newSpecInput}
              onChange={(e) => setNewSpecInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-md bg-matte-800 border border-matte-700 text-sm font-semibold text-white placeholder-slate-500 focus:bg-matte-900 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={handleAddSpec}
              className="btn-secondary px-5 py-3 gap-1.5 bg-brand-950/20 text-brand-500 border border-brand-900/50 hover:bg-brand-950/40 font-extrabold text-xs shrink-0 rounded-xl"
            >
              <Plus className="w-4 h-4" /> Add Spec
            </button>
          </div>

          {specs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 rounded-xl bg-matte-800 border border-matte-700 text-xs sm:text-sm text-white font-semibold shadow-sm">
                  <span className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {spec}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(index)}
                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-matte-800 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => onNavigate('my-listings')}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto py-3.5 px-8 text-base shadow-sm"
          >
            Publish Tool Listing →
          </button>
        </div>
      </form>
    </div>
  );
};
