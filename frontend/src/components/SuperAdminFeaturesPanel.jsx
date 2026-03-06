/**
 * SuperAdmin Features Panel - "The Breaker Panel"
 * God Mode toggles for controlling business features
 * Industrial Minimalist Design for Staff-Facing Interface
 */

import { useState, useEffect } from 'react';
import { useSuperAdminFeatures } from '../store/businessStore';

export function SuperAdminFeaturesPanel({ businessId, businessName, onClose }) {
  const { updateFeatures, loading, error } = useSuperAdminFeatures();
  
  // Local state for the toggles
  const [features, setFeatures] = useState({
    hasDigitalMenu: false,
    hasTableOrdering: false,
    hasBookings: false,
    hasEvents: false,
    hasPulse: false
  });
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  // Fetch current features when panel opens
  useEffect(() => {
    const fetchCurrentFeatures = async () => {
      try {
        setLoadingFeatures(true);
        
        // Validate business ID
        if (!businessId || businessId <= 0) {
          throw new Error('Invalid business ID provided');
        }
        
        console.log(`📡 Loading features for business ${businessId}`);
        
        // Fetch current business features from the API
        const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const response = await fetch(`https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/Features/business/${businessId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 404) {
          console.warn(`⚠️ Business ID ${businessId} not found - using default features`);
          // Use default features for non-existent business
          setFeatures({
            hasDigitalMenu: false,
            hasTableOrdering: false,
            hasBookings: false,
            hasEvents: false,
            hasPulse: false
          });
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Handle different response types
        let data = null;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text.trim()) {
            data = JSON.parse(text);
          }
        }
        
        if (data) {
          console.log('✅ Current business features loaded:', data);
          setFeatures({
            hasDigitalMenu: data.hasDigitalMenu || false,
            hasTableOrdering: data.hasTableOrdering || false,
            hasBookings: data.hasBookings || false,
            hasEvents: data.hasEvents || false,
            hasPulse: data.hasPulse || false
          });
        } else {
          // Fallback to defaults if no data
          console.warn('⚠️ No feature data received - using defaults');
          setFeatures({
            hasDigitalMenu: false,
            hasTableOrdering: false,
            hasBookings: false,
            hasEvents: false,
            hasPulse: false
          });
        }
        
      } catch (err) {
        console.error('Failed to load current features:', err);
        // Use default features on any error
        setFeatures({
          hasDigitalMenu: false,
          hasTableOrdering: false,
          hasBookings: false,
          hasEvents: false,
          hasPulse: false
        });
      } finally {
        setLoadingFeatures(false);
      }
    };
    
    if (businessId) {
      fetchCurrentFeatures();
    }
  }, [businessId]);

  // Handle individual toggle changes
  const handleToggle = (featureName) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Save changes to backend
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Validate business ID
      if (!businessId || businessId <= 0) {
        throw new Error('Invalid business ID provided');
      }
      
      console.log('💾 Saving features:', { businessId, features });
      
      await updateFeatures(businessId, features);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to save features:', err);
      
      // Provide specific error messages
      if (err.message.includes('404')) {
        setSaveError(`Business ID ${businessId} not found. Please verify this business exists in the system.`);
      } else if (err.message.includes('403')) {
        setSaveError('Permission denied. You may not have access to modify this business\'s features.');
      } else if (err.message.includes('401')) {
        setSaveError('Authentication failed. Please login again as SuperAdmin.');
      } else {
        setSaveError(err.message || 'Failed to save features. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Feature definitions with descriptions
  const featureDefinitions = [
    {
      key: 'hasDigitalMenu',
      name: 'Digital Menu',
      description: 'QR code menu access and browsing',
      icon: '📱'
    },
    {
      key: 'hasTableOrdering',
      name: 'Table Ordering',
      description: 'Direct ordering from tables via QR codes',
      icon: '🛒'
    },
    {
      key: 'hasBookings',
      name: 'Bookings & Reservations',
      description: 'Sunbed and table reservation system',
      icon: '📅'
    },
    {
      key: 'hasEvents',
      name: 'Events Management',
      description: 'Nightlife events and party management',
      icon: '🎉'
    },
    {
      key: 'hasPulse',
      name: 'Pulse Analytics',
      description: 'Advanced analytics and insights dashboard',
      icon: '📊'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Feature Control Panel</h2>
            <p className="text-zinc-400 mt-1">Business: {businessName}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
              <span>⚠️</span>
              <span>God Mode Access</span>
            </div>
            <p className="text-red-300 text-sm">
              These toggles control core business functionality. Changes take effect immediately and impact customer experience.
            </p>
          </div>

          {/* Feature Toggles */}
          {loadingFeatures ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-zinc-700 pb-2">
                Business Features
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-zinc-400">
                  <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                  <span>Loading current feature settings...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-zinc-700 pb-2">
                Business Features
              </h3>
              
              {featureDefinitions.map((feature) => (
                <div 
                  key={feature.key}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <h4 className="text-white font-medium">{feature.name}</h4>
                        <p className="text-zinc-400 text-sm">{feature.description}</p>
                      </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(feature.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                        features[feature.key] 
                          ? 'bg-green-600' 
                          : 'bg-zinc-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          features[feature.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      features[feature.key] ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-xs font-mono ${
                      features[feature.key] ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {features[feature.key] ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status Messages */}
          {saveError && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <span>❌</span>
                <span className="font-medium">Save Failed</span>
              </div>
              <p className="text-red-300 text-sm mt-1">{saveError}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <span>✅</span>
                <span className="font-medium">Changes Saved</span>
              </div>
              <p className="text-green-300 text-sm mt-1">
                Feature settings have been updated successfully.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}