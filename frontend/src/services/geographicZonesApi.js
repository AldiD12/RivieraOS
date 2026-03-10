// Geographic Zones API Service
// Ready for backend implementation - will work automatically when Kristi adds the endpoints

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class GeographicZonesApi {
  /**
   * Get all geographic zones with event counts
   * Backend endpoint: GET /api/public/Events/geographic-zones
   * Expected response: [{ zone: 'Dhërmi', eventCount: 8 }, { zone: 'Sarandë', eventCount: 3 }]
   */
  async getGeographicZones() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/Events/geographic-zones`);
      
      if (!response.ok) {
        // If endpoint doesn't exist yet, return mock data for development
        if (response.status === 404) {
          console.warn('🚧 Geographic zones endpoint not implemented yet, using mock data');
          return this.getMockGeographicZones();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const zones = await response.json();
      console.log('✅ Geographic zones loaded:', zones);
      return zones;
    } catch (error) {
      console.error('❌ Failed to load geographic zones:', error);
      // Fallback to mock data during development
      return this.getMockGeographicZones();
    }
  }

  /**
   * Get events filtered by geographic zone
   * Backend endpoint: GET /api/public/Events?geographicZone={zone}
   */
  async getEventsByGeographicZone(zone) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/Events?geographicZone=${encodeURIComponent(zone)}`);
      
      if (!response.ok) {
        // If filtering not implemented yet, fetch all events and filter client-side
        if (response.status === 400 || response.status === 404) {
          console.warn('🚧 Geographic zone filtering not implemented yet, using client-side filtering');
          return this.getEventsByGeographicZoneClientSide(zone);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const events = await response.json();
      console.log(`✅ Events for zone "${zone}":`, events);
      return events;
    } catch (error) {
      console.error(`❌ Failed to load events for zone "${zone}":`, error);
      // Fallback to client-side filtering
      return this.getEventsByGeographicZoneClientSide(zone);
    }
  }

  /**
   * Client-side filtering fallback (temporary until backend implements geographic zones)
   */
  async getEventsByGeographicZoneClientSide(zone) {
    try {
      // Import the existing events API
      const { publicEventsApi } = await import('./eventsApi');
      const allEvents = await publicEventsApi.getEvents();
      
      // Filter events by parsing venue address (temporary solution)
      const filteredEvents = allEvents.filter(event => {
        const address = event.venueAddress || '';
        return this.extractZoneFromAddress(address) === zone;
      });
      
      console.log(`🔍 Client-side filtered events for "${zone}":`, filteredEvents);
      return filteredEvents;
    } catch (error) {
      console.error('❌ Client-side filtering failed:', error);
      return [];
    }
  }

  /**
   * Extract geographic zone from venue address (temporary until backend adds zone field)
   */
  extractZoneFromAddress(address) {
    if (!address) return 'Unknown';
    
    const addressLower = address.toLowerCase();
    
    // Albanian Riviera zones
    if (addressLower.includes('dhërmi') || addressLower.includes('dhermi')) return 'Dhërmi';
    if (addressLower.includes('sarandë') || addressLower.includes('sarande')) return 'Sarandë';
    if (addressLower.includes('vlorë') || addressLower.includes('vlore')) return 'Vlorë';
    if (addressLower.includes('himarë') || addressLower.includes('himare')) return 'Himarë';
    if (addressLower.includes('ksamil')) return 'Ksamil';
    if (addressLower.includes('butrint')) return 'Butrint';
    if (addressLower.includes('tirana')) return 'Tirana';
    if (addressLower.includes('durrës') || addressLower.includes('durres')) return 'Durrës';
    
    // Default fallback
    return 'Albanian Riviera';
  }

  /**
   * Mock data for development (remove when backend is ready)
   */
  getMockGeographicZones() {
    return [
      { zone: 'Dhërmi', eventCount: 8 },
      { zone: 'Sarandë', eventCount: 12 },
      { zone: 'Vlorë', eventCount: 5 },
      { zone: 'Himarë', eventCount: 3 },
      { zone: 'Ksamil', eventCount: 2 },
      { zone: 'Tirana', eventCount: 15 }
    ].filter(z => z.eventCount > 0); // Only show zones with events
  }

  /**
   * Get venues filtered by geographic zone
   * Backend endpoint: GET /api/public/Venues?geographicZone={zone}
   */
  async getVenuesByGeographicZone(zone) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/Venues?geographicZone=${encodeURIComponent(zone)}`);
      
      if (!response.ok) {
        // If filtering not implemented yet, fetch all venues and filter client-side
        console.warn('🚧 Geographic zone venue filtering not implemented yet, using client-side filtering');
        return this.getVenuesByGeographicZoneClientSide(zone);
      }
      
      const venues = await response.json();
      console.log(`✅ Venues for zone "${zone}":`, venues);
      return venues;
    } catch (error) {
      console.error(`❌ Failed to load venues for zone "${zone}":`, error);
      return this.getVenuesByGeographicZoneClientSide(zone);
    }
  }

  /**
   * Client-side venue filtering fallback
   */
  async getVenuesByGeographicZoneClientSide(zone) {
    try {
      // Import the existing venue API
      const { venueApi } = await import('./venueApi');
      const allVenues = await venueApi.getVenues();
      
      // Filter venues by parsing address
      const filteredVenues = allVenues.filter(venue => {
        const address = venue.address || '';
        return this.extractZoneFromAddress(address) === zone;
      });
      
      console.log(`🔍 Client-side filtered venues for "${zone}":`, filteredVenues);
      return filteredVenues;
    } catch (error) {
      console.error('❌ Client-side venue filtering failed:', error);
      return [];
    }
  }
}

export const geographicZonesApi = new GeographicZonesApi();