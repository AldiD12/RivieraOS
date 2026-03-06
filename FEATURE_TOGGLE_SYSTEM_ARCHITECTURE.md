# 🏗️ Feature Toggle System Architecture - Technical Documentation

**Date:** March 5, 2026  
**System:** Business Feature Access Control ("God Mode")  
**For:** Google Software Engineer Review  

---

## 🎯 System Overview

We implemented a **centralized feature toggle system** that allows SuperAdmins to control which features are available to each business, with real-time synchronization across all user interfaces.

**Core Concept:** SuperAdmin acts as a "circuit breaker" - they can enable/disable business features instantly, and all business users see changes within 30 seconds without manual refresh.

---

## 🏛️ Architecture Components

### 1. **Backend API Layer**
```
/api/superadmin/Features/business/{businessId}
├── GET    - Read current feature state
├── PATCH  - Update specific features  
└── PUT    - Replace all features

/api/business/Profile/features
└── GET    - Business reads their own features
```

### 2. **Frontend State Management**
```
Zustand Store (businessStore.js)
├── Feature State Management
├── API Integration Layer
├── Real-time Polling (30s intervals)
└── Error Handling & Fallbacks
```

### 3. **UI Access Control**
```
React Components
├── FeatureGuard (Conditional Rendering)
├── SuperAdminFeaturesPanel (Control Interface)
├── BusinessAdminDashboard (Respects Features)
└── UpgradePrompt (Monetization Layer)
```

---

## 🔧 Implementation Logic

### **Phase 1: Data Model**
```typescript
interface BusinessFeatures {
  hasDigitalMenu: boolean;     // QR menu access
  hasTableOrdering: boolean;   // Direct ordering
  hasBookings: boolean;        // Reservations system
  hasEvents: boolean;          // Event management
  hasPulse: boolean;          // Analytics dashboard
}
```

### **Phase 2: SuperAdmin Control Panel**
```javascript
// SuperAdminFeaturesPanel.jsx
const SuperAdminFeaturesPanel = ({ businessId, businessName }) => {
  // 1. Load current feature state on open
  useEffect(() => {
    fetchCurrentFeatures(businessId);
  }, [businessId]);

  // 2. Handle feature toggles
  const handleToggle = (featureName) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
  };

  // 3. Save changes to backend
  const handleSave = async () => {
    await updateFeatures(businessId, features);
    // Shows success message
  };
};
```

### **Phase 3: Business Dashboard Integration**
```javascript
// BusinessAdminDashboard.jsx
const BusinessAdminDashboard = () => {
  const { hasFeature, startPolling } = useBusinessFeatures();

  // 1. Load features on mount + start polling
  useEffect(() => {
    fetchFeatures();
    startPolling(); // 30-second intervals
  }, []);

  // 2. Filter navigation tabs based on features
  const tabs = [
    { id: 'overview', feature: null },        // Always visible
    { id: 'staff', feature: null },           // Always visible
    { id: 'menu', feature: 'hasDigitalMenu' },
    { id: 'venues', feature: 'hasBookings' },
    { id: 'events', feature: 'hasEvents' }
  ].filter(tab => !tab.feature || hasFeature(tab.feature));

  // 3. Wrap restricted content in FeatureGuards
  return (
    <FeatureGuard 
      feature="hasEvents"
      fallback={<UpgradePrompt feature="hasEvents" />}
    >
      <EventsManagement />
    </FeatureGuard>
  );
};
```

### **Phase 4: Real-Time Synchronization**
```javascript
// businessStore.js - Polling Logic
const startPolling = () => {
  const interval = setInterval(async () => {
    // Silent fetch (no loading spinners)
    const newFeatures = await fetchFeatures(true);
    
    // Compare with current state
    const hasChanged = JSON.stringify(currentFeatures) !== JSON.stringify(newFeatures);
    
    if (hasChanged) {
      console.log('🔄 Features changed, updating UI...');
      updateFeatures(newFeatures);
    }
  }, 30000); // 30 seconds
};
```

---

## 🎛️ Control Flow Logic

### **SuperAdmin Workflow:**
```
1. SuperAdmin opens Features Panel for Business X
2. Panel loads current feature state via GET /api/superadmin/Features/business/X
3. SuperAdmin toggles features (local state changes)
4. SuperAdmin clicks "Save Changes"
5. PATCH /api/superadmin/Features/business/X with new state
6. Success message shown, panel remains open
```

