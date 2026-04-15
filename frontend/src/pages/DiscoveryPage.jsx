import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Parses coordinates out of a Google Maps share URL
function parseGoogleMapsUrl(url) {
  if (!url) return null;
  // 1. Prioritize the exact pin drop coordinates (!3d / !4d) over the viewport
  const embedMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (embedMatch) return { lat: parseFloat(embedMatch[1]), lng: parseFloat(embedMatch[2]) };
  
  // 2. Query coordinates
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  
  // 3. Fallback to viewport center coordinates
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  
  return null;
}

// Lazy load heavy mapbox components (deferred until map view)
const Map = lazy(() => import('react-map-gl'));
const Marker = lazy(() => import('react-map-gl').then(mod => ({ default: mod.Marker })));
const NavigationControl = lazy(() => import('react-map-gl').then(mod => ({ default: mod.NavigationControl })));
import { venueApi } from '../services/venueApi';
import { publicEventsApi } from '../services/eventsApi';
import { geographicZonesApi } from '../services/geographicZonesApi';
import { useAppStore } from '../store/appStore';

// Lazy load bottom sheet components (only needed on user interaction)
const VenueBottomSheet = lazy(() => import('../components/VenueBottomSheet'));
const BusinessBottomSheet = lazy(() => import('../components/BusinessBottomSheet'));
const AssetBottomSheet = lazy(() => import('../components/AssetBottomSheet'));
const EventsView = lazy(() => import('../components/EventsView'));
const LocationBottomSheet = lazy(() => import('../components/LocationBottomSheet'));
const EventBottomSheet = lazy(() => import('../components/EventBottomSheet'));

