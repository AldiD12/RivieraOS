
import { useState } from 'react';
import { ImageUpload } from '../../ImageUpload';

function parseGoogleMapsUrl(url) {
  if (!url) return null;
  // @lat,lng,zoom — most common share format
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  // ?q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  // !3d{lat}!4d{lng} — embed / place links
  const embedMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (embedMatch) return { lat: parseFloat(embedMatch[1]), lng: parseFloat(embedMatch[2]) };
  return null;
}

function VenueFormFields({ venueForm, onFormChange }) {
  const [mapsUrl, setMapsUrl] = useState('');
  const [mapsError, setMapsError] = useState('');

  const handleMapsUrl = (url) => {
    setMapsUrl(url);
    setMapsError('');
    if (!url) return;
    const coords = parseGoogleMapsUrl(url);
    if (coords) {
      onFormChange('latitude', coords.lat);
      onFormChange('longitude', coords.lng);
    } else if (url.length > 10) {
      setMapsError('Could not extract coordinates. Try copying the link from Google Maps → Share → Copy link.');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Venue Name *</label>
          <input
            type="text"
            required
            value={venueForm.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
            placeholder="e.g., Beach Club, Pool Bar"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Venue Type *</label>
          <select
            required
            value={venueForm.type}
            onChange={(e) => onFormChange('type', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          >
            <option value="">Select type</option>
            <option value="BEACH">Beach</option>
            <option value="POOL">Pool</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="BAR">Bar</option>
            <option value="CAFE">Cafe</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <ImageUpload
        value={venueForm.imageUrl}
        onChange={(url) => onFormChange('imageUrl', url)}
        label="Venue Image"
      />

      {/* Google Maps URL → auto-extracts coordinates */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Google Maps Link
          <span className="ml-2 text-xs text-zinc-500 font-normal">paste link to set location on map</span>
        </label>
        <input
          type="url"
          value={mapsUrl}
          onChange={(e) => handleMapsUrl(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none placeholder-zinc-600"
          placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/..."
        />
        {mapsError && <p className="text-xs text-red-400 mt-1">{mapsError}</p>}
        {venueForm.latitude && venueForm.longitude && (
          <p className="text-xs text-[#10FF88] mt-1">
            ✓ Coordinates set: {venueForm.latitude.toFixed(5)}, {venueForm.longitude.toFixed(5)}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="orderingEnabled"
          checked={venueForm.orderingEnabled}
          onChange={(e) => onFormChange('orderingEnabled', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="orderingEnabled" className="text-sm text-zinc-300">Enable Online Ordering</label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Digital Ordering Override</label>
        <select
          value={venueForm.isDigitalOrderingEnabled === null ? 'auto' : venueForm.isDigitalOrderingEnabled.toString()}
          onChange={(e) => {
            const value = e.target.value;
            onFormChange('isDigitalOrderingEnabled', value === 'auto' ? null : value === 'true');
          }}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
        >
          <option value="auto">Auto (Restaurant=No, Beach/Pool/Bar=Yes)</option>
          <option value="true">Force Enable</option>
          <option value="false">Force Disable</option>
        </select>
        <p className="text-xs text-zinc-500">
          Controls whether customers can order from menu. Auto-detection: Restaurant venues default to view-only menu, Beach/Pool/Bar venues allow ordering.
        </p>
      </div>
    </>
  );
}

export const CreateVenueModal = ({ isOpen, onClose, venueForm, onFormChange, onSubmit }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-white mb-6">Create Venue</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <VenueFormFields venueForm={venueForm} onFormChange={onFormChange} />
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Create Venue
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

export const EditVenueModal = ({ isOpen, onClose, venueForm, onFormChange, onSubmit }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-white mb-6">Edit Venue</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <VenueFormFields venueForm={venueForm} onFormChange={onFormChange} />
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Update Venue
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);
