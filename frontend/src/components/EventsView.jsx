import { useState, useMemo } from 'react';

const VIBE_FILTERS = [
  { id: 'all', label: 'ALL EVENTS' },
  { id: 'Techno', label: 'TECHNO' },
  { id: 'House', label: 'HOUSE' },
  { id: 'Live Music', label: 'LIVE' },
  { id: 'Commercial', label: 'COMMERCIAL' },
  { id: 'Hip Hop', label: 'HIP HOP' },
  { id: 'Chill', label: 'CHILL' }
];

export default function EventsView({ 
  events, 
  venues,
  loading, 
  vibeFilter, 
  dateFilter,
  onVibeChange, 
  onDateChange,
  onEventClick,
  isDayMode,
  standalone = false // New prop to determine if this is standalone or embedded
}) {
  // Filter events by vibe
  const vibeFilteredEvents = useMemo(() => {
    if (vibeFilter === 'all') return events;
    return events.filter(event => event.vibe === vibeFilter);
  }, [events, vibeFilter]);
  
  // Filter events by date
  const filteredEvents = useMemo(() => {
    if (dateFilter === 'all') return vibeFilteredEvents;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(today.getDate() + 7);
    
    return vibeFilteredEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      
      if (dateFilter === 'today') {
        return eventDate >= today && eventDate < tomorrow;
      }
      if (dateFilter === 'thisWeek') {
        return eventDate >= today && eventDate < thisWeekEnd;
      }
      return true;
    });
  }, [vibeFilteredEvents, dateFilter]);
  
  // Get venue for event
  const getVenueForEvent = (event) => {
    return venues.find(v => v.id === event.venueId);
  };
  
  if (loading) {
    return (
      <div className="bg-zinc-950 text-white h-screen w-full overflow-hidden relative font-sans antialiased bg-grain">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-zinc-800 border-t-[#10FF88] rounded-full animate-spin"></div>
          <p className="text-lg text-zinc-400">Loading events...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-zinc-950 text-white h-screen w-full overflow-hidden relative font-sans antialiased bg-grain">
      {/* Top Header - Exact from HTML */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="pointer-events-auto pt-14 px-6 flex flex-col items-start space-y-4 bg-zinc-950/90 backdrop-blur-xl border-b-2 border-zinc-800 pb-4 relative">
          
          {/* Day/Night Toggle */}
          <div className="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
            <div className="bg-zinc-900 border-2 border-zinc-800 p-0.5 rounded-sm flex pointer-events-auto shadow-xl">
              <button className="flex items-center space-x-1.5 px-6 py-2 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all bg-zinc-900 text-zinc-500 hover:text-zinc-300 industrial-switch">
                <span>DAY</span>
              </button>
              <button className="flex items-center space-x-1.5 px-6 py-2 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all text-white industrial-switch-active">
                <span>NIGHT</span>
              </button>
            </div>
          </div>
          
          {/* Main Header */}
          <div className="flex justify-between items-start w-full relative z-20 pt-8">
            <div>
              <h1 className="font-display text-4xl text-white tracking-tighter uppercase drop-shadow-sm">XIXA</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-none bg-[#10FF88] shadow-[0_0_8px_rgba(16,255,136,0.8)] animate-pulse"></div>
                <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase">[ ALBANIAN RIVIERA ]</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-3 pt-0">
              <div className="flex space-x-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-sm border-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-all group shadow-sm">
                  <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-sm border-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-all group shadow-sm">
                  <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
              
              {/* List/Map Toggle */}
              <div className="flex items-center bg-zinc-900 border-2 border-zinc-800 rounded-sm p-0.5 shadow-lg">
                <button className="px-4 py-2 flex items-center space-x-2 text-[10px] uppercase font-black tracking-widest text-[#10FF88] bg-zinc-800 rounded-none border border-zinc-700 mr-0.5 shadow-[0_0_12px_rgba(16,255,136,0.15)]">
                  <span>[ LIST ]</span>
                </button>
                <button className="px-4 py-2 flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors border-l border-zinc-800 bg-zinc-900">
                  <span>[ MAP ]</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter Buttons - Exact from HTML */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar w-full pt-4 pl-0.5 border-t border-zinc-800 mt-4 pt-4">
            <button 
              onClick={() => onVibeChange('all')}
              className={`whitespace-nowrap px-6 py-2 rounded-sm border-2 text-[10px] font-black tracking-widest uppercase transform active:scale-95 transition-all ${
                vibeFilter === 'all' 
                  ? 'bg-zinc-800 border-zinc-700 text-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.15)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              [ ALL EVENTS ]
            </button>
            {VIBE_FILTERS.slice(1).map(filter => (
              <button
                key={filter.id}
                onClick={() => onVibeChange(filter.id)}
                className={`whitespace-nowrap px-6 py-2 rounded-sm border-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  vibeFilter === filter.id
                    ? 'bg-zinc-800 border-zinc-700 text-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.15)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Events List - Exact from HTML */}
      <div className="absolute inset-0 pt-[250px] pb-[100px] overflow-y-auto no-scrollbar z-10 px-6 space-y-8">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const venue = getVenueForEvent(event);
            const eventDate = new Date(event.startTime);
            
            return (
              <div 
                key={event.id} 
                className="relative w-full aspect-[4/5] bg-zinc-900 border-2 border-zinc-800 rounded-sm overflow-hidden group hover:border-zinc-600 transition-all duration-300 shadow-lg cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                {/* Event Image */}
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
                
                {/* Overlays - Exact from HTML */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-0 z-10 pointer-events-none border border-zinc-800/50 m-2 rounded-sm"></div>
                <div className="absolute inset-0 z-10 pointer-events-none border border-zinc-800/50 m-4 rounded-sm"></div>
                
                {/* Top Bar - Exact from HTML */}
                <div className="absolute top-0 left-0 z-20 w-full flex justify-between p-4 border-b border-zinc-800/50">
                  <div className="bg-zinc-900 px-4 py-2 rounded-none border border-zinc-800 flex flex-col items-center justify-center font-mono">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
                      {eventDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-xl font-black text-white leading-none mt-1">
                      {eventDate.getDate()}
                    </span>
                  </div>
                  
                  {/* Entry Badge - Only show if free entry */}
                  {(!event.isTicketed || event.ticketPrice === 0) && event.minimumSpend === 0 && (
                    <div className="bg-zinc-900 px-4 py-2 border border-zinc-800 rounded-none flex items-center">
                      <span className="text-[10px] font-mono text-zinc-300 font-black tracking-widest uppercase">[ FREE ENTRY ]</span>
                    </div>
                  )}
                </div>
                
                {/* Bottom Content - Exact from HTML */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end">
                  <div className="p-6 pb-4 border-b border-zinc-800">
                    <h2 className="text-4xl font-display font-normal text-white uppercase tracking-tighter mb-1 leading-none">
                      {event.name}
                    </h2>
                    {event.description && (
                      <p className="text-xs font-mono text-zinc-400 font-bold tracking-widest uppercase">
                        {event.description.substring(0, 30)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="px-6 py-4 flex items-center justify-between text-xs text-zinc-400 font-mono border-b border-zinc-800 bg-zinc-950/50">
                    <span className="uppercase font-bold tracking-widest text-[10px]">
                      [ {venue?.name || 'TBA'} ]
                    </span>
                    <span className="uppercase font-bold tracking-widest text-[10px] text-[#10FF88]">
                      [ {eventDate.toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - LATE ]
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="w-full py-4 bg-zinc-900 border-2 border-white rounded-none text-[12px] font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em]"
                    >
                      CONFIRM ACCESS
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="text-center py-32">
            <div className="text-zinc-400 mb-12">
              <svg className="w-24 h-24 mx-auto mb-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-4xl font-display font-normal text-white uppercase tracking-tighter mb-6">
              NO EVENTS FOUND
            </h3>
            <p className="text-lg text-zinc-400 mb-12 max-w-md mx-auto leading-relaxed font-mono">
              {vibeFilter !== 'all' 
                ? `[ NO ${vibeFilter.toUpperCase()} EVENTS MATCH CRITERIA ]`
                : '[ NO EVENTS CURRENTLY AVAILABLE ]'
              }
            </p>
            
            {vibeFilter !== 'all' && (
              <button
                onClick={() => onVibeChange('all')}
                className="border-2 border-zinc-800 text-zinc-400 px-8 py-4 rounded-sm hover:border-zinc-600 hover:bg-zinc-900 transition-all duration-300 text-[10px] tracking-widest uppercase font-black"
              >
                [ VIEW ALL EVENTS ]
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom Navigation - Exact from HTML */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t-2 border-zinc-800">
        <div className="flex items-center justify-around py-4 pb-8 px-6">
          <button className="flex flex-col items-center space-y-1 group">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
          <button className="flex flex-col items-center space-y-1 group opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="flex flex-col items-center space-y-1 group opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </button>
          <button className="flex flex-col items-center space-y-1 group opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
