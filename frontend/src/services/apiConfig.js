// API Configuration - Easy switching between environments
const API_ENVIRONMENTS = {
  LOCAL: 'http://localhost:5171/api',
  AZURE: 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api',
  MOCK: 'mock' // For development/demo
};

// Current environment - change this to switch APIs
// Force MOCK mode in production due to CORS restrictions
const CURRENT_ENV = import.meta.env.PROD ? 'MOCK' : 'AZURE';

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
    // For Azure API, test a public endpoint or handle auth
    const testUrl = API_CONFIG.IS_AZURE 
      ? `${API_CONFIG.BASE_URL}/Auth/login` // Test auth endpoint instead
      : API_CONFIG.BASE_URL.replace('/api', '/health');
      
    const response = await fetch(testUrl, {
      method: API_CONFIG.IS_AZURE ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: API_CONFIG.IS_AZURE ? JSON.stringify({
        email: "test@test.com",
        password: "test"
      }) : undefined
    });
    
    // For Azure, even a 400/401 means the API is responding
    const isHealthy = API_CONFIG.IS_AZURE 
      ? (response.status === 400 || response.status === 401 || response.ok)
      : response.ok;
    
    return { 
      status: CURRENT_ENV.toLowerCase(), 
      healthy: isHealthy,
      url: API_CONFIG.BASE_URL,
      note: API_CONFIG.IS_AZURE ? 'API responding (auth required)' : undefined
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