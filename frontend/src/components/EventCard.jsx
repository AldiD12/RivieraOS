import { useState } from 'react';

export default function EventCard({ event, venue, isDayMode, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Format date
  const eventDate = new Date(event.startTime);
  const dateStr = eventDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const timeStr = eventDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determine entry type display
  let entryBadge = { text: 'FREE ENTRY', color: 'emerald' };
  if (event.minimumSpend > 0) {
    entryBadge = { text: `€${event.minimumSpend} MIN`, color: 'amber' };
  } else if (event.isTicketed && event.ticketPrice > 0) {
    entryBadge = { text: `€${event.ticketPrice}`, color: 'blue' };
  }
  
  // Vibe emoji mapping
  const vibeEmojis = {
    'House': '🎵',
    'Techno': '⚡',
    'Commercial': '🎤',
    'Live Music': '🎸',
    'Hip Hop': '🎧',
    'Chill': '🌊'
  };
  
  return (
    <div 
      onClick={onClick}
      className={`
        group relative overflow-hidden cursor-pointer
        transition-all duration-500 ease-out
        ${isDayMode
          ? 'bg-gradient-to-br from-white to-stone-50/50 border border-stone-200/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]'
          : 'bg-zinc-900/50 border border-zinc-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(16,255,136,0.1)]'
        }
        rounded-[1.5rem] hover:-translate-y-1
      `}
    >
      {/* Flyer Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-[1.5rem]">
        {event.flyerImageUrl ? (
          <>
            <img 
              src={event.flyerImageUrl}
              alt={event.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`
                w-full h-full object-cover
                transition-all duration-700 ease-out
                ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
                group-hover:scale-105
              `}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <div className={`
            w-full h-full flex items-center justify-center
            ${isDayMode ? 'bg-stone-100' : 'bg-zinc-800'}
          `}>
            <span className="text-6xl opacity-20">🎉</span>
          </div>
        )}
        
        {/* Vibe Badge (top-left) */}
        {event.vibe && (
          <div className={`
            absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase
            backdrop-blur-md border
            ${isDayMode
              ? 'bg-white/90 border-stone-200 text-stone-800'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
            }
          `}>
            {vibeEmojis[event.vibe] || '🎵'} {event.vibe}
          </div>
        )}
        
        {/* Entry Type Badge (top-right) */}
        <div className={`
          absolute top-3 right-3 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase
          backdrop-blur-md border
          ${entryBadge.color === 'emerald'
            ? isDayMode
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
              : 'bg-emerald-900/90 border-emerald-700 text-emerald-300'
            : entryBadge.color === 'amber'
            ? isDayMode
              ? 'bg-amber-50/90 border-amber-200 text-amber-800'
              : 'bg-amber-900/90 border-amber-700 text-amber-300'
            : isDayMode
            ? 'bg-blue-50/90 border-blue-200 text-blue-800'
            : 'bg-blue-900/90 border-blue-700 text-blue-300'
          }
        `}>
          {entryBadge.text}
        </div>
        
        {/* Event Name (overlay, bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-lg">
            {event.name}
          </h3>
          {venue && (
            <p className="text-white/90 text-sm font-medium drop-shadow-md">
              📍 {venue.name}
            </p>
          )}
        </div>
      </div>
      
      {/* Event Details */}
      <div className="p-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
            🗓️ {dateStr}
          </span>
          <span className={`text-sm font-medium ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
            • {timeStr}
          </span>
        </div>
        
        {/* Description (if exists) */}
        {event.description && (
          <p className={`text-sm line-clamp-2 ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
            {event.description}
          </p>
        )}
        
        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`
            w-full py-3 rounded-full text-sm font-bold tracking-widest uppercase
            transition-all duration-300
            ${isDayMode
              ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-[0_4px_14px_rgba(0,0,0,0.1)]'
              : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-[#10FF88]/30'
            }
          `}
        >
          {event.minimumSpend > 0 ? 'BOOK TABLE' : event.isTicketed ? 'GET TICKETS' : 'LEARN MORE'}
        </button>
      </div>
    </div>
  );
}
