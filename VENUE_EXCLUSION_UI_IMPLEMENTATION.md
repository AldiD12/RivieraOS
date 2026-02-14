# Venue Exclusion Management UI - Implementation Plan

**Date:** February 13, 2026  
**Goal:** Add UI to manage which venues can show specific categories/products  
**Dashboards:** Business Admin + SuperAdmin

---

## Business Logic

### Exclusion System
- **Default:** All categories/products show at ALL venues
- **Exclude:** Mark specific venues where item should NOT appear
- **Result:** Item only shows at non-excluded venues

### Example
```
Business has 3 venues: Beach Club, Rooftop Bar, Restaurant

Category: "Beach Services"
Excluded from: [Rooftop Bar, Restaurant]
Shows at: Beach Club only

Category: "Cocktails"  
Excluded from: []
Shows at: All venues
```

---

## UI Design (Industrial Minimalist)

### Location
Add exclusion management to:
1. **Category Create/Edit Modals** - Checkbox list of venues
2. **Product Create/Edit Modals** - Checkbox list of venues
3. **Category/Product List** - Show "Available at: X venues" indicator

### Visual Design
```
┌─────────────────────────────────────┐
│ Edit Category: Cocktails            │
├─────────────────────────────────────┤
│ Name: [Cocktails____________]       │
│ Sort Order: [0___]                  │
│ Active: [✓]                         │
│                                     │
│ Available at Venues:                │
│ ┌─────────────────────────────┐   │
│ │ ☑ Beach Club                │   │
│ │ ☑ Rooftop Bar               │   │
│ │ ☐ Restaurant (excluded)     │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Cancel] [Save Changes]             │
└─────────────────────────────────────┘
```

---

## Backend API Endpoints (Already Exist)

### Business Admin
```javascript
// Categories
GET    /api/business/Categories/{categoryId}/exclusions
POST   /api/business/Categories/{categoryId}/exclusions
DELETE /api/business/Categories/{categoryId}/exclusions/{venueId}

// Products
GET    /api/business/categories/{categoryId}/Products/{productId}/exclusions
POST   /api/business/categories/{categoryId}/Products/{productId}/exclusions
DELETE /api/business/categories/{categoryId}/Products/{productId}/exclusions/{venueId}
```

### SuperAdmin
```javascript
// Categories
GET    /api/superadmin/businesses/{businessId}/Categories/{categoryId}/exclusions
POST   /api/superadmin/businesses/{businessId}/Categories/{categoryId}/exclusions
DELETE /api/superadmin/businesses/{businessId}/Categories/{categoryId}/exclusions/{venueId}

// Products
GET    /api/superadmin/categories/{categoryId}/products/{productId}/exclusions
POST   /api/superadmin/categories/{categoryId}/products/{productId}/exclusions
DELETE /api/superadmin/categories/{categoryId}/products/{productId}/exclusions/{venueId}
```

---

## Implementation Steps

### Phase 1: Add API Methods to Services ✅
1. Add exclusion methods to `businessApi.js`
2. Add exclusion methods to `superAdminApi.js`

### Phase 2: Update Category Modals ✅
1. Fetch venues when modal opens
2. Fetch current exclusions for category
3. Show checkbox list of venues
4. Save exclusions when form submits
5. Show "Available at X venues" in category list

### Phase 3: Update Product Modals ✅
1. Fetch venues when modal opens
2. Fetch current exclusions for product
3. Show checkbox list of venues
4. Save exclusions when form submits
5. Show "Available at X venues" in product list

### Phase 4: Add Visual Indicators ✅
1. Category cards show venue count
2. Product cards show venue count
3. Tooltip/hover shows venue names

---

## Data Flow

### Loading Exclusions
```javascript
// When opening edit modal
1. Fetch category/product data
2. Fetch all venues for business
3. Fetch exclusions for this category/product
4. Build checkbox state:
   - venues.map(v => ({
       id: v.id,
       name: v.name,
       excluded: exclusions.includes(v.id)
     }))
```

### Saving Exclusions
```javascript
// When saving form
1. Get list of excluded venue IDs from checkboxes
2. Compare with original exclusions
3. Add new exclusions: POST for each new excluded venue
4. Remove old exclusions: DELETE for each un-excluded venue
5. Save category/product data
6. Refresh list
```

---

## UI Components

### VenueExclusionSelector Component
```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-zinc-300">
    Available at Venues
  </label>
  <div className="bg-zinc-800 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
    {venues.map(venue => (
      <label key={venue.id} className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!excludedVenueIds.includes(venue.id)}
          onChange={(e) => handleVenueToggle(venue.id, !e.target.checked)}
          className="rounded"
        />
        <span className="text-sm text-white">{venue.name}</span>
        {excludedVenueIds.includes(venue.id) && (
          <span className="text-xs text-red-400">(excluded)</span>
        )}
      </label>
    ))}
  </div>
  <p className="text-xs text-zinc-500">
    Uncheck venues where this item should NOT appear
  </p>
</div>
```

