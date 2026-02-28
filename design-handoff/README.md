# Design Handoff System

This folder is for HTML/CSS designs that need to be integrated into the React codebase.

## How It Works

1. **You:** Drop your HTML design files here (e.g., `discovery-page-v2.html`)
2. **Kiro:** Analyzes the HTML, extracts the design, and integrates it into the corresponding React component
3. **Result:** Your design is live in the app without breaking any functionality

---

## Folder Structure

```
design-handoff/
├── README.md                    # This file
├── discovery-page/              # Discovery page designs
│   ├── v1.html                  # Version 1
│   ├── v2.html                  # Version 2
│   └── notes.md                 # Design notes
├── menu-page/                   # Menu page designs
├── review-page/                 # Review page designs
├── spot-page/                   # Spot page designs
├── booking-status-page/         # Booking status designs
└── templates/                   # Reusable component templates
```

---

## Design File Format

### Option 1: Complete HTML Page
```html
<!DOCTYPE html>
<html>
<head>
  <title>Discovery Page Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Your design here -->
  <div class="h-screen bg-white">
    <!-- ... -->
  </div>
</body>
</html>
```

### Option 2: HTML Fragment
```html
<!-- Just the main content -->
<div class="h-screen bg-white">
  <header class="...">
    <!-- ... -->
  </header>
  <main class="...">
    <!-- ... -->
  </main>
</div>
```

### Option 3: With Notes
```html
<!DOCTYPE html>
<html>
<head>
  <title>Discovery Page v2</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!--
  DESIGN NOTES:
  - Light mode only
  - Lime green accent: #84d53f
  - Keep map functionality intact
  - Preserve VenueBottomSheet integration
  -->
  
  <div class="h-screen bg-white">
    <!-- Your design -->
  </div>
</body>
</html>
```

---

## What Kiro Will Do

When you add a design file, Kiro will:

1. **Analyze** the HTML structure and styling
2. **Extract** Tailwind classes and custom CSS
3. **Identify** interactive elements (buttons, inputs, etc.)
4. **Map** to existing React components
5. **Preserve** all functionality:
   - API calls
   - State management
   - Event handlers
   - Data flow
   - Routing
6. **Integrate** the design into the React component
7. **Test** for errors
8. **Report** what was changed

---

## What Gets Preserved

Kiro will NEVER break:
- ✅ API calls (venueApi, collectorApi, etc.)
- ✅ State management (useState, useEffect)
- ✅ Event handlers (onClick, onChange, etc.)
- ✅ Data flow (props, context)
- ✅ Routing (React Router)
- ✅ Real-time updates (SignalR)
- ✅ Form validation
- ✅ Error handling

---

## Example Workflow

### Step 1: You Create Design
```bash
# Create a new design file
design-handoff/discovery-page/v3-light-mode.html
```

### Step 2: You Tell Kiro
```
"Kiro, implement the design in design-handoff/discovery-page/v3-light-mode.html"
```

### Step 3: Kiro Integrates
```
✅ Analyzed HTML structure
✅ Extracted Tailwind classes
✅ Mapped to DiscoveryPage.jsx
✅ Preserved map functionality
✅ Preserved VenueBottomSheet
✅ Preserved API calls
✅ No diagnostics errors
✅ Ready to test
```

---

## Page Mapping

| Design Folder | React Component | API Services |
|--------------|-----------------|--------------|
| `discovery-page/` | `frontend/src/pages/DiscoveryPage.jsx` | `venueApi.js` |
| `menu-page/` | `frontend/src/pages/MenuPage.jsx` | `menuApi.js` |
| `review-page/` | `frontend/src/pages/ReviewPage.jsx` | `feedbackApi.js` |
| `spot-page/` | `frontend/src/pages/SpotPage.jsx` | `venueApi.js`, `menuApi.js` |
| `booking-status-page/` | `frontend/src/pages/BookingStatusPage.jsx` | `reservationApi.js` |
| `booking-action-page/` | `frontend/src/pages/BookingActionPage.jsx` | `collectorApi.js` |

---

## Tips for Best Results

### 1. Use Tailwind Classes
```html
<!-- Good -->
<div class="bg-white p-4 rounded-lg shadow-md">

<!-- Avoid -->
<div style="background: white; padding: 16px;">
```

### 2. Mark Dynamic Content
```html
<!-- Use comments to mark where data goes -->
<h1 class="text-4xl">
  <!-- VENUE_NAME -->
  Hotel Coral Beach
</h1>

<p class="text-lg">
  <!-- AVAILABLE_UNITS -->
  12 sunbeds available
</p>
```

### 3. Mark Interactive Elements
```html
<!-- Mark what should happen on click -->
<button class="bg-lime-500 px-4 py-2 rounded-full">
  <!-- onClick: handleVenueClick -->
  View Details
</button>
```

### 4. Include Design Notes
```html
<!--
DESIGN NOTES:
- Light mode only (no dark: classes)
- Lime green accent: #84d53f
- Keep pulsing animations
- Preserve map zoom/pan
- Bottom sheet should slide up on marker click
-->
```

---

## Common Patterns

### Map Integration
```html
<!-- Kiro will preserve Mapbox integration -->
<div class="h-screen relative">
  <!-- MAP_CONTAINER -->
  <div id="map" class="absolute inset-0"></div>
  
  <!-- Your overlays -->
  <header class="absolute top-0 ...">
    <!-- ... -->
  </header>
</div>
```

### Filter Pills
```html
<!-- Kiro will wire up filter logic -->
<div class="flex space-x-3">
  <!-- FILTER: all -->
  <button class="px-5 py-2 rounded-full bg-slate-900 text-white">
    All Venues
  </button>
  
  <!-- FILTER: Beach -->
  <button class="px-5 py-2 rounded-full bg-white border">
    Beach Clubs
  </button>
</div>
```

### Search Bar
```html
<!-- Kiro will add state management -->
<input 
  class="w-full px-4 py-3 rounded-xl border"
  placeholder="Find elite venues..."
  <!-- BIND: searchQuery -->
/>
```

---

## Testing After Integration

After Kiro integrates your design:

1. **Visual Check:** Does it look like your design?
2. **Interaction Check:** Do buttons/inputs work?
3. **Data Check:** Does real data display correctly?
4. **Mobile Check:** Does it work on mobile?
5. **Integration Check:** Do modals/sheets still work?

---

## Rollback

If something breaks, Kiro can rollback:
```
"Kiro, rollback DiscoveryPage to previous version"
```

Git history is preserved, so nothing is lost.

---

## Questions?

Just ask Kiro:
- "How do I mark dynamic content?"
- "Can you show me an example design file?"
- "What happens to my API calls?"
- "How do I preserve animations?"

---

**Ready to use!** Drop your HTML designs in the appropriate folder and tell Kiro to integrate them.
