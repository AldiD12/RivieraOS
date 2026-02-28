# XIXA Day/Night Toggle Implementation

**Date:** February 28, 2026  
**Status:** ⏳ In Progress  
**Goal:** Implement functional Day/Night mode toggle with complete theme switching

---

## Implementation Plan

### ✅ Phase 1: State Management (Complete)
- Added `isDayMode` state (default: false = night mode)
- Updated loading/error states to be theme-aware
- Updated main container background to be theme-aware
- Updated marker component to accept `isDayMode` prop
- Updated marker rendering to pass `isDayMode` prop

### ⏳ Phase 2: Header & Toggle (In Progress)
Need to update:
1. Day/Night toggle buttons to be functional (onClick handlers)
2. Header gradient backgrounds (stone-50 for day, zinc-950 for night)
3. XIXA title color (zinc-950 for day, white for night)
4. Pulsing dot (border for day, no border for night)
5. Notification button styling
6. List/Map toggle styling

### ⏳ Phase 3: Filter Pills
Need to update:
- Active filter: zinc-950 bg for day, zinc-950 bg + XIXA green text for night
- Inactive filters: white/80 for day, zinc-900/60 for night
- Border colors: zinc-200 for day, zinc-800 for night
- Text colors: zinc-500/zinc-950 for day, zinc-400/white for night

### ⏳ Phase 4: Map Controls
Need to update:
- Background: white/90 for day, zinc-900/90 for night
- Border: zinc-200 for day, zinc-800 for night
- Icon colors: zinc-600/zinc-950 for day, zinc-400/white for night
- Hover states

### ⏳ Phase 5: Search Bar & Bottom Nav
Need to update:
- Search bar background: white/70 for day, zinc-900/50 for night
- Search bar border: zinc-300 for day, zinc-800 for night
- Search bar text: zinc-900 for day, white for night
- Bottom nav background: white/60 for day, zinc-900/80 for night
- Bottom nav gradient overlay
- Icon colors and active states

### ⏳ Phase 6: Custom Styles
Need to update:
- pulse-ring animation border color (zinc-950 for day, #10FF88 for night)
- Mapbox control styling for both themes

---

## Theme Color Reference

### Day Mode (Light)
```
Background: stone-50 (#FAFAF9)
Grid: rgba(231, 229, 228, 0.6)
Decorative shapes: stone-200/40, border-stone-300
Text primary: zinc-950
Text secondary: zinc-500, zinc-600
Borders: zinc-200, zinc-300, zinc-400
Buttons: zinc-950 bg, white text
Active accent: XIXA green (#10FF88) with black outline
Markers: stone-50 bg, zinc-950 border
Shadows: subtle day-shadow
```

### Night Mode (Dark)
```
Background: zinc-950 (#09090B)
Grid: rgba(39, 39, 42, 0.3)
Decorative shapes: zinc-900/40, border-zinc-800
Text primary: white
Text secondary: zinc-400, zinc-500
Borders: zinc-700, zinc-800
Buttons: zinc-950 bg, XIXA green text
Active accent: XIXA green (#10FF88) with glow
Markers: zinc-950 bg, XIXA green border
Shadows: bio-glow effects
```

---

## Current Status

**Completed:**
- State management
- Loading/error states
- Main container theming
- Marker component theming
- Grid background pattern
- Decorative shapes

**Remaining:**
- Day/Night toggle onClick handlers
- Header section complete theming
- Filter pills complete theming
- Map controls complete theming
- Search bar complete theming
- Bottom navigation complete theming
- Custom CSS animations for both themes

---

## Next Steps

1. Add onClick handlers to Day/Night toggle buttons
2. Update header section with theme-aware classes
3. Update filter pills with theme-aware classes
4. Update map controls with theme-aware classes
5. Update search bar with theme-aware classes
6. Update bottom navigation with theme-aware classes
7. Update custom CSS for pulse-ring animation
8. Test theme switching
9. Verify all interactive elements work in both modes
10. Push to GitHub

---

## Technical Notes

### Toggle Implementation
```javascript
const [isDayMode, setIsDayMode] = useState(false); // false = night (default)

// In Day button:
onClick={() => setIsDayMode(true)}

// In Night button:
onClick={() => setIsDayMode(false)}
```

### Conditional Styling Pattern
```javascript
className={`base-classes ${isDayMode ? 'day-classes' : 'night-classes'}`}
```

### Marker Text Shadow (Day Mode Only)
```javascript
style={isDayMode ? {
  textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000'
} : {}}
```

---

**Estimated Completion:** 30-45 minutes  
**Complexity:** Medium (many conditional classes, but straightforward pattern)  
**Risk:** Low (all functionality preserved, only visual changes)
