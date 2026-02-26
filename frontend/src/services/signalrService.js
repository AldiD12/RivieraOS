/**
 * SignalR Service
 * Real-time connection for booking status updates
 * Industrial Grade: Auto-reconnect, error handling, logging
 */

import * as signalR from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to SignalR hub
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.isConnected) {
      console.log('📡 SignalR already connected');
      return;
    }

    try {
      console.log('📡 Connecting to SignalR...');
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/beach`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s, 60s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            if (retryContext.previousRetryCount === 3) return 30000;
            return 60000;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Setup event handlers
      this.connection.onreconnecting((error) => {
        console.log('🔄 SignalR reconnecting...', error);
        this.isConnected = false;
      });

      this.connection.onreconnected((connectionId) => {
        console.log('✅ SignalR reconnected:', connectionId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error) => {
        console.log('🔌 SignalR connection closed', error);
        this.isConnected = false;
      });

      await this.connection.start();
      this.isConnected = true;
      console.log('✅ SignalR connected');
      
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log('🔌 SignalR disconnected');
      } catch (error) {
        console.error('❌ SignalR disconnect failed:', error);
      }
    }
  }

  /**
   * Join booking group to receive updates
   * @param {string} bookingCode - Booking code to monitor
   * @returns {Promise<void>}
   */
  async joinBookingGroup(bookingCode) {
    if (!this.isConnected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('JoinBookingGroup', bookingCode);
      console.log(`📥 Joined booking group: ${bookingCode}`);
    } catch (error) {
      console.error('❌ Failed to join booking group:', error);
      throw error;
    }
  }

  /**
   * Leave booking group
   * @param {string} bookingCode - Booking code to leave
   * @returns {Promise<void>}
   */
  async leaveBookingGroup(bookingCode) {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.connection.invoke('LeaveBookingGroup', bookingCode);
      console.log(`📤 Left booking group: ${bookingCode}`);
    } catch (error) {
      console.error('❌ Failed to leave booking group:', error);
    }
  }

  /**
   * Listen for booking status changes
   * @param {Function} callback - Callback function (bookingCode, status, unitCode) => void
   */
  onBookingStatusChanged(callback) {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }

    this.connection.on('BookingStatusChanged', (bookingCode, status, unitCode) => {
      console.log('🔔 Booking status changed:', { bookingCode, status, unitCode });
      callback(bookingCode, status, unitCode);
    });
  }

  /**
   * Remove booking status change listener
   */
  offBookingStatusChanged() {
    if (this.connection) {
      this.connection.off('BookingStatusChanged');
    }
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  get connected() {
    return this.isConnected;
  }
}

// Export singleton instance
export const signalrService = new SignalRService();
export default signalrService;
