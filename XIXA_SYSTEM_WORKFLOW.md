# XIXA System Workflow Documentation

## Overview
XIXA is a luxury hospitality discovery and booking platform with a two-track design philosophy: Ultra-Luxury for customer-facing interfaces and Industrial Minimalist for staff operations.

---

## System Architecture

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/
│   │   └── DiscoveryPage.jsx          # Main customer interface
│   ├── components/
│   │   ├── BusinessBottomSheet.jsx    # Business details modal
│   │   ├── VenueBottomSheet.jsx       # Individual venue details
│   │   └── EventsView.jsx             # Night mode events display
│   └── services/
│       ├── venueApi.js                # Venue data & availability
│       └── eventsApi.js               # Events data & filtering
```

### Backend APIs Available
- **Venue Management**: CRUD operations, availability tracking
- **Events System**: Event creation, publishing, filtering
- **Business Grouping**: Venues grouped by business/location
- **Real-time Updates**: SignalR for live availability
- **User Authentication**: Role-based access control

---

## User Journey Workflows

### 1. Customer Discovery Flow

#### Day Mode (Venue Discovery)
```
Customer opens XIXA
    ↓
Lands on DiscoveryPage (Day Mode)
    ↓
Sees luxury interface with:
- Cormorant Garamond typography
- Stone/amber color palette
- Premium card designs
    ↓
Can toggle between MAP VIEW and LIST VIEW
    ↓
Filters available:
- ALL VENUES
- BEACH CLUBS (shows sunbed availability)
- RESTAURANTS
- BARS
- BOATS
    ↓
Clicks on business marker/card
    ↓
BusinessBottomSheet opens with:
- Pure Restaurant/Beach → Shows individual venues
- Mixed/Other businesses → Shows features/amenities grid
    ↓
For bookable venues → VenueBottomSheet with booking options
```

#### Night Mode (Events Discovery)
```
Customer toggles to NIGHT MODE
    ↓
Interface transforms to industrial design:
- Anton display fonts
- Zinc-950 backgrounds
- Sharp corners, high contrast
    ↓
Event-specific filters appear:
- ALL EVENTS
- TODAY
- WEEKEND
- VIP TABLES
- FREE ENTRY
    ↓
Events displayed as full-screen cards with:
- Background venue images
- Event details overlay
- "CONFIRM ACCESS" buttons
    ↓
Events filtered by:
- Date/time calculations
- VIP status detection
- Venue availability
```

### 2. Business Display Logic

#### Business Types & Display Rules
```
Business Analysis:
    ↓
Check venue types in business
    ↓
Pure Restaurant (only restaurant venues)
    → Show individual venue list
    → Enable booking flow
    ↓
Pure Beach Club (only beach venues)  
    → Show individual venue list
    → Display sunbed availability
    → Enable booking flow
    ↓
Mixed Business (restaurant + bar + beach)
    → Show features/amenities grid
    → Contact for reservations
    ↓
Pure Bar/Boat/Other
    → Show features/amenities grid
    → Contact for reservations
```

#### Availability Display Rules
```
Venue Type Check:
    ↓
Beach Venues:
- Show availability counts (sunbeds)
- Color-coded status badges
- Real-time updates
    ↓
Non-Beach Venues (Restaurant/Bar/Boat):
- Show venue type icons
- No availability numbers
- Focus on experience/features
```

---

## Technical Implementation

### 3. Data Flow Architecture

#### Venue Data Pipeline
```
Backend Database
    ↓
Venue API (/api/venues)
    ↓
Frontend venueApi.js service
    ↓
DiscoveryPage state management
    ↓
Business grouping logic
    ↓
Map markers + List cards
    ↓
BusinessBottomSheet component
    ↓
Individual venue selection
    ↓
VenueBottomSheet booking flow
```

#### Events Data Pipeline
```
Backend Database
    ↓
Events API (/api/events/public)
    ↓
Frontend eventsApi.js service
    ↓
Event filtering logic:
- Date calculations (today, weekend)
- VIP detection (price > €50)
- Free entry detection (price = €0)
    ↓
EventsView component rendering
    ↓