### **Business User Workflow:**
```
1. Business user loads dashboard
2. Dashboard calls GET /api/business/Profile/features
3. Features stored in Zustand store + localStorage
4. Navigation tabs filtered based on feature flags
5. Polling starts (every 30 seconds)
6. When SuperAdmin changes features → detected within 30s
7. UI updates automatically (tabs appear/disappear)
```

### **Feature Guard Logic:**
```javascript
// FeatureGuard.jsx
export function FeatureGuard({ feature, children, fallback }) {
  const { hasFeature } = useBusinessFeatures();
  
  // Simple boolean check
  if (hasFeature(feature)) {
    return children;  // Show content
  }
  
  return fallback || null;  // Show upgrade prompt or nothing
}
```

---

## 🔐 Security & Authorization

### **Role-Based Access:**
```
SuperAdmin JWT Token:
├── Can read ALL business features
├── Can modify ANY business features
└── Has "SuperAdmin" role claim

Business JWT Token:
├── Can read ONLY their own features
├── Cannot modify features (read-only)
└── Has "Manager"/"Owner" role + businessId claim
```

### **API Security:**
```csharp
// Backend Controller Logic
[Authorize(Roles = "SuperAdmin")]
public async Task<IActionResult> UpdateBusinessFeatures(int businessId, PatchBusinessFeatureRequest request)
{
    // 1. Validate SuperAdmin has access
    // 2. Validate business exists
    // 3. Update features in database
    // 4. Return success/error
}

[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> GetMyBusinessFeatures()
{
    // 1. Extract businessId from JWT token
    // 2. Return features for that business only
    // 3. No cross-business access allowed
}
```

---

## 📊 State Management Architecture

### **Zustand Store Pattern:**
```javascript
// businessStore.js
export const useBusinessStore = create(
  persist(
    (set, get) => ({
      // State
      features: { hasDigitalMenu: false, ... },
      featuresLoading: false,
      pollingInterval: null,
      
      // Actions
      fetchFeatures: async (silent = false) => { /* API call */ },
      startPolling: () => { /* 30s interval */ },
      stopPolling: () => { /* cleanup */ },
      hasFeature: (name) => Boolean(get().features[name])
    }),
    {
      name: 'riviera-business-store',
      partialize: (state) => ({ features: state.features })
    }
  )
);
```

### **Hook Abstraction:**
```javascript
// Convenience hooks for components
export const useBusinessFeatures = () => {
  const store = useBusinessStore();
  return {
    features: store.features,
    hasFeature: store.hasFeature,
    startPolling: store.startPolling,
    stopPolling: store.stopPolling
  };
};
```

---

## 🚦 Error Handling Strategy

### **Graceful Degradation:**
```javascript
// 404 Business Not Found
if (response.status === 404) {
  console.warn(`Business ${businessId} not found - using defaults`);
  return {
    hasDigitalMenu: false,
    hasTableOrdering: false,
    hasBookings: false,
    hasEvents: false,
    hasPulse: false
  };
}

// Network Errors
catch (error) {
  console.error('Feature fetch failed:', error);
  // Continue with cached features from localStorage
  return getCachedFeatures();
}
```

### **User-Friendly Messages:**
```javascript
// SuperAdmin error handling
if (err.message.includes('404')) {
  setSaveError(`Business ID ${businessId} not found. Please verify this business exists.`);
} else if (err.message.includes('403')) {
  setSaveError('Permission denied. You may not have access to modify features.');
} else if (err.message.includes('401')) {
  setSaveError('Authentication failed. Please login again as SuperAdmin.');
}
```

---

## ⚡ Performance Optimizations

### **Polling Efficiency:**
```javascript
// Silent polling (no UI loading states)
const fetchFeatures = async (silent = false) => {
  if (!silent) {
    set({ featuresLoading: true });
  }
  // ... API call
  if (!silent) {
    set({ featuresLoading: false });
  }
};

// Change detection (avoid unnecessary re-renders)
const hasChanged = JSON.stringify(currentFeatures) !== JSON.stringify(newFeatures);
if (hasChanged) {
  updateUI(newFeatures);
}
```

### **Caching Strategy:**
```javascript
// Zustand persist middleware
persist(
  (set, get) => ({ /* store logic */ }),
  {
    name: 'riviera-business-store',
    partialize: (state) => ({
      features: state.features  // Only cache features
    })
  }
)
```

