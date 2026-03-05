import { useState, useMemo } from 'react';
import EventCard from './EventCard';

const VIBE_FILTERS = [
  { id: 'all', label: 'ALL EVENTS', code: '[*]' },
  { id: 'House', label: 'HOUSE', code: '[H]' },
  { id: 'Techno', label: 'TECHNO', code: '[T]' },
  { id: 'Commercial', label: 'COMMERCIAL', code: '[C]' },
  { id: 'Live Music', label: 'LIVE', code: '[L]' },
  { id: 'Hip Hop', label: 'HIP HOP', code: '[HH]' },
  { id: 'Chill', label: 'CHILL', code: '[CH]' }
];

const DATE_FILTERS = [
  { id: 'all', label: 'ALL DATES', code: '[∞]' },
  { id: 'today', label: 'TODAY', code: '[24H]' },
  { id: 'thisWeek', label: 'THIS WEEK', code: '[7D]' }
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
        <div className="relative">
          <div className="w-12 h-12 border-2 border-zinc-800 border-t-[#10FF88] rounded-none animate-spin" />
          <div className="absolute inset-0 border border-zinc-700 rounded-none animate-pulse" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 pb-32">
      {/* Industrial Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 to-transparent border-l-2 border-[#10FF88]/30" />
        <div className="relative p-6 border-2 border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl text-white uppercase tracking-tighter mb-1">
                EVENT MATRIX
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#10FF88] animate-pulse" />
                <p className="text-xs font-mono text-zinc-400 font-bold tracking-widest uppercase">
                  [ {filteredEvents.length} ACTIVE SIGNALS ]
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-zinc-500">
              <div>STATUS: ONLINE</div>
              <div>SYNC: {new Date().toLocaleTimeString('en-GB', { hour12: false })}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Industrial Date Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-4 bg-[#10FF88]" />
          <span className="text-xs font-mono text-zinc-400 font-bold tracking-widest uppercase">
            TEMPORAL FILTER
          </span>
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {DATE_FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => onDateChange(filter.id)}
              className={`
                px-6 py-3 border-2 text-xs font-bold tracking-widest uppercase whitespace-nowrap
                transition-all duration-300 font-mono relative group
                ${dateFilter === filter.id
                  ? 'bg-zinc-800 text-[#10FF88] border-[#10FF88]/50 shadow-[0_0_12px_rgba(16,255,136,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                }
              `}
            >
              <span className="relative z-10">{filter.code} {filter.label}</span>
              {dateFilter === filter.id && (
                <div className="absolute inset-0 border border-[#10FF88]/20 m-1" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Industrial Vibe Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-4 bg-[#10FF88]" />
          <span className="text-xs font-mono text-zinc-400 font-bold tracking-widest uppercase">
            FREQUENCY SELECTOR
          </span>
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {VIBE_FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => onVibeChange(filter.id)}
              className={`
                px-6 py-3 border-2 text-xs font-bold tracking-widest uppercase whitespace-nowrap
                transition-all duration-300 font-mono relative group
                ${vibeFilter === filter.id
                  ? 'bg-zinc-800 text-[#10FF88] border-[#10FF88]/50 shadow-[0_0_12px_rgba(16,255,136,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                }
              `}
            >
              <span className="relative z-10">{filter.code} {filter.label}</span>
              {vibeFilter === filter.id && (
                <div className="absolute inset-0 border border-[#10FF88]/20 m-1" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-8">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Connection Line */}
              {index > 0 && (
                <div className="absolute -top-4 left-6 w-px h-4 bg-gradient-to-b from-zinc-800 to-transparent" />
              )}
              
              {/* Event Node */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-8">
                  <div className="w-3 h-3 bg-[#10FF88] relative">
                    <div className="absolute inset-0 bg-[#10FF88] animate-ping opacity-30" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <EventCard
                    event={event}
                    venue={getVenueForEvent(event)}
                    isDayMode={isDayMode}
                    onClick={() => onEventClick(event)}
                    isIndustrial={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Industrial Empty State */
        <div className="relative">
          <div className="border-2 border-zinc-800 bg-zinc-950/50 p-12 text-center relative overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: 'linear-gradient(rgba(16, 255, 136, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 255, 136, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 border-2 border-zinc-800 mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 border border-zinc-700" />
              </div>
              
              <h3 className="font-display text-2xl text-white uppercase tracking-tighter mb-2">
                NO SIGNALS DETECTED
              </h3>
              
              <p className="text-sm font-mono text-zinc-400 mb-6 tracking-wide">
                {vibeFilter !== 'all' 
                  ? `[ ${vibeFilter.toUpperCase()} FREQUENCY EMPTY ]`
                  : '[ SCANNING FOR EVENTS... ]'
                }
              </p>
              
              {vibeFilter !== 'all' && (
                <button
                  onClick={() => onVibeChange('all')}
                  className="px-8 py-3 bg-zinc-900 border-2 border-white text-white hover:bg-white hover:text-zinc-900 transition-all font-mono text-xs font-bold tracking-widest uppercase"
                >
                  RESET FILTERS
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
