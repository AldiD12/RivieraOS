// Reservation API Service
// Note: VITE_API_URL already includes /api in production
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

// 🛡️ SECURITY: Protect against malicious fetch interceptors
const originalFetch = window.fetch;
const secureFetch = (...args) => {
  console.log('🔒 Using secure fetch for:', args[0]);
  return originalFetch.apply(window, args);
};

export const reservationApi = {
  // Get available time slots for a venue on a specific date
  async getAvailability(venueId, date) {
    const response = await secureFetch(
      `${API_URL}/public/Reservations/availability?venueId=${venueId}&date=${date.toISOString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  },

  // Get zones/tables for a venue
  async getZones(venueId) {
    const response = await secureFetch(
      `${API_URL}/public/Reservations/zones?venueId=${venueId}`
    );
    if (!response.ok) throw new Error('Failed to fetch zones');
    return response.json();
  },

  // Create a reservation
  async createReservation(reservationData) {
    console.log('🌐 API Request:', {
      url: `${API_URL}/public/Reservations`,
      method: 'POST',
      data: reservationData
    });
    
    // 🛡️ SECURITY: Use secure fetch to bypass malicious interceptors
    const response = await secureFetch(`${API_URL}/public/Reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });
    
    console.log('🌐 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🌐 API Error:', errorData);
      
      const error = new Error(errorData.message || errorData.error || 'Failed to create reservation');
      error.response = {
        status: response.status,
        data: errorData
      };
      throw error;
    }
    
    const result = await response.json();
    console.log('🌐 API Success:', result);
    return result;
  },

  // Get reservation status by booking code
  async getReservationStatus(bookingCode) {
    const response = await secureFetch(`${API_URL}/public/Reservations/${bookingCode}`);
    if (!response.ok) throw new Error('Failed to fetch reservation status');
    return response.json();
  },

  // Get all restaurant venues (venues with type "Restaurant")
  async getRestaurantVenues() {
    const response = await secureFetch(`${API_URL}/venues`);
    if (!response.ok) throw new Error('Failed to fetch venues');
    const venues = await response.json();
    return venues.filter(v => v.type?.toLowerCase() === 'restaurant' && v.isActive);
  }
};
