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

// Staff Management APIs (extending business management)
export const staffApi = {
  // Get staff for a business
  getByBusiness: async (businessId) => {
    const response = await superAdminApi.get(`/superadmin/Businesses/${businessId}/staff`);
    return response.data;
  },

  // Create staff member
  create: async (businessId, staffData) => {
    const response = await superAdminApi.post(`/superadmin/Businesses/${businessId}/staff`, staffData);
    return response.data;
  },

  // Update staff member
  update: async (businessId, staffId, staffData) => {
    const response = await superAdminApi.put(`/superadmin/Businesses/${businessId}/staff/${staffId}`, staffData);
    return response.data;
  },

  // Delete staff member
  delete: async (businessId, staffId) => {
    const response = await superAdminApi.delete(`/superadmin/Businesses/${businessId}/staff/${staffId}`);
    return response.data;
  }
};

// Venue Management APIs
export const venueApi = {
  // Get venues for a business
  getByBusiness: async (businessId) => {
    const response = await superAdminApi.get(`/superadmin/Businesses/${businessId}/venues`);
    return response.data;
  },

  // Create venue
  create: async (businessId, venueData) => {
    const response = await superAdminApi.post(`/superadmin/Businesses/${businessId}/venues`, venueData);
    return response.data;
  },

  // Update venue
  update: async (businessId, venueId, venueData) => {
    const response = await superAdminApi.put(`/superadmin/Businesses/${businessId}/venues/${venueId}`, venueData);
    return response.data;
  },

  // Delete venue
  delete: async (businessId, venueId) => {
    const response = await superAdminApi.delete(`/superadmin/Businesses/${businessId}/venues/${venueId}`);
    return response.data;
  }
};

// Product Management APIs
export const productApi = {
  // Get products for a business
  getByBusiness: async (businessId) => {
    const response = await superAdminApi.get(`/superadmin/Businesses/${businessId}/products`);
    return response.data;
  },

  // Create product
  create: async (businessId, productData) => {
    const response = await superAdminApi.post(`/superadmin/Businesses/${businessId}/products`, productData);
    return response.data;
  },

  // Update product
  update: async (businessId, productId, productData) => {
    const response = await superAdminApi.put(`/superadmin/Businesses/${businessId}/products/${productId}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (businessId, productId) => {
    const response = await superAdminApi.delete(`/superadmin/Businesses/${businessId}/products/${productId}`);
    return response.data;
  },

  // Toggle product availability
  toggleAvailability: async (businessId, productId) => {
    const response = await superAdminApi.patch(`/superadmin/Businesses/${businessId}/products/${productId}/availability`);
    return response.data;
  }
};

export default {
  business: businessApi,
  staff: staffApi,
  venue: venueApi,
  product: productApi
};