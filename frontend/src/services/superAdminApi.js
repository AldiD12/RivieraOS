import axios from 'axios';

// SuperAdmin API service for business management
const AZURE_BASE_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export const superAdminApi = axios.create({
  baseURL: AZURE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
superAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ SuperAdmin API call with token:', config.method.toUpperCase(), config.url);
    console.log('🔐 Token preview:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️ No token found for SuperAdmin API call:', config.method.toUpperCase(), config.url);
  }
  return config;
});

// Response interceptor for error handling
superAdminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ SuperAdmin token expired');
      localStorage.clear();
      window.location.href = '/superadmin/login';
    }
    return Promise.reject(error);
  }
);

// Business Management APIs
export const businessApi = {
  // GET /api/Businesses - Get all businesses (basic)
  getAll: async () => {
    const response = await superAdminApi.get('/Businesses');
    return response.data;
  },

  // POST /api/Businesses - Create business (basic)
  create: async (businessData) => {
    const response = await superAdminApi.post('/Businesses', businessData);
    return response.data;
  },

  // GET /api/Businesses/{id} - Get business by ID (basic)
  getById: async (id) => {
    const response = await superAdminApi.get(`/Businesses/${id}`);
    return response.data;
  },

  // SuperAdmin specific endpoints
  superAdmin: {
    // GET /api/superadmin/Businesses - Get all businesses (SuperAdmin view)
    getAll: async () => {
      const response = await superAdminApi.get('/superadmin/Businesses');
      return response.data;
    },

    // POST /api/superadmin/Businesses - Create business (SuperAdmin)
    create: async (businessData) => {
      const response = await superAdminApi.post('/superadmin/Businesses', businessData);
      return response.data;
    },

    // GET /api/superadmin/Businesses/{id} - Get business details (SuperAdmin)
    getById: async (id) => {
      const response = await superAdminApi.get(`/superadmin/Businesses/${id}`);
      return response.data;
    },

    // PUT /api/superadmin/Businesses/{id} - Update business
    update: async (id, businessData) => {
      const response = await superAdminApi.put(`/superadmin/Businesses/${id}`, businessData);
      return response.data;
    },

    // DELETE /api/superadmin/Businesses/{id} - Delete business
    delete: async (id) => {
      const response = await superAdminApi.delete(`/superadmin/Businesses/${id}`);
      return response.data;
    },

    // POST /api/superadmin/Businesses/{id}/restore - Restore deleted business
    restore: async (id) => {
      const response = await superAdminApi.post(`/superadmin/Businesses/${id}/restore`);
      return response.data;
    }
  }
};

// Staff Management APIs - Based on swagger.json endpoints
export const staffApi = {
  // GET /api/superadmin/businesses/{businessId}/Users - Get staff for a business
  getByBusiness: async (businessId) => {
    const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Users`);
    return response.data;
  },

  // POST /api/superadmin/businesses/{businessId}/Users - Create staff member
  create: async (businessId, staffData) => {
    const response = await superAdminApi.post(`/superadmin/businesses/${businessId}/Users`, staffData);
    return response.data;
  },

  // GET /api/superadmin/businesses/{businessId}/Users/{id} - Get staff details
  getById: async (businessId, staffId) => {
    const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Users/${staffId}`);
    return response.data;
  },

  // PUT /api/superadmin/businesses/{businessId}/Users/{id} - Update staff member
  update: async (businessId, staffId, staffData) => {
    const response = await superAdminApi.put(`/superadmin/businesses/${businessId}/Users/${staffId}`, staffData);
    return response.data;
  },

  // DELETE /api/superadmin/businesses/{businessId}/Users/{id} - Delete staff member
  delete: async (businessId, staffId) => {
    const response = await superAdminApi.delete(`/superadmin/businesses/${businessId}/Users/${staffId}`);
    return response.data;
  },

  // POST /api/superadmin/businesses/{businessId}/Users/{id}/reset-password - Reset password
  resetPassword: async (businessId, staffId, newPassword) => {
    const response = await superAdminApi.post(`/superadmin/businesses/${businessId}/Users/${staffId}/reset-password`, {
      newPassword: newPassword
    });
    return response.data;
  },

  // POST /api/superadmin/businesses/{businessId}/Users/{id}/activate - Activate/deactivate user
  toggleActivation: async (businessId, staffId) => {
    const response = await superAdminApi.post(`/superadmin/businesses/${businessId}/Users/${staffId}/activate`);
    return response.data;
  }
};

