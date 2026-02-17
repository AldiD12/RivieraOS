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
    // Try multiple token storage locations for compatibility
    const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Business API call with token:', config.method.toUpperCase(), config.url);
      console.log('🔐 Token preview:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No authentication token found for business API call');
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
    console.log('✅ Business API success:', response.config.method.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Business API error:', error.response?.status, error.response?.data);
    
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
// BUSINESS PROFILE API
// =============================================================================

export const profileApi = {
  // Get business profile
  get: async () => {
    console.log('📤 Getting business profile');
    const response = await api.get('/business/Profile');
    return response.data;
  },

  // Update business profile
  update: async (profileData) => {
    console.log('📤 Updating business profile:', profileData);
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
    console.log('📤 Getting business staff list');
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
      pin: staffData.pin
    };
    
    console.log('📤 Creating business staff member:', {
      email: apiData.email,
      password: '************',
      fullName: apiData.fullName,
      phoneNumber: apiData.phoneNumber,
      role: apiData.role,
      pin: '****'
    });
    
    try {
      const response = await api.post('/business/Staff', apiData);
      console.log('✅ Staff member created successfully');
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
    console.log('📤 Getting business staff member:', staffId);
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
      pin: (staffData.pin && staffData.pin.trim() !== '') ? staffData.pin : undefined
    };
    
    console.log('📤 Updating business staff member:', staffId, {
      email: apiData.email,
      fullName: apiData.fullName,
      phoneNumber: apiData.phoneNumber,
      role: apiData.role,
      isActive: apiData.isActive,
      pin: apiData.pin ? '****' : 'not changing'
    });
    
    const response = await api.put(`/business/Staff/${staffId}`, apiData);
    return response.data;
  },

  // Delete staff member
  delete: async (staffId) => {
    console.log('📤 Deleting business staff member:', staffId);
    const response = await api.delete(`/business/Staff/${staffId}`);
    return response.data;
  },

  // Activate/deactivate staff member
  activate: async (staffId) => {
    console.log('📤 Activating business staff member:', staffId);
    const response = await api.post(`/business/Staff/${staffId}/activate`);
    return response.data;
  },

  // Reset staff password
  resetPassword: async (staffId, newPassword) => {
    console.log('📤 Resetting business staff password:', staffId);
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
    console.log('📤 Setting business staff PIN:', staffId);
    const response = await api.post(`/business/Staff/${staffId}/set-pin`, { pin });
    return response.data;
  },

  // Delete staff PIN
  deletePin: async (staffId) => {
    console.log('📤 Deleting business staff PIN:', staffId);
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
    console.log('📤 Getting business categories');
    const response = await api.get('/business/Categories');
    return response.data;
  },

  // Create new category
  create: async (categoryData) => {
    console.log('📤 Creating business category:', categoryData);
    const response = await api.post('/business/Categories', categoryData);
    return response.data;
  },

  // Get category details
  get: async (categoryId) => {
    console.log('📤 Getting business category:', categoryId);
    const response = await api.get(`/business/Categories/${categoryId}`);
    return response.data;
  },

  // Update category
  update: async (categoryId, categoryData) => {
    console.log('📤 Updating business category:', categoryId, categoryData);
    const response = await api.put(`/business/Categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category
  delete: async (categoryId) => {
    console.log('📤 Deleting business category:', categoryId);
    const response = await api.delete(`/business/Categories/${categoryId}`);
    return response.data;
  },

  // Set category exclusions
  setExclusions: async (categoryId, venueIds) => {
    console.log('📤 Setting business category exclusions:', categoryId, venueIds);
    const response = await api.post(`/business/Categories/${categoryId}/exclusions`, venueIds);
    return response.data;
  },

  // Get category exclusions
  getExclusions: async (categoryId) => {
    console.log('📤 Getting business category exclusions:', categoryId);
    const response = await api.get(`/business/Categories/${categoryId}/exclusions`);
    return response.data;
  },

  // Set category exclusions (replaces all exclusions)
  setExclusions: async (categoryId, venueIds) => {
    console.log('📤 Setting business category exclusions:', categoryId, venueIds);
    const response = await api.post(`/business/Categories/${categoryId}/exclusions`, venueIds);
    return response.data;
  }
};

// =============================================================================
// BUSINESS PRODUCTS API
// =============================================================================

export const businessProductApi = {
  // Get all products for a category
  list: async (categoryId) => {
    console.log('📤 Getting business products for category:', categoryId);
    const response = await api.get(`/business/categories/${categoryId}/Products`);
    return response.data;
  },

  // Create new product
  create: async (categoryId, productData) => {
    console.log('📤 Creating business product:', categoryId, productData);
    console.log('🖼️ Product imageUrl being sent:', productData.imageUrl);
    const response = await api.post(`/business/categories/${categoryId}/Products`, productData);
    return response.data;
  },

  // Get product details
  get: async (categoryId, productId) => {
    console.log('📤 Getting business product:', categoryId, productId);
    const response = await api.get(`/business/categories/${categoryId}/Products/${productId}`);
    return response.data;
  },

  // Update product
  update: async (categoryId, productId, productData) => {
    console.log('📤 Updating business product:', categoryId, productId, productData);
    console.log('🖼️ Product imageUrl being sent:', productData.imageUrl);
    const response = await api.put(`/business/categories/${categoryId}/Products/${productId}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (categoryId, productId) => {
    console.log('📤 Deleting business product:', categoryId, productId);
    const response = await api.delete(`/business/categories/${categoryId}/Products/${productId}`);
    return response.data;
  },

  // Toggle product availability
  toggleAvailable: async (categoryId, productId) => {
    console.log('📤 Toggling business product availability:', categoryId, productId);
    const response = await api.post(`/business/categories/${categoryId}/Products/${productId}/toggle-available`);
    return response.data;
  },

  // Set product exclusions
  setExclusions: async (categoryId, productId, venueIds) => {
    console.log('📤 Setting business product exclusions:', categoryId, productId, venueIds);
    const response = await api.post(`/business/categories/${categoryId}/Products/${productId}/exclusions`, venueIds);
    return response.data;
  },

  // Get product exclusions
  getExclusions: async (categoryId, productId) => {
    console.log('📤 Getting business product exclusions:', categoryId, productId);
    const response = await api.get(`/business/categories/${categoryId}/Products/${productId}/exclusions`);
    return response.data;
  },

  // Set product exclusions (replaces all exclusions)
  setExclusions: async (categoryId, productId, venueIds) => {
    console.log('📤 Setting business product exclusions:', categoryId, productId, venueIds);
    const response = await api.post(`/business/categories/${categoryId}/Products/${productId}/exclusions`, venueIds);
    return response.data;
  }
};

// =============================================================================
// BUSINESS VENUES API
// =============================================================================

export const businessVenueApi = {
  // Get all venues for the business
  list: async () => {
    console.log('📤 Getting business venues');
    const response = await api.get('/business/Venues');
    return response.data;
  },

  // Create new venue
  create: async (venueData) => {
    console.log('📤 Creating business venue:', venueData);
    const response = await api.post('/business/Venues', venueData);
    return response.data;
  },

  // Get venue details
  get: async (venueId) => {
    console.log('📤 Getting business venue:', venueId);
    const response = await api.get(`/business/Venues/${venueId}`);
    return response.data;
  },

  // Update venue
  update: async (venueId, venueData) => {
    console.log('📤 Updating business venue:', venueId, venueData);
    const response = await api.put(`/business/Venues/${venueId}`, venueData);
    return response.data;
  },

  // Delete venue
  delete: async (venueId) => {
    console.log('📤 Deleting business venue:', venueId);
    const response = await api.delete(`/business/Venues/${venueId}`);
    return response.data;
  },

  // Toggle venue active status
  toggleActive: async (venueId) => {
    console.log('📤 Toggling business venue active status:', venueId);
    const response = await api.post(`/business/Venues/${venueId}/toggle-active`);
    return response.data;
  },

  // Get venue config
  getConfig: async (venueId) => {
    console.log('📤 Getting business venue config:', venueId);
    const response = await api.get(`/business/Venues/${venueId}/config`);
    return response.data;
  },

  // Update venue config
  updateConfig: async (venueId, configData) => {
    console.log('📤 Updating business venue config:', venueId, configData);
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
    console.log('📤 Getting business zones for venue:', venueId);
    const response = await api.get(`/business/venues/${venueId}/Zones`);
    return response.data;
  },

  // Create new zone
  create: async (venueId, zoneData) => {
    console.log('📤 Creating business zone:', venueId, zoneData);
    const response = await api.post(`/business/venues/${venueId}/Zones`, zoneData);
    return response.data;
  },

  // Get zone details
  get: async (venueId, zoneId) => {
    console.log('📤 Getting business zone:', venueId, zoneId);
    const response = await api.get(`/business/venues/${venueId}/Zones/${zoneId}`);
    return response.data;
  },

  // Update zone
  update: async (venueId, zoneId, zoneData) => {
    console.log('📤 Updating business zone:', venueId, zoneId, zoneData);
    const response = await api.put(`/business/venues/${venueId}/Zones/${zoneId}`, zoneData);
    return response.data;
  },

  // Delete zone
  delete: async (venueId, zoneId) => {
    console.log('📤 Deleting business zone:', venueId, zoneId);
    const response = await api.delete(`/business/venues/${venueId}/Zones/${zoneId}`);
    return response.data;
  },

  // Toggle zone active status
  toggleActive: async (venueId, zoneId) => {
    console.log('📤 Toggling zone active status:', venueId, zoneId);
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
    console.log('📤 Getting business units for venue:', venueId);
    const response = await api.get(`/business/venues/${venueId}/Units`);
    return response.data;
  },

  // Create new unit
  create: async (venueId, unitData) => {
    console.log('📤 Creating business unit:', venueId, unitData);
    const response = await api.post(`/business/venues/${venueId}/Units`, unitData);
    return response.data;
  },

  // Bulk create units
  bulkCreate: async (venueId, bulkData) => {
    console.log('📤 Bulk creating business units:', venueId, bulkData);
    const response = await api.post(`/business/venues/${venueId}/Units/bulk`, bulkData);
    return response.data;
  },

  // Get unit details
  get: async (venueId, unitId) => {
    console.log('📤 Getting business unit:', venueId, unitId);
    const response = await api.get(`/business/venues/${venueId}/Units/${unitId}`);
    return response.data;
  },

  // Update unit
  update: async (venueId, unitId, unitData) => {
    console.log('📤 Updating business unit:', venueId, unitId, unitData);
    const response = await api.put(`/business/venues/${venueId}/Units/${unitId}`, unitData);
    return response.data;
  },

  // Delete unit
  delete: async (venueId, unitId) => {
    console.log('📤 Deleting business unit:', venueId, unitId);
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
    
    console.log('📤 Getting business bookings:', url);
    const response = await api.get(url);
    return response.data;
  },

  // Get booking details
  get: async (bookingId) => {
    console.log('📤 Getting business booking:', bookingId);
    const response = await api.get(`/business/Bookings/${bookingId}`);
    return response.data;
  },

  // Create new booking
  create: async (bookingData) => {
    console.log('📤 Creating business booking:', bookingData);
    const response = await api.post('/business/Bookings', bookingData);
    return response.data;
  },

  // Update booking
  update: async (bookingId, bookingData) => {
    console.log('📤 Updating business booking:', bookingId, bookingData);
    const response = await api.put(`/business/Bookings/${bookingId}`, bookingData);
    return response.data;
  },

  // Delete booking
  delete: async (bookingId) => {
    console.log('📤 Deleting business booking:', bookingId);
    const response = await api.delete(`/business/Bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status
  updateStatus: async (bookingId, status) => {
    console.log('📤 Updating business booking status:', bookingId, status);
    const response = await api.put(`/business/Bookings/${bookingId}/status`, { status });
    return response.data;
  },

  // Check-in guest
  checkIn: async (bookingId) => {
    console.log('📤 Checking in business booking:', bookingId);
    const response = await api.put(`/business/Bookings/${bookingId}/checkin`);
    return response.data;
  },

  // Check-out guest
  checkOut: async (bookingId) => {
    console.log('📤 Checking out business booking:', bookingId);
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
    
    console.log('📤 Getting business orders:', url);
    const response = await api.get(url);
    return response.data;
  },

  // Get active orders
  getActive: async (venueId = null) => {
    const url = venueId 
      ? `/business/Orders/active?venueId=${venueId}` 
      : '/business/Orders/active';
    
    console.log('📤 Getting active business orders:', url);
    const response = await api.get(url);
    return response.data;
  },

  // Get order details
  get: async (orderId) => {
    console.log('📤 Getting business order:', orderId);
    const response = await api.get(`/business/Orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateStatus: async (orderId, statusData) => {
    console.log('📤 Updating business order status:', orderId, statusData);
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
    console.log('📤 Getting business dashboard data');
    const response = await api.get('/business/Dashboard');
    return response.data;
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
  dashboard: businessDashboardApi
};