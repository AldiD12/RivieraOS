import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import businessApi from '../services/businessApi';

export default function ZoneUnitsManager() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  
  const [zone, setZone] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  
  // Bulk create form
  const [bulkForm, setBulkForm] = useState({
    prefix: '',
    startNumber: 1,
    count: 10,
    unitType: 'Sunbed',
    basePrice: 50
  });

  useEffect(() => {
    fetchZoneAndUnits();
  }, [zoneId]);

  const fetchZoneAndUnits = async () => {
    try {
      setLoading(true);
      
      // Get all venues to find the zone
      const venues = await businessApi.venues.list();
      let foundZone = null;
      let foundVenue = null;
      
      for (const venue of venues) {
        const zones = await businessApi.zones.list(venue.id);
        foundZone = zones.find(z => z.id === parseInt(zoneId));
        if (foundZone) {
          foundVenue = venue;
          break;
        }
      }
      
      if (!foundZone) {
        setError('Zone not found');
        setLoading(false);
        return;
      }
      
      setZone({ ...foundZone, venueName: foundVenue.name, venueId: foundVenue.id });
      
      // Fetch units for this zone
      const allUnits = await businessApi.units.list(foundVenue.id);
      const zoneUnits = allUnits.filter(u => u.venueZoneId === parseInt(zoneId));
      setUnits(zoneUnits);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching zone/units:', err);
      setError('Failed to load zone information');
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const API_BASE = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io';
      const API_URL = `${API_BASE}/api`;
      
      const response = await fetch(
        `${API_URL}/business/venues/${zone.venueId}/Units/bulk`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            venueZoneId: parseInt(zoneId),
            unitType: bulkForm.unitType,
            prefix: bulkForm.prefix,
            startNumber: bulkForm.startNumber,
            count: bulkForm.count,
            basePrice: bulkForm.basePrice
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create units' }));
        throw new Error(errorData.message || 'Failed to create units');
      }

      // Handle empty response (204 No Content)
      let result = { createdCount: bulkForm.count };
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          result = JSON.parse(text);
        }
      }
      
      alert(`✅ Successfully created ${result.createdCount} units!`);
      
      setShowBulkCreate(false);
      setBulkForm({
        prefix: '',
        startNumber: 1,
        count: 10,
        unitType: 'Sunbed',
        basePrice: 50
      });
      
      await fetchZoneAndUnits();
    } catch (err) {
      console.error('Error creating units:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await businessApi.units.delete(zone.venueId, unitId);
      await fetchZoneAndUnits();
    } catch (err) {
      console.error('Error deleting unit:', err);
      alert('Failed to delete unit');
    }
  };

  if (loading && !zone) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Units</h1>
              <p className="text-zinc-400">
                {zone?.venueName} → {zone?.name} ({zone?.zoneType})
              </p>
            </div>
            
            <button
              onClick={() => setShowBulkCreate(true)}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Bulk Create Units
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm mb-1">Total Units</p>
            <p className="text-4xl font-bold">{units.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm mb-1">Available</p>
            <p className="text-4xl font-bold text-green-400">
              {units.filter(u => u.status === 'Available').length}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm mb-1">Occupied</p>
            <p className="text-4xl font-bold text-blue-400">
              {units.filter(u => u.status === 'Occupied').length}
            </p>
          </div>
        </div>

        {/* Units Grid */}
        {units.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-400 mb-4">No units created yet.</p>
            <button
              onClick={() => setShowBulkCreate(true)}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Create Your First Units
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {units.map(unit => (
              <div
                key={unit.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xl font-bold">{unit.unitLabel}</p>
                    <p className="text-xs text-zinc-500">{unit.unitType}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <p className={`text-xs px-2 py-1 rounded inline-block ${
                    unit.status === 'Available' 
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {unit.status}
                  </p>
                  <p className="text-sm text-zinc-400">€{unit.basePrice}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Create Modal */}
        {showBulkCreate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="bg-zinc-900 rounded-lg p-8 max-w-md w-full border border-zinc-800">
              <h2 className="text-2xl font-bold mb-6">Bulk Create Units</h2>
              
              <form onSubmit={handleBulkCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Unit Type</label>
                  <select
                    value={bulkForm.unitType}
                    onChange={(e) => setBulkForm({ ...bulkForm, unitType: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value="Sunbed">Sunbed</option>
                    <option value="Table">Table</option>
                    <option value="Cabana">Cabana</option>
                    <option value="Lounge">Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Prefix (optional)</label>
                  <input
                    type="text"
                    value={bulkForm.prefix}
                    onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })}
                    maxLength="10"
                    placeholder="e.g., A, B, VIP"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Leave empty for numbers only</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Start Number</label>
                    <input
                      type="number"
                      value={bulkForm.startNumber}
                      onChange={(e) => setBulkForm({ ...bulkForm, startNumber: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                    />
                    <p className="text-xs text-zinc-500 mt-1">First unit number</p>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Count</label>
                    <input
                      type="number"
                      value={bulkForm.count}
                      onChange={(e) => setBulkForm({ ...bulkForm, count: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                    />
                    <p className="text-xs text-zinc-500 mt-1">How many units</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Base Price (€)</label>
                  <input
                    type="number"
                    value={bulkForm.basePrice}
                    onChange={(e) => setBulkForm({ ...bulkForm, basePrice: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <p className="text-sm text-zinc-400 mb-2">Preview:</p>
                  <p className="text-white font-mono">
                    {bulkForm.prefix}{bulkForm.startNumber}, {bulkForm.prefix}{bulkForm.startNumber + 1}, {bulkForm.prefix}{bulkForm.startNumber + 2}...
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Will create {bulkForm.count} units ({bulkForm.prefix}{bulkForm.startNumber} to {bulkForm.prefix}{bulkForm.startNumber + bulkForm.count - 1})
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkCreate(false)}
                    className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Units'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
