# Industrial Grade Frontend Specification - Riviera OS

**Environment:** Albanian Riviera in August (hostile conditions)  
**Reality:** High heat, blinding sun, overloaded 4G towers  
**Standard:** Production-ready, not prototype  
**Status:** MANDATORY for all new code

---

## 🎯 CORE PRINCIPLES

### The Beach Reality Check
- Users are in direct sunlight wearing sunglasses
- 4G towers are overloaded (slow/unstable connections)
- Devices are hot (performance degradation)
- Touch targets must work with wet/sandy fingers
- No second chances - every interaction must work first time

---

## 1. STATE MANAGEMENT & RENDER LOGIC

### The "No-Loop" Rule ✅ MANDATORY

**Problem:** Infinite loops crash the app in production

**Solution:**
```javascript
// ❌ BAD - Infinite loop risk
useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData recreated every render

// ✅ GOOD - Stable dependencies
const fetchData = useCallback(() => {
  // fetch logic
}, []); // Empty deps - stable function

useEffect(() => {
  fetchData();
}, [fetchData]); // Now safe
```

**Rules:**
- Every `useEffect` must have audited dependency arrays
- Never depend on a function unless wrapped in `useCallback`
- Use ESLint rule: `react-hooks/exhaustive-deps`
- Document why dependencies are omitted (if intentional)

---

### Context-Aware Routing (Zustand)

**File:** `frontend/src/store/appStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // App mode
      mode: 'DISCOVER', // 'SPOT' | 'DISCOVER'
      
      // Session data
      session: null,
      
      // Actions
      setMode: (mode) => set({ mode }),
      
      startSession: (venueId, unitId) => set({
        mode: 'SPOT',
        session: {
          venueId,
          unitId,
          startTime: Date.now(),
          manuallyExited: false
        }
      }),
      
      exitSession: () => set((state) => ({
        mode: 'DISCOVER',
        session: state.session ? { ...state.session, manuallyExited: true } : null
      })),
      
      isSessionActive: () => {
        const { session } = get();
        if (!session || session.manuallyExited) return false;
        
        const elapsed = Date.now() - session.startTime;
        const FOUR_HOURS = 4 * 60 * 60 * 1000;
        return elapsed < FOUR_HOURS;
      }
    }),
    {
      name: 'riviera-app-store',
      partialize: (state) => ({ mode: state.mode, session: state.session })
    }
  )
);
```

**Usage:**
```javascript
// In any component
const { mode, startSession, exitSession } = useAppStore();

// Switch modes instantly
if (mode === 'SPOT') {
  return <SpotLayout />;
} else {
  return <DiscoverLayout />;
}
```

---

### Session Persistence (Cart + User State)

**File:** `frontend/src/store/cartStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      venueId: null,
      unitId: null,
      
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: Date.now() }]
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      clearCart: () => set({ items: [], venueId: null, unitId: null }),
      
      setVenue: (venueId, unitId) => set({ venueId, unitId })
    }),
    {
      name: 'riviera-cart',
      // Persist across refreshes
      partialize: (state) => ({
        items: state.items,
        venueId: state.venueId,
        unitId: state.unitId
      })
    }
  )
);
```

**Test:**
```javascript
// User adds drinks to cart
addItem({ name: 'Mojito', price: 7.50 });

// User refreshes browser
// Cart persists ✅

// User is still on Bed 42 ✅
```

---

## 2. HIGH-GLARE UI ENGINEERING

### The "Beach" Standard ✅ MANDATORY

**Problem:** Users can't see the screen in direct sunlight

**Solution: High Contrast Mode**

**File:** `frontend/src/styles/glare.css`

```css
/* High Glare Mode - Activated automatically in bright conditions */
.high-glare {
  /* Pure contrast */
  --text-primary: #000000;
  --text-secondary: #1a1a1a;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  
  /* Thicker borders */
  --border-width: 2px;
  
  /* Heavier fonts */
  --font-weight-normal: 500;
  --font-weight-bold: 700;
}

/* Active states - MUST be visible */
.high-glare .active {
  border-width: 3px;
  border-color: #000000;
  background: #000000;
  color: #FFFFFF;
}

/* Touch targets - Minimum 44x44px */
.high-glare button,
.high-glare a,
.high-glare input {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}
```

**Adaptive Theme Detection:**

```javascript
// frontend/src/hooks/useGlareMode.js
import { useEffect, useState } from 'react';

export const useGlareMode = () => {
  const [isHighGlare, setIsHighGlare] = useState(false);

  useEffect(() => {
    // Check ambient light sensor (if available)
    if ('AmbientLightSensor' in window) {
      const sensor = new AmbientLightSensor();
      sensor.addEventListener('reading', () => {
        // > 10000 lux = direct sunlight
        setIsHighGlare(sensor.illuminance > 10000);
      });
      sensor.start();
      
      return () => sensor.stop();
    } else {
      // Fallback: Check time of day (10 AM - 6 PM = high glare)
      const hour = new Date().getHours();
      setIsHighGlare(hour >= 10 && hour <= 18);
    }
  }, []);

  return isHighGlare;
};
```

