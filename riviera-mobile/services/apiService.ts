import { VenueStatusResponse, LiveEventResponse, VenueDetail } from '../types/api';

// Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.riviera-os.com';

class ApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  /**
   * Fetch venue status data for Day Mode
   */
  async getVenueStatus(filters?: string): Promise<VenueStatusResponse> {
    const url = `${API_BASE_URL}/api/discovery/venues/status${filters || ''}`;
    return this.fetchWithErrorHandling<VenueStatusResponse>(url);
  }
  
  /**
   * Fetch live events data for Night Mode
   */
  async getLiveEvents(filters?: string): Promise<LiveEventResponse> {
    const url = `${API_BASE_URL}/api/discovery/events/live${filters || ''}`;
    return this.fetchWithErrorHandling<LiveEventResponse>(url);
  }
  
  /**
   * Get detailed information for a specific venue
   */
  async getVenueDetail(venueId: string): Promise<VenueDetail> {
    const url = `${API_BASE_URL}/api/discovery/venues/${venueId}`;
    return this.fetchWithErrorHandling<VenueDetail>(url);
  }
  
  /**
   * Get detailed information for a specific event
   */
  async getEventDetail(eventId: string): Promise<VenueDetail> {
    const url = `${API_BASE_URL}/api/discovery/events/${eventId}`;
    return this.fetchWithErrorHandling<VenueDetail>(url);
  }
}

export const apiService = new ApiService();