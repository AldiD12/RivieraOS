# Visual Sunbed Mapper - Implementation Plan

## 🎯 Goal
Build a drag-and-drop visual interface where managers can position sunbeds/tables on a venue map to match the physical layout.

---

## 🏗️ Architecture Overview

### What It Does:
1. Manager uploads venue background image (beach photo, pool layout, etc.)
2. Manager drags sunbed icons onto the map
3. System saves X/Y coordinates to database
4. Customers see the visual map when booking
5. Staff see the map when managing bookings

### Key Features:
- Drag & drop sunbed positioning
- Zoom in/out and pan
- Rotate sunbeds (0°, 90°, 180°, 270°)
- Bulk create units with auto-layout
- Zone color-coding
- Save/load layouts
- Export as image for staff

---

## 📋 Backend Changes Required (For Prof Kristi)

### 1. Update ZoneUnit Entity
**File:** `BlackBear.Services.Core/Entities/ZoneUnit.cs`

**Add these fields:**
```csharp
public class ZoneUnit
{
    // ... existing fields ...
    
    // ✅ ADD THESE:
    public int? PositionX { get; set; }  // X coordinate on map (pixels)
    public int? PositionY { get; set; }  // Y coordinate on map (pixels)
    public int? Rotation { get; set; }   // 0, 90, 180, 270 degrees
}
```

### 2. SQL Migration
```sql
-- Add position fields to catalog_zone_units table
ALTER TABLE catalog_zone_units 
ADD position_x INT NULL,
    position_y INT NULL,
    rotation INT NULL DEFAULT 0;
```

### 3. Update DTOs
**File:** `BlackBear.Services.Core/DTOs/Business/ZoneUnitDtos.cs`

**Update BizZoneUnitListItemDto:**
```csharp
public class BizZoneUnitListItemDto
{
    public int Id { get; set; }
    public string UnitCode { get; set; }
    public string UnitType { get; set; }
    public string Status { get; set; }
    public double? BasePrice { get; set; }
    
    // ✅ ADD THESE:
    public int? PositionX { get; set; }
    public int? PositionY { get; set; }
    public int? Rotation { get; set; }
    
    public string QrCode { get; set; }
    public int VenueZoneId { get; set; }
}
```

### 4. New Endpoint: Bulk Update Positions
**File:** `BlackBear.Services.Core/Controllers/Business/UnitsController.cs`

**Add this endpoint:**
```csharp
[HttpPatch("positions")]
public async Task<IActionResult> BulkUpdatePositions([FromBody] List<UpdateUnitPositionRequest> positions)
{
    foreach (var pos in positions)
    {
        var unit = await _context.ZoneUnits
            .FirstOrDefaultAsync(u => u.Id == pos.UnitId && u.Venue.BusinessId == CurrentBusinessId);
            
        if (unit != null)
        {
            unit.PositionX = pos.PositionX;
            unit.PositionY = pos.PositionY;
            unit.Rotation = pos.Rotation;
        }
    }
    
    await _context.SaveChangesAsync();
    return Ok(new { message = "Positions updated successfully" });
}

public class UpdateUnitPositionRequest
{
    public int UnitId { get; set; }
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public int Rotation { get; set; }
}
```

### 5. Update Venue Entity (Optional - for background image)
**File:** `BlackBear.Services.Core/Entities/Venue.cs`

**Add this field:**
```csharp
public class Venue
{
    // ... existing fields ...
    
    // ✅ ADD THIS:
    public string? MapImageUrl { get; set; }  // Background image for mapper
}
```

**SQL Migration:**
```sql
ALTER TABLE catalog_venues 
ADD map_image_url NVARCHAR(500) NULL;
```

---

## 🎨 Frontend Implementation

### Page: `/admin/venues/:venueId/mapper`

### Tech Stack
**Libraries to install:**
```bash
npm install react-draggable
npm install react-zoom-pan-pinch
```

### Component Structure
```
SunbedMapper/
├── SunbedMapper.jsx          # Main component
├── Canvas.jsx                # Draggable canvas area
├── SunbedIcon.jsx            # Individual sunbed component
├── Toolbar.jsx               # Controls (zoom, rotate, etc.)
├── UnitsList.jsx             # Sidebar with units
└── hooks/
    ├── useCanvas.js          # Canvas state management
    └── useUnits.js           # Units data management
```

---

