import axios from 'axios';
import { API_CONFIG, checkApiHealth } from './apiConfig.js';
import { unifiedApi } from './azureApi.js';

// Create axios instance with dynamic base URL
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Health Check Export
export { checkApiHealth };

// Mock data for development/demo
const MOCK_DATA = {
  menu: [
    { id: 1, name: 'Mojito', price: 9.00, category: 'Cocktails', available: true },
    { id: 2, name: 'French Fries', price: 5.00, category: 'Food', available: true },
    { id: 3, name: 'Aperol Spritz', price: 8.50, category: 'Cocktails', available: true },
    { id: 4, name: 'Club Sandwich', price: 12.00, category: 'Food', available: true }
  ],
  orders: [],
  dailyReport: { totalRevenue: 450.50, ordersCount: 23, avgOrderValue: 19.59 }
};

// Helper function to handle mock vs real API calls
const apiCall = async (mockData, apiFunction) => {
  if (API_CONFIG.IS_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  }
  return await apiFunction();
};

// Menu API - Updated to use unified API
export const getMenu = async () => {
  return apiCall(MOCK_DATA.menu, async () => {
    if (API_CONFIG.IS_AZURE) {
      return await unifiedApi.getMenu();
    }
    // Local API fallback
    const response = await api.get('/menu');
    return response.data;
  });
};

export const toggleMenuItemAvailability = async (menuItemId) => {
  return apiCall(
    { success: true, message: 'Item availability toggled' },
    async () => {
      const response = await api.patch(`/menu/${menuItemId}/toggle-availability`);
      return response.data;
    }
  );
};

// Reports API
export const getDailyReport = async () => {
  return apiCall(MOCK_DATA.dailyReport, async () => {
    const response = await api.get('/reports/daily');
    return response.data;
  });
};

// Orders API
export const createOrder = async (orderData) => {
  return apiCall(
    { id: Date.now(), ...orderData, status: 'pending', createdAt: new Date() },
    async () => {
      const response = await api.post('/orders', orderData);
      return response.data;
    }
  );
};

export const getOrders = async () => {
  return apiCall(MOCK_DATA.orders, async () => {
    const response = await api.get('/orders');
    return response.data;
  });
};

export const updateOrderStatus = async (orderId, status) => {
  return apiCall(
    { success: true, orderId, status },
    async () => {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    }
  );
};

// Venues API - New for Azure integration
export const getVenues = async () => {
  return apiCall(
    [{ id: 1, name: 'Hotel Coral Beach', status: 'Open', rating: 4.8 }],
    async () => {
      if (API_CONFIG.IS_AZURE) {
        return await unifiedApi.getVenues();
      }
      // Local API fallback
      const response = await api.get('/venues');
      return response.data;
    }
  );
};

// Authentication API - Updated for Azure
export const loginUser = async (credentials) => {
  return apiCall(
    { success: true, user: { email: credentials.email, role: 'Admin' }, token: 'mock-jwt-token' },
    async () => {
      if (API_CONFIG.IS_AZURE) {
        return await unifiedApi.login(credentials);
      }
      // Local API fallback
      const response = await api.post('/auth/login', credentials);
      return response.data;
    }
  );
};

export const registerUser = async (userData) => {
  return apiCall(
    { success: true, message: 'User registered successfully' },
    async () => {
      if (API_CONFIG.IS_AZURE) {
        return await unifiedApi.register(userData);
      }
      // Local API fallback
      const response = await api.post('/auth/register', userData);
      return response.data;
    }
  );
};

// Bill API
export const getTableBill = async (tableId) => {
  return apiCall(
    { tableId, total: 45.50, items: [], status: 'open' },
    async () => {
      const response = await api.get(`/bill/${tableId}`);
      return response.data;
    }
  );
};

export const payTable = async (tableId) => {
  return apiCall(
    { success: true, tableId, paidAt: new Date() },
    async () => {
      const response = await api.post(`/bill/${tableId}/pay`);
      return response.data;
    }
  );
};

export const getAllTablesStatus = async () => {
  return apiCall(
    [{ id: 1, status: 'occupied' }, { id: 2, status: 'free' }],
    async () => {
      const response = await api.get('/bill/tables/status');
      return response.data;
    }
  );
};

// Update axios base URL if config changes
export const updateApiConfig = (newBaseUrl) => {
  api.defaults.baseURL = newBaseUrl;
};
