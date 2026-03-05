# Business Tier System - Feature Access Control
## March 5, 2026

---

## Overview

**Purpose:** Control which features businesses can access based on their subscription tier
**Use Case:** Freemium model - basic features free, premium features paid

---

## Tier Structure

### 🆓 FREE TIER (Basic)
**Target:** Small businesses, trial users
**Monthly Cost:** €0

**Included Features:**
- ✅ Basic venue profile (name, description, image)
- ✅ Menu management (up to 20 items)
- ✅ Digital ordering (QR code)
- ✅ Order notifications
- ✅ Basic analytics (last 7 days)
- ✅ 1 staff account (Bartender/Collector)
- ✅ WhatsApp booking link

**Disabled Features:**
- ❌ Sunbed/table booking system
- ❌ Zone management
- ❌ Events creation
- ❌ Advanced analytics (30+ days)
- ❌ Multiple staff accounts
- ❌ Custom branding
- ❌ Priority support

---

### 💎 PREMIUM TIER (Pro)
**Target:** Established venues, beach clubs
**Monthly Cost:** €99/month

**Included Features:**
- ✅ Everything in Free tier
- ✅ Full sunbed/table booking system
- ✅ Zone management (unlimited zones)
- ✅ Events creation (unlimited events)
- ✅ Advanced analytics (90 days)
- ✅ Up to 5 staff accounts
- ✅ Custom branding (logo, colors)
- ✅ Priority support
- ✅ Featured placement on Discovery Page

**Disabled Features:**
- ❌ White-label solution
- ❌ API access
- ❌ Multi-venue management

---

### 🏆 ENTERPRISE TIER (Custom)
**Target:** Hotel chains, large operations
**Monthly Cost:** Custom pricing

**Included Features:**
- ✅ Everything in Premium tier
- ✅ White-label solution
- ✅ API access
- ✅ Multi-venue management
- ✅ Unlimited staff accounts
- ✅ Custom integrations
- ✅ Dedicated account manager
- ✅ SLA guarantees

---

## Database Schema

### Add Tier Field to Business Table

```sql
-- Add tier column to Business table
ALTER TABLE Businesses ADD Tier NVARCHAR(20) NOT NULL DEFAULT 'Free';
-- Options: 'Free', 'Premium', 'Enterprise'

-- Add feature flags (optional, for granular control)
ALTER TABLE Businesses ADD HasBookingSystem BIT NOT NULL DEFAULT 0;
ALTER TABLE Businesses ADD HasEventsSystem BIT NOT NULL DEFAULT 0;
ALTER TABLE Businesses ADD HasAdvancedAnalytics BIT NOT NULL DEFAULT 0;
ALTER TABLE Businesses ADD MaxStaffAccounts INT NOT NULL DEFAULT 1;
ALTER TABLE Businesses ADD MaxMenuItems INT NOT NULL DEFAULT 20;
ALTER TABLE Businesses ADD MaxEvents INT NOT NULL DEFAULT 0;

-- Add subscription tracking
ALTER TABLE Businesses ADD SubscriptionStartDate DATETIME;
ALTER TABLE Businesses ADD SubscriptionEndDate DATETIME;
ALTER TABLE Businesses ADD IsTrialActive BIT NOT NULL DEFAULT 0;
ALTER TABLE Businesses ADD TrialEndDate DATETIME;
```

### Example Data

```sql
-- Free tier business
UPDATE Businesses 
SET Tier = 'Free',
    HasBookingSystem = 0,
    HasEventsSystem = 0,
    MaxStaffAccounts = 1,
    MaxMenuItems = 20
WHERE Id = 1;

-- Premium tier business
UPDATE Businesses 
SET Tier = 'Premium',
    HasBookingSystem = 1,
    HasEventsSystem = 1,
    HasAdvancedAnalytics = 1,
    MaxStaffAccounts = 5,
    MaxMenuItems = 999,
    MaxEvents = 999,
    SubscriptionStartDate = GETDATE(),
    SubscriptionEndDate = DATEADD(MONTH, 1, GETDATE())
WHERE Id = 2;
```

---

## Backend Implementation

### 1. Add Tier to Business DTO

**File:** `BusinessDto.cs`

```csharp
public class BusinessDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Tier { get; set; } // "Free", "Premium", "Enterprise"
    
    // Feature flags
    public bool HasBookingSystem { get; set; }
    public bool HasEventsSystem { get; set; }
    public bool HasAdvancedAnalytics { get; set; }
    public int MaxStaffAccounts { get; set; }
    public int MaxMenuItems { get; set; }
    public int MaxEvents { get; set; }
    
    // Subscription info
    public DateTime? SubscriptionStartDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public bool IsTrialActive { get; set; }
    public DateTime? TrialEndDate { get; set; }
}
```

### 2. Add Tier Check Middleware

**File:** `TierAuthorizationAttribute.cs`

```csharp
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class RequiresTierAttribute : Attribute
{
    public string RequiredTier { get; set; }
    public string FeatureFlag { get; set; }
    
    public RequiresTierAttribute(string tier)
    {
        RequiredTier = tier;
    }
    
    public RequiresTierAttribute(string tier, string feature)
    {
        RequiredTier = tier;
        FeatureFlag = feature;
    }
}
```

