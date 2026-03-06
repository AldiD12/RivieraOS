import * as signalR from '@microsoft/signalr';

// Use environment variable in production, localhost in development
import { API_CONFIG } from './apiConfig.js';

const HUB_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || API_CONFIG.BASE_URL.replace('/api', '')) + '/hubs/beach'
  : API_CONFIG.BASE_URL.replace('/api', '') + '/hubs/beach';

export const createConnection = () => {
  // Get auth token from localStorage
  const token = localStorage.getItem('authToken');
  
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => token || '',
      // Add query string token as fallback (as configured in backend)
      ...(token && { 
        headers: { 'Authorization': `Bearer ${token}` },
        // Also send via query string as backend expects
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry intervals
    .configureLogging(signalR.LogLevel.Information)
    .build();

  return connection;
};

export const startConnection = async (connection) => {
  try {
    console.log('🔄 Starting SignalR connection to:', HUB_URL);
    await connection.start();
    console.log('✅ SignalR Connected successfully');
    return true;
  } catch (err) {
    console.error('❌ SignalR Connection Error:', err);
    console.error('🔍 Connection details:', {
      url: HUB_URL,
      state: connection.state,
      error: err.message
    });
    return false;
  }
};

export const joinAdminGroup = async (connection) => {
  try {
    await connection.invoke('JoinAdminGroup');
    console.log('Joined Admin Group');
  } catch (err) {
    console.error('Error joining admin group: ', err);
  }
};

export const joinTableGroup = async (connection, tableNumber) => {
  try {
    await connection.invoke('JoinTableGroup', tableNumber);
    console.log(`Joined Table ${tableNumber} Group`);
  } catch (err) {
    console.error('Error joining table group: ', err);
  }
};
