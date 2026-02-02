# Mobile Discovery Map - Requirements

## Overview
Transform the web-based discovery map into a native mobile experience using React Native (Expo), featuring "Minority Report" style physics, tactile interactions, and a Day/Night mode system that feels cinematic and immersive.

## Target Platform
- **Framework**: React Native via Expo (TypeScript)
- **Styling**: NativeWind (Tailwind for React Native)
- **Animation**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **Visual Effects**: Expo Blur

## User Stories

### 1. Core Experience
**As a guest**, I want to explore nearby venues on an immersive mobile map so that I can discover places with a premium, tactile interface.

**Acceptance Criteria:**
- 1.1 App launches with dark vignette background (#09090b edges to #18181b center)
- 1.2 Content flows under translucent status bar for full immersion
- 1.3 Map displays venue pins with real-time data
- 1.4 All interactive elements provide haptic feedback
- 1.5 Performance maintains 60fps during all animations

### 2. Visual Foundation (The Atmosphere)
**As a user**, I want the app to feel like premium hardware with physical depth so that interactions feel tangible and luxurious.

**Acceptance Criteria:**
- 2.1 ScreenBackground component creates dark vignette effect
- 2.2 Custom fonts load correctly:
  - InterTight-Medium for Day/Ops Mode
  - PlayfairDisplay-Bold for Night/Bloom Mode
- 2.3 Status bar is light and translucent
- 2.4 Safe area is handled correctly with content extending to screen edges
- 2.5 Dark theme (#09090b base) is consistent throughout

### 3. Glass Morphism (Hardware Feel)
**As a user**, I want UI panels to look like physical glass with highlighted edges so that the interface feels like real hardware.

**Acceptance Criteria:**
- 3.1 HardwareGlass component uses BlurView with intensity 30, dark tint
- 3.2 Gradient border simulated using LinearGradient wrapper:
  - Colors: ['rgba(161,161,170,0.6)', 'rgba(39,39,42,0.1)']
  - 1px padding acts as border width
- 3.3 Inner content has dark background with 0.7 opacity
- 3.4 Glass panels are reusable across venue cards, filters, and overlays
- 3.5 Blur effect performs smoothly without frame drops

### 4. Tactile Physics (The Feel)
**As a user**, I want every touch to feel physical with haptic feedback so that interactions feel responsive and premium.

**Acceptance Criteria:**
- 4.1 useTactilePress() hook triggers light haptic on all button presses
- 4.2 Haptics use expo-haptics ImpactFeedbackStyle.Light
- 4.3 Haptic feedback fires immediately on touch (no delay)
- 4.4 All interactive elements (buttons, cards, pins) have haptic feedback
- 4.5 Haptics are disabled if user has system haptics turned off

### 5. Day/Night Mode Switch (Cinderella Effect)
**As a user**, I want to toggle between Day (Ops) and Night (Bloom) modes with a cinematic transition so that the experience feels magical.

**Acceptance Criteria:**
- 5.1 Mode toggle button is easily accessible
- 5.2 Glitch effect on mode switch:
  - Root view shakes with random X/Y translation (-2 to 2) for 300ms
  - Uses Reanimated useAnimatedStyle
- 5.3 Text colors interpolate smoothly over 500ms:
  - Day: Gray tones
  - Night: Neon Cyan/Fuchsia
- 5.4 Font family switches:
  - Day: InterTight-Medium
  - Night: PlayfairDisplay-Bold
- 5.5 Map pins pulse with animated shadowOpacity in Night Mode
- 5.6 Transition maintains 60fps throughout

### 6. Venue Detail Card (Bottom Sheet Physics)
**As a user**, I want to swipe venue cards with realistic physics so that interactions feel natural and satisfying.

**Acceptance Criteria:**
- 6.1 VenueDetailCard appears as bottom sheet
- 6.2 PanGestureHandler enables drag interaction
- 6.3 Card follows finger during drag
- 6.4 Dismissal logic:
  - High velocity (>500): Card dismisses
  - Low velocity: Card snaps back with spring animation
- 6.5 Spring physics: damping 15, stiffness 120
- 6.6 Card overshoots slightly when opening, then settles (elasticity)
- 6.7 Background dims when card is open
- 6.8 Card can be dismissed by tapping dimmed background

### 7. Map Pins & Data Visualization
**As a user**, I want to see venue locations with real-time status indicators so that I can make informed decisions.

**Acceptance Criteria:**
- 7.1 Map displays venue pins at correct coordinates
- 7.2 Pins show venue type (restaurant, beach, bar, etc.)
- 7.3 Pins indicate availability status (open, busy, closed)
- 7.4 Data Ticker components overlay map with monospace font
- 7.5 Ticker numbers update every 100ms for "spy terminal" effect
- 7.6 Night Mode: Pins have pulsing neon glow effect
- 7.7 Tapping pin opens VenueDetailCard with haptic feedback

### 8. Performance & Polish
**As a user**, I want smooth, responsive interactions so that the app feels premium and professional.

**Acceptance Criteria:**
- 8.1 App maintains 60fps during all animations
- 8.2 No frame drops during mode switching
- 8.3 Gesture interactions feel immediate (no lag)
- 8.4 Images load progressively without blocking UI
- 8.5 App launches in under 2 seconds on mid-range devices
- 8.6 Memory usage stays under 150MB during normal use
- 8.7 Battery drain is minimal (no excessive re-renders)

## Technical Constraints

### Required Dependencies
```json
{
  "expo": "~52.0.0",
  "react-native": "latest",
  "nativewind": "^4.0.0",
  "react-native-reanimated": "~3.0.0",
  "react-native-gesture-handler": "~2.0.0",
  "expo-blur": "~13.0.0",
  "expo-haptics": "~13.0.0",
  "expo-linear-gradient": "~13.0.0",
  "expo-font": "~12.0.0"
}
```

### Font Files Required
- InterTight-Medium.ttf
- PlayfairDisplay-Bold.ttf

### API Integration
- Must connect to existing BlackBear-Services DiscoveryController
- Endpoint: `/api/discovery/venues`
- Real-time updates via SignalR (future enhancement)

## Out of Scope (Phase 1)
- User authentication (use guest mode)
- Booking functionality
- Reviews/ratings display
- Multi-language support
- Offline mode
- Push notifications

## Success Metrics
- App feels "premium" and "cinematic" (qualitative user feedback)
- 60fps maintained during all interactions (measurable)
- Haptic feedback on 100% of interactive elements
- Mode switch animation completes in <500ms
- Venue card gestures feel "natural" (user testing)

## Design References
- Minority Report UI (gesture physics)
- Apple Maps (smooth interactions)
- Uber (bottom sheet behavior)
- Cyberpunk 2077 UI (neon aesthetics for Night Mode)
