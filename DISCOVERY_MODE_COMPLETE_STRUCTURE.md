# Discovery Mode - Complete Structure & Features

**Date:** February 28, 2026  
**Status:** ✅ Complete  
**Page:** DiscoveryPage.jsx

---

## Overview

Discovery Mode is XIXA's venue exploration interface with dual themes (Day/Night) and dual views (Map/List). It provides an atmospheric, tech-forward experience for discovering beach clubs, boats, and dining venues across the Albanian Riviera.

---

## Core Features

### 1. Theme System (Day/Night Toggle)

**Toggle Location:** Top center of header  
**Default:** Night mode (isDayMode = false)

#### Night Mode (Default)
- Background: `zinc-950` (#09090B)
- Grid pattern: `rgba(39, 39, 42, 0.3)`
- Accent color: XIXA green (#10FF88) with glow effects
- Decorative shapes: `zinc-900/40` with `zinc-800` borders
- Text: White primary, `zinc-400` secondary
- Aesthetic: Dark, atmospheric, tech-forward

#### Day Mode
- Background: `stone-50` (#FAFAF9)
- Grid pattern: `rgba(231, 229, 228, 0.6)`
- Accent color: XIXA green (#10FF88) with black outline
- Decorative shapes: `stone-200/40` with `stone-300` borders
- Text: `zinc-950` primary, `zinc-500` secondary
- Aesthetic: Clean, bright, minimalist

---

### 2. View System (Map/List Toggle)

**Toggle Location:** Top right of header  
**Default:** Map view (viewMode = 'map')

#### Map View
- Full Mapbox GL integration
- Custom dark style: `mapbox://styles/aldid1602/cmm3bp5b3001v01qy9yf3gzlo`
- Interactive venue markers with pulsing rings
- Zoom/pan controls (right side)
- Location button
- NavigationControl (bottom-right)
- Cooperative gestures when bottom sheet open

#### List View
- Scrollable venue cards
- Full venue details with images
- Status badges (Available/Few Left or LIVE NOW/FILLING FAST)
- Favorite buttons
- Location badges
- Ratings display
- Min spend & vibe info
- Reserve buttons

---

## Component Structure

### Header Section (Fixed Top)

```
┌─────────────────────────────────────────────────────┐
│  [Day/Night Toggle - Center]                        │
│                                                      │
│  XIXA                              [🔔] [List|Map]  │
│  • Albanian Riviera                                  │
│                                                      │
│  [ALL VENUES] [BEACH CLUBS] [BOATS] [DINING]       │
└─────────────────────────────────────────────────────┘
```

**Components:**
1. Day/Night toggle (centered, absolute positioned)
2. XIXA title (Playfair Display serif, 4xl)
3. Status dot (pulsing XIXA green)
4. Location subtitle (mono, uppercase, tracking-widest)
5. Notification button (top-right)
6. List/Map toggle (top-right)
7. Filter pills (horizontal scroll)

**Styling:**
- Gradient background: `from-{theme} via-{theme}/90 to-transparent`
- Backdrop blur: `backdrop-blur-xl`
- Border bottom: `border-{theme}`
- Padding: `pt-14 px-6 pb-12`

---

### Map View Components

#### Venue Markers
**Types:**
1. **Highlighted (15+ available):**
   - Size: `w-10 h-10`
   - Pulsing ring animation
   - XIXA green border (night) / zinc-950 border (day)
   - Glow effect (night only)
   - Label on hover/selection

2. **Standard (1-14 available):**
   - Size: `w-8 h-8`
   - XIXA green border (night) / zinc-950 border (day)
   - No pulsing ring

3. **Full (0 available):**
   - Size: `w-5 h-5`
   - Muted colors
   - No interaction

**Marker Content:**
- Available count (font-mono, bold)
- Text shadow (day mode only)
- Venue name label (on hover/selection)

#### Map Controls (Right Side)
1. **Location Button:**
   - Rounded-full
   - My location icon
   - Hover: XIXA green (night) / zinc-950 (day)

2. **Zoom Controls:**
   - Vertical stack
   - Plus/minus buttons
   - Rounded-full container

---

### List View Components

#### Venue Card Structure

```
┌─────────────────────────────────────────────────────┐
│  [Image with gradient overlay]                      │
│  [Status Badge]                    [Favorite ♡]     │
│  [Location Badge]                                    │
├─────────────────────────────────────────────────────┤
│  Venue Name                              ★ 4.8 (128)│
│  Description text...                                 │
│                                                      │
│  Min. Spend: €200/bed    |    Vibe: High Energy    │
│                                                      │
│  [RESERVE BUTTON]                           [→]     │
└─────────────────────────────────────────────────────┘
```

**Card Components:**

1. **Image Section (h-64):**
   - Venue image (grayscale effect)
   - Hover: scale-105, remove grayscale
   - Gradient overlay: `from-black/60 to-transparent`
   - Status badge (top-left)
   - Favorite button (top-right)
   - Location badge (bottom-left)

2. **Info Section (p-5):**
   - Venue name (font-serif, text-2xl)
   - Star rating (top-right)
   - Description (2 lines, clamp)
   - Grid info (min spend, vibe)
   - Action buttons (Reserve + Arrow)

**Status Badges:**

Night Mode:
- Available (15+): `bg-zinc-950` + XIXA green dot + "LIVE NOW"
- Few Left (1-14): `bg-zinc-900` + amber dot + "FILLING FAST"

Day Mode:
- Available (15+): `bg-emerald-500` + white text + "Available"
- Few Left (1-14): `bg-white` + zinc text + "Few Left"

---

### Bottom Navigation (Fixed Bottom)

```
┌─────────────────────────────────────────────────────┐
│  [Search Bar with icon and filter button]          │
│                                                      │
│  [🌍 DISCOVER] [♡ SAVED] [🎫 BOOKINGS] [👤 PROFILE]│
└─────────────────────────────────────────────────────┘
```

**Components:**
1. **Search Bar:**
   - Placeholder: "Find elite venues, yachts..."
   - Search icon (left)
   - Filter button (right)
   - Focus: XIXA green ring (night) / zinc-950 ring (day)

2. **Navigation Tabs:**
   - 4 equal-width buttons
   - Active: XIXA green with glow (night) / zinc-950 (day)
   - Inactive: zinc-500, hover to white/zinc-950
   - Active indicator dot below

**Styling:**
- Gradient background: `from-{theme} via-{theme}/95 to-transparent`
- Backdrop blur: `backdrop-blur-xl`
- Border: `border-{theme}`
- Rounded: `rounded-2xl`

---

## State Management

### Core States
```javascript
const [venues, setVenues] = useState([]);
const [selectedVenue, setSelectedVenue] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [viewState, setViewState] = useState(RIVIERA_CENTER);
const [activeFilter, setActiveFilter] = useState('all');
const [isDayMode, setIsDayMode] = useState(false);
const [viewMode, setViewMode] = useState('map');
```

### Filter Options
```javascript
const VENUE_FILTERS = [
  { id: 'all', label: 'ALL VENUES' },
  { id: 'Beach', label: 'BEACH CLUBS' },
  { id: 'Boat', label: 'BOATS' },
  { id: 'Restaurant', label: 'DINING' }
];
```

---

## API Integration

### Endpoints Used
1. `venueApi.getVenues()` - Load all venues
2. `venueApi.getVenueAvailability(venueId)` - Get real-time availability

### Data Flow
1. Load venues on mount
2. Filter venues by type
3. Display on map or list
4. Click venue → load availability → show bottom sheet
5. Close bottom sheet → fly back to overview

---

## Animations & Interactions

### Marker Animations
```css
@keyframes pulse-ring {
  0% { 
    transform: scale(0.8); 
    opacity: 0.5; 
    border-color: [theme-color]; 
  }
  100% { 
    transform: scale(2.5); 
    opacity: 0; 
    border-color: transparent; 
  }
}
```

### Hover Effects
- Cards: `hover:-translate-y-2` (map view only)
- Images: `hover:scale-105` (700ms duration)
- Buttons: `hover:bg-{theme}` (300ms duration)
- Markers: `hover:scale-110`

### Transitions
- Theme switch: All elements transition smoothly
- View switch: Instant (no animation)
- Filter change: Instant marker update
- Venue selection: Fly animation (1500ms)

---

## Responsive Behavior

### Mobile First
- All components designed for mobile
- Touch-friendly tap targets (min 44x44px)
- Horizontal scroll for filters
- Bottom sheet for venue details
- Cooperative gestures on map

### Breakpoints
- Mobile: Default (< 768px)
- Tablet: Same layout (768px - 1024px)
- Desktop: Same layout (> 1024px)

Note: Discovery Mode is mobile-first and maintains the same layout across all screen sizes.

---

## Theme Color Reference

### Night Mode Colors
```
Background: zinc-950 (#09090B)
Grid: rgba(39, 39, 42, 0.3)
Shapes: zinc-900/40, border-zinc-800
Text Primary: white
Text Secondary: zinc-400
Accent: XIXA green (#10FF88)
Borders: zinc-800
Cards: zinc-900, border-zinc-800
Buttons: zinc-950 bg, XIXA green text
Shadows: bio-glow effects
```

### Day Mode Colors
```
Background: stone-50 (#FAFAF9)
Grid: rgba(231, 229, 228, 0.6)
Shapes: stone-200/40, border-stone-300
Text Primary: zinc-950
Text Secondary: zinc-500
Accent: XIXA green (#10FF88)
Borders: zinc-200, zinc-300
Cards: white, border-zinc-300
Buttons: zinc-950 bg, white text
Shadows: subtle day-shadow
```

---

## Typography

### Fonts
- Title: Playfair Display (serif)
- Body: Inter (sans-serif)
- Mono: JetBrains Mono (for codes/labels)

### Sizes
- Page title: `text-4xl` (XIXA)
- Venue names: `text-2xl` (serif)
- Labels: `text-[10px]` (uppercase, tracking-widest)
- Body: `text-xs` to `text-sm`
- Buttons: `text-xs` (uppercase, tracking-widest)

---

## File Structure

```
frontend/src/pages/DiscoveryPage.jsx
├── Imports
├── Constants (MAPBOX_TOKEN, DARK_STYLE, RIVIERA_CENTER, VENUE_FILTERS)
├── VenueMarker Component
├── DiscoveryPage Component
│   ├── State Management
│   ├── Effects & Handlers
│   ├── Loading State
│   ├── Error State
│   ├── Main Render
│   │   ├── Background (grid + shapes)
│   │   ├── Map View (conditional)
│   │   ├── List View (conditional)
│   │   ├── Header (fixed top)
│   │   ├── Map Controls (conditional)
│   │   ├── Bottom Navigation (fixed bottom)
│   │   ├── Bottom Sheet (conditional)
│   │   └── Custom Styles
└── Export
```

---

## Design Files Reference

### HTML Prototypes (design-handoff/)
1. `discoverModeNight.md` - Night mode map view
2. `discoverModeDay.md` - Day mode map view
3. `discoverModeNightList.md` - Night mode list view
4. `discoverModeDayList.md` - Day mode list view

### Implementation Docs
1. `XIXA_DAY_NIGHT_TOGGLE_IMPLEMENTATION.md` - Theme toggle guide
2. `DISCOVERY_MODE_COMPLETE_DEEP_ANALYSIS.md` - Original analysis
3. `XIXA_ATMOSPHERIC_RADAR_COMPLETE.md` - Marker system

---

## Key Features Summary

✅ Dual theme system (Day/Night)  
✅ Dual view system (Map/List)  
✅ Real-time venue availability  
✅ Interactive Mapbox integration  
✅ Pulsing marker animations  
✅ Status badges (Available/Few Left)  
✅ Filter by venue type  
✅ Search functionality (UI only)  
✅ Favorite buttons (UI only)  
✅ Bottom sheet venue details  
✅ Smooth theme transitions  
✅ Mobile-first responsive  
✅ XIXA tech aesthetic  

---

## Future Enhancements

### Planned Features
- [ ] Search functionality (backend integration)
- [ ] Favorite venues (save to profile)
- [ ] Distance calculation (user location)
- [ ] Real-time availability updates (SignalR)
- [ ] Venue filtering by price range
- [ ] Sort by distance/rating/price
- [ ] Map clustering for many venues
- [ ] Venue comparison mode
- [ ] Share venue links
- [ ] Recent searches

### Technical Improvements
- [ ] Lazy load venue images
- [ ] Cache venue data
- [ ] Optimize marker rendering
- [ ] Add loading skeletons
- [ ] Error boundary
- [ ] Analytics tracking
- [ ] A/B testing framework

---

## Testing Checklist

### Functional Tests
- [ ] Day/Night toggle switches theme
- [ ] List/Map toggle switches view
- [ ] Filter pills filter venues
- [ ] Venue click opens bottom sheet
- [ ] Bottom sheet close returns to overview
- [ ] Map zoom/pan works
- [ ] Location button works
- [ ] Markers display correctly
- [ ] Status badges show correct state

### Visual Tests
- [ ] Theme colors match design
- [ ] Typography matches design
- [ ] Spacing matches design
- [ ] Animations smooth
- [ ] Hover states work
- [ ] Mobile layout correct
- [ ] No layout shift
- [ ] Images load properly

### Performance Tests
- [ ] Initial load < 3s
- [ ] Theme switch < 100ms
- [ ] View switch < 100ms
- [ ] Smooth 60fps animations
- [ ] No memory leaks
- [ ] Efficient re-renders

---

## Deployment Status

**Live URL:** https://riviera-os.vercel.app  
**Last Deploy:** February 28, 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

---

## Credits

**Design:** XIXA Tech Aesthetic  
**Development:** Riviera OS Team  
**Map Provider:** Mapbox GL  
**Fonts:** Google Fonts (Inter, Playfair Display)  
**Icons:** Heroicons (SVG)

---

*End of Discovery Mode Structure Documentation*
