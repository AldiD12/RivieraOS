# Auto-Assign Beach Venue to Collectors

**Date:** February 19, 2026  
**Goal:** When creating a Collector, automatically assign the first "Beach" type venue

---

## APPROACH: Hybrid Solution

**On Collector Creation:**
1. Find first venue with `type = "Beach"` for the business
2. Auto-assign that venue to the collector
3. Collector logs in → Has default venue assigned
4. CollectorDashboard → Can still see/switch to other venues

**Benefits:**
- ✅ Reduces admin work (no manual assignment needed)
- ✅ Collector has immediate default venue
- ✅ Flexible - collector can switch venues if business has multiple beaches

---

## BACKEND CHANGE (Prof Kristi)

### Update StaffController - Auto-Assign Beach Venue

**File:** `backend-temp/BlackBear.Services/BlackBear.Services.Core/Controllers/Business/StaffController.cs`

**Endpoint:** `POST /api/superadmin/businesses/{businessId}/Users`

**Add auto-assignment logic:**

```csharp
[HttpPost]
public async Task<IActionResult> CreateUser(int businessId, CreateUserRequest request)
{
    // Existing validation...
    
    // Create user
    var user = new User
    {
        Email = request.Email,
        PasswordHash = HashPassword(request.Password),
        FullName = request.FullName,
        PhoneNumber = request.PhoneNumber,
        PinHash = !string.IsNullOrEmpty(request.Pin) ? HashPin(request.Pin) : null,
        BusinessId = businessId,
        IsActive = request.IsActive,
        CreatedAt = DateTime.UtcNow
    };
    
    // ✅ NEW: Auto-assign Beach venue for Collectors
    if (request.Role == "Collector")
    {
        var beachVenue = await _context.Venues
            .Where(v => v.BusinessId == businessId && v.Type == "Beach")
            .OrderBy(v => v.Id)  // Get first beach venue
            .FirstOrDefaultAsync();
        
        if (beachVenue != null)
        {
            user.VenueId = beachVenue.Id;
            Console.WriteLine($"✅ Auto-assigned Beach venue '{beachVenue.Name}' (ID: {beachVenue.Id}) to Collector");
        }
        else
        {
            Console.WriteLine($"⚠️ No Beach venue found for business {businessId} - Collector created without venue assignment");
        }
    }
    
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    
    // Assign role...
    // Return response...
}
```

**Logic:**
1. Check if role is "Collector"
2. Find first venue where `type = "Beach"` for this business
3. Assign that venue's ID to the user
4. If no beach venue exists, create collector without venue (they can still see all venues)

---

## FRONTEND CHANGE (Optional Enhancement)

### CollectorDashboard - Smart Venue Loading

**File:** `frontend/src/pages/CollectorDashboard.jsx`

**Update to handle both assigned venue AND all venues:**

```javascript
const loadVenues = async () => {
    try {
      setLoading(true);
      
      // Get businessId and assigned venueId from localStorage
      const businessId = localStorage.getItem('businessId');
      const assignedVenueId = localStorage.getItem('venueId');
      
      if (!businessId) {
        alert('Authentication error. Please login again.');
        return;
      }
      
      // Fetch ALL venues for this business
      const data = await businessApi.venues.list(businessId);
      setVenues(data);
      
      // Smart selection logic:
      if (assignedVenueId) {
        // 1. Try to select assigned venue
        const assignedVenue = data.find(v => v.id === parseInt(assignedVenueId));
        if (assignedVenue) {
          setSelectedVenue(assignedVenue);
          console.log('✅ Selected assigned venue:', assignedVenue.name);
        } else {
          // Assigned venue not found, select first available
          setSelectedVenue(data[0]);
          console.log('⚠️ Assigned venue not found, selected first venue:', data[0]?.name);
        }
      } else {
        // 2. No assigned venue, select first available
        if (data.length > 0) {
          setSelectedVenue(data[0]);
          console.log('✅ No assigned venue, selected first venue:', data[0].name);
        } else {
          alert('No venues found for your business. Please contact your manager.');
        }
      }
    } catch (error) {
      console.error('Error loading venues:', error);
      alert('Failed to load venues. Please try again.');
    } finally {
      setLoading(false);
    }
};
```

**This logic:**
1. Loads ALL venues for the business
2. If collector has assigned venue → Selects it by default
3. If no assigned venue → Selects first available venue
4. Collector can still switch venues using dropdown

---

## TESTING SCENARIO

### Test 1: Create Collector with Beach Venue

**Setup:**
- Business has 2 venues: "Beach A" (type: Beach), "Restaurant B" (type: Restaurant)

**Steps:**
1. SuperAdmin creates new Collector
2. Backend auto-assigns "Beach A" to collector
3. Collector logs in
4. CollectorDashboard loads → Shows "Beach A" selected by default
5. Collector can switch to "Restaurant B" if needed

**Expected:**
- ✅ Collector has "Beach A" assigned automatically
- ✅ Can see both venues in dropdown
- ✅ Can switch between venues

### Test 2: Create Collector without Beach Venue

**Setup:**
- Business has 1 venue: "Restaurant A" (type: Restaurant)
- No Beach venues exist

**Steps:**
1. SuperAdmin creates new Collector
2. Backend creates collector without venue assignment (no beach found)
3. Collector logs in
4. CollectorDashboard loads → Shows "Restaurant A" selected (first available)

**Expected:**
- ✅ Collector created successfully (no error)
- ✅ Can see "Restaurant A" in dropdown
- ✅ Can work with restaurant venue

### Test 3: Create Bartender (Not Collector)

**Setup:**
- Business has "Beach A" (type: Beach)

**Steps:**
1. SuperAdmin creates new Bartender
2. Backend does NOT auto-assign venue (only for Collectors)
3. Bartender logs in
4. BarDisplay works normally

**Expected:**
- ✅ Bartender has no venue assigned (correct)
- ✅ BarDisplay shows all orders (not filtered by venue)

---

## ALTERNATIVE: Auto-Assign ANY First Venue

If you want to assign ANY venue (not just Beach), change the backend logic:

```csharp
// Auto-assign FIRST venue (any type) for Collectors
if (request.Role == "Collector")
{
    var firstVenue = await _context.Venues
        .Where(v => v.BusinessId == businessId)
        .OrderBy(v => v.Id)
        .FirstOrDefaultAsync();
    
    if (firstVenue != null)
    {
        user.VenueId = firstVenue.Id;
    }
}
```

---

## RECOMMENDATION

**Use the Beach-specific auto-assignment** because:
1. Collectors are specifically for beach/sunbed management
2. If business has both beach and restaurant, collector should default to beach
3. More intuitive for the business use case
4. Collector can still switch to restaurant if needed

---

## ESTIMATED TIME

- **Backend:** 15 minutes (add auto-assignment logic to CreateUser)
- **Frontend:** 15 minutes (update CollectorDashboard venue loading)
- **Testing:** 15 minutes
- **Total:** 45 minutes

---

## SUMMARY

This hybrid approach gives you:
- ✅ Automatic venue assignment (reduces admin work)
- ✅ Smart default selection (Beach venues prioritized)
- ✅ Flexibility (collector can see/switch to other venues)
- ✅ Graceful fallback (works even if no beach venue exists)

Best of both worlds!
