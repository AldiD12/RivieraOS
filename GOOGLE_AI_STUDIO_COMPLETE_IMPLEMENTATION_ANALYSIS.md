# 🤖 Complete Feature Toggle Implementation - For Google AI Studio Analysis

**Date:** March 6, 2026  
**Issue:** Still getting 403 Forbidden errors after backend fixes  
**For:** Google AI Studio to analyze and provide solution  

---

## 🚨 PROBLEM STATEMENT

Despite backend fixes (ProfileController policy changed from BusinessOwner to Manager, database seeded), we're still getting:
```
GET /api/business/Profile/features → 403 (Forbidden)
```

**User Context:**
- Role: Manager
- Business ID: 13
- JWT Token contains: userId: '70', email: 'dmellle@gmail.com', role: 'Manager', businessId: '13'

---

## 🏗️ COMPLETE IMPLEMENTATION DETAILS

### 1. FRONTEND IMPLEMENTATION

#### A. Zustand Store (businessStore.js)
```javascript
/**
 * Business Features Store - "God Mode" Toggles & Access Control
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      
      /**
       * Fetch business features for the logged-in venue
       * Endpoint: GET /api/business/Profile/features
       */
      fetchFeatures: async (silent = false) => {
        try {
          if (!silent) {
            set({ featuresLoading: true, featuresError: null });
          }
          
          const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          console.log('🔄 Fetching business features...');
          console.log('🔐 Token preview:', token.substring(0, 20) + '...');
          
          const response = await fetch(`${API_BASE_URL}/business/Profile/features`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('📡 Response status:', response.status);
          console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
          
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
          } else {
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
          if (!silent) {
            set({ 
              featuresLoading: false,
              featuresError: error.message
            });
          }
          
          // Return current features on error
          return get().features;
        }
      },
      
      /**
       * Check if a specific feature is enabled
       */
      hasFeature: (featureName) => {
        const { features } = get();
        return Boolean(features[featureName]);
      },
      
      /**
       * Start polling for feature changes every 30 seconds
       */
      startPolling: () => {
        const { pollingInterval, isPollingEnabled } = get();
        
        if (isPollingEnabled || pollingInterval) {
          return;
        }
        
        console.log('🔄 Starting feature polling (30s interval)...');
        
        const interval = setInterval(async () => {
          try {
            await get().fetchFeatures(true);
          } catch (error) {
            console.warn('⚠️ Polling fetch failed:', error.message);
          }
        }, 30000);
        
        set({ 
          pollingInterval: interval,
          isPollingEnabled: true
        });
      }
    }),
    {
      name: 'riviera-business-store',
      partialize: (state) => ({
        features: state.features
      })
    }
  )
);
```

#### B. Business Dashboard Integration (BusinessAdminDashboard.jsx)
```javascript
import { useBusinessStore } from '../store/businessStore';

const BusinessAdminDashboard = () => {
  const { fetchFeatures, startPolling, hasFeature } = useBusinessStore();

  useEffect(() => {
    const initializeFeatures = async () => {
      console.log('🔄 Initializing business features...');
      await fetchFeatures();
      startPolling();
    };
    
    initializeFeatures();
  }, [fetchFeatures, startPolling]);

  // Filter tabs based on features
  const tabs = [
    { id: 'overview', label: 'Overview', feature: null },
    { id: 'staff', label: 'Staff', feature: null },
    { id: 'menu', label: 'Menu', feature: 'hasDigitalMenu' },
    { id: 'venues', label: 'Venues', feature: 'hasBookings' },
    { id: 'events', label: 'Events', feature: 'hasEvents' }
  ].filter(tab => !tab.feature || hasFeature(tab.feature));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800">
        {tabs.map(tab => (
          <button key={tab.id} className="px-4 py-2">
            {tab.label}
          </button>
        ))}
      </nav>
      
      {/* Content with Feature Guards */}
      <FeatureGuard feature="hasEvents" fallback={<UpgradePrompt />}>
        <EventsTab />
      </FeatureGuard>
    </div>
  );
};
```

