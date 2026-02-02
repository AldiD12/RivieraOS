# Mobile Discovery Map - Implementation Tasks

## Phase 1: Core Foundation (Project Setup)

- [x] 1. Initialize Expo Project
  - [x] 1.1 Create new Expo app with TypeScript template
  - [x] 1.2 Install core dependencies (NativeWind, Reanimated, Gesture Handler)
  - [x] 1.3 Configure NativeWind in tailwind.config.js
  - [x] 1.4 Set up Expo Router file structure
  - [x] 1.5 Configure TypeScript paths and aliases

- [x] 2. Create Physics Constants
  - [x] 2.1 Create constants/physics.ts with SPRING_PHYSICS configs
  - [x] 2.2 Add TIMING_PHYSICS configurations
  - [x] 2.3 Define GLITCH_CONFIG parameters
  - [x] 2.4 Add HAPTIC_CONFIG settings

- [x] 3. Create Color System
  - [x] 3.1 Create constants/colors.ts
  - [x] 3.2 Define DAY_COLORS palette
  - [x] 3.3 Define NIGHT_COLORS palette
  - [x] 3.4 Export color utility functions

- [ ] 4. Font Loading System
  - [ ] 4.1 Add font files to assets/fonts/
  - [ ] 4.2 Configure app/_layout.tsx with useFonts hook
  - [ ] 4.3 Implement splash screen hold logic
  - [ ] 4.4 Add haptics warm-up on font load complete
  - [ ] 4.5 Test font loading on iOS and Android

---

## Phase 2: Theme System (Zero-Render Engine)

- [x] 5. Create Theme Context
  - [x] 5.1 Create context/ThemeContext.tsx
  - [x] 5.2 Implement ThemeProvider with SharedValue
  - [x] 5.3 Create useAnimatedTheme hook
  - [x] 5.4 Add toggleTheme function with timing animation
  - [x] 5.5 Test theme switching without re-renders

- [ ] 6. Create useDeviceTime Hook
  - [ ] 6.1 Create hooks/useDeviceTime.ts
  - [ ] 6.2 Implement 19:00 auto-switch logic
  - [ ] 6.3 Add listener for time changes
  - [ ] 6.4 Test automatic day/night switching

---

## Phase 3: Core UI Components

- [-] 7. Build HardwareGlass Component
  - [x] 7.1 Create components/core/HardwareGlass.tsx
  - [x] 7.2 Implement 4-layer architecture (Shadow→Gradient→Blur→Content)
  - [x] 7.3 Add intensity and static props
  - [ ] 7.4 Configure shouldRasterizeIOS for performance
  - [ ] 7.5 Test blur performance with 3 concurrent instances
  - [ ] 7.6 Write unit tests for HardwareGlass

- [-] 8. Build HapticTouchable Component
  - [x] 8.1 Create components/core/HapticTouchable.tsx
  - [x] 8.2 Implement scale animation with SNAPPY spring
  - [x] 8.3 Add haptic feedback on press in/out
  - [x] 8.4 Implement debounce logic (50ms)
  - [ ] 8.5 Test haptic feedback on device
  - [ ] 8.6 Write unit tests for HapticTouchable

- [-] 9. Build NeonText Component
  - [x] 9.1 Create components/core/NeonText.tsx
  - [x] 9.2 Implement color interpolation with themeProgress
  - [x] 9.3 Add font family switching logic
  - [x] 9.4 Implement text shadow for neon glow
  - [ ] 9.5 Test smooth color transitions
  - [ ] 9.6 Write unit tests for NeonText

---

## Phase 4: Glitch Effect System

- [x] 10. Build GlitchEffect Component
  - [x] 10.1 Create components/overlay/GlitchEffect.tsx
  - [x] 10.2 Implement absolute overlay with pointerEvents: none
  - [x] 10.3 Add themeProgress listener for trigger
  - [x] 10.4 Implement rapid jitter sequence (10 shakes in 300ms)
  - [x] 10.5 Add chromatic aberration RGB layers
  - [ ] 10.6 Test glitch animation performance (60fps)
  - [ ] 10.7 Write property test for glitch duration

---

## Phase 5: Background & Vignette

- [ ] 11. Create Vignette Component
  - [x] 11.1 Create components/overlay/Vignette.tsx
  - [x] 11.2 Implement SVG radial gradient
  - [x] 11.3 Configure pointerEvents: none
  - [ ] 11.4 Test touch pass-through
  - [ ] 11.5 Verify vignette appearance on different screen sizes

---

## Phase 6: Data Visualization Components