## 📐 UI Design (Industrial Minimalist - Staff Tool)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Sunbed Mapper - Beach Club Coral               [Save Layout]│
├─────────────────────────────────────────────────────────────┤
│ Toolbar:                                                     │
│ [Upload BG] [Zoom -] [100%] [Zoom +] [Grid] [Auto-Layout]  │
├──────────────┬──────────────────────────────────────────────┤
│ Units (25)   │                                              │
│              │                                              │
│ Zone: VIP    │         CANVAS AREA                         │
│ 🏖️ A1 ✓      │    (Drag sunbeds here)                      │
│ 🏖️ A2 ✓      │                                              │
│ 🏖️ A3        │    [Background: beach.jpg]                  │
│              │                                              │
│ Zone: Regular│                                              │
│ 🏖️ B1 ✓      │                                              │
│ 🏖️ B2        │                                              │
│              │                                              │
│ [+ Add Unit] │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Colors (Industrial Minimalist)
- Background: `bg-zinc-900`
- Canvas: `bg-zinc-800`
- Sunbed icons: `bg-white` with `border-zinc-700`
- Selected: `border-blue-500`
- Zone VIP: `bg-amber-500/20` overlay
- Zone Regular: `bg-blue-500/20` overlay

### Sunbed Icon Design
```
┌─────────┐
│   A1    │  ← Unit code
│  🏖️     │  ← Icon
│ [Rotate]│  ← Controls (on hover)
└─────────┘
```

---

## 🔧 Implementation Steps

### Step 1: Backend Changes (Prof Kristi - 30 minutes)
- [ ] Add PositionX, PositionY, Rotation to ZoneUnit entity
- [ ] Run SQL migration
- [ ] Update DTOs
- [ ] Add bulk update positions endpoint
- [ ] (Optional) Add MapImageUrl to Venue entity

### Step 2: Frontend Setup (15 minutes)
- [ ] Install dependencies (react-draggable, react-zoom-pan-pinch)
- [ ] Create `/admin/venues/:venueId/mapper` route
- [ ] Create component structure

### Step 3: Canvas Component (2 hours)
- [ ] Implement zoom/pan functionality
- [ ] Background image upload/display
- [ ] Grid overlay (optional)
- [ ] Canvas size management

### Step 4: Draggable Sunbeds (3 hours)
- [ ] Fetch units from API
- [ ] Render sunbed icons at saved positions
- [ ] Implement drag functionality
- [ ] Update positions on drag end
- [ ] Rotation controls

### Step 5: Toolbar & Controls (2 hours)
- [ ] Zoom in/out buttons
- [ ] Upload background image
- [ ] Grid toggle
- [ ] Auto-layout button (arrange in grid)
- [ ] Save button

### Step 6: Units Sidebar (1 hour)
- [ ] List all units grouped by zone
- [ ] Show positioned/unpositioned status
- [ ] Click to highlight on canvas
- [ ] Zone color indicators

### Step 7: Save/Load (1 hour)
- [ ] Bulk update positions API call
- [ ] Loading state
- [ ] Success/error messages
- [ ] Auto-save (debounced)

### Step 8: Polish (2 hours)
- [ ] Snap to grid
- [ ] Undo/redo
- [ ] Keyboard shortcuts
- [ ] Export as image
- [ ] Mobile warning (desktop-only feature)

**Total Time: ~12 hours (1.5 days)**

---

## 💻 Code Example: Main Component

