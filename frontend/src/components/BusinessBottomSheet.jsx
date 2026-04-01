import { useState, useEffect, lazy, Suspense } from 'react';
import { publicEventsApi } from '../services/eventsApi';
import { calculateDistance } from '../utils/locationUtils';

const MenuPreview = lazy(() => import('./MenuPreview'));

export default function BusinessBottomSheet({ business, onClose, onVenueSelect, isDayMode, userLocation }) {
  if (!business) return null;

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [menuVenue, setMenuVenue] = useState(null); // venue to show menu for

  // Fetch real events for this business from API
  useEffect(() => {
    if (!business.id) return;

    let cancelled = false;
    setEventsLoading(true);

    publicEventsApi.getEventsByBusiness(business.id)
      .then(events => {
        if (cancelled) return;
        const now = new Date();
        const upcoming = (Array.isArray(events) ? events : [])
          .filter(e => {
            const end = e.endTime ? new Date(e.endTime) : new Date(new Date(e.startTime).getTime() + 6 * 3600000);
            return end > now && (e.isPublished !== false) && !e.isDeleted;
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 3); // Show max 3 upcoming
        setUpcomingEvents(upcoming);
      })
      .catch(() => { if (!cancelled) setUpcomingEvents([]); })
      .finally(() => { if (!cancelled) setEventsLoading(false); });

    return () => { cancelled = true; };
  }, [business.id]);

  const getSafeType = (v) => (v.type || v.venueType || v.category || '').toLowerCase();

  // Extract action zones from real venue data
  const beachVenue = business.venues.find(v =>
    getSafeType(v).includes('beach') || getSafeType(v).includes('sunbed')
  );
  const restaurantVenue = business.venues.find(v =>
    getSafeType(v).includes('restaurant') || getSafeType(v).includes('dining')
  );

  // Build amenities ONLY from actual venue types (no fake ones)
  const getAmenityIcons = () => {
    const amenities = [];
    const seen = new Set();

    business.venues.forEach(venue => {
      const t = getSafeType(venue);
      let item = null;

      if ((t.includes('beach') || t.includes('sunbed')) && !seen.has('beach')) {
        item = { icon: '🏖️', name: 'Private Beach' };
        seen.add('beach');
      } else if ((t.includes('restaurant') || t.includes('dining')) && !seen.has('restaurant')) {
        item = { icon: '🍽️', name: 'Restaurant' };
        seen.add('restaurant');
      } else if (t.includes('bar') && !seen.has('bar')) {
        item = { icon: '🍸', name: 'Bar' };
        seen.add('bar');
      } else if (t.includes('pool') && !seen.has('pool')) {
        item = { icon: '🏊', name: 'Pool' };
        seen.add('pool');
      } else if (t.includes('lounge') && !seen.has('lounge')) {
        item = { icon: '🛋️', name: 'Lounge' };
        seen.add('lounge');
      } else if ((t.includes('yacht') || t.includes('boat')) && !seen.has('yacht')) {
        item = { icon: '⛵', name: 'Yacht Charter' };
        seen.add('yacht');
      } else if (t.includes('club') && !seen.has('club')) {
        item = { icon: '🪩', name: 'Beach Club' };
        seen.add('club');
      } else if (t && !seen.has(t)) {
        item = { icon: '✨', name: venue.type || venue.name };
        seen.add(t);
      }

      if (item) amenities.push(item);
    });

    return amenities.slice(0, 6);
  };

  // Calculate distance from user if available
  const distanceText = (() => {
    if (!userLocation || !business.latitude || !business.longitude) return null;
    const km = calculateDistance(
      userLocation.latitude, userLocation.longitude,
      business.latitude, business.longitude
    );
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)}km away`;
  })();

  // Get real WhatsApp number from venues
  const getWhatsAppNumber = () => {
    for (const v of business.venues) {
      const num = v.whatsappNumber || v.whatsAppNumber || v.phone;
      if (num) return num;
    }
    return null;
  };

  const startDirectBooking = (venueId) => {
    const venue = business.venues.find(v => v.id === venueId);
    if (venue) onVenueSelect(venue);
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const message = encodeURIComponent(`Hi! I'd like to make a reservation at ${business.name}`);
    window.open(`https://wa.me/${phone.replace(/[^\d+]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
      <div className="bg-[#F6F5F2] text-[#111111] p-6 rounded-t-3xl shadow-2xl">

        {/* TITLE & HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-serif text-4xl uppercase tracking-tight">{business.name}</h1>
            {distanceText && (
              <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">{distanceText}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-zinc-200 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* REAL AMENITIES (only from actual venue types) */}
        {getAmenityIcons().length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {getAmenityIcons().map((amenity, index) => (
              <span
                key={index}
                className="border border-zinc-300 px-3 py-1 text-xs font-mono uppercase rounded-full"
              >
                {amenity.icon} {amenity.name}
              </span>
            ))}
          </div>
        )}

        {/* ACTION ZONES */}
        <div className="flex flex-col gap-4">

          {/* BEACH CARD (Direct Booking) */}
          {beachVenue && (
            <div className="bg-white border border-zinc-300 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="font-sans font-bold text-lg">{beachVenue.name || 'THE BEACH'}</h3>
                <p className="flex items-center gap-2 text-[#10B981] font-mono text-xs mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                  {beachVenue.availableUnitsCount || 0} BEDS AVAILABLE
                </p>
              </div>
              <button
                onClick={() => startDirectBooking(beachVenue.id)}
                className="bg-[#111111] text-white px-4 py-3 font-mono text-xs uppercase font-bold hover:bg-zinc-800 transition-colors rounded-full"
              >
                Secure Sunbed
              </button>
            </div>
          )}

          {/* RESTAURANT CARD */}
          {restaurantVenue && (
            <div className="bg-white border border-zinc-300 p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-sans font-bold text-lg">{restaurantVenue.name || 'RESTAURANT'}</h3>
                  {restaurantVenue.description ? (
                    <p className="text-zinc-500 font-mono text-xs mt-1 line-clamp-1">{restaurantVenue.description}</p>
                  ) : (
                    <p className="text-zinc-500 font-mono text-xs mt-1">Reserve a table</p>
                  )}
                </div>
                {getWhatsAppNumber() ? (
                  <button
                    onClick={() => openWhatsApp(getWhatsAppNumber())}
                    className="border border-[#111111] text-[#111111] px-4 py-3 font-mono text-xs uppercase font-bold hover:bg-zinc-100 transition-colors shrink-0 ml-3 rounded-full"
                  >
                    Request Table
                  </button>
                ) : (
                  <button
                    onClick={() => startDirectBooking(restaurantVenue.id)}
                    className="border border-[#111111] text-[#111111] px-4 py-3 font-mono text-xs uppercase font-bold hover:bg-zinc-100 transition-colors shrink-0 ml-3 rounded-full"
                  >
                    View Details
                  </button>
                )}
              </div>
              {/* View Menu button */}
              <button
                onClick={() => setMenuVenue(restaurantVenue)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-200 text-zinc-600 font-mono text-xs uppercase tracking-wider hover:bg-zinc-50 transition-colors rounded-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Menu
              </button>
            </div>
          )}

          {/* UPCOMING EVENTS (from real API) */}
          {eventsLoading && (
            <div className="py-3 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin"></div>
              <span className="text-xs font-mono text-zinc-400 uppercase">Loading events...</span>
            </div>
          )}

          {!eventsLoading && upcomingEvents.length > 0 && (
            <div className="mt-2">
              <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Upcoming Events</h3>
              {upcomingEvents.map(event => {
                const date = new Date(event.startTime);
                const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={event.id} className="bg-white border border-zinc-300 p-3 rounded-2xl mb-2 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans font-bold text-sm truncate">{event.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-zinc-500">{dateStr} {timeStr}</span>
                        {event.vibe && (
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">{event.vibe}</span>
                        )}
                        {event.maxGuests > 0 && (
                          <span className="text-[10px] font-mono text-zinc-400">{event.maxGuests} max</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 shrink-0">
                      {event.minimumSpend > 0 ? (
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1">€{event.minimumSpend} MIN</span>
                      ) : event.isTicketed && event.ticketPrice > 0 ? (
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1">€{event.ticketPrice}</span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1">FREE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu Preview Modal */}
        {menuVenue && (
          <Suspense fallback={null}>
            <MenuPreview
              venueId={menuVenue.id}
              venueName={menuVenue.name || business.name}
              isDayMode={true}
              onClose={() => setMenuVenue(null)}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
