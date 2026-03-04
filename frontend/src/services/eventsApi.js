import axios from 'axios';

// Base URL for the API (hardcoded like businessApi)
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
    if (response.status === 204 || !response.data) {
      response.data = { success: true };
    }
    return response;
  },
  (error) => {
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

// Business Admin APIs
export const businessEventsApi = {
  getEvents: async () => {
    try {
      const response = await api.get('/business/Events');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching business events:', error);
      return [];
    }
  },
  
  getEventDetails: async (id) => {
    const response = await api.get(`/business/Events/${id}`);
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await api.post('/business/Events', eventData);
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/business/Events/${id}`, eventData);
    return response.data;
  },
  
  deleteEvent: async (id) => {
    await api.delete(`/business/Events/${id}`);
  },
  
  publishEvent: async (id) => {
    await api.post(`/business/Events/${id}/publish`, {});
  },
  
  unpublishEvent: async (id) => {
    await api.post(`/business/Events/${id}/unpublish`, {});
  }
};

// Super Admin APIs
export const superAdminEventsApi = {
  getEvents: async (page = 1, pageSize = 50) => {
    const response = await api.get('/superadmin/Events', {
      params: { page, pageSize }
    });
    return response.data;
  },
  
  getEventDetails: async (id) => {
    const response = await api.get(`/superadmin/Events/${id}`);
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await api.post('/superadmin/Events', eventData);
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/superadmin/Events/${id}`, eventData);
    return response.data;
  },
  
  deleteEvent: async (id) => {
    await api.delete(`/superadmin/Events/${id}`);
  },
  
  publishEvent: async (id) => {
    await api.post(`/superadmin/Events/${id}/publish`, {});
  },
  
  unpublishEvent: async (id) => {
    await api.post(`/superadmin/Events/${id}/unpublish`, {});
  },
  
  restoreEvent: async (id) => {
    await api.post(`/superadmin/Events/${id}/restore`, {});
  }
};

// Public APIs (for DiscoveryPage) - No auth needed
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicEventsApi = {
  getEvents: async () => {
    const response = await publicApi.get('/public/Events');
    return response.data;
  },
  
  getEventDetails: async (id) => {
    const response = await publicApi.get(`/public/Events/${id}`);
    return response.data;
  },
  
  getEventsByVenue: async (venueId) => {
    const response = await publicApi.get(`/public/Events/venue/${venueId}`);
    return response.data;
  },
  
  getEventsByBusiness: async (businessId) => {
    const response = await publicApi.get(`/public/Events/business/${businessId}`);
    return response.data;
  }
};
