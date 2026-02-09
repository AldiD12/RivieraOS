# Sunbed/Table Mapping System - Visual Layout Manager

## Overview
A drag-and-drop visual interface for managers to position sunbeds/tables on a venue map, making it easy to match the physical layout.

---

## Architecture: Venue Capacity → Optional Zones

### New Model:
1. **Venue has total capacity** (e.g., 50 sunbeds)
2. **Zones are optional** - used for organization/pricing only
3. **Units (sunbeds/tables) can exist without zones**

### Example:
```
Venue: "Beach Club" (Capacity: 50)
├── Zone: "VIP Section" (10 units) - €100/day
├── Zone: "Regular Beach" (30 units) - €50/day
└── No Zone (10 units) - €30/day (default price)
```

---

## Backend Changes Required

### 1. Update Venue Model
```csharp
public class Venue
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Capacity { get; set; }  // ✅ NEW: Total venue capacity
    public decimal DefaultPrice { get; set; }  // ✅ NEW: Price for units without zone
    // ... existing fields
}
```

### 2. Update ZoneUnit Model
```csharp
public class ZoneUnit
{
    public int Id { get; set; }
    public int VenueId { get; set; }  // ✅ Required
    public int? ZoneId { get; set; }  // ✅ NULLABLE: Can be null if no zone
    public string UnitLabel { get; set; }  // "A1", "B5", "Table-12"
    
    // ✅ NEW: Visual positioning
    public int? PositionX { get; set; }  // X coordinate on map
    public int? PositionY { get; set; }  // Y coordinate on map
    public int? Rotation { get; set; }   // 0, 90, 180, 270 degrees
    
    // Existing fields
    public int CapacityPerUnit { get; set; }
    public string CurrentStatus { get; set; }
    public bool IsActive { get; set; }
}
```

### 3. New Endpoints Needed

#### Bulk Create Units
```
POST /api/business/venues/{venueId}/units/bulk
Body: {
  "count": 50,
  "prefix": "A",
  "startNumber": 1,
  "zoneId": null  // Optional
}
Response: Creates A1, A2, A3... A50
```

#### Update Unit Position
```
PATCH /api/business/venues/{venueId}/units/{unitId}/position
Body: {
  "x": 120,
  "y": 340,
  "rotation": 90
}
```

#### Bulk Update Positions
```
PATCH /api/business/venues/{venueId}/units/positions
Body: [
  { "unitId": 1, "x": 120, "y": 340, "rotation": 0 },
  { "unitId": 2, "x": 180, "y": 340, "rotation": 0 }
]
```

---

## Frontend: Visual Mapping Interface

### Page: `/sunbed-mapper`

#### Features:
1. **Venue Background Image**
   - Upload venue photo/map as background
   - Zoom in/out
   - Pan around

2. **Drag & Drop Sunbeds**
   - Drag sunbed icons onto the map
   - Snap to grid (optional)
   - Rotate sunbeds (0°, 90°, 180°, 270°)
   - Resize icons

3. **Auto-Generate Units**
   - "Generate 50 sunbeds" button
   - Automatically creates A1-A50
   - Places them in a grid layout
   - Manager can then drag to adjust

4. **Zone Assignment**
   - Color-code zones (VIP = gold, Regular = blue)
   - Drag units between zones
   - Bulk select and assign to zone

5. **Unit Labels**
   - Show label on each unit (A1, B5, etc.)
   - Click to edit label
   - Auto-numbering options

6. **Save & Preview**
   - Save positions to database
   - Preview mode: See what customers see
   - Export as image for staff reference

---

## UI Design (Staff-Facing - Industrial Minimalist)

