// API Configuration - Easy switching between environments
const API_ENVIRONMENTS = {
  LOCAL: 'http://localhost:5171/api',
  AZURE: 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api',
  MOCK: 'mock' // For development/demo
};

// Current environment - change this to switch APIs
const CURRENT_ENV = 'AZURE'; // Changed to AZURE to test professor's API

export const API_CONFIG = {
  BASE_URL: API_ENVIRONMENTS[CURRENT_ENV],
  IS_MOCK: CURRENT_ENV === 'MOCK',
  IS_AZURE: CURRENT_ENV === 'AZURE',
  IS_LOCAL: CURRENT_ENV === 'LOCAL'
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  if (API_CONFIG.IS_MOCK) {
    return null; // Will use mock data
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API Health Check
export const checkApiHealth = async () => {
  if (API_CONFIG.IS_MOCK) return { status: 'mock', healthy: true };
  
  try {
    // For Azure API, test the businesses endpoint
    const testUrl = API_CONFIG.IS_AZURE 
      ? `${API_CONFIG.BASE_URL}/Businesses`
      : API_CONFIG.BASE_URL.replace('/api', '/health');
      
    const response = await fetch(testUrl);
    return { 
      status: CURRENT_ENV.toLowerCase(), 
      healthy: response.ok,
      url: API_CONFIG.BASE_URL 
    };
  } catch (error) {
    return { 
      status: CURRENT_ENV.toLowerCase(), 
      healthy: false, 
      error: error.message,
      url: API_CONFIG.BASE_URL 
    };
  }
};

export default API_CONFIG;