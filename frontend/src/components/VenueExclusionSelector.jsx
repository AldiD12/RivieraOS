import { useState, useEffect } from 'react';

/**
 * VenueExclusionSelector - Reusable component for managing venue exclusions
 * 
 * Shows a list of venues with checkboxes. Checked = available, Unchecked = excluded.
 * 
 * @param {Array} venues - List of venue objects with {id, name}
 * @param {Array} excludedVenueIds - Array of venue IDs that are excluded
 * @param {Function} onChange - Callback when exclusions change (venueId, isExcluded)
 * @param {Boolean} loading - Show loading state
 */
export default function VenueExclusionSelector({ 
  venues = [], 
  excludedVenueIds = [], 
  onChange,
  loading = false 
}) {
  const [localExcluded, setLocalExcluded] = useState(excludedVenueIds);

  // Update local state when prop changes
  useEffect(() => {
    setLocalExcluded(excludedVenueIds);
  }, [excludedVenueIds]);

  const handleToggle = (venueId) => {
    const isCurrentlyExcluded = localExcluded.includes(venueId);
    const newExcluded = isCurrentlyExcluded
      ? localExcluded.filter(id => id !== venueId)
      : [...localExcluded, venueId];
    
    setLocalExcluded(newExcluded);
    
    if (onChange) {
      onChange(newExcluded);
    }
  };

  const availableCount = venues.length - localExcluded.length;

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          Available at Venues
        </label>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-xs text-zinc-400">Loading venues...</p>
        </div>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          Available at Venues
        </label>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-sm text-zinc-400">No venues found. Create venues first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">
        Available at Venues
      </label>
      
      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>
          📍 Available at {availableCount} of {venues.length} venues
        </span>
        {localExcluded.length === venues.length && (
          <span className="text-red-400">⚠️ Won't appear anywhere!</span>
        )}
      </div>

      {/* Venue List */}
      <div className="bg-zinc-800 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto border border-zinc-700">
        {venues.map(venue => {
          const isExcluded = localExcluded.includes(venue.id);
          const isAvailable = !isExcluded;
          
          return (
            <label 
              key={venue.id} 
              className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                isAvailable 
                  ? 'hover:bg-zinc-700' 
                  : 'hover:bg-zinc-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={() => handleToggle(venue.id)}
                className="rounded border-zinc-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
              />
              <span className={`text-sm flex-1 ${
                isAvailable ? 'text-white' : 'text-zinc-500'
              }`}>
                {venue.name}
              </span>
              {isExcluded && (
                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded">
                  excluded
                </span>
              )}
              {isAvailable && (
                <span className="text-xs text-green-400">
                  ✓
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="text-xs text-zinc-500">
        Uncheck venues where this item should NOT appear. Checked venues will show this item in their menu.
      </p>
    </div>
  );
}