**Usage:**
```javascript
function MenuPage() {
  const isHighGlare = useGlareMode();
  
  return (
    <div className={isHighGlare ? 'high-glare' : ''}>
      {/* UI automatically adapts */}
    </div>
  );
}
```

---

## 3. PERFORMANCE & ASSET OPTIMIZATION

### Cloudinary Integration ✅ MANDATORY

**File:** `frontend/src/utils/imageOptimizer.js`

```javascript
const CLOUDINARY_BASE = 'https://res.cloudinary.com/riviera-os/image/upload';

export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Build transformation string
  const transforms = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`,
    `g_${gravity}`
  ].join(',');

  return `${CLOUDINARY_BASE}/${transforms}/${publicId}`;
};

// Presets
export const ImagePresets = {
  thumbnail: (publicId) => getOptimizedImageUrl(publicId, {
    width: 400,
    quality: 'auto',
    format: 'auto'
  }),
  
  hero: (publicId) => getOptimizedImageUrl(publicId, {
    width: 1200,
    quality: 80,
    format: 'auto'
  }),
  
  avatar: (publicId) => getOptimizedImageUrl(publicId, {
    width: 200,
    quality: 'auto',
    format: 'auto',
    crop: 'thumb',
    gravity: 'face'
  })
};
```

**Usage:**
```javascript
import { ImagePresets } from '../utils/imageOptimizer';

// ❌ BAD - Raw URL
<img src="https://example.com/image.jpg" />

// ✅ GOOD - Optimized
<img src={ImagePresets.thumbnail('menu/mojito')} />
```

---

### Skeleton Loaders ✅ MANDATORY

**File:** `frontend/src/components/ui/Skeleton.jsx`

```javascript
export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-64 w-full rounded-[2rem]',
    button: 'h-12 w-32 rounded-full'
  };

  return (
    <div
      className={`animate-pulse bg-stone-200 ${variants[variant]} ${className}`}
      aria-label="Loading..."
    />
  );
};

// Menu Card Skeleton
export const MenuCardSkeleton = () => (
  <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6">
    <Skeleton variant="card" className="mb-4" />
    <Skeleton variant="title" className="mb-2" />
    <Skeleton variant="text" className="mb-4" />
    <Skeleton variant="button" />
  </div>
);
```

**Usage:**
```javascript
function MenuPage() {
  const { data, isLoading } = useQuery('menu', fetchMenu);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-8">
        {[...Array(6)].map((_, i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <MenuGrid items={data} />;
}
```

---

## 4. REAL-TIME & RESILIENCE (SignalR)

### The "Heartbeat" Fallback ✅ MANDATORY

**File:** `frontend/src/services/signalrService.js`

```javascript
import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.fallbackToPolling = false;
  }

  async connect(hubUrl) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 2s, 4s, 8s
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 8000);
        }
      })
      .build();

    // Handle reconnection failures
    this.connection.onreconnecting(() => {
      console.log('🔄 SignalR reconnecting...');
      this.reconnectAttempts++;
    });

    this.connection.onreconnected(() => {
      console.log('✅ SignalR reconnected');
      this.reconnectAttempts = 0;
      this.fallbackToPolling = false;
    });

    this.connection.onclose(() => {
      console.log('❌ SignalR disconnected');
      
      // After 3 failed attempts, switch to polling
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('⚠️ Switching to long polling fallback');
        this.fallbackToPolling = true;
        this.startPolling();
      }
    });

    try {
      await this.connection.start();
      console.log('✅ SignalR connected');
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      this.fallbackToPolling = true;
      this.startPolling();
    }
  }

  // Fallback: Long polling
  startPolling() {
    this.pollingInterval = setInterval(async () => {
      try {
        // Poll for updates every 5 seconds
        const updates = await fetch('/api/orders/updates').then(r => r.json());
        this.handleUpdates(updates);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  on(eventName, callback) {
    if (this.connection) {
      this.connection.on(eventName, callback);
    }
  }

  async invoke(methodName, ...args) {
    if (this.fallbackToPolling) {
      // Use REST API instead
      return this.invokeViaRest(methodName, ...args);
    }
    
    return this.connection.invoke(methodName, ...args);
  }

  async invokeViaRest(methodName, ...args) {
    // Fallback to REST API
    const response = await fetch(`/api/${methodName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    return response.json();
  }
}

export const signalrService = new SignalRService();
```

---

### Optimistic UI ✅ MANDATORY

**Pattern:**
```javascript
function OrderButton({ item }) {
  const [optimisticState, setOptimisticState] = useState('idle');
  const { addItem } = useCartStore();

  const handleOrder = async () => {
    // 1. Update UI immediately (optimistic)
    setOptimisticState('sending');
    addItem(item);

    try {
      // 2. Send to server in background
      await orderApi.createOrder(item);
      
      // 3. Confirm success
      setOptimisticState('sent');
      
      // 4. Show haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (error) {
      // 5. Rollback on failure
      setOptimisticState('error');
      removeItem(item.id);
      
      // 6. Queue for retry
      queueForRetry(item);
    }
  };

  return (
    <button onClick={handleOrder}>
      {optimisticState === 'idle' && 'Order'}
      {optimisticState === 'sending' && '✓ Sent'}
      {optimisticState === 'sent' && '✓ Confirmed'}
      {optimisticState === 'error' && '⚠ Retry'}
    </button>
  );
}
```

---

## 5. PWA & MOBILE UX

### Standalone Mode ✅ MANDATORY

**File:** `frontend/public/manifest.json`

```json
{
  "name": "Riviera OS",
  "short_name": "Riviera",
  "display": "standalone",
  "start_url": "/",
  "background_color": "#FAFAF9",
  "theme_color": "#1C1917",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker:** `frontend/public/sw.js`

```javascript
const CACHE_NAME = 'riviera-v1';
const OFFLINE_URL = '/offline.html';

// Cache critical assets
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
});

// Network-first strategy for API calls
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});
```

---

### Haptic Feedback ✅ MANDATORY

**File:** `frontend/src/utils/haptics.js`

```javascript
export const haptics = {
  // Light tap (button press)
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  // Medium tap (order confirmed)
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },

  // Strong tap (error/alert)
  strong: () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  },

  // Success pattern
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
  }
};
```

**Usage:**
```javascript
import { haptics } from '../utils/haptics';

