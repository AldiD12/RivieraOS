import axios from 'axios';
import { API_CONFIG } from './apiConfig.js';

// Azure API specific service
const AZURE_BASE_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export const azureApi = axios.create({
  baseURL: AZURE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
azureApi.interceptors.request.use((config) => {
  // Step 3: Add Authorization: Bearer {token} header to all API calls
  const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Added Authorization header to API call:', config.url);
  } else {
    console.log('⚠️ No token found for API call:', config.url);
  }
  return config;
});

// Azure API Endpoints based on Swagger

// Authentication
export const azureAuth = {
  register: async (registerData) => {
    try {
      const response = await azureApi.post('/Auth/register', registerData);
      // Store JWT token if returned
      if (response.data.token) {
        localStorage.setItem('azure_jwt_token', response.data.token);
      }
      // Transform Azure response to match frontend expectations
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Azure register error:', error);
      throw error;
    }
  },
  
  login: async (loginData) => {
    try {
      console.log('🔐 Attempting Azure API login for:', loginData.email);
      console.log('🔐 Request URL:', `${AZURE_BASE_URL}/Auth/login`);
      console.log('🔐 Request data:', loginData);
      
      const response = await azureApi.post('/Auth/login', loginData);
      
      console.log('🔐 Azure login response status:', response.status);
      console.log('🔐 Azure login response headers:', response.headers);
      console.log('🔐 Azure login response data:', response.data);
      
      // Validate response structure
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      // Store JWT token if returned
      if (response.data.token) {
        localStorage.setItem('azure_jwt_token', response.data.token);
        console.log('🔐 Token stored successfully');
      } else {
        console.log('⚠️ No token in response');
      }
      
      // Transform Azure response to match frontend expectations
      const result = {
        success: true,
        user: response.data.user || response.data,
        token: response.data.token
      };
      
      console.log('🔐 Transformed result:', result);
      return result;
      
    } catch (error) {
      // Handle login errors with detailed logging
      console.error('❌ Azure login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      // Don't store any tokens on error
      localStorage.removeItem('azure_jwt_token');
      localStorage.removeItem('token');
      
      // Re-throw the error for the calling code to handle
      throw error;
    }
  }
};

// Businesses
export const azureBusinesses = {
  getAll: async () => {
    const response = await azureApi.get('/Businesses');
    return response.data;
  },
  
  create: async (businessData) => {
    const response = await azureApi.post('/Businesses', businessData);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await azureApi.get(`/Businesses/${id}`);
    return response.data;
  }
};

// Helper function to transform Azure data to our app format
export const transformAzureData = {
  // Transform Azure Business to our Venue format
  businessToVenue: (business) => ({
    id: business.id,
    name: business.brandName || business.registeredName,
    description: `${business.registeredName} - Premium venue`,
    imageUrl: business.logoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    status: business.isActive ? 'Open' : 'Closed',
    rating: 4.8, // Default rating
    priceRange: '€€€',
    type: 'Restaurant & Bar',
    address: business.contactEmail || 'Premium Location',
    // Add mock venue data that our app expects
    zones: [
      {
        id: 1,
        name: 'Main Dining',
        units: [
          { id: 1, unitLabel: 'A1', currentStatus: 'Free' },
          { id: 2, unitLabel: 'A2', currentStatus: 'Occupied' },
          { id: 3, unitLabel: 'A3', currentStatus: 'Reserved' }
        ],
        basePrice: 25.00
      }
    ]
  }),

  // Transform Azure Product to our Menu format
  productToMenuItem: (product) => ({
    id: product.id,
    name: product.name,
    description: product.description || 'Delicious item',
    price: product.price,
    oldPrice: product.oldPrice,
    imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    category: product.category?.name || 'Food',
    available: product.isAvailable,
    isAlcohol: product.isAlcohol
  })
};

// Unified API service that works with both local and Azure APIs
export const unifiedApi = {
  // Get venues/businesses
  getVenues: async () => {
    if (API_CONFIG.IS_AZURE) {
      const businesses = await azureBusinesses.getAll();
      return businesses.map(transformAzureData.businessToVenue);
    }
    // Fallback to local API or mock data
    return [];
  },

  // Get menu items
  getMenu: async (venueId = 1) => {
    if (API_CONFIG.IS_AZURE) {
      // Azure API doesn't have direct menu endpoints in the swagger
      // We'll need to get products from a business/venue
      try {
        const business = await azureBusinesses.getById(venueId);
        if (business.venues && business.venues[0] && business.venues[0].products) {
          return business.venues[0].products.map(transformAzureData.productToMenuItem);
        }
      } catch (error) {
        console.log('No products found, using mock data');
      }
    }
    
    // Return mock menu data
    return [
      { id: 1, name: 'Mojito', price: 9.00, category: 'Cocktails', available: true, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400' },
      { id: 2, name: 'French Fries', price: 5.00, category: 'Food', available: true, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
      { id: 3, name: 'Aperol Spritz', price: 8.50, category: 'Cocktails', available: true, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400' },
      { id: 4, name: 'Club Sandwich', price: 12.00, category: 'Food', available: true, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400' }
    ];
  },

  // Authentication
  login: async (credentials) => {
    if (API_CONFIG.IS_AZURE) {
      try {
        return await azureAuth.login(credentials);
      } catch (error) {
        // If Azure login fails, return error in expected format
        console.error('Azure login failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.message || 'Login failed' 
        };
      }
    }
    // Fallback to local auth logic
    return { success: true, user: { email: credentials.email, role: 'Admin' } };
  },

  register: async (userData) => {
    if (API_CONFIG.IS_AZURE) {
      return await azureAuth.register(userData);
    }
    // Fallback to local registration
    return { success: true, message: 'User registered successfully' };
  }
};

export default unifiedApi;