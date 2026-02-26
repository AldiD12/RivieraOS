# Mapbox Studio - Dark Style Creation Instructions

**For:** Anest (or whoever has Mapbox Studio access)  
**Time Required:** 15 minutes  
**Account:** aldid1602  
**Goal:** Create dark industrial map style

---

## 🎯 QUICK STEPS

1. Go to https://studio.mapbox.com/
2. Login with account: aldid1602
3. Click "New Style"
4. Choose "Dark" template
5. Name it: "Riviera Industrial Dark"
6. Update colors:
   - Water: `#09090b` (Zinc-950)
   - Land: `#18181b` (Zinc-900)
7. Click "Publish"
8. Copy the style URL
9. Update React code with new URL

---

## 📋 DETAILED INSTRUCTIONS

### Step 1: Access Mapbox Studio
```
URL: https://studio.mapbox.com/
Login: aldid1602
Password: [your password]
```

### Step 2: Create New Style
1. Click the blue "New Style" button (top right)
2. Select "Dark" from the template options
3. Click "Customize Dark"

### Step 3: Name Your Style
```
Style Name: Riviera Industrial Dark
Description: Dark industrial map for Discovery Page (Water: Zinc-950, Land: Zinc-900)
```

### Step 4: Update Water Color
1. In the left sidebar, find "Water" layer
2. Click on it to expand
3. Find "Color" property
4. Change to: `#09090b`
5. This is Zinc-950 (very dark, almost black)

### Step 5: Update Land Color
1. In the left sidebar, find "Land" or "Background" layer
2. Click on it to expand
3. Find "Color" property
4. Change to: `#18181b`
5. This is Zinc-900 (slightly lighter than water)

### Step 6: Optional - Update Roads
```
Color: #27272a (Zinc-800)
Opacity: 50%
Width: Thin (0.5-1px)
```
This makes roads subtle but visible.

### Step 7: Optional - Update Labels
```
Text Color: #a1a1aa (Zinc-400)
Font: Inter
Size: Small
Opacity: 70%
```
This makes place names readable but not distracting.

### Step 8: Publish Style
1. Click "Publish" button (top right)
2. Add publish notes: "Initial dark industrial style"
3. Click "Publish" again to confirm
4. Wait for processing (30 seconds)

### Step 9: Copy Style URL
1. After publishing, click "Share" button
2. Find "Style URL" section
3. Copy the URL (format: `mapbox://styles/aldid1602/[STYLE_ID]`)
4. Example: `mapbox://styles/aldid1602/cm123abc456def789`

### Step 10: Update React Code
1. Open `frontend/src/pages/DiscoveryPage.jsx`
2. Find this line (around line 11):
   ```javascript
   const DARK_INDUSTRIAL_STYLE = "mapbox://styles/aldid1602/cmm3bp5b3001v01qy9yf3gzlo";
   ```
3. Replace with your new style URL:
   ```javascript
   const DARK_INDUSTRIAL_STYLE = "mapbox://styles/aldid1602/[YOUR_NEW_STYLE_ID]";
   ```
4. Save the file
5. Commit and push to GitHub
6. Vercel will auto-deploy

---

## 🎨 COLOR REFERENCE

### Required Colors
```
Water:  #09090b  (Zinc-950) - Very dark, almost black
Land:   #18181b  (Zinc-900) - Slightly lighter than water
```

### Optional Colors
```
Roads:  #27272a  (Zinc-800) - Subtle gray
Labels: #a1a1aa  (Zinc-400) - Light gray text
```

### Why These Colors?
- **Zinc-950 Water:** Creates depth, makes land stand out
- **Zinc-900 Land:** Slightly lighter, shows coastline clearly
- **Zinc-800 Roads:** Visible but not distracting
- **Zinc-400 Labels:** Readable but subtle

---

## 🧪 TESTING

### After Publishing
1. Open Discovery Page in browser
2. Wait for map to load
3. Check water color (should be very dark)
4. Check land color (should be slightly lighter)
5. Check markers (emerald should glow on dark background)
6. Zoom in/out to test different zoom levels
7. Pan around to test different areas

### Expected Result
```
┌─────────────────────────────────────┐
│  [Dark map with clear contrast]     │
│                                     │
│  Water: Almost black (#09090b)      │
│  Land: Dark gray (#18181b)          │
│  Markers: Glowing emerald           │
│  Coastline: Clearly visible         │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚨 TROUBLESHOOTING

### Problem: Water and land look the same
**Solution:** Increase contrast between colors
```
Water: #09090b (darker)
Land:  #27272a (lighter)
```

### Problem: Map is too dark, can't see anything
**Solution:** Lighten the land color
```
Land: #27272a (Zinc-800 instead of Zinc-900)
```

### Problem: Roads are too bright
**Solution:** Reduce road opacity
```
Roads Opacity: 30% (instead of 50%)
```

### Problem: Labels are unreadable
**Solution:** Increase label color brightness
```
Labels: #d4d4d8 (Zinc-300 instead of Zinc-400)
```

### Problem: Style URL doesn't work
**Solution:** Make sure you copied the full URL including `mapbox://styles/`

---

## 📸 REFERENCE IMAGES

### Target Aesthetic
Think of:
- Apple Maps dark mode
- Tesla navigation screen
- High-end gaming interfaces
- Cinematic movie maps

### NOT Like
- Google Maps dark mode (too blue)
- Traditional paper maps (too detailed)
- Bright tourist maps (too colorful)

---

## ⏱️ TIME ESTIMATE

```
Login to Mapbox Studio:     1 minute
Create new style:           2 minutes
Update water color:         2 minutes
Update land color:          2 minutes
Optional road/label tweaks: 5 minutes
Publish style:              1 minute
Copy URL:                   1 minute
Update React code:          1 minute
─────────────────────────────────────
Total:                      15 minutes
```

---

## 🎯 SUCCESS CRITERIA

- [ ] Water is Zinc-950 (#09090b)
- [ ] Land is Zinc-900 (#18181b)
- [ ] Coastline is clearly visible
- [ ] Emerald markers glow on dark background
- [ ] Map loads without errors
- [ ] Style URL copied correctly
- [ ] React code updated
- [ ] Changes deployed to Vercel
- [ ] Discovery Page looks cinematic

---

## 📞 SUPPORT

If you get stuck:
1. Check Mapbox Studio documentation: https://docs.mapbox.com/studio-manual/
2. Ask Aldi for help
3. Share screenshot of the issue
4. Check browser console for errors

---

**Priority:** HIGH  
**Blocking:** Discovery Page aesthetic  
**Impact:** Transforms map from pleasant to stunning  
**Difficulty:** Easy (just color changes)
