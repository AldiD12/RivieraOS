# Riviera OS - Next Steps Roadmap

## ✅ What's Complete (Admin/Staff Side)

### Authentication & Authorization
- ✅ Phone + PIN login for staff (Manager, Bartender, Collector)
- ✅ Email + Password login for SuperAdmin
- ✅ Role-based routing
- ✅ JWT token management with businessId claim

### SuperAdmin Dashboard
- ✅ Business management (CRUD)
- ✅ Staff management across all businesses
- ✅ Venues & Zones management
- ✅ Menu management (Categories & Products)
- ✅ Industrial minimalist design

### Business Admin Dashboard (Manager)
- ✅ Staff management (create Manager, Bartender, Collector)
- ✅ Menu management (Categories & Products)
- ✅ Venues & Zones management (two-column layout)
- ✅ Profile & Settings
- ✅ Dashboard analytics

### Staff Dashboards
- ✅ BarDisplay (Bartender view)
- ✅ CollectorDashboard (Collector view)
- ✅ SunbedManager (Zone unit management)

---

## 🚧 What Needs Work (Priority Order)

### 1. CRITICAL: Customer-Facing Pages (Ultra-Luxury Design)

#### A. Discovery Page (Venue Browser)
**Status**: Needs implementation  
**Priority**: HIGH  
**Description**: Customers browse and discover venues

**Features Needed**:
- Venue listing with filters (location, type, amenities)
- Map integration showing venue locations
- Venue cards with images, ratings, pricing
- Search functionality
- "View Details" links to individual venue pages

