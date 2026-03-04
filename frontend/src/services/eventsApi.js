import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Business Admin APIs
export const businessEventsApi = {
  getEvents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/business/Events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching business events:', error);
      // Return empty array on error to prevent .map crashes
      return [];
    }
  },
  
  getEventDetails: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/business/Events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await axios.post(`${API_BASE_URL}/api/business/Events`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await axios.put(`${API_BASE_URL}/api/business/Events/${id}`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  deleteEvent: async (id) => {
    await axios.delete(`${API_BASE_URL}/api/business/Events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  publishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/business/Events/${id}/publish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  unpublishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/business/Events/${id}/unpublish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
};

// Super Admin APIs
export const superAdminEventsApi = {
  getEvents: async (page = 1, pageSize = 50) => {
    const response = await axios.get(`${API_BASE_URL}/api/superadmin/Events`, {
      params: { page, pageSize },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  getEventDetails: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/superadmin/Events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await axios.post(`${API_BASE_URL}/api/superadmin/Events`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await axios.put(`${API_BASE_URL}/api/superadmin/Events/${id}`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  deleteEvent: async (id) => {
    await axios.delete(`${API_BASE_URL}/api/superadmin/Events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  publishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/superadmin/Events/${id}/publish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  unpublishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/superadmin/Events/${id}/unpublish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  restoreEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/superadmin/Events/${id}/restore`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
};

// Public APIs (for DiscoveryPage)
export const publicEventsApi = {
  getEvents: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events`);
    return response.data;
  },
  
  getEventDetails: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events/${id}`);
    return response.data;
  },
  
  getEventsByVenue: async (venueId) => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events/venue/${venueId}`);
    return response.data;
  },
  
  getEventsByBusiness: async (businessId) => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events/business/${businessId}`);
    return response.data;
  }
};
