
import { ImageUpload } from '../../ImageUpload';

export const CreateVenueModal = ({ 
  isOpen, 
  onClose, 
  venueForm, 
  onFormChange, 
  onSubmit 
}) => (
  <>
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-white mb-6">Create Venue</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Venue Name *
                </label>
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Venue Type *
                </label>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={venueForm.latitude || ''}
                  onChange={(e) => onFormChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="41.3275"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={venueForm.longitude || ''}
                  onChange={(e) => onFormChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="19.8187"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="orderingEnabled"
                checked={venueForm.orderingEnabled}
                onChange={(e) => onFormChange('orderingEnabled', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="orderingEnabled" className="text-sm text-zinc-300">
                Enable Online Ordering
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Digital Ordering Override
              </label>
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
            
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Create Venue
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

export const EditVenueModal = ({ 
  isOpen, 
  onClose, 
  venueForm, 
  onFormChange, 
  onSubmit 
}) => (
  <>
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-white mb-6">Edit Venue</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Venue Name *
                </label>
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Venue Type *
                </label>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={venueForm.latitude || ''}
                  onChange={(e) => onFormChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="41.3275"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={venueForm.longitude || ''}
                  onChange={(e) => onFormChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="19.8187"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editOrderingEnabled"
                checked={venueForm.orderingEnabled}
                onChange={(e) => onFormChange('orderingEnabled', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="editOrderingEnabled" className="text-sm text-zinc-300">
                Enable Online Ordering
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Digital Ordering Override
              </label>
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
            
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Update Venue
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);