- [ ] 12. Build DayTicker Component
  - [x] 12.1 Create components/map/DayTicker.tsx
  - [x] 12.2 Implement setNativeProps approach
  - [x] 12.3 Add tabular-nums font variant
  - [x] 12.4 Configure 100ms update interval
  - [ ] 12.5 Test performance (no re-renders)
  - [ ] 12.6 Create alternative Reanimated version
  - [ ] 12.7 Write unit tests for DayTicker

- [ ] 13. Build NightPulse Component
  - [x] 13.1 Create components/map/NightPulse.tsx
  - [x] 13.2 Implement infinite withRepeat animation
  - [x] 13.3 Add opacity and scale breathing effect
  - [x] 13.4 Configure 2000ms duration with ease in/out
  - [ ] 13.5 Test infinite loop performance
  - [ ] 13.6 Write property test for infinite animation

---

## Phase 7: Map & Pin System

- [ ] 14. Create Venue Types
  - [x] 14.1 Create types/venue.ts
  - [ ] 14.2 Define Venue interface
  - [ ] 14.3 Define VenueDetails interface
  - [ ] 14.4 Add status and type enums

- [ ] 15. Build MapOverlay Component
  - [ ] 15.1 Create components/map/MapOverlay.tsx
  - [ ] 15.2 Implement absolute positioning with pointerEvents: box-none
  - [ ] 15.3 Add conditional rendering for Day/Night modes
  - [ ] 15.4 Create layer system for tickers and pins
  - [ ] 15.5 Test touch events pass through correctly

- [ ] 16. Build VenuePin Component (Day Mode)
  - [ ] 16.1 Create components/map/VenuePin.tsx
  - [ ] 16.2 Implement simple marker with icon
  - [ ] 16.3 Add status indicator dot
  - [ ] 16.4 Wrap in HapticTouchable
  - [ ] 16.5 Test pin press interactions

- [ ] 17. Build NeonPin Component (Night Mode)
  - [ ] 17.1 Create components/map/NeonPin.tsx
  - [ ] 17.2 Integrate NightPulse component
  - [ ] 17.3 Add venue name label with neon styling
  - [ ] 17.4 Implement color coding by venue type
  - [ ] 17.5 Test pulsing animation performance

---

## Phase 8: Venue Detail Sheet

- [ ] 18. Build SpringSheet Component
  - [ ] 18.1 Create components/venue/SpringSheet.tsx
  - [ ] 18.2 Implement PanGestureHandler setup
  - [ ] 18.3 Add translateY SharedValue with gesture tracking
  - [ ] 18.4 Implement velocity-based dismiss logic (>500)
  - [ ] 18.5 Add snap-back with HEAVY spring physics
  - [ ] 18.6 Implement overshoot effect on open
  - [ ] 18.7 Add backdrop with interpolated opacity
  - [ ] 18.8 Test gesture physics feel
  - [ ] 18.9 Write property test for spring physics accuracy

- [ ] 19. Build VenueCard Component
  - [ ] 19.1 Create components/venue/VenueCard.tsx
  - [ ] 19.2 Design card layout with venue details
  - [ ] 19.3 Add venue image, name, rating
  - [ ] 19.4 Display capacity and status
  - [ ] 19.5 Add action buttons (view menu, book, etc.)
  - [ ] 19.6 Wrap in HardwareGlass

---

## Phase 9: API Integration

- [ ] 20. Create API Service
  - [ ] 20.1 Create services/api.ts
  - [ ] 20.2 Configure axios with base URL
  - [ ] 20.3 Implement getVenues endpoint
  - [ ] 20.4 Implement getVenueDetails endpoint
  - [ ] 20.5 Add error handling and retry logic
  - [ ] 20.6 Test API integration with backend

- [ ] 21. Integrate API with Map
  - [ ] 21.1 Fetch venues on map screen mount
  - [ ] 21.2 Handle loading states
  - [ ] 21.3 Display venues on map
  - [ ] 21.4 Implement venue selection
  - [ ] 21.5 Open SpringSheet with venue details

---

## Phase 10: Main Screen Assembly

- [ ] 22. Build Map Screen
  - [x] 22.1 Create app/index.tsx
  - [ ] 22.2 Add base map view (placeholder or real map)
  - [ ] 22.3 Integrate MapOverlay component
  - [ ] 22.4 Add Vignette overlay
  - [ ] 22.5 Add GlitchEffect overlay
  - [ ] 22.6 Implement theme toggle button
  - [ ] 22.7 Test complete screen assembly

---

## Phase 11: Performance Optimization

- [ ] 23. Optimize Rendering
  - [ ] 23.1 Memoize VenuePin components
  - [ ] 23.2 Implement FlashList for venue lists (if needed)
  - [ ] 23.3 Add shouldRasterizeIOS to static HardwareGlass
  - [ ] 23.4 Profile component re-renders
  - [ ] 23.5 Optimize image loading

