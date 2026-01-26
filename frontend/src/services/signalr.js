import * as signalR from '@microsoft/signalr';

// Use environment variable in production, localhost in development
const HUB_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'https://riviera-api.onrender.com').replace('/api', '') + '/hubs/beach'
  : 'http://localhost:5000/hubs/beach';

export const createConnection = () => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect()
    .build();

  return connection;
};

export const startConnection = async (connection) => {
  try {
    await connection.start();
    console.log('SignalR Connected');
    return true;
  } catch (err) {
    console.error('SignalR Connection Error: ', err);
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
