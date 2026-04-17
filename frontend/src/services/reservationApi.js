// Reservation API Service
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
// Normalize: strip trailing slashes + any /api suffix, then re-add /api once
const baseUrl = API_URL.trim().replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });

  if (!response.ok) {
    let errorData;
    const contentType = response.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        const textResponse = await response.text();
        errorData = { message: textResponse };
      }
    } catch (parseError) {
      errorData = { message: 'Failed to parse error response' };
    }

    const error = new Error(errorData.message || errorData.title || 'API Request Failed');
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
    throw error;
  }

  return await response.json();
};

export const reservationApi = {
  // Get available time slots for a venue on a specific date
  async getAvailability(venueId, date) {
    return await apiRequest(`${baseUrl}/public/Reservations/availability?venueId=${venueId}&date=${date.toISOString()}`);
  },

  // Get zones/tables for a venue
  async getZones(venueId) {
    return await apiRequest(`${baseUrl}/public/Reservations/zones?venueId=${venueId}`);
  },

  // Create a reservation
  async createReservation(reservationData) {
    return await apiRequest(`${baseUrl}/public/Reservations`, {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  },

  // Get reservation status by booking code
  async getReservationStatus(bookingCode) {
    return await apiRequest(`${baseUrl}/public/Reservations/${bookingCode}`);
  },

  // Cancel a reservation by booking code
  async cancelReservation(bookingCode) {
    return await apiRequest(`${baseUrl}/public/Reservations/${bookingCode}`, {
      method: 'DELETE'
    });
  }
};