- [ ] 24. Optimize Animations
  - [ ] 24.1 Verify all animations use useAnimatedStyle
  - [ ] 24.2 Minimize runOnJS calls
  - [ ] 24.3 Test FPS during theme switch
  - [ ] 24.4 Test FPS during sheet gestures
  - [ ] 24.5 Profile animation performance

- [ ] 25. Optimize Blur Effects
  - [ ] 25.1 Limit concurrent BlurViews to 3
  - [ ] 25.2 Use experimentalBlurMethod for performance
  - [ ] 25.3 Test blur performance on low-end devices
  - [ ] 25.4 Consider pre-rendered blur images

---

## Phase 12: Testing

- [ ] 26. Write Component Tests
  - [ ] 26.1 Test HardwareGlass blur intensity and layers
  - [ ] 26.2 Test HapticTouchable scale animation
  - [ ] 26.3 Test NeonText color interpolation
  - [ ] 26.4 Test SpringSheet gesture thresholds
  - [ ] 26.5 Test DayTicker update frequency

- [ ] 27. Write Property-Based Tests
  - [ ] 27.1 Property test: Animation frame rate ≥58fps
  - [ ] 27.2 Property test: Haptic feedback within 16ms
  - [ ] 27.3 Property test: Spring physics accuracy (damping/stiffness)
  - [ ] 27.4 Property test: Theme interpolation smoothness
  - [ ] 27.5 Property test: Glitch duration 300ms ±10ms

- [ ] 28. Write Integration Tests
  - [ ] 28.1 Test complete theme switch flow
  - [ ] 28.2 Test venue selection and sheet opening
  - [ ] 28.3 Test API error handling
  - [ ] 28.4 Test gesture dismissal flows

---

## Phase 13: Accessibility

- [ ] 29. Implement Accessibility Features
  - [ ] 29.1 Add accessibility labels to all interactive elements
  - [ ] 29.2 Implement screen reader support
  - [ ] 29.3 Add accessibility hints for venue pins
  - [ ] 29.4 Announce mode changes to screen reader
  - [ ] 29.5 Test with VoiceOver (iOS) and TalkBack (Android)

- [ ] 30. Implement Haptic Settings
  - [ ] 30.1 Check system haptic settings
  - [ ] 30.2 Add in-app haptic toggle
  - [ ] 30.3 Provide visual feedback alternatives
  - [ ] 30.4 Test haptic graceful degradation

---

## Phase 14: Polish & Final Testing

- [ ] 31. Visual Polish
  - [ ] 31.1 Fine-tune spring physics feel
  - [ ] 31.2 Adjust glitch effect intensity
  - [ ] 31.3 Refine neon glow colors
  - [ ] 31.4 Polish vignette gradient
  - [ ] 31.5 Test on various screen sizes

- [ ] 32. Performance Validation
  - [ ] 32.1 Run FPS profiler during all animations
  - [ ] 32.2 Measure memory usage during normal operation
  - [ ] 32.3 Test on low-end devices (target: 60fps)
  - [ ] 32.4 Verify app launch time <2 seconds
  - [ ] 32.5 Profile battery usage

- [ ] 33. Final Integration Testing
  - [ ] 33.1 Test complete user flow (launch → browse → select → dismiss)
  - [ ] 33.2 Test theme auto-switch at 19:00
  - [ ] 33.3 Test API error scenarios
  - [ ] 33.4 Test offline behavior
  - [ ] 33.5 Verify all correctness properties pass

---

## Phase 15: Documentation & Deployment

- [ ] 34. Create Documentation
  - [ ] 34.1 Document component API
  - [ ] 34.2 Create usage examples
  - [ ] 34.3 Document physics configurations
  - [ ] 34.4 Add troubleshooting guide

- [ ] 35. Prepare for Deployment
  - [ ] 35.1 Configure app.json for production
  - [ ] 35.2 Set up environment variables
  - [ ] 35.3 Configure API endpoints
  - [ ] 35.4 Build production APK/IPA
  - [ ] 35.5 Test production build

---

## Success Criteria

All tasks must be completed and the following criteria met:

✅ **Performance**
- 60fps maintained during all animations
- Theme switch completes in <500ms
- App launches in <2 seconds
- Memory usage <150MB

✅ **Functionality**
- All interactive elements have haptic feedback
- Theme switches smoothly between Day/Night
- Venue sheet gestures feel natural and responsive
- API integration works reliably

✅ **Quality**
- All unit tests pass
- All property-based tests pass
- All integration tests pass
- Accessibility features work correctly

✅ **Polish**
- Glitch effect feels cinematic
- Spring physics feel premium and heavy
- Neon effects pulse smoothly
- Vignette creates proper depth
