import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_URL = 'http://localhost:5000/api';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DiscoveryPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await fetch(`${API_URL}/venue`);
      const data = await response.json();
      setVenues(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOccupancyPercentage = (venue) => {
    if (venue.totalBeds === 0) return 0;
    return Math.round((venue.occupiedBeds / venue.totalBeds) * 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage <= 40) return 'green';
    if (percentage <= 80) return 'yellow';
    return 'red';
  };

  const getStatusStyles = (percentage) => {
    const color = getStatusColor(percentage);
    
    if (color === 'green') {
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500'
      };
    }
    if (color === 'yellow') {
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-600',
        border: 'border-yellow-500/20',
        dot: 'bg-yellow-500'
      };
    }
    return {
      bg: 'bg-red-500/10',
      text: 'text-red-600',
      border: 'border-red-500/20',
      dot: 'bg-red-500'
    };
  };

  // Custom marker icons with pulsing Bronze effect
  const createCustomIcon = (percentage) => {
    const bronze = '#9f7928';

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="
            position: absolute;
            width: 28px;
            height: 28px;
            background: ${bronze};
            border-radius: 50%;
            opacity: 0.2;
            animation: pulse 2s infinite;
          "></div>
          <div style="
            position: absolute;
            width: 20px;
            height: 20px;
            top: 4px;
            left: 4px;
            background: ${bronze};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(159, 121, 40, 0.4);
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.4); opacity: 0; }
          }
        </style>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Header - The Compass */}
      <nav className="border-b border-zinc-300 bg-white/80 backdrop-blur-sm z-20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            {/* Logo */}
            <div>
              <h1 className="text-3xl font-display font-normal text-zinc-800 tracking-tight">Riviera</h1>
              <p className="text-[10px] font-geist-sans text-zinc-500 uppercase tracking-[0.2em] mt-0.5">Intelligence System</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-300 text-zinc-800 text-sm font-geist-sans placeholder:text-zinc-400 focus:border-[#9f7928] focus:outline-none focus:ring-2 focus:ring-[#9f7928]/20 transition-all rounded-lg"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Map Section - The Satellite View */}
        <div className="h-[50vh] relative border-b border-zinc-300 shadow-sm bg-zinc-900">
          <MapContainer
            center={[40.4637, 19.4914]}
            zoom={10}
            className="h-full w-full"
            zoomControl={true}
          >
            {/* Dark, minimalist map tiles for high contrast */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {filteredVenues.map((venue) => (
              <Marker
                key={venue.id}
                position={[venue.latitude, venue.longitude]}
                icon={createCustomIcon(getOccupancyPercentage(venue))}
              >
                <Popup className="dark-popup">
                  <div className="p-2 bg-zinc-900 border border-zinc-800">
                    <h3 className="font-display font-normal text-zinc-100 mb-1 text-base">{venue.name}</h3>
                    <p className="text-xs text-zinc-400 mb-2 font-geist-sans">{venue.location}</p>
                    <div className="text-sm font-geist-mono text-zinc-300 tabular-nums font-medium">
                      {venue.totalBeds - venue.occupiedBeds} / {venue.totalBeds} available
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Overlay - Live Data Counter */}
          <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm border border-zinc-300 px-5 py-3 rounded-lg shadow-sm">
            <div className="text-[10px] font-geist-sans text-zinc-500 uppercase tracking-[0.2em] mb-1">Live Data</div>
            <div className="text-xl font-geist-mono font-bold text-zinc-800 tabular-nums">
              {filteredVenues.length} {filteredVenues.length === 1 ? 'Location' : 'Locations'}
            </div>
          </div>
        </div>

        {/* Results List - The Logbook Entries */}
        <div className="flex-1 overflow-y-auto px-8 py-12 bg-[#FDFBF7]">
          <div className="max-w-[1400px] mx-auto">
            {/* Section Header */}
            <div className="mb-10">
              <h2 className="text-5xl font-display font-normal text-zinc-800 mb-3 tracking-tight leading-tight">
                Live Beach Availability
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-sm font-geist-sans text-zinc-500 uppercase tracking-widest">
                  Real-Time Occupancy Data
                </p>
                {loading && (
                  <>
                    <span className="text-zinc-400">•</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#9f7928] rounded-full animate-pulse"></div>
                      <span className="text-sm font-geist-sans text-zinc-400 uppercase tracking-widest">
                        Scanning coastline...
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-32">
                <div className="inline-block w-16 h-16 border-2 border-zinc-300 border-t-[#9f7928] rounded-full animate-spin mb-6"></div>
                <p className="text-sm text-zinc-500 font-geist-mono uppercase tracking-widest">Loading data...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredVenues.map((venue, index) => {
                  const occupancyPercentage = getOccupancyPercentage(venue);
                  const statusStyles = getStatusStyles(occupancyPercentage);
                  const availableBeds = venue.totalBeds - venue.occupiedBeds;
                  
                  return (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      {/* Logbook Entry Card */}
                      <div className="border border-zinc-300 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-zinc-400 transition-all duration-500 group">
                        <div className="flex flex-col md:flex-row">
                          {/* Image - The Emotional Hook */}
                          <div className="md:w-[45%] relative overflow-hidden bg-zinc-100">
                            <a href={`/menu?bedId=1`} className="block relative h-80 md:h-96">
                              <img
                                src={venue.imageUrl || '/hotel coral.jpg'}
                                alt={venue.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </a>
                          </div>

                          {/* Data Section - The Intelligence */}
                          <div className="md:w-[55%] p-8 md:p-10 flex flex-col justify-between bg-white">
                            {/* Top Section */}
                            <div>
                              {/* Beach Name - Playfair Display (Elegant) */}
                              <h3 className="text-4xl md:text-5xl font-display font-normal text-zinc-800 mb-3 tracking-tight leading-tight">
                                {venue.name}
                              </h3>
                              
                              {/* Location - Geist Sans (Clean) */}
                              <div className="flex items-center gap-2 mb-6">
                                <MapPin className="w-4 h-4 text-zinc-400" />
                                <p className="text-sm font-geist-sans text-zinc-500">
                                  {venue.location}
                                </p>
                              </div>

                              {/* Status Pill - Data Chip (Hardware Look) */}
                              <div className="mb-8">
                                <div className={`inline-flex items-center gap-3 px-4 py-2.5 border ${statusStyles.border} ${statusStyles.bg} rounded-sm`}>
                                  <div className={`w-2 h-2 ${statusStyles.dot} rounded-full animate-pulse shadow-sm`}></div>
                                  <span className={`font-geist-mono font-bold ${statusStyles.text} tabular-nums tracking-tight`}>
                                    <span className="text-lg">{occupancyPercentage}</span>
                                    <span className="text-xs ml-1">% OCCUPANCY</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Section - Data & Action */}
                            <div className="flex items-end justify-between">
                              {/* Sunbed Count - Monospace Numbers (Core Identity) */}
                              <div>
                                <p className="text-xs font-geist-sans text-zinc-500 font-medium tracking-widest uppercase mb-2">
                                  Available Sunbeds
                                </p>
                                <div className="font-geist-mono tabular-nums">
                                  <span className="text-5xl font-black text-zinc-800 tracking-tighter">
                                    {availableBeds}
                                  </span>
                                  <span className="text-2xl text-zinc-400 font-normal ml-2">
                                    of {venue.totalBeds}
                                  </span>
                                </div>
                              </div>

                              {/* View Details Link - Bronze Invitation */}
                              <a
                                href={`/menu?bedId=1`}
                                className="text-[#9f7928] font-geist-sans font-medium text-base underline decoration-2 underline-offset-4 hover:text-[#7d5f1f] transition-colors duration-300"
                              >
                                View Details
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* No Results State */}
            {!loading && filteredVenues.length === 0 && (
              <div className="text-center py-32 border border-zinc-300 rounded-lg bg-white">
                <div className="mb-6">
                  <Search className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                  <p className="text-xl font-geist-mono text-zinc-500 uppercase tracking-widest">No Results Found</p>
                </div>
                <p className="text-sm font-geist-sans text-zinc-400">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