```jsx
import { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import businessApi from '../services/businessApi';

export default function SunbedMapper() {
  const { venueId } = useParams();
  const [venue, setVenue] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVenueAndUnits();
  }, [venueId]);

  const fetchVenueAndUnits = async () => {
    const venueData = await businessApi.venues.get(venueId);
    const unitsData = await businessApi.units.list(venueId);
    setVenue(venueData);
    setUnits(unitsData);
  };

  const handleDrag = (unitId, e, data) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId 
        ? { ...unit, positionX: data.x, positionY: data.y }
        : unit
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const positions = units.map(u => ({
        unitId: u.id,
        positionX: u.positionX || 0,
        positionY: u.positionY || 0,
        rotation: u.rotation || 0
      }));
      
      await businessApi.units.updatePositions(venueId, positions);
      alert('Layout saved successfully!');
    } catch (error) {
      alert('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const handleRotate = (unitId) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId 
        ? { ...unit, rotation: ((unit.rotation || 0) + 90) % 360 }
        : unit
    ));
  };

  return (
    <div className="h-screen bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="bg-black border-b border-zinc-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sunbed Mapper</h1>
          <p className="text-zinc-400 text-sm">{venue?.name}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-zinc-800 border-b border-zinc-700 p-3 flex items-center gap-4">
        <button className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600">
          Upload Background
        </button>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600">
            Zoom -
          </button>
          <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
          <button className="px-3 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600">
            Zoom +
          </button>
        </div>
        <button className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600">
          Auto-Layout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-800 border-r border-zinc-700 overflow-y-auto p-4">
          <h3 className="text-white font-bold mb-4">Units ({units.length})</h3>
          {units.map(unit => (
            <div
              key={unit.id}
              className={`p-3 mb-2 rounded border cursor-pointer ${
                selectedUnit?.id === unit.id
                  ? 'bg-blue-900 border-blue-500'
                  : 'bg-zinc-700 border-zinc-600 hover:bg-zinc-600'
              }`}
              onClick={() => setSelectedUnit(unit)}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{unit.unitCode}</span>
                {unit.positionX && unit.positionY && (
                  <span className="text-green-400 text-xs">✓</span>
                )}
              </div>
              <span className="text-zinc-400 text-xs">{unit.unitType}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-zinc-900">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            onZoom={(ref) => setZoom(ref.state.scale)}
          >
            <TransformComponent>
              <div className="relative w-[2000px] h-[1500px] bg-zinc-800">
                {/* Background Image */}
                {venue?.mapImageUrl && (
                  <img
                    src={venue.mapImageUrl}
                    alt="Venue map"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}

                {/* Sunbeds */}
                {units.map(unit => (
                  <Draggable
                    key={unit.id}
                    position={{ 
                      x: unit.positionX || 100, 
                      y: unit.positionY || 100 
                    }}
                    onStop={(e, data) => handleDrag(unit.id, e, data)}
                  >
                    <div
                      className={`absolute w-20 h-32 bg-white border-2 rounded-lg flex flex-col items-center justify-center cursor-move ${
                        selectedUnit?.id === unit.id
                          ? 'border-blue-500 shadow-lg'
                          : 'border-zinc-700'
                      }`}
                      style={{
                        transform: `rotate(${unit.rotation || 0}deg)`
                      }}
                    >
                      <span className="text-2xl">🏖️</span>
                      <span className="text-xs font-bold mt-1">{unit.unitCode}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotate(unit.id);
                        }}
                        className="absolute bottom-1 text-xs bg-zinc-700 text-white px-2 py-1 rounded hover:bg-zinc-600"
                      >
                        ↻
                      </button>
                    </div>
                  </Draggable>
                ))}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 API Service Updates

**File:** `frontend/src/services/businessApi.js`

**Add this method:**
```javascript
export const businessUnitApi = {
  // ... existing methods ...
  
  updatePositions: async (venueId, positions) => {
    const response = await businessApiClient.patch(
      `/business/venues/${venueId}/Units/positions`,
      positions
    );
    return response.data;
  }
};
```

---

## 🎯 Features Priority

### MVP (Must Have - Week 1):
- [x] Drag & drop sunbeds
- [x] Save positions to database
- [x] Load saved positions
- [x] Basic zoom/pan
- [x] Rotation controls

### V2 (Should Have - Week 2):
- [ ] Background image upload
- [ ] Auto-layout (grid arrangement)
- [ ] Zone color overlays
- [ ] Undo/redo

### V3 (Nice to Have - Week 3):
- [ ] Snap to grid
- [ ] Export as image
- [ ] Keyboard shortcuts
- [ ] Copy/paste units
- [ ] Multi-select

---

## 🧪 Testing Checklist

- [ ] Create venue with zones and units
- [ ] Open mapper page
- [ ] Drag sunbeds to different positions
- [ ] Rotate sunbeds
- [ ] Save layout
- [ ] Refresh page - positions should persist
- [ ] Zoom in/out
- [ ] Pan around canvas
- [ ] Upload background image
- [ ] Test with 50+ units (performance)
- [ ] Test on different screen sizes

---

## 📊 Success Metrics

**User Experience:**
- Manager can position 50 sunbeds in < 5 minutes
- Layout matches physical venue 100%
- No training needed (intuitive UI)

**Technical:**
- Smooth drag performance (60fps)
- Save operation < 1 second
- Load time < 2 seconds

**Business:**
- Reduces setup time by 80%
- Eliminates manual coordinate entry
- Enables visual booking for customers

---

## 🚀 Next Steps

### For Prof Kristi (Backend):
1. Add PositionX, PositionY, Rotation fields to ZoneUnit
2. Run SQL migration
3. Update DTOs
4. Add bulk update positions endpoint
5. Test with Postman

### For You (Frontend):
1. Install dependencies
2. Create SunbedMapper component
3. Implement drag & drop
4. Connect to API
5. Test end-to-end

**Estimated Time:**
- Backend: 30-60 minutes
- Frontend: 12-16 hours (1.5-2 days)

---

## 💡 Future Enhancements

- **3D View**: Show sunbeds in 3D perspective
- **Real-time Collaboration**: Multiple managers editing simultaneously
- **Templates**: Save/load layout templates
- **Import from Image**: AI-powered layout detection from photo
- **Mobile App**: Touch-based positioning on tablets
- **Customer View**: Show visual map in booking flow

---

**Ready to start building?** Let's begin with the backend changes!
