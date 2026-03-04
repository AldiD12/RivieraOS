import { useState, useMemo } from 'react';
import EventCard from './EventCard';

const VIBE_FILTERS = [
  { id: 'all', label: 'ALL', emoji: '🎉' },
  { id: 'House', label: 'HOUSE', emoji: '🎵' },
  { id: 'Techno', label: 'TECHNO', emoji: '⚡' },
  { id: 'Commercial', label: 'COMMERCIAL', emoji: '🎤' },
  { id: 'Live Music', label: 'LIVE', emoji: '🎸' },
  { id: 'Hip Hop', label: 'HIP HOP', emoji: '🎧' },
  { id: 'Chill', label: 'CHILL', emoji: '🌊' }
];

const DATE_FILTERS = [
  { id: 'all', label: 'ALL DATES' },
  { id: 'today', label: 'TODAY' },
  { id: 'thisWeek', label: 'THIS WEEK' }
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
  isDayMode 
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="space-y-2">
        <h2 className={`
          text-3xl font-light tracking-tight
          ${isDayMode ? 'text-stone-900' : 'text-white'}
        `}>
          Upcoming Events
        </h2>
        <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
        </p>
      </div>
      
      {/* Date Filter Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {DATE_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onDateChange(filter.id)}
            className={`
              px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap
              transition-all duration-300
              ${dateFilter === filter.id
                ? isDayMode
                  ? 'bg-stone-900 text-stone-50 shadow-md'
                  : 'bg-zinc-800 text-white border border-[#10FF88]/30 shadow-[0_0_12px_rgba(16,255,136,0.2)]'
                : isDayMode
                ? 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Vibe Filter Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {VIBE_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onVibeChange(filter.id)}
            className={`
              px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap
              transition-all duration-300 flex items-center space-x-1.5
              ${vibeFilter === filter.id
                ? isDayMode
                  ? 'bg-stone-900 text-stone-50 shadow-md'
                  : 'bg-zinc-800 text-white border border-[#10FF88]/30 shadow-[0_0_12px_rgba(16,255,136,0.2)]'
                : isDayMode
                ? 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }
            `}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
      
      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              venue={getVenueForEvent(event)}
              isDayMode={isDayMode}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`
          text-center py-16 px-6 rounded-[2rem] border
          ${isDayMode
            ? 'bg-white border-stone-200/40'
            : 'bg-zinc-900/50 border-zinc-800/50'
          }
        `}>
          <div className="text-6xl mb-4 opacity-20">
            {vibeFilter !== 'all' ? '🎵' : '🎉'}
          </div>
          <h3 className={`text-xl font-medium mb-2 ${isDayMode ? 'text-stone-900' : 'text-white'}`}>
            {vibeFilter !== 'all' ? `No ${vibeFilter} Events` : 'No Events Yet'}
          </h3>
          <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
            {vibeFilter !== 'all' 
              ? 'Try a different vibe or check back later.'
              : 'Check back soon for upcoming events at the hottest venues on the Albanian Riviera.'
            }
          </p>
          {vibeFilter !== 'all' && (
            <button
              onClick={() => onVibeChange('all')}
              className={`
                mt-4 px-6 py-2 rounded-full text-sm font-medium
                transition-all duration-300
                ${isDayMode
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                }
              `}
            >
              Show All Events
            </button>
          )}
        </div>
      )}
    </div>
  );
}
