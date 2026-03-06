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
        <div className="w-16 h-16 mx-auto mb-6 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
        <p className="text-lg text-stone-500">Loading events...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-16 pb-32">
      {/* Ultra-Luxury Header */}
      <div className="text-center py-16">
        <h2 className="font-serif text-6xl md:text-7xl font-light tracking-tighter text-stone-900 leading-none mb-6">
          Exclusive Events
        </h2>
        <div className="flex items-center justify-center space-x-4 text-stone-500">
          <div className="text-sm uppercase tracking-widest font-medium">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Available
          </div>
          <div className="w-1 h-1 bg-stone-400 rounded-full"></div>
          <div className="text-sm uppercase tracking-widest font-medium">
            Albanian Riviera
          </div>
        </div>
      </div>
      
      {/* Luxury Date Filter */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-sm uppercase text-stone-500 tracking-widest font-medium mb-8">
            Select Dates
          </h3>
        </div>
        <div className="flex justify-center">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {DATE_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => onDateChange(filter.id)}
                className={`
                  px-8 py-4 rounded-full text-sm font-medium tracking-widest uppercase whitespace-nowrap
                  transition-all duration-300
                  ${dateFilter === filter.id
                    ? 'bg-stone-900 text-stone-50 shadow-[0_4px_14px_rgba(0,0,0,0.1)]'
                    : 'border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Luxury Vibe Filter */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-sm uppercase text-stone-500 tracking-widest font-medium mb-8">
            Music & Atmosphere
          </h3>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
            {VIBE_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => onVibeChange(filter.id)}
                className={`
                  px-8 py-4 rounded-full text-sm font-medium tracking-widest uppercase
                  transition-all duration-300
                  ${vibeFilter === filter.id
                    ? 'bg-stone-900 text-stone-50 shadow-[0_4px_14px_rgba(0,0,0,0.1)]'
                    : 'border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Events Grid - Ultra-Luxury Cards */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-16">
          {filteredEvents.map((event) => {
            const venue = getVenueForEvent(event);
            const eventDate = new Date(event.startTime);
            const isToday = eventDate.toDateString() === new Date().toDateString();
            const isUpcoming = eventDate > new Date();
            
            return (
              <div 
                key={event.id} 
                className="group relative overflow-hidden rounded-[2rem] cursor-pointer bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl border border-stone-200/40 hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out hover:-translate-y-2"
                onClick={() => onEventClick(event)}
              >
                {/* Event Image */}
                <div className="relative h-80 w-full overflow-hidden bg-stone-100 rounded-t-[2rem]">
                  {/* Status Badge - Top Left */}
                  <div className="absolute top-8 left-8 z-20">
                    {isToday && isUpcoming && (
                      <span className="px-6 py-3 text-xs font-medium uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 backdrop-blur-md">
                        <span className="w-2 h-2 bg-emerald-500 inline-block mr-3 rounded-full animate-pulse"></span>
                        TODAY
                      </span>
                    )}
                    {isUpcoming && !isToday && (
                      <span className="px-6 py-3 text-xs font-medium uppercase tracking-widest rounded-full bg-white/90 text-stone-700 border border-stone-200 backdrop-blur-md">
                        UPCOMING
                      </span>
                    )}
                  </div>
                  
                  {/* VIP Badge - Top Right */}
                  {event.minimumSpend > 0 && (
                    <div className="absolute top-8 right-8 z-20">
                      <span className="px-6 py-3 text-xs font-medium uppercase tracking-widest rounded-full bg-amber-50 text-amber-800 border border-amber-200 backdrop-blur-md">
                        VIP TABLES
                      </span>
                    </div>
                  )}
                  
                  {/* Event Image or Placeholder */}
                  {event.flyerImageUrl ? (
                    <img 
                      alt={event.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      src={event.flyerImageUrl}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 bg-gradient-to-br from-stone-100 to-stone-200">
                      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"></div>
                  
                  {/* Venue Badge - Bottom */}
                  {venue && (
                    <div className="absolute bottom-8 left-8 text-white">
                      <div className="flex items-center space-x-3 text-sm uppercase tracking-widest font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{venue.name}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Event Info - Ultra-Luxury Spacing */}
                <div className="p-12 md:p-16">
                  {/* Header with massive whitespace */}
                  <div className="mb-12">
                    <h3 className="font-serif text-5xl md:text-6xl font-light tracking-tighter text-stone-900 leading-none mb-6">
                      {event.name}
                    </h3>
                    <div className="flex items-center space-x-6 text-stone-500">
                      <div className="text-sm uppercase tracking-widest font-medium">
                        {eventDate.toLocaleDateString('en-GB', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                      <div className="w-1 h-1 bg-stone-400 rounded-full"></div>
                      <div className="text-2xl font-serif text-stone-900">
                        {eventDate.toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Description with generous spacing */}
                  <p className="text-xl leading-relaxed mb-16 font-sans text-stone-600 max-w-3xl">
                    {event.description || 'An exclusive nightlife experience awaits you at one of the Riviera\'s most prestigious venues.'}
                  </p>
                  
                  {/* Pricing Grid - Cleaner */}
                  <div className="grid grid-cols-2 gap-16 mb-16">
                    <div className="flex flex-col space-y-3">
                      <span className="text-sm uppercase text-stone-500 tracking-widest font-medium">Entry Fee</span>
                      <span className="text-5xl font-serif font-light text-amber-900">
                        {event.isTicketed && event.ticketPrice > 0 
                          ? `€${event.ticketPrice}` 
                          : 'Free'
                        }
                      </span>
                    </div>
                    {event.minimumSpend > 0 && (
                      <div className="flex flex-col space-y-3">
                        <span className="text-sm uppercase text-stone-500 tracking-widest font-medium">Table Minimum</span>
                        <span className="text-5xl font-serif font-light text-amber-900">
                          €{event.minimumSpend}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Vibe Tags - Minimal */}
                  {event.vibe && (
                    <div className="flex justify-center mb-16">
                      <span className="px-6 py-3 text-sm font-medium uppercase tracking-widest rounded-full bg-stone-50 border border-stone-200/60 text-stone-700">
                        {event.vibe}
                      </span>
                    </div>
                  )}
                  
                  {/* Action Button - Single, Prominent */}
                  <div className="text-center pt-8">
                    <button className="bg-stone-900 text-stone-50 px-12 py-5 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)] font-medium">
                      Reserve via WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Ultra-Luxury Empty State */
        <div className="text-center py-32">
          <div className="text-stone-400 mb-12">
            <svg className="w-24 h-24 mx-auto mb-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="font-serif text-4xl font-light text-stone-700 mb-6 tracking-tight">No events found</h3>
          <p className="text-xl text-stone-500 mb-12 max-w-md mx-auto leading-relaxed">
            {vibeFilter !== 'all' 
              ? `No ${vibeFilter.toLowerCase()} events match your criteria. Try adjusting your filters.`
              : 'No events are currently available. Please check back later for new experiences.'
            }
          </p>
          
          {vibeFilter !== 'all' && (
            <button
              onClick={() => onVibeChange('all')}
              className="border border-stone-300 text-stone-700 px-8 py-4 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300 text-sm tracking-widest uppercase font-medium"
            >
              View All Events
            </button>
          )}
        </div>
      )}
    </div>
  );
}
