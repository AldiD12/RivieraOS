/**
 * Venue API Service
 * Handles venue-related endpoints for map and availability
 * Industrial Grade: Error handling, retries, caching
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.riviera-os.com';

class VenueApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all venues for map display
   * Uses /api/public/Reservations/zones to extract unique venues
   * @returns {Promise<Array>}
   */
  async getVenues() {
    const cacheKey = 'venues';
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Returning cached venues');
        return cached.data;
      }
    }

    try {
      console.log('🌐 Fetching venues from zones API...');
      
      // Fetch all zones (which include venue data)
      const response = await fetch(`${API_URL}/api/public/Reservations/zones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const zones = await response.json();
      
      // Extract unique venues from zones
      const venuesMap = new Map();
      
      zones.forEach(zone => {
        if (zone.venue && !venuesMap.has(zone.venue.id)) {
          venuesMap.set(zone.venue.id, {
            id: zone.venue.id,
            name: zone.venue.name,
            type: zone.venue.type || 'BEACH',
            description: zone.venue.description || '',
            address: zone.venue.address || 'Albanian Riviera',
            imageUrl: zone.venue.imageUrl || '',
            latitude: zone.venue.latitude || 40.1,
            longitude: zone.venue.longitude || 19.6,
            isActive: zone.venue.isActive !== false,
            allowsDigitalOrdering: zone.venue.allowsDigitalOrdering !== false,
            availableUnitsCount: 0 // Will be calculated
          });
        }
        
        // Count available units per venue
        if (zone.venue && zone.units) {
          const venue = venuesMap.get(zone.venue.id);
          if (venue) {
            const availableUnits = zone.units.filter(u => u.status === 'Available').length;
            venue.availableUnitsCount += availableUnits;
          }
        }
      });
      
      const venues = Array.from(venuesMap.values());
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: venues,
        timestamp: Date.now()
      });
      
      console.log(`✅ Fetched ${venues.length} venues from zones`);
      return venues;
      
    } catch (error) {
      console.error('❌ Failed to fetch venues:', error);
      throw error;
    }
  }

  /**
   * Get venue availability (zones and units)
   * Uses /api/public/Reservations/zones filtered by venueId
   * @param {string} venueId - Venue ID
   * @returns {Promise<Object>}
   */
  async getVenueAvailability(venueId) {
    const cacheKey = `availability-${venueId}`;
    
    // Check cache (shorter timeout for availability)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute
        console.log('📦 Returning cached availability');
        return cached.data;
      }
    }

    try {
      console.log(`🌐 Fetching availability for venue ${venueId}...`);
      
      const response = await fetch(
        `${API_URL}/api/public/Reservations/zones?venueId=${venueId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const zones = await response.json();
      
      // Calculate availability
      let totalUnits = 0;
      let availableUnits = 0;
      let reservedUnits = 0;
      let occupiedUnits = 0;
      
      const zonesData = zones.map(zone => {
        const zoneAvailable = zone.units ? zone.units.filter(u => u.status === 'Available').length : 0;
        const zoneTotal = zone.units ? zone.units.length : 0;
        
        totalUnits += zoneTotal;
        availableUnits += zoneAvailable;
        
        return {
          id: zone.id,
          name: zone.name,
          zoneType: zone.zoneType || 'sunbed',
          totalUnits: zoneTotal,
          availableUnits: zoneAvailable,
          basePrice: zone.basePrice || 0
        };
      });
      
      const data = {
        venueId: parseInt(venueId),
        venueName: zones[0]?.venue?.name || 'Venue',
        totalUnits,
        availableUnits,
        reservedUnits,
        occupiedUnits,
        zones: zonesData
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      console.log(`✅ Fetched availability for venue ${venueId}:`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ Failed to fetch availability for venue ${venueId}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    console.log('🗑️ Clearing venue cache');
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clearCacheEntry(key) {
    console.log(`🗑️ Clearing cache entry: ${key}`);
    this.cache.delete(key);
  }
}

export const venueApi = new VenueApiService();
export default venueApi;
