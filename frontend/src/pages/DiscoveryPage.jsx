import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { venueApi } from '../services/venueApi';
import { publicEventsApi } from '../services/eventsApi';
import VenueBottomSheet from '../components/VenueBottomSheet';
import BusinessBottomSheet from '../components/BusinessBottomSheet';
import EventsView from '../components/EventsView';

// Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// 🎯 XIXA: Clean 3D map without POIs (Warm-copy style with POIs disabled)
const DARK_STYLE = "mapbox://styles/aldid1602/cmmbysf09002i01s95t611fmm";

// Map configuration
const MAP_CONFIG = {
  interactiveLayerIds: [],
  clickTolerance: 0
};

// Albanian Riviera center
const RIVIERA_CENTER = {
  longitude: 19.6644,
  latitude: 40.1500,
  zoom: 13,
  pitch: 45,
  bearing: -10
};

// Venue filters (for day mode)
const VENUE_FILTERS = [
  { id: 'all', label: 'ALL VENUES' },
  { id: 'Beach', label: 'BEACH CLUBS' },
  { id: 'Boat', label: 'BOATS' },
  { id: 'Restaurant', label: 'DINING' }
];

// Event filters (for night mode)
const EVENT_FILTERS = [
  { id: 'all', label: 'ALL EVENTS' },
  { id: 'today', label: 'TODAY' },
  { id: 'weekend', label: 'WEEKEND' },
  { id: 'vip', label: 'VIP TABLES' },
  { id: 'free', label: 'FREE ENTRY' }
];

