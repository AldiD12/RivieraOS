import { useState, useMemo, useRef, useEffect } from 'react';

// ─── Filter definitions ────────────────────────────────────────────────────

const DAY_OPTIONS = [
  { id: 'today',       label: 'Today' },
  { id: 'tomorrow',    label: 'Tomorrow' },
  { id: 'thisWeekend', label: 'This Weekend' },
  { id: 'upcoming',    label: 'Upcoming' },
  { id: 'past',        label: 'Past Events' },
];

const GENRE_OPTIONS = [
  { id: 'all',        label: 'All' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'popullore',  label: 'Popullore' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'rock',       label: 'Rock' },
  { id: 'hiphop',     label: 'Hip-Hop' },
];

const ENTRANCE_OPTIONS = [
  { id: 'all',  label: 'All' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
];

// ─── Tiny dropdown component ───────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  const selected = options.find(o => o.id === value);
  const isActive = value !== 'all' && value !== 'today'; // highlight when non-default

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border text-[11px] font-bold tracking-widest uppercase transition-all duration-200 whitespace-nowrap ${
          isActive || open
            ? 'bg-[#10FF88] border-[#10FF88] text-zinc-950 shadow-[0_0_12px_rgba(16,255,136,0.35)]'
            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
        }`}
      >
        <span className="text-[10px] text-current opacity-60 font-mono pr-0.5">{label}</span>
        <span>{selected?.label || 'All'}</span>
        <svg className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[140px] bg-zinc-900 border border-zinc-700 rounded-sm shadow-2xl z-50 overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                value === opt.id
                  ? 'bg-[#10FF88] text-zinc-950'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function EventsView({ 
  events, 
  venues,
  loading, 
  vibeFilter,   // kept for compatibility — maps to genre
  dateFilter,   // kept for compatibility — maps to day
  onVibeChange, 
  onDateChange,
  onEventClick,
  isDayMode,
  standalone = false
}) {
  // Local state for the 3 new filters (genre + entrance managed internally)
  const [dayFilter, setDayFilter]         = useState(dateFilter || 'today');
  const [genreFilter, setGenreFilter]     = useState('all');
  const [entranceFilter, setEntranceFilter] = useState('all');

  // Keep parent in sync for day/date filter
  const handleDayChange = (val) => {
    setDayFilter(val);
    onDateChange && onDateChange(val);
  };

  const getVenueForEvent = (event) => venues.find(v => v.id === event.venueId);

  // ── Date filter ──────────────────────────────────────────────────────────
  const dateFiltered = useMemo(() => {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const afterTomorrow = new Date(today); afterTomorrow.setDate(today.getDate() + 2);

    // Figure out this weekend (Fri–Sun)
    const dayOfWeek = today.getDay(); // 0=Sun … 6=Sat
    const daysToFri = (5 - dayOfWeek + 7) % 7 || 7;
    const friday  = new Date(today); friday.setDate(today.getDate() + daysToFri);
    const sunday  = new Date(friday); sunday.setDate(friday.getDate() + 2);
    sunday.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const d = new Date(event.startTime);
      switch (dayFilter) {
        case 'today':       return d >= today && d < tomorrow;
        case 'tomorrow':    return d >= tomorrow && d < afterTomorrow;
        case 'thisWeekend': return d >= friday && d <= sunday;
        case 'upcoming':    return d >= today;
        case 'past':        return d < today;
        default:            return true;
      }
    });
  }, [events, dayFilter]);

  // ── Genre filter ─────────────────────────────────────────────────────────
  const genreFiltered = useMemo(() => {
    if (genreFilter === 'all') return dateFiltered;
    return dateFiltered.filter(event => {
      const v = genreFilter.toLowerCase();
      const genre = (event.genre || event.vibe || event.musicGenre || '').toLowerCase();
      return genre.includes(v);
    });
  }, [dateFiltered, genreFilter]);

  // ── Entrance filter ──────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    if (entranceFilter === 'all') return genreFiltered;
    if (entranceFilter === 'free') {
      return genreFiltered.filter(e => (!e.isTicketed || e.ticketPrice === 0) && e.minimumSpend === 0);
    }
    if (entranceFilter === 'paid') {
      return genreFiltered.filter(e => (e.isTicketed && e.ticketPrice > 0) || e.minimumSpend > 0);
    }
    return genreFiltered;
  }, [genreFiltered, entranceFilter]);

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-zinc-950 text-white h-screen w-full overflow-hidden relative font-sans antialiased">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-2 border-zinc-800 border-t-[#10FF88] rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 font-mono uppercase tracking-widest">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white h-screen w-full overflow-hidden relative font-sans antialiased">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="pt-14 px-5 pb-3 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800">

          {/* Title row */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="font-display text-3xl text-white tracking-tighter uppercase">XIXA</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#10FF88] shadow-[0_0_8px_rgba(16,255,136,0.8)] animate-pulse" />
                <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase">[ ALBANIAN RIVIERA ]</p>
              </div>
            </div>
          </div>

          {/* ── 3 Dropdown Filters ──────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 pb-1">
            <FilterDropdown
              label="DAY ▾"
              value={dayFilter}
              options={DAY_OPTIONS}
              onChange={handleDayChange}
            />
            <FilterDropdown
              label="GENRE ▾"
              value={genreFilter}
              options={GENRE_OPTIONS}
              onChange={setGenreFilter}
            />
            <FilterDropdown
              label="ENTRANCE ▾"
              value={entranceFilter}
              options={ENTRANCE_OPTIONS}
              onChange={setEntranceFilter}
            />
          </div>
        </div>
      </div>

      {/* ── Event cards ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pt-[170px] pb-[80px] overflow-y-auto no-scrollbar z-10 px-5 space-y-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const venue = getVenueForEvent(event);
            const eventDate = new Date(event.startTime);
            const isFree = (!event.isTicketed || event.ticketPrice === 0) && event.minimumSpend === 0;

            return (
              <div
                key={event.id}
                className="relative w-full aspect-[4/5] bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group hover:border-zinc-600 transition-all duration-300 shadow-lg cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                {/* Image */}
                <div className="absolute inset-0 z-0">
                  {event.flyerImageUrl ? (
                    <img
                      alt="Event"
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 contrast-[1.4] saturate-50"
                      src={event.flyerImageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-zinc-700" />
                    </div>
                  )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent z-10 pointer-events-none" />

                {/* Top bar */}
                <div className="absolute top-0 left-0 z-20 w-full flex justify-between items-start p-3 border-b border-zinc-800/50">
                  {/* Date badge */}
                  <div className="bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5 border border-zinc-800 flex flex-col items-center font-mono">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
                      {eventDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-lg font-black text-white leading-none">{eventDate.getDate()}</span>
                  </div>

                  {/* Entry badge */}
                  {isFree ? (
                    <div className="bg-[#10FF88]/10 border border-[#10FF88]/40 px-3 py-1.5 flex items-center">
                      <span className="text-[10px] font-mono text-[#10FF88] font-black tracking-widest uppercase">FREE ENTRY</span>
                    </div>
                  ) : event.minimumSpend > 0 ? (
                    <div className="bg-zinc-950/80 border border-zinc-700 px-3 py-1.5 flex items-center">
                      <span className="text-[10px] font-mono text-[#10FF88] font-black tracking-widest uppercase">€{event.minimumSpend} MIN</span>
                    </div>
                  ) : event.ticketPrice > 0 ? (
                    <div className="bg-zinc-950/80 border border-zinc-700 px-3 py-1.5 flex items-center">
                      <span className="text-[10px] font-mono text-blue-400 font-black tracking-widest uppercase">€{event.ticketPrice} TICKET</span>
                    </div>
                  ) : null}
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <div className="p-5 pb-3 border-b border-zinc-800">
                    <h2 className="text-3xl font-display font-normal text-white uppercase tracking-tighter leading-none mb-1">
                      {event.name}
                    </h2>
                    {event.description && (
                      <p className="text-[10px] font-mono text-zinc-400 font-bold tracking-widest uppercase line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="px-5 py-3 flex items-center justify-between text-[10px] text-zinc-400 font-mono border-b border-zinc-800 bg-zinc-950/60">
                    <span className="uppercase font-bold tracking-widest">[ {venue?.name || 'TBA'} ]</span>
                    <span className="uppercase font-bold tracking-widest text-[#10FF88]">
                      [ {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - LATE ]
                    </span>
                  </div>

                  <div className="p-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className="w-full py-3.5 bg-zinc-900 border-2 border-white text-[11px] font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em]"
                    >
                      CONFIRM ACCESS
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-28">
            <svg className="w-16 h-16 mx-auto mb-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="text-3xl font-display font-normal text-white uppercase tracking-tighter mb-4">NO EVENTS FOUND</h3>
            <p className="text-sm text-zinc-500 font-mono uppercase tracking-wider mb-8">
              Try adjusting your filters above
            </p>
            <button
              onClick={() => { setDayFilter('today'); setGenreFilter('all'); setEntranceFilter('all'); }}
              className="border border-zinc-700 text-zinc-400 px-6 py-3 rounded-sm hover:border-zinc-500 hover:text-white transition-all text-[10px] tracking-widest uppercase font-black"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom nav ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800">
        <div className="flex items-center justify-around py-4 pb-8 px-6">
          <button className="flex flex-col items-center space-y-1 group">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
          <button className="flex flex-col items-center space-y-1 group opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="flex flex-col items-center space-y-1 group opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </button>
          <button className="flex flex-col items-center space-y-1 group opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
