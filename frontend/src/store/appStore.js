/**
 * App Store - Context-Aware Routing State Management
 * Manages SPOT MODE (on-site) vs DISCOVER MODE (off-site)
 * Industrial Grade: Zustand with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export const useAppStore = create(
  persist(
    (set, get) => ({
      // App mode: 'SPOT' | 'DISCOVER'
      mode: 'DISCOVER',
      
      // Session data
      session: null,
      
      // Actions
      setMode: (mode) => {
        console.log(`🔄 Mode switched to: ${mode}`);
        set({ mode });
      },
      
      /**
       * Get time context based on current hour
       * DAY = 6:00 AM to 5:59 PM, NIGHT = 6:00 PM to 5:59 AM
       * @returns {'DAY' | 'NIGHT'}
       */
      getTimeContext: () => {
        const hour = new Date().getHours();
        return (hour >= 6 && hour < 18) ? 'DAY' : 'NIGHT';
      },
      
      /**
       * Start new session when QR code is scanned
       * @param {string} venueId - Venue ID from QR
       * @param {string} unitId - Unit ID from QR
       * @param {string} venueName - Venue name for display
       */
      startSession: (venueId, unitId, venueName = '') => {
        const hour = new Date().getHours();
        const session = {
          venueId,
          unitId,
          venueName,
          venueType: '',         // Enriched later: 'BEACH' | 'RESTAURANT' | 'BAR' etc.
          businessId: null,      // Enriched later: for "Home Team Advantage"
          timeOfDay: (hour >= 6 && hour < 18) ? 'DAY' : 'NIGHT',
          startTime: Date.now(),
          manuallyExited: false
        };
        
        console.log('✅ Session started:', { venueId, unitId, venueName, timeOfDay: session.timeOfDay });
        
        set({
          mode: 'SPOT',
          session
        });
        
        return session;
      },
      
      /**
       * Enrich session with venue details after fetch
       * Called by SpotPage once venue data is loaded
       * @param {string} venueType - Venue type (Beach, Restaurant, Bar, etc.)
       * @param {string|number} businessId - Business ID for Home Team Advantage
       */
      enrichSession: (venueType, businessId) => {
        const { session } = get();
        if (session) {
          const enriched = {
            ...session,
            venueType: (venueType || '').toUpperCase(),
            businessId: businessId || null,
          };
          console.log('🏖️ Session enriched:', { venueType: enriched.venueType, businessId: enriched.businessId, timeOfDay: enriched.timeOfDay });
          set({ session: enriched });
        }
      },
      
      /**
       * Manual exit - user clicks "Leave Venue" / "Powered by XIXA"
       */
      exitSession: () => {
        const { session } = get();
        
        if (session) {
          console.log('🚪 Session manually exited');
          
          set({
            mode: 'DISCOVER',
            session: {
              ...session,
              manuallyExited: true
            }
          });
        }
      },
      
      /**
       * Clear session completely
       */
      clearSession: () => {
        console.log('🗑️ Session cleared');
        set({
          mode: 'DISCOVER',
          session: null
        });
      },
      
      /**
       * Check if session is active
       * @returns {boolean}
       */
      isSessionActive: () => {
        const { session } = get();
        
        if (!session) return false;
        
        // Check manual exit flag
        if (session.manuallyExited) {
          console.log('⚠️ Session manually exited');
          return false;
        }
        
        // Check 4-hour expiry
        const elapsed = Date.now() - session.startTime;
        const isActive = elapsed < FOUR_HOURS;
        
        if (!isActive) {
          console.log('⚠️ Session expired (> 4 hours)');
        }
        
        return isActive;
      },
      
      /**
       * Get session duration in minutes
       * @returns {number}
       */
      getSessionDuration: () => {
        const { session } = get();
        if (!session) return 0;
        
        const elapsed = Date.now() - session.startTime;
        return Math.floor(elapsed / (60 * 1000));
      },
      
      /**
       * Get remaining session time in minutes
       * @returns {number}
       */
      getRemainingTime: () => {
        const { session } = get();
        if (!session) return 0;
        
        const elapsed = Date.now() - session.startTime;
        const remaining = FOUR_HOURS - elapsed;
        return Math.max(0, Math.floor(remaining / (60 * 1000)));
      }
    }),
    {
      name: 'riviera-app-store',
      partialize: (state) => ({
        mode: state.mode,
        session: state.session
      })
    }
  )
);