---

## 🧪 Testing Strategy

### **Unit Tests:**
```javascript
// Feature guard logic
describe('FeatureGuard', () => {
  it('shows content when feature enabled', () => {
    mockStore({ hasDigitalMenu: true });
    render(<FeatureGuard feature="hasDigitalMenu">Content</FeatureGuard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  
  it('shows fallback when feature disabled', () => {
    mockStore({ hasDigitalMenu: false });
    render(<FeatureGuard feature="hasDigitalMenu" fallback={<div>Upgrade</div>}>Content</FeatureGuard>);
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });
});
```

### **Integration Tests:**
```javascript
// End-to-end flow
describe('Feature Toggle Flow', () => {
  it('SuperAdmin toggles feature → Business UI updates', async () => {
    // 1. Login as SuperAdmin
    // 2. Open Features Panel for Business X
    // 3. Toggle hasEvents: false → true
    // 4. Save changes
    // 5. Login as Business X user
    // 6. Verify Events tab appears in navigation
  });
});
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────┐    PATCH /features    ┌──────────────────┐
│   SuperAdmin    │ ──────────────────── │     Backend      │
│   Dashboard     │                       │   (Database)     │
└─────────────────┘                       └──────────────────┘
                                                    │
                                          GET /features (polling)
                                                    │
                                                    ▼
┌─────────────────┐    Real-time Sync    ┌──────────────────┐
│   Business      │ ◄─────────────────── │   Zustand Store  │
│   Dashboard     │                       │   (30s polling)  │
└─────────────────┘                       └──────────────────┘
        │                                           │
        ▼                                           ▼
┌─────────────────┐                       ┌──────────────────┐
│  FeatureGuard   │                       │   localStorage   │
│  Components     │                       │    (Persist)     │
└─────────────────┘                       └──────────────────┘
```

---

## 🎯 Key Design Decisions

### **1. Polling vs WebSockets**
**Choice:** 30-second polling  
**Reasoning:** 
- Simpler implementation
- No WebSocket infrastructure needed
- 30s delay acceptable for admin features
- More reliable than WebSocket connections

### **2. Zustand vs Redux**
**Choice:** Zustand with persist middleware  
**Reasoning:**
- Smaller bundle size
- Less boilerplate code
- Built-in persistence
- Better TypeScript support

### **3. Feature Guards vs Route Guards**
**Choice:** Component-level FeatureGuards  
**Reasoning:**
- More granular control
- Better UX (show upgrade prompts)
- Easier to test
- Flexible fallback content

### **4. Optimistic vs Pessimistic Updates**
**Choice:** Pessimistic (wait for API confirmation)  
**Reasoning:**
- More reliable for admin operations
- Clear success/error feedback
- Prevents inconsistent states
- Better for audit trails

---

## 🚀 Deployment Considerations

### **Environment Variables:**
```bash
VITE_API_URL=https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api
VITE_POLLING_INTERVAL=30000  # 30 seconds
VITE_FEATURE_CACHE_TTL=3600  # 1 hour
```

### **Database Schema:**
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
```

---

## 📈 Monitoring & Analytics

### **Key Metrics:**
- Feature toggle frequency per business
- API response times for feature endpoints
- Polling success/failure rates
- Feature adoption rates across businesses

### **Logging Strategy:**
```javascript
// Feature changes
console.log('🔧 Feature toggled:', { 
  businessId, 
  feature: 'hasEvents', 
  oldValue: false, 
  newValue: true,
  adminId: currentUser.id
});

// Polling activity
console.log('🔄 Features polling:', {
  businessId,
  hasChanges: false,
  responseTime: '150ms'
});
```

---

## 🎯 Summary for Google Engineer

**Architecture Pattern:** Centralized feature flags with real-time synchronization  
**State Management:** Zustand store with persistence and polling  
**Security Model:** JWT-based role authorization with business isolation  
**UI Pattern:** Component-level feature guards with graceful fallbacks  
**Sync Strategy:** 30-second polling with change detection  
**Error Handling:** Graceful degradation with user-friendly messages  

**Key Innovation:** The system provides instant SuperAdmin control with near-real-time business user updates, creating a seamless "circuit breaker" experience for SaaS feature management.

This architecture is production-ready, scalable, and follows React/TypeScript best practices while maintaining excellent user experience for both admin and business users.