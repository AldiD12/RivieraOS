import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import collectorApi from '../services/collectorApi';
import { createConnection, startConnection } from '../services/signalr';

export default function CollectorDashboard() {
  const [venueData, setVenueData] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // Load venue data on mount
  useEffect(() => {
    fetchVenueData();
  }, []);

  // Setup SignalR connection
  useEffect(() => {
    const newConnection = createConnection();
    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  // Start SignalR and listen for real-time updates
  useEffect(() => {
    if (connection) {
      startConnection(connection)
        .then((success) => {
          if (success) {
            setIsConnected(true);
            console.log('🔴 Collector Dashboard - SignalR Connected');

            // Listen for booking events
            connection.on('BookingCreated', (booking) => {
              console.log('🆕 New booking received:', booking);
              if (booking.unitCode) {
                console.log(`📍 Unit ${booking.unitCode} - New booking for ${booking.guestName}`);
              }
              fetchVenueData();
            });

            connection.on('BookingStatusChanged', (data) => {
              console.log('📝 Booking status changed:', data);
              if (data.unitCode && data.unitStatus) {
                console.log(`📍 Unit ${data.unitCode} - Status: ${data.unitStatus} (${data.newStatus})`);
              }
              fetchVenueData();
            });
          }
        })
        .catch((err) => {
          console.error('SignalR connection failed:', err);
          setIsConnected(false);
        });

      // Handle reconnection
      connection.onreconnecting(() => {
        console.log('🔄 SignalR reconnecting...');
        setIsConnected(false);
      });

      connection.onreconnected(() => {
        console.log('✅ SignalR reconnected');
        setIsConnected(true);
        fetchVenueData();
      });

      connection.onclose(() => {
        console.log('❌ SignalR disconnected');
        setIsConnected(false);
      });
    }

    return () => {
      if (connection) {
        connection.off('BookingCreated');
        connection.off('BookingStatusChanged');
      }
    };
  }, [connection]);

  const fetchVenueData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await collectorApi.getVenueUnits();
      console.log('📦 Venue data received:', data);
      setVenueData(data);
      
      // Auto-select first zone if available
      if (data.zones && data.zones.length > 0 && !selectedZoneId) {
        setSelectedZoneId(data.zones[0].id);
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching venue data:', err);
      setError(err.data?.message || 'Failed to load venue data. Please check if you are assigned to a venue.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitAction = async (unitId, newStatus) => {
    try {
      console.log(`🔄 Updating unit ${unitId} to status: ${newStatus}`);
      await collectorApi.updateUnitStatus(unitId, { newStatus });
      await fetchVenueData(); // Refresh data
      setShowUnitModal(false);
    } catch (err) {
      console.error('Error updating unit status:', err);
      alert(err.data?.message || 'Failed to update unit status');
    }
  };

  const getFilteredUnits = () => {
    if (!venueData || !venueData.zones) return [];
    
    const selectedZone = venueData.zones.find(z => z.id === selectedZoneId);
    if (!selectedZone) return [];
    
    let units = selectedZone.units || [];
    
    // Apply status filter
    if (selectedStatusFilter !== 'all') {
      units = units.filter(u => u.status.toLowerCase() === selectedStatusFilter.toLowerCase());
    }
    
    return units;
  };

  const getStats = () => {
    if (!venueData || !venueData.zones) return { total: 0, available: 0, reserved: 0, occupied: 0 };
    
    const allUnits = venueData.zones.flatMap(z => z.units || []);
    
    return {
      total: allUnits.length,
      available: allUnits.filter(u => u.status === 'Available').length,
      reserved: allUnits.filter(u => u.status === 'Reserved').length,
      occupied: allUnits.filter(u => u.status === 'Occupied').length
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-900 border-green-600';
      case 'Reserved':
        return 'bg-yellow-900 border-yellow-600';
      case 'Occupied':
        return 'bg-red-900 border-red-600';
      default:
        return 'bg-zinc-900 border-zinc-700';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500 text-white';
      case 'Reserved':
        return 'bg-yellow-500 text-black';
      case 'Occupied':
        return 'bg-red-500 text-white';
      default:
        return 'bg-zinc-500 text-white';
    }
  };

  if (loading && !venueData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-black text-red-500 mb-4">Error</h2>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={fetchVenueData}
            className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!venueData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 text-xl">No venue data available</div>
      </div>
    );
  }

  const stats = getStats();
  const filteredUnits = getFilteredUnits();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Sticky */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-4xl font-black">🏖️ {venueData.venueName}</h1>
              <p className="text-sm text-zinc-400">Collector Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-green-500 text-sm font-medium hidden md:inline">LIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <WifiOff className="w-5 h-5 text-red-500" />
                  <span className="text-red-500 text-sm font-medium hidden md:inline">OFFLINE</span>
                </div>
              )}
              <button
                onClick={fetchVenueData}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Stats Cards - Horizontal Scroll on Mobile */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 md:grid md:grid-cols-4 md:overflow-visible">
          <StatCard label="Total Units" value={stats.total} color="zinc" />
          <StatCard label="Available" value={stats.available} color="green" />
          <StatCard label="Reserved" value={stats.reserved} color="yellow" />
          <StatCard label="Occupied" value={stats.occupied} color="red" />
        </div>

        {/* Filters - Sticky Below Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 sticky top-[120px] md:top-[100px] z-40">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Zone</label>
              <select
                value={selectedZoneId || ''}
                onChange={(e) => setSelectedZoneId(parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
              >
                {venueData.zones?.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
          </div>
        </div>

        {/* Units Grid */}
        {filteredUnits.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl">No units found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredUnits.map((unit) => (
              <button
                key={unit.id}
                onClick={() => {
                  setSelectedUnit(unit);
                  setShowUnitModal(true);
                }}
                className={`border-2 rounded-lg p-4 transition-all aspect-square flex flex-col items-center justify-center hover:scale-105 ${getStatusColor(unit.status)}`}
              >
                <p className="text-2xl md:text-3xl font-black mb-2">{unit.unitCode}</p>
                <span className={`text-xs px-2 py-1 rounded font-bold ${getStatusBadgeColor(unit.status)}`}>
                  {unit.status}
                </span>
                {unit.currentBooking && (
                  <p className="text-xs text-zinc-400 mt-2 truncate w-full text-center">
                    {unit.currentBooking.guestName}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Unit Details Modal */}
      {showUnitModal && selectedUnit && (
        <UnitModal
          unit={selectedUnit}
          onClose={() => setShowUnitModal(false)}
          onAction={handleUnitAction}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, color }) {
  const colorClasses = {
    zinc: 'border-zinc-700',
    green: 'border-green-600',
    yellow: 'border-yellow-600',
    red: 'border-red-600'
  };

  const textColorClasses = {
    zinc: 'text-white',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400'
  };

  return (
    <div className={`bg-zinc-900 border-2 ${colorClasses[color]} rounded-lg p-4 min-w-[120px]`}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-4xl font-black ${textColorClasses[color]}`}>{value}</p>
    </div>
  );
}

// Unit Modal Component
function UnitModal({ unit, onClose, onAction }) {
  const getAvailableActions = () => {
    if (!unit.availableTransitions || unit.availableTransitions.length === 0) {
      return [];
    }
    return unit.availableTransitions;
  };

  const getActionButton = (action) => {
    const buttonConfig = {
      'Reserved': { label: 'Mark as Reserved', color: 'bg-yellow-600 hover:bg-yellow-700', icon: CheckCircle },
      'Occupied': { label: 'Check In (Occupied)', color: 'bg-red-600 hover:bg-red-700', icon: CheckCircle },
      'Available': { label: 'Mark as Available', color: 'bg-green-600 hover:bg-green-700', icon: CheckCircle },
      'Maintenance': { label: 'Set to Maintenance', color: 'bg-zinc-600 hover:bg-zinc-700', icon: XCircle }
    };

    const config = buttonConfig[action] || { label: action, color: 'bg-blue-600 hover:bg-blue-700', icon: CheckCircle };
    const Icon = config.icon;

    return (
      <button
        key={action}
        onClick={() => onAction(unit.id, action)}
        className={`flex-1 ${config.color} text-white px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </button>
    );
  };

  const availableActions = getAvailableActions();

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg max-w-md w-full border-2 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black">{unit.unitCode}</h2>
              <p className="text-sm text-zinc-400">{unit.unitType}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded font-bold ${
                unit.status === 'Available' ? 'bg-green-500 text-white' :
                unit.status === 'Reserved' ? 'bg-yellow-500 text-black' :
                unit.status === 'Occupied' ? 'bg-red-500 text-white' :
                'bg-zinc-600 text-white'
              }`}>
                {unit.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Booking Details */}
          {unit.currentBooking && (
            <div className="space-y-3 mb-6">
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Guest</p>
                <p className="text-xl font-bold">{unit.currentBooking.guestName}</p>
              </div>

              {unit.currentBooking.guestPhone && (
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Phone</p>
                  <p className="text-lg font-mono">{unit.currentBooking.guestPhone}</p>
                </div>
              )}

              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Check-in Time</p>
                <p className="text-lg">
                  {unit.currentBooking.checkInTime 
                    ? new Date(unit.currentBooking.checkInTime).toLocaleString()
                    : 'Not checked in yet'}
                </p>
              </div>

              {unit.currentBooking.endTime && (
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Expected End</p>
                  <p className="text-lg">
                    {new Date(unit.currentBooking.endTime).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Booking */}
          {!unit.currentBooking && unit.status !== 'Available' && (
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
              <p className="text-zinc-400 text-center">No active booking</p>
            </div>
          )}

          {/* Available Actions */}
          {availableActions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {availableActions.map(action => getActionButton(action))}
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-4">
              No actions available for this unit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
