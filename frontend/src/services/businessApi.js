import axios from 'axios';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

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
    // Try multiple token storage locations for compatibility
    const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Handle empty responses (204 No Content)
    if (response.status === 204 || !response.data) {
      response.data = { success: true };
    }
    return response;
  },
  (error) => {
    console.error('❌ Business API error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
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
// BUSINESS PROFILE API
// =============================================================================

export const profileApi = {
  // Get business profile
  get: async () => {
    const response = await api.get('/business/Profile');
    return response.data;
  },

  // Update business profile
  update: async (profileData) => {
    const response = await api.put('/business/Profile', profileData);
    return response.data;
  }
};

// =============================================================================
// BUSINESS STAFF MANAGEMENT API
// =============================================================================

export const businessStaffApi = {
  // Get all staff members for the business
  list: async () => {
    const response = await api.get('/business/Staff');
    return response.data;
  },

  // Create new staff member
  create: async (staffData) => {
    // Validate required fields
    if (!staffData.email || !staffData.password || !staffData.phoneNumber || !staffData.role || !staffData.pin) {
      throw new Error('Email, password, phone number, role, and PIN are required');
    }

    // Validate PIN format (exactly 4 digits)
    if (!/^\d{4}$/.test(staffData.pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    // Validate role
    const allowedRoles = ['Manager', 'Bartender', 'Collector'];
    if (!allowedRoles.includes(staffData.role)) {
      throw new Error(`Role must be one of: ${allowedRoles.join(', ')}`);
    }

    // Send data directly to backend
    const apiData = {
      email: staffData.email,
      password: staffData.password,
      fullName: staffData.fullName || '',
      phoneNumber: staffData.phoneNumber,
      role: staffData.role,
      pin: staffData.pin,
      venueId: staffData.venueId || null // ✅ Include venueId for venue assignment
    };
    
      email: apiData.email,
      password: '************',
      fullName: apiData.fullName,
      phoneNumber: apiData.phoneNumber,
      role: apiData.role,
      pin: '****',
      venueId: apiData.venueId
    });
    
    try {
      const response = await api.post('/business/Staff', apiData);
      return response.data;
    } catch (error) {
      if (error.status === 403) {
        throw new Error('Permission denied. Your account may not have the required permissions to create staff members.');
      }
      throw error;
    }
  },

  // Get staff member details
  get: async (staffId) => {
    const response = await api.get(`/business/Staff/${staffId}`);
    return response.data;
  },

  // Update staff member
  update: async (staffId, staffData) => {
    // Validate role if provided
    if (staffData.role) {
      const allowedRoles = ['Manager', 'Bartender', 'Collector'];
      if (!allowedRoles.includes(staffData.role)) {
        throw new Error(`Role must be one of: ${allowedRoles.join(', ')}`);
      }
    }

    // Validate PIN format if provided (only if not empty)
    if (staffData.pin && staffData.pin.trim() !== '' && !/^\d{4}$/.test(staffData.pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    const apiData = {
      email: staffData.email,
      fullName: staffData.fullName || '',
      phoneNumber: staffData.phoneNumber,
      role: staffData.role,
      isActive: staffData.isActive !== undefined ? staffData.isActive : true,
      // Only include PIN if it's provided and not empty (to allow PIN updates)
      pin: (staffData.pin && staffData.pin.trim() !== '') ? staffData.pin : undefined,
      // ✅ CRITICAL FIX: Include venueId in API payload
      venueId: staffData.venueId !== undefined ? staffData.venueId : null
    };
    
      email: apiData.email,
      fullName: apiData.fullName,
      phoneNumber: apiData.phoneNumber,
      role: apiData.role,
      isActive: apiData.isActive,
      pin: apiData.pin ? '****' : 'not changing',
      venueId: apiData.venueId
    });
    
    const response = await api.put(`/business/Staff/${staffId}`, apiData);
    return response.data;
  },

  // Delete staff member
  delete: async (staffId) => {
    const response = await api.delete(`/business/Staff/${staffId}`);
    return response.data;
  },

  // Activate/deactivate staff member
  activate: async (staffId) => {
    const response = await api.post(`/business/Staff/${staffId}/activate`);
    return response.data;
  },

  // Reset staff password
  resetPassword: async (staffId, newPassword) => {
    const response = await api.post(`/business/Staff/${staffId}/reset-password`, {
      newPassword
    });
    return response.data;
  },

  // Set staff PIN
  setPin: async (staffId, pin) => {
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }
    const response = await api.post(`/business/Staff/${staffId}/set-pin`, { pin });
    return response.data;
  },

  // Delete staff PIN
  deletePin: async (staffId) => {
    const response = await api.delete(`/business/Staff/${staffId}/pin`);
    return response.data;
  }
};

// =============================================================================
// BUSINESS CATEGORIES API
// =============================================================================

export const businessCategoryApi = {
  // Get all categories for the business
  list: async () => {
    const response = await api.get('/business/Categories');
    return response.data;
  },

  // Create new category
  create: async (categoryData) => {
    const response = await api.post('/business/Categories', categoryData);
    return response.data;
  },

  // Get category details
  get: async (categoryId) => {
    const response = await api.get(`/business/Categories/${categoryId}`);
    return response.data;
  },

  // Update category
  update: async (categoryId, categoryData) => {
    const response = await api.put(`/business/Categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category
  delete: async (categoryId) => {
    const response = await api.delete(`/business/Categories/${categoryId}`);
    return response.data;
  },

  // Set category exclusions
  setExclusions: async (categoryId, venueIds) => {
    const response = await api.post(`/business/Categories/${categoryId}/exclusions`, venueIds);
    return response.data;
  },

  // Get category exclusions
  getExclusions: async (categoryId) => {
    const response = await api.get(`/business/Categories/${categoryId}/exclusions`);
    return response.data;
  },

};

// =============================================================================
// BUSINESS PRODUCTS API
// =============================================================================

export const businessProductApi = {
  // Get all products for a category
  list: async (categoryId) => {
    const response = await api.get(`/business/categories/${categoryId}/Products`);
    return response.data;
  },

  // Create new product
  create: async (categoryId, productData) => {
    const response = await api.post(`/business/categories/${categoryId}/Products`, productData);
    return response.data;
  },

  // Get product details
  get: async (categoryId, productId) => {
    const response = await api.get(`/business/categories/${categoryId}/Products/${productId}`);
    return response.data;
  },

  // Update product
  update: async (categoryId, productId, productData) => {
    const response = await api.put(`/business/categories/${categoryId}/Products/${productId}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (categoryId, productId) => {
    const response = await api.delete(`/business/categories/${categoryId}/Products/${productId}`);
    return response.data;
  },

  // Toggle product availability
  toggleAvailable: async (categoryId, productId) => {
    const response = await api.post(`/business/categories/${categoryId}/Products/${productId}/toggle-available`);
    return response.data;
  },

  // Set product exclusions
  setExclusions: async (categoryId, productId, venueIds) => {
    const response = await api.post(`/business/categories/${categoryId}/Products/${productId}/exclusions`, venueIds);
    return response.data;
  },

  // Get product exclusions
  getExclusions: async (categoryId, productId) => {
    const response = await api.get(`/business/categories/${categoryId}/Products/${productId}/exclusions`);
    return response.data;
  },

};

// =============================================================================
// BUSINESS VENUES API
// =============================================================================

export const businessVenueApi = {
  // Get all venues for the business
  list: async () => {
    const response = await api.get('/business/Venues');
    return response.data;
  },

  // Create new venue
  create: async (venueData) => {
    const response = await api.post('/business/Venues', venueData);
    return response.data;
  },

  // Get venue details
  get: async (venueId) => {
    const response = await api.get(`/business/Venues/${venueId}`);
    return response.data;
  },

  // Update venue
  update: async (venueId, venueData) => {
    const response = await api.put(`/business/Venues/${venueId}`, venueData);
    return response.data;
  },

  // Delete venue
  delete: async (venueId) => {
    const response = await api.delete(`/business/Venues/${venueId}`);
    return response.data;
  },

  // Toggle venue active status
  toggleActive: async (venueId) => {
    const response = await api.post(`/business/Venues/${venueId}/toggle-active`);
    return response.data;
  },

  // Get venue config
  getConfig: async (venueId) => {
    const response = await api.get(`/business/Venues/${venueId}/config`);
    return response.data;
  },

  // Update venue config
  updateConfig: async (venueId, configData) => {
    const response = await api.put(`/business/Venues/${venueId}/config`, configData);
    return response.data;
  }
};

// =============================================================================
// BUSINESS ZONES API
// =============================================================================

export const businessZoneApi = {
  // Get all zones for a venue
  list: async (venueId) => {
    const response = await api.get(`/business/venues/${venueId}/Zones`);
    return response.data;
  },

  // Create new zone
  create: async (venueId, zoneData) => {
    const response = await api.post(`/business/venues/${venueId}/Zones`, zoneData);
    return response.data;
  },

  // Get zone details
  get: async (venueId, zoneId) => {
    const response = await api.get(`/business/venues/${venueId}/Zones/${zoneId}`);
    return response.data;
  },

  // Update zone
  update: async (venueId, zoneId, zoneData) => {
    const response = await api.put(`/business/venues/${venueId}/Zones/${zoneId}`, zoneData);
    return response.data;
  },

  // Delete zone
  delete: async (venueId, zoneId) => {
    const response = await api.delete(`/business/venues/${venueId}/Zones/${zoneId}`);
    return response.data;
  },

  // Toggle zone active status
  toggleActive: async (venueId, zoneId) => {
    const response = await api.post(`/business/venues/${venueId}/Zones/${zoneId}/toggle-active`);
    return response.data;
  }
};

// =============================================================================
// BUSINESS UNITS API
// =============================================================================

export const businessUnitApi = {
  // Get all units for a venue
  list: async (venueId) => {
    const response = await api.get(`/business/venues/${venueId}/Units`);
    return response.data;
  },

  // Create new unit
  create: async (venueId, unitData) => {
    const response = await api.post(`/business/venues/${venueId}/Units`, unitData);
    return response.data;
  },

  // Bulk create units
  bulkCreate: async (venueId, bulkData) => {
    const response = await api.post(`/business/venues/${venueId}/Units/bulk`, bulkData);
    return response.data;
  },

  // Get unit details
  get: async (venueId, unitId) => {
    const response = await api.get(`/business/venues/${venueId}/Units/${unitId}`);
    return response.data;
  },

  // Update unit
  update: async (venueId, unitId, unitData) => {
    const response = await api.put(`/business/venues/${venueId}/Units/${unitId}`, unitData);
    return response.data;
  },

  // Delete unit
  delete: async (venueId, unitId) => {
    const response = await api.delete(`/business/venues/${venueId}/Units/${unitId}`);
    return response.data;
  }
};

// =============================================================================
// BUSINESS BOOKINGS API
// =============================================================================

export const businessBookingApi = {
  // Get all bookings with optional filters
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.venueId) params.append('venueId', filters.venueId);
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    
    const queryString = params.toString();
    const url = queryString ? `/business/Bookings?${queryString}` : '/business/Bookings';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get booking details
  get: async (bookingId) => {
    const response = await api.get(`/business/Bookings/${bookingId}`);
    return response.data;
  },

  // Create new booking
  create: async (bookingData) => {
    const response = await api.post('/business/Bookings', bookingData);
    return response.data;
  },

  // Update booking
  update: async (bookingId, bookingData) => {
    const response = await api.put(`/business/Bookings/${bookingId}`, bookingData);
    return response.data;
  },

  // Delete booking
  delete: async (bookingId) => {
    const response = await api.delete(`/business/Bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status
  updateStatus: async (bookingId, status) => {
    const response = await api.put(`/business/Bookings/${bookingId}/status`, { status });
    return response.data;
  },

  // Check-in guest
  checkIn: async (bookingId) => {
    const response = await api.put(`/business/Bookings/${bookingId}/checkin`);
    return response.data;
  },

  // Check-out guest
  checkOut: async (bookingId) => {
    const response = await api.put(`/business/Bookings/${bookingId}/checkout`);
    return response.data;
  }
};

// =============================================================================
// BUSINESS ORDERS API
// =============================================================================

export const businessOrderApi = {
  // Get all orders with optional filters
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.venueId) params.append('venueId', filters.venueId);
    if (filters.status) params.append('status', filters.status);
    if (filters.zoneId) params.append('zoneId', filters.zoneId);
    
    const queryString = params.toString();
    const url = queryString ? `/business/Orders?${queryString}` : '/business/Orders';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get active orders
  getActive: async (venueId = null) => {
    const url = venueId 
      ? `/business/Orders/active?venueId=${venueId}` 
      : '/business/Orders/active';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get order details
  get: async (orderId) => {
    const response = await api.get(`/business/Orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateStatus: async (orderId, statusData) => {
    const response = await api.put(`/business/Orders/${orderId}/status`, statusData);
    return response.data;
  }
};

// =============================================================================
// BUSINESS DASHBOARD API
// =============================================================================

export const businessDashboardApi = {
  // Get dashboard data
  get: async () => {
    const response = await api.get('/business/Dashboard');
    return response.data;
  }
};

// =============================================================================
// BUSINESS EVENTS API
// =============================================================================

export const businessEventsApi = {
  // Get all events for the business
  list: async () => {
    try {
      const response = await api.get('/business/Events');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching business events:', error);
      return [];
    }
  },
  
  // Get event details
  get: async (id) => {
    const response = await api.get(`/business/Events/${id}`);
    return response.data;
  },
  
  // Create new event
  create: async (eventData) => {
    const response = await api.post('/business/Events', eventData);
    return response.data;
  },
  
  // Update event
  update: async (id, eventData) => {
    const response = await api.put(`/business/Events/${id}`, eventData);
    return response.data;
  },
  
  // Delete event
  delete: async (id) => {
    await api.delete(`/business/Events/${id}`);
  },
  
  // Publish event
  publish: async (id) => {
    await api.post(`/business/Events/${id}/publish`, {});
  },
  
  // Unpublish event
  unpublish: async (id) => {
    await api.post(`/business/Events/${id}/unpublish`, {});
  }
};

// Export all APIs
export default {
  profile: profileApi,
  staff: businessStaffApi,
  categories: businessCategoryApi,
  products: businessProductApi,
  venues: businessVenueApi,
  zones: businessZoneApi,
  units: businessUnitApi,
  bookings: businessBookingApi,
  orders: businessOrderApi,
  dashboard: businessDashboardApi,
  events: businessEventsApi
};