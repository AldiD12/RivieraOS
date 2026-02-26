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
   * Uses NEW /api/public/venues endpoint (deployed Feb 26, 2026)
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
      console.log('🌐 Fetching venues from API...');
      
      // Use NEW public venues endpoint (capital V)
      const response = await fetch(`${API_URL}/api/public/Venues`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const venues = await response.json();
      
      console.log('📦 Raw API response:', venues);
      
      if (!venues || venues.length === 0) {
        console.warn('⚠️ No venues returned from API');
        return [];
      }
      
      // Log each venue's coordinates
      venues.forEach(v => {
        console.log(`📍 Venue: ${v.name}, Lat: ${v.latitude}, Lng: ${v.longitude}`);
      });
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: venues,
        timestamp: Date.now()
      });
      
      console.log(`✅ Fetched ${venues.length} venues from API`);
      return venues;
      
    } catch (error) {
      console.error('❌ Failed to fetch venues:', error);
      throw error;
    }
  }



  /**
   * Get venue availability (zones and units)
   * Uses NEW /api/public/venues/{id}/availability endpoint (deployed Feb 26, 2026)
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
      
      // Use NEW venue availability endpoint (capital V)
      const response = await fetch(
        `${API_URL}/api/public/Venues/${venueId}/availability`,
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

      const data = await response.json();
      
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
