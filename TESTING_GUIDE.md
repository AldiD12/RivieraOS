# Testing Guide - Backend Integration Features

**Date:** February 17, 2026  
**Features:** Zone Toggle, Staff Venue Assignment, Digital Ordering Toggle

---

## Prerequisites

1. **Start the frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

2. **Ensure backend is running:**
   - Backend should be running on the production URL
   - Check that you can access the API

3. **Login credentials:**
   - You'll need a Manager/Owner account for BusinessAdmin
   - You'll need a SuperAdmin account for SuperAdmin testing

---

## Feature 1: Zone IsActive Toggle

### Test in BusinessAdminDashboard

1. **Navigate to dashboard:**
   - Go to http://localhost:5173/business-admin
   - Login with Manager/Owner credentials

2. **Go to Venues tab:**
   - Click on "Venues" in the navigation
   - Select a venue from the list

3. **View zones:**
   - You should see a list of zones for the selected venue
   - Each zone should have an Active/Inactive badge

4. **Test toggle:**
   - Click the "Toggle Active" button on any zone
   - The badge should change from Active to Inactive (or vice versa)
   - Refresh the page - the status should persist

5. **Expected behavior:**
   - ✅ Toggle button works
   - ✅ Badge updates immediately
   - ✅ Status persists after refresh
   - ✅ No errors in console

### Test in SuperAdminDashboard

1. **Navigate to dashboard:**
   - Go to http://localhost:5173/super-admin
   - Login with SuperAdmin credentials

2. **Select a business:**
   - Choose a business from the dropdown

3. **Go to Venues tab:**
   - Click on "Venues" tab
   - Select a venue
   - Select a zone

4. **Test toggle:**
   - Same as BusinessAdmin testing above

---

## Feature 2: Staff Venue Assignment

### Test Creating Staff with Venue Assignment

1. **Navigate to Staff Management:**
   - Go to BusinessAdmin or SuperAdmin dashboard
   - Click on "Staff" tab

2. **Click "Add Staff Member":**
   - Fill in required fields:
     - Email: test@example.com
     - Password: test123
     - Phone: +1234567890
     - Full Name: Test Staff
     - Role: Collector (or any role)
     - PIN: 1234

3. **Assign a venue:**
   - Look for "Assigned Venue" dropdown
   - Select a venue from the list
   - Or leave as "Not Assigned"

4. **Submit the form:**
   - Click "Add Staff Member"
   - Check the staff list

5. **Expected behavior:**
   - ✅ Venue dropdown appears in the form
   - ✅ Dropdown shows all venues
   - ✅ "Not Assigned" is the default option
   - ✅ After creation, staff list shows venue name or "Not Assigned"
   - ✅ Venue appears in a purple badge

### Test Editing Staff Venue Assignment

1. **Click "Edit" on any staff member:**
   - The edit modal should open
   - Venue dropdown should show current assignment

2. **Change venue assignment:**
   - Select a different venue
   - Or select "Not Assigned" to remove assignment

3. **Save changes:**
   - Click "Update Staff Member"
   - Check the staff list

4. **Expected behavior:**
   - ✅ Current venue is pre-selected in dropdown
   - ✅ Can change to different venue
   - ✅ Can remove assignment (set to "Not Assigned")
   - ✅ Changes persist after save
   - ✅ Staff list updates immediately

### Test on Mobile View

1. **Resize browser to mobile width (< 768px):**
   - Staff list should switch to card view

2. **Check venue display:**
   - Each staff card should show venue info
   - Should see "Venue: [Venue Name]" or "Venue: Not Assigned"

3. **Test edit on mobile:**
   - Click "Edit" button
   - Venue dropdown should work on mobile

---

## Feature 3: Digital Ordering Toggle

### Test Creating Venue with Digital Ordering

1. **Navigate to Venues:**
   - Go to BusinessAdmin or SuperAdmin dashboard
   - Click on "Venues" tab

2. **Click "Add Venue" or "Create Venue":**
   - Fill in required fields:
     - Name: Test Restaurant
     - Type: RESTAURANT
     - Description: Test description

3. **Find "Digital Ordering Override" dropdown:**
   - Should be near the bottom of the form
   - Three options should be available:
     - Auto (Restaurant=No, Beach/Pool/Bar=Yes)
     - Force Enable
     - Force Disable

4. **Test Auto setting:**
   - Select "Auto"
   - Create the venue
   - Check venue list - should show "🤖 Auto Menu" badge

5. **Expected behavior:**
   - ✅ Dropdown appears in create form
   - ✅ All three options are available
   - ✅ Explanation text is visible
   - ✅ Venue is created successfully
   - ✅ Badge appears in venue list

