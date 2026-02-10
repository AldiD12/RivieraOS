import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import businessApi from '../services/businessApi';

export default function SunbedMapper() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    fetchData();
  }, [venueId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [venueData, zonesData, unitsData] = await Promise.all([
        businessApi.venues.get(venueId),
        businessApi.zones.list(venueId),
        businessApi.units.list(venueId)
      ]);

      setVenue(venueData);
      setZones(zonesData);
      
      // Load positions from localStorage (temporary until backend is ready)
      const savedPositions = localStorage.getItem(`sunbed-positions-${venueId}`);
      const positions = savedPositions ? JSON.parse(savedPositions) : {};
      
      // Merge units with saved positions
      const unitsWithPositions = unitsData.map(unit => ({
        ...unit,
        positionX: positions[unit.id]?.x || null,
        positionY: positions[unit.id]?.y || null,
        rotation: positions[unit.id]?.rotation || 0
      }));
      
      setUnits(unitsWithPositions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleDrag = (unitId, e, data) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId 
        ? { ...unit, positionX: data.x, positionY: data.y }
        : unit
    ));
  };

  const handleRotate = (unitId) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId 
        ? { ...unit, rotation: ((unit.rotation || 0) + 90) % 360 }
        : unit
    ));
  };

  const handleSave = () => {
    setSaving(true);
    
    // Save to localStorage (temporary until backend is ready)
    const positions = {};
    units.forEach(unit => {
      if (unit.positionX !== null && unit.positionY !== null) {
        positions[unit.id] = {
          x: unit.positionX,
          y: unit.positionY,
          rotation: unit.rotation || 0
        };
      }
    });
    
    localStorage.setItem(`sunbed-positions-${venueId}`, JSON.stringify(positions));
    
    setTimeout(() => {
      setSaving(false);
      alert('Layout saved successfully! (Stored locally until backend is ready)');
    }, 500);
  };

  const handleAutoLayout = () => {
    const gridSize = 140; // Space between units
    const startX = 100;
    const startY = 100;
    const unitsPerRow = 8;

    const updatedUnits = units.map((unit, index) => ({
      ...unit,
      positionX: startX + (index % unitsPerRow) * gridSize,
      positionY: startY + Math.floor(index / unitsPerRow) * gridSize,
      rotation: 0
    }));

    setUnits(updatedUnits);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
        localStorage.setItem(`sunbed-bg-${venueId}`, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPositions = () => {
    if (confirm('Clear all positions? This cannot be undone.')) {
      const clearedUnits = units.map(unit => ({
        ...unit,
        positionX: null,
        positionY: null,
        rotation: 0
      }));
      setUnits(clearedUnits);
      localStorage.removeItem(`sunbed-positions-${venueId}`);
    }
  };

  const getZoneColor = (zoneId) => {
    const colors = [
      'bg-amber-500/20 border-amber-500',
      'bg-blue-500/20 border-blue-500',
      'bg-green-500/20 border-green-500',
      'bg-purple-500/20 border-purple-500',
      'bg-pink-500/20 border-pink-500'
    ];
    const index = zones.findIndex(z => z.id === zoneId);
    return colors[index % colors.length];
  };

  const positionedCount = units.filter(u => u.positionX !== null && u.positionY !== null).length;
  const unpositionedCount = units.length - positionedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading mapper...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-black border-b border-zinc-800 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Sunbed Mapper</h1>
            <p className="text-zinc-400 text-sm">{venue?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
            <div className="text-sm text-zinc-400">
              Positioned: <span className="text-green-400 font-bold">{positionedCount}</span>
            </div>
            <div className="text-sm text-zinc-400">
              Remaining: <span className="text-yellow-400 font-bold">{unpositionedCount}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-zinc-800 border-b border-zinc-700 p-3 flex items-center gap-3 flex-shrink-0 overflow-x-auto">
        <label className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 cursor-pointer transition-colors">
          📷 Upload Background
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="hidden"
          />
        </label>
        
        <div className="flex items-center gap-2 border-l border-zinc-700 pl-3">
          <button 
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="px-3 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
          >
            Zoom -
          </button>
          <span className="text-white text-sm font-mono w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="px-3 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
          >
            Zoom +
          </button>
        </div>

        <button
          onClick={handleAutoLayout}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          ⚡ Auto-Layout
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-4 py-2 rounded transition-colors ${
            showGrid 
              ? 'bg-zinc-600 text-white' 
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          {showGrid ? '✓' : ''} Grid
        </button>

        <button
          onClick={handleClearPositions}
          className="px-4 py-2 bg-red-900 text-red-300 rounded hover:bg-red-800 transition-colors ml-auto"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-800 border-r border-zinc-700 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h3 className="text-white font-bold mb-4">
              Units ({units.length})
            </h3>

            {zones.map(zone => {
              const zoneUnits = units.filter(u => u.venueZoneId === zone.id);
              const zonePositioned = zoneUnits.filter(u => u.positionX !== null).length;
              
              return (
                <div key={zone.id} className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-zinc-300 font-medium text-sm uppercase tracking-wider">
                      {zone.name}
                    </h4>
                    <span className="text-xs text-zinc-500">
                      {zonePositioned}/{zoneUnits.length}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {zoneUnits.map(unit => (
                      <div
                        key={unit.id}
                        className={`p-2 rounded border cursor-pointer transition-all ${
                          selectedUnit?.id === unit.id
                            ? 'bg-blue-900 border-blue-500'
                            : unit.positionX !== null
                            ? 'bg-zinc-700 border-zinc-600 hover:bg-zinc-600'
                            : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                        }`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">
                            {unit.unitCode}
                          </span>
                          {unit.positionX !== null && (
                            <span className="text-green-400 text-xs">✓</span>
                          )}
                        </div>
                        <span className="text-zinc-400 text-xs">
                          {unit.unitType || 'Sunbed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-zinc-900">
          <TransformWrapper
            initialScale={zoom}
            minScale={0.5}
            maxScale={3}
            onZoom={(ref) => setZoom(ref.state.scale)}
            wheel={{ step: 0.05 }}
            doubleClick={{ disabled: true }}
          >
            <TransformComponent>
              <div className="relative w-[2400px] h-[1600px] bg-zinc-800">
                {/* Grid */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'linear-gradient(#525252 1px, transparent 1px), linear-gradient(90deg, #525252 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                    }}
                  />
                )}

                {/* Background Image */}
                {backgroundImage && (
                  <img
                    src={backgroundImage}
                    alt="Venue background"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}

                {/* Instructions */}
                {units.every(u => u.positionX === null) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-zinc-500 max-w-md">
                      <div className="text-6xl mb-4">🏖️</div>
                      <h3 className="text-xl font-bold mb-2">Start Positioning Sunbeds</h3>
                      <p className="text-sm mb-4">
                        Drag sunbed icons from the sidebar onto the canvas, or click "Auto-Layout" for a quick grid arrangement.
                      </p>
                      <button
                        onClick={handleAutoLayout}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ⚡ Auto-Layout Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Sunbeds */}
                {units.map(unit => {
                  if (unit.positionX === null || unit.positionY === null) return null;
                  
                  const zone = zones.find(z => z.id === unit.venueZoneId);
                  const zoneColor = getZoneColor(unit.venueZoneId);
                  
                  return (
                    <Draggable
                      key={unit.id}
                      position={{ x: unit.positionX, y: unit.positionY }}
                      onStop={(e, data) => handleDrag(unit.id, e, data)}
                      bounds="parent"
                    >
                      <div
                        className={`absolute w-24 h-36 rounded-lg flex flex-col items-center justify-center cursor-move transition-all ${
                          selectedUnit?.id === unit.id
                            ? 'border-4 border-blue-500 shadow-2xl z-50'
                            : `border-2 ${zoneColor} shadow-lg hover:shadow-xl z-10`
                        }`}
                        style={{
                          transform: `rotate(${unit.rotation || 0}deg)`,
                          backgroundColor: 'white'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnit(unit);
                        }}
                      >
                        <span className="text-4xl mb-1">🏖️</span>
                        <span className="text-sm font-bold text-zinc-900">
                          {unit.unitCode}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {zone?.name}
                        </span>
                        
                        {/* Rotate Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotate(unit.id);
                          }}
                          className="absolute bottom-1 text-xs bg-zinc-700 text-white px-2 py-1 rounded hover:bg-zinc-600 transition-colors"
                        >
                          ↻ {unit.rotation || 0}°
                        </button>
                      </div>
                    </Draggable>
                  );
                })}
              </div>
            </TransformComponent>
          </TransformWrapper>

          {/* Help Overlay */}
          <div className="absolute bottom-4 right-4 bg-black/80 border border-zinc-700 rounded-lg p-4 text-xs text-zinc-400 max-w-xs">
            <h4 className="text-white font-bold mb-2">Controls:</h4>
            <ul className="space-y-1">
              <li>• <strong>Drag</strong> sunbeds to position</li>
              <li>• <strong>Scroll</strong> to zoom in/out</li>
              <li>• <strong>Click ↻</strong> to rotate sunbed</li>
              <li>• <strong>Click unit</strong> to select</li>
              <li>• <strong>Auto-Layout</strong> for quick grid</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
