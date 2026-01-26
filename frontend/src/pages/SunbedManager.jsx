import { useState } from 'react';
import { Lock, User, Waves, Umbrella, AlertCircle, X } from 'lucide-react';

export default function SunbedManager() {
  const [selectedSunbed, setSelectedSunbed] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');

  // Generate sunbeds for each zone
  const zones = [
    {
      id: 'A',
      name: 'Zone A: VIP Cabanas',
      sunbeds: Array.from({ length: 20 }, (_, i) => ({
        id: `A${i + 1}`,
        number: i + 1,
        zone: 'A',
        status: i % 5 === 0 ? 'hotel' : i % 3 === 0 ? 'booked' : i % 7 === 0 ? 'maintenance' : 'available',
        price: 50,
        roomNumber: i % 5 === 0 ? `10${i + 1}` : null
      }))
    },
    {
      id: 'B',
      name: 'Zone B: Poolside',
      sunbeds: Array.from({ length: 60 }, (_, i) => ({
        id: `B${i + 1}`,
        number: i + 1,
        zone: 'B',
        status: i % 4 === 0 ? 'hotel' : i % 3 === 0 ? 'booked' : i % 9 === 0 ? 'maintenance' : 'available',
        price: 30,
        roomNumber: i % 4 === 0 ? `20${i + 1}` : null
      }))
    },
    {
      id: 'C',
      name: 'Zone C: Waterfront',
      sunbeds: Array.from({ length: 70 }, (_, i) => ({
        id: `C${i + 1}`,
        number: i + 1,
        zone: 'C',
        status: i % 6 === 0 ? 'hotel' : i % 4 === 0 ? 'booked' : i % 8 === 0 ? 'maintenance' : 'available',
        price: 40,
        roomNumber: i % 6 === 0 ? `30${i + 1}` : null
      }))
    }
  ];

  const allSunbeds = zones.flatMap(z => z.sunbeds);
  
  const stats = {
    total: allSunbeds.length,
    hotel: allSunbeds.filter(s => s.status === 'hotel').length,
    booked: allSunbeds.filter(s => s.status === 'booked').length,
    maintenance: allSunbeds.filter(s => s.status === 'maintenance').length,
    available: allSunbeds.filter(s => s.status === 'available').length
  };

  const getSunbedStyles = (sunbed) => {
    const isSelected = selectedSunbed?.id === sunbed.id;
    
    const baseStyles = 'relative w-full aspect-[2/3] rounded-md transition-all cursor-pointer flex flex-col items-center justify-center text-[10px] font-mono';
    
    if (isSelected) {
      return `${baseStyles} bg-white text-black border border-white`;
    }
    
    switch (sunbed.status) {
      case 'available':
        return `${baseStyles} border border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-500`;
      case 'booked':
        return `${baseStyles} bg-zinc-800 border border-zinc-700 text-zinc-400`;
      case 'hotel':
        return `${baseStyles} bg-zinc-800 border border-zinc-700 text-zinc-400`;
      case 'maintenance':
        return `${baseStyles} bg-zinc-900 border border-zinc-800 text-zinc-600`;
      default:
        return baseStyles;
    }
  };

  const handleBlockForHotel = () => {
    if (selectedSunbed && roomNumber) {
      alert(`Sunbed ${selectedSunbed.id} blocked for Room ${roomNumber}`);
      setRoomNumber('');
    }
  };

  const handleMarkMaintenance = () => {
    if (selectedSunbed) {
      alert(`Sunbed ${selectedSunbed.id} marked for maintenance`);
    }
  };

  const handleRelease = () => {
    if (selectedSunbed) {
      alert(`Sunbed ${selectedSunbed.id} released and now available`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Umbrella className="w-5 h-5 text-zinc-500" />
              <h1 className="text-sm font-bold tracking-tight uppercase">Sunbed Manager</h1>
              <span className="text-xs text-zinc-600 font-mono">Hotel Coral & Resort</span>
            </div>
            
            {/* Stats Bar - Inline */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Total</span>
                <span className="text-lg font-mono font-bold tabular-nums">{stats.total}</span>
              </div>
              <div className="w-px h-4 bg-zinc-800"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Hotel</span>
                <span className="text-lg font-mono font-bold tabular-nums text-indigo-400">{stats.hotel}</span>
              </div>
              <div className="w-px h-4 bg-zinc-800"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Booked</span>
                <span className="text-lg font-mono font-bold tabular-nums">{stats.booked}</span>
              </div>
              <div className="w-px h-4 bg-zinc-800"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Free</span>
                <span className="text-lg font-mono font-bold tabular-nums">{stats.available}</span>
              </div>
              <div className="w-px h-4 bg-zinc-800"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Maint</span>
                <span className="text-lg font-mono font-bold tabular-nums text-zinc-600">{stats.maintenance}</span>
              </div>
            </div>

            <button className="px-3 py-1.5 bg-transparent text-zinc-500 text-xs font-medium rounded-md hover:bg-zinc-900 transition-all border border-zinc-800">
              <a href="/">Exit</a>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Split Panel */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Panel - Beach Map (70%) */}
        <div className="w-[70%] border-r border-zinc-800 overflow-auto p-6 bg-zinc-950">
          <div className="space-y-6">
            {zones.map((zone) => (
              <div key={zone.id} className="border border-zinc-800 rounded-md p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <h2 className="text-xs font-mono font-bold tracking-tight uppercase text-zinc-400">{zone.name}</h2>
                  <span className="text-xs text-zinc-600 font-mono tabular-nums">{zone.sunbeds.length}</span>
                </div>
                
                <div className="grid grid-cols-10 gap-2">
                  {zone.sunbeds.map((sunbed) => (
                    <div
                      key={sunbed.id}
                      onClick={() => setSelectedSunbed(sunbed)}
                      className={getSunbedStyles(sunbed)}
                    >
                      {/* Headrest visual */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-current opacity-20 rounded-t-md"></div>
                      
                      <span className="tabular-nums font-bold">{sunbed.id}</span>
                      
                      {/* Status indicators */}
                      <div className="absolute bottom-1 flex items-center gap-0.5">
                        {sunbed.status === 'hotel' && (
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                        )}
                        {sunbed.status === 'booked' && (
                          <Lock className="w-2.5 h-2.5 opacity-50" />
                        )}
                        {sunbed.status === 'maintenance' && (
                          <AlertCircle className="w-2.5 h-2.5 opacity-50" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 border border-zinc-800 rounded-md p-4">
            <div className="text-xs font-mono text-zinc-600 mb-3 uppercase tracking-widest">Legend</div>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-9 border border-zinc-700 rounded-md relative">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-700 opacity-20 rounded-t-md"></div>
                </div>
                <span className="text-xs text-zinc-500 font-mono">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-9 bg-zinc-800 border border-zinc-700 rounded-md relative flex items-center justify-center">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-700 opacity-20 rounded-t-md"></div>
                  <Lock className="w-2.5 h-2.5 text-zinc-500" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-9 bg-zinc-800 border border-zinc-700 rounded-md relative flex items-center justify-center">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-700 opacity-20 rounded-t-md"></div>
                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                </div>
                <span className="text-xs text-zinc-500 font-mono">Hotel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-9 bg-zinc-900 border border-zinc-800 rounded-md relative flex items-center justify-center">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800 opacity-20 rounded-t-md"></div>
                  <AlertCircle className="w-2.5 h-2.5 text-zinc-600" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">Maint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Control Panel (30%) */}
        <div className="w-[30%] bg-zinc-900/30 p-6">
          {selectedSunbed ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1">
                    Bed #{selectedSunbed.id}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Zone {selectedSunbed.zone} • Position {selectedSunbed.number}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSunbed(null)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              {/* Status Badge */}
              <div>
                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Status</div>
                <div className="flex items-center gap-2">
                  {selectedSunbed.status === 'available' && (
                    <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-sm font-medium rounded-lg border border-green-500/20">
                      Available
                    </span>
                  )}
                  {selectedSunbed.status === 'booked' && (
                    <span className="px-3 py-1.5 bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg border border-zinc-600">
                      Booked (Public)
                    </span>
                  )}
                  {selectedSunbed.status === 'hotel' && (
                    <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-500 flex items-center gap-1.5">
                      <Hotel className="w-4 h-4" />
                      Hotel Guest
                    </span>
                  )}
                  {selectedSunbed.status === 'maintenance' && (
                    <span className="px-3 py-1.5 bg-amber-900/30 text-amber-400 text-sm font-medium rounded-lg border border-amber-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Maintenance
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="text-xs text-zinc-500 mb-1">Daily Rate</div>
                <div className="text-3xl font-bold tabular-nums">€{selectedSunbed.price}</div>
              </div>

              {/* Room Assignment (if hotel guest) */}
              {selectedSunbed.status === 'hotel' && selectedSunbed.roomNumber && (
                <div className="bg-blue-950/30 border border-blue-800 rounded-lg p-4">
                  <div className="text-xs text-blue-400 mb-1">Assigned to</div>
                  <div className="text-xl font-bold text-blue-300">Room {selectedSunbed.roomNumber}</div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                {selectedSunbed.status === 'available' && (
                  <>
                    <div>
                      <label className="text-xs text-zinc-400 mb-2 block uppercase tracking-wide">
                        Assign to Hotel Room
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g., Room 104"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>

                    <button
                      onClick={handleBlockForHotel}
                      disabled={!roomNumber}
                      className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Hotel className="w-4 h-4" />
                      Block for Hotel Guest
                    </button>

                    <button
                      onClick={handleMarkMaintenance}
                      className="w-full px-4 py-3 bg-zinc-800 text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-700 transition-all border border-zinc-700 flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Mark as Maintenance
                    </button>
                  </>
                )}

                {(selectedSunbed.status === 'hotel' || selectedSunbed.status === 'maintenance') && (
                  <button
                    onClick={handleRelease}
                    className="w-full px-4 py-3 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Release Sunbed
                  </button>
                )}

                {selectedSunbed.status === 'booked' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      This sunbed is booked by a public customer. Contact reception to modify.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Waves className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">Select a sunbed to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Inspector (30%) */}
        <div className="w-[30%] border-l border-zinc-800 bg-black">
          {selectedSunbed ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="border-b border-zinc-800 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-mono font-bold tracking-tight mb-1">
                      #{selectedSunbed.id}
                    </h3>
                    <p className="text-xs text-zinc-600 font-mono">
                      ZONE {selectedSunbed.zone} · POS {selectedSunbed.number}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSunbed(null)}
                    className="p-1 hover:bg-zinc-900 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                  {selectedSunbed.status === 'available' && (
                    <span className="text-zinc-500">Available</span>
                  )}
                  {selectedSunbed.status === 'booked' && (
                    <>
                      <Lock className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-400">Booked</span>
                    </>
                  )}
                  {selectedSunbed.status === 'hotel' && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      <span className="text-indigo-400">Hotel Guest</span>
                    </>
                  )}
                  {selectedSunbed.status === 'maintenance' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-zinc-600" />
                      <span className="text-zinc-600">Maintenance</span>
                    </>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Price */}
                <div className="border border-zinc-800 rounded-md p-3">
                  <div className="text-xs text-zinc-600 mb-1 font-mono uppercase tracking-widest">Daily Rate</div>
                  <div className="text-3xl font-mono font-bold tabular-nums">€{selectedSunbed.price}</div>
                </div>

                {/* Room Assignment (if hotel guest) */}
                {selectedSunbed.status === 'hotel' && selectedSunbed.roomNumber && (
                  <div className="border border-zinc-800 rounded-md p-3">
                    <div className="text-xs text-zinc-600 mb-1 font-mono uppercase tracking-widest">Assigned Room</div>
                    <div className="text-2xl font-mono font-bold text-indigo-400 tabular-nums">{selectedSunbed.roomNumber}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {selectedSunbed.status === 'available' && (
                    <>
                      <div>
                        <label className="text-xs text-zinc-600 mb-2 block font-mono uppercase tracking-widest">
                          Room Number
                        </label>
                        <input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="104"
                          className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-md text-white font-mono placeholder:text-zinc-700 focus:border-white focus:outline-none transition-all"
                        />
                      </div>

                      <button
                        onClick={handleBlockForHotel}
                        disabled={!roomNumber}
                        className="w-full px-3 py-2.5 bg-white text-black text-xs font-mono font-bold rounded-md hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        <User className="w-3.5 h-3.5" />
                        Assign to Hotel
                      </button>

                      <button
                        onClick={handleMarkMaintenance}
                        className="w-full px-3 py-2.5 bg-transparent text-zinc-500 text-xs font-mono font-bold rounded-md hover:bg-zinc-900 transition-all border border-zinc-800 flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Mark Maintenance
                      </button>
                    </>
                  )}

                  {(selectedSunbed.status === 'hotel' || selectedSunbed.status === 'maintenance') && (
                    <button
                      onClick={handleRelease}
                      className="w-full px-3 py-2.5 bg-white text-black text-xs font-mono font-bold rounded-md hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      Release
                    </button>
                  )}

                  {selectedSunbed.status === 'booked' && (
                    <div className="border border-zinc-800 rounded-md p-3">
                      <p className="text-xs text-zinc-600 font-mono leading-relaxed">
                        Public booking. Contact reception to modify.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Info */}
              <div className="border-t border-zinc-800 p-4">
                <div className="text-xs text-zinc-700 font-mono">
                  Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Waves className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                <p className="text-zinc-700 text-xs font-mono uppercase tracking-widest">No Selection</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
