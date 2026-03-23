import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';

// Lazy load heavy mapbox components
const Map = lazy(() => import('react-map-gl'));
const Marker = lazy(() => import('react-map-gl').then(mod => ({ default: mod.Marker })));
const NavigationControl = lazy(() => import('react-map-gl').then(mod => ({ default: mod.NavigationControl })));
import { venueApi } from '../services/venueApi';
import { publicEventsApi } from '../services/eventsApi';
import { geographicZonesApi } from '../services/geographicZonesApi';
import VenueBottomSheet from '../components/VenueBottomSheet';
import BusinessBottomSheet from '../components/BusinessBottomSheet';
import AssetBottomSheet from '../components/AssetBottomSheet';
import EventsView from '../components/EventsView';
import LocationBottomSheet from '../components/LocationBottomSheet';
import { calculateDistance, sortEventsByDistance, sortVenuesByDistance, getCurrentLocation } from '../utils/locationUtils';

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
  { id: 'Restaurant', label: 'DINE', icon: '🍴' },
  { id: 'Yacht', label: 'YACHT', icon: '⚓' },
  { id: 'Beach Club', label: 'VIBE', icon: '🥂' }
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
  const mapRef = useRef();
  const [searchParams] = useSearchParams();
  
  // 🏖️ VENUE JAIL: Detect if returning from a QR session
  const fromVenueId = searchParams.get('from');
  const forceMode = searchParams.get('mode'); // 'night' = force night mode
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null); // For business grouping
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // Default to showing all venues
  
  // Initialize mode: check forced night mode OR time-based auto-switch (5PM-4AM = night)
  const isForcedNightMode = forceMode === 'night';
  const isAutoNightTime = (() => {
    const h = new Date().getHours();
    return h >= 17 || h < 4;
  })();
  const shouldStartNight = isForcedNightMode || isAutoNightTime;
  const [isDayMode, setIsDayMode] = useState(!shouldStartNight);
  const [viewMode, setViewMode] = useState(shouldStartNight ? 'list' : 'map');
  const [activeCategory, setActiveCategory] = useState(null);

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
  const [activeEventDateFilter, setActiveEventDateFilter] = useState('all'); // Night: all/today/weekend
  const [activeEventTypeFilter, setActiveEventTypeFilter] = useState('all'); // Night: all/vip/free
  const [activeDayTypeFilter, setActiveDayTypeFilter] = useState('all'); // Day: all/Beach/Restaurant/Yacht/Beach Club

  // Location/Zone state
  const [selectedGeographicZone, setSelectedGeographicZone] = useState('EVERYWHERE');
  const [locationBottomSheetOpen, setLocationBottomSheetOpen] = useState(false);
  const [isUsingGPSLocation, setIsUsingGPSLocation] = useState(false); // Track if using GPS vs manual zone

  // Pre-fetched data for list view
  const [businessEventsCount, setBusinessEventsCount] = useState({}); // { businessId: count }

  // Dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Theme Trigger Categories - Dynamic based on available data

  // Dynamic Theme Categories - Vibe Based (Intent-driven Experiential Filters)
  const generateThemeCategories = useMemo(() => {
    const categories = [];
    
    // Check what data we actually have to ensure we don't show empty vibes
    const venueTypes = [...new Set(venues.map(v => v.type).filter(Boolean))];
    const hasEvents = events.length > 0;
    
    // ==========================================
    // ☀️ DAYTIME VIBES (Map Centric)
    // ==========================================
    
    // 0. "All" - Show all venues
    categories.push({ 
      id: 'ALL_DAY', 
      label: 'ALL VENUES', 
      icon: '🌏', 
      isDayMode: true, 
      filter: 'all',
      count: venues.length
    });

    // 1. "Chill" - Relaxed beach settings, quieter lounges
    if (!fromVenueId && (venueTypes.includes('Beach') || venueTypes.includes('BEACH') || venueTypes.includes('Lounge'))) {
      categories.push({ 
        id: 'CHILL', 
        label: 'CHILL', 
        icon: '🌴', 
        isDayMode: true, 
        filter: 'chill', // Custom filter identifier
        count: venues.filter(v => ['Beach', 'BEACH', 'Lounge', 'Cafe'].includes(v.type)).length
      });
    }

    // 2. "Family" - Family friendly settings (mostly restaurants for now)
    if (venueTypes.includes('Restaurant') || venueTypes.includes('RESTAURANT')) {
      categories.push({ 
        id: 'FAMILY', 
        label: 'FAMILY', 
        icon: '👨‍👩‍👧‍👦', 
        isDayMode: true, 
        filter: 'family',
        count: venues.filter(v => ['Restaurant', 'RESTAURANT'].includes(v.type)).length
      });
    }

    // 3. "Party Booking" - High energy day spots (Beach Clubs)
    const beachClubs = venues.filter(v => 
      (v.type === 'Beach Club' || v.type === 'BEACH_CLUB') || 
      ((v.type === 'Beach' || v.type === 'BEACH') && v.hasEvents)
    );
    if (!fromVenueId && beachClubs.length > 0) {
      categories.push({ 
        id: 'PARTY_BOOKING', 
        label: 'PARTY BOOKING', 
        icon: '🥂', 
        isDayMode: true, 
        filter: 'party_booking',
        count: beachClubs.length
      });
    }

    // 4. "Water Sports" - Yachts, boats, and specific activities
    const yachtVenues = venues.filter(v => 
      ['Yacht', 'YACHT', 'Boat', 'BOAT', 'Water Sports'].includes(v.type)
    );
    if (yachtVenues.length > 0) {
      categories.push({ 
        id: 'WATER_SPORTS', 
        label: 'WATER SPORTS', 
        icon: '🛥️', 
        isDayMode: true, 
        filter: 'water_sports',
        count: yachtVenues.length
      });
    }

    // ==========================================
    // 🪩 NIGHTLIFE VIBES (List Centric)
    // ==========================================
    
    // 0. "All" - Show all events and venues
    categories.push({ 
      id: 'ALL_NIGHT', 
      label: 'ALL EVENTS', 
      icon: '🌙', 
      isDayMode: false, 
      filter: 'all',
      count: events.length > 0 ? events.length : venues.length
    });

    if (hasEvents || beachClubs.length > 0 || venueTypes.includes('Restaurant')) {
      // 1. "Live DJ" - Electronic vibe events or major clubs
      categories.push({ 
        id: 'LIVE_DJ', 
        label: 'LIVE DJ', 
        icon: '🎧', 
        isDayMode: false, 
        filter: 'live_dj',
        count: events.filter(e => e.vibe === 'Electronic' || e.vibe === 'Acoustic').length || beachClubs.length
      });

      // 2. "Fine Dining" - Upscale restaurants open late
      categories.push({ 
        id: 'FINE_DINING', 
        label: 'FINE DINING', 
        icon: '🍷', 
        isDayMode: false, 
        filter: 'fine_dining',
        count: venues.filter(v => ['Restaurant', 'RESTAURANT'].includes(v.type)).length
      });

      // 3. "VIP Tables" - High minimum spend events
      categories.push({ 
        id: 'VIP_TABLES', 
        label: 'VIP TABLES', 
        icon: '💎', 
        isDayMode: false, 
        filter: 'vip_tables',
        count: events.filter(e => e.minimumSpend > 0 || e.vibe === 'VIP').length || beachClubs.length
      });

      // 4. "Sunset Drinks" - Evening view spots
      categories.push({ 
        id: 'SUNSET_DRINKS', 
        label: 'SUNSET DRINKS', 
        icon: '🌇', 
        isDayMode: false, 
        filter: 'sunset_drinks',
        count: venues.filter(v => ['Beach', 'BEACH', 'Beach Club', 'Lounge'].includes(v.type)).length
      });
    }
    
    return categories;
  }, [venues, events, fromVenueId]);

  // Set default category once data is loaded, or when mode changes and current category doesn't match
  useEffect(() => {
    if (generateThemeCategories.length === 0) return;

    const currentCat = generateThemeCategories.find(c => c.id === activeCategory);
    // Pick a default if no category is set, or if current category belongs to the wrong mode
    if (!currentCat || currentCat.isDayMode !== isDayMode) {
      const defaultCategory = generateThemeCategories.find(c => c.isDayMode === isDayMode) || generateThemeCategories[0];
      if (defaultCategory) {
        setActiveCategory(defaultCategory.id);
        setActiveFilter(defaultCategory.filter);
      }
    }
  }, [generateThemeCategories, isDayMode]);

  // Handle category click - stays within current mode
  const handleCategoryClick = (category) => {
    const categoryData = generateThemeCategories.find(c => c.id === category);
    if (!categoryData) return;

    setActiveCategory(category);
    setActiveFilter(categoryData.filter);

    // Reset sub-filters when switching category
    setActiveDayTypeFilter('all');
    setActiveEventDateFilter('all');
    setActiveEventTypeFilter('all');
    setActiveEventFilter('all');
  };

  // Handle explicit Day/Night mode switch (Experiential Switch)
  const handleExperienceSwitch = (targetMode) => {
    const goingDay = targetMode === 'day';
    setIsDayMode(goingDay);
    setViewMode(goingDay ? 'map' : 'list');

    // Reset all sub-filters
    setActiveDayTypeFilter('all');
    setActiveEventDateFilter('all');
    setActiveEventTypeFilter('all');
    setActiveEventFilter('all');

    // Pick first category for the new mode
    const defaultCat = generateThemeCategories.find(c => c.isDayMode === goingDay);
    if (defaultCat) {
      setActiveCategory(defaultCat.id);
      setActiveFilter(defaultCat.filter);
    }
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

  useEffect(() => {
    loadVenues();
    loadEvents(); // Load all events initially
  }, []);

  // Mark mode as initialized on mount
  useEffect(() => {
    setModeInitialized(true);
  }, []);

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
      setLoading(true);
      const data = await venueApi.getVenues();
      setVenues(data);
    } catch (err) {
      setError('Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, []);

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
      setToast('Could not get your location. Showing all venues.');
      setTimeout(() => setToast(null), 3000);
      await loadEvents();
    }
  }, [loadEvents, venues]);
  
  const handleEventClick = (event) => {
    const venue = venues.find(v => v.id === event.venueId);
    if (!venue) return;

    const whatsappNumber = venue.whatsappNumber || venue.whatsAppNumber || venue.phone;
    
    if (!whatsappNumber) {
      setToast(`${venue.name} doesn't have a contact number yet.`);
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
    window.open(whatsappUrl, '_blank');
  };

  // Filter events based on night mode filters (date + type combined)
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    // VENUE JAIL: If we have a fromVenueId, filter to only that venue's events
    let baseEvents = events;
    if (fromVenueId) {
      baseEvents = baseEvents.filter(event =>
        event.venueId === parseInt(fromVenueId) || event.venueId === fromVenueId
      );
    }

    // Apply night category filter (vibe-based)
    let categoryFiltered = baseEvents;
    if (activeFilter && activeFilter !== 'all') {
      categoryFiltered = baseEvents.filter(event => {
        switch (activeFilter) {
          case 'live_dj':
            return event.vibe === 'Electronic' || event.vibe === 'Acoustic' || event.vibe === 'DJ';
          case 'fine_dining': {
            const venue = venues.find(v => v.id === event.venueId);
            return venue && ['Restaurant', 'RESTAURANT'].includes(venue.type);
          }
          case 'vip_tables':
            return event.minimumSpend > 0 || (event.vibes && event.vibes.includes('VIP')) || event.vibe === 'VIP';
          case 'sunset_drinks': {
            const v = venues.find(v => v.id === event.venueId);
            return v && ['Beach', 'BEACH', 'Beach Club', 'BEACH_CLUB', 'Lounge'].includes(v.type);
          }
          default:
            return true;
        }
      });
    }

    const filtered = categoryFiltered.filter(event => {
      const eventDate = new Date(event.startTime);
      const today = new Date();
      const isToday = eventDate.toDateString() === today.toDateString();
      const isWeekend = [5, 6, 0].includes(eventDate.getDay());

      // Apply date filter
      if (activeEventDateFilter !== 'all') {
        if (activeEventDateFilter === 'today' && !isToday) return false;
        if (activeEventDateFilter === 'weekend' && !isWeekend) return false;
      }

      // Apply type filter
      if (activeEventTypeFilter !== 'all') {
        if (activeEventTypeFilter === 'vip') {
          if (!(event.minimumSpend > 0 || (event.vibes && event.vibes.includes('VIP')))) return false;
        }
        if (activeEventTypeFilter === 'free') {
          if (event.isTicketed && event.ticketPrice > 0) return false;
        }
      }

      return true;
    });

    // Pin host venue's events to top when returning from QR
    if (fromVenueId) {
      return [...filtered].sort((a, b) => {
        const aIsHost = String(a.venueId) === String(fromVenueId);
        const bIsHost = String(b.venueId) === String(fromVenueId);
        if (aIsHost && !bIsHost) return -1;
        if (!aIsHost && bIsHost) return 1;
        return new Date(a.startTime) - new Date(b.startTime);
      });
    }

    return filtered;
  }, [events, activeFilter, activeEventDateFilter, activeEventTypeFilter, fromVenueId, venues]);

  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      // Night mode: show all venues (map hidden or events-focused)
      if (!isDayMode) return true;

      // Day mode: apply category vibe filter first
      let passesCategory = true;
      switch (activeFilter) {
        case 'chill':
          passesCategory = ['Beach', 'BEACH', 'Lounge', 'Cafe'].includes(v.type);
          break;
        case 'family':
          passesCategory = ['Restaurant', 'RESTAURANT'].includes(v.type);
          break;
        case 'water_sports':
          passesCategory = ['Yacht', 'YACHT', 'Boat', 'BOAT', 'Water Sports'].includes(v.type);
          break;
        case 'party_booking':
          passesCategory = (v.type === 'Beach Club' || v.type === 'BEACH_CLUB') ||
                 ((v.type === 'Beach' || v.type === 'BEACH') && v.hasEvents);
          break;
        default:
          passesCategory = true;
      }
      if (!passesCategory) return false;

      // Then apply direct type filter (from type dropdown)
      if (activeDayTypeFilter !== 'all') {
        switch (activeDayTypeFilter) {
          case 'Beach':
            return ['Beach', 'BEACH'].includes(v.type);
          case 'Restaurant':
            return ['Restaurant', 'RESTAURANT'].includes(v.type);
          case 'Yacht':
            return ['Yacht', 'YACHT', 'Boat', 'BOAT', 'Water Sports'].includes(v.type);
          case 'Beach Club':
            return ['Beach Club', 'BEACH_CLUB'].includes(v.type);
          default:
            return true;
        }
      }

      return true;
    });
  }, [venues, activeFilter, activeDayTypeFilter, isDayMode]);

  // Group filtered venues by business for map display
  const businessGroups = useMemo(() => {
    if (!filteredVenues || filteredVenues.length === 0) return [];
    let groups = groupVenuesByBusiness(filteredVenues);
    
    // Sort by popularity (total available units) for high-energy vibes
    if (activeFilter === 'party_booking') {
      groups = groups.sort((a, b) => {
        return b.totalAvailableUnits - a.totalAvailableUnits;
      });
    }
    
    return groups;
  }, [filteredVenues, activeFilter, groupVenuesByBusiness]);

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
          </Suspense>
        </div>
      )}

      {/* List View - Show Businesses Grouped (Day Mode) or Events (Night Mode) */}
      {viewMode === 'list' && (
        <div className="absolute inset-0 pt-40 pb-[60px] overflow-y-auto no-scrollbar px-6 space-y-6">
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
              <div key={business.id} className={`group relative overflow-hidden rounded-sm cursor-pointer ${isDayMode ? 'bg-white border border-zinc-300' : 'bg-zinc-900 border border-zinc-800'}`}
                   onClick={() => handleBusinessClick(business)}>
                {/* Business Image */}
                <div className={`relative h-64 w-full overflow-hidden ${isDayMode ? 'bg-stone-100' : 'bg-zinc-900'}`}>
                  {/* Status Badge */}
                  {isBeachBusiness && (
                    <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
                      {isAvailable && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${isDayMode ? 'bg-emerald-500 border border-emerald-600 text-white' : 'bg-zinc-950 border border-zinc-800 text-white'}`}>
                          {isDayMode ? 'Available' : (<><span className="w-1.5 h-1.5 bg-[#10FF88] inline-block mr-1.5"></span>LIVE NOW</>)}
                        </span>
                      )}
                      {isFewLeft && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${isDayMode ? 'bg-white border border-zinc-300 text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-amber-500'}`}>
                          {isDayMode ? 'Few Left' : (<><span className="w-1.5 h-1.5 bg-amber-500 inline-block mr-1.5"></span>FILLING FAST</>)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Top Right Badges */}
                  <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
                    {eventsCount > 0 && (
                      <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm backdrop-blur-md ${isDayMode ? 'bg-purple-50/90 border border-purple-200 text-purple-800' : 'bg-purple-900/90 border border-purple-700 text-purple-300'}`}>
                        {eventsCount} {eventsCount === 1 ? 'EVENT' : 'EVENTS'}
                      </div>
                    )}
                    {business.venues.length > 1 && (
                      <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm backdrop-blur-md ${isDayMode ? 'bg-white/90 border border-zinc-200 text-zinc-950' : 'bg-zinc-900/90 border border-zinc-700 text-white'}`}>
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

                  <div className="flex items-center space-x-3 pt-1">
                    <button
                      className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 transition-colors border rounded-sm ${isDayMode ? 'bg-zinc-950 text-white hover:bg-zinc-800 border-zinc-950' : 'bg-zinc-950 text-white hover:bg-zinc-800 border-zinc-950'}`}
                    >
                      Explore
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
            const venue = venues.find(v => v.id === event.venueId);
            if (!venue) return null;
            
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
                    <div className="flex items-center gap-3">
                      {event.maxGuests > 0 && (
                        <span className="uppercase font-bold tracking-widest text-[10px] text-zinc-500">
                          {event.maxGuests} MAX
                        </span>
                      )}
                      <span className="uppercase font-bold tracking-widest text-[10px] text-[#10FF88]">
                        [ {eventDate.toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - LATE ]
                      </span>
                    </div>
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
          
        </div>
      )}
      
      {/* Events View */}
      {viewMode === 'events' && (
        <div className={`absolute inset-0 pt-[80px] pb-[60px] overflow-y-auto no-scrollbar px-6 ${isDayMode ? 'bg-stone-50' : 'bg-zinc-950'}`}>
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
            className={`flex items-center gap-2 transition-colors duration-300 ${isDayMode ? 'text-stone-700 hover:text-stone-900' : 'text-white hover:text-zinc-300'}`}
          >
            <span className="text-[#10FF88]">📍</span>
            <span className="font-mono text-xs uppercase tracking-widest">
              {selectedGeographicZone === 'EVERYWHERE' 
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

        {/* Experiential Switch (Daytime vs Nightlife) */}
        <div className="flex justify-center px-6 pb-4">
          <div className={`flex p-1 rounded-full shadow-lg ${isDayMode ? 'bg-white/90 border border-stone-200 backdrop-blur-md' : 'bg-zinc-900/90 border border-zinc-800 backdrop-blur-md'}`}>
            <button 
              onClick={() => handleExperienceSwitch('day')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isDayMode ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <span className="text-sm">☀️</span>
              <span>Daytime</span>
            </button>
            <button 
              onClick={() => handleExperienceSwitch('night')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${!isDayMode ? 'bg-[#10FF88] text-zinc-950 shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <span className="text-sm">🪩</span>
              <span>Nightlife</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="px-6 pb-6 mt-2">
          <div className="flex gap-4 justify-center">
            {/* Category Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setCategoryDropdownOpen(!categoryDropdownOpen); setDateDropdownOpen(false); setTypeDropdownOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all duration-300 ${
                  isDayMode 
                    ? 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                    : 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-600'
                }`}
              >
                <span className="text-sm">
                  {generateThemeCategories.find(c => c.id === activeCategory)?.icon || '🌏'}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest">
                  {generateThemeCategories.find(c => c.id === activeCategory)?.label || 'ALL'}
                </span>
                <svg className={`w-3 h-3 transition-transform duration-300 ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {categoryDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setCategoryDropdownOpen(false)}
                  ></div>
                  <div className={`absolute top-full left-0 mt-2 w-48 rounded-sm shadow-xl border overflow-hidden z-50 ${
                    isDayMode 
                      ? 'bg-white border-stone-200' 
                      : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    {generateThemeCategories.filter(c => c.isDayMode === isDayMode).map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryClick(category.id);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          activeCategory === category.id
                            ? (isDayMode ? 'bg-stone-100 text-stone-900' : 'bg-zinc-800 text-white')
                            : (isDayMode ? 'hover:bg-stone-50 text-stone-600' : 'hover:bg-zinc-800/50 text-zinc-400')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-mono text-xs uppercase tracking-widest">{category.label}</span>
                        </div>
                        {activeCategory === category.id && (
                          <span className="text-[#10FF88]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Date/Time Filter Dropdown (Night mode only) */}
            {!isDayMode && (
              <div className="relative">
                <button
                  onClick={() => { setDateDropdownOpen(!dateDropdownOpen); setTypeDropdownOpen(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all duration-300 ${
                    activeEventDateFilter !== 'all'
                      ? 'bg-[#10FF88]/10 border-[#10FF88]/50 text-[#10FF88]'
                      : 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-600'
                  }`}
                >
                  <span className="text-sm">🕐</span>
                  <span className="font-mono text-xs uppercase tracking-widest">
                    {activeEventDateFilter === 'all' ? 'WHEN' : activeEventDateFilter === 'today' ? 'TODAY' : 'WEEKEND'}
                  </span>
                  <svg className={`w-3 h-3 transition-transform duration-300 ${dateDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dateDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDateDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-44 rounded-sm shadow-xl border overflow-hidden z-50 bg-zinc-900 border-zinc-800">
                      {[
                        { id: 'all', label: 'ALL DATES', icon: '📅' },
                        { id: 'today', label: 'TODAY', icon: '🌙' },
                        { id: 'weekend', label: 'WEEKEND', icon: '🎉' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { setActiveEventDateFilter(option.id); setDateDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                            activeEventDateFilter === option.id
                              ? 'bg-zinc-800 text-white'
                              : 'hover:bg-zinc-800/50 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-mono text-xs uppercase tracking-widest">{option.label}</span>
                          </div>
                          {activeEventDateFilter === option.id && (
                            <span className="text-[#10FF88]">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Type Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setTypeDropdownOpen(!typeDropdownOpen); setDateDropdownOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all duration-300 ${
                  (isDayMode ? activeDayTypeFilter !== 'all' : activeEventTypeFilter !== 'all')
                    ? isDayMode
                      ? 'bg-zinc-950 border-zinc-950 text-white'
                      : 'bg-[#10FF88]/10 border-[#10FF88]/50 text-[#10FF88]'
                    : isDayMode
                      ? 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                      : 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-600'
                }`}
              >
                <span className="text-sm">{isDayMode ? '🏷️' : '✨'}</span>
                <span className="font-mono text-xs uppercase tracking-widest">
                  {isDayMode
                    ? (activeDayTypeFilter === 'all' ? 'TYPE' : DAY_FILTERS.find(f => f.id === activeDayTypeFilter)?.label || 'TYPE')
                    : (activeEventTypeFilter === 'all' ? 'TYPE' : activeEventTypeFilter === 'vip' ? 'VIP' : 'FREE')
                  }
                </span>
                <svg className={`w-3 h-3 transition-transform duration-300 ${typeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {typeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)}></div>
                  <div className={`absolute top-full right-0 mt-2 w-44 rounded-sm shadow-xl border overflow-hidden z-50 ${
                    isDayMode ? 'bg-white border-stone-200' : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    {isDayMode ? (
                      // Day mode: venue type filters
                      DAY_FILTERS.map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => { setActiveDayTypeFilter(filter.id); setTypeDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                            activeDayTypeFilter === filter.id
                              ? 'bg-stone-100 text-stone-900'
                              : 'hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{filter.icon}</span>
                            <span className="font-mono text-xs uppercase tracking-widest">{filter.label}</span>
                          </div>
                          {activeDayTypeFilter === filter.id && (
                            <span className="text-emerald-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      // Night mode: event type filters
                      [
                        { id: 'all', label: 'ALL TYPES', icon: '✨' },
                        { id: 'vip', label: 'VIP TABLES', icon: '💎' },
                        { id: 'free', label: 'FREE ENTRY', icon: '🎫' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { setActiveEventTypeFilter(option.id); setTypeDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                            activeEventTypeFilter === option.id
                              ? 'bg-zinc-800 text-white'
                              : 'hover:bg-zinc-800/50 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-mono text-xs uppercase tracking-widest">{option.label}</span>
                          </div>
                          {activeEventTypeFilter === option.id && (
                            <span className="text-[#10FF88]">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
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

      {/* Smart Floating Switcher - XIXA Sharp Standard */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          className={`
            px-6 py-3 rounded-sm font-mono text-xs uppercase tracking-widest
            transition-all duration-300 shadow-lg hover:scale-105 active:scale-95
            ${isDayMode 
              ? 'bg-zinc-950 text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
              : 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,0,0,0.7)]'
            }
          `}
        >
          {viewMode === 'map' ? (
            <>
              <span className="mr-2">📄</span>
              LIST
            </>
          ) : (
            <>
              <span className="mr-2">🗺️</span>
              MAP
            </>
          )}
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">
          <div className={`px-5 py-3 rounded-sm shadow-lg text-sm font-mono tracking-wide ${isDayMode ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'}`}>
            {toast}
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