// 🎯 XIXA Atmospheric Marker with pulsing ring (theme-aware)
function VenueMarker({ venue, isSelected, onClick, isDayMode }) {
  // Only show availability for Beach venues (sunbeds)
  const isBeachVenue = venue.type === 'Beach' || venue.type === 'BEACH';
  const isFull = isBeachVenue && venue.availableUnitsCount === 0;
  const isHighlight = isBeachVenue && venue.availableUnitsCount >= 15;
  const hasAvailability = isBeachVenue && venue.availableUnitsCount > 0;
  
  return (
    <div 
      className="relative flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Pulsing ring for highlighted beach venues only */}
      {isHighlight && !isFull && (
        <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className={`absolute inset-0 rounded-full border opacity-50 ${isDayMode ? 'border-zinc-950' : 'border-[#10FF88]'}`}
               style={{ animation: 'pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1)' }}></div>
          <div className={`absolute inset-0 rounded-full animate-pulse ${isDayMode ? 'bg-xixa-green/30' : 'bg-[#10FF88]/20'}`}></div>
        </div>
      )}
      
      {/* Main marker */}
      <div 
        className={`
          relative flex items-center justify-center rounded-full z-10
          transition-all duration-300
          ${isBeachVenue
            ? isHighlight && !isFull 
              ? isDayMode
                ? 'w-10 h-10 bg-stone-50 border border-zinc-950 shadow-lg'
                : 'w-10 h-10 bg-zinc-950 border border-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)]'
              : isFull
              ? isDayMode
                ? 'w-5 h-5 bg-white border border-zinc-400 shadow-sm'
                : 'w-5 h-5 bg-zinc-900 border border-zinc-600 shadow-lg'
              : isDayMode
              ? 'w-8 h-8 bg-stone-50 border border-zinc-950 shadow-lg'
              : 'w-8 h-8 bg-zinc-950 border border-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)]'
            : isDayMode
            ? 'w-8 h-8 bg-stone-50 border border-zinc-950 shadow-lg'
            : 'w-8 h-8 bg-zinc-950 border border-zinc-700 shadow-lg'
          }
          ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
        `}
      >
        {isBeachVenue ? (
          // Show availability count for beach venues
          <span 
            className={`
              font-bold font-mono
              ${isHighlight && !isFull 
                ? isDayMode
                  ? 'text-xs text-xixa-green'
                  : 'text-xs text-[#10FF88]'
                : isFull
                ? isDayMode
                  ? 'text-[8px] text-zinc-500'
                  : 'text-[8px] text-zinc-400'
                : isDayMode
                ? 'text-[10px] text-xixa-green'
                : 'text-[10px] text-[#10FF88]'
              }
            `}
            style={isDayMode ? {
              textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000'
            } : {}}
          >
            {venue.availableUnitsCount || 0}
          </span>
        ) : (
          // Show venue type icon for non-beach venues (no availability count)
          <div className={`${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
            {venue.type === 'Restaurant' || venue.type === 'RESTAURANT' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
              </svg>
            ) : venue.type === 'Bar' || venue.type === 'BAR' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z"/>
              </svg>
            ) : venue.type === 'Boat' || venue.type === 'BOAT' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
            ) : (
              // Default venue icon
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            )}
          </div>
        )}
      </div>
      
      {/* Venue label */}
      {((isBeachVenue && (isHighlight || isSelected)) || (!isBeachVenue && isSelected)) && (
        <div 
          className={`
            mt-2 px-2 py-1 rounded-sm text-[10px] font-medium tracking-widest uppercase
            backdrop-blur-md 
            transition-opacity duration-300
            ${isDayMode 
              ? 'bg-white/90 border border-zinc-200 text-zinc-800 shadow-sm'
              : 'bg-zinc-950/90 border border-zinc-800 text-zinc-400'
            }
            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          {venue.name}
        </div>
      )}
    </div>
  );
}

// 🌙 Night Mode Event Marker - Shows events on map
function EventMarker({ event, venue, isSelected, onClick, isDayMode }) {
  const eventDate = new Date(event.startTime);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isUpcoming = eventDate > new Date();
  
  return (
    <div 
      className="relative flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Pulsing ring for today's events */}
      {isToday && isUpcoming && (
        <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 rounded-full border border-[#10FF88] opacity-50"
               style={{ animation: 'pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1)' }}></div>
          <div className="absolute inset-0 rounded-full bg-[#10FF88]/20 animate-pulse"></div>
        </div>
      )}
      
      {/* Main event marker */}
      <div 
        className={`
          relative flex items-center justify-center rounded-full z-10
          transition-all duration-300
          ${isToday && isUpcoming
            ? 'w-10 h-10 bg-zinc-950 border border-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)]'
            : isUpcoming
            ? 'w-8 h-8 bg-zinc-950 border border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
            : 'w-6 h-6 bg-zinc-900 border border-zinc-600 shadow-lg opacity-60'
          }
          ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
        `}
      >
        {/* Event icon */}
        <div className={`${isToday && isUpcoming ? 'text-[#10FF88]' : isUpcoming ? 'text-purple-400' : 'text-zinc-500'}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>
      
      {/* Event label */}
      {(isSelected || (isToday && isUpcoming)) && (
        <div 
          className={`
            mt-2 px-2 py-1 rounded-sm text-[10px] font-medium tracking-widest uppercase
            backdrop-blur-md 
            transition-opacity duration-300
            bg-zinc-950/90 border border-zinc-800 text-zinc-400
            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          {event.name}
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  // Force rebuild timestamp: 2026-03-05 15:30
  const mapRef = useRef();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null); // For business grouping
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Beach'); // Default to Beach only
  const [isDayMode, setIsDayMode] = useState(false); // false = night mode (default)
  const [viewMode, setViewMode] = useState('list'); // Start with list for night mode
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [initialViewState, setInitialViewState] = useState(RIVIERA_CENTER);
  const [viewState, setViewState] = useState(RIVIERA_CENTER);
  const [modeInitialized, setModeInitialized] = useState(false); // Track if mode is properly initialized
  
  // Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventVibeFilter, setEventVibeFilter] = useState('all');
  const [eventDateFilter, setEventDateFilter] = useState('all');
  const [activeEventFilter, setActiveEventFilter] = useState('all'); // For night mode event filtering

  // Get user location IMMEDIATELY on mount (before anything else)
  useEffect(() => {
    if ('geolocation' in navigator) {
      // Start geolocation request immediately
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          };
          setUserLocation(userCoords);
          
          // Update initial view state so map starts at user location
          const newViewState = {
            longitude: userCoords.longitude,
            latitude: userCoords.latitude,
            zoom: 14,
            pitch: 45,
            bearing: -10
          };
          setInitialViewState(newViewState);
          setViewState(newViewState);
        },
        (error) => {
          console.log('Geolocation not available, using default location:', error);
          // Keep default RIVIERA_CENTER
        },
        {
          enableHighAccuracy: false, // Faster, less battery
          timeout: 3000, // Reduced to 3 seconds for faster response
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    }
  }, []);

  useEffect(() => {
    loadVenues();
    loadEvents();
  }, []);

  // Initialize day/night mode properly on mount
  useEffect(() => {
    // Small delay to ensure proper mobile initialization
    const initializeMode = () => {
      console.log('🔄 Initializing day/night mode...');
      console.log('📱 Current state:', { isDayMode, viewMode });
      
      // Ensure view mode matches day/night mode on first load
      if (isDayMode && (viewMode === 'events' || viewMode === 'list')) {
        console.log('🌅 Day mode detected, switching to map view');
        setViewMode('map'); // Day mode should show map
      } else if (!isDayMode && viewMode === 'map') {
        console.log('🌙 Night mode detected, switching to list view');
        setViewMode('list'); // Night mode should show list by default
      }
      
      // Mark as initialized
      setModeInitialized(true);
    };
    
    // Run immediately
    initializeMode();
    
    // Also run after a small delay for mobile devices
    const timeoutId = setTimeout(initializeMode, 100);
    
    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await venueApi.getVenues();
      setVenues(data);
    } catch (err) {
      console.error('Failed to load venues:', err);
      setError('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };
  
  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      console.log('🌐 Fetching events from API...');
      const data = await publicEventsApi.getEvents();
      console.log('📦 Raw events API response:', data);
      console.log('📊 Events data type:', typeof data, 'Array?', Array.isArray(data));
      
      // Public API should only return published events
      // Filter only if fields exist, otherwise trust the API
      const published = Array.isArray(data) 
        ? data.filter(e => {
            // If isPublished field exists, check it. Otherwise assume published.
            const isPublished = e.isPublished !== undefined ? e.isPublished : true;
            const isDeleted = e.isDeleted !== undefined ? e.isDeleted : false;
            const result = isPublished && !isDeleted;
            
            if (!result) {
              console.log('🚫 Filtering out event:', e.name, { isPublished, isDeleted });
            }
            
            return result;
          })
        : [];
      
      console.log(`✅ Filtered to ${published.length} published events:`, published);
      setEvents(published);
    } catch (err) {
      console.error('❌ Failed to load events:', err);
      setEvents([]); // Set empty array on error
    } finally {
      setEventsLoading(false);
    }
  };

  // Group venues by business - Alternative approach without Map constructor
  const groupVenuesByBusiness = useCallback((venuesList) => {
    if (!venuesList || !Array.isArray(venuesList)) return [];
    
    // Use plain object instead of Map to avoid minification issues
    const businessMap = {};
    
    venuesList.forEach(venue => {
      // Use businessId if available, otherwise use businessName, fallback to venue name
      const businessKey = venue.businessId || venue.businessName || venue.name;
      const businessName = venue.businessName || venue.name;
      
      if (!businessMap[businessKey]) {
        businessMap[businessKey] = {
          id: businessKey,
          name: businessName,
          venues: [],
          totalAvailableUnits: 0,
          latitude: 0,
          longitude: 0,
          type: venue.type
        };
      }
      
      const business = businessMap[businessKey];
      business.venues.push(venue);
      // Only count availability for beach venues
      if (venue.type === 'Beach' || venue.type === 'BEACH') {
        business.totalAvailableUnits += venue.availableUnitsCount || 0;
      }
    });
    
    // Calculate average coordinates for each business
    Object.values(businessMap).forEach(business => {
      const validVenues = business.venues.filter(v => v.latitude && v.longitude);
      if (validVenues.length > 0) {
        business.latitude = validVenues.reduce((sum, v) => sum + v.latitude, 0) / validVenues.length;
        business.longitude = validVenues.reduce((sum, v) => sum + v.longitude, 0) / validVenues.length;
      }
    });
    
    return Object.values(businessMap);
  }, []);

  const handleBusinessClick = useCallback(async (business) => {
    try {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [business.longitude, business.latitude],
          zoom: 16,
          pitch: 60,
          bearing: -20,
          duration: 1500,
          essential: true
        });
      }
      
      // Load availability for all venues in this business
      const venuesWithAvailability = await Promise.all(
        business.venues.map(async (venue) => {
          try {
            const availability = await venueApi.getVenueAvailability(venue.id);
            return { ...venue, availability };
          } catch (err) {
            console.error(`Failed to load availability for venue ${venue.id}:`, err);
            return { ...venue, availability: null };
          }
        })
      );
      
      setSelectedBusiness({
        ...business,
        venues: venuesWithAvailability
      });
    } catch (err) {
      console.error('Failed to load business venues:', err);
      setSelectedBusiness({
        ...business,
        venues: business.venues.map(v => ({ ...v, availability: null }))
      });
    }
  }, []);

  const handleVenueClick = useCallback(async (venue) => {
    try {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [venue.longitude, venue.latitude],
          zoom: 16,
          pitch: 60,
          bearing: -20,
          duration: 1500,
          essential: true
        });
      }
      
      const availability = await venueApi.getVenueAvailability(venue.id);
      setSelectedVenue({ ...venue, availability });
    } catch (err) {
      console.error('Failed to load availability:', err);
      setSelectedVenue({ ...venue, availability: null });
    }
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedVenue(null);
    setSelectedBusiness(null);
    if (mapRef.current) {
      mapRef.current.flyTo({
        ...RIVIERA_CENTER,
        duration: 1500,
        essential: true
      });
    }
  }, []);
  
  const handleEventClick = (event) => {
    const venue = venues.find(v => v.id === event.venueId);
    if (!venue) {
      console.error('❌ Venue not found for event:', event);
      return;
    }
    
    console.log('🏨 Venue data:', venue);
    console.log('📱 WhatsApp number:', venue.whatsappNumber || venue.whatsAppNumber || venue.phone);
    
    // Check for WhatsApp number in different possible field names
    const whatsappNumber = venue.whatsappNumber || venue.whatsAppNumber || venue.phone;
    
    if (!whatsappNumber) {
      console.error('❌ No WhatsApp number found for venue:', venue.name);
      alert(`Sorry, ${venue.name} doesn't have a WhatsApp number configured yet. Please contact the venue directly.`);
      return;
    }
    
    // Generate WhatsApp message
    const eventDate = new Date(event.startTime).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const eventTime = new Date(event.startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let message = `Hi! I'd like to book for ${event.name} at ${venue.name} on ${eventDate}.\n\n`;
    message += `📅 Event: ${event.name}\n`;
    message += `📍 Venue: ${venue.name}\n`;
    message += `🕐 Date & Time: ${eventDate} at ${eventTime}\n`;
    
    if (event.minimumSpend > 0) {
      message += `💎 Minimum Spend: €${event.minimumSpend} per table\n`;
    } else if (event.isTicketed && event.ticketPrice > 0) {
      message += `🎫 Ticket Price: €${event.ticketPrice}\n`;
    }
    
    message += `\nHow many people: \n`;
    message += `Preferred arrival time: `;
    
    // Clean the phone number (remove any non-digits except +)
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Opening WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  // Filter events based on night mode filters
  const filteredEvents = useMemo(() => {
    console.log('🔍 Filtering events:', { 
      totalEvents: events?.length || 0, 
      activeEventFilter,
      events: events?.slice(0, 3) // Show first 3 events for debugging
    });
    
    if (!events || events.length === 0) {
      console.log('❌ No events to filter');
      return [];
    }
    
    const filtered = events.filter(event => {
      if (activeEventFilter === 'all') return true;
      
      const eventDate = new Date(event.startTime);
      const today = new Date();
      const isToday = eventDate.toDateString() === today.toDateString();
      
      // Weekend check (Friday, Saturday, Sunday)
      const isWeekend = [5, 6, 0].includes(eventDate.getDay());
      
      switch (activeEventFilter) {
        case 'today':
          return isToday;
        case 'weekend':
          return isWeekend;
        case 'vip':
          // VIP events have minimum spend or VIP tables
          return event.minimumSpend > 0 || (event.vibes && event.vibes.includes('VIP'));
        case 'free':
          // Free entry events
          return !event.isTicketed || event.ticketPrice === 0;
        default:
          return true;
      }
    });
    
    console.log('✅ Filtered events result:', { 
      filteredCount: filtered.length,
      activeFilter: activeEventFilter,
      filteredEvents: filtered.slice(0, 3) // Show first 3 filtered events
    });
    
    return filtered;
  }, [events, activeEventFilter]);

  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      if (activeFilter === 'all') return true;
      return v.type === activeFilter;
    });
  }, [venues, activeFilter]);

  // Group filtered venues by business for map display
  const businessGroups = useMemo(() => {
    if (!filteredVenues || filteredVenues.length === 0) return [];
    return groupVenuesByBusiness(filteredVenues);
  }, [filteredVenues]);

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDayMode ? 'bg-stone-50' : 'bg-zinc-950'}`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-6 border-2 rounded-full animate-spin ${isDayMode ? 'border-stone-200 border-t-zinc-950' : 'border-zinc-800 border-t-[#10FF88]'}`}></div>
          <p className={`text-lg ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Loading venues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-screen flex items-center justify-center p-8 ${isDayMode ? 'bg-stone-50' : 'bg-zinc-950'}`}>
        <div className="text-center max-w-md">
          <h2 className={`text-4xl font-light mb-4 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>Something went wrong</h2>
          <p className={`text-lg mb-8 ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{error}</p>
          <button
            onClick={loadVenues}
            className={`px-8 py-4 rounded-full text-sm font-medium tracking-wide transition-all ${isDayMode ? 'bg-zinc-950 text-white hover:bg-zinc-800' : 'bg-[#10FF88] text-zinc-950 hover:shadow-[0_0_20px_rgba(16,255,136,0.6)]'}`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full overflow-hidden relative font-sans antialiased ${isDayMode ? 'bg-stone-50 text-zinc-950' : 'bg-zinc-950 text-white'}`}>
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: isDayMode 
          ? 'linear-gradient(rgba(231, 229, 228, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(231, 229, 228, 0.6) 1px, transparent 1px)'
          : 'linear-gradient(rgba(39, 39, 42, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(39, 39, 42, 0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Decorative shapes */}
      <div className={`absolute top-0 right-0 w-[85%] h-[75%] rounded-bl-[120px] backdrop-blur-[2px] z-0 ${isDayMode ? 'bg-stone-200/40 border-b border-l border-stone-300' : 'bg-zinc-900/40 border-b border-l border-zinc-800'}`}></div>
      <div className={`absolute bottom-20 right-0 w-[45%] h-[35%] rounded-tl-[80px] backdrop-blur-[2px] z-0 ${isDayMode ? 'bg-stone-200/40 border-t border-l border-stone-300' : 'bg-zinc-900/40 border-t border-l border-zinc-800'}`}></div>
      
      {/* Map Background */}
      {viewMode === 'map' && (
        <div className="absolute inset-0 z-[1]">
          <Map
            ref={mapRef}
            initialViewState={initialViewState}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onLoad={(e) => {
              setMapLoaded(true);
              
              // Hide ALL Mapbox POI layers aggressively
              const map = e.target;
              
              // Function to hide POI layers
              const hidePOILayers = () => {
                const style = map.getStyle();
                if (!style || !style.layers) return;
                
                const layers = style.layers;
                let hiddenCount = 0;
                
                // Hide ALL POI-related layers
                layers.forEach(layer => {
                  const layerId = layer.id.toLowerCase();
                  
                  // Comprehensive list of keywords to hide
                  const hideKeywords = [
                    'poi', 'label', 'place', 'transit', 'airport',
                    'settlement', 'state', 'country', 'marine',
                    'natural', 'park', 'landuse', 'building-number',
                    'road-label', 'ferry', 'waterway', 'water-point',
                    'peak', 'volcano', 'disputed', 'admin', 'boundary',
                    'poi-label', 'transit-label', 'place-label',
                    'natural-point', 'natural-line', 'landuse-label',
                    'water-label', 'marine-label', 'country-label',
                    'state-label', 'settlement-label', 'settlement-subdivision',
                    'airport-label', 'poi-parks', 'road-number'
                  ];
                  
                  // Check if layer should be hidden
                  const shouldHide = hideKeywords.some(keyword => layerId.includes(keyword));
                  
                  if (shouldHide) {
                    try {
                      map.setLayoutProperty(layer.id, 'visibility', 'none');
                      hiddenCount++;
                    } catch (e) {
                      // Layer might not support visibility, skip
                    }
                  }
                });
                
                console.log(`✅ Hidden ${hiddenCount} POI/label layers`);
              };
              
              // Try hiding immediately
              hidePOILayers();
              
              // Also hide after style loads completely
              map.once('idle', () => {
                hidePOILayers();
              });
              
              // And hide again after a short delay (for late-loading layers)
              setTimeout(() => {
                hidePOILayers();
              }, 1000);
            }}
            mapStyle={DARK_STYLE}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
            cooperativeGestures={selectedVenue !== null}
            antialias={true}
            // Performance optimizations
            maxPitch={60}
            minZoom={10}
            maxZoom={18}
            renderWorldCopies={false}
            optimizeForTerrain={false}
            // Lazy load tiles
            fadeDuration={0}
            crossSourceCollisions={false}
            // Prevent default POI interactions
            interactiveLayerIds={[]}
          >
            <NavigationControl position="bottom-right" showCompass={false} />
            
            {/* Only render markers after map loads */}
            {mapLoaded && (
              <>
                {/* DAY MODE: Show business groups (venues) */}
                {isDayMode && businessGroups.map(business => (
                  business.latitude && business.longitude && (
                    <Marker
                      key={business.id}
                      longitude={business.longitude}
                      latitude={business.latitude}
                      anchor="center"
                    >
                      <VenueMarker
                        venue={{
                          ...business,
                          availableUnitsCount: business.totalAvailableUnits
                        }}
                        isSelected={selectedBusiness?.id === business.id}
                        onClick={() => handleBusinessClick(business)}
                        isDayMode={isDayMode}
                      />
                    </Marker>
                  )
                ))}
                
                {/* NIGHT MODE: Show events on map */}
                {!isDayMode && filteredEvents.map(event => {
                  const venue = venues.find(v => v.id === event.venueId);
                  if (!venue || !venue.latitude || !venue.longitude) return null;
                  
                  return (
                    <Marker
                      key={event.id}
                      longitude={venue.longitude}
                      latitude={venue.latitude}
                      anchor="center"
                    >
                      <EventMarker
                        event={event}
                        venue={venue}
                        isSelected={false}
                        onClick={() => handleEventClick(event)}
                        isDayMode={isDayMode}
                      />
                    </Marker>
                  );
                })}
              </>
            )}
            
            {/* User location marker */}
            {userLocation && (
              <Marker
                longitude={userLocation.longitude}
                latitude={userLocation.latitude}
                anchor="center"
              >
                <div className="relative flex items-center justify-center">
                  {/* Pulsing ring */}
                  <div className="absolute w-8 h-8">
                    <div className={`absolute inset-0 rounded-full ${isDayMode ? 'bg-blue-500/30' : 'bg-blue-400/30'} animate-ping`}></div>
                  </div>
                  {/* Center dot */}
                  <div className={`w-4 h-4 rounded-full border-2 ${isDayMode ? 'bg-blue-500 border-white' : 'bg-blue-400 border-zinc-950'} shadow-lg z-10`}></div>
                </div>
              </Marker>
            )}
          </Map>
        </div>
      )}

      {/* List View - Show Businesses Grouped (Day Mode) or Events (Night Mode) */}
      {viewMode === 'list' && (
        <div className="pt-[180px] pb-[60px] overflow-y-auto no-scrollbar px-6 space-y-6">
          {/* Day Mode: Show business groups */}
          {isDayMode && businessGroups.map((business) => {
            // Calculate business-level availability (sum of all venues)
            const isBeachBusiness = business.venues.some(v => v.type === 'Beach' || v.type === 'BEACH');
            const totalAvailable = business.totalAvailableUnits;
            const isAvailable = isBeachBusiness && totalAvailable >= 15;
            const isFewLeft = isBeachBusiness && totalAvailable > 0 && totalAvailable < 15;
            const isFull = isBeachBusiness && totalAvailable === 0;
            
            // Use the first venue's image as business image
            const businessImage = business.venues[0]?.imageUrl;
            
            return (
              <div key={business.id} className={`group relative overflow-hidden rounded-sm cursor-pointer ${isDayMode ? 'bg-white border border-zinc-300' : 'bg-zinc-900 border border-zinc-800'}`}
                   onClick={() => handleBusinessClick(business)}>
                {/* Business Image */}
                <div className={`relative h-64 w-full overflow-hidden ${isDayMode ? 'bg-stone-100' : 'bg-zinc-900'}`}>
                  {/* Status Badge - Only for Beach businesses */}
                  {isBeachBusiness && (
                    <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
                      {isAvailable && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${isDayMode ? 'bg-emerald-500 border border-emerald-600 text-white' : 'bg-zinc-950 border-r border-b border-zinc-800 text-white'}`}>
                          {isDayMode ? 'Available' : (
                            <>
                              <span className="w-1.5 h-1.5 bg-[#10FF88] inline-block mr-1.5"></span>
                              LIVE NOW
                            </>
                          )}
                        </span>
                      )}
                      {isFewLeft && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${isDayMode ? 'bg-white border border-zinc-300 text-zinc-950' : 'bg-zinc-900 border-r border-b border-zinc-800 text-amber-500'}`}>
                          {isDayMode ? 'Few Left' : (
                            <>
                              <span className="w-1.5 h-1.5 bg-amber-500 inline-block mr-1.5"></span>
                              FILLING FAST
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Venue Count Badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm backdrop-blur-md ${isDayMode ? 'bg-white/90 border border-zinc-200 text-zinc-950' : 'bg-zinc-900/90 border border-zinc-700 text-white'}`}>
                      {business.venues.length} {business.venues.length === 1 ? 'VENUE' : 'VENUES'}
                    </div>
                  </div>
                  
                  {businessImage ? (
                    <img 
                      alt={business.name} 
                      className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out ${isDayMode ? 'grayscale-[10%] group-hover:grayscale-0' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-80'}`}
                      src={businessImage}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDayMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Location Badge */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-medium opacity-90">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Albanian Riviera</span>
                    </div>
                  </div>
                </div>
                
                {/* Business Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-serif text-2xl tracking-tight ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>{business.name}</h3>
                    <div className="flex items-center space-x-0.5">
                      <svg className={`w-3.5 h-3.5 fill-current ${isDayMode ? 'text-zinc-950' : 'text-white'}`} viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className={`text-xs font-bold ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>4.8</span>
                      <span className="text-[10px] text-zinc-400">(128)</span>
                    </div>
                  </div>
                  
                  <p className={`text-xs leading-relaxed line-clamp-2 mb-4 font-sans ${isDayMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {business.venues.length === 1 
                      ? (business.venues[0].description || 'Experience world-class service and the most exclusive atmosphere on the Riviera.')
                      : `Premium hospitality group with ${business.venues.length} exclusive venues offering diverse experiences from beach clubs to fine dining.`
                    }
                  </p>
                  
                  <div className={`grid grid-cols-2 gap-4 mb-5 border-t pt-4 ${isDayMode ? 'border-zinc-200' : 'border-zinc-800'}`}>
                    {isBeachBusiness ? (
                      // Beach businesses show availability-based pricing
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Total Sunbeds</span>
                        <span className={`text-sm font-medium ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                          {totalAvailable} available
                        </span>
                      </div>
                    ) : (
                      // Other businesses show venue count (no availability)
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Venues</span>
                        <span className={`text-sm font-medium ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                          {business.venues.length} locations
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Experience</span>
                      <span className={`text-sm font-medium ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                        {business.venues.length === 1 
                          ? (business.type === 'Beach' ? 'Beach Club' : business.type === 'Restaurant' ? 'Fine Dining' : 'Premium Venue')
                          : 'Multi-Venue'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 pt-1">
                    <button 
                      className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 transition-colors border rounded-sm ${isDayMode ? 'bg-zinc-950 text-white hover:bg-zinc-800 border-zinc-950' : 'bg-zinc-950 text-white hover:bg-zinc-800 border-zinc-950'}`}
                    >
                      Explore Venues
                    </button>
                    <button className={`w-10 h-10 flex items-center justify-center border transition-colors rounded-sm ${isDayMode ? 'border-zinc-300 hover:border-zinc-950 bg-white' : 'border-zinc-800 hover:border-zinc-100 bg-transparent'}`}>
                      <svg className={`w-5 h-5 ${isDayMode ? 'text-zinc-950' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Night Mode: Show filtered events */}
          {!isDayMode && eventsLoading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
              <p className="text-lg text-stone-500">Loading events...</p>
            </div>
          )}
          
          {!isDayMode && !eventsLoading && events.length === 0 && (
            <div className="text-center py-20">
              <div className="text-stone-400 mb-6">
                <svg className="w-20 h-20 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-light text-stone-700 mb-3">No published events</h3>
              <div className="text-lg text-stone-500 space-y-2">
                <p>Events need to be published by SuperAdmin to appear here.</p>
                <p className="text-sm text-stone-400">
                  To publish events: Login as SuperAdmin → Events tab → Click "Publish" on events
                </p>
                <p className="text-xs text-stone-300 mt-4">
                  API Response: {events.length} events loaded from /api/public/Events
                </p>
              </div>
            </div>
          )}
          
          {!isDayMode && !eventsLoading && events.length > 0 && filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="text-stone-400 mb-6">
                <svg className="w-20 h-20 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-light text-stone-700 mb-3">No events match your filter</h3>
              <p className="text-lg text-stone-500">Try selecting "ALL EVENTS" or a different filter</p>
              <p className="text-sm text-stone-400 mt-2">Total events loaded: {events.length}, Active filter: {activeEventFilter}</p>
            </div>
          )}
          
          {!isDayMode && filteredEvents.map((event) => {
            const venue = venues.find(v => v.id === event.venueId);
            if (!venue) {
              console.warn('⚠️ Event venue not found:', { eventId: event.id, venueId: event.venueId, eventName: event.name });
              return null;
            }
            
            const eventDate = new Date(event.startTime);
            const isToday = eventDate.toDateString() === new Date().toDateString();
            const isUpcoming = eventDate > new Date();
            
            return (
              <div 
                key={event.id} 
                className="relative w-full aspect-[4/5] bg-zinc-900 border-2 border-zinc-800 rounded-sm overflow-hidden group hover:border-zinc-600 transition-all duration-300 shadow-lg cursor-pointer mb-8"
                onClick={() => handleEventClick(event)}
              >
                {/* Event Image */}
                <div className="absolute inset-0 z-0">
                  {event.flyerImageUrl || event.imageUrl ? (
                    <img 
                      alt="Event" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 contrast-[1.4] saturate-50"
                      src={event.flyerImageUrl || event.imageUrl}
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
                        handleEventClick(event);
                      }}
                      className="w-full py-4 bg-zinc-900 border-2 border-white rounded-none text-[12px] font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em]"
                    >
                      CONFIRM ACCESS
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Empty States */}
          {isDayMode && businessGroups.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-stone-500">No businesses found</p>
            </div>
          )}
          
          {!isDayMode && filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="text-stone-400 mb-6">
                <svg className="w-20 h-20 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-light text-stone-700 mb-3">No events found</h3>
              <p className="text-lg text-stone-500">Try adjusting your filters or check back later for new events</p>
            </div>
          )}
        </div>
      )}
      
      {/* Events View */}
      {viewMode === 'events' && (
        <div className={`pt-[180px] pb-[60px] overflow-y-auto no-scrollbar px-6 ${isDayMode ? 'bg-stone-50' : 'bg-zinc-950'}`}>
          <EventsView
            events={filteredEvents}
            venues={venues}
            loading={eventsLoading}
            vibeFilter={eventVibeFilter}
            dateFilter={eventDateFilter}
            onVibeChange={setEventVibeFilter}
            onDateChange={setEventDateFilter}
            onEventClick={handleEventClick}
            isDayMode={isDayMode}
          />
        </div>
      )}

      {/* Top Header - Fixed Command Center */}
      <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md pb-2 pointer-events-auto ${isDayMode ? 'bg-stone-50/90' : 'bg-zinc-950/90'}`}>
        {/* Top Row: Logo, Day/Night, Bell, Search Icon */}
        <div className="flex justify-between items-center px-4 pt-6">
          <div>
            <h1 className={`tracking-tight drop-shadow-sm ${isDayMode ? 'font-serif text-5xl font-light text-stone-900 tracking-tighter leading-none' : 'font-serif text-4xl text-white drop-shadow-lg'}`} style={isDayMode ? { fontFamily: 'Cormorant Garamond, serif' } : { fontFamily: 'Playfair Display, serif' }}>XIXA</h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full bg-[#10FF88] animate-pulse ${isDayMode ? 'border border-zinc-950 shadow-[0_0_8px_rgba(16,255,136,0.3)]' : 'shadow-[0_0_12px_rgba(16,255,136,0.4)]'}`}></div>
              <p className={`text-[10px] font-mono tracking-[0.2em] uppercase ${isDayMode ? 'text-stone-500' : 'text-zinc-400'}`}>Albanian Riviera</p>
            </div>
          </div>
          
          {/* Day/Night Toggle */}
          <div className={`backdrop-blur-md border p-1 rounded-full flex shadow-lg ${isDayMode ? 'bg-white/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
            <button 
              onClick={() => {
                if (!modeInitialized) return;
                console.log('🌅 Switching to DAY mode');
                setIsDayMode(true);
                setViewMode('map');
              }}
              disabled={!modeInitialized}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!modeInitialized ? 'opacity-50 cursor-not-allowed' : ''} ${isDayMode ? 'bg-zinc-950 text-white border border-zinc-950 shadow-sm' : 'bg-transparent text-zinc-500 border border-transparent hover:bg-zinc-800'}`}
            >
              <span>⛱️</span>
              <span>DAY</span>
            </button>
            <button 
              onClick={() => {
                if (!modeInitialized) return;
                console.log('🌙 Switching to NIGHT mode');
                setIsDayMode(false);
                setViewMode('list');
              }}
              disabled={!modeInitialized}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!modeInitialized ? 'opacity-50 cursor-not-allowed' : ''} ${!isDayMode ? 'bg-zinc-950 text-[#10FF88] border border-zinc-800 shadow-[0_0_12px_rgba(16,255,136,0.4)]' : 'bg-transparent text-zinc-500 border border-transparent hover:bg-stone-100'}`}
            >
              <span className={!isDayMode ? '' : 'opacity-70'} style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>🪩</span>
              <span style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>NIGHT</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Notification button */}
            <button className={`w-10 h-10 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all group shadow-sm ${isDayMode ? 'border-zinc-200 bg-white/80 hover:bg-stone-100 hover:border-zinc-300' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-[#10FF88]/50'}`}>
              <svg className={`w-5 h-5 transition-colors ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-400 group-hover:text-[#10FF88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            {/* Search Icon */}
            <button className={`w-10 h-10 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all group shadow-sm ${isDayMode ? 'border-zinc-200 bg-white/80 hover:bg-stone-100 hover:border-zinc-300' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-[#10FF88]/50'}`}>
              <svg className={`w-5 h-5 transition-colors ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-400 group-hover:text-[#10FF88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Second Row: List/Map Toggle (Move it here, to the right) */}
        <div className="flex justify-end px-4 mt-3">
          <div className={`flex items-center backdrop-blur-md border rounded-lg p-1 shadow-lg ${isDayMode ? 'bg-white/90 border-zinc-200' : 'bg-zinc-900/90 border-zinc-800'}`}>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-medium transition-colors border-r pr-3 ${viewMode === 'list' ? (isDayMode ? 'text-black bg-zinc-100 rounded-sm font-bold' : 'text-black bg-zinc-100 rounded-sm font-bold') : (isDayMode ? 'text-zinc-500 hover:text-zinc-900 border-zinc-200' : 'text-zinc-500 hover:text-white border-zinc-800')}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>LIST</span>
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase rounded ml-1 shadow-sm transition-colors ${viewMode === 'map' ? (isDayMode ? 'text-[#10FF88] bg-zinc-950 border border-zinc-950 font-bold' : 'text-[#10FF88] bg-zinc-950 border border-zinc-800 shadow-[0_0_12px_rgba(16,255,136,0.4)] font-bold') : (isDayMode ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white')}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={viewMode === 'map' && !isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span style={viewMode === 'map' && !isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : viewMode === 'map' && isDayMode ? { textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000' } : {}}>MAP</span>
            </button>
          </div>
        </div>
        
        {/* Third Row: The Filter Pills (Scrollable horizontally) */}
        {viewMode !== 'events' && (
          <div className="flex overflow-x-auto px-4 mt-3 gap-2 no-scrollbar">
            {/* Day Mode: Show venue filters */}
            {isDayMode && VENUE_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  whitespace-nowrap px-5 py-2 rounded-full text-xs font-medium tracking-wide
                  transform active:scale-95 transition-all
                  ${activeFilter === filter.id
                    ? 'bg-zinc-950 border border-zinc-950 text-[#10FF88] shadow-md'
                    : 'bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 shadow-sm'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
            
            {/* Night Mode: Show event filters */}
            {!isDayMode && EVENT_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveEventFilter(filter.id)}
                className={`
                  whitespace-nowrap px-5 py-2 rounded-full text-xs font-medium tracking-wide
                  transform active:scale-95 transition-all
                  ${activeEventFilter === filter.id
                    ? 'bg-zinc-950 border border-[#10FF88] text-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)]'
                    : 'bg-zinc-900/60 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Side Controls (Map only) */}
      {viewMode === 'map' && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 flex flex-col space-y-3 pointer-events-auto">
          {/* Center on user location */}
          <button 
            onClick={() => {
              if (userLocation && mapRef.current) {
                mapRef.current.flyTo({
                  center: [userLocation.longitude, userLocation.latitude],
                  zoom: 14,
                  duration: 1500,
                  essential: true
                });
              } else if ('geolocation' in navigator) {
                // Request location if not already available
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const coords = {
                      longitude: position.coords.longitude,
                      latitude: position.coords.latitude
                    };
                    setUserLocation(coords);
                    if (mapRef.current) {
                      mapRef.current.flyTo({
                        center: [coords.longitude, coords.latitude],
                        zoom: 14,
                        duration: 1500,
                        essential: true
                      });
                    }
                  },
                  (error) => {
                    alert('Unable to get your location. Please enable location services.');
                  }
                );
              }
            }}
            className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg active:scale-95 transition-all group ${isDayMode ? 'bg-white/90 border-zinc-200 hover:border-zinc-400' : 'bg-zinc-900/90 border-zinc-800 hover:border-[#10FF88]/30'}`}
          >
            <svg className={`w-5 h-5 transition-colors ${isDayMode ? 'text-zinc-600 group-hover:text-zinc-950' : 'text-zinc-400 group-hover:text-[#10FF88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={!isDayMode ? { filter: 'group-hover:drop-shadow(0 0 5px rgba(16, 255, 136, 0.4))' } : {}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <div className={`flex flex-col rounded-full backdrop-blur-md border shadow-lg overflow-hidden ${isDayMode ? 'bg-white/90 border-zinc-200' : 'bg-zinc-900/90 border-zinc-800'}`}>
            <button className={`w-10 h-10 flex items-center justify-center transition-colors border-b ${isDayMode ? 'hover:bg-stone-100 active:bg-stone-200 border-zinc-200 text-zinc-600 hover:text-zinc-950' : 'hover:bg-zinc-800 active:bg-zinc-700 border-zinc-800 text-zinc-400 hover:text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className={`w-10 h-10 flex items-center justify-center transition-colors ${isDayMode ? 'hover:bg-stone-100 active:bg-stone-200 text-zinc-600 hover:text-zinc-950' : 'hover:bg-zinc-800 active:bg-zinc-700 text-zinc-400 hover:text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Minimal */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <nav className={`relative rounded-t-xl backdrop-blur-xl border-t shadow-2xl overflow-hidden mx-4 mb-4 ${isDayMode ? 'bg-white/60 border-white/20' : 'bg-zinc-900/80 border-zinc-800'}`}>
          {isDayMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
          )}
          <div className="flex items-center justify-around py-2 relative z-10">
            <button className="flex flex-col items-center space-y-0.5 group w-1/4">
              <svg className={`w-5 h-5 ${isDayMode ? 'text-xixa-green drop-shadow-sm' : 'text-[#10FF88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-[9px] font-medium tracking-wide ${isDayMode ? 'text-zinc-950 font-bold' : 'text-white'}`} style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>DISCOVER</span>
              <div className={`w-1 h-1 rounded-full ${isDayMode ? 'bg-zinc-950' : 'bg-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)]'}`}></div>
            </button>
            
            <button className="flex flex-col items-center space-y-0.5 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
              <svg className={`w-5 h-5 ${isDayMode ? 'text-zinc-800 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`text-[9px] font-medium tracking-wide ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`}>SAVED</span>
            </button>
            
            <button className="flex flex-col items-center space-y-0.5 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
              <svg className={`w-5 h-5 ${isDayMode ? 'text-zinc-800 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className={`text-[9px] font-medium tracking-wide ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`}>BOOKINGS</span>
            </button>
            
            <button className="flex flex-col items-center space-y-0.5 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
              <svg className={`w-5 h-5 ${isDayMode ? 'text-zinc-800 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-[9px] font-medium tracking-wide ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`}>PROFILE</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Business Bottom Sheet (shows list of venues) */}
      {selectedBusiness && !selectedVenue && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          <BusinessBottomSheet
            business={selectedBusiness}
            onClose={handleCloseBottomSheet}
            onVenueSelect={handleVenueClick}
            isDayMode={isDayMode}
          />
        </div>
      )}

      {/* Venue Bottom Sheet (shows single venue details) */}
      {selectedVenue && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          <VenueBottomSheet
            venue={selectedVenue}
            onClose={handleCloseBottomSheet}
            isDayMode={isDayMode}
          />
        </div>
      )}

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          
          .font-display {
            font-family: 'Anton', sans-serif;
          }
          
          @keyframes pulse-ring {
            0% { 
              transform: scale(0.8); 
              opacity: 0.5; 
              border-color: ${isDayMode ? '#09090B' : '#10FF88'}; 
            }
            100% { 
              transform: scale(2.5); 
              opacity: 0; 
              border-color: transparent; 
            }
          }
          
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .mapboxgl-map {
            font-family: 'Inter', sans-serif;
          }
          
          .mapboxgl-ctrl-logo,
          .mapboxgl-ctrl-attrib {
            display: none !important;
          }
          
          .mapboxgl-ctrl-group {
            background: ${isDayMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(24, 24, 27, 0.9)'} !important;
            backdrop-filter: blur(12px);
            border-radius: 12px !important;
            box-shadow: ${isDayMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' : '0 8px 30px rgba(0, 0, 0, 0.3)'} !important;
            border: 1px solid ${isDayMode ? 'rgba(228, 228, 231, 1)' : 'rgba(39, 39, 42, 1)'} !important;
          }
          
          .mapboxgl-ctrl-group button {
            width: 36px !important;
            height: 36px !important;
            color: ${isDayMode ? '#71717A' : '#A1A1AA'} !important;
          }
          
          .mapboxgl-ctrl-group button:hover {
            background-color: ${isDayMode ? 'rgba(245, 245, 244, 1)' : 'rgba(39, 39, 42, 1)'} !important;
            color: ${isDayMode ? '#09090B' : '#10FF88'} !important;
          }
        `
      }} />
    </div>
  );
}
