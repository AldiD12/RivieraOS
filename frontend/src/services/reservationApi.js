// Reservation API Service
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export const reservationApi = {
  // Get available time slots for a venue on a specific date
  async getAvailability(venueId, date) {
    const response = await fetch(
      `${API_URL}/public/Reservations/availability?venueId=${venueId}&date=${date.toISOString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  },

  // Get zones/tables for a venue
  async getZones(venueId) {
    const response = await fetch(
      `${API_URL}/public/Reservations/zones?venueId=${venueId}`
    );
    if (!response.ok) throw new Error('Failed to fetch zones');
    return response.json();
  },

  // Create a reservation
  async createReservation(reservationData) {
    const response = await fetch(`${API_URL}/public/Reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });
    if (!response.ok) throw new Error('Failed to create reservation');
    return response.json();
  },

  // Get reservation status by booking code
  async getReservationStatus(bookingCode) {
    const response = await fetch(`${API_URL}/public/Reservations/${bookingCode}`);
    if (!response.ok) throw new Error('Failed to fetch reservation status');
    return response.json();
  },

  // Get all restaurant venues (venues with type "Restaurant")
  async getRestaurantVenues() {
    const response = await fetch(`${API_URL}/venues`);
    if (!response.ok) throw new Error('Failed to fetch venues');
    const venues = await response.json();
    return venues.filter(v => v.type?.toLowerCase() === 'restaurant' && v.isActive);
  }
};
