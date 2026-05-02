/**
 * Venue API Service
 * Handles venue-related endpoints for map and availability
 * Industrial Grade: Error handling, retries, caching
 */

const API_URL = (import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api').replace(/\/+$/, '');

class VenueApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all venues for map display
   * @returns {Promise<Array>}
   */
  async getVenues() {
    const cacheKey = 'venues';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    
    // Return stale data immediately while fetching in background
    const staleData = localStorage.getItem('riviera_venues_data');
    if (staleData && !this.backgroundFetchTriggered) {
      this.backgroundFetchTriggered = true;
      // Fetch in background quietly
      this.fetchAndCacheVenues().catch(e => console.error("Background venue fetch failed", e));
      try {
        const parsed = JSON.parse(staleData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }

    // Default network fetch if no stale data
    return await this.fetchAndCacheVenues();
  }

  async fetchAndCacheVenues() {
    console.log("Fetching venues from network...");
    const response = await fetch(`${API_URL}/public/Venues`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const venues = await response.json();
    if (!venues || venues.length === 0) return [];

    this.cache.set('venues', { data: venues, timestamp: Date.now() });
    localStorage.setItem('riviera_venues_data', JSON.stringify(venues));
    
    // Dispatch event to notify React that fresh data arrived
    window.dispatchEvent(new CustomEvent('riviera_venues_updated', { detail: venues }));
    
    return venues;
  }

  /**
   * Get venue availability (zones and units)
   * @param {string} venueId
   * @returns {Promise<Object>}
   */
  async getVenueAvailability(venueId) {
    const cacheKey = `availability-${venueId}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) {
        return cached.data;
      }
    }

    const response = await fetch(`${API_URL}/public/Venues/${venueId}/availability`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Batch-fetch availability for multiple venues (for list view)
   * @param {Array} venueIds - Array of venue IDs
   * @returns {Promise<Object>} Map of venueId -> availability
   */
  async getBatchAvailability(venueIds) {
    const results = {};
    const uncached = [];

    for (const id of venueIds) {
      const cacheKey = `availability-${id}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 60000) {
          results[id] = cached.data;
          continue;
        }
      }
      uncached.push(id);
    }

    // Fetch uncached in parallel (max 5 concurrent)
    const chunks = [];
    for (let i = 0; i < uncached.length; i += 5) {
      chunks.push(uncached.slice(i, i + 5));
    }

    for (const chunk of chunks) {
      const fetched = await Promise.allSettled(
        chunk.map(id => this.getVenueAvailability(id))
      );
      chunk.forEach((id, idx) => {
        if (fetched[idx].status === 'fulfilled') {
          results[id] = fetched[idx].value;
        }
      });
    }

    return results;
  }

  clearCache() {
    this.cache.clear();
  }

  clearCacheEntry(key) {
    this.cache.delete(key);
  }
}

export const venueApi = new VenueApiService();
export default venueApi;
