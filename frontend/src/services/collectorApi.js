import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Collector API call:', config.method.toUpperCase(), config.url);
    } else {
      console.warn('⚠️ No authentication token found for collector API call');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ Collector API success:', response.config.method.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Collector API error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - redirecting to login');
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject({
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
);

// =============================================================================
// COLLECTOR API
// =============================================================================

export const collectorApi = {
  // Get venue info with all zones and units for collector's assigned venue
  getVenueUnits: async () => {
    console.log('📤 Getting collector venue units');
    const response = await api.get('/collector');
    return response.data;
  },

  // Update unit status (check-in, check-out, etc.)
  updateUnitStatus: async (unitId, statusData) => {
    console.log('📤 Updating unit status:', unitId, statusData);
    const response = await api.put(`/collector/units/${unitId}/status`, statusData);
    return response.data;
  }
};

export default collectorApi;
