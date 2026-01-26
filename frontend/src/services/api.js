import axios from 'axios';

// Use environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://riviera-api.onrender.com/api'
  : 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu API
export const getMenu = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const toggleMenuItemAvailability = async (menuItemId) => {
  const response = await api.patch(`/menu/${menuItemId}/toggle-availability`);
  return response.data;
};

// Reports API
export const getDailyReport = async () => {
  const response = await api.get('/reports/daily');
  return response.data;
};

// Orders API
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Bill API
export const getTableBill = async (tableId) => {
  const response = await api.get(`/bill/${tableId}`);
  return response.data;
};

export const payTable = async (tableId) => {
  const response = await api.post(`/bill/${tableId}/pay`);
  return response.data;
};

export const getAllTablesStatus = async () => {
  const response = await api.get('/bill/tables/status');
  return response.data;
};
