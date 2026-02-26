# Admin Dashboard Controls for Context-Aware Routing

**Date:** February 25, 2026  
**Priority:** HIGH - Must be done BEFORE backend APIs  
**Affected Dashboards:** SuperAdmin, Business Admin

---

## 🎯 THE PROBLEM

We're adding 2 new backend APIs:
1. **Negative Feedback Tracking** - Save bad reviews before WhatsApp
2. **Manual Zone Override** - Let managers mark zones as FULL

But we have NO UI controls to use these features! We need to add them to the admin dashboards first.

---

## 📊 WHAT NEEDS TO BE ADDED

### 1. BUSINESS ADMIN DASHBOARD - Zone Management

**Location:** `frontend/src/pages/AdminDashboard.jsx`

**New Feature:** Manual Zone Availability Override

**Where to Add:** In the Zones/Sunbeds management section

**UI Components Needed:**

#### A. Zone Card - Add Override Toggle
```jsx
// In each zone card, add this section:
<div className="mt-4 border-t border-zinc-700 pt-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-zinc-400">Manual Override</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={zone.isManualOverride}
        onChange={() => handleToggleOverride(zone.id)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
    </label>
  </div>
  
  {zone.isManualOverride && (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-red-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        Zone marked as FULL (overriding automatic count)
      </div>
      <input
        type="text"
        placeholder="Reason (e.g., Private event)"
        value={zone.overrideReason || ''}
        onChange={(e) => handleOverrideReasonChange(zone.id, e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
      />
      <input
        type="datetime-local"
        value={zone.overrideUntil || ''}
        onChange={(e) => handleOverrideUntilChange(zone.id, e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
      />
      <button
        onClick={() => handleSaveOverride(zone.id)}
        className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Save Override
      </button>
    </div>
  )}
</div>
```

#### B. API Functions to Add
```javascript
// In AdminDashboard.jsx or a new service file

const handleToggleOverride = async (zoneId) => {
  const zone = zones.find(z => z.id === zoneId);
  
  if (zone.isManualOverride) {
    // Remove override
    try {
      await fetch(`${API_URL}/api/business/zones/${zoneId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isAvailable: true,
          reason: null,
          overrideUntil: null
        })
      });
      
      // Refresh zones
      fetchZones();
    } catch (error) {
      console.error('Failed to remove override:', error);
      alert('Failed to remove override');
    }
  } else {
    // Enable override mode (just toggle UI, save happens on button click)
    setZones(zones.map(z => 
      z.id === zoneId 
        ? { ...z, isManualOverride: true, overrideReason: '', overrideUntil: '' }
        : z
    ));
  }
};

