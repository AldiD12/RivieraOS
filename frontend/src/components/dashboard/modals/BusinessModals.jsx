import { motion, AnimatePresence } from 'framer-motion';

export const CreateBusinessModal = ({ 
  isOpen, 
  onClose, 
  businessForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Create New Business</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Registered Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessForm.registeredName}
                  onChange={(e) => onFormChange('registeredName', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter registered business name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={businessForm.brandName}
                  onChange={(e) => onFormChange('brandName', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter brand name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={businessForm.taxId}
                  onChange={(e) => onFormChange('taxId', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter tax ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={businessForm.contactEmail}
                  onChange={(e) => onFormChange('contactEmail', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter contact email"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={businessForm.logoUrl}
                  onChange={(e) => onFormChange('logoUrl', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter logo URL"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={businessForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm text-zinc-300">
                Active Business
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
                Create Business
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const EditBusinessModal = ({ 
  isOpen, 
  onClose, 
  businessForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Edit Business</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Registered Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessForm.registeredName}
                  onChange={(e) => onFormChange('registeredName', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={businessForm.brandName}
                  onChange={(e) => onFormChange('brandName', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={businessForm.taxId}
                  onChange={(e) => onFormChange('taxId', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={businessForm.contactEmail}
                  onChange={(e) => onFormChange('contactEmail', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={businessForm.logoUrl}
                  onChange={(e) => onFormChange('logoUrl', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editBusinessIsActive"
                checked={businessForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="editBusinessIsActive" className="text-sm text-zinc-300">
                Active Business
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
                Update Business
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
