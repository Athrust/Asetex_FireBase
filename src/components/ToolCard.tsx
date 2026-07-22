import React from 'react';
import type { ToolListing } from '../types';
import { Star } from 'lucide-react';

interface ToolCardProps {
  tool: ToolListing;
  onSelect: (toolId: string) => void;
}

export const getCategoryIcon = (_category: string) => {
  return null;
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(tool.id)}
      className="card-hover group cursor-pointer overflow-hidden flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl transition-all duration-300 hover:border-brand-300 hover:shadow-elevated"
    >
      {/* Image Container - Increased image size to 1:1 aspect square */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50/60 border-b border-slate-100/80">
        <img 
          src={tool.image} 
          alt={tool.title} 
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          onError={(e) => {
            // Fallback image if local file isn't uploaded yet
            (e.target as HTMLImageElement).src = '/images/1.png';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-navy-800 shadow-sm flex items-center gap-1.5 border border-slate-100">
            {tool.category.split('&')[0].trim()}
          </span>
        </div>

        {tool.status === 'inactive' && (
          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider">
              Temporarily Unavailable
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-navy-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-md flex items-baseline gap-1">
          <span className="text-lg font-extrabold text-amber-400">₹{tool.dailyRate}</span>
          <span className="text-[11px] text-slate-300 font-medium">/ day</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
            <span className="font-medium truncate">
              {tool.location.split('—')[1] || tool.location}
            </span>
            <span className="flex items-center gap-1 font-bold text-navy-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {tool.rating} <span className="text-slate-400 font-normal">({tool.reviewCount})</span>
            </span>
          </div>

          <h3 className="font-bold text-navy-900 text-base leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {tool.title}
          </h3>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>

        {/* Owner Card Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src={tool.owner?.avatar || '/images/default-avatar.png'} 
              alt={tool.owner?.name || 'Owner'} 
              className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20"
            />
            <div>
              <p className="text-xs font-bold text-navy-800 flex items-center gap-1">
                {tool.owner?.name || 'Assetex Member'}
                {tool.owner?.verified && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Verified</span>
                )}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {tool.owner?.responseTime || 'Responds fast'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Rent →
          </span>
        </div>
      </div>
    </div>
  );
};
