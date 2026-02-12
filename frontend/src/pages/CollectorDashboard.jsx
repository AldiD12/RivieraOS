import { useState, useEffect } from 'react';
import businessApi from '../services/businessApi';

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

  // Fetch venues on mount
  useEffect(() => {
    fetchVenues();
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

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const data = await businessApi.venues.list();
      setVenues(data);
      if (data.length > 0) {
        setSelectedVenue(data[0]);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
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

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setShowBookingModal(true);
  };

  const getUnitBooking = (unitId) => {
    return bookings.find(b => b.zoneUnitId === unitId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-900 text-green-300';
      case 'Reserved':
        return 'bg-yellow-900 text-yellow-300';
      case 'Occupied':
        return 'bg-red-900 text-red-300';
      case 'Maintenance':
        return 'bg-gray-900 text-gray-300';
      default:
        return 'bg-zinc-900 text-zinc-300';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Collector Dashboard</h1>
          <p className="text-sm text-zinc-400">Manage sunbed bookings and check-ins</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Venue & Zone Selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Venue</label>
            <select
              value={selectedVenue?.id || ''}
              onChange={(e) => {
                const venue = venues.find(v => v.id === parseInt(e.target.value));
                setSelectedVenue(venue);
                setSelectedZone(null);
                setUnits([]);
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
            >
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Zone</label>
            <select
              value={selectedZone?.id || ''}
              onChange={(e) => {
                const zone = zones.find(z => z.id === parseInt(e.target.value));
                setSelectedZone(zone);
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
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
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-3xl font-bold">{units.length}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Available</p>
              <p className="text-3xl font-bold text-green-400">
                {units.filter(u => u.status === 'Available').length}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Reserved</p>
              <p className="text-3xl font-bold text-yellow-400">
                {units.filter(u => u.status === 'Reserved').length}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Occupied</p>
              <p className="text-3xl font-bold text-red-400">
                {units.filter(u => u.status === 'Occupied').length}
              </p>
            </div>
          </div>
        )}

        {/* Units Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : !selectedZone ? (
          <div className="text-center py-12 text-zinc-400">
            Select a venue and zone to view units
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            No units found in this zone
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {units.map((unit) => {
              const booking = getUnitBooking(unit.id);
              return (
                <button
                  key={unit.id}
                  onClick={() => handleUnitClick(unit)}
                  className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-all aspect-square flex flex-col items-center justify-center"
                >
                  <p className="text-xl font-bold mb-2">{unit.unitCode}</p>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(unit.status)}`}>
                    {unit.status}
                  </span>
                  {booking && (
                    <p className="text-xs text-zinc-400 mt-2 truncate w-full text-center">
                      {booking.guestName}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full border border-zinc-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedUnit.unitCode}</h2>
                  <p className="text-sm text-zinc-400">{selectedUnit.unitType}</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-zinc-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`text-sm px-3 py-1 rounded ${getStatusColor(selectedUnit.status)}`}>
                    {selectedUnit.status}
                  </span>
                </div>

                {(() => {
                  const booking = getUnitBooking(selectedUnit.id);
                  if (!booking) {
                    return (
                      <div className="text-center py-8 text-zinc-400">
                        No active booking
                      </div>
                    );
                  }

                  return (
                    <>
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Guest</p>
                        <p className="text-lg font-medium">{booking.guestName}</p>
                      </div>

                      {booking.guestPhone && (
                        <div>
                          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Phone</p>
                          <p className="text-lg font-mono">{booking.guestPhone}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Booking Time</p>
                        <p className="text-sm">
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
                        <div>
                          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Checked In</p>
                          <p className="text-sm text-green-400">
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
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-medium transition-colors"
                          >
                            Check In
                          </button>
                        )}

                        {booking.checkedInAt && !booking.checkedOutAt && (
                          <button
                            onClick={() => handleCheckOut(booking.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-medium transition-colors"
                          >
                            Check Out
                          </button>
                        )}

                        {!booking.checkedOutAt && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded font-medium transition-colors"
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
