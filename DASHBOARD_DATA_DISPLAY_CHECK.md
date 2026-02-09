# Dashboard Data Display Checklist

## BusinessAdminDashboard

### Staff Management Tab
**Table Columns:**
- ✅ Staff Member (name + ID)
- ✅ Role (Manager/Bartender/Collector)
- ✅ Phone (contact info)
- ✅ **PIN** (✓ Set / ✗ Not Set) - **JUST ADDED**
- ✅ Status (Active/Inactive)
- ✅ Actions (Edit/Deactivate/Delete)

**Backend Returns:** `hasPinSet: boolean`

---

### Menu Management Tab
**Categories Display:**
- ✅ Category name
- ✅ Sort order
- ✅ Active status
- ✅ Actions (Edit/Delete)

**Products Display (per category):**
- ✅ Product name
- ✅ Description
- ✅ Price
- ✅ Old price (if set)
- ✅ Available status
- ✅ Alcohol indicator
- ✅ Actions (Edit/Toggle Available/Delete)

---

### Venues Management Tab
**Venues Display:**
- ✅ Venue name
- ✅ Type
- ✅ Address
- ✅ Ordering enabled status
- ✅ Active status
- ✅ Actions (Edit/Toggle Active/Delete)

**Zones Display (per venue):**
- ✅ Zone name
- ✅ Zone type
- ✅ **Capacity per unit** - User reports this isn't saving
- ✅ Base price
- ✅ Active status
- ✅ Actions (Edit/Delete)

**Backend Returns:** `capacityPerUnit: int`, `basePrice: decimal`

---

## SuperAdminDashboard

### Staff Management Tab
**Table Columns:**
- ✅ Staff Member (name + phone)
- ✅ Role
- ✅ **PIN** (✓ Set / ✗ Not Set) - **JUST FIXED**
- ✅ Status (Active/Inactive - clickable to toggle)
- ✅ Actions (Edit/Reset Password/Delete)

**Backend Returns:** `hasPinSet: boolean`

---

## Potential Issues

### Zone Capacity Not Saving
**Symptoms:** User reports capacity isn't being saved
**Investigation needed:**
1. Check browser console for errors during zone creation
2. Check network tab to see what data is being sent
3. Verify backend is receiving and saving the data
4. Check if data is being returned correctly in the list

**Frontend code looks correct:**
- Form has `capacityPerUnit` field with `parseInt()`
- Display shows `zone.capacityPerUnit || 'N/A'`
- Backend DTO accepts `CapacityPerUnit: int`

**Possible causes:**
1. Form value not being parsed correctly (empty string → NaN)
2. Backend validation failing silently
3. Data not being refreshed after creation
4. Display issue (data saved but not shown)

---

## Debugging Steps for Zone Capacity Issue

1. **Add console logging to zone creation:**
```javascript
console.log('Creating zone with data:', zoneForm);
```

2. **Check browser network tab:**
- Look at the POST request to `/api/business/venues/{id}/Zones`
- Verify `capacityPerUnit` is in the request body
- Check the response to see if it includes the capacity

3. **Check backend logs:**
- Verify the backend is receiving the capacity value
- Check if it's being saved to the database

4. **Test with different values:**
- Try capacity = 1 (default)
- Try capacity = 2, 5, 10
- See if any values work

5. **Check database directly:**
- Query the VenueZones table
- Verify CapacityPerUnit column has the correct values
