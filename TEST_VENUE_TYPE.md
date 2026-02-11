# Test Venue Type Detection

## Quick Test Steps

1. **Check what backend returns:**
   - Open: `https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Reservations/zones?venueId=10`
   - Look for: `venue: { id, name, type }`
   - Expected: `type: "BEACH"` or `type: "POOL"`

2. **Check SpotPage console:**
   - Scan QR code for venue 10
   - Open browser console (F12)
   - Look for: `✅ Venue type loaded from backend: BEACH`
   - If you see `OTHER` instead, the backend isn't returning the type

3. **Verify venue was saved correctly:**
   - Go to SuperAdmin dashboard
   - Edit venue ID 10
   - Check that "Venue Type" dropdown shows "BEACH" or "POOL"
   - If it shows empty or wrong value, the save didn't work

## Expected Behavior

**BEACH/POOL venues should show:**
- ✅ Menu with "Add to Cart" buttons
- ✅ Shopping cart sidebar
- ✅ "Place Order" button
- ✅ "Reserve Table" button in header

**RESTAURANT venues should show:**
- ✅ Menu (read-only, no cart buttons)
- ❌ NO shopping cart
- ❌ NO "Add to Cart" buttons
- ❌ NO "Place Order" button
- ❌ NO "Reserve Table" button

## Debug Commands

```javascript
// In browser console on SpotPage:
console.log('Venue:', venue);
console.log('Can Order:', canOrder);
console.log('Can Reserve:', canReserve);
```

## Common Issues

### Issue 1: Venue type not saving
**Symptom:** Edit venue, set type to BEACH, but backend still returns OTHER
**Cause:** SuperAdmin venue update API not sending `type` field
**Fix:** Check that `venueForm` includes `type` field when calling `venueApi.update()`

### Issue 2: Backend not returning type
**Symptom:** Backend returns zones but no `venue.type`
**Cause:** Prof Kristi's zones endpoint not including venue type
**Fix:** Ask Prof Kristi to include `venue: { id, name, type }` in zones response

### Issue 3: Frontend not detecting type
**Symptom:** Backend returns correct type but UI doesn't change
**Cause:** `canOrder` / `canReserve` logic not working
**Fix:** Check SpotPage.jsx lines 189-191

## Current Status

- ✅ SpotPage logic is correct (lines 189-191)
- ✅ Venue form has `type` field
- ⚠️ Need to verify: Does backend actually save and return the type?

## Next Steps

1. Test the public zones endpoint
2. Check console logs
3. If type is null/OTHER, the issue is in backend or venue save
4. If type is correct but UI doesn't change, issue is in frontend logic
