import { motion, AnimatePresence } from 'framer-motion';

export const CreateCategoryModal = ({ 
  isOpen, 
  onClose, 
  categoryForm, 
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
          className="bg-zinc-900 rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-white mb-6">Create Category</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) => onFormChange('sortOrder', parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                placeholder="0"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="categoryIsActive"
                checked={categoryForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="categoryIsActive" className="text-sm text-zinc-300">
                Active Category
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
                Create Category
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const EditCategoryModal = ({ 
  isOpen, 
  onClose, 
  categoryForm, 
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
          className="bg-zinc-900 rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-white mb-6">Edit Category</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) => onFormChange('sortOrder', parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editCategoryIsActive"
                checked={categoryForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="editCategoryIsActive" className="text-sm text-zinc-300">
                Active Category
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
                Update Category
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