Industrial-styled event cards
```

### 4. State Management Flow

#### DiscoveryPage State
```javascript
// Core state variables
const [isDayMode, setIsDayMode] = useState(true);
const [isMapView, setIsMapView] = useState(true);
const [venues, setVenues] = useState([]);
const [events, setEvents] = useState([]);
const [selectedBusiness, setSelectedBusiness] = useState(null);
const [selectedVenue, setSelectedVenue] = useState(null);
const [activeFilter, setActiveFilter] = useState('ALL');

// State transitions
Day Mode ↔ Night Mode (toggles interface & filters)
Map View ↔ List View (changes layout)
Filter Selection → Content filtering
Business Selection → Bottom sheet display
Venue Selection → Booking flow
```

---

## Design System Implementation

### 5. Two-Track Design Philosophy

#### Customer-Facing (Ultra-Luxury)
**Standard**: $20,000+ design agency quality
**Inspiration**: Aman Resorts, Soho House, Park Hyatt

```css
/* Typography */
Headings: 'Cormorant Garamond', serif (text-6xl, font-light)
Body: 'Inter', sans-serif (text-lg, leading-relaxed)
Colors: Stone/amber palette (#FAFAF9, #92400E)

/* Components */
Cards: rounded-[2rem], subtle shadows, backdrop-blur
Buttons: rounded-full, tracking-widest, uppercase
Animations: 500ms duration, ease-out transitions
```

#### Staff-Facing (Industrial Minimalist)
**Philosophy**: Fast, efficient, readable

```css
/* Typography */
Font: Inter (Tailwind default)
Sizes: Large (4xl-6xl) for key info
Colors: White on black, high contrast

/* Components */
Sharp corners: rounded-md, rounded-lg
No shadows or gradients
1-2px borders, tight spacing
```

### 6. Component Styling Rules

#### Day Mode Styling
```css
/* Backgrounds */
Primary: #FAFAF9 (warm off-white)
Cards: bg-gradient-to-br from-white to-stone-50/50

/* Text Colors */
Primary: #1C1917 (stone-900)
Secondary: #57534E (stone-600)
Muted: #78716C (stone-500)

/* Interactive Elements */
Buttons: bg-stone-900 text-stone-50
Borders: border-stone-200/40 (barely visible)
```

#### Night Mode Styling
```css
/* Backgrounds */
Primary: bg-zinc-950
Cards: bg-zinc-900/95 backdrop-blur-2xl

/* Text Colors */
Primary: text-white
Secondary: text-zinc-400
Accent: text-[#10FF88] (bioluminescent green)

/* Interactive Elements */
Buttons: border-2 border-white
HUD Elements: [ POOL BAR ] brackets styling
```

---

## Feature Specifications

### 7. Filtering System

#### Day Mode Filters (Venue-based)
```javascript
const dayFilters = [
  'ALL VENUES',      // Shows all venue types
  'BEACH CLUBS',     // Beach venues only + availability
  'RESTAURANTS',     // Restaurant venues only
  'BARS',           // Bar venues only  
  'BOATS'           // Boat venues only
];
```

#### Night Mode Filters (Event-based)
```javascript
const nightFilters = [
  'ALL EVENTS',     // All published events
  'TODAY',          // Events happening today
  'WEEKEND',        // Friday-Sunday events
  'VIP TABLES',     // Events with price > €50
  'FREE ENTRY'      // Events with price = €0
];
```

### 8. Availability System

#### Beach Venue Availability
```javascript
// Availability calculation
const isAvailable = venue.availableUnitsCount >= 15;
const isFewLeft = venue.availableUnitsCount > 0 && venue.availableUnitsCount < 15;
const isFull = venue.availableUnitsCount === 0;

// Status badges
Available: bg-emerald-50 text-emerald-700
Few Left: bg-amber-50 text-amber-700  
Full: bg-stone-100 text-stone-600
```

#### Non-Beach Venues
```javascript
// No availability display
// Show venue type icons instead
// Focus on experience/features
```

---

## User Interface Layouts

### 9. Layout Structure

#### Fixed Header (Sticky Top)
```html
<header className="fixed top-0 w-full z-50 bg-zinc-950/90 backdrop-blur-md">
  <!-- Logo, Day/Night toggle, Notifications -->
  <!-- List/Map toggle (right-aligned) -->
  <!-- Filter pills (horizontally scrollable) -->
</header>
```

#### Scrollable Content Area
```html
<main className="pt-[180px] pb-[100px]">
  <!-- Map View: Mapbox GL with custom markers -->
  <!-- List View: Business cards grid -->
  <!-- Event Cards: Full-screen industrial design -->
</main>
```

#### Bottom Sheets (Modal Overlays)
```html
<!-- BusinessBottomSheet: Business details + venue list/features -->
<!-- VenueBottomSheet: Individual venue booking -->
<!-- EventsView: Night mode event display -->
```

### 10. Responsive Behavior

#### Mobile Optimizations
- Touch-friendly button sizes (44px minimum)
- Swipe gestures for bottom sheets
- Horizontal scroll for filter pills
- Optimized map controls

#### Desktop Enhancements
- Hover states with luxury animations
- Larger typography scales
- Extended whitespace
- Multi-column layouts

---

## Integration Points

### 11. API Endpoints

#### Venue Management
```
GET /api/venues - List all venues
GET /api/venues/{id} - Venue details
GET /api/venues/{id}/availability - Real-time availability
POST /api/venues/{id}/book - Create booking
```

#### Events System
```
GET /api/events/public - Published events only
GET /api/events/{id} - Event details
POST /api/events/{id}/register - Event registration
```

#### Business Grouping
```
GET /api/businesses - Grouped venue data
GET /api/businesses/{id}/venues - Business venue list
```

### 12. Real-time Features

#### SignalR Integration
```javascript
// Availability updates
connection.on('AvailabilityUpdated', (venueId, newCount) => {
  // Update venue availability in real-time
});

// Event updates
connection.on('EventPublished', (eventData) => {
  // Add new event to display
});
```

---

## Quality Assurance

### 13. Design System Checklist

#### Customer-Facing Pages
- [ ] $20,000+ design agency quality
- [ ] Aman Resorts/Soho House aesthetic
- [ ] Massive whitespace and breathing room
- [ ] Sophisticated stone/amber colors
- [ ] Cormorant Garamond + Inter typography
- [ ] Subtle shadows and organic corners
- [ ] 500ms+ luxury animations
- [ ] NO bright orange anywhere

#### Staff-Facing Pages  
- [ ] Industrial minimalist design
- [ ] High contrast white on black
- [ ] Sharp corners and flat design
- [ ] Dense, efficient layouts
- [ ] Fast loading and interaction
- [ ] Clear information hierarchy

### 14. Performance Standards

#### Loading Targets
- Initial page load: < 2 seconds
- Map rendering: < 1 second
- Filter switching: < 500ms
- Bottom sheet animation: 300ms

#### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

---

## Future Roadmap

### 15. Planned Enhancements

#### Phase 1: Core Improvements
- Advanced search functionality
- User preference saving
- Booking history tracking
- Push notifications

#### Phase 2: Premium Features
- VIP member benefits
- Personalized recommendations
- Social sharing integration
- Review and rating system

#### Phase 3: Business Intelligence
- Analytics dashboard
- Revenue optimization
- Predictive availability
- Dynamic pricing

---

## Troubleshooting Guide

### 16. Common Issues

#### Events Not Showing
**Problem**: Events don't appear in night mode
**Solution**: SuperAdmin must publish events via admin dashboard

#### Availability Not Updating
**Problem**: Sunbed counts seem outdated
**Solution**: Check SignalR connection, verify API endpoints

#### Business Bottom Sheet Wrong Display
**Problem**: Shows venues instead of features
**Solution**: Verify venue type data, check shouldShowVenues logic

#### Design System Violations
**Problem**: Components don't match luxury standard
**Solution**: Review premium-design-system.md guidelines

---

## Development Workflow

### 17. Code Organization

#### Component Structure
```
Each component follows:
1. Imports and dependencies
2. Props interface/types
3. State management
4. Event handlers
5. Render logic with conditional styling
6. Export statement
```

#### Styling Approach
```
1. Tailwind CSS for utility-first styling
2. Conditional classes based on isDayMode
3. Design system variables for consistency
4. Component-specific customizations
5. Responsive breakpoints
```

### 18. Testing Strategy

#### Unit Testing
- Component rendering
- State management
- Event handlers
- API integration

#### Integration Testing
- User journey flows
- Cross-component communication
- API data flow
- Real-time updates

#### Visual Testing
- Design system compliance
- Responsive layouts
- Animation smoothness
- Cross-browser compatibility

---

*Last Updated: March 6, 2026*
*Version: 2.0*
*Status: Production Ready*