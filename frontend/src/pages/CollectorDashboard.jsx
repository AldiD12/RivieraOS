import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Plus, X, User, Phone, Users, Clock } from 'lucide-react';
import businessApi from '../services/businessApi';
import { createConnection, startConnection } from '../services/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export default function CollectorDashboard() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [units, setUnits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQuickBookModal, setShowQuickBookModal] = useState(false);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Quick booking form state
  const [quickBookForm, setQuickBookForm] = useState({
    customerName: '',
    customerPhone: '',
    guestCount: 1
  });

  // Load assigned venue on mount
  useEffect(() => {
    loadAssignedVenue();
  }, []);

  // Fetch zones when venue selected
  useEffect(() => {
    if (selectedVenue) {
      fetchZones();
    }
  }, [selectedVenue]);

  // Fetch units and bookings when zone selected
  useEffect(() => {
    if (selectedZone) {
      fetchUnits();
      fetchBookings();
    }
  }, [selectedZone]);

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
    if (connection && selectedVenue) {
      startConnection(connection)
        .then((success) => {
          if (success) {
            setIsConnected(true);
            console.log('🔴 Collector Dashboard - SignalR Connected');

            // Listen for booking events (when backend adds them)
            connection.on('BookingCreated', (booking) => {
              console.log('🆕 New booking received:', booking);
              if (booking.venueId === selectedVenue.id) {
                fetchUnits();
                fetchBookings();
              }
            });

            connection.on('BookingStatusChanged', (data) => {
              console.log('📝 Booking status changed:', data);
              fetchUnits();
              fetchBookings();
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
        fetchUnits();
        fetchBookings();
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
  }, [connection, selectedVenue]);

  const loadAssignedVenue = async () => {
      try {
        setLoading(true);

        // Get assigned venue from localStorage
        const venueId = localStorage.getItem('venueId');
        const venueName = localStorage.getItem('venueName');

        if (!venueId) {
          console.error('❌ No venue assigned to this collector');
          alert('No venue assigned. Please contact your manager.');
          return;
        }

        console.log('🏖️ Collector assigned to venue:', venueId, venueName);

        // Set the assigned venue
        setSelectedVenue({
          id: parseInt(venueId),
          name: venueName || 'Assigned Venue'
        });

      } catch (error) {
        console.error('Error loading assigned venue:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchVenues = async () => {
      // No longer needed - collectors use assigned venue only
      // Keeping function for backward compatibility
    };

  const fetchZones = async () => {
    if (!selectedVenue) return;
    try {
      setLoading(true);
      const data = await businessApi.zones.list(selectedVenue.id);
      setZones(data);
      if (data.length > 0) {
        setSelectedZone(data[0]);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    if (!selectedVenue || !selectedZone) return;
    try {
      setLoading(true);
      const data = await businessApi.units.list(selectedVenue.id, { zoneId: selectedZone.id });
      setUnits(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!selectedVenue) return;
    try {
      const response = await fetch(
        `${API_URL}/business/venues/${selectedVenue.id}/bookings/active`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      const response = await fetch(
        `${API_URL}/business/venues/${selectedVenue.id}/bookings/${bookingId}/check-in`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        await fetchUnits();
        await fetchBookings();
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      const response = await fetch(
        `${API_URL}/business/venues/${selectedVenue.id}/bookings/${bookingId}/check-out`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        await fetchUnits();
        await fetchBookings();
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const response = await fetch(
        `${API_URL}/business/venues/${selectedVenue.id}/bookings/${bookingId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        await fetchUnits();
        await fetchBookings();
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  const handleQuickBook = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `${API_URL}/business/venues/${selectedVenue.id}/bookings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            zoneUnitId: selectedUnit.id,
            guestName: quickBookForm.customerName,
            guestPhone: quickBookForm.customerPhone,
            guestCount: quickBookForm.guestCount,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
          })
        }
      );

      if (response.ok) {
        const booking = await response.json();
        // Auto check-in for walk-ins
        await handleCheckIn(booking.id);
        
        // Reset form
        setQuickBookForm({
          customerName: '',
          customerPhone: '',
          guestCount: 1
        });
        setShowQuickBookModal(false);
        await fetchUnits();
        await fetchBookings();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    
    if (unit.status === 'Available') {
      // Show quick booking modal for available units
      setShowQuickBookModal(true);
    } else {
      // Show booking details for occupied/reserved units
      setShowBookingModal(true);
    }
  };

  const getUnitBooking = (unitId) => {
    return bookings.find(b => b.zoneUnitId === unitId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-900 border-green-600 hover:border-green-500';
      case 'Reserved':
        return 'bg-blue-900 border-blue-600 hover:border-blue-500';
      case 'Occupied':
        return 'bg-red-900 border-red-600 hover:border-red-500';
      case 'Maintenance':
        return 'bg-zinc-800 border-zinc-700 hover:border-zinc-600';
      default:
        return 'bg-zinc-900 border-zinc-700 hover:border-zinc-600';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500 text-white';
      case 'Reserved':
        return 'bg-blue-500 text-white';
      case 'Occupied':
        return 'bg-red-500 text-white';
      case 'Maintenance':
        return 'bg-zinc-600 text-white';
      default:
        return 'bg-zinc-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-1">COLLECTOR DASHBOARD</h1>
            <p className="text-sm text-zinc-400">Manage sunbed bookings and check-ins</p>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-green-500 text-sm font-medium">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-red-500 text-sm font-medium">OFFLINE</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-zinc-500">Last Updated</div>
              <div className="text-sm font-mono text-white">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Venue & Zone Selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Venue</label>
            <select
              value={selectedVenue?.id || ''}
              onChange={(e) => {
                const venue = venues.find(v => v.id === parseInt(e.target.value));
                setSelectedVenue(venue);
                setSelectedZone(null);
                setUnits([]);
              }}
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-lg px-4 py-3 text-white text-lg font-medium focus:border-zinc-600 focus:outline-none"
            >
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Zone</label>
            <select
              value={selectedZone?.id || ''}
              onChange={(e) => {
                const zone = zones.find(z => z.id === parseInt(e.target.value));
                setSelectedZone(zone);
              }}
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-lg px-4 py-3 text-white text-lg font-medium focus:border-zinc-600 focus:outline-none disabled:opacity-50"
              disabled={!selectedVenue}
            >
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        {selectedZone && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-900 rounded-lg p-6 border-2 border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Units</p>
              <p className="text-5xl font-black">{units.length}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 border-2 border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Available</p>
              <p className="text-5xl font-black text-green-400">
                {units.filter(u => u.status === 'Available').length}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 border-2 border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Reserved</p>
              <p className="text-5xl font-black text-blue-400">
                {units.filter(u => u.status === 'Reserved').length}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 border-2 border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Occupied</p>
              <p className="text-5xl font-black text-red-400">
                {units.filter(u => u.status === 'Occupied').length}
              </p>
            </div>
          </div>
        )}

        {/* Units Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : !selectedZone ? (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-6xl mb-4">🏖️</div>
            <p className="text-xl">Select a venue and zone to view units</p>
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl">No units found in this zone</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {units.map((unit) => {
              const booking = getUnitBooking(unit.id);
              return (
                <button
                  key={unit.id}
                  onClick={() => handleUnitClick(unit)}
                  className={`border-2 rounded-lg p-4 transition-all aspect-square flex flex-col items-center justify-center ${getStatusColor(unit.status)}`}
                >
                  <p className="text-3xl font-black mb-2">{unit.unitCode}</p>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${getStatusBadgeColor(unit.status)}`}>
                    {unit.status}
                  </span>
                  {booking && (
                    <p className="text-xs text-zinc-400 mt-2 truncate w-full text-center font-medium">
                      {booking.guestName}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Quick Booking Modal (for available units) */}
      {showQuickBookModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full border-2 border-zinc-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black">{selectedUnit.unitCode}</h2>
                  <p className="text-sm text-zinc-400">{selectedUnit.unitType}</p>
                  <span className="inline-block mt-2 text-xs px-3 py-1 rounded font-bold bg-green-500 text-white">
                    Available
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowQuickBookModal(false);
                    setQuickBookForm({ customerName: '', customerPhone: '', guestCount: 1 });
                  }}
                  className="text-zinc-400 hover:text-white text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleQuickBook} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={quickBookForm.customerName}
                    onChange={(e) => setQuickBookForm({ ...quickBookForm, customerName: e.target.value })}
                    className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={quickBookForm.customerPhone}
                    onChange={(e) => setQuickBookForm({ ...quickBookForm, customerPhone: e.target.value })}
                    className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="+39 123 456 7890"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Guest Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quickBookForm.guestCount}
                    onChange={(e) => setQuickBookForm({ ...quickBookForm, guestCount: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-zinc-600 focus:outline-none"
                  />
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Duration: 4 hours (auto check-in)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black py-4 rounded-lg font-black text-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Book & Check In
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal (for occupied/reserved units) */}
      {showBookingModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full border-2 border-zinc-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black">{selectedUnit.unitCode}</h2>
                  <p className="text-sm text-zinc-400">{selectedUnit.unitType}</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-zinc-400 hover:text-white text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Status</p>
                  <span className={`text-sm px-3 py-1 rounded font-bold ${getStatusBadgeColor(selectedUnit.status)}`}>
                    {selectedUnit.status}
                  </span>
                </div>

                {(() => {
                  const booking = getUnitBooking(selectedUnit.id);
                  if (!booking) {
                    return (
                      <div className="text-center py-8 text-zinc-500">
                        No active booking
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Guest</p>
                        <p className="text-2xl font-bold">{booking.guestName}</p>
                      </div>

                      {booking.guestPhone && (
                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Phone</p>
                          <p className="text-xl font-mono">{booking.guestPhone}</p>
                        </div>
                      )}

                      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Booking Time</p>
                        <p className="text-lg">
                          {new Date(booking.startTime).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {booking.checkedInAt && (
                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Checked In</p>
                          <p className="text-lg text-green-400 font-bold">
                            {new Date(booking.checkedInAt).toLocaleString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        {booking.status === 'Reserved' && !booking.checkedInAt && (
                          <button
                            onClick={() => handleCheckIn(booking.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-4 rounded-lg font-black text-lg transition-colors"
                          >
                            Check In
                          </button>
                        )}

                        {booking.checkedInAt && !booking.checkedOutAt && (
                          <button
                            onClick={() => handleCheckOut(booking.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-lg font-black text-lg transition-colors"
                          >
                            Check Out
                          </button>
                        )}

                        {!booking.checkedOutAt && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-4 rounded-lg font-black text-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