import { calculateDistance, sortEventsByDistance, sortVenuesByDistance, getCurrentLocation } from '../utils/locationUtils';
import attractionsData from '../data/attractions_data.json';

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
// Stone Standard - Industrial Luxury Filter System for Day Mode
const DAY_FILTERS = [
  { id: 'all', label: 'ALL', icon: '🌏' },
  { id: 'Beach', label: 'BEACH', icon: '⛱️' },
  { id: 'Restaurant', label: 'RESTAURANT', icon: '🍴' },
  { id: 'Beach Club', label: 'BEACH CLUB', icon: '🥂' },
  { id: 'Yacht', label: 'YACHT', icon: '⚓' },
  { id: 'Attraction', label: 'SIGHTS', icon: '🏛️' }
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
function VenueMarker({ venue, isSelected, onClick, isDayMode, activeFilter }) {
  // Only show availability for Beach venues (sunbeds)
  const isBeachVenue = venue.type === 'Beach' || venue.type === 'BEACH';
  const isFull = isBeachVenue && venue.availableUnitsCount === 0;
  const isHighlight = isBeachVenue && venue.availableUnitsCount >= 15;
  const hasAvailability = isBeachVenue && venue.availableUnitsCount > 0;
  
  // Show inventory labels when BEACH filter is active
  const showInventoryLabel = activeFilter === 'Beach' && isBeachVenue;
  
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
          relative flex items-center justify-center z-10
          transition-all duration-300
          ${showInventoryLabel
            ? // Inventory Label Mode - Rectangular badges
              hasAvailability
                ? isDayMode
                  ? 'px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-sm'
                  : 'px-2 py-1 bg-zinc-950 border border-[#10FF88] rounded-sm shadow-[0_0_8px_rgba(16,255,136,0.3)]'
                : isDayMode
                ? 'px-2 py-1 bg-stone-100 border border-stone-300 rounded-sm'
                : 'px-2 py-1 bg-zinc-900 border border-zinc-600 rounded-sm'
            : // Regular Mode - Circular markers
              isBeachVenue
              ? isHighlight && !isFull 
                ? isDayMode
                  ? 'w-10 h-10 bg-stone-50 border border-zinc-950 shadow-lg rounded-full'
                  : 'w-10 h-10 bg-zinc-950 border border-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)] rounded-full'
                : isFull
                ? isDayMode
                  ? 'w-5 h-5 bg-white border border-zinc-400 shadow-sm rounded-full'
                  : 'w-5 h-5 bg-zinc-900 border border-zinc-600 shadow-lg rounded-full'
                : isDayMode
                ? 'w-8 h-8 bg-stone-50 border border-zinc-950 shadow-lg rounded-full'
                : 'w-8 h-8 bg-zinc-950 border border-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)] rounded-full'
              : isDayMode
              ? 'w-8 h-8 bg-stone-50 border border-zinc-950 shadow-lg rounded-full'
              : 'w-8 h-8 bg-zinc-950 border border-zinc-700 shadow-lg rounded-full'
          }
          ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
        `}
      >
        {showInventoryLabel ? (
          // Inventory Label Mode - Show availability with green dot
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${hasAvailability ? 'bg-emerald-500' : 'bg-stone-400'}`}></div>
            <span 
              className={`
                font-bold font-mono text-xs
                ${hasAvailability 
                  ? isDayMode ? 'text-emerald-800' : 'text-[#10FF88]'
                  : isDayMode ? 'text-stone-500' : 'text-zinc-400'
                }
              `}
            >
              {venue.availableUnitsCount || 0}
            </span>
          </div>
        ) : isBeachVenue ? (
          // Regular Mode - Show availability count for beach venues
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
            ) : venue.type === 'Yacht' || venue.type === 'YACHT' || venue.type === 'Boat' || venue.type === 'BOAT' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
            ) : venue.type === 'Attraction' || venue.type === 'ATTRACTION' || venue.isSight ? (
              // Attraction icon (Historical/Sight)
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
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

// 🌙 Night Mode Business Event Marker - One pin per business, groups all its events
function BusinessEventMarker({ businessName, events, isSelected, onClick }) {
  const now = new Date();
  const hasToday = events.some(e => {
    const d = new Date(e.startTime);
    return d.toDateString() === now.toDateString() && d > now;
  });
  const count = events.length;

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Pulsing ring for businesses with events tonight */}
      {hasToday && (
        <div className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 rounded-full border border-[#10FF88] opacity-50"
               style={{ animation: 'pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1)' }} />
          <div className="absolute inset-0 rounded-full bg-[#10FF88]/20 animate-pulse" />
        </div>
      )}

      {/* Main pin */}
      <div className={`
        relative flex items-center justify-center rounded-full z-10
        transition-all duration-300
        ${hasToday
          ? 'w-11 h-11 bg-zinc-950 border-2 border-[#10FF88] shadow-[0_0_14px_rgba(16,255,136,0.45)]'
          : 'w-9 h-9 bg-zinc-950 border border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.35)]'
        }
        ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
      `}>
        {/* Music note icon */}
        <svg className={`w-4 h-4 ${hasToday ? 'text-[#10FF88]' : 'text-purple-400'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>

        {/* Event count badge */}
        {count > 1 && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#10FF88] flex items-center justify-center">
            <span className="text-[9px] font-black text-zinc-950">{count}</span>
          </div>
        )}
      </div>
      {/* Business Name Label */}
      <div className={`
        absolute top-full mt-1 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-sm rounded border border-zinc-800 pointer-events-none whitespace-nowrap z-20 transition-opacity duration-300
        opacity-100
      `}>
        <span className={`text-[10px] font-bold tracking-widest uppercase ${hasToday ? 'text-[#10FF88]' : 'text-zinc-300'}`}>
          {businessName}
        </span>
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  const mapRef = useRef();
  const [searchParams] = useSearchParams();
  
  // 🏖️ VENUE JAIL: Detect if returning from a QR session
  const fromVenueId = searchParams.get('from');
  const forceMode = searchParams.get('mode'); // 'night' = force night mode
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null); // For business grouping
  const [selectedEvent, setSelectedEvent] = useState(null); // For event detail bottom sheet
  const [selectedMapPinEvents, setSelectedMapPinEvents] = useState(null); // For dealing with multiple events on single map pin
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // Default: show all, sorted by distance
  
  // Initialize mode: FORCE NIGHT MODE for Tirana testing launch
  // Day mode (beaches, pools, restaurants) is Coming Soon
  // DEV BYPASS: Add ?mode=day to the URL to force Day mode for testing
  const [isDayMode, setIsDayMode] = useState(forceMode === 'day');
  const [viewMode, setViewMode] = useState('list');

  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapCssLoaded, setMapCssLoaded] = useState(false);
  const [initialViewState, setInitialViewState] = useState(RIVIERA_CENTER);
  const [viewState, setViewState] = useState(RIVIERA_CENTER);
  const [modeInitialized, setModeInitialized] = useState(false); // Track if mode is properly initialized
  
  // Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventVibeFilter, setEventVibeFilter] = useState('all');
  const [eventDateFilter, setEventDateFilter] = useState('all');
  const [eventDayFilter, setEventDayFilter] = useState(() => {
    return new URLSearchParams(window.location.search).get('from') ? 'upcoming' : 'upcoming';
  });
  const [eventGenreFilter, setEventGenreFilter] = useState('all');
  const [eventEntranceFilter, setEventEntranceFilter] = useState('all');

  // Recover session data for returning to Spot pages
  const { isSessionActive, tableNumber, zoneId: sessionZoneId } = useAppStore();

  // Location/Zone state — restore from sessionStorage if user already picked
  const [selectedGeographicZone, setSelectedGeographicZone] = useState(() => {
    return sessionStorage.getItem('riviera-zone') || 'EVERYWHERE';
  });
  const [locationBottomSheetOpen, setLocationBottomSheetOpen] = useState(false);
  const [isUsingGPSLocation, setIsUsingGPSLocation] = useState(() => {
    return sessionStorage.getItem('riviera-gps') === 'true';
  });
  const [hasPickedLocation, setHasPickedLocation] = useState(() => {
    return sessionStorage.getItem('riviera-zone-picked') === 'true';
  });

  // Pre-fetched data for list view
  const [businessEventsCount, setBusinessEventsCount] = useState({}); // { businessId: count }

  // Dropdown states
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [entranceDropdownOpen, setEntranceDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Handle explicit Day/Night mode switch (Experiential Switch)
  const handleExperienceSwitch = (targetMode) => {
    // Day mode is Coming Soon - block the switch (unless dev bypass ?mode=day)
    if (targetMode === 'day' && forceMode !== 'day') {
      setToast({ message: '☀️ Day Mode — Coming Soon!', type: 'info' });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    const goingDay = targetMode === 'day';
    setIsDayMode(goingDay);
    setViewMode('list');

    // Reset filters
    setActiveFilter('all');
    setActiveEventDateFilter('all');
    setActiveEventTypeFilter('all');
    setActiveEventFilter('all');
  };

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

  // Dynamically load Mapbox CSS only when map view is activated
  useEffect(() => {
    if (viewMode === 'map' && !mapCssLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css';
      link.onload = () => setMapCssLoaded(true);
      document.head.appendChild(link);
    }
  }, [viewMode, mapCssLoaded]);

  useEffect(() => {
    loadVenues();
    // Only load events if starting in night mode
    if (!isDayMode) {
      loadEvents();
    }
  }, []);

  // Load events when switching to night mode
  useEffect(() => {
    if (!isDayMode && events.length === 0) {
      loadEvents();
    }
  }, [isDayMode]);

  // Mark mode as initialized on mount
  useEffect(() => {
    setModeInitialized(true);
  }, []);

  // Show location picker on first visit (no zone picked yet this session)
  useEffect(() => {
    if (!hasPickedLocation && !loading && !fromVenueId) {
      setLocationBottomSheetOpen(true);
    }
  }, [hasPickedLocation, loading, fromVenueId]);

  // Pre-fetch events count per business for list view badges
  useEffect(() => {
    if (!venues.length || !events.length) return;

    const now = new Date();
    const counts = {};
    // Count future events per businessId from already-loaded events
    events.forEach(e => {
      const end = e.endTime ? new Date(e.endTime) : new Date(new Date(e.startTime).getTime() + 6 * 3600000);
      if (end <= now) return;
      // Find venue to get businessId
      const v = venues.find(v => v.id === e.venueId);
      if (!v) return;
      const bKey = v.businessId || v.businessName || v.name;
      counts[bKey] = (counts[bKey] || 0) + 1;
    });
    setBusinessEventsCount(counts);
  }, [venues, events]);

  const loadVenues = useCallback(async () => {
    try {
      if (venues.length === 0) setLoading(true); // Only show spinner if entirely empty
      const data = await venueApi.getVenues();
      // Merge with local attractions for the "Guide" experience
      const mergedData = [...data, ...attractionsData];
      setVenues(mergedData);
    } catch (err) {
      setError('Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, [venues.length]);

  const loadEvents = useCallback(async (geographicZone = null) => {
    try {
      setEventsLoading(true);
      const data = await publicEventsApi.getEvents(geographicZone);
      
      // Filter: published, not deleted, and not in the past
      const now = new Date();
      const published = Array.isArray(data)
        ? data.filter(e => {
            const isPublished = e.isPublished !== undefined ? e.isPublished : true;
            const isDeleted = e.isDeleted !== undefined ? e.isDeleted : false;
            // Hide events that ended (use endTime if available, otherwise startTime + 6h)
            const endTime = e.endTime ? new Date(e.endTime) : new Date(new Date(e.startTime).getTime() + 6 * 60 * 60 * 1000);
            const isNotPast = endTime > now;
            return isPublished && !isDeleted && isNotPast;
          })
        : [];
      
      // If using GPS location, sort by distance
      if (isUsingGPSLocation && userLocation && venues.length > 0) {
        const sortedEvents = sortEventsByDistance(published, venues, userLocation);
        setEvents(sortedEvents);
      } else {
        setEvents(published);
      }
    } catch (err) {
      setEvents([]); // Set empty array on error
    } finally {
      setEventsLoading(false);
    }
  }, [isUsingGPSLocation, userLocation, venues]);

  // Listen for automatic background refreshes from the API Caching layer
  useEffect(() => {
    const handleVenuesUpdated = (e) => {
      const mergedData = [...e.detail, ...attractionsData];
      setVenues(mergedData);
    };
    
    const handleEventsUpdated = (e) => {
      const published = Array.isArray(e.detail) ? e.detail.filter(ev => ev.isPublished && !ev.isDeleted) : [];
      if (isUsingGPSLocation && userLocation && venues.length > 0) {
        setEvents(sortEventsByDistance(published, venues, userLocation));
      } else {
        setEvents(published);
      }
    };

    window.addEventListener('riviera_venues_updated', handleVenuesUpdated);
    window.addEventListener('riviera_events_updated', handleEventsUpdated);

    return () => {
      window.removeEventListener('riviera_venues_updated', handleVenuesUpdated);
      window.removeEventListener('riviera_events_updated', handleEventsUpdated);
    };
  }, [isUsingGPSLocation, userLocation, venues]);

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
      
      // Check if this is a yacht/boat asset (Phantom Profile)
      const isAsset = business.type === 'Yacht' || business.type === 'YACHT' || 
                     business.type === 'Boat' || business.type === 'BOAT';
      
      if (isAsset) {
        // Render Asset Sheet for yachts/boats
        setSelectedVenue({
          ...business,
          isAsset: true,
          location: business.location || 'Port of Orikum, Albanian Riviera'
        });
        return;
      }
      
      // Load availability for regular business venues
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
      
      // Check if this is a yacht/boat asset (Phantom Profile)
      const isAsset = venue.type === 'Yacht' || venue.type === 'YACHT' || 
                     venue.type === 'Boat' || venue.type === 'BOAT';
      
      if (isAsset) {
        // Render Asset Sheet for yachts/boats
        setSelectedVenue({
          ...venue,
          isAsset: true,
          location: venue.location || 'Port of Orikum, Albanian Riviera'
        });
        return;
      }
      
      // Load availability for regular venues
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

  const handleZoneSelect = useCallback(async (zone) => {
    setSelectedGeographicZone(zone);
    setIsUsingGPSLocation(false);
    setHasPickedLocation(true);
    sessionStorage.setItem('riviera-zone', zone);
    sessionStorage.setItem('riviera-gps', 'false');
    sessionStorage.setItem('riviera-zone-picked', 'true');

    try {
      if (zone === 'EVERYWHERE') {
        await loadEvents();
        await loadVenues();
      } else {
        await loadEvents(zone);
        await loadVenues();
      }
    } catch (error) {
      // Zone load failed, keep existing data
    }
  }, [loadEvents, loadVenues]);

  // Handle GPS location selection
  const handleGPSLocationSelect = useCallback(async () => {
    setSelectedGeographicZone('NEARBY');
    setIsUsingGPSLocation(true);
    setHasPickedLocation(true);
    sessionStorage.setItem('riviera-zone', 'NEARBY');
    sessionStorage.setItem('riviera-gps', 'true');
    sessionStorage.setItem('riviera-zone-picked', 'true');

    try {
      const location = await getCurrentLocation();
      await loadEvents();

      if (venues.length > 0) {
        const sortedVenues = sortVenuesByDistance(venues, location);
        setVenues(sortedVenues);
      }
    } catch (error) {
      setSelectedGeographicZone('EVERYWHERE');
      setIsUsingGPSLocation(false);
      sessionStorage.setItem('riviera-zone', 'EVERYWHERE');
      sessionStorage.setItem('riviera-gps', 'false');
      setToast('Could not get your location. Showing all venues.');
      setTimeout(() => setToast(null), 3000);
      await loadEvents();
    }
  }, [loadEvents, venues]);
  
  const handleEventClick = (event) => {
    const venue = venues.find(v => v.id === event.venueId) || null;

    // For business-level events (no venue), fallback to business contact on the event itself
    const contactName = venue?.name || event.venueName || event.businessName || 'the venue';
    const whatsappNumber = 
      venue?.whatsappNumber || venue?.whatsAppNumber || venue?.phone ||
      event.venueWhatsappNumber ||
      event.businessPhoneNumber ||  // populated by Kristi's Task 5
      null;
    
    if (!whatsappNumber) {
      setToast(`No contact number available yet. Check back soon!`);
      setTimeout(() => setToast(null), 3000);
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
    
    const message = `Pershendetje! E pame eventin "${event.name}" ne XIXA dhe donim te rezervonim. `;
    
    // Normalize to international format for wa.me (no leading +, no local 0 prefix)
    let cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    if (cleanNumber.startsWith('+')) cleanNumber = cleanNumber.slice(1);
    else if (cleanNumber.startsWith('0')) cleanNumber = '355' + cleanNumber.slice(1);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Filter events based on night mode filters (Day + Genre + Entrance combined)
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    // BUSINESS JAIL: If we have a fromVenueId, show all events for the parent business
    let baseEvents = events;
    if (fromVenueId) {
      const hostVenue = venues.find(v => String(v.id) === String(fromVenueId));
      
      if (hostVenue && hostVenue.businessId) {
        // Show all events belonging to the same business
        baseEvents = baseEvents.filter(event => 
          String(event.businessId) === String(hostVenue.businessId)
        );
      } else {
        // Fallback to strict venue filtering if business data isn't loaded yet
        baseEvents = baseEvents.filter(event =>
          String(event.venueId) === String(fromVenueId) || event.venueId === parseInt(fromVenueId)
        );
      }
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const afterTomorrow = new Date(today); afterTomorrow.setDate(today.getDate() + 2);

    // Figure out this weekend (Fri–Sun)
    const dayOfWeek = today.getDay(); // 0=Sun … 6=Sat
    const daysToFri = (5 - dayOfWeek + 7) % 7 || 7;
    const friday = new Date(today); friday.setDate(today.getDate() + daysToFri);
    const sunday = new Date(friday); sunday.setDate(friday.getDate() + 2);
    sunday.setHours(23, 59, 59, 999);

    const filtered = baseEvents.filter(event => {
      const d = new Date(event.startTime);

      // 1. Day filter
      let dayMatch = true;
      switch (eventDayFilter) {
        case 'today':       dayMatch = d >= today && d < tomorrow; break;
        case 'tomorrow':    dayMatch = d >= tomorrow && d < afterTomorrow; break;
        case 'thisWeekend': dayMatch = d >= friday && d <= sunday; break;
        case 'upcoming':    dayMatch = d >= today; break;
        case 'past':        dayMatch = d < today; break;
        default: break;
      }
      if (!dayMatch) return false;

      // 2. Genre filter
      if (eventGenreFilter !== 'all') {
        const v = eventGenreFilter.toLowerCase();
        const genre = (event.genre || event.vibe || event.musicGenre || '').toLowerCase();
        if (!genre.includes(v)) return false;
      }

      // 3. Entrance filter
      if (eventEntranceFilter !== 'all') {
        const isFree = (!event.isTicketed || event.ticketPrice === 0) && event.minimumSpend === 0;
        if (eventEntranceFilter === 'free' && !isFree) return false;
        
        const isPaid = (event.isTicketed && event.ticketPrice > 0) || event.minimumSpend > 0;
        if (eventEntranceFilter === 'paid' && !isPaid) return false;
      }

      return true;
    });

    // Sort Events (Host -> Voltage -> Chronological)
    return [...filtered].sort((a, b) => {
      // 1. If user scanned a venue QR, that specific venue is pinned to the absolute top
      if (fromVenueId) {
        const aIsHost = String(a.venueId) === String(fromVenueId);
        const bIsHost = String(b.venueId) === String(fromVenueId);
        if (aIsHost && !bIsHost) return -1;
        if (!aIsHost && bIsHost) return 1;
      }
      
      // 2. Voltage Business Events get pinned to the top globally
      const aIsVoltage = (a.businessName || '').toLowerCase().includes('voltage');
      const bIsVoltage = (b.businessName || '').toLowerCase().includes('voltage');
      if (aIsVoltage && !bIsVoltage) return -1;
      if (!aIsVoltage && bIsVoltage) return 1;

      // 3. Fallback chronological sorting
      return new Date(a.startTime) - new Date(b.startTime);
    });
  }, [events, eventDayFilter, eventGenreFilter, eventEntranceFilter, fromVenueId, venues]);

  const eventAvailableGenres = useMemo(() => {
    if (!events || events.length === 0) return [{ id: 'all', label: 'All' }];
    
    const genres = new Set();
    events.forEach(event => {
      const gList = event.genre || event.vibe || event.musicGenre;
      if (gList) {
        gList.split(',').forEach(part => {
          const trimmed = part.trim();
          if (trimmed) genres.add(trimmed);
        });
      }
    });
    
    const options = [{ id: 'all', label: 'All' }];
    Array.from(genres).sort().forEach(g => {
      const label = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
      options.push({ id: g.toLowerCase(), label });
    });
    
    if (options.length === 1) {
      options.push(
        { id: 'electronic', label: 'Electronic' },
        { id: 'popullore',  label: 'Popullore' },
        { id: 'commercial', label: 'Commercial' },
        { id: 'rock',       label: 'Rock' },
        { id: 'hiphop',     label: 'Hip-Hop' }
      );
    }
    
    return options;
  }, [events]);

  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      // Night mode: show all venues (map hidden or events-focused)
      if (!isDayMode) return true;

      // Day mode: single type filter
      if (activeFilter === 'all') return true;

      switch (activeFilter) {
        case 'Beach':
          return ['Beach', 'BEACH'].includes(v.type);
        case 'Restaurant':
          return ['Restaurant', 'RESTAURANT'].includes(v.type);
        case 'Yacht':
          return ['Yacht', 'YACHT', 'Boat', 'BOAT', 'Water Sports'].includes(v.type);
        case 'Beach Club':
          return ['Beach Club', 'BEACH_CLUB'].includes(v.type);
        case 'Attraction':
          return ['Attraction', 'ATTRACTION', 'Sights', 'SIGHTS', 'Landmark', 'LANDMARK'].includes(v.type) || v.isSight;
        default:
          return true;
      }
    });
  }, [venues, activeFilter, isDayMode]);

  // Group filtered venues by business for map display
  const businessGroups = useMemo(() => {
    if (!filteredVenues || filteredVenues.length === 0) return [];
    let groups = groupVenuesByBusiness(filteredVenues);

    // Sort by distance (nearest first)
    if (userLocation) {
      groups = groups.sort((a, b) => {
        const distA = (a.latitude && a.longitude) ? calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude) : Infinity;
        const distB = (b.latitude && b.longitude) ? calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude) : Infinity;
        return distA - distB;
      });
    }

    return groups;
  }, [filteredVenues, groupVenuesByBusiness, userLocation]);

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
    <div className={`h-screen w-full overflow-hidden relative font-sans antialiased transition-all duration-500 ${isDayMode ? 'bg-[#FAFAF9] text-stone-900' : 'bg-zinc-950 text-white'}`}>
      {/* Grid Background Pattern - Only below header */}
      <div className="absolute inset-0 z-0 mt-32" style={{
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
          <Suspense fallback={
            <div className="flex h-full w-full items-center justify-center bg-[#FAFAF9]">
              <div className="flex flex-col items-center gap-4 text-stone-500">
                <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
                <span className="font-mono text-sm tracking-widest uppercase">Loading Base Map...</span>
              </div>
            </div>
          }>
            <Map
              ref={mapRef}
              initialViewState={initialViewState}
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
                  
                  // POI layers hidden
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
                          activeFilter={activeFilter}
                        />
                      </Marker>
                    )
                  ))}
                  
                  {/* NIGHT MODE: One marker per business, using business Google Maps address for coords */}
                  {!isDayMode && (() => {
                    // Group events by businessId
                    const byBusiness = {};
                    filteredEvents.forEach(event => {
                      if (!event.businessId) return;
                      if (!byBusiness[event.businessId]) {
                        byBusiness[event.businessId] = {
                          events: [],
                          businessName: event.businessName,
                          googleMapsAddress: event.businessGoogleMapsAddress
                        };
                      }
                      byBusiness[event.businessId].events.push(event);
                    });

                    return Object.entries(byBusiness).map(([businessId, { events: bizEvents, businessName, googleMapsAddress }]) => {
                      // Parse coordinates from the business-level Google Maps address
                      let coords = parseGoogleMapsUrl(googleMapsAddress);

                      // Fallback: If no coords from business address, look at the events' venue coordinates
                      if (!coords && bizEvents.length > 0) {
                        const fallBackVenueId = bizEvents[0].venueId;
                        const eventVenue = venues.find(v => String(v.id) === String(fallBackVenueId));
                        if (eventVenue && eventVenue.latitude && eventVenue.longitude) {
                          coords = { lat: eventVenue.latitude, lng: eventVenue.longitude };
                        }
                      }

                      if (!coords) return null;

                      return (
                        <Marker
                          key={`biz-${businessId}`}
                          longitude={coords.lng}
                          latitude={coords.lat}
                          anchor="center"
                        >
                          <BusinessEventMarker
                            businessName={businessName}
                            events={bizEvents}
                            isSelected={false}
                            onClick={() => {
                              if (bizEvents.length === 1) {
                                handleEventClick(bizEvents[0]);
                              } else {
                                setSelectedMapPinEvents({ businessId, businessName, events: bizEvents });
                              }
                            }}
                          />
                        </Marker>
                      );
                    });
                  })()}
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
          </Suspense>
        </div>
      )}

      {/* List View - Show Businesses Grouped (Day Mode) or Events (Night Mode) */}
      {viewMode === 'list' && (
        <div className="absolute inset-0 pt-40 pb-[120px] overflow-y-auto no-scrollbar px-6 space-y-6">
          {/* Day Mode: Show business groups */}
          {isDayMode && businessGroups.map((business) => {
            const isBeachBusiness = business.venues.some(v => v.type === 'Beach' || v.type === 'BEACH');
            const totalAvailable = business.totalAvailableUnits;
            const isAvailable = isBeachBusiness && totalAvailable >= 15;
            const isFewLeft = isBeachBusiness && totalAvailable > 0 && totalAvailable < 15;
            const businessImage = business.venues[0]?.imageUrl;
            const eventsCount = businessEventsCount[business.id] || 0;

            // Calculate distance from user
            const distanceText = (() => {
              if (!userLocation || !business.latitude || !business.longitude) return null;
              const km = calculateDistance(userLocation.latitude, userLocation.longitude, business.latitude, business.longitude);
              if (km < 1) return `${Math.round(km * 1000)}m`;
              return `${km.toFixed(1)}km`;
            })();

            // Build description from real venue data
            const description = (() => {
              // Use actual venue description if single venue
              if (business.venues.length === 1 && business.venues[0].description) {
                return business.venues[0].description;
              }
              // Multi-venue: list actual venue types
              if (business.venues.length > 1) {
                const types = [...new Set(business.venues.map(v => v.type).filter(Boolean))];
                return types.length > 0 ? types.join(' · ') : null;
              }
              return null;
            })();

            return (
              <div key={business.id} className={`group relative overflow-hidden rounded-3xl cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 ${isDayMode ? 'bg-white border border-stone-200' : 'bg-zinc-900 border border-zinc-800'}`}
                   onClick={() => handleBusinessClick(business)}>
                {/* Business Image */}
                <div className={`relative h-64 w-full overflow-hidden ${isDayMode ? 'bg-stone-100' : 'bg-zinc-900'}`}>
                  {/* Status Badge */}
                  {isBeachBusiness && (
                    <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
                      {isAvailable && (
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${isDayMode ? 'bg-emerald-500 border border-emerald-600 text-white' : 'bg-zinc-950 border border-zinc-800 text-[#10FF88] shadow-[0_0_8px_rgba(16,255,136,0.3)]'}`}>
                          {isDayMode ? 'Available' : (<><span className="w-1.5 h-1.5 bg-[#10FF88] inline-block mr-1.5 rounded-full"></span>LIVE NOW</>)}
                        </span>
                      )}
                      {isFewLeft && (
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${isDayMode ? 'bg-white border border-stone-200 text-zinc-950 shadow-sm' : 'bg-zinc-900 border border-zinc-800 text-amber-500'}`}>
                          {isDayMode ? 'Few Left' : (<><span className="w-1.5 h-1.5 bg-amber-500 inline-block mr-1.5 rounded-full"></span>FILLING FAST</>)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Top Right Badges */}
                  <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
                    {eventsCount > 0 && (
                      <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${isDayMode ? 'bg-white/90 border border-stone-200 text-zinc-900 shadow-sm' : 'bg-zinc-950/90 border border-zinc-800 text-zinc-300'}`}>
                        {eventsCount} {eventsCount === 1 ? 'EVENT' : 'EVENTS'}
                      </div>
                    )}
                    {business.venues.length > 1 && (
                      <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${isDayMode ? 'bg-white/90 border border-stone-200 text-zinc-950 shadow-sm' : 'bg-zinc-900/90 border border-zinc-800 text-white'}`}>
                        {business.venues.length} VENUES
                      </div>
                    )}
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

                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Location Badge with real distance */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-medium opacity-90">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{distanceText || 'RIVIERA'}</span>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-serif text-2xl tracking-tight ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>{business.name}</h3>
                    {business.venues[0]?.averageRating > 0 && (
                      <div className="flex items-center space-x-0.5">
                        <svg className={`w-3.5 h-3.5 fill-current ${isDayMode ? 'text-zinc-950' : 'text-white'}`} viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className={`text-xs font-bold ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>
                          {business.venues[0].averageRating.toFixed(1)}
                        </span>
                        {business.venues[0].reviewCount > 0 && (
                          <span className="text-[10px] text-zinc-400">({business.venues[0].reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {description && (
                    <p className={`text-xs leading-relaxed line-clamp-2 mb-4 font-sans ${isDayMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {description}
                    </p>
                  )}

                  <div className={`grid grid-cols-2 gap-4 mb-5 border-t pt-4 ${isDayMode ? 'border-zinc-200' : 'border-zinc-800'}`}>
                    {isBeachBusiness ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Sunbeds</span>
                        <span className={`text-sm font-medium ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                          {totalAvailable} available
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Venues</span>
                        <span className={`text-sm font-medium ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                          {business.venues.length} {business.venues.length === 1 ? 'location' : 'locations'}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Type</span>
                      <span className={`text-sm font-medium ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                        {[...new Set(business.venues.map(v => v.type).filter(Boolean))].join(' · ') || 'Venue'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      className={`flex-1 text-xs font-bold uppercase tracking-widest py-3.5 transition-colors border rounded-full ${isDayMode ? 'bg-zinc-950 text-white hover:bg-zinc-800 border-zinc-950' : 'bg-zinc-950 text-[#10FF88] hover:bg-zinc-900 border-[#10FF88]/30 shadow-[0_0_15px_rgba(16,255,136,0.1)]'}`}
                    >
                      Explore
                    </button>
                    <button className={`w-11 h-11 flex items-center justify-center border transition-colors rounded-full ${isDayMode ? 'border-stone-200 hover:border-zinc-950 bg-stone-50 text-zinc-950' : 'border-zinc-800 hover:border-zinc-500 bg-zinc-900/50 text-zinc-300'}`}>
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
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-zinc-800 border-t-[#10FF88] rounded-full animate-spin"></div>
              <p className="text-lg text-zinc-400">Loading events...</p>
            </div>
          )}
          
          {!isDayMode && !eventsLoading && events.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh]">
              <span className="text-6xl mb-6">🪩</span>
              <h3 className="text-2xl font-display font-medium text-white mb-3 tracking-wide uppercase">No Events Yet</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto font-mono uppercase tracking-wider leading-relaxed">
                Stay tuned — new events are being added to the Riviera regularly.
              </p>
            </div>
          )}
          
          {!isDayMode && !eventsLoading && events.length > 0 && filteredEvents.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh]">
              <div className="text-zinc-600 mb-6">
                <span className="text-6xl">🪩</span>
              </div>
              
              {fromVenueId ? (
                <>
                  <h3 className="text-2xl font-display font-medium text-white mb-3 tracking-wide uppercase">No Events Scheduled</h3>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-8 font-mono uppercase tracking-wider leading-relaxed">
                    This venue doesn't have any upcoming events listed at the moment.
                  </p>
                  <button 
                    onClick={() => {
                      window.location.href = '/?mode=night';
                    }}
                    className="px-8 py-4 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors duration-300"
                  >
                    EXPLORE EVENTS IN OUR RIVIERA
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-display font-medium text-white mb-3 tracking-wide uppercase">No events match your filter</h3>
                  <p className="text-sm text-zinc-400 font-mono uppercase tracking-wider mb-2">Try changing your date or type filters above</p>
                </>
              )}
            </div>
          )}
          
          {!isDayMode && filteredEvents.map((event) => {
            const venue = venues.find(v => v.id === event.venueId) || null;
            
            const eventDate = new Date(event.startTime);
            const isToday = eventDate.toDateString() === new Date().toDateString();
            const isUpcoming = eventDate > new Date();
            
            return (
              <div 
                key={event.id} 
                className="relative w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-zinc-600 transition-all duration-500 shadow-2xl cursor-pointer mb-8"
                onClick={() => handleEventClick(event)}
              >
                {/* Poster Image — full, unobstructed */}
                <div className="relative w-full overflow-hidden">
                  {event.flyerImageUrl || event.imageUrl ? (
                    <img 
                      alt="Event" 
                      className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-700"
                      src={event.flyerImageUrl || event.imageUrl}
                    />
                  ) : (
                    <div className="w-full aspect-[4/5] bg-zinc-800 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-zinc-700" />
                    </div>
                  )}
                  
                  {/* Date badge — floats on top-left of image */}
                  <div className="absolute top-4 left-4 z-20 flex items-start gap-2">
                    <div className="bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-700 shadow-md flex flex-col items-center justify-center font-mono">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                        {eventDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-xl font-black text-white leading-none mt-1">
                        {eventDate.getDate()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Free entry badge — floats on top-right */}
                  {(!event.isTicketed || event.ticketPrice === 0) && event.minimumSpend === 0 && (
                    <div className="absolute top-4 right-4 z-20 bg-zinc-900/90 backdrop-blur-md px-4 py-2 border border-[#10FF88]/30 rounded-full flex items-center shadow-[0_0_10px_rgba(16,255,136,0.1)]">
                      <span className="text-[10px] font-mono text-[#10FF88] font-black tracking-widest uppercase">FREE ENTRY</span>
                    </div>
                  )}
                </div>
                
                {/* Event Info — below the image */}
                <div className="bg-zinc-950 border-t border-zinc-800">
                  <div className="p-5 pb-3">
                    <h2 className="text-2xl font-display font-normal text-white uppercase tracking-tighter mb-1 leading-none">
                      {event.name}
                    </h2>
                    {event.description && (
                      <p className="text-xs font-mono text-zinc-400 font-bold tracking-widest uppercase mt-2">
                        {event.description.substring(0, 50)}{event.description.length > 50 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  
                  <div className="px-5 py-3 flex items-center justify-between text-xs text-zinc-400 font-mono border-t border-zinc-800">
                    <span className="uppercase font-bold tracking-widest text-[10px]">
                      [ {event.businessName} ]
                    </span>
                    <div className="flex items-center gap-3">
                      {event.maxGuests > 0 && (
                        <span className="uppercase font-bold tracking-widest text-[10px] text-zinc-500">
                          {event.maxGuests} MAX
                        </span>
                      )}
                      <span className="uppercase font-bold tracking-widest text-[10px] text-[#10FF88]">
                        [ {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        {event.endTime ? ` - ${new Date(event.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''} ]
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 pt-3 flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className="flex-1 py-4 bg-zinc-900 border-2 border-white rounded-none text-[12px] font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em]"
                    >
                      CONFIRM ACCESS
                    </button>
                    {(event.latitude || event.businessGoogleMapsAddress) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          let url = '';
                          if (event.latitude && event.longitude) {
                            url = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
                          } else if (event.businessGoogleMapsAddress) {
                            url = event.businessGoogleMapsAddress;
                          }
                          if (url) {
                            if (url.startsWith('http')) {
                              window.open(url, '_blank', 'noopener,noreferrer');
                            } else {
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                            }
                          }
                        }}
                        className="w-14 shrink-0 flex items-center justify-center bg-zinc-900 border-2 border-white text-white hover:bg-white hover:text-black transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">directions</span>
                      </button>
                    )}
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
          
        </div>
      )}
      
      {/* Events View */}
      {viewMode === 'events' && (
        <div className={`absolute inset-0 pt-[80px] pb-[120px] overflow-y-auto no-scrollbar px-6 ${isDayMode ? 'bg-stone-50' : 'bg-zinc-950'}`}>
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

      {/* Restructured Header - Location Centered, Filters as Dropdowns */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isDayMode ? 'bg-gradient-to-b from-stone-50 via-stone-50/90 to-transparent' : 'bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-transparent'}`}>
        {/* Top Row: Centered Location */}
        <div className="flex items-center justify-center px-6 pt-8 pb-4">
          {/* Center: Location Trigger */}
          <button
            onClick={() => setLocationBottomSheetOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
              isDayMode 
                ? 'bg-white/80 border-stone-200 text-stone-700 hover:bg-white hover:text-stone-900 shadow-sm' 
                : 'bg-zinc-900/80 border-zinc-800 text-white hover:bg-zinc-900 hover:text-white shadow-sm'
            }`}
          >
            <span className="text-[#10FF88]">📍</span>
            <span className="font-mono text-xs uppercase tracking-widest">
              {fromVenueId && venues.length > 0
                ? venues.find(v => String(v.id) === String(fromVenueId))?.name || 'VENUE'
                : selectedGeographicZone === 'EVERYWHERE' 
                ? 'EVERYWHERE' 
                : selectedGeographicZone === 'NEARBY'
                ? 'NEARBY'
                : selectedGeographicZone.toUpperCase()}
            </span>
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${locationBottomSheetOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Experiential Switch Moved to Bottom Nav */}

        {/* Filter Row */}
        <div className="px-6 pb-6 mt-2">
          {isDayMode ? (
            /* Day Mode: Horizontal pill row for venue types */
            <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
              {DAY_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${
                    activeFilter === filter.id
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-md'
                      : 'bg-white border-stone-300 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  <span className="text-sm">{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Night Mode: Day + Genre + Entrance dropdowns for events */
            <div className="flex flex-wrap gap-2 pb-1 relative z-50">
              
              {/* Day Filter */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => { setDayDropdownOpen(!dayDropdownOpen); setGenreDropdownOpen(false); setEntranceDropdownOpen(false); }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border text-[11px] font-bold tracking-widest uppercase transition-all duration-200 whitespace-nowrap ${
                    eventDayFilter !== 'upcoming' || dayDropdownOpen
                      ? 'bg-[#10FF88] border-[#10FF88] text-zinc-950 shadow-[0_0_12px_rgba(16,255,136,0.35)]'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[80px] inline-block align-bottom">
                    {[
                      { id: 'today',       label: 'Today' },
                      { id: 'tomorrow',    label: 'Tomorrow' },
                      { id: 'thisWeekend', label: 'This Weekend' },
                      { id: 'upcoming',    label: 'Upcoming' },
                      { id: 'past',        label: 'Past Events' },
                    ].find(o => o.id === eventDayFilter)?.label || 'Day'}
                  </span>
                  <svg className={`w-2.5 h-2.5 transition-transform ${dayDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dayDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDayDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                      {[
                        { id: 'today',       label: 'Today' },
                        { id: 'tomorrow',    label: 'Tomorrow' },
                        { id: 'thisWeekend', label: 'This Weekend' },
                        { id: 'upcoming',    label: 'Upcoming' },
                        { id: 'past',        label: 'Past Events' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { setEventDayFilter(opt.id); setDayDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                            eventDayFilter === opt.id ? 'bg-[#10FF88] text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Genre Filter */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => { setGenreDropdownOpen(!genreDropdownOpen); setDayDropdownOpen(false); setEntranceDropdownOpen(false); }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border text-[11px] font-bold tracking-widest uppercase transition-all duration-200 whitespace-nowrap ${
                    eventGenreFilter !== 'all' || genreDropdownOpen
                      ? 'bg-[#10FF88] border-[#10FF88] text-zinc-950 shadow-[0_0_12px_rgba(16,255,136,0.35)]'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[80px] inline-block align-bottom">
                    {eventGenreFilter === 'all' ? 'GENRE' : eventAvailableGenres.find(o => o.id === eventGenreFilter)?.label || 'GENRE'}
                  </span>
                  <svg className={`w-2.5 h-2.5 transition-transform ${genreDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {genreDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setGenreDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                      {eventAvailableGenres.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { setEventGenreFilter(opt.id); setGenreDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                            eventGenreFilter === opt.id ? 'bg-[#10FF88] text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Entrance Filter */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => { setEntranceDropdownOpen(!entranceDropdownOpen); setDayDropdownOpen(false); setGenreDropdownOpen(false); }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border text-[11px] font-bold tracking-widest uppercase transition-all duration-200 whitespace-nowrap ${
                    eventEntranceFilter !== 'all' || entranceDropdownOpen
                      ? 'bg-[#10FF88] border-[#10FF88] text-zinc-950 shadow-[0_0_12px_rgba(16,255,136,0.35)]'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[80px] inline-block align-bottom">
                    {eventEntranceFilter === 'all' ? 'ENTRANCE' : [
                      { id: 'all',  label: 'All' },
                      { id: 'free', label: 'Free' },
                      { id: 'paid', label: 'Paid' },
                    ].find(o => o.id === eventEntranceFilter)?.label || 'ENTRANCE'}
                  </span>
                  <svg className={`w-2.5 h-2.5 transition-transform ${entranceDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {entranceDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setEntranceDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                      {[
                        { id: 'all',  label: 'All' },
                        { id: 'free', label: 'Free' },
                        { id: 'paid', label: 'Paid' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { setEventEntranceFilter(opt.id); setEntranceDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                            eventEntranceFilter === opt.id ? 'bg-[#10FF88] text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          )}
        </div>
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
                  () => {
                    setToast('Unable to get your location. Please enable location services.');
                    setTimeout(() => setToast(null), 3000);
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
            <button
              onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
              className={`w-10 h-10 flex items-center justify-center transition-colors border-b ${isDayMode ? 'hover:bg-stone-100 active:bg-stone-200 border-zinc-200 text-zinc-600 hover:text-zinc-950' : 'hover:bg-zinc-800 active:bg-zinc-700 border-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
              className={`w-10 h-10 flex items-center justify-center transition-colors ${isDayMode ? 'hover:bg-stone-100 active:bg-stone-200 text-zinc-600 hover:text-zinc-950' : 'hover:bg-zinc-800 active:bg-zinc-700 text-zinc-400 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Business Bottom Sheet (shows list of venues) */}
      {selectedBusiness && !selectedVenue && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          <BusinessBottomSheet
            business={selectedBusiness}
            onClose={handleCloseBottomSheet}
            onVenueSelect={handleVenueClick}
            isDayMode={isDayMode}
            userLocation={userLocation}
          />
        </div>
      )}

      {/* Venue Bottom Sheet (shows single venue details) */}
      {selectedVenue && !selectedVenue.isAsset && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          <VenueBottomSheet
            venue={selectedVenue}
            onClose={handleCloseBottomSheet}
            isDayMode={isDayMode}
          />
        </div>
      )}

      {/* Asset Bottom Sheet (shows yacht/boat charter details) */}
      {selectedVenue && selectedVenue.isAsset && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          <AssetBottomSheet
            asset={selectedVenue}
            isOpen={true}
            onClose={handleCloseBottomSheet}
            isDayMode={isDayMode}
          />
        </div>
      )}

      {/* ── Solid Bottom Navigation ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 pt-4 pb-8 px-5 border-t ${
        isDayMode ? 'bg-[#FAFAF9] border-stone-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <div className="w-full max-w-md mx-auto flex items-center justify-between">
          
          {/* Left: Venue Button */}
          <button
            onClick={() => {
              if (fromVenueId) {
                // Return to Spot landing fully, preserving table number if active
                let returnUrl = `/spot?v=${fromVenueId}`;
                if (isSessionActive && tableNumber) {
                  returnUrl += `&u=${tableNumber}`;
                }
                if (isSessionActive && sessionZoneId) {
                  returnUrl += `&z=${sessionZoneId}`;
                }
                window.location.href = returnUrl;
              } else {
                setToast("You are not currently at a venue.");
                setTimeout(() => setToast(null), 3000);
              }
            }}
            aria-label="Zone Selection"
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border shadow-sm ${
              fromVenueId 
                ? (isDayMode ? 'bg-white text-zinc-900 border-stone-200 hover:bg-stone-50 hover:scale-105' : 'bg-[#10FF88] text-zinc-950 border-[#10FF88] hover:bg-[#0ee67b] shadow-[0_0_12px_rgba(16,255,136,0.4)] hover:scale-105')
                : (isDayMode ? 'bg-stone-100 text-stone-400 border-stone-200 opacity-70' : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 opacity-70')
            }`}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          </button>

          {/* Center: Experiential Switch (Day/Night) */}
          <div className={`flex p-1 rounded-full border ${
            isDayMode ? 'bg-white border-stone-200 shadow-sm' : 'bg-zinc-900 border-zinc-700 shadow-sm'
          }`}>
            <button 
              onClick={() => handleExperienceSwitch('day')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                isDayMode ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM6.166 17.834a.75.75 0 001.06 1.06l1.59-1.591a.75.75 0 10-1.06-1.061l-1.59 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 6.166a.75.75 0 001.061-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.59z"/>
              </svg>
              <span>Day</span>
              <span className="text-[8px] ml-0.5 opacity-60">SOON</span>
            </button>
            <button 
              onClick={() => handleExperienceSwitch('night')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                !isDayMode ? 'bg-[#10FF88] text-zinc-950 shadow-md' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
              <span>Night</span>
            </button>
          </div>

          {/* Right: View Toggle (Map/List) */}
          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            aria-label="Toggle View Mode"
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border shadow-sm ${
              isDayMode 
                ? 'bg-white text-zinc-950 border-stone-200 hover:bg-stone-50'
                : 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            {viewMode === 'map' ? (
              // List Icon
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M3 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm1 5a1 1 0 100 2h16a1 1 0 100-2H4z" clipRule="evenodd" />
              </svg>
            ) : (
              // Map Icon
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* Selected Map Pin - Multiple Events Interstitial Bottom Sheet */}
      {selectedMapPinEvents && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setSelectedMapPinEvents(null)} 
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto bg-zinc-950 rounded-t-3xl border-t border-zinc-800 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-zinc-800" />
            </div>
            <div className="px-5 pt-3 pb-8">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-display font-medium text-white uppercase tracking-wider">{selectedMapPinEvents.businessName}</h2>
                  <p className="text-[10px] text-[#10FF88] font-mono tracking-widest uppercase mt-1">Select an Event</p>
                </div>
                <button 
                  onClick={() => setSelectedMapPinEvents(null)} 
                  className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {selectedMapPinEvents.events.map(e => {
                  const d = new Date(e.startTime);
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div 
                      key={e.id} 
                      onClick={() => { setSelectedMapPinEvents(null); handleEventClick(e); }}
                      className="flex gap-4 p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-[0.98]"
                    >
                      <div className="w-[72px] h-[90px] shrink-0 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 relative">
                        {e.flyerImageUrl ? (
                          <img src={e.flyerImageUrl} alt="" className="w-full h-full object-cover saturate-50" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🪩</div>
                        )}
                        {isToday && (
                          <div className="absolute top-1 left-1 bg-[#10FF88] px-1.5 py-0.5 rounded text-[8px] font-black text-black tracking-widest uppercase">
                            Tonight
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-white text-sm uppercase leading-tight truncate">{e.name}</h4>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="material-symbols-outlined text-[12px] text-zinc-500">calendar_month</span>
                          <span className="text-xs font-mono text-zinc-400">
                            {d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-[10px] border border-zinc-700 bg-zinc-800 px-2 py-0.5 rounded font-mono text-zinc-300 uppercase truncate max-w-[100px]">
                            {e.genre || e.vibe || 'Nightclub'}
                          </div>
                          <div className="text-[#10FF88] text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                            View <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">
          <div className={`px-6 py-3 rounded-full shadow-2xl text-[11px] font-black tracking-widest uppercase border ${
            isDayMode ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-white text-zinc-950 border-stone-200'
          }`}>
            {toast.message || (typeof toast === 'string' ? toast : '')}
          </div>
        </div>
      )}

      {/* Location Bottom Sheet */}
      <LocationBottomSheet
        isOpen={locationBottomSheetOpen}
        onClose={() => setLocationBottomSheetOpen(false)}
        onZoneSelect={handleZoneSelect}
        onGPSLocationSelect={handleGPSLocationSelect}
        selectedZone={selectedGeographicZone}
        isDayMode={isDayMode}
      />

      {/* Custom Styles — fonts loaded via index.html <link> */}
      <style>{`
        .font-display { font-family: 'Anton', sans-serif; }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; border-color: transparent; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .mapboxgl-map { font-family: 'Inter', sans-serif; }
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
        .mapboxgl-ctrl-group { display: none !important; }
      `}</style>
    </div>
  );
}
