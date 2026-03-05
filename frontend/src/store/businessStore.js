/**
 * Business Features Store - "God Mode" Toggles & Access Control
 * Manages business feature flags and access control
 * Integrates with Prof Kristi's BusinessFeature API endpoints
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export const useBusinessStore = create(
  persist(
    (set, get) => ({
      // Business features - The "God Mode" toggles
      features: {
        hasDigitalMenu: false,
        hasTableOrdering: false,
        hasBookings: false,
        hasEvents: false,
        hasPulse: false
      },
      
      // Loading states
      featuresLoading: false,
      featuresError: null,
      
      // Business profile data
      businessProfile: null,
      
      /**
       * Fetch business features for the logged-in venue
       * Endpoint: GET /api/business/profile/features
       */
      fetchFeatures: async () => {
        try {
          set({ featuresLoading: true, featuresError: null });
          
          const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          console.log('🔄 Fetching business features...');
          
          const response = await fetch(`${API_BASE_URL}/business/Profile/features`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Handle different response types
          let data = null;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            // Only parse as JSON if content-type indicates JSON
            const text = await response.text();
            if (text.trim()) {
              data = JSON.parse(text);
            }
          } else {
            // For non-JSON responses, just get the text
            data = await response.text();
          }
          
          console.log('✅ Business features loaded:', data);
          
          set({ 
            features: data,
            featuresLoading: false,
            featuresError: null
          });
          
          return data;
        } catch (error) {
          console.error('❌ Failed to load business features:', error);
          set({ 
            featuresLoading: false,
            featuresError: error.message
          });
          
          // Return default features on error
          return get().features;
        }
      },
      
      /**
       * Update business features (SuperAdmin only)
       * Endpoint: PATCH /api/superadmin/Features/{businessId}
       */
      updateFeatures: async (businessId, featureUpdates) => {
        try {
          set({ featuresLoading: true, featuresError: null });
          
          const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          console.log('🔄 Updating business features:', { businessId, featureUpdates });
          
          const response = await fetch(`${API_BASE_URL}/superadmin/Features/business/${businessId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(featureUpdates)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Handle different response types
          let data = null;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            // Only parse as JSON if content-type indicates JSON
            const text = await response.text();
            if (text.trim()) {
              data = JSON.parse(text);
            }
          } else {
            // For non-JSON responses (like 204 No Content), just get the text
            data = await response.text();
          }
          
          console.log('✅ Business features updated:', data);
          
          set({ 
            featuresLoading: false,
            featuresError: null
          });
          
          return data;
        } catch (error) {
          console.error('❌ Failed to update business features:', error);
          set({ 
            featuresLoading: false,
            featuresError: error.message
          });
          throw error;
        }
      },
      
      /**
       * Check if a specific feature is enabled
       * @param {string} featureName - Feature to check (hasEvents, hasBookings, etc.)
       * @returns {boolean}
       */
      hasFeature: (featureName) => {
        const { features } = get();
        return Boolean(features[featureName]);
      },
      
      /**
       * Check if multiple features are enabled
       * @param {string[]} featureNames - Features to check
       * @returns {boolean} - True if ALL features are enabled
       */
      hasAllFeatures: (featureNames) => {
        const { features } = get();
        return featureNames.every(feature => Boolean(features[feature]));
      },
      
      /**
       * Check if any of the features are enabled
       * @param {string[]} featureNames - Features to check
       * @returns {boolean} - True if ANY feature is enabled
       */
      hasAnyFeature: (featureNames) => {
        const { features } = get();
        return featureNames.some(feature => Boolean(features[feature]));
      },
      
      /**
       * Get feature status summary
       * @returns {object} - Summary of enabled/disabled features
       */
      getFeatureSummary: () => {
        const { features } = get();
        const enabled = Object.entries(features).filter(([_, value]) => value).map(([key]) => key);
        const disabled = Object.entries(features).filter(([_, value]) => !value).map(([key]) => key);
        
        return {
          enabled,
          disabled,
          totalEnabled: enabled.length,
          totalDisabled: disabled.length
        };
      },
      
      /**
       * Reset features to default state
       */
      resetFeatures: () => {
        set({
          features: {
            hasDigitalMenu: false,
            hasTableOrdering: false,
            hasBookings: false,
            hasEvents: false,
            hasPulse: false
          },
          featuresError: null
        });
      },
      
      /**
       * Set business profile data
       */
      setBusinessProfile: (profile) => {
        set({ businessProfile: profile });
      }
    }),
    {
      name: 'riviera-business-store',
      partialize: (state) => ({
        features: state.features,
        businessProfile: state.businessProfile
      })
    }
  )
);

// Export convenience hooks
export const useBusinessFeatures = () => {
  const store = useBusinessStore();
  return {
    features: store.features,
    loading: store.featuresLoading,
    error: store.featuresError,
    hasFeature: store.hasFeature,
    hasAllFeatures: store.hasAllFeatures,
    hasAnyFeature: store.hasAnyFeature,
    fetchFeatures: store.fetchFeatures,
    getFeatureSummary: store.getFeatureSummary
  };
};

export const useSuperAdminFeatures = () => {
  const store = useBusinessStore();
  return {
    features: store.features,
    loading: store.featuresLoading,
    error: store.featuresError,
    updateFeatures: store.updateFeatures,
    getFeatureSummary: store.getFeatureSummary
  };
};