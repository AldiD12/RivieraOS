/**
 * Content API Service
 * Handles curated content for Experience Deck
 * Industrial Grade: Caching, error handling
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.riviera-os.com';

class ContentApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get curated content
   * @param {string|null} venueId - Filter by venue (optional)
   * @param {number} limit - Max items to return
   * @returns {Promise<Array>}
   */
  async getContent(venueId = null, limit = 10) {
    const cacheKey = `content-${venueId || 'all'}-${limit}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Returning cached content');
        return cached.data;
      }
    }

    try {
      const params = new URLSearchParams();
      if (venueId) params.append('venueId', venueId);
      params.append('limit', limit);
      
      console.log('🌐 Fetching curated content...');
      
      const response = await fetch(
        `${API_URL}/api/public/content?${params}`,
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
      
      console.log(`✅ Fetched ${data.length} content items`);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to fetch content:', error);
      
      // Return empty array on error (graceful degradation)
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    console.log('🗑️ Clearing content cache');
    this.cache.clear();
  }
}

export const contentApi = new ContentApiService();
export default contentApi;
