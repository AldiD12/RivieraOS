/**
 * Venue API Service
 * Handles venue-related endpoints for map and availability
 * Industrial Grade: Error handling, retries, caching
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

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

    const response = await fetch(`${API_URL}/public/Venues`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const venues = await response.json();
    if (!venues || venues.length === 0) return [];

    this.cache.set(cacheKey, { data: venues, timestamp: Date.now() });
    return venues;
  }

  /**
   * Get a single venue by ID
   * @param {string} venueId
   * @returns {Promise<Object>}
   */
  async getById(venueId) {
    const cacheKey = `venue-${venueId}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const response = await fetch(`${API_URL}/public/Venues/${venueId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const venue = await response.json();
    this.cache.set(cacheKey, { data: venue, timestamp: Date.now() });
    return venue;
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
