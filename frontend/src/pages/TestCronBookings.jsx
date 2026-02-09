import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export default function TestCronBookings() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [units, setUnits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch venues on mount
  useEffect(() => {
    fetchVenues();
  }, []);

  // Fetch zones when venue selected
  useEffect(() => {
    if (selectedVenue) {
      fetchZones(selectedVenue);
      fetchUnits(selectedVenue);
      fetchBookings(selectedVenue);
    }
  }, [selectedVenue]);

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/business/venues`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVenues(data);
      if (data.length > 0) {
        setSelectedVenue(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchZones = async (venueId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/business/venues/${venueId}/zones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setZones(data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchUnits = async (venueId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/business/venues/${venueId}/units`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUnits(data.filter(u => u.status === 'Available'));
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchBookings = async (venueId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/business/venues/${venueId}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const createTestBooking = async (status) => {
    if (!selectedVenue || units.length === 0) {
      setMessage('❌ No available units. Please create units first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const unit = units[Math.floor(Math.random() * units.length)];
      
      // Create booking
      const bookingData = {
        zoneUnitId: unit.id,
        guestName: `Test ${status} Customer`,
        guestPhone: `+355691${Math.floor(100000 + Math.random() * 900000)}`,
        guestEmail: `test.${status.toLowerCase()}@example.com`,
        guestCount: 2,
        startTime: new Date().toISOString(),
        endTime: null,
        notes: `Test booking for cron job - Status: ${status}`,
        checkInImmediately: status === 'Active'
      };

      const response = await fetch(`${API_URL}/business/venues/${selectedVenue}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const booking = await response.json();

      // If we want Completed or Cancelled status, we need to update it
      if (status === 'Completed') {
        // Check in first if not already
        if (booking.status === 'Reserved') {
          await fetch(`${API_URL}/business/venues/${selectedVenue}/bookings/${booking.id}/check-in`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        // Then check out
        await fetch(`${API_URL}/business/venues/${selectedVenue}/bookings/${booking.id}/check-out`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else if (status === 'Cancelled') {
        await fetch(`${API_URL}/business/venues/${selectedVenue}/bookings/${booking.id}/cancel`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      setMessage(`✅ Created ${status} booking: ${booking.bookingCode}`);
      
      // Refresh data
      await fetchUnits(selectedVenue);
      await fetchBookings(selectedVenue);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestUnits = async () => {
    if (!selectedVenue || zones.length === 0) {
      setMessage('❌ No zones found. Please create a zone first.');
      return;
    }

    setLoading(true);
    setMessage('🔄 Creating 8 test sunbed units...');

    try {
      const token = localStorage.getItem('token');
      const zone = zones[0]; // Use first zone

      const response = await fetch(`${API_URL}/business/venues/${selectedVenue}/Units/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venueZoneId: zone.id,
          unitType: 'Sunbed',
          prefix: 'TEST',
          startNumber: 1,
          count: 8,
          basePrice: 50
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create units');
      }

      const result = await response.json();
      setMessage(`✅ Created ${result.createdCount} test units! Now you can create bookings.`);
      
      // Refresh units
      await fetchUnits(selectedVenue);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createAllTestBookings = async () => {
    setMessage('🔄 Creating 8 test bookings (2 of each status)...');
    
    for (const status of ['Reserved', 'Active', 'Completed', 'Cancelled']) {
      await createTestBooking(status);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between bookings
      await createTestBooking(status);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setMessage('✅ All 8 test bookings created! Wait until midnight to test cron job.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reserved': return 'bg-blue-900/20 text-blue-400 border-blue-800';
      case 'Active': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'Completed': return 'bg-gray-900/20 text-gray-400 border-gray-800';
      case 'Cancelled': return 'bg-red-900/20 text-red-400 border-red-800';
      default: return 'bg-zinc-900/20 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">🧪 Cron Job Test Data Generator</h1>
          <p className="text-zinc-400">
            Create test bookings to verify the midnight cron job resets them correctly
          </p>
        </div>

        {/* Venue Selector */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Select Venue</label>
          <select
            value={selectedVenue || ''}
            onChange={(e) => setSelectedVenue(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
          >
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 mt-2">
            Available units: {units.length} | Total bookings: {bookings.length}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          
          {units.length === 0 && (
            <button
              onClick={createTestUnits}
              disabled={loading}
              className="w-full bg-yellow-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? '⏳ Creating...' : '🏖️ Create 8 Test Sunbed Units First'}
            </button>
          )}
          
          <button
            onClick={createAllTestBookings}
            disabled={loading || units.length === 0}
            className="w-full bg-white text-black px-6 py-4 rounded-lg font-bold text-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? '⏳ Creating...' : '🚀 Create All 8 Test Bookings'}
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => createTestBooking('Reserved')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              + Reserved
            </button>
            <button
              onClick={() => createTestBooking('Active')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              + Active
            </button>
            <button
              onClick={() => createTestBooking('Completed')}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              + Completed
            </button>
            <button
              onClick={() => createTestBooking('Cancelled')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              + Cancelled
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-lg border ${
              message.startsWith('✅') 
                ? 'bg-green-900/20 border-green-800 text-green-400'
                : message.startsWith('❌')
                ? 'bg-red-900/20 border-red-800 text-red-400'
                : 'bg-blue-900/20 border-blue-800 text-blue-400'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Expected Behavior */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🕐 Expected Behavior at Midnight</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">Reserved</span>
              <span className="text-zinc-500">→</span>
              <span className="text-gray-400">Completed</span>
              <span className="text-zinc-600 ml-2">(Cron job will change)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">Active</span>
              <span className="text-zinc-500">→</span>
              <span className="text-gray-400">Completed</span>
              <span className="text-zinc-600 ml-2">(Cron job will change)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Completed</span>
              <span className="text-zinc-500">→</span>
              <span className="text-gray-400">Completed</span>
              <span className="text-zinc-600 ml-2">(No change)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">Cancelled</span>
              <span className="text-zinc-500">→</span>
              <span className="text-red-400">Cancelled</span>
              <span className="text-zinc-600 ml-2">(No change)</span>
            </div>
          </div>
        </div>

        {/* Current Bookings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Current Bookings</h2>
            <button
              onClick={() => fetchBookings(selectedVenue)}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {bookings.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No bookings yet. Create some test bookings above.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700 rounded-lg"
                >
                  <div>
                    <p className="font-mono font-bold">{booking.bookingCode}</p>
                    <p className="text-sm text-zinc-400">{booking.guestName} • {booking.unitCode}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {bookings.filter(b => b.status === 'Reserved').length}
              </p>
              <p className="text-xs text-zinc-500">Reserved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {bookings.filter(b => b.status === 'Active').length}
              </p>
              <p className="text-xs text-zinc-500">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">
                {bookings.filter(b => b.status === 'Completed').length}
              </p>
              <p className="text-xs text-zinc-500">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {bookings.filter(b => b.status === 'Cancelled').length}
              </p>
              <p className="text-xs text-zinc-500">Cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
