# 🧪 God Mode Features Testing Guide

**Date:** March 5, 2026  
**System:** Business Features Access Control  
**Components:** Frontend + Backend Integration

---

## 🚀 Quick Start Testing

### 1. **Start the Application**
```bash
# Frontend
cd frontend
npm run dev

# Backend should already be running with Prof Kristi's deployment
```

### 2. **Login as SuperAdmin**
- Navigate to `/superadmin-login`
- Use SuperAdmin credentials
- Go to SuperAdmin Dashboard

### 3. **Login as Business Manager**
- Navigate to `/login` 
- Use Manager/Owner credentials
- Go to Business Dashboard

---

## 🎯 Test Scenarios

### **Scenario 1: SuperAdmin "Breaker Panel" Testing**

#### Step 1: Access Features Panel
1. **Login as SuperAdmin** → SuperAdmin Dashboard
2. **Go to "Businesses" tab**
3. **Find any business card**
4. **Click "⚡ Features" button**
5. **Verify:** SuperAdminFeaturesPanel modal opens

#### Step 2: Toggle Features
1. **In the Features Panel:**
   - Toggle `hasEvents` OFF → ON
   - Toggle `hasBookings` OFF → ON  
   - Toggle `hasDigitalMenu` ON → OFF
2. **Click "Save Changes"**
3. **Verify:** Success message appears
4. **Close panel**

#### Step 3: Verify API Calls
**Check Browser DevTools Network Tab:**
```
PATCH /api/superadmin/Features/{businessId}
Content-Type: application/json
{
  "hasEvents": true,
  "hasBookings": true,
  "hasDigitalMenu": false
}
```

---

### **Scenario 2: Business Dashboard "Real-Time Sync" Testing**

#### Step 1: Login as Business Manager
1. **Login with Manager/Owner role**
2. **Navigate to Business Dashboard**
3. **Verify:** `fetchFeatures()` called automatically
4. **Verify:** "Auto-Sync" indicator appears in header (next to "System Live")

#### Step 2: Check Tab Visibility & Polling
**Expected Behavior Based on Features:**
- **Overview Tab:** Always visible
- **Staff Tab:** Always visible  
- **Menu Tab:** Only if `hasDigitalMenu = true`
- **Venues Tab:** Only if `hasBookings = true`
- **Events Tab:** Only if `hasEvents = true`
- **QR Generator Tab:** Only if `hasDigitalMenu = true`
- **Auto-Sync:** Polls every 30 seconds for feature changes

#### Step 3: Test Real-Time Feature Updates
1. **Keep Business Dashboard open**
2. **In another tab/window:** Login as SuperAdmin
3. **SuperAdmin:** Toggle `hasEvents` from OFF → ON for this business
4. **SuperAdmin:** Click "Save Changes"
5. **Wait up to 30 seconds**
6. **Business Dashboard:** Events tab should appear automatically (no refresh needed!)

#### Step 4: Verify Polling Behavior
**Check Browser DevTools Network Tab:**
- Should see GET `/api/business/Profile/features` requests every 30 seconds
- Requests should be "silent" (no loading spinners during polling)
- Console should show: `🔄 Starting feature polling (30s interval)...`

---

### **Scenario 3: Upgrade Prompts Testing**

#### Step 1: Disable Features (Real-Time Test)
1. **Business Manager:** Keep dashboard open
2. **SuperAdmin:** Disable `hasEvents` for this business
3. **Wait 30 seconds:** Events tab should disappear automatically
4. **Business Manager:** Try to access events functionality

#### Step 2: Verify Upgrade Prompts
**Expected UI:**
```
🔒 Events Management Not Available
This feature is not included in your current plan.
[Contact Sales to Upgrade]
```

#### Step 3: Test Re-enabling Features
- **SuperAdmin:** Re-enable `hasEvents`
- **Wait 30 seconds:** Events tab should reappear automatically
- **Business Manager:** Should be able to access events again

---

## 🔍 API Testing

### **Test 1: Business Features Endpoint**
```bash
# Get business features (as business user)
curl -X GET \
  "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/profile/features" \
  -H "Authorization: Bearer YOUR_BUSINESS_JWT_TOKEN"

# Expected Response:
{
  "hasDigitalMenu": true,
  "hasTableOrdering": false,
  "hasBookings": false,
  "hasEvents": false,
  "hasPulse": false
}
```

### **Test 2: SuperAdmin Features Control**
```bash
# Update business features (as SuperAdmin)
curl -X PATCH \
  "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/Features/123" \
  -H "Authorization: Bearer YOUR_SUPERADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hasEvents": true,
    "hasBookings": true
  }'
```

### **Test 3: Feature-Gated Endpoints**
```bash
# These should return 403 if feature disabled:
GET /api/business/events          # Requires hasEvents
GET /api/business/reservations    # Requires hasBookings  
GET /api/business/orders          # Requires hasTableOrdering
```

---

## 🎨 UI/UX Testing

### **SuperAdmin Features Panel Design**
**Industrial Minimalist Checklist:**
- [ ] Black/zinc background (`bg-zinc-900`)
- [ ] White text (`text-white`)
- [ ] Sharp corners (`rounded-lg`)
- [ ] High contrast toggle switches
- [ ] Monospace status indicators
- [ ] No shadows or gradients
- [ ] Warning banner for "God Mode Access"

