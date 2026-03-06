// Reservation API Service
// Note: VITE_API_URL already includes /api in production
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

// REPLACED THE "secureFetch" HACK WITH A CLEAN HELPER
const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'API Request Failed');
    error.response = { status: response.status, data: errorData };
    throw error;
  }
  return response.json();
};

export const reservationApi = {
  // Get available time slots for a venue on a specific date
  async getAvailability(venueId, date) {
    return await apiRequest(`${API_URL}/public/Reservations/availability?venueId=${venueId}&date=${date.toISOString()}`);
  },

  // Get zones/tables for a venue
  async getZones(venueId) {
    return await apiRequest(`${API_URL}/public/Reservations/zones?venueId=${venueId}`);
  },

  // Create a reservation
  async createReservation(reservationData) {
    console.log('🌐 Sending Payload:', reservationData);
    return await apiRequest(`${API_URL}/public/Reservations`, {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  },

  // Get reservation status by booking code
  async getReservationStatus(bookingCode) {
    return await apiRequest(`${API_URL}/public/Reservations/${bookingCode}`);
  },

  // Get all restaurant venues (venues with type "Restaurant")
  async getRestaurantVenues() {
    const venues = await apiRequest(`${API_URL}/venues`);
    return venues.filter(v => v.type?.toLowerCase() === 'restaurant' && v.isActive);
  }
};