function OrderButton() {
  const handleClick = () => {
    haptics.light(); // Immediate feedback
    submitOrder();
  };

  const handleSuccess = () => {
    haptics.success(); // Order confirmed
  };

  return <button onClick={handleClick}>Order</button>;
}
```

---

## 6. COMPONENT MODULARIZATION

### Atomic Design Structure

```
frontend/src/
├── components/
│   ├── ui/                    # Base components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Skeleton.jsx
│   │   └── Badge.jsx
│   │
│   ├── features/              # Feature components
│   │   ├── MenuFeed/
│   │   │   ├── MenuCard.jsx
│   │   │   ├── MenuGrid.jsx
│   │   │   └── MenuFilter.jsx
│   │   │
│   │   ├── ReviewShield/
│   │   │   ├── StarRating.jsx
│   │   │   ├── ReviewForm.jsx
│   │   │   └── FeedbackModal.jsx
│   │   │
│   │   └── VibeSlider/
│   │       ├── ContentCard.jsx
│   │       └── ContentCarousel.jsx
│   │
│   └── layouts/               # Page layouts
│       ├── SpotLayout.jsx
│       ├── DiscoverLayout.jsx
│       └── AdminLayout.jsx
│
├── pages/                     # Page components
│   ├── SpotPage.jsx
│   ├── DiscoveryPage.jsx
│   └── MenuPage.jsx
│
├── store/                     # Zustand stores
│   ├── appStore.js
│   ├── cartStore.js
│   └── userStore.js
│
├── services/                  # API services
│   ├── orderApi.js
│   ├── venueApi.js
│   └── signalrService.js
│
└── utils/                     # Utilities
    ├── imageOptimizer.js
    ├── haptics.js
    └── sessionManager.js
```

---

## 7. PRODUCTION CHECKLIST

### Before Deploying ✅ MANDATORY

- [ ] All `useEffect` dependencies audited
- [ ] No infinite loops (tested with React DevTools Profiler)
- [ ] High glare mode tested in sunlight
- [ ] All images use Cloudinary optimization
- [ ] Skeleton loaders on all data-fetching components
- [ ] SignalR fallback to polling tested
- [ ] Optimistic UI on all mutations
- [ ] PWA manifest configured
- [ ] Service worker caching critical assets
- [ ] Haptic feedback on key actions
- [ ] Touch targets minimum 44x44px
- [ ] Tested on slow 3G connection
- [ ] Tested with device throttling (CPU 4x slowdown)
- [ ] No layout shifts (CLS < 0.1)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s

---

## 8. PERFORMANCE BUDGETS

### Hard Limits ✅ MANDATORY

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| Bundle Size | < 300 KB | TBD | 🟡 |
| First Paint | < 1.5s | TBD | 🟡 |
| Time to Interactive | < 3.5s | TBD | 🟡 |
| Lighthouse Score | > 90 | TBD | 🟡 |
| CLS | < 0.1 | TBD | 🟡 |

**Monitor with:**
```bash
npm run build -- --stats
npx lighthouse https://riviera-os.vercel.app --view
```

---

## 9. ERROR BOUNDARIES

**File:** `frontend/src/components/ErrorBoundary.jsx`

```javascript
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error tracking service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-4xl font-light text-[#1C1917] mb-4">
              Something went wrong
            </h1>
            <p className="text-lg text-[#57534E] mb-8">
              We're working on fixing this. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-stone-900 text-stone-50 px-8 py-4 rounded-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

**Created:** February 26, 2026  
**Status:** MANDATORY for all new code  
**Priority:** 🚨 CRITICAL  

**This is not optional. This is production.**