// Venue Management APIs - Based on swagger.json endpoints
export const venueApi = {
  // GET /api/superadmin/businesses/{businessId}/Venues - Get venues for a business
  getByBusiness: async (businessId) => {
    const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Venues`);
    return response.data;
  },

  // POST /api/superadmin/businesses/{businessId}/Venues - Create venue
  create: async (businessId, venueData) => {
    const response = await superAdminApi.post(`/superadmin/businesses/${businessId}/Venues`, venueData);
    return response.data;
  },

  // GET /api/superadmin/businesses/{businessId}/Venues/{id} - Get venue details
  getById: async (businessId, venueId) => {
    const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Venues/${venueId}`);
    return response.data;
  },

  // PUT /api/superadmin/businesses/{businessId}/Venues/{id} - Update venue
  update: async (businessId, venueId, venueData) => {
    const response = await superAdminApi.put(`/superadmin/businesses/${businessId}/Venues/${venueId}`, venueData);
    return response.data;
  },

  // DELETE /api/superadmin/businesses/{businessId}/Venues/{id} - Delete venue
  delete: async (businessId, venueId) => {
    const response = await superAdminApi.delete(`/superadmin/businesses/${businessId}/Venues/${venueId}`);
    return response.data;
  },

  // GET /api/superadmin/businesses/{businessId}/Venues/{id}/config - Get venue config
  getConfig: async (businessId, venueId) => {
    const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Venues/${venueId}/config`);
    return response.data;
  },

  // PUT /api/superadmin/businesses/{businessId}/Venues/{id}/config - Update venue config
  updateConfig: async (businessId, venueId, configData) => {
    const response = await superAdminApi.put(`/superadmin/businesses/${businessId}/Venues/${venueId}/config`, configData);
    return response.data;
  }
};

// Zone Management APIs - Based on swagger.json endpoints
export const zoneApi = {
  // GET /api/superadmin/venues/{venueId}/Zones - Get zones for a venue
  getByVenue: async (venueId) => {
    const response = await superAdminApi.get(`/superadmin/venues/${venueId}/Zones`);
    return response.data;
  },

  // POST /api/superadmin/venues/{venueId}/Zones - Create zone
  create: async (venueId, zoneData) => {
    const response = await superAdminApi.post(`/superadmin/venues/${venueId}/Zones`, zoneData);
    return response.data;
  },

  // GET /api/superadmin/venues/{venueId}/Zones/{id} - Get zone details
  getById: async (venueId, zoneId) => {
    const response = await superAdminApi.get(`/superadmin/venues/${venueId}/Zones/${zoneId}`);
    return response.data;
  },

  // PUT /api/superadmin/venues/{venueId}/Zones/{id} - Update zone
  update: async (venueId, zoneId, zoneData) => {
    const response = await superAdminApi.put(`/superadmin/venues/${venueId}/Zones/${zoneId}`, zoneData);
    return response.data;
  },

  // DELETE /api/superadmin/venues/{venueId}/Zones/{id} - Delete zone
  delete: async (venueId, zoneId) => {
    const response = await superAdminApi.delete(`/superadmin/venues/${venueId}/Zones/${zoneId}`);
    return response.data;
  }
};

// Category Management APIs - Based on swagger.json endpoints
export const categoryApi = {
  // GET /api/superadmin/venues/{venueId}/Categories - Get categories for a venue
  getByVenue: async (venueId) => {
    const response = await superAdminApi.get(`/superadmin/venues/${venueId}/Categories`);
    return response.data;
  },

  // POST /api/superadmin/venues/{venueId}/Categories - Create category
  create: async (venueId, categoryData) => {
    const response = await superAdminApi.post(`/superadmin/venues/${venueId}/Categories`, categoryData);
    return response.data;
  },

  // GET /api/superadmin/venues/{venueId}/Categories/{id} - Get category details
  getById: async (venueId, categoryId) => {
    const response = await superAdminApi.get(`/superadmin/venues/${venueId}/Categories/${categoryId}`);
    return response.data;
  },

  // PUT /api/superadmin/venues/{venueId}/Categories/{id} - Update category
  update: async (venueId, categoryId, categoryData) => {
    const response = await superAdminApi.put(`/superadmin/venues/${venueId}/Categories/${categoryId}`, categoryData);
    return response.data;
  },

  // DELETE /api/superadmin/venues/{venueId}/Categories/{id} - Delete category
  delete: async (venueId, categoryId) => {
    const response = await superAdminApi.delete(`/superadmin/venues/${venueId}/Categories/${categoryId}`);
    return response.data;
  }
};

// Product Management APIs - Based on swagger.json endpoints
export const productApi = {
  // GET /api/superadmin/categories/{categoryId}/Products - Get products for a category
  getByCategory: async (categoryId) => {
    const response = await superAdminApi.get(`/superadmin/categories/${categoryId}/Products`);
    return response.data;
  },

  // POST /api/superadmin/categories/{categoryId}/Products - Create product
  create: async (categoryId, productData) => {
    const response = await superAdminApi.post(`/superadmin/categories/${categoryId}/Products`, productData);
    return response.data;
  },

  // GET /api/superadmin/categories/{categoryId}/Products/{id} - Get product details
  getById: async (categoryId, productId) => {
    const response = await superAdminApi.get(`/superadmin/categories/${categoryId}/Products/${productId}`);
    return response.data;
  },

  // PUT /api/superadmin/categories/{categoryId}/Products/{id} - Update product
  update: async (categoryId, productId, productData) => {
    const response = await superAdminApi.put(`/superadmin/categories/${categoryId}/Products/${productId}`, productData);
    return response.data;
  },

  // DELETE /api/superadmin/categories/{categoryId}/Products/{id} - Delete product
  delete: async (categoryId, productId) => {
    const response = await superAdminApi.delete(`/superadmin/categories/${categoryId}/Products/${productId}`);
    return response.data;
  }
};

export default {
  business: businessApi,
  staff: staffApi,
  venue: venueApi,
  category: categoryApi,
  product: productApi
};