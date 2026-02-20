import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 
  'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const collectorApi = {
  /**
   * Get all units for collector's assigned venue
   * Includes zones, units, current bookings, and available transitions
   * 
   * @returns {Promise<Object>} Venue data with zones and units
   * @throws {Error} 403 if no venue assigned, 404 if venue not found
   */
  getVenueUnits: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/collector/units`, {
        headers: getAuthHeader()
      });
      console.log('✅ Collector units fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch collector units:', error);
      // Re-throw with better error handling
      if (error.response?.status === 403) {
        throw { data: { message: 'No venue assigned to your account. Please contact your manager.' } };
      }
      throw { data: { message: error.response?.data?.error || 'Failed to load venue data' } };
    }
  },

  /**
   * Update unit status and optionally add notes
   * Backend automatically manages bookings:
   * - Setting to "Available" completes active bookings
   * - Setting to "Occupied" checks in reserved bookings
   * 
   * @param {number} unitId - Unit ID to update
   * @param {Object} data - Update data { status: string, notes?: string }
   * @returns {Promise<Object>} Updated unit data
   * @throws {Error} 403 if no venue assigned, 404 if unit not found
   */
  updateUnitStatus: async (unitId, data) => {
    try {
      const payload = {
        status: data.status
      };
      
      if (data.notes) {
        payload.notes = data.notes;
      }

      const response = await axios.put(
        `${API_URL}/api/collector/units/${unitId}/status`,
        payload,
        { headers: getAuthHeader() }
      );

      console.log(`✅ Unit ${unitId} status updated to ${data.status}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update unit ${unitId} status:`, error);
      throw { data: { message: error.response?.data?.error || 'Failed to update unit status' } };
    }
  }
};

export default collectorApi;
