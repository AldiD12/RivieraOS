// API Configuration - Easy switching between environments
const API_ENVIRONMENTS = {
  LOCAL: 'http://localhost:5171/api',
  AZURE: 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api',
  MOCK: 'mock' // For development/demo
};

// Current environment - change this to switch APIs
// Connecting to Azure API
const CURRENT_ENV = 'AZURE';

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
    // For Azure API, test a simple GET endpoint that doesn't require auth
    const testUrl = API_CONFIG.IS_AZURE 
      ? `${API_CONFIG.BASE_URL}/Businesses` // Test businesses endpoint instead
      : API_CONFIG.BASE_URL.replace('/api', '/health');
      
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // For Azure, even a 401 means the API is responding (just needs auth)
    const isHealthy = API_CONFIG.IS_AZURE 
      ? (response.status === 401 || response.status === 403 || response.ok)
      : response.ok;
    
    return { 
      status: CURRENT_ENV.toLowerCase(), 
      healthy: isHealthy,
      url: API_CONFIG.BASE_URL,
      note: API_CONFIG.IS_AZURE ? 'API responding (auth may be required)' : undefined
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