# Mapbox Configuration for Riviera Mobile

## Setup Instructions

### 1. Get Mapbox Access Token
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Create an account or sign in
3. Go to "Access tokens" section
4. Create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
   - `vision:read`

### 2. Configure Access Token
Replace the placeholder token in both discovery components:

**Files to update:**
- `components/RivieraDiscoveryScreen.tsx`
- `components/RivieraDiscoveryScreen-Night.tsx`

**Replace this line:**
```typescript
Mapbox.setAccessToken('pk.eyJ1IjoicmVhbC1yaXZpZXJhIiwiYSI6ImNtNXNxdGNhZzBhZGsyanM5ZGNqZGNqZGcifQ.example');
```

**With your actual token:**
```typescript
Mapbox.setAccessToken('pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbXh4eHh4eHgwMDAwMG0wMDAwMDAwMDAwIn0.your-actual-token');
```

### 3. iOS Configuration (if targeting iOS)
Add to `ios/Podfile`:
```ruby
pre_install do |installer|
  $RNMapboxMaps.pre_install(installer)
end

post_install do |installer|
  $RNMapboxMaps.post_install(installer)
end
```

### 4. Android Configuration (if targeting Android)
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application>
  <meta-data
    android:name="MAPBOX_DOWNLOADS_TOKEN"
    android:value="YOUR_SECRET_MAPBOX_ACCESS_TOKEN" />
</application>
```

## Map Styles Used

### Day Mode
- **Style**: `mapbox://styles/mapbox/light-v11`
- **Theme**: Light, elegant, luxury resort feel
- **Colors**: Warm neutrals, sophisticated tones

### Night Mode  
- **Style**: `mapbox://styles/mapbox/dark-v11`
- **Theme**: Dark, techno/rave atmosphere
- **Colors**: Deep blacks with neon accents

## Venue Coordinates

### Current Locations (Saint-Tropez Area)
- **Main Center**: `[6.6413, 43.2384]`
- **Bagatelle**: `[6.6380, 43.2350]`
- **Club 55**: `[6.6450, 43.2400]`
- **Warehouse 9**: `[6.6380, 43.2350]`
- **Neon Garden**: `[6.6450, 43.2400]`

### Zoom Level
- **Default**: 12 (good overview of Saint-Tropez area)
- **Range**: 10-16 (adjust based on venue density)

## Marker Styling

### Day Mode Markers
- **Main Venue**: Large pin with pulse animation
- **Secondary Venues**: Smaller pins with luxury colors
- **Colors**: Deep amber, champagne, warm neutrals

### Night Mode Markers
- **Main Venue**: Glowing pin with neon effects
- **Secondary Venues**: Smaller pins with techno colors  
- **Colors**: Neon green, purple, electric blue

## Performance Notes

- Maps are set to disable pitch and rotation for better performance
- Zoom and scroll are enabled for user interaction
- Markers use elevation/shadows for depth without heavy animations
- Dark overlay on night mode for atmospheric effect

## Troubleshooting

### Common Issues
1. **"Mapbox token not set"**: Make sure to replace the placeholder token
2. **Map not loading**: Check internet connection and token validity
3. **Markers not showing**: Verify coordinate format `[longitude, latitude]`
4. **Performance issues**: Reduce marker count or simplify marker designs

### Testing
- Test on both iOS and Android devices
- Verify map loads in both day and night modes
- Check marker interactions and animations
- Test zoom/pan gestures work smoothly