### 3. Update Controllers with Tier Checks

**Example: Events Controller**

```csharp
[HttpPost]
[RequiresTier("Premium", "HasEventsSystem")]
public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
{
    var business = await _context.Businesses.FindAsync(User.GetBusinessId());
    
    // Check tier
    if (business.Tier == "Free" || !business.HasEventsSystem)
    {
        return StatusCode(403, new { 
            error = "Events feature requires Premium tier",
            upgradeUrl = "/upgrade"
        });
    }
    
    // Check limits
    var eventCount = await _context.Events
        .Where(e => e.BusinessId == business.Id)
        .CountAsync();
        
    if (eventCount >= business.MaxEvents)
    {
        return StatusCode(403, new { 
            error = $"Event limit reached ({business.MaxEvents})",
            upgradeUrl = "/upgrade"
        });
    }
    
    // Create event...
}
```

**Example: Zones Controller**

```csharp
[HttpPost]
[RequiresTier("Premium", "HasBookingSystem")]
public async Task<IActionResult> CreateZone([FromBody] CreateZoneDto dto)
{
    var business = await _context.Businesses.FindAsync(User.GetBusinessId());
    
    if (business.Tier == "Free" || !business.HasBookingSystem)
    {
        return StatusCode(403, new { 
            error = "Booking system requires Premium tier",
            upgradeUrl = "/upgrade"
        });
    }
    
    // Create zone...
}
```

### 4. Add Business Info Endpoint

**Endpoint:** `GET /api/business/info`

```csharp
[HttpGet("info")]
public async Task<IActionResult> GetBusinessInfo()
{
    var businessId = User.GetBusinessId();
    var business = await _context.Businesses.FindAsync(businessId);
    
    return Ok(new {
        id = business.Id,
        name = business.Name,
        tier = business.Tier,
        features = new {
            hasBookingSystem = business.HasBookingSystem,
            hasEventsSystem = business.HasEventsSystem,
            hasAdvancedAnalytics = business.HasAdvancedAnalytics
        },
        limits = new {
            maxStaffAccounts = business.MaxStaffAccounts,
            maxMenuItems = business.MaxMenuItems,
            maxEvents = business.MaxEvents
        },
        subscription = new {
            startDate = business.SubscriptionStartDate,
            endDate = business.SubscriptionEndDate,
            isTrialActive = business.IsTrialActive,
            trialEndDate = business.TrialEndDate
        }
    });
}
```

---

## Frontend Implementation

### 1. Create Tier Context

**File:** `frontend/src/contexts/TierContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { businessApi } from '../services/businessApi';

const TierContext = createContext();

export function TierProvider({ children }) {
  const [tierInfo, setTierInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTierInfo();
  }, []);

  const loadTierInfo = async () => {
    try {
      const info = await businessApi.getBusinessInfo();
      setTierInfo(info);
    } catch (error) {
      console.error('Failed to load tier info:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature) => {
    if (!tierInfo) return false;
    return tierInfo.features[feature] === true;
  };

  const hasTier = (tier) => {
    if (!tierInfo) return false;
    const tiers = ['Free', 'Premium', 'Enterprise'];
    const currentIndex = tiers.indexOf(tierInfo.tier);
    const requiredIndex = tiers.indexOf(tier);
    return currentIndex >= requiredIndex;
  };

  return (
    <TierContext.Provider value={{ 
      tierInfo, 
      loading, 
      hasFeature, 
      hasTier,
      reload: loadTierInfo 
    }}>
      {children}
    </TierContext.Provider>
  );
}

export const useTier = () => useContext(TierContext);
```

### 2. Update Business Dashboard

**File:** `frontend/src/pages/BusinessAdminDashboard.jsx`

