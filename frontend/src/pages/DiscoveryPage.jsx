import { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { venueApi } from '../services/venueApi';
import VenueBottomSheet from '../components/VenueBottomSheet';

// Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// 🎯 XIXA: Dark atmospheric map
const DARK_STYLE = "mapbox://styles/aldid1602/cmm3bp5b3001v01qy9yf3gzlo";

// Albanian Riviera center
const RIVIERA_CENTER = {
  longitude: 19.6644,
  latitude: 40.1500,
  zoom: 13,
  pitch: 45,
  bearing: -10
};

// Venue filters
const VENUE_FILTERS = [
  { id: 'all', label: 'All Venues' },
  { id: 'Beach', label: 'Beach Clubs' },
  { id: 'Boat', label: 'Boats' },
  { id: 'Restaurant', label: 'Dining' }
];

// 🎯 XIXA Atmospheric Marker with pulsing ring
function VenueMarker({ venue, isSelected, onClick }) {
  const isFull = venue.availableUnitsCount === 0;
  const isHighlight = venue.availableUnitsCount >= 15;
  
  return (
    <div 
      className="relative flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Pulsing ring for highlighted venues */}
      {isHighlight && !isFull && (
        <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 rounded-full border border-[#84d53f] opacity-50" 
               style={{ animation: 'pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1)' }}></div>
          <div className="absolute inset-0 rounded-full bg-[#84d53f]/20 animate-pulse"></div>
        </div>
      )}
      
      {/* Main marker */}
      <div 
        className={`
          relative flex items-center justify-center rounded-full z-10
          transition-all duration-300
          ${isHighlight && !isFull 
            ? 'w-9 h-9 bg-gradient-to-br from-slate-800 to-black border border-[#84d53f] shadow-[0_0_15px_rgba(132,213,63,0.3)]' 
            : isFull
            ? 'w-6 h-6 bg-slate-900 border border-white/30 shadow-lg'
            : 'w-8 h-8 bg-slate-900 border border-[#84d53f]/50 shadow-[0_0_10px_rgba(132,213,63,0.2)]'
          }
          ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
        `}
      >
        <span 
          className={`
            font-bold
            ${isHighlight && !isFull 
              ? 'text-xs text-[#84d53f]' 
              : isFull
              ? 'text-[8px] text-white/80'
              : 'text-[10px] text-[#84d53f]'
            }
          `}
        >
          {venue.availableUnitsCount || 0}
        </span>
      </div>
      
      {/* Venue label */}
      {(isHighlight || isSelected) && (
        <div 
          className={`
            mt-1 px-2 py-1 rounded text-[10px] font-medium tracking-wide
            bg-white/90 dark:bg-slate-900/90 backdrop-blur-md 
            border border-slate-200 dark:border-slate-700
            transition-opacity duration-300
            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          {venue.name}
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  const mapRef = useRef();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState(RIVIERA_CENTER);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadVenues();
  }, []);

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
    if (mapRef.current) {
      mapRef.current.flyTo({
        ...RIVIERA_CENTER,
        duration: 1500,
        essential: true
      });
    }
  }, []);

  const filteredVenues = venues.filter(v => {
    if (activeFilter === 'all') return true;
    return v.type === activeFilter;
  });

  if (loading) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-slate-700 border-t-[#84d53f] rounded-full animate-spin"></div>
          <p className="text-lg text-slate-400">Loading venues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-light text-white mb-4">Something went wrong</h2>
          <p className="text-lg text-slate-400 mb-8">{error}</p>
          <button
            onClick={loadVenues}
            className="bg-[#84d53f] text-slate-900 px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-[#75c235] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden relative bg-slate-900 font-sans antialiased">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={DARK_STYLE}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          cooperativeGestures={selectedVenue !== null}
          antialias={true}
        >
          <NavigationControl position="bottom-right" showCompass={false} />
          
          {filteredVenues.map(venue => (
            venue.latitude && venue.longitude && (
              <Marker
                key={venue.id}
                longitude={venue.longitude}
                latitude={venue.latitude}
                anchor="center"
              >
                <VenueMarker
                  venue={venue}
                  isSelected={selectedVenue?.id === venue.id}
                  onClick={() => handleVenueClick(venue)}
                />
              </Marker>
            )
          ))}
        </Map>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto pt-14 px-6 flex flex-col items-start space-y-4 bg-gradient-to-b from-white/90 via-white/50 to-transparent dark:from-slate-950/90 dark:via-slate-950/50 dark:to-transparent pb-12">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-4xl text-slate-900 dark:text-white tracking-tight font-serif">XIXA</h1>
              <p className="text-xs tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase mt-1">Albanian Riviera</p>
            </div>
            <button className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar w-full pb-2">
            {VENUE_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  whitespace-nowrap px-5 py-2 rounded-full text-xs font-medium tracking-wide shadow-sm
                  transform active:scale-95 transition-all
                  ${activeFilter === filter.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                    : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#84d53f]/50'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-3">
        <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <div className="flex flex-col rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition-colors border-b border-slate-200 dark:border-slate-700">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition-colors">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent pt-12 pb-6 px-6">
          {/* Search Bar */}
          <div className="relative mb-6 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#84d53f] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="block w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#84d53f] focus:border-[#84d53f] transition-all shadow-sm"
              placeholder="Find elite venues, yachts..."
              type="text"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Nav Bar */}
          <nav className="relative rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="flex items-center justify-around py-4">
              <button className="flex flex-col items-center space-y-1 group w-1/4">
                <svg className="w-7 h-7 text-[#84d53f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] font-medium text-slate-900 dark:text-white">Discover</span>
                <div className="w-1 h-1 rounded-full bg-[#84d53f] mt-1"></div>
              </button>
              
              <button className="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Saved</span>
              </button>
              
              <button className="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Bookings</span>
              </button>
              
              <button className="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Profile</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom Sheet */}
      {selectedVenue && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          <VenueBottomSheet
            venue={selectedVenue}
            onClose={handleCloseBottomSheet}
          />
        </div>
      )}

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(2.5); opacity: 0; }
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
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(12px);
            border-radius: 12px !important;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
            border: 1px solid rgba(0, 0, 0, 0.05) !important;
          }
          
          .mapboxgl-ctrl-group button {
            width: 36px !important;
            height: 36px !important;
          }
          
          .mapboxgl-ctrl-group button:hover {
            background-color: rgba(0, 0, 0, 0.05) !important;
          }
        `
      }} />
    </div>
  );
}
