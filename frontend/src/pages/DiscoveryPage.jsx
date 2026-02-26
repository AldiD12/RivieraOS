import { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { venueApi } from '../services/venueApi';
import VenueBottomSheet from '../components/VenueBottomSheet';

// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Albanian Riviera coordinates (Dhërmi center)
const RIVIERA_CENTER = {
  longitude: 19.6644,
  latitude: 40.1500,
  zoom: 11
};

// Custom marker component with glowing pulse effect
function VenueMarker({ venue, isSelected, onClick }) {
  const isFull = venue.availableUnitsCount === 0;
  
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Pulsing ring - only when available */}
      {!isFull && (
        <div className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
      )}
      
      {/* Main marker dot */}
      <div 
        className={`
          relative w-4 h-4 rounded-full border-2 border-white shadow-lg
          transition-all duration-300 group-hover:scale-125
          ${isFull ? 'bg-stone-400' : 'bg-emerald-500'}
          ${isSelected ? 'scale-150 ring-4 ring-white/50' : ''}
        `}
      />
      
      {/* Availability badge */}
      {!isFull && venue.availableUnitsCount && (
        <div className="absolute -top-2 -right-2 bg-white text-emerald-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-emerald-200">
          {venue.availableUnitsCount}
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

  useEffect(() => {
    loadVenues();
    
    // Add Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Inter:wght@200;300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 Loading venues for map...');
      const data = await venueApi.getVenues();
      
      console.log('✅ Venues loaded:', data.length);
      setVenues(data);
      
    } catch (err) {
      console.error('❌ Failed to load venues:', err);
      setError('Failed to load venues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueClick = useCallback(async (venue) => {
    try {
      console.log('📍 Venue clicked:', venue.name);
      
      // Fly to venue with smooth animation (drone landing effect)
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [venue.longitude, venue.latitude],
          zoom: 15,
          duration: 1500, // 1.5 second smooth flight
          essential: true
        });
      }
      
      // Load availability data
      const availability = await venueApi.getVenueAvailability(venue.id);
      
      console.log('✅ Availability loaded:', availability);
      setSelectedVenue({ ...venue, availability });
      
    } catch (err) {
      console.error('❌ Failed to load availability:', err);
      // Still show venue details even if availability fails
      setSelectedVenue({ ...venue, availability: null });
    }
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedVenue(null);
    
    // Fly back to overview
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [RIVIERA_CENTER.longitude, RIVIERA_CENTER.latitude],
        zoom: RIVIERA_CENTER.zoom,
        duration: 1500,
        essential: true
      });
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
          <h2 
            className="text-4xl font-light text-stone-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Discovering the Riviera
          </h2>
          <p className="text-lg text-stone-600">
            Loading venues...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 
            className="text-4xl font-light text-stone-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Something went wrong
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            {error}
          </p>
          <button
            onClick={loadVenues}
            className="bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No venues state
  if (!loading && venues.length === 0) {
    return (
      <div className="h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 
            className="text-4xl font-light text-stone-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            No venues available
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            We couldn't find any venues at the moment. Please check back later.
          </p>
          <button
            onClick={loadVenues}
            className="bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative bg-stone-50">
      {/* Mapbox - The Radar */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11" // Dark monochrome style
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false} // Remove Mapbox logo per orders
          cooperativeGestures={selectedVenue !== null} // Prevent scroll hijacking when bottom sheet open
        >
          {/* Navigation controls (zoom buttons) */}
          <NavigationControl position="bottom-right" showCompass={false} />
          
          {/* Venue markers - only render if coordinates exist */}
          {venues.length > 0 && venues.map(venue => (
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

      {/* Header - floating above map with backdrop blur */}
      <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="bg-gradient-to-b from-black/60 via-black/30 to-transparent p-6 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h1 
              className="text-5xl font-light text-white mb-2 tracking-tight"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Discover
            </h1>
            <p className="text-sm text-stone-300 uppercase tracking-widest">
              Albanian Riviera
            </p>
          </div>
        </div>
      </header>

      {/* Venue Count Badge - floating */}
      <div className="absolute top-24 left-6 z-[1000] bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg pointer-events-none">
        <p className="text-sm text-stone-600">
          <span className="font-medium text-stone-900">{venues.filter(v => v.latitude && v.longitude).length}</span> venues
        </p>
      </div>

      {/* Bottom Sheet - slides up over map */}
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
          /* Mapbox container customization */
          .mapboxgl-map {
            font-family: 'Inter', sans-serif;
          }
          
          /* Hide Mapbox logo and attribution (as ordered) */
          .mapboxgl-ctrl-logo,
          .mapboxgl-ctrl-attrib {
            display: none !important;
          }
          
          /* Style navigation controls */
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
          
          /* Smooth marker animations */
          .mapboxgl-marker {
            transition: transform 0.3s ease-out;
          }
        `
      }} />
    </div>
  );
}
