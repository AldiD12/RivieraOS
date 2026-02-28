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
  { id: 'all', label: 'ALL VENUES' },
  { id: 'Beach', label: 'BEACH CLUBS' },
  { id: 'Boat', label: 'BOATS' },
  { id: 'Restaurant', label: 'DINING' }
];

// 🎯 XIXA Atmospheric Marker with pulsing ring (theme-aware)
function VenueMarker({ venue, isSelected, onClick, isDayMode }) {
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
          ${isHighlight && !isFull 
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
          }
          ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
        `}
      >
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
      </div>
      
      {/* Venue label */}
      {(isHighlight || isSelected) && (
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

export default function DiscoveryPage() {
  const mapRef = useRef();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState(RIVIERA_CENTER);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDayMode, setIsDayMode] = useState(false); // false = night mode (default)

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
      <div className="absolute inset-0 z-[1]">
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
                  isDayMode={isDayMode}
                />
              </Marker>
            )
          ))}
        </Map>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className={`pointer-events-auto pt-14 px-6 flex flex-col items-start space-y-4 pb-12 relative bg-gradient-to-b ${isDayMode ? 'from-stone-50 via-stone-50/90 to-transparent' : 'from-zinc-950 via-zinc-950/80 to-transparent'}`}>
          
          {/* Day/Night Toggle (centered at top) */}
          <div className="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
            <div className={`backdrop-blur-md border p-1 rounded-full flex shadow-lg pointer-events-auto ${isDayMode ? 'bg-white/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <button 
                onClick={() => setIsDayMode(true)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${isDayMode ? 'bg-zinc-950 text-white border border-zinc-950 shadow-sm' : 'bg-transparent text-zinc-500 border border-transparent hover:bg-zinc-800'}`}
              >
                <span>⛱️</span>
                <span>DAY</span>
              </button>
              <button 
                onClick={() => setIsDayMode(false)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!isDayMode ? 'bg-zinc-950 text-[#10FF88] border border-zinc-800 shadow-[0_0_12px_rgba(16,255,136,0.4)]' : 'bg-transparent text-zinc-500 border border-transparent hover:bg-stone-100'}`}
              >
                <span className={!isDayMode ? '' : 'opacity-70'} style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>🪩</span>
                <span style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>NIGHT</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-start w-full relative z-20 pt-8">
            <div>
              <h1 className={`font-serif text-4xl tracking-tight drop-shadow-sm ${isDayMode ? 'text-zinc-950' : 'text-white drop-shadow-lg'}`} style={{ fontFamily: 'Playfair Display, serif' }}>XIXA</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full bg-[#10FF88] animate-pulse ${isDayMode ? 'border border-zinc-950 shadow-[0_0_8px_rgba(16,255,136,0.3)]' : 'shadow-[0_0_12px_rgba(16,255,136,0.4)]'}`}></div>
                <p className={`text-[10px] font-mono tracking-[0.2em] uppercase ${isDayMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Albanian Riviera</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-3 pt-0">
              {/* Notification button */}
              <button className={`w-10 h-10 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all group shadow-sm ${isDayMode ? 'border-zinc-200 bg-white/80 hover:bg-stone-100 hover:border-zinc-300' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-[#10FF88]/50'}`}>
                <svg className={`w-5 h-5 transition-colors ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-400 group-hover:text-[#10FF88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              {/* List/Map toggle */}
              <div className={`flex items-center backdrop-blur-md border rounded-lg p-1 shadow-lg ${isDayMode ? 'bg-white/90 border-zinc-200' : 'bg-zinc-900/90 border-zinc-800'}`}>
                <button className={`px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-medium transition-colors border-r pr-3 ${isDayMode ? 'text-zinc-500 hover:text-zinc-900 border-zinc-200' : 'text-zinc-500 hover:text-white border-zinc-800'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>List</span>
                </button>
                <button className={`px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-bold rounded border ml-1 shadow-sm ${isDayMode ? 'text-[#10FF88] bg-zinc-950 border-zinc-950' : 'text-[#10FF88] bg-zinc-950 border-zinc-800 shadow-[0_0_12px_rgba(16,255,136,0.4)]'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : isDayMode ? { textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000' } : {}}>Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar w-full pb-2 pt-4 pl-0.5">
            {VENUE_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  whitespace-nowrap px-5 py-2 rounded-full text-xs font-medium tracking-wide
                  transform active:scale-95 transition-all
                  ${activeFilter === filter.id
                    ? isDayMode
                      ? 'bg-zinc-950 border border-zinc-950 text-[#10FF88] shadow-md'
                      : 'bg-zinc-950 border border-[#10FF88] text-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)]'
                    : isDayMode
                    ? 'bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 shadow-sm'
                    : 'bg-zinc-900/60 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
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
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 flex flex-col space-y-3 pointer-events-auto">
        <button className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg active:scale-95 transition-all group ${isDayMode ? 'bg-white/90 border-zinc-200 hover:border-zinc-400' : 'bg-zinc-900/90 border-zinc-800 hover:border-[#10FF88]/30'}`}>
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

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className={`pointer-events-auto bg-gradient-to-t pt-12 pb-8 px-6 ${isDayMode ? 'from-stone-50 via-stone-50/95 to-transparent' : 'from-zinc-950 via-zinc-950/95 to-transparent'}`}>
          {/* Search Bar */}
          <div className="relative mb-6 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 transition-colors ${isDayMode ? 'text-zinc-500 group-focus-within:text-zinc-950' : 'text-zinc-500 group-focus-within:text-[#10FF88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className={`block w-full pl-11 pr-12 py-3.5 backdrop-blur-lg border rounded-xl text-sm transition-all ${isDayMode ? 'bg-white/70 border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm' : 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#10FF88] focus:border-[#10FF88] shadow-inner'}`}
              placeholder="Find elite venues, yachts..."
              type="text"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button className={`p-1 rounded transition-colors ${isDayMode ? 'hover:bg-stone-200' : 'hover:bg-zinc-800'}`}>
                <svg className={`w-5 h-5 ${isDayMode ? 'text-zinc-500 hover:text-zinc-950' : 'text-zinc-500 hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Nav Bar */}
          <nav className={`relative rounded-2xl backdrop-blur-xl border shadow-2xl overflow-hidden ${isDayMode ? 'bg-white/60 border-white/20' : 'bg-zinc-900/80 border-zinc-800'}`}>
            {isDayMode && (
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
            )}
            <div className="flex items-center justify-around py-4 relative z-10">
              <button className="flex flex-col items-center space-y-1 group w-1/4">
                <svg className={`w-7 h-7 ${isDayMode ? 'text-xixa-green drop-shadow-sm' : 'text-[#10FF88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-[10px] font-medium tracking-wide ${isDayMode ? 'text-zinc-950 font-bold' : 'text-white'}`} style={!isDayMode ? { filter: 'drop-shadow(0 0 4px rgba(16, 255, 136, 0.4))' } : {}}>DISCOVER</span>
                <div className={`w-1 h-1 rounded-full mt-1 ${isDayMode ? 'bg-zinc-950' : 'bg-[#10FF88] shadow-[0_0_12px_rgba(16,255,136,0.4)]'}`}></div>
              </button>
              
              <button className="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
                <svg className={`w-6 h-6 ${isDayMode ? 'text-zinc-800 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className={`text-[10px] font-medium tracking-wide ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`}>SAVED</span>
              </button>
              
              <button className="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
                <svg className={`w-6 h-6 ${isDayMode ? 'text-zinc-800 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className={`text-[10px] font-medium tracking-wide ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`}>BOOKINGS</span>
              </button>
              
              <button className="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
                <svg className={`w-6 h-6 ${isDayMode ? 'text-zinc-800 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={`text-[10px] font-medium tracking-wide ${isDayMode ? 'text-zinc-500 group-hover:text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`}>PROFILE</span>
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