### **Business Dashboard Design**
**Mobile-First Responsive:**
- [ ] Tabs scroll horizontally on mobile
- [ ] Feature guards show upgrade prompts
- [ ] Loading states during `fetchFeatures()`
- [ ] Error handling for API failures

### **Feature Status Indicators**
- [ ] Green dot = Feature enabled
- [ ] Red dot = Feature disabled  
- [ ] Toggle switches work smoothly
- [ ] Status updates in real-time

---

## 🐛 Error Testing

### **Test 1: Network Failures**
1. **Disconnect internet**
2. **Try to toggle features**
3. **Verify:** Error message appears
4. **Reconnect internet**
5. **Verify:** Retry works

### **Test 2: Invalid Permissions**
1. **Login as regular Staff (Bartender/Collector)**
2. **Try to access Business Dashboard**
3. **Verify:** Redirected to login
4. **Try direct API calls**
5. **Verify:** 403 Forbidden responses

### **Test 3: Missing Business Context**
1. **Clear localStorage**
2. **Login without businessId**
3. **Verify:** Graceful error handling

---

## 📱 Cross-Platform Testing

### **Desktop Testing**
- [ ] Chrome/Safari/Firefox
- [ ] Features panel modal responsive
- [ ] Tab navigation works
- [ ] Toggle switches clickable

### **Mobile Testing**  
- [ ] iOS Safari / Android Chrome
- [ ] Tab scrolling smooth
- [ ] Modal fits screen
- [ ] Touch interactions work

### **Tablet Testing**
- [ ] iPad / Android tablet
- [ ] Layout adapts properly
- [ ] All features accessible

---

## 🔐 Security Testing

### **Authentication Testing**
1. **Expired JWT tokens**
2. **Invalid role claims**
3. **Missing businessId in token**
4. **Cross-business access attempts**

### **Authorization Testing**
1. **Staff trying to access Manager features**
2. **Manager trying to access SuperAdmin features**
3. **Business A trying to modify Business B features**

---

## 📊 Performance Testing

### **Load Testing**
1. **Multiple SuperAdmins toggling features simultaneously**
2. **Many business users loading dashboards**
3. **Rapid feature toggle operations**

### **Caching Testing**
1. **Features cached in Zustand store**
2. **LocalStorage persistence works**
3. **Cache invalidation on updates**

---

## ✅ Success Criteria

### **Functional Requirements**
- [ ] SuperAdmin can toggle all business features
- [ ] Business dashboard tabs appear/disappear based on features
- [ ] API calls work correctly
- [ ] Error handling is robust
- [ ] UI follows design system guidelines

### **Non-Functional Requirements**
- [ ] Response time < 2 seconds
- [ ] Mobile responsive design
- [ ] Accessibility compliant
- [ ] Cross-browser compatible
- [ ] Secure authentication/authorization

---

## 🚨 Common Issues & Solutions

### **Issue 1: Features Panel Won't Open**
**Symptoms:** Click "⚡ Features" button, nothing happens
**Check:**
- Browser console for JavaScript errors
- Network tab for failed API calls
- SuperAdmin authentication token validity

### **Issue 2: Tabs Not Updating**
**Symptoms:** Toggle features but business tabs don't change
**Check:**
- `fetchFeatures()` being called on dashboard load
- Zustand store state updates
- Feature guard conditions in tab filtering

### **Issue 3: 403 Forbidden Errors**
**Symptoms:** API calls return 403
**Check:**
- JWT token has correct role claims
- BusinessId present in token
- Feature flags in database match expectations

### **Issue 4: UI Design Issues**
**Symptoms:** Wrong colors, fonts, or layout
**Check:**
- Industrial Minimalist design for staff pages
- Tailwind classes match design system
- Mobile responsiveness

---

## 🎉 Testing Checklist

### **Before Testing:**
- [ ] Backend deployed with Prof Kristi's features
- [ ] Frontend running with latest code
- [ ] Test accounts available (SuperAdmin + Business Manager)
- [ ] Browser DevTools open for debugging

### **During Testing:**
- [ ] Test each scenario step-by-step
- [ ] Document any bugs or issues
- [ ] Take screenshots of UI problems
- [ ] Note API response times

### **After Testing:**
- [ ] Verify all features work end-to-end
- [ ] Confirm security measures effective
- [ ] Check performance is acceptable
- [ ] Document any remaining issues

---

## 🎯 Ready to Test!

The "God Mode" system now includes **real-time polling** for seamless feature updates:

✅ **SuperAdmin Features Panel:** Saves state properly  
✅ **Business Dashboard:** Respects feature settings  
✅ **Real-Time Sync:** Polls every 30 seconds for changes  
✅ **Auto-Update UI:** Tabs appear/disappear without refresh  
✅ **Visual Indicators:** "Auto-Sync" status in header  

**New Flow:**
1. SuperAdmin changes features → Saves successfully
2. Business Dashboard polls every 30 seconds → Detects changes
3. UI updates automatically → No manual refresh needed!

Start with **Scenario 1** (SuperAdmin Features Panel), then test **Scenario 2** (Real-Time Sync) to see the automatic updates in action.

**Happy Testing!** 🚀