**Design**: Ultra-luxury (Aman Resorts style)
- Asymmetric card layouts
- Blurred hero images
- Sophisticated neutrals (#FAFAF9 background)
- Massive whitespace
- Cormorant Garamond headings

**API Endpoints**:
- `GET /api/public/venues` - List all active venues
- `GET /api/public/venues/{id}` - Get venue details

---

#### B. Menu Page (Customer Orders)
**Status**: Partially complete, needs refinement  
**Priority**: HIGH  
**Description**: Customers view menu and place orders

**Current Issues**:
- May have bright orange colors (needs to be removed)
- Needs premium design refinement
- Order placement flow needs testing

**Features Needed**:
- Category tabs (Drinks, Food, etc.)
- Product cards with images, descriptions, prices
- Add to cart functionality
- Cart summary and checkout
- Order confirmation

**Design Refinements**:
- NO ORANGE - use stone-50 for active tabs
- Cards: `bg-white/60 backdrop-blur-xl`
- Prices: Cormorant Garamond, text-3xl
- Replace emoji with actual photos
- Grid: `grid-cols-2 gap-8`

**API Endpoints**:
- `GET /api/public/venues/{venueId}/menu` - Get menu
- `POST /api/public/orders` - Place order

---

#### C. Review Page (Venue Rating)
**Status**: Exists but needs refinement  
**Priority**: MEDIUM  
**Description**: Customers rate their experience

**Features Needed**:
- Star rating system (1-5 stars)
- Text review input
- Photo upload (optional)
- Submit review

**Design Requirements**:
- Blurred venue image background (30% opacity)
- Minimal star outlines that fill on hover
- Massive whitespace
- Venue name: text-5xl font-light
- Vignette overlay

**API Endpoints**:
- `POST /api/public/venues/{venueId}/reviews` - Submit review
- `GET /api/public/venues/{venueId}/reviews` - Get reviews

---

### 2. IMPORTANT: Booking System

#### A. Zone Unit Booking (Customer Side)
**Status**: Backend exists, frontend needed  
**Priority**: HIGH  
**Description**: Customers book sunbeds, tables, cabanas

**Features Needed**:
- Zone unit availability calendar
- Time slot selection
- Guest count input
- Booking confirmation
- Payment integration (future)

**API Endpoints** (Already exist):
- `GET /api/public/venues/{venueId}/zones` - List zones
- `GET /api/public/zones/{zoneId}/units/available` - Check availability
- `POST /api/public/bookings` - Create booking

---

#### B. Booking Management (Staff Side)
**Status**: Partially complete in SunbedManager  
**Priority**: MEDIUM  
**Description**: Staff manage bookings (check-in, check-out, cancel)

**Features Needed**:
- View active bookings
- Check-in customers
- Check-out customers
- Cancel/no-show bookings
- Unit status management

**API Endpoints** (Already exist):
- `GET /api/business/venues/{venueId}/bookings` - List bookings
- `POST /api/business/venues/{venueId}/bookings/{id}/check-in`
- `POST /api/business/venues/{venueId}/bookings/{id}/check-out`
- `POST /api/business/venues/{venueId}/bookings/{id}/cancel`

---

### 3. NICE TO HAVE: Enhanced Features

#### A. Order Management (Staff Side)
**Status**: Backend exists, frontend needed  
**Priority**: MEDIUM  
**Description**: Staff view and manage customer orders

**Features Needed**:
- Order queue display
- Order status updates (pending, preparing, ready, delivered)
- Order details view
- Mark orders complete

**API Endpoints** (Already exist):
- `GET /api/business/Orders` - List orders
- `PUT /api/business/Orders/{id}/status` - Update status

---

#### B. Dashboard Analytics
**Status**: Basic implementation exists  
**Priority**: LOW  
**Description**: Enhanced analytics and reporting

**Features Needed**:
- Revenue charts
- Booking statistics
- Popular items
- Staff performance
- Customer insights

---

#### C. Notifications System
**Status**: Not implemented  
**Priority**: LOW  
**Description**: Real-time notifications for staff and customers

**Features Needed**:
- New order notifications (staff)
- Booking confirmations (customers)
- Order ready notifications (customers)
- Push notifications (future)

---

## 📋 Immediate Action Plan (Next 2 Weeks)

### Week 1: Customer-Facing Core
1. **Day 1-2**: Refine MenuPage to premium design standards
   - Remove all orange colors
   - Implement luxury design system
   - Test order placement flow

2. **Day 3-4**: Build Discovery Page
   - Venue listing with filters
   - Map integration
   - Premium card design
   - Search functionality

3. **Day 5**: Refine Review Page
   - Implement luxury design
   - Test review submission
   - Add photo upload (optional)

### Week 2: Booking System
1. **Day 1-3**: Build Customer Booking Flow
   - Zone unit selection
   - Availability calendar
   - Booking form
   - Confirmation page

2. **Day 4-5**: Enhance Staff Booking Management
   - Improve SunbedManager UI
   - Add check-in/check-out flows
   - Test booking lifecycle

---

## 🎯 Success Criteria

### Customer Experience
- [ ] Can discover venues easily
- [ ] Can view menus and place orders
- [ ] Can book sunbeds/tables
- [ ] Can leave reviews
- [ ] UI feels ultra-luxury ($20K+ quality)

### Staff Experience
- [ ] Can manage bookings efficiently
- [ ] Can view and process orders
- [ ] Can manage venue/menu in real-time
- [ ] UI is fast and functional (industrial minimalist)

### Business Management
- [ ] Can create and manage staff
- [ ] Can configure venues and zones
- [ ] Can update menus
- [ ] Can view analytics

---

## 🔧 Technical Debt to Address

1. **Testing**: Add unit tests for critical flows
2. **Error Handling**: Improve error messages and recovery
3. **Loading States**: Add skeleton loaders
4. **Offline Support**: Add service worker for PWA
5. **Performance**: Optimize images and lazy loading
6. **Accessibility**: WCAG compliance audit
7. **Mobile Optimization**: Test on various devices

---

## 💡 Future Enhancements (Post-MVP)

1. **Payment Integration**: Stripe/PayPal for bookings and orders
2. **Multi-language Support**: English, Albanian, Italian
3. **Loyalty Program**: Points and rewards
4. **Social Features**: Share reviews, invite friends
5. **Advanced Analytics**: AI-powered insights
6. **Mobile Apps**: Native iOS/Android apps
7. **QR Code System**: Table ordering via QR codes
8. **Inventory Management**: Stock tracking for products

---

## 📊 Current Status Summary

**Completion**: ~60%

**Admin/Staff Side**: 90% complete ✅
- SuperAdmin Dashboard: 100%
- Business Dashboard: 95%
- Staff Dashboards: 85%

**Customer Side**: 30% complete 🚧
- Discovery Page: 0%
- Menu Page: 60% (needs design refinement)
- Review Page: 40% (needs design refinement)
- Booking Flow: 0%

**Next Priority**: Customer-facing pages with ultra-luxury design