#### C. Feature Guard Component (FeatureGuard.jsx)
```javascript
import { useBusinessStore } from '../store/businessStore';

export function FeatureGuard({ feature, children, fallback }) {
  const { hasFeature } = useBusinessStore();
  
  if (hasFeature(feature)) {
    return children;
  }
  
  return fallback || (
    <div className="p-8 text-center">
      <h3 className="text-xl font-semibold mb-4">Feature Not Available</h3>
      <p className="text-zinc-400 mb-6">
        The {feature} feature is not enabled for your business.
      </p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded">
        Upgrade Plan
      </button>
    </div>
  );
}
```

#### D. SuperAdmin Features Panel (SuperAdminFeaturesPanel.jsx)
```javascript
export function SuperAdminFeaturesPanel({ businessId, businessName, onClose }) {
  const [features, setFeatures] = useState({
    hasDigitalMenu: false,
    hasTableOrdering: false,
    hasBookings: false,
    hasEvents: false,
    hasPulse: false
  });

  // Fetch current features when panel opens
  useEffect(() => {
    const fetchCurrentFeatures = async () => {
      try {
        const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
        
        const response = await fetch(`https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/Features/business/${businessId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFeatures(data);
        }
      } catch (err) {
        console.error('Failed to load current features:', err);
      }
    };
    
    if (businessId) {
      fetchCurrentFeatures();
    }
  }, [businessId]);

  // Save changes to backend
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
      
      const response = await fetch(`https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/Features/business/${businessId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(features)
      });
      
      if (response.ok) {
        console.log('✅ Features updated successfully');
      }
    } catch (err) {
      console.error('Failed to save features:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Feature Control Panel</h2>
        
        {/* Feature Toggles */}
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-zinc-800 rounded mb-4">
            <span className="text-white">{key}</span>
            <button
              onClick={() => setFeatures(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`w-12 h-6 rounded-full ${value ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
        
        <div className="flex gap-4 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-600 text-white py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 bg-white text-black py-2 rounded">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 BACKEND REQUIREMENTS (What We Expect)

### 1. API Endpoints Expected

#### A. Business Features Endpoint (READ)
```
GET /api/business/Profile/features
Authorization: Bearer {JWT_TOKEN}
Expected Response: 200 OK
{
  "hasDigitalMenu": true,
  "hasTableOrdering": false,
  "hasBookings": false,
  "hasEvents": false,
  "hasPulse": false
}
```

#### B. SuperAdmin Features Endpoint (READ/WRITE)
```
GET /api/superadmin/Features/business/{businessId}
PATCH /api/superadmin/Features/business/{businessId}
Authorization: Bearer {SUPERADMIN_JWT_TOKEN}
```

### 2. Expected Backend Controller Structure

#### A. Business Controller (ProfileController.cs)
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager,Owner")] // ✅ Should allow Manager role
public class BusinessController : ControllerBase
{
    [HttpGet("Profile/features")]
    public async Task<IActionResult> GetBusinessFeatures()
    {
        try 
        {
            // Extract business ID from JWT token
            var businessIdClaim = User.FindFirst("businessId")?.Value;
            if (string.IsNullOrEmpty(businessIdClaim))
            {
                return Unauthorized("Business ID not found in token");
            }
            
            var businessId = int.Parse(businessIdClaim);
            
            // Get features from database
            var features = await _businessService.GetBusinessFeatures(businessId);
            
            return Ok(features);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Failed to retrieve business features");
        }
    }
}
```

#### B. SuperAdmin Controller
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminController : ControllerBase
{
    [HttpGet("Features/business/{businessId}")]
    public async Task<IActionResult> GetBusinessFeatures(int businessId)
    {
        var features = await _businessService.GetBusinessFeatures(businessId);
        return Ok(features);
    }
    
    [HttpPatch("Features/business/{businessId}")]
    public async Task<IActionResult> UpdateBusinessFeatures(int businessId, [FromBody] BusinessFeaturesDto features)
    {
        await _businessService.UpdateBusinessFeatures(businessId, features);
        return Ok();
    }
}
```

### 3. Database Schema Expected
```sql
CREATE TABLE BusinessFeatures (
    BusinessId INT PRIMARY KEY,
    HasDigitalMenu BIT DEFAULT 0,
    HasTableOrdering BIT DEFAULT 0,
    HasBookings BIT DEFAULT 0,
    HasEvents BIT DEFAULT 0,
    HasPulse BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Business 13 should have a record
INSERT INTO BusinessFeatures (BusinessId, HasDigitalMenu, HasTableOrdering, HasBookings, HasEvents, HasPulse)
VALUES (13, 1, 0, 0, 0, 0);
```

---

## 🔍 DEBUGGING INFORMATION

### 1. Current JWT Token Analysis
```javascript
// Token contains:
{
  userId: '70',
  email: 'dmellle@gmail.com', 
  role: 'Manager',
  businessId: '13',
  exp: '06/03/2026, 22:54:00'
}
```

### 2. API Call Details
```javascript
// Frontend makes this call:
fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/Profile/features', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
    'Content-Type': 'application/json'
  }
})

// Expected: 200 OK with features JSON
// Actual: 403 Forbidden
```

### 3. Console Logs During Error
```
🔐 Business dashboard auth check: {role: 'Manager', hasToken: true}
🔑 JWT Token Analysis: {userId: '70', email: 'dmellle@gmail.com', role: 'Manager', businessId: '13'}
🔄 Initializing business features...
🔄 Fetching business features...
GET /api/business/Profile/features 403 (Forbidden)
❌ Failed to load business features: Error: HTTP 403
```

---

## 🚨 POSSIBLE ROOT CAUSES

### 1. Authorization Attribute Issues
- Controller still has `[Authorize(Roles = "Owner")]` instead of `[Authorize(Roles = "Manager,Owner")]`
- Method-level authorization overriding class-level authorization
- Case sensitivity in role names ("Manager" vs "manager")

### 2. JWT Token Issues
- Role claim name mismatch (expecting "role" but token has different claim name)
- Business ID claim not being read correctly
- Token validation failing for some reason

### 3. Database/Service Issues
- BusinessFeatures table doesn't exist
- Business ID 13 doesn't have a record
- Service layer throwing exceptions

### 4. Routing Issues
- Endpoint path mismatch
- Controller not being found
- Middleware intercepting requests

---

## 🎯 QUESTIONS FOR GOOGLE AI STUDIO

1. **What could cause 403 Forbidden even after changing authorization from "Owner" to "Manager,Owner"?**

2. **How should we debug JWT token role validation in ASP.NET Core?**

3. **What are common causes of authorization failures when the token contains the correct role?**

4. **Could there be middleware or filters interfering with the authorization?**

5. **How can we verify the exact authorization requirements being applied to the endpoint?**

6. **What logging should we add to debug this authorization issue?**

7. **Could the issue be with claim names or case sensitivity?**

8. **Are there any ASP.NET Core configuration issues that could cause this?**

---

## 🔧 WHAT WE NEED FROM GOOGLE AI STUDIO

Please analyze this complete implementation and provide:

1. **Root cause analysis** of why 403 Forbidden persists
2. **Specific backend code fixes** needed
3. **Debugging steps** to identify the exact issue
4. **Configuration changes** that might be required
5. **Alternative approaches** if current approach has fundamental issues

The frontend implementation is complete and working - we just need the backend to properly authorize the Manager role for the business features endpoint.

---

## 📋 CURRENT STATUS

- ✅ Frontend implementation complete
- ✅ SuperAdmin features panel working
- ✅ Feature guards implemented
- ✅ Real-time polling system ready
- ❌ Business features endpoint returning 403 Forbidden
- ❌ Manager role not being authorized properly

**The system is 95% complete - just need to solve this authorization issue!**