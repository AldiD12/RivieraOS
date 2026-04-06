import { useState, useEffect } from 'react';
import { geographicZonesApi } from '../services/geographicZonesApi';

export default function LocationBottomSheet({ 
  isOpen, 
  onClose, 
  onZoneSelect, 
  onGPSLocationSelect, // New prop for GPS selection
  selectedZone = 'EVERYWHERE',
  isDayMode = false 
}) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadZones();
    }
  }, [isOpen]);

  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const zonesData = await geographicZonesApi.getGeographicZones();
      setZones(zonesData);
    } catch (err) {
      console.error('Failed to load zones:', err);
      setError('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = () => {
    onZoneSelect('EVERYWHERE');
    onClose();
  };

  const handleZoneClick = (zone) => {
    onZoneSelect(zone);
    onClose();
  };

  const handleGPSClick = async () => {
    try {
      if (onGPSLocationSelect) {
        await onGPSLocationSelect();
      }
      onClose();
    } catch (error) {
      console.error('GPS location failed:', error);
      // Show error message to user
      setError('Location access denied or unavailable');
      // Don't close the sheet so user can see the error and try again
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Industrial Style */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Bottom Sheet - Industrial Luxury Design */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        ${isDayMode ? 'bg-white' : 'bg-zinc-950'}
        border-t shadow-2xl rounded-t-3xl
        ${isDayMode ? 'border-stone-200' : 'border-zinc-800'}
        max-h-[85vh] overflow-hidden flex flex-col
      `}>
        {/* Handle Bar */}
        <div className="flex justify-center py-3">
          <div className={`h-1 w-12 rounded-full ${isDayMode ? 'bg-stone-300' : 'bg-zinc-800'}`} />
        </div>

        {/* Sheet Title - Industrial Style */}
        <div className="px-6 pb-6">
          <h2 className={`font-mono text-xs tracking-[0.2em] uppercase ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
            [ SELECT ZONE ]
          </h2>
        </div>

        {/* Zone List - Industrial Design */}
        <div className="flex flex-col px-6 gap-3 pb-8 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDayMode ? 'border-stone-200 border-t-stone-900' : 'border-zinc-800 border-t-[#10FF88]'}`} />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className={`text-sm font-mono ${isDayMode ? 'text-red-600' : 'text-red-400'}`}>{error}</p>
              <button
                onClick={loadZones}
                className={`mt-4 px-4 py-2 text-sm font-mono border rounded-full transition-colors ${isDayMode ? 'border-stone-300 text-stone-700 hover:bg-stone-50' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
              >
                [ RETRY ]
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Active Zone - EVERYWHERE */}
              <button
                onClick={handleShowAll}
                className={`
                  w-full text-left py-4 px-5 border rounded-2xl transition-all duration-300 flex justify-between items-center group
                  ${selectedZone === 'EVERYWHERE'
                    ? isDayMode
                      ? 'border-stone-900 bg-stone-50 shadow-sm'
                      : 'border-[#10FF88] bg-[#10FF88]/5 shadow-[0_0_15px_rgba(16,255,136,0.15)]'
                    : isDayMode
                    ? 'border-stone-300 bg-transparent hover:border-stone-400'
                    : 'border-zinc-800 bg-transparent hover:border-zinc-700'
                  }
                `}
              >
                <span className={`
                  font-mono text-sm uppercase tracking-wide
                  ${selectedZone === 'EVERYWHERE'
                    ? isDayMode
                      ? 'text-stone-900'
                      : 'text-[#10FF88] drop-shadow-[0_0_10px_rgba(16,255,136,0.4)]'
                    : isDayMode
                    ? 'text-stone-600'
                    : 'text-zinc-400'
                  }
                `}>
                  EVERYWHERE ({zones.reduce((total, zone) => total + zone.eventCount, 0) || 15})
                </span>
                {selectedZone === 'EVERYWHERE' && (
                  <svg className={`w-5 h-5 ${isDayMode ? 'text-stone-900' : 'text-[#10FF88]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </button>

              {/* Zone Options - Industrial Style */}
              {zones.map((zoneData) => (
                <button
                  key={zoneData.zone}
                  onClick={() => handleZoneClick(zoneData.zone)}
                  className={`
                    w-full text-left py-4 px-5 border rounded-2xl transition-all duration-300 flex justify-between items-center group
                    ${selectedZone === zoneData.zone
                      ? isDayMode
                        ? 'border-stone-900 bg-stone-50 shadow-sm'
                        : 'border-[#10FF88] bg-[#10FF88]/5 shadow-[0_0_15px_rgba(16,255,136,0.15)]'
                      : isDayMode
                      ? 'border-stone-300 bg-transparent hover:border-stone-400'
                      : 'border-zinc-800 bg-transparent hover:border-zinc-700'
                    }
                  `}
                >
                  <span className={`
                    font-mono text-sm uppercase tracking-wide
                    ${selectedZone === zoneData.zone
                      ? isDayMode
                        ? 'text-stone-900'
                        : 'text-[#10FF88] drop-shadow-[0_0_10px_rgba(16,255,136,0.4)]'
                      : isDayMode
                      ? 'text-stone-600'
                      : 'text-zinc-400'
                    }
                  `}>
                    {zoneData.zone.toUpperCase()} ({zoneData.eventCount})
                  </span>
                  {selectedZone === zoneData.zone && (
                    <svg className={`w-5 h-5 ${isDayMode ? 'text-stone-900' : 'text-[#10FF88]'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </button>
              ))}

              {/* GPS Action - Industrial Style */}
              <div className="mt-4 pt-6 border-t border-zinc-800">
                <button 
                  onClick={handleGPSClick}
                  className={`
                    w-full py-4 px-5 border rounded-2xl flex items-center justify-center gap-3 transition-all
                    ${isDayMode
                      ? 'border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-900'
                      : 'border-white bg-white/5 hover:bg-white/10 text-white'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-mono text-sm uppercase tracking-widest">
                    [ USE CURRENT LOCATION ]
                  </span>
                </button>
              </div>

              {zones.length === 0 && (
                <div className="text-center py-12">
                  <div className={`text-6xl mb-4 opacity-50`}>📍</div>
                  <h3 className={`text-lg font-mono mb-2 ${isDayMode ? 'text-stone-900' : 'text-white'}`}>
                    [ NO ACTIVE ZONES ]
                  </h3>
                  <p className={`text-sm font-mono ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
                    No zones have active events right now
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Safe Area Spacer */}
        <div className="h-8"></div>
      </div>
    </>
  );
}