import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { venueApi } from '../services/venueApi';
import VenueBottomSheet from '../components/VenueBottomSheet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Albanian Riviera coordinates
const RIVIERA_CENTER = [40.1, 19.6];
const DEFAULT_ZOOM = 10;

// Custom marker icon
const createCustomIcon = (availableCount, isSelected) => {
  const color = isSelected ? '#d97706' : '#1c1917';
  const badge = availableCount > 0 ? `<div style="position:absolute;top:-8px;right:-8px;background:#10b981;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${availableCount}</div>` : '';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;cursor:pointer;transition:transform 0.3s;">
        <div style="width:48px;height:48px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);${isSelected ? 'transform:scale(1.2);' : ''}">
          <span style="font-size:24px;">🏖️</span>
        </div>
        ${badge}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

// Component to handle map animations
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, {
        duration: 1
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function DiscoveryPage() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(RIVIERA_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

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
      
      // Load availability data
      const availability = await venueApi.getVenueAvailability(venue.id);
      
      console.log('✅ Availability loaded:', availability);
      setSelectedVenue({ ...venue, availability });
      
      // Animate map to venue
      setMapCenter([venue.latitude, venue.longitude]);
      setMapZoom(14);
      
    } catch (err) {
      console.error('❌ Failed to load availability:', err);
      // Still show venue details even if availability fails
      setSelectedVenue({ ...venue, availability: null });
    }
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedVenue(null);
    
    // Zoom back out to show all venues
    setMapCenter(RIVIERA_CENTER);
    setMapZoom(DEFAULT_ZOOM);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin"></div>
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

  return (
    <div className="h-screen relative bg-stone-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-stone-900/80 to-transparent p-6 pointer-events-none">
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
      </header>

      {/* Map */}
      <MapContainer
        center={RIVIERA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />
        
        {venues.map(venue => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={createCustomIcon(venue.availableUnitsCount || 0, selectedVenue?.id === venue.id)}
            eventHandlers={{
              click: () => handleVenueClick(venue)
            }}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-medium text-stone-900 mb-1">{venue.name}</p>
                <p className="text-sm text-stone-600">
                  {venue.availableUnitsCount > 0 
                    ? `${venue.availableUnitsCount} available` 
                    : 'Fully booked'
                  }
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Venue Count Badge */}
      <div className="absolute top-24 left-6 z-[1000] bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg pointer-events-none">
        <p className="text-sm text-stone-600">
          <span className="font-medium text-stone-900">{venues.length}</span> venues
        </p>
      </div>

      {/* Bottom Sheet */}
      {selectedVenue && (
        <VenueBottomSheet
          venue={selectedVenue}
          onClose={handleCloseBottomSheet}
        />
      )}

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .leaflet-container {
            font-family: 'Inter', sans-serif;
          }
          
          .leaflet-popup-content-wrapper {
            border-radius: 1rem;
            box-shadow: 0 20px 60px -15px rgba(0,0,0,0.15);
          }
          
          .leaflet-popup-tip {
            display: none;
          }
          
          .custom-marker:hover {
            transform: scale(1.1);
          }
        `
      }} />
    </div>
  );
}