const handleSaveOverride = async (zoneId) => {
  const zone = zones.find(z => z.id === zoneId);
  
  if (!zone.overrideReason) {
    alert('Please enter a reason for the override');
    return;
  }
  
  if (!zone.overrideUntil) {
    alert('Please select when the override should end');
    return;
  }
  
  try {
    await fetch(`${API_URL}/api/business/zones/${zoneId}/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        isAvailable: false,
        reason: zone.overrideReason,
        overrideUntil: zone.overrideUntil
      })
    });
    
    alert('Override saved successfully');
    fetchZones();
  } catch (error) {
    console.error('Failed to save override:', error);
    alert('Failed to save override');
  }
};
```

---

### 2. BUSINESS ADMIN DASHBOARD - Negative Feedback Viewer

**Location:** `frontend/src/pages/AdminDashboard.jsx`

**New Feature:** View Intercepted Bad Reviews

**Where to Add:** New tab in dashboard navigation

**UI Components Needed:**

#### A. Add "Feedback" Tab
```jsx
// In the tab navigation, add:
<button
  onClick={() => setActiveTab('feedback')}
  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
    activeTab === 'feedback'
      ? 'bg-zinc-800 text-white'
      : 'text-zinc-400 hover:text-white'
  }`}
>
  Feedback Shield
  {negativeFeedbackCount > 0 && (
    <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
      {negativeFeedbackCount}
    </span>
  )}
</button>
```

#### B. Feedback Tab Content
```jsx
// New tab content:
{activeTab === 'feedback' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-white">Intercepted Feedback</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Bad reviews that were redirected to WhatsApp support
        </p>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-white">{negativeFeedbackCount}</div>
        <div className="text-sm text-zinc-400">Reviews Prevented</div>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-zinc-800 rounded-lg p-4">
        <div className="text-zinc-400 text-sm mb-1">This Week</div>
        <div className="text-2xl font-bold text-white">{feedbackStats.thisWeek}</div>
      </div>
      <div className="bg-zinc-800 rounded-lg p-4">
        <div className="text-zinc-400 text-sm mb-1">This Month</div>
        <div className="text-2xl font-bold text-white">{feedbackStats.thisMonth}</div>
      </div>
      <div className="bg-zinc-800 rounded-lg p-4">
        <div className="text-zinc-400 text-sm mb-1">Avg Rating</div>
        <div className="text-2xl font-bold text-white">{feedbackStats.avgRating.toFixed(1)}</div>
      </div>
    </div>

    {/* Feedback List */}
    <div className="space-y-4">
      {negativeFeedback.map((feedback) => (
        <div key={feedback.id} className="bg-zinc-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* Star Rating */}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= feedback.rating ? 'text-amber-500' : 'text-zinc-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-zinc-400 text-sm">
                  {new Date(feedback.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-white font-medium mb-1">
                {feedback.guestName || 'Anonymous'}
              </div>
              {feedback.unitCode && (
                <div className="text-zinc-400 text-sm">Unit {feedback.unitCode}</div>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              feedback.status === 'Resolved' 
                ? 'bg-green-900 text-green-300'
                : feedback.status === 'Escalated'
                ? 'bg-red-900 text-red-300'
                : 'bg-amber-900 text-amber-300'
            }`}>
              {feedback.status}
            </span>
          </div>
          
          <p className="text-zinc-300 mb-4">{feedback.comment}</p>
          
          {feedback.guestPhone && (
            <a
              href={`https://wa.me/${feedback.guestPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact Guest
            </a>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

#### C. API Functions to Add
```javascript
// Fetch negative feedback
const fetchNegativeFeedback = async () => {
  try {
    const response = await fetch(`${API_URL}/api/business/feedback`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch feedback');
    
    const data = await response.json();
    setNegativeFeedback(data);
    setNegativeFeedbackCount(data.length);
    
    // Calculate stats
    const thisWeek = data.filter(f => 
      new Date(f.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const thisMonth = data.filter(f => 
      new Date(f.submittedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const avgRating = data.reduce((sum, f) => sum + f.rating, 0) / data.length;
    
    setFeedbackStats({ thisWeek, thisMonth, avgRating });
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
  }
};
```

---

### 3. SUPERADMIN DASHBOARD - Content Management

**Location:** `frontend/src/pages/SuperAdminDashboard.jsx`

**New Feature:** Manage Experience Deck Content

**Where to Add:** New "Content" tab

**UI Components Needed:**

#### A. Add "Content" Tab
```jsx
<button
  onClick={() => setActiveTab('content')}
  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
    activeTab === 'content'
      ? 'bg-zinc-800 text-white'
      : 'text-zinc-400 hover:text-white'
  }`}
>
  Content
</button>
```

#### B. Content Management UI
```jsx
{activeTab === 'content' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Experience Deck Content</h2>
      <button
        onClick={() => setShowCreateContentModal(true)}
        className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100"
      >
        + Add Content
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <div key={item.id} className="bg-zinc-800 rounded-lg overflow-hidden">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded">
                {item.contentType}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                item.isActive 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-red-900 text-red-300'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-2">{item.title}</h3>
            <p className="text-zinc-400 text-sm mb-4">{item.description}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditContent(item)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteContent(item.id)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 📅 IMPLEMENTATION ORDER

### Phase 0: Admin UI Controls (Do First!)
**Time:** 2-3 days

1. **Day 1:** Add Zone Override UI to Business Admin
   - Toggle switch in zone cards
   - Override reason and expiry inputs
   - Save/cancel buttons
   - API integration (mock for now)

2. **Day 2:** Add Feedback Viewer to Business Admin
   - New "Feedback Shield" tab
   - Stats cards (this week, this month, avg rating)
   - Feedback list with WhatsApp contact button
   - API integration (mock for now)

3. **Day 3:** Add Content Management to SuperAdmin
   - New "Content" tab
   - Content cards with image preview
   - Create/Edit/Delete modals
   - API integration (mock for now)

### Phase 1: Backend APIs
**Time:** 8-11 hours (Prof Kristi)

Once UI is ready, Prof Kristi builds the actual APIs

### Phase 2: Connect UI to Real APIs
**Time:** 1 day

Replace mock data with real API calls

---

## 🎨 DESIGN NOTES

**Staff Dashboards = Industrial Minimalist**
- Black/zinc backgrounds
- White text, high contrast
- Sharp corners (rounded-md, rounded-lg)
- No shadows or gradients
- Flat design with 1-2px borders
- Tight spacing (p-4, p-6)

**DO NOT use luxury design for admin dashboards!**

---

## ✅ CHECKLIST

### Business Admin Dashboard
- [ ] Add zone override toggle to zone cards
- [ ] Add override reason input
- [ ] Add override expiry datetime picker
- [ ] Add save/cancel buttons
- [ ] Add "Feedback Shield" tab to navigation
- [ ] Add feedback stats cards
- [ ] Add feedback list with ratings
- [ ] Add WhatsApp contact button
- [ ] Mock API functions (for testing)

### SuperAdmin Dashboard
- [ ] Add "Content" tab to navigation
- [ ] Add content grid layout
- [ ] Add create content button
- [ ] Add content cards with image preview
- [ ] Add edit/delete buttons
- [ ] Create content modal
- [ ] Mock API functions (for testing)

### Backend (Prof Kristi)
- [ ] `PUT /api/business/zones/{id}/availability`
- [ ] `GET /api/business/feedback`
- [ ] `POST /api/public/Feedback`
- [ ] `GET /api/superadmin/content`
- [ ] `POST /api/superadmin/content`
- [ ] `PUT /api/superadmin/content/{id}`
- [ ] `DELETE /api/superadmin/content/{id}`

---

**Created:** February 25, 2026  
**Priority:** HIGH - Do this BEFORE sending backend spec to Prof Kristi  
**Reason:** No point building APIs if we have no UI to use them!
