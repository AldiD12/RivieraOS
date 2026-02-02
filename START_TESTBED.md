# 🚀 Quick Start: Riviera Mobile Testbed

## Phase 1 & 2 Complete - The Soul Layer is Built

The chassis is ready. Time to feel the weight of the UI.

## 🎯 Choose Your Testing Method

### Option 1: Expo Go (Recommended - Real Haptics!)
```bash
cd riviera-mobile
npm start
```
Then scan QR code with Expo Go app on your phone.

### Option 2: iOS Simulator (Requires Xcode)
```bash
cd riviera-mobile
npm run ios
```
**Note**: Haptics don't work in simulator.

### Option 3: Android Emulator
```bash
cd riviera-mobile
npm run android
```

### Option 4: Web Browser (Quick Preview)
```bash
cd riviera-mobile
npm run web
```
**Note**: No haptics or blur effects on web.

## 📱 What You'll See

A dark screen with:
- **Center Card** - Glass morphism with 4 layers
- **Toggle Button** - Press to switch Day/Night mode
- **Info Display** - Shows current mode and physics config

## 🎮 What to Do

1. **Press the "TOGGLE MODE" button**
2. **Feel the haptic feedback** (light on press, medium on release)
3. **Watch the colors morph** (gray → cyan, 500ms smooth)
4. **Press it again** (cyan → gray)
5. **Keep pressing** (feel the SNAPPY physics)

## ✅ Success Checklist

- [ ] I can **feel** the haptic vibration on my device
- [ ] The button **scales down** when I press it
- [ ] The colors **morph smoothly** (no jank)
- [ ] The glass card looks **premium** (blur + gradient border)
- [ ] The transition takes about **half a second**

## 🐛 Troubleshooting

**Haptics don't work?**
- iOS Simulator doesn't support haptics - use a real device
- Android Emulator needs vibration enabled in settings

**Blur doesn't show?**
- iOS: Should work out of the box
- Android: Requires Android 12+

**App won't start?**
```bash
cd riviera-mobile
rm -rf node_modules
npm install
npm start -- --clear
```

## 📊 Performance Check

Open React DevTools while toggling:
- **Expected**: 0 component re-renders (except ThemeProvider)
- **Expected**: 60fps during animation
- **Expected**: Smooth color interpolation

## 🎯 The Goal

If you can **feel the weight** when you press that button, the chassis is solid.

The Soul Layer is complete. ✅

---

**Next**: Verify the testbed works, then we build the map.

**Location**: `riviera-mobile/`  
**Docs**: See `TESTBED.md` for detailed testing instructions  
**Spec**: See `.kiro/specs/mobile-discovery-map/` for full design
