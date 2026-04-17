import * as signalR from '@microsoft/signalr';

// Strip /api suffix to get the base origin, then append hub path
// e.g. https://host.io/api → https://host.io/hubs/beach
const API_URL = import.meta.env.VITE_API_URL ||
  'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
const BASE_ORIGIN = API_URL.trim().replace(/\/+$/, '').replace(/\/api$/, '');
const HUB_URL = `${BASE_ORIGIN}/hubs/beach`;

// Token keys used throughout the app
const getToken = () =>
  localStorage.getItem('token') || localStorage.getItem('azure_jwt_token') || '';

export const createConnection = () => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      // accessTokenFactory is called fresh on every reconnect
      accessTokenFactory: getToken,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
};

export const startConnection = async (connection) => {
  try {
    await connection.start();
    return true;
  } catch (err) {
    console.error('SignalR connection failed:', err.message);
    return false;
  }
};

export const joinAdminGroup = async (connection) => {
  try {
    await connection.invoke('JoinAdminGroup');
  } catch (err) {
    console.error('Error joining admin group:', err);
  }
};

export const joinTableGroup = async (connection, tableNumber) => {
  try {
    await connection.invoke('JoinTableGroup', tableNumber);
  } catch (err) {
    console.error('Error joining table group:', err);
  }
};
