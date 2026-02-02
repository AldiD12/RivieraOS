# Development Build Setup for Mapbox 🗺️

## 🚨 Important: Mapbox Requires Development Build

Mapbox uses native code that **cannot run in Expo Go**. You must create a development build.

## 🚀 Quick Setup

### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Create Development Build

**For iOS Simulator:**
```bash
eas build --profile development --platform ios
```

**For Android Emulator:**
```bash
eas build --profile development --platform android
```

**For Physical Device:**
```bash
# iOS (requires Apple Developer account)
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### 4. Install the Build

**After build completes:**
```bash
# iOS
eas build:run -p ios

# Android  
eas build:run -p android
```

### 5. Start Development Server
```bash
npm start
```

Then scan the QR code with your development build app (not Expo Go).

## 🔧 Configuration Details

### Environment Variables
- **RNMAPBOX_MAPS_DOWNLOAD_TOKEN**: Configured in `.env` and `eas.json`
- **Your Token**: `sk.eyJ1IjoiYWxkaWQxNjAyIiwiYSI6ImNtbDQ4NHV3aDB5ZTQzZHNkZHpoYm96MnkifQ.BIK3YtfFBiLSZLRREwFNrg`

### Files Created
- ✅ `.env` - Environment variables for local development
- ✅ `eas.json` - EAS build configuration
- ✅ `app.json` - Updated with Mapbox plugin

## 🧪 Testing Checklist

Once your development build is installed:

- [ ] App launches without "native code not available" error
- [ ] Day mode map loads with light Mapbox style
- [ ] Night mode map loads with dark Mapbox style
- [ ] Venue markers appear in Saint-Tropez locations
- [ ] Map gestures work (zoom, pan)
- [ ] Mode toggle switches between day/night
- [ ] Premium design elements render correctly

## 🚨 Troubleshooting

**"Native code not available" Error:**
- You're using Expo Go instead of development build
- Solution: Follow steps above to create development build

**Build fails:**
- Check your Expo account has sufficient build credits
- Verify internet connection during build process
- Try building for one platform at a time

**Map doesn't load:**
- Check that RNMAPBOX_MAPS_DOWNLOAD_TOKEN is set correctly
- Verify internet connection on device
- Check Expo logs for specific error messages

## 📱 Alternative: Local Development Build

If you prefer to build locally:

```bash
# iOS (requires Xcode)
npx expo run:ios

# Android (requires Android Studio)
npx expo run:android
```

This will create a development build on your local machine and install it directly.

## 🎯 Next Steps

Once your development build is working:

1. **Test both day and night modes**
2. **Verify premium design elements**
3. **Test on physical device for performance**
4. **Customize venue locations if needed**

Your Riviera app now has premium Mapbox integration with sophisticated luxury design! 🏖️✨