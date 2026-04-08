import { useEffect } from 'react';

function getCtaLabel(event) {
  if (event.minimumSpend > 0) return 'BOOK A TABLE';
  if (event.isTicketed && event.ticketPrice > 0) return 'GET TICKETS';
  return 'RSVP FREE';
}

function getEntryBadge(event) {
  if (event.minimumSpend > 0) return { label: `€${event.minimumSpend} MIN SPEND`, color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' };
  if (event.isTicketed && event.ticketPrice > 0) return { label: `€${event.ticketPrice} TICKET`, color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' };
  return { label: 'FREE ENTRY', color: 'text-[#10FF88] border-[#10FF88]/30 bg-[#10FF88]/10' };
}

const VIBE_ICONS = {
  Electronic: '🎵', House: '🎵', Techno: '⚡', Commercial: '🎤',
  'Live Music': '🎸', 'Hip Hop': '🎧', Chill: '🌊'
};

export default function EventBottomSheet({ event, onClose, onConfirm }) {
  useEffect(() => {
    if (event) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [event]);

  if (!event) return null;

  const startDate = new Date(event.startTime);
  const endDate = event.endTime ? new Date(event.endTime) : null;
  const now = new Date();
  const isToday = startDate.toDateString() === now.toDateString();
  const isHappening = startDate <= now && (!endDate || endDate >= now);

  const dateStr = startDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = endDate ? endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null;

  const entry = getEntryBadge(event);
  const ctaLabel = getCtaLabel(event);
  const vibeIcon = VIBE_ICONS[event.vibe] || '🎉';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto bg-zinc-950 rounded-t-3xl border-t border-zinc-800 animate-slide-up">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Flyer */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          {event.flyerImageUrl ? (
            <img
              src={event.flyerImageUrl}
              alt={event.name}
              className="w-full h-full object-cover contrast-[1.2] saturate-75"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <span className="text-6xl opacity-20">{vibeIcon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

          {/* Tonight badge */}
          {isToday && (
            <div className="absolute top-4 left-4">
              {isHappening ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10FF88] rounded-full">
                  <div className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse" />
                  <span className="text-[11px] font-black text-zinc-950 tracking-widest uppercase">Happening Now</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-zinc-950 border border-[#10FF88]/50 rounded-full">
                  <span className="text-[11px] font-black text-[#10FF88] tracking-widest uppercase">Tonight</span>
                </div>
              )}
            </div>
          )}

          {/* Entry badge */}
          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full border text-[11px] font-black tracking-widest uppercase ${entry.color}`}>
            {entry.label}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-8 space-y-5">

          {/* Title + vibe */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-3xl font-display font-normal text-white uppercase tracking-tighter leading-none flex-1">
                {event.name}
              </h2>
              {event.vibe && (
                <span className="mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-zinc-800 border border-zinc-700 text-zinc-300 whitespace-nowrap">
                  {vibeIcon} {event.vibe}
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
              {event.businessName}
            </p>
          </div>

          {/* Date / time / spots */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm font-mono font-bold text-white">{dateStr}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Time</p>
              <p className="text-sm font-mono font-bold text-white">
                {timeStr}{endTimeStr ? ` — ${endTimeStr}` : ''}
              </p>
            </div>
            {event.maxGuests > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Capacity</p>
                <p className="text-sm font-mono font-bold text-white">{event.maxGuests} guests</p>
              </div>
            )}
            {event.spotsRemaining > 0 && event.maxGuests > 0 && (
              <div className={`border rounded-xl p-3 ${event.spotsRemaining < 10 ? 'bg-red-900/20 border-red-800' : 'bg-zinc-900 border-zinc-800'}`}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Spots Left</p>
                <p className={`text-sm font-mono font-bold ${event.spotsRemaining < 10 ? 'text-red-400' : 'text-white'}`}>
                  {event.spotsRemaining} remaining
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">About</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Venue */}
          {event.venueName && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 font-mono">
              <span>📍</span>
              <span>{event.venueName}{event.venueAddress ? `, ${event.venueAddress}` : ''}</span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-white text-black font-black text-sm tracking-[0.2em] uppercase hover:bg-zinc-200 transition-all rounded-none"
          >
            {ctaLabel}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-zinc-500 text-xs font-bold tracking-widest uppercase hover:text-zinc-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