### Venue Count Badge
```jsx
<span className="text-xs text-zinc-400">
  📍 Available at {availableVenueCount}/{totalVenueCount} venues
</span>
```

---

## State Management

### Modal State
```javascript
const [venues, setVenues] = useState([]);
const [excludedVenueIds, setExcludedVenueIds] = useState([]);
const [loadingExclusions, setLoadingExclusions] = useState(false);

// Fetch on modal open
useEffect(() => {
  if (isOpen && editingCategory) {
    fetchVenues();
    fetchExclusions(editingCategory.id);
  }
}, [isOpen, editingCategory]);
```

### Save Handler
```javascript
const handleSaveWithExclusions = async (e) => {
  e.preventDefault();
  
  // 1. Save category/product data
  await saveCategory(categoryForm);
  
  // 2. Update exclusions
  await updateExclusions(categoryId, excludedVenueIds);
  
  // 3. Refresh list
  await fetchCategories();
};
```

---

## Error Handling

### Loading States
- Show spinner while fetching venues
- Show spinner while fetching exclusions
- Disable checkboxes during save

### Error Messages
- "Failed to load venues"
- "Failed to load exclusions"
- "Failed to save exclusions"
- Show in modal, don't close on error

---

## Testing Checklist

### Category Exclusions
- [ ] Create category with no exclusions → Shows at all venues
- [ ] Create category excluding 1 venue → Shows at other venues only
- [ ] Edit category to add exclusion → Updates correctly
- [ ] Edit category to remove exclusion → Updates correctly
- [ ] Delete category → Exclusions also deleted (backend handles)

### Product Exclusions
- [ ] Create product with no exclusions → Shows at all venues
- [ ] Create product excluding 1 venue → Shows at other venues only
- [ ] Edit product to add exclusion → Updates correctly
- [ ] Edit product to remove exclusion → Updates correctly
- [ ] Delete product → Exclusions also deleted (backend handles)

### Visual Indicators
- [ ] Category list shows venue count
- [ ] Product list shows venue count
- [ ] Hover shows venue names
- [ ] Excluded items marked clearly

### Edge Cases
- [ ] Business with 0 venues → Show message "Create venues first"
- [ ] Business with 1 venue → Show message "All items available at only venue"
- [ ] Exclude from all venues → Show warning "Item won't appear anywhere"

---

## Backend Task for Prof Kristi

**Update Public Menu API to respect exclusions:**

```csharp
// File: Controllers/Public/MenuController.cs
[HttpGet("venues/{venueId}/menu")]
public async Task<IActionResult> GetVenueMenu(int venueId)
{
    var categories = await _context.Categories
        .Where(c => c.BusinessId == venueId.Business.Id && c.IsActive)
        // ADD THIS: Filter out excluded categories
        .Where(c => !c.VenueExclusions.Any(e => e.VenueId == venueId))
        .Include(c => c.Products)
        .Select(c => new {
            c.Id,
            c.Name,
            Products = c.Products
                .Where(p => p.IsAvailable)
                // ADD THIS: Filter out excluded products
                .Where(p => !p.VenueExclusions.Any(e => e.VenueId == venueId))
                .ToList()
        })
        .ToListAsync();
        
    return Ok(categories);
}
```

---

## Files to Modify

### Services
1. `frontend/src/services/businessApi.js` - Add exclusion methods
2. `frontend/src/services/superAdminApi.js` - Add exclusion methods

### Modals
3. `frontend/src/components/dashboard/modals/CategoryModals.jsx` - Add venue selector
4. `frontend/src/components/dashboard/modals/ProductModals.jsx` - Add venue selector

### Dashboards
5. `frontend/src/pages/BusinessAdminDashboard.jsx` - Handle exclusions
6. `frontend/src/pages/SuperAdminDashboard.jsx` - Handle exclusions

### New Component (Optional)
7. `frontend/src/components/VenueExclusionSelector.jsx` - Reusable component

---

## Timeline

**Estimated Time:** 3-4 hours

1. Add API methods (30 min)
2. Update Category modals (60 min)
3. Update Product modals (60 min)
4. Add visual indicators (30 min)
5. Testing (30 min)
6. Documentation (30 min)

---

## Success Criteria

✅ Business Admin can exclude categories from specific venues  
✅ Business Admin can exclude products from specific venues  
✅ SuperAdmin can exclude categories from specific venues  
✅ SuperAdmin can exclude products from specific venues  
✅ Visual indicators show where items are available  
✅ Public menu API respects exclusions (backend task)  
✅ QR code orders only show venue-specific menu  

---

**Ready to implement! Starting with API methods, then modals, then visual indicators.**