### Layout:
```
┌─────────────────────────────────────────────────────────┐
│ Sunbed Mapper - Beach Club                    [Save]   │
├─────────────────────────────────────────────────────────┤
│ Toolbar:                                                │
│ [Upload BG] [Generate Units] [Zones ▼] [Grid] [Zoom]  │
├──────────────┬──────────────────────────────────────────┤
│ Units Panel  │                                          │
│              │                                          │
│ 🏖️ A1-A10    │         CANVAS AREA                     │
│ 🏖️ B1-B10    │    (Drag & drop sunbeds here)          │
│ 🏖️ C1-C10    │                                          │
│              │    [Background: beach.jpg]               │
│ [+ Add Unit] │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Colors (Industrial Minimalist):
- Background: `bg-zinc-900`
- Canvas: `bg-zinc-800`
- Sunbed icons: `bg-white` with `border-zinc-700`
- Selected: `border-blue-500`
- Zone colors: Subtle overlays

---

## Implementation Phases

### Phase 1: Basic Unit Management (Week 1)
- ✅ Venue capacity field
- ✅ Make zones optional (nullable ZoneId)
- ✅ Bulk create units endpoint
- ✅ Simple list view of units

### Phase 2: Visual Mapper (Week 2)
- Canvas component with zoom/pan
- Drag & drop sunbed icons
- Save positions to database
- Basic grid layout

### Phase 3: Advanced Features (Week 3)
- Background image upload
- Rotation controls
- Zone color-coding
- Bulk operations

### Phase 4: Polish (Week 4)
- Snap to grid
- Undo/redo
- Export layout as image
- Mobile-friendly touch controls

---

## Technology Stack

### Frontend Libraries:
1. **react-dnd** or **@dnd-kit/core** - Drag and drop
2. **react-zoom-pan-pinch** - Canvas zoom/pan
3. **konva** or **fabric.js** - Canvas rendering (optional)

### Simple Approach (Recommended):
- Use CSS transforms for positioning
- Store X/Y coordinates in pixels
- No complex canvas library needed

---

## Example: Simple Drag & Drop Implementation

```jsx
function SunbedMapper() {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleDrag = (unitId, x, y) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId 
        ? { ...unit, positionX: x, positionY: y }
        : unit
    ));
  };

  const handleSave = async () => {
    await businessApi.units.updatePositions(venueId, units);
  };

  return (
    <div className="relative w-full h-screen bg-zinc-900">
      {/* Canvas */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Background Image */}
        <img src={venue.mapImageUrl} className="absolute inset-0 opacity-30" />
        
        {/* Sunbeds */}
        {units.map(unit => (
          <Draggable
            key={unit.id}
            position={{ x: unit.positionX, y: unit.positionY }}
            onDrag={(e, data) => handleDrag(unit.id, data.x, data.y)}
          >
            <div className="absolute w-16 h-24 bg-white border-2 border-zinc-700 rounded flex items-center justify-center cursor-move">
              <span className="text-xs font-bold">{unit.unitLabel}</span>
            </div>
          </Draggable>
        ))}
      </div>
      
      {/* Save Button */}
      <button onClick={handleSave} className="fixed top-4 right-4 px-6 py-3 bg-white text-black">
        Save Layout
      </button>
    </div>
  );
}
```

---

## Benefits

1. **Visual Management**: Managers see exactly where each sunbed is
2. **Easy Updates**: Drag to reposition, no manual coordinate entry
3. **Zone Flexibility**: Zones are optional, not required
4. **Scalable**: Works for 10 or 100+ units
5. **Staff Reference**: Export layout image for staff to know locations

---

## Next Steps

1. **Backend Developer**: Implement venue capacity + optional zones
2. **Frontend**: Build basic unit list view first
3. **Then**: Add visual mapper in Phase 2
4. **Test**: With real venue layout (Beach Club)

---

## Questions to Decide

1. **Unit Icons**: Use emoji 🏖️ or custom SVG icons?
2. **Grid Size**: 10px, 20px, or free positioning?
3. **Background**: Upload image or use Google Maps satellite view?
4. **Mobile**: Build separate mobile mapper or desktop-only?

Let me know your preferences and we can start implementation!