```javascript
import { useTier } from '../contexts/TierContext';

export default function BusinessAdminDashboard() {
  const { tierInfo, hasFeature, hasTier } = useTier();
  
  // Conditionally show tabs based on tier
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', enabled: true },
    { id: 'menu', label: 'Menu', icon: '🍽️', enabled: true },
    { id: 'orders', label: 'Orders', icon: '📋', enabled: true },
    { id: 'zones', label: 'Zones', icon: '🏖️', enabled: hasFeature('hasBookingSystem') },
    { id: 'events', label: 'Events', icon: '🎉', enabled: hasFeature('hasEventsSystem') },
    { id: 'staff', label: 'Staff', icon: '👥', enabled: true },
    { id: 'analytics', label: 'Analytics', icon: '📈', enabled: true },
  ].filter(tab => tab.enabled);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Tier Badge */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              tierInfo?.tier === 'Enterprise' ? 'bg-yellow-500 text-black' :
              tierInfo?.tier === 'Premium' ? 'bg-blue-500 text-white' :
              'bg-zinc-700 text-zinc-300'
            }`}>
              {tierInfo?.tier?.toUpperCase() || 'FREE'}
            </span>
            <span className="text-sm text-zinc-400">
              {tierInfo?.name}
            </span>
          </div>
          
          {tierInfo?.tier === 'Free' && (
            <button 
              onClick={() => navigate('/upgrade')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      {/* Rest of dashboard */}
      {/* ... */}
    </div>
  );
}
```

### 3. Create Upgrade Modal

**File:** `frontend/src/components/UpgradeModal.jsx`

```javascript
export default function UpgradeModal({ isOpen, onClose, feature }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Premium Feature
          </h2>
          <p className="text-zinc-400">
            {feature} requires a Premium subscription
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Free Tier */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="text-3xl font-bold text-white mb-4">
              €0<span className="text-sm text-zinc-400">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>✅ Menu management (20 items)</li>
              <li>✅ Digital ordering</li>
              <li>✅ Basic analytics</li>
              <li>✅ 1 staff account</li>
              <li>❌ Booking system</li>
              <li>❌ Events</li>
            </ul>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 px-3 py-1 rounded-full text-xs font-bold">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
            <div className="text-3xl font-bold text-white mb-4">
              €99<span className="text-sm text-blue-200">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-white">
              <li>✅ Everything in Free</li>
              <li>✅ Full booking system</li>
              <li>✅ Unlimited events</li>
              <li>✅ Advanced analytics</li>
              <li>✅ Up to 5 staff accounts</li>
              <li>✅ Priority support</li>
            </ul>
            <button className="w-full mt-6 bg-white text-blue-600 py-3 rounded-md font-bold hover:bg-blue-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 border border-zinc-700 rounded-md text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
```

### 4. Add Feature Guards

**File:** `frontend/src/components/FeatureGuard.jsx`

```javascript
import { useTier } from '../contexts/TierContext';
import { useState } from 'react';
import UpgradeModal from './UpgradeModal';

export default function FeatureGuard({ feature, children, fallback }) {
  const { hasFeature } = useTier();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!hasFeature(feature)) {
    return (
      <>
        <div onClick={() => setShowUpgrade(true)} className="cursor-pointer">
          {fallback || (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Premium Feature
              </h3>
              <p className="text-zinc-400 mb-4">
                Upgrade to access this feature
              </p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium">
                View Plans
              </button>
            </div>
          )}
        </div>
        <UpgradeModal 
          isOpen={showUpgrade} 
          onClose={() => setShowUpgrade(false)}
          feature={feature}
        />
      </>
    );
  }

  return children;
}
```

### 5. Usage in Dashboard

```javascript
import FeatureGuard from '../components/FeatureGuard';

// In Events tab
<FeatureGuard feature="hasEventsSystem">
  <EventsManagement />
</FeatureGuard>

// In Zones tab
<FeatureGuard feature="hasBookingSystem">
  <ZonesManagement />
</FeatureGuard>
```

---

## SuperAdmin Controls

### Add Tier Management to SuperAdmin

**File:** `frontend/src/pages/SuperAdminDashboard.jsx`

Add "Businesses" tab with tier management:

```javascript
// Business list with tier badges
{businesses.map(business => (
  <div key={business.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-white">{business.name}</h3>
      <select
        value={business.tier}
        onChange={(e) => updateBusinessTier(business.id, e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white"
      >
        <option value="Free">Free</option>
        <option value="Premium">Premium</option>
        <option value="Enterprise">Enterprise</option>
      </select>
    </div>
    
    {/* Feature toggles */}
    <div className="space-y-2">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={business.hasBookingSystem}
          onChange={(e) => toggleFeature(business.id, 'hasBookingSystem', e.target.checked)}
        />
        <span className="text-sm text-zinc-300">Booking System</span>
      </label>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={business.hasEventsSystem}
          onChange={(e) => toggleFeature(business.id, 'hasEventsSystem', e.target.checked)}
        />
        <span className="text-sm text-zinc-300">Events System</span>
      </label>
    </div>
  </div>
))}
```

---

## Testing Checklist

### Free Tier Business
- [ ] Can access menu management (up to 20 items)
- [ ] Can access digital ordering
- [ ] Cannot access zones tab (shows upgrade prompt)
- [ ] Cannot access events tab (shows upgrade prompt)
- [ ] Can only create 1 staff account
- [ ] Analytics limited to 7 days

### Premium Tier Business
- [ ] Can access all Free tier features
- [ ] Can access zones tab
- [ ] Can access events tab
- [ ] Can create up to 5 staff accounts
- [ ] Analytics show 90 days
- [ ] No upgrade prompts

### SuperAdmin
- [ ] Can view all businesses with tier badges
- [ ] Can change business tier
- [ ] Can toggle individual features
- [ ] Changes reflect immediately in business dashboard

---

## Backend Tasks for Kristi

1. **Add tier column to Businesses table**
2. **Add feature flag columns**
3. **Update Business DTOs to include tier info**
4. **Add tier checks to protected endpoints** (Events, Zones)
5. **Create `GET /api/business/info` endpoint**
6. **Add `PUT /api/superadmin/businesses/{id}/tier` endpoint**
7. **Add `PUT /api/superadmin/businesses/{id}/features` endpoint**

---

**Last Updated:** March 5, 2026
**Status:** Specification ready for implementation
