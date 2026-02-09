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
    // Use the NEW database roles (Bartender, Collector) not old ones (Barman, Caderman)
    // Backend has both but StaffController only allows: Manager, Bartender, Collector
    const apiData = {
      email: staffData.email, // Use provided email directly
      password: staffData.password, // Use provided password directly
      fullName: staffData.fullName || '',
      phoneNumber: staffData.phoneNumber,
      role: staffData.role, // Use role as-is (Manager, Bartender, Collector)
      pin: staffData.pin // 4-digit PIN for login
    };
    
    console.log('📤 Creating staff with data:', {
      email: apiData.email,
      password: '****', // Hide password in logs
      fullName: apiData.fullName,
      phoneNumber: apiData.phoneNumber,
      role: apiData.role,
      pin: '****', // Hide PIN in logs
      originalPin: staffData.pin
    });
    
    try {
      const response = await superAdminApi.post(`/superadmin/businesses/${businessId}/Users`, apiData);
      return response.data;
    } catch (error) {
      console.error('❌ Staff creation failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        sentData: {
          email: apiData.email,
          phoneNumber: apiData.phoneNumber,
          role: apiData.role,
          fullName: apiData.fullName,
          hasPin: !!apiData.pin,
          passwordLength: apiData.password.length
        }
      });
      throw error;
    }
  },

  // GET /api/superadmin/businesses/{businessId}/Users/{id} - Get staff details
  getById: async (businessId, staffId) => {
    const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Users/${staffId}`);
    return response.data;
  },

  // PUT /api/superadmin/businesses/{businessId}/Users/{id} - Update staff member
  update: async (businessId, staffId, staffData) => {
    // Use the NEW database roles (Bartender, Collector) not old ones (Barman, Caderman)
    const apiData = {
      email: staffData.email || `${staffData.phoneNumber}@staff.local`, // Use provided email or generate from phone
      fullName: staffData.fullName || '',
      phoneNumber: staffData.phoneNumber,
      role: staffData.role, // Use role as-is (Manager, Bartender, Collector)
      isActive: staffData.isActive !== undefined ? staffData.isActive : true,
      // Only include PIN if it's provided and not empty (to allow PIN updates)
      pin: (staffData.pin && staffData.pin.trim() !== '') ? staffData.pin : undefined
    };
    
    console.log('📤 Updating staff with data:', {
      email: apiData.email,
      fullName: apiData.fullName,
      phoneNumber: apiData.phoneNumber,
      role: apiData.role,
      isActive: apiData.isActive,
      pin: apiData.pin ? '****' : 'not changing',
      originalPin: staffData.pin
    });
    
    const response = await superAdminApi.put(`/superadmin/businesses/${businessId}/Users/${staffId}`, apiData);
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
  // Business-level category management (from API Routes Summary)
  business: {
    // GET /api/superadmin/businesses/{id}/Categories - List/create categories for business
    getByBusiness: async (businessId) => {
      const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Categories`);
      return response.data;
    },

    // POST /api/superadmin/businesses/{id}/Categories - Create category for business
    create: async (businessId, categoryData) => {
      const response = await superAdminApi.post(`/superadmin/businesses/${businessId}/Categories`, categoryData);
      return response.data;
    },

    // GET /api/superadmin/businesses/{id}/Categories/{id} - Get/update/delete category
    getById: async (businessId, categoryId) => {
      const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Categories/${categoryId}`);
      return response.data;
    },

    // PUT /api/superadmin/businesses/{id}/Categories/{id} - Update category
    update: async (businessId, categoryId, categoryData) => {
      const response = await superAdminApi.put(`/superadmin/businesses/${businessId}/Categories/${categoryId}`, categoryData);
      return response.data;
    },

    // DELETE /api/superadmin/businesses/{id}/Categories/{id} - Delete category
    delete: async (businessId, categoryId) => {
      const response = await superAdminApi.delete(`/superadmin/businesses/${businessId}/Categories/${categoryId}`);
      return response.data;
    },

    // GET /api/superadmin/businesses/{id}/Categories/{id}/exclusions - Manage venue exclusions
    getExclusions: async (businessId, categoryId) => {
      const response = await superAdminApi.get(`/superadmin/businesses/${businessId}/Categories/${categoryId}/exclusions`);
      return response.data;
    },

    // POST /api/superadmin/businesses/{id}/Categories/{id}/exclusions - Add venue exclusion
    addExclusion: async (businessId, categoryId, exclusionData) => {
      const response = await superAdminApi.post(`/superadmin/businesses/${businessId}/Categories/${categoryId}/exclusions`, exclusionData);
      return response.data;
    }
  },

  // Venue-level category management (existing endpoints)
  venue: {
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
  },

  // GET /api/superadmin/categories/{categoryId}/products/{id}/exclusions - Manage venue exclusions for products
  getExclusions: async (categoryId, productId) => {
    const response = await superAdminApi.get(`/superadmin/categories/${categoryId}/products/${productId}/exclusions`);
    return response.data;
  },

  // POST /api/superadmin/categories/{categoryId}/products/{id}/exclusions - Add venue exclusion for product
  addExclusion: async (categoryId, productId, exclusionData) => {
    const response = await superAdminApi.post(`/superadmin/categories/${categoryId}/products/${productId}/exclusions`, exclusionData);
    return response.data;
  }
};

// AdminUsers Management APIs - Based on swagger.json endpoints
export const adminUsersApi = {
  // GET /api/superadmin/AdminUsers - Get all admin users
  getAll: async () => {
    const response = await superAdminApi.get('/superadmin/AdminUsers');
    return response.data;
  },

  // POST /api/superadmin/AdminUsers - Create admin user
  create: async (adminUserData) => {
    const response = await superAdminApi.post('/superadmin/AdminUsers', adminUserData);
    return response.data;
  }
};

// Auth Management APIs - Based on swagger.json endpoints
export const authApi = {
  // POST /api/Auth/register - Register new user
  register: async (registerData) => {
    const response = await superAdminApi.post('/Auth/register', registerData);
    return response.data;
  },

  // POST /api/Auth/login - Login user
  login: async (loginData) => {
    const response = await superAdminApi.post('/Auth/login', loginData);
    return response.data;
  }
};

// Dashboard Analytics APIs - Based on swagger.json endpoints
export const dashboardApi = {
  // GET /api/superadmin/Dashboard - Get dashboard analytics
  getAnalytics: async () => {
    const response = await superAdminApi.get('/superadmin/Dashboard');
    return response.data;
  }
};

export default {
  business: businessApi,
  staff: staffApi,
  venue: venueApi,
  zone: zoneApi,
  category: categoryApi,
  product: productApi,
  adminUsers: adminUsersApi,
  auth: authApi,
  dashboard: dashboardApi
};