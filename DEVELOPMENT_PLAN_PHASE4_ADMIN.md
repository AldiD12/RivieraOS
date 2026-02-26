# Phase 4: Admin Controls + Experience Deck

**Duration:** 2-3 days  
**Goal:** Build admin tools + content engagement  
**Depends on:** Phase 3 complete

---

## STEP 1: Business Admin - Zone Override Toggle (3 hours)

**File:** `frontend/src/pages/AdminDashboard.jsx`

**Add New Tab:** "Zone Availability"

**Implementation:**

### Create Zone Override Component
**File:** `frontend/src/components/dashboard/ZoneOverride.jsx`

```javascript
import { useState, useEffect } from 'react';
import { businessApi } from '../services/businessApi';

export default function ZoneOverride() {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [overrideData, setOverrideData] = useState({
    isAvailable: false,
    reason: '',
    overrideUntil: ''
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const data = await businessApi.getZones();
      setZones(data);
    } catch (error) {
      console.error('Failed to load zones:', error);
    }
  };

  const handleOverride = async (zoneId) => {
    try {
      await businessApi.setZoneOverride(zoneId, overrideData);
      alert('Zone override set successfully');
      loadZones();
      setSelectedZone(null);
    } catch (error) {
      console.error('Failed to set override:', error);
      alert('Failed to set override');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Zone Availability Override</h2>
      
      {zones.map(zone => (
        <div key={zone.id} className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl text-white">{zone.name}</h3>
              <p className="text-zinc-400">
                {zone.availableUnits} / {zone.totalUnits} available
              </p>
              {zone.isManualOverride && (
                <p className="text-yellow-500 text-sm mt-2">
                  ⚠️ Manual override active: {zone.overrideReason}
                </p>
              )}
            </div>
            
            <button
              onClick={() => setSelectedZone(zone)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Override
            </button>
          </div>
        </div>
      ))}

      {/* Override Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl text-white mb-4">
              Override {selectedZone.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Status</label>
                <select
                  value={overrideData.isAvailable}
                  onChange={(e) => setOverrideData({
                    ...overrideData,
                    isAvailable: e.target.value === 'true'
                  })}
                  className="w-full bg-zinc-800 text-white p-2 rounded"
                >
                  <option value="false">Mark as Full</option>
                  <option value="true">Mark as Available</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Reason</label>
                <input
                  type="text"
                  value={overrideData.reason}
                  onChange={(e) => setOverrideData({
                    ...overrideData,
                    reason: e.target.value
                  })}
                  placeholder="e.g., Private event, maintenance"
                  className="w-full bg-zinc-800 text-white p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Override Until</label>
                <input
                  type="datetime-local"
                  value={overrideData.overrideUntil}
                  onChange={(e) => setOverrideData({
                    ...overrideData,
                    overrideUntil: e.target.value
                  })}
                  className="w-full bg-zinc-800 text-white p-2 rounded"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleOverride(selectedZone.id)}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Apply Override
              </button>
              <button
                onClick={() => setSelectedZone(null)}
                className="flex-1 bg-zinc-700 text-white py-2 rounded hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## STEP 2: Business Admin - Feedback Viewer (2 hours)

**File:** `frontend/src/components/dashboard/FeedbackViewer.jsx`

```javascript
import { useState, useEffect } from 'react';
import { businessApi } from '../services/businessApi';

export default function FeedbackViewer() {
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFeedback();
  }, [filter]);

  const loadFeedback = async () => {
    try {
      const data = await businessApi.getFeedback(filter);
      setFeedback(data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    }
  };

  const handleResolve = async (id) => {
    const notes = prompt('Resolution notes:');
    if (!notes) return;

    try {
      await businessApi.updateFeedbackStatus(id, {
        status: 'Resolved',
        resolutionNotes: notes
      });
      loadFeedback();
    } catch (error) {
      console.error('Failed to resolve feedback:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Feedback Shield</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-zinc-800 text-white p-2 rounded"
        >
          <option value="all">All Feedback</option>
          <option value="Intercepted">Intercepted</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Total Intercepted</p>
          <p className="text-3xl font-bold text-white">
            {feedback.length}
          </p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">This Week</p>
          <p className="text-3xl font-bold text-white">
            {feedback.filter(f => isThisWeek(f.submittedAt)).length}
          </p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Avg Rating</p>
          <p className="text-3xl font-bold text-white">
            {(feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length || 0).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.map(item => (
          <div key={item.id} className="bg-zinc-900 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-white font-bold">{item.guestName}</p>
                <p className="text-zinc-400 text-sm">{item.venueName}</p>
                <p className="text-zinc-500 text-xs">
                  {new Date(item.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">
                  {'⭐'.repeat(item.rating)}
                </span>
                <span className={`px-3 py-1 rounded text-xs ${
                  item.status === 'Resolved' 
                    ? 'bg-green-900 text-green-300'
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            <p className="text-white mb-4">{item.comment}</p>

            {item.status === 'Intercepted' && (
              <button
                onClick={() => handleResolve(item.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Mark as Resolved
              </button>
            )}

            {item.resolutionNotes && (
              <div className="mt-4 p-4 bg-zinc-800 rounded">
                <p className="text-zinc-400 text-sm mb-1">Resolution:</p>
                <p className="text-white">{item.resolutionNotes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function isThisWeek(date) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return new Date(date) > weekAgo;
}
```

---

## STEP 3: SuperAdmin - Content Manager (2 hours)

**File:** `frontend/src/components/dashboard/ContentManager.jsx`

```javascript
import { useState, useEffect } from 'react';
import { superAdminApi } from '../services/superAdminApi';

export default function ContentManager() {
  const [content, setContent] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'ARTICLE',
    imageUrl: '',
    contentUrl: '',
    author: '',
    venueId: null,
    readTimeMinutes: 5,
    isActive: true
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await superAdminApi.getContent();
      setContent(data);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await superAdminApi.createContent(formData);
      alert('Content created successfully');
      setShowForm(false);
      loadContent();
    } catch (error) {
      console.error('Failed to create content:', error);
      alert('Failed to create content');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content?')) return;
    
    try {
      await superAdminApi.deleteContent(id);
      loadContent();
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Content
        </button>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map(item => (
          <div key={item.id} className="bg-zinc-900 p-6 rounded-lg">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl text-white mb-2">{item.title}</h3>
            <p className="text-zinc-400 text-sm mb-4">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs">{item.contentType}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-zinc-900 p-8 rounded-lg max-w-2xl w-full m-4">
            <h3 className="text-2xl text-white mb-6">Add New Content</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields... */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
              >
                Create Content
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 4 Checklist:

- [ ] Zone override component created
- [ ] Feedback viewer created
- [ ] Content manager created
- [ ] All admin APIs integrated
- [ ] Testing complete
- [ ] Mobile responsive

---

**COMPLETE!** All phases done! 🎉
