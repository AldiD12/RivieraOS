import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from '../../ImageUpload';

export const CreateVenueModal = ({ 
  isOpen, 
  onClose, 
  venueForm, 
  onFormChange, 
  onSubmit 
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
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
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={venueForm.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                rows="3"
                placeholder="Enter venue description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={venueForm.address}
                onChange={(e) => onFormChange('address', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                placeholder="Enter address"
              />
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
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const EditVenueModal = ({ 
  isOpen, 
  onClose, 
  venueForm, 
  onFormChange, 
  onSubmit 
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
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
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={venueForm.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                rows="3"
                placeholder="Enter venue description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={venueForm.address}
                onChange={(e) => onFormChange('address', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                placeholder="Enter address"
              />
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
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
