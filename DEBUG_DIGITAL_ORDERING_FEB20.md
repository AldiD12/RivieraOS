# Digital Ordering Debug Guide - February 20, 2026

## Current Status

**Backend API Response (Venue 18):**
```json
{
    "id": 18,
    "name": "BEACH",
    "type": "BEACH",
    "allowsDigitalOrdering": true,
    "orderingEnabled": true
}
```
✅ Backend is returning `allowsDigitalOrdering: true`

---

## Debug Steps

### Step 1: Check Browser Console

Open https://riviera-os.vercel.app/spot?v=18&z=16&u=8 and check console for:

```javascript
✅ Venue details loaded: {
  name: "BEACH",
  type: "BEACH", 
  allowsDigitalOrdering: true  // ← Should be true
}
```

**If you see `allowsDigitalOrdering: false` or `undefined`:**
- Frontend is using cached/old build
- Need to clear cache or redeploy

---

### Step 2: Check Venue State

In browser console, type:
```javascript
// Check if venue state has the correct value
console.log(window.location.href);
```

Then add this temporarily to SpotPage.jsx after line 325:
```javascript
console.log('🔍 DEBUG canOrder:', {
  venue: venue,
  allowsDigitalOrdering: venue?.allowsDigitalOrdering,
  canOrder: canOrder
});
```

---

### Step 3: Check if Buttons Render

Search for "Add" button in SpotPage.jsx (around line 790):
```jsx
{canOrder && (
  <button
    onClick={() => addToCart(product)}
    className="..."
  >
    Add
  </button>
)}
```

**The button only shows if `canOrder === true`**

---

### Step 4: Verify Frontend Deployment

Check Vercel deployment:
1. Go to https://vercel.com/aldids-projects/riviera-os
2. Check latest deployment timestamp
3. Verify it's using latest commit

**If deployment is old:**
- Push a dummy commit to trigger rebuild
- Or manually redeploy in Vercel dashboard

---

## Possible Issues

### Issue 1: Frontend Cache
**Symptom:** API returns correct data but UI doesn't update

**Solution:**
```bash
# Hard refresh in browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or clear browser cache
```

### Issue 2: Old Frontend Build
**Symptom:** Console shows old logs or missing new code

**Solution:**
```bash
# Trigger new Vercel deployment
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### Issue 3: Backend Not Deployed
**Symptom:** API returns old schema without `allowsDigitalOrdering`

**Check:**
```bash
curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues/18
```

**Should return:**
```json
{
  "allowsDigitalOrdering": true  // ← Must be present
}
```

### Issue 4: Database Value Still Null
**Symptom:** API returns `allowsDigitalOrdering: false` even for Beach

**Check database:**
```sql
SELECT Id, Name, Type, IsDigitalOrderingEnabled, OrderingEnabled 
FROM Venues 
WHERE Id = 18;
```

**Expected:**
- `IsDigitalOrderingEnabled` = NULL (auto mode)
- `OrderingEnabled` = 1 (true)
- Backend should calculate `allowsDigitalOrdering = true` for Beach

**If `OrderingEnabled` = 0:**
- That's the problem! Set it to 1 in admin panel

---

## Quick Test

### Test in Browser Console

1. Open https://riviera-os.vercel.app/spot?v=18&z=16&u=8
2. Open DevTools Console (F12)
3. Run:

```javascript
// Test 1: Check API directly
fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues/18')
  .then(r => r.json())
  .then(d => console.log('API Response:', d));

// Test 2: Check venue state (after page loads)
// Look for the console.log from SpotPage.jsx:
// "✅ Venue details loaded: { ... }"
```

---

## Most Likely Issue

Based on the symptoms, the most likely issue is:

**The venue has `orderingEnabled: false` in the database**

Even though `allowsDigitalOrdering` might be true, if `orderingEnabled` is false, the venue won't allow orders.

### Check in Admin Panel

1. Go to SuperAdmin or Business Admin
2. Find venue ID 18 (BEACH)
3. Edit venue
4. Check the "Enable Online Ordering" checkbox ✅
5. Save

This is DIFFERENT from "Digital Ordering Override":
- **Enable Online Ordering** (`orderingEnabled`) = Master switch
- **Digital Ordering Override** (`isDigitalOrderingEnabled`) = Fine-tune control

**BOTH must be enabled for ordering to work!**

---

## The Logic

```javascript
// SpotPage.jsx line 325
const canOrder = venue?.allowsDigitalOrdering ?? false;
```

**Backend calculates `allowsDigitalOrdering`:**
```csharp
public bool AllowsDigitalOrdering
{
    get
    {
        // Master switch must be ON
        if (!OrderingEnabled) return false;
        
        // If manual override is set, use it
        if (IsDigitalOrderingEnabled.HasValue)
            return IsDigitalOrderingEnabled.Value;
        
        // Otherwise, auto-calculate based on venue type
        return Type != "RESTAURANT";
    }
}
```

**So for ordering to work:**
1. ✅ `OrderingEnabled` must be `true` (master switch)
2. ✅ `IsDigitalOrderingEnabled` must be `null` (auto) or `true` (force enable)
3. ✅ OR venue type must be Beach/Pool/Bar (auto mode)

---

## Action Items

### For You (User):
1. Check browser console for venue data
2. Check if "Enable Online Ordering" is checked in admin panel
3. Try hard refresh (Cmd+Shift+R)
4. Share console logs if still not working

### For Prof Kristi:
1. Verify backend is deployed to Azure
2. Check if migration ran (database has `IsDigitalOrderingEnabled` column)
3. Verify `AllowsDigitalOrdering` computed property logic

---

## Expected Console Output

When you load https://riviera-os.vercel.app/spot?v=18&z=16&u=8, you should see:

```
🔍 Fetching data for venue: 18
📡 Fetching menu from: https://blackbear-api.../api/public/Orders/menu?venueId=18
✅ Menu loaded with 2 categories
✅ Venue details loaded: {
  name: "BEACH",
  type: "BEACH",
  allowsDigitalOrdering: true
}
```

**If you see `allowsDigitalOrdering: false`, that's the problem!**

---

## Next Steps

1. Share your browser console output
2. Check "Enable Online Ordering" checkbox in admin
3. If still not working, we'll add debug logs to SpotPage

---

**Let me know what you see in the console!**
