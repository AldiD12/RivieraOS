// Reservation API Service
// Note: VITE_API_URL already includes /api in production
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

// REPLACED THE "secureFetch" HACK WITH A CLEAN HELPER
const apiRequest = async (url, options = {}) => {
  console.log('🌐 API Request Details:', {
    url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body
  });

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });

  console.log('🌐 Raw Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    // 🕵️‍♂️ CAPTURE THE EXACT RESPONSE BODY
    let errorData;
    const contentType = response.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        // If it's text/plain or other format
        const textResponse = await response.text();
        console.error('🔥 NON-JSON ERROR RESPONSE:', textResponse);
        errorData = { message: textResponse, rawResponse: textResponse };
      }
    } catch (parseError) {
      console.error('🔥 FAILED TO PARSE ERROR RESPONSE:', parseError);
      errorData = { message: 'Failed to parse error response', parseError: parseError.message };
    }
    
    console.error('🔥 DETAILED ERROR RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      errorData
    });
    
    const error = new Error(errorData.message || errorData.title || 'API Request Failed');
    error.response = { 
      status: response.status, 
      statusText: response.statusText,
      data: errorData,
      contentType 
    };
    throw error;
  }
  
  const result = await response.json();
  console.log('✅ API Success Response:', result);
  return result;
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
  },

  // 🔍 DEBUG: Check specific booking status
  async debugBookingStatus(bookingCode) {
    console.log(`🔍 Checking booking status for: ${bookingCode}`);
    try {
      const result = await this.getReservationStatus(bookingCode);
      console.log('📊 Booking Status Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to get booking status:', error);
      throw error;
    }
  },

  // 🧪 DEBUG: Create test booking for immediate testing
  async createTestBooking(venueId = 18, zoneId = 16) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + 5 * 60000); // +5 minutes
    const arrivalTime = futureTime.getHours().toString().padStart(2, '0') + ':' + futureTime.getMinutes().toString().padStart(2, '0');
    const today = now.toISOString().split('T')[0];
    
    const payload = {
      venueId,
      zoneId,
      guestName: `Test User - ${now.getHours()}:${now.getMinutes()}`,
      guestPhone: "+355691234567",
      guestCount: 2,
      sunbedCount: 1,
      arrivalTime: arrivalTime,
      reservationDate: today,
      notes: `DEBUG TEST BOOKING - Created at ${now.toLocaleTimeString()}`
    };
    
    console.log('🧪 Creating test booking with future arrival time:', payload);
    return await this.createReservation(payload);
  }
};