### Test Editing Venue Digital Ordering

1. **Click "Edit" on any venue:**
   - Edit modal should open
   - Digital Ordering dropdown should show current setting

2. **Change setting:**
   - Try changing from Auto to Force Enable
   - Save changes

3. **Check venue list:**
   - Badge should update to "✓ Menu Enabled"

4. **Try all combinations:**
   - Auto → Force Enable → Force Disable → Auto
   - Each should show correct badge

5. **Expected behavior:**
   - ✅ Current setting is pre-selected
   - ✅ Can change to any option
   - ✅ Changes persist after save
   - ✅ Badge updates immediately

### Test Digital Ordering on SpotPage (Customer View)

This is the most important test - it affects what customers see!

1. **Create test venues:**
   - Restaurant with Auto setting
   - Beach with Auto setting
   - Restaurant with Force Enable
   - Beach with Force Disable

2. **Test Restaurant with Auto:**
   - Navigate to the restaurant's SpotPage
   - URL: http://localhost:5173/spot/[venueId]
   - **Expected:** Menu is visible but NO "Add to Cart" buttons
   - **Expected:** No cart sidebar

3. **Test Beach with Auto:**
   - Navigate to the beach's SpotPage
   - **Expected:** Menu is visible WITH "Add to Cart" buttons
   - **Expected:** Cart sidebar is visible
   - **Expected:** Can add items to cart

4. **Test Restaurant with Force Enable:**
   - Navigate to the restaurant's SpotPage
   - **Expected:** Menu WITH "Add to Cart" buttons (override works!)
   - **Expected:** Cart sidebar is visible

5. **Test Beach with Force Disable:**
   - Navigate to the beach's SpotPage
   - **Expected:** Menu is visible but NO "Add to Cart" buttons (override works!)
   - **Expected:** No cart sidebar

6. **Expected behavior:**
   - ✅ Auto setting respects venue type
   - ✅ Force Enable always shows ordering
   - ✅ Force Disable always hides ordering
   - ✅ No errors in console
   - ✅ Menu displays correctly in all cases

### Test Venue List Badges

1. **Check venue list in dashboard:**
   - Each venue should show TWO badges:
     - Ordering badge: 🛒 Ordering / 🚫 No Ordering
     - Digital ordering badge: 🤖 Auto Menu / ✓ Menu Enabled / ✗ Menu Disabled

2. **Verify badge colors:**
   - Auto Menu: Blue background
   - Menu Enabled: Blue background
   - Menu Disabled: Amber/yellow background

3. **Expected behavior:**
   - ✅ Both badges are visible
   - ✅ Colors are correct
   - ✅ Text is readable
   - ✅ Badges wrap properly on small screens

---

## Common Issues and Solutions

### Issue: Venue dropdown is empty in staff form
**Solution:** 
- Check that venues exist for the business
- Check browser console for API errors
- Verify venues are being fetched when modal opens

### Issue: Digital ordering badge not showing
**Solution:**
- Refresh the page to get latest venue data
- Check that backend is returning `allowsDigitalOrdering` field
- Check browser console for errors

### Issue: SpotPage still checking venue type
**Solution:**
- Clear browser cache
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check that latest code is deployed

### Issue: Changes not persisting
**Solution:**
- Check browser console for API errors
- Verify backend is running
- Check network tab to see if API calls are succeeding

---

## Quick Test Checklist

Use this for rapid testing:

### Zone Toggle
- [ ] Toggle works in BusinessAdmin
- [ ] Toggle works in SuperAdmin
- [ ] Status persists after refresh

### Staff Venue Assignment
- [ ] Create staff with venue
- [ ] Create staff without venue
- [ ] Edit staff to add venue
- [ ] Edit staff to remove venue
- [ ] Venue displays in staff list
- [ ] Works on mobile view

### Digital Ordering
- [ ] Create venue with Auto
- [ ] Create venue with Force Enable
- [ ] Create venue with Force Disable
- [ ] Edit venue to change setting
- [ ] Badges display correctly
- [ ] Restaurant with Auto = view-only menu
- [ ] Beach with Auto = ordering enabled
- [ ] Force Enable overrides type
- [ ] Force Disable overrides type

---

## Reporting Issues

If you find any issues, please note:
1. What you were doing (steps to reproduce)
2. What you expected to happen
3. What actually happened
4. Any error messages in browser console
5. Screenshots if applicable

---

## Next Steps After Testing

1. If all tests pass → Deploy to production
2. If issues found → Document and fix
3. Test again after fixes
4. Deploy to production
5. Test in production environment
6. Monitor for any issues
