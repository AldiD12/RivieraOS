import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { businessApi, staffApi, venueApi, zoneApi, categoryApi, productApi } from '../services/superAdminApi.js';

// Staff Modal Components - Defined OUTSIDE to prevent re-creation on every render
const CreateStaffModal = ({ 
  isOpen, 
  onClose, 
  staffForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Add Staff Member</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={staffForm.fullName}
                  onChange={(e) => onFormChange('fullName', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={staffForm.password}
                  onChange={(e) => onFormChange('password', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={staffForm.phoneNumber}
                  onChange={(e) => onFormChange('phoneNumber', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={staffForm.role}
                  onChange={(e) => onFormChange('role', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select role</option>
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Collector">Collector</option>
                </select>
              </div>
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
                Add Staff Member
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const EditStaffModal = ({ 
  isOpen, 
  onClose, 
  staffForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Edit Staff Member</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={staffForm.fullName}
                  onChange={(e) => onFormChange('fullName', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={staffForm.phoneNumber}
                  onChange={(e) => onFormChange('phoneNumber', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={staffForm.role}
                  onChange={(e) => onFormChange('role', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select role</option>
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Collector">Collector</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editStaffIsActive"
                checked={staffForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="editStaffIsActive" className="text-sm text-zinc-300">
                Active Staff Member
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
                Update Staff Member
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ResetPasswordModal = ({ 
  isOpen, 
  onClose, 
  staffMember,
  newPassword,
  onPasswordChange,
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
          <h2 className="text-xl font-bold text-white mb-6">Reset Password</h2>
          
          <div className="mb-4">
            <p className="text-zinc-300 text-sm">
              Reset password for: <strong>{staffMember?.fullName || staffMember?.email}</strong>
            </p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength="6"
                value={newPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                placeholder="Enter new password (min 6 characters)"
              />
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Category Modal Components
const CreateCategoryModal = ({ 
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

const EditCategoryModal = ({ 
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

// Product Modal Components
const CreateProductModal = ({ 
  isOpen, 
  onClose, 
  productForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Create Product</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={productForm.price}
                  onChange={(e) => onFormChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Old Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.oldPrice || ''}
                  onChange={(e) => onFormChange('oldPrice', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => onFormChange('imageUrl', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                rows="3"
                placeholder="Enter product description"
              />
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="productIsAvailable"
                  checked={productForm.isAvailable}
                  onChange={(e) => onFormChange('isAvailable', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="productIsAvailable" className="text-sm text-zinc-300">
                  Available
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="productIsAlcohol"
                  checked={productForm.isAlcohol}
                  onChange={(e) => onFormChange('isAlcohol', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="productIsAlcohol" className="text-sm text-zinc-300">
                  Contains Alcohol
                </label>
              </div>
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
                Create Product
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const EditProductModal = ({ 
  isOpen, 
  onClose, 
  productForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Edit Product</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={productForm.price}
                  onChange={(e) => onFormChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Old Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.oldPrice || ''}
                  onChange={(e) => onFormChange('oldPrice', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => onFormChange('imageUrl', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                rows="3"
              />
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editProductIsAvailable"
                  checked={productForm.isAvailable}
                  onChange={(e) => onFormChange('isAvailable', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="editProductIsAvailable" className="text-sm text-zinc-300">
                  Available
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editProductIsAlcohol"
                  checked={productForm.isAlcohol}
                  onChange={(e) => onFormChange('isAlcohol', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="editProductIsAlcohol" className="text-sm text-zinc-300">
                  Contains Alcohol
                </label>
              </div>
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
                Update Product
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Venue Modal Components - Defined OUTSIDE to prevent re-creation on every render
const CreateVenueModal = ({ 
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
                  placeholder="Enter venue name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Venue Type
                </label>
                <select
                  value={venueForm.type}
                  onChange={(e) => onFormChange('type', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select type</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Bar">Bar</option>
                  <option value="Beach">Beach</option>
                  <option value="Pool">Pool</option>
                  <option value="Spa">Spa</option>
                  <option value="Event">Event Space</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={venueForm.location}
                  onChange={(e) => onFormChange('location', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={venueForm.capacity}
                  onChange={(e) => onFormChange('capacity', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="0"
                />
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
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="venueIsActive"
                checked={venueForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="venueIsActive" className="text-sm text-zinc-300">
                Active Venue
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

const EditVenueModal = ({ 
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Venue Type
                </label>
                <select
                  value={venueForm.type}
                  onChange={(e) => onFormChange('type', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select type</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Bar">Bar</option>
                  <option value="Beach">Beach</option>
                  <option value="Pool">Pool</option>
                  <option value="Spa">Spa</option>
                  <option value="Event">Event Space</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={venueForm.location}
                  onChange={(e) => onFormChange('location', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={venueForm.capacity}
                  onChange={(e) => onFormChange('capacity', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
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
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editVenueIsActive"
                checked={venueForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="editVenueIsActive" className="text-sm text-zinc-300">
                Active Venue
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

// Zone Modal Components
const CreateZoneModal = ({ 
  isOpen, 
  onClose, 
  zoneForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Create Zone</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  value={zoneForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter zone name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Zone Type
                </label>
                <select
                  value={zoneForm.type}
                  onChange={(e) => onFormChange('type', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select type</option>
                  <option value="Dining">Dining Area</option>
                  <option value="Seating">Seating Area</option>
                  <option value="Sunbed">Sunbed Area</option>
                  <option value="Bar">Bar Area</option>
                  <option value="VIP">VIP Section</option>
                  <option value="Service">Service Area</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={zoneForm.capacity}
                  onChange={(e) => onFormChange('capacity', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={zoneForm.sortOrder}
                  onChange={(e) => onFormChange('sortOrder', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={zoneForm.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                rows="3"
                placeholder="Enter zone description"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="zoneIsActive"
                checked={zoneForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="zoneIsActive" className="text-sm text-zinc-300">
                Active Zone
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
                Create Zone
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const EditZoneModal = ({ 
  isOpen, 
  onClose, 
  zoneForm, 
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
          <h2 className="text-xl font-bold text-white mb-6">Edit Zone</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  value={zoneForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Zone Type
                </label>
                <select
                  value={zoneForm.type}
                  onChange={(e) => onFormChange('type', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select type</option>
                  <option value="Dining">Dining Area</option>
                  <option value="Seating">Seating Area</option>
                  <option value="Sunbed">Sunbed Area</option>
                  <option value="Bar">Bar Area</option>
                  <option value="VIP">VIP Section</option>
                  <option value="Service">Service Area</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={zoneForm.capacity}
                  onChange={(e) => onFormChange('capacity', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={zoneForm.sortOrder}
                  onChange={(e) => onFormChange('sortOrder', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={zoneForm.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                rows="3"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editZoneIsActive"
                checked={zoneForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="editZoneIsActive" className="text-sm text-zinc-300">
                Active Zone
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
                Update Zone
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Business Modal Components - Defined OUTSIDE to prevent re-creation on every render
const CreateBusinessModal = ({ 
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

const EditBusinessModal = ({ 
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
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsActive"
                checked={businessForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="editIsActive" className="text-sm text-zinc-300">
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

// Super Admin Dashboard - Complete Business Management System
export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('businesses');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  // Business Modal states
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  // Staff Modal states
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Menu Management Modal states
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Venues & Zones Modal states
  const [showCreateVenueModal, setShowCreateVenueModal] = useState(false);
  const [showEditVenueModal, setShowEditVenueModal] = useState(false);
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  
  // Menu Management Data states
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  // Venues & Zones Data states
  const [venuesForManagement, setVenuesForManagement] = useState([]);
  const [selectedVenueForManagement, setSelectedVenueForManagement] = useState(null);
  const [zones, setZones] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);

  // Business Form states
  const [businessForm, setBusinessForm] = useState({
    registeredName: '',
    brandName: '',
    taxId: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    description: '',
    logoUrl: '',
    isActive: true
  });

  // Staff Form states
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: '',
    isActive: true
  });

  // Category Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sortOrder: 0,
    isActive: true
  });

  // Product Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    oldPrice: null,
    isAvailable: true,
    isAlcohol: false,
    categoryId: null
  });

  // Venue Form states
  const [venueForm, setVenueForm] = useState({
    name: '',
    type: '',
    location: '',
    description: '',
    capacity: 0,
    isActive: true
  });

  // Zone Form states
  const [zoneForm, setZoneForm] = useState({
    name: '',
    type: '',
    description: '',
    capacity: 0,
    sortOrder: 0,
    isActive: true
  });

  // Check user role and permissions
  useEffect(() => {
    const checkUserRole = () => {
      const role = localStorage.getItem('role');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
      
      console.log('🔐 Checking SuperAdmin authentication...');
      console.log('Role:', role);
      console.log('User:', userName);
      console.log('Email:', userEmail);
      console.log('Token present:', !!token);
      
      // Check if user has valid authentication
      if (!token) {
        console.log('❌ No authentication token - redirecting to login');
        localStorage.clear();
        window.location.href = '/superadmin/login';
        return;
      }
      
      if (role !== 'SuperAdmin') {
        console.log('❌ Access denied - not SuperAdmin role');
        localStorage.clear();
        window.location.href = '/superadmin/login';
        return;
      }
      
      setUserInfo({
        role,
        name: userName || 'Super Administrator',
        email: userEmail || 'superadmin@rivieraos.com'
      });
      
      console.log('✅ SuperAdmin authentication verified');
    };
    
    checkUserRole();
  }, []);

  // Fetch businesses when user is authenticated
  useEffect(() => {
    if (userInfo) {
      fetchBusinesses();
    }
  }, [userInfo]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching businesses with authenticated API call...');
      
      // Check if we have a valid token
      const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
      if (!token) {
        console.log('❌ No authentication token found');
        setError('Authentication required. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
        return;
      }
      
      console.log('🔐 Using token for API call:', token.substring(0, 20) + '...');
      
      // Try SuperAdmin endpoint first, fallback to regular endpoint
      let data;
      try {
        console.log('🔄 Trying SuperAdmin endpoint: /api/superadmin/Businesses');
        data = await businessApi.superAdmin.getAll();
        console.log('✅ SuperAdmin businesses fetched successfully:', Array.isArray(data) ? data.length : 'paginated response');
        console.log('📊 Response structure:', {
          type: typeof data,
          isArray: Array.isArray(data),
          hasItems: data?.items ? `Array(${data.items.length})` : 'No',
          hasPagination: data?.totalCount ? `${data.totalCount} total` : 'No',
          data: data
        });
      } catch (superAdminError) {
        console.log('⚠️ SuperAdmin endpoint failed:', {
          status: superAdminError.response?.status,
          statusText: superAdminError.response?.statusText,
          data: superAdminError.response?.data,
          url: superAdminError.config?.url
        });
        
        // If it's a 401, redirect to login
        if (superAdminError.response?.status === 401) {
          console.log('❌ Authentication failed - redirecting to login');
          setError('Session expired. Please login again.');
          localStorage.clear();
          window.location.href = '/superadmin/login';
          return;
        }
        
        // If it's 403, try regular endpoint as fallback
        if (superAdminError.response?.status === 403) {
          console.log('⚠️ SuperAdmin access forbidden, trying regular endpoint as fallback');
          try {
            console.log('🔄 Trying regular endpoint: /api/Businesses');
            data = await businessApi.getAll();
            console.log('✅ Regular businesses fetched successfully:', data.length, 'businesses');
            console.log('⚠️ Note: Using regular endpoint - some SuperAdmin features may be limited');
          } catch (regularError) {
            console.log('❌ Regular endpoint also failed:', {
              status: regularError.response?.status,
              statusText: regularError.response?.statusText,
              data: regularError.response?.data
            });
            
            if (regularError.response?.status === 401) {
              console.log('❌ Authentication failed on regular endpoint too');
              setError('Session expired. Please login again.');
              localStorage.clear();
              window.location.href = '/superadmin/login';
              return;
            }
            throw regularError;
          }
        } else {
          throw superAdminError;
        }
      }
      
      // Ensure data is an array - handle paginated responses
      let businessesArray;
      if (Array.isArray(data)) {
        // Direct array response
        businessesArray = data;
      } else if (data && Array.isArray(data.items)) {
        // Paginated response with items array
        businessesArray = data.items;
        console.log('📊 Paginated response detected:', {
          totalCount: data.totalCount,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          itemsCount: data.items.length
        });
      } else if (data && Array.isArray(data.businesses)) {
        // Alternative format with businesses array
        businessesArray = data.businesses;
      } else if (data && Array.isArray(data.data)) {
        // Alternative format with data array
        businessesArray = data.data;
      } else {
        // Fallback to empty array
        console.log('⚠️ Unexpected response format, using empty array:', data);
        businessesArray = [];
      }
      setBusinesses(businessesArray);
      setError('');
      console.log('✅ Businesses loaded successfully:', businessesArray.length, 'businesses');
    } catch (err) {
      console.error('❌ Error fetching businesses:', err);
      
      if (err.response?.status === 401) {
        console.log('❌ Token expired or invalid');
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else if (err.response?.status === 403) {
        setError('Access forbidden. SuperAdmin privileges required.');
      } else {
        setError('Error connecting to API: ' + (err.response?.data?.message || err.message || 'Unknown error'));
        console.error('API Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessDetails = async (businessId) => {
    try {
      console.log('🔄 Fetching business details for ID:', businessId);
      
      let data;
      try {
        data = await businessApi.superAdmin.getById(businessId);
        console.log('✅ SuperAdmin business details fetched');
      } catch (superAdminError) {
        console.log('⚠️ SuperAdmin endpoint not available, using regular endpoint');
        data = await businessApi.getById(businessId);
        console.log('✅ Regular business details fetched');
      }
      
      setSelectedBusiness(data);
      
      // Also fetch staff for this business
      await fetchStaffMembers(businessId);
    } catch (err) {
      console.error('Error fetching business details:', err);
      setError('Failed to fetch business details');
    }
  };

  // Staff Management Functions
  const fetchStaffMembers = async (businessId) => {
    try {
      setStaffLoading(true);
      console.log('🔄 Fetching staff members for business:', businessId);
      
      const staffData = await staffApi.getByBusiness(businessId);
      console.log('✅ Staff members fetched:', staffData.length, 'members');
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching staff members:', err);
      
      if (err.response?.status === 403) {
        console.log('⚠️ SuperAdmin staff endpoint requires proper role claims');
        setError('Staff management requires SuperAdmin privileges. Using business data as fallback.');
        // Use staff data from business object if available
        if (selectedBusiness?.users) {
          setStaffMembers(selectedBusiness.users);
        }
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch staff members: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setStaffLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    
    try {
      console.log('🔄 Creating new staff member:', staffForm);
      
      await staffApi.create(selectedBusiness.id, staffForm);
      console.log('✅ Staff member created successfully');
      
      setShowCreateStaffModal(false);
      resetStaffForm();
      await fetchStaffMembers(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('❌ Error creating staff member:', err);
      
      if (err.response?.status === 403) {
        setError('Staff creation requires SuperAdmin privileges. Please contact system administrator.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to create staff member: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !editingStaff) return;
    
    try {
      console.log('🔄 Updating staff member:', editingStaff.id);
      
      await staffApi.update(selectedBusiness.id, editingStaff.id, staffForm);
      console.log('✅ Staff member updated successfully');
      
      setShowEditStaffModal(false);
      setEditingStaff(null);
      resetStaffForm();
      await fetchStaffMembers(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('❌ Error updating staff member:', err);
      
      if (err.response?.status === 403) {
        setError('Staff update requires SuperAdmin privileges. Please contact system administrator.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to update staff member: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!selectedBusiness) return;
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;
    
    try {
      console.log('🔄 Deleting staff member:', staffId);
      
      await staffApi.delete(selectedBusiness.id, staffId);
      console.log('✅ Staff member deleted successfully');
      
      await fetchStaffMembers(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('❌ Error deleting staff member:', err);
      
      if (err.response?.status === 403) {
        setError('Staff deletion requires SuperAdmin privileges. Please contact system administrator.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to delete staff member: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !editingStaff || !newPassword) return;
    
    try {
      console.log('🔄 Resetting password for staff member:', editingStaff.id);
      
      await staffApi.resetPassword(selectedBusiness.id, editingStaff.id, newPassword);
      console.log('✅ Password reset successfully');
      
      setShowResetPasswordModal(false);
      setEditingStaff(null);
      setNewPassword('');
      setError('');
      alert('Password reset successfully!');
    } catch (err) {
      console.error('❌ Error resetting password:', err);
      
      if (err.response?.status === 403) {
        setError('Password reset requires SuperAdmin privileges. Please contact system administrator.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to reset password: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleToggleStaffActivation = async (staffId) => {
    if (!selectedBusiness) return;
    
    try {
      console.log('🔄 Toggling staff activation:', staffId);
      
      await staffApi.toggleActivation(selectedBusiness.id, staffId);
      console.log('✅ Staff activation toggled successfully');
      
      await fetchStaffMembers(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('❌ Error toggling staff activation:', err);
      
      if (err.response?.status === 403) {
        setError('Staff activation toggle requires SuperAdmin privileges. Please contact system administrator.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to toggle staff activation: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Menu Management Functions
  const fetchVenues = async (businessId) => {
    try {
      setMenuLoading(true);
      console.log('🔄 Fetching venues for business:', businessId);
      
      const venueData = await venueApi.getByBusiness(businessId);
      console.log('✅ Venues fetched:', venueData.length, 'venues');
      setVenues(Array.isArray(venueData) ? venueData : []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching venues:', err);
      
      if (err.response?.status === 403) {
        setError('Venue management requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch venues: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setMenuLoading(false);
    }
  };

  const fetchCategories = async (venueId) => {
    try {
      setMenuLoading(true);
      console.log('🔄 Fetching categories for venue:', venueId);
      
      const categoryData = await categoryApi.getByVenue(venueId);
      console.log('✅ Categories fetched:', categoryData.length, 'categories');
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      
      if (err.response?.status === 403) {
        setError('Category management requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch categories: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setMenuLoading(false);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      setMenuLoading(true);
      console.log('🔄 Fetching products for category:', categoryId);
      
      const productData = await productApi.getByCategory(categoryId);
      console.log('✅ Products fetched:', productData.length, 'products');
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      
      if (err.response?.status === 403) {
        setError('Product management requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch products: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setMenuLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;
    
    try {
      console.log('🔄 Creating new category:', categoryForm);
      
      await categoryApi.create(selectedVenue.id, categoryForm);
      console.log('✅ Category created successfully');
      
      setShowCreateCategoryModal(false);
      resetCategoryForm();
      await fetchCategories(selectedVenue.id);
      setError('');
    } catch (err) {
      console.error('❌ Error creating category:', err);
      
      if (err.response?.status === 403) {
        setError('Category creation requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to create category: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!selectedVenue || !editingCategory) return;
    
    try {
      console.log('🔄 Updating category:', editingCategory.id);
      
      await categoryApi.update(selectedVenue.id, editingCategory.id, categoryForm);
      console.log('✅ Category updated successfully');
      
      setShowEditCategoryModal(false);
      setEditingCategory(null);
      resetCategoryForm();
      await fetchCategories(selectedVenue.id);
      setError('');
    } catch (err) {
      console.error('❌ Error updating category:', err);
      
      if (err.response?.status === 403) {
        setError('Category update requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to update category: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!selectedVenue) return;
    if (!confirm('Are you sure you want to delete this category? This will also delete all products in this category.')) return;
    
    try {
      console.log('🔄 Deleting category:', categoryId);
      
      await categoryApi.delete(selectedVenue.id, categoryId);
      console.log('✅ Category deleted successfully');
      
      await fetchCategories(selectedVenue.id);
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setProducts([]);
      }
      setError('');
    } catch (err) {
      console.error('❌ Error deleting category:', err);
      
      if (err.response?.status === 403) {
        setError('Category deletion requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to delete category: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    try {
      console.log('🔄 Creating new product:', productForm);
      
      await productApi.create(selectedCategory.id, productForm);
      console.log('✅ Product created successfully');
      
      setShowCreateProductModal(false);
      resetProductForm();
      await fetchProducts(selectedCategory.id);
      setError('');
    } catch (err) {
      console.error('❌ Error creating product:', err);
      
      if (err.response?.status === 403) {
        setError('Product creation requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to create product: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !editingProduct) return;
    
    try {
      console.log('🔄 Updating product:', editingProduct.id);
      
      await productApi.update(selectedCategory.id, editingProduct.id, productForm);
      console.log('✅ Product updated successfully');
      
      setShowEditProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      await fetchProducts(selectedCategory.id);
      setError('');
    } catch (err) {
      console.error('❌ Error updating product:', err);
      
      if (err.response?.status === 403) {
        setError('Product update requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to update product: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!selectedCategory) return;
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      console.log('🔄 Deleting product:', productId);
      
      await productApi.delete(selectedCategory.id, productId);
      console.log('✅ Product deleted successfully');
      
      await fetchProducts(selectedCategory.id);
      setError('');
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      
      if (err.response?.status === 403) {
        setError('Product deletion requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to delete product: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Venues & Zones Management Functions
  const fetchVenuesForManagement = async (businessId) => {
    try {
      setVenuesLoading(true);
      console.log('🔄 Fetching venues for management for business:', businessId);
      
      const venueData = await venueApi.getByBusiness(businessId);
      console.log('✅ Venues for management fetched:', venueData.length, 'venues');
      setVenuesForManagement(Array.isArray(venueData) ? venueData : []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching venues for management:', err);
      
      if (err.response?.status === 403) {
        setError('Venue management requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch venues: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setVenuesLoading(false);
    }
  };

  const fetchZones = async (venueId) => {
    try {
      setVenuesLoading(true);
      console.log('🔄 Fetching zones for venue:', venueId);
      
      const zoneData = await zoneApi.getByVenue(venueId);
      console.log('✅ Zones fetched:', zoneData.length, 'zones');
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching zones:', err);
      
      if (err.response?.status === 403) {
        setError('Zone management requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch zones: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setVenuesLoading(false);
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    
    try {
      console.log('🔄 Creating new venue:', venueForm);
      
      await venueApi.create(selectedBusiness.id, venueForm);
      console.log('✅ Venue created successfully');
      
      setShowCreateVenueModal(false);
      resetVenueForm();
      await fetchVenuesForManagement(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('❌ Error creating venue:', err);
      
      if (err.response?.status === 403) {
        setError('Venue creation requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to create venue: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !editingVenue) return;
    
    try {
      console.log('🔄 Updating venue:', editingVenue.id);
      
      await venueApi.update(selectedBusiness.id, editingVenue.id, venueForm);
      console.log('✅ Venue updated successfully');
      
      setShowEditVenueModal(false);
      setEditingVenue(null);
      resetVenueForm();
      await fetchVenuesForManagement(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('❌ Error updating venue:', err);
      
      if (err.response?.status === 403) {
        setError('Venue update requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to update venue: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!selectedBusiness) return;
    if (!confirm('Are you sure you want to delete this venue? This will also delete all zones in this venue.')) return;
    
    try {
      console.log('🔄 Deleting venue:', venueId);
      
      await venueApi.delete(selectedBusiness.id, venueId);
      console.log('✅ Venue deleted successfully');
      
      await fetchVenuesForManagement(selectedBusiness.id);
      if (selectedVenueForManagement?.id === venueId) {
        setSelectedVenueForManagement(null);
        setZones([]);
      }
      setError('');
    } catch (err) {
      console.error('❌ Error deleting venue:', err);
      
      if (err.response?.status === 403) {
        setError('Venue deletion requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to delete venue: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!selectedVenueForManagement) return;
    
    try {
      console.log('🔄 Creating new zone:', zoneForm);
      
      await zoneApi.create(selectedVenueForManagement.id, zoneForm);
      console.log('✅ Zone created successfully');
      
      setShowCreateZoneModal(false);
      resetZoneForm();
      await fetchZones(selectedVenueForManagement.id);
      setError('');
    } catch (err) {
      console.error('❌ Error creating zone:', err);
      
      if (err.response?.status === 403) {
        setError('Zone creation requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to create zone: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUpdateZone = async (e) => {
    e.preventDefault();
    if (!selectedVenueForManagement || !editingZone) return;
    
    try {
      console.log('🔄 Updating zone:', editingZone.id);
      
      await zoneApi.update(selectedVenueForManagement.id, editingZone.id, zoneForm);
      console.log('✅ Zone updated successfully');
      
      setShowEditZoneModal(false);
      setEditingZone(null);
      resetZoneForm();
      await fetchZones(selectedVenueForManagement.id);
      setError('');
    } catch (err) {
      console.error('❌ Error updating zone:', err);
      
      if (err.response?.status === 403) {
        setError('Zone update requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to update zone: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!selectedVenueForManagement) return;
    if (!confirm('Are you sure you want to delete this zone? This action cannot be undone.')) return;
    
    try {
      console.log('🔄 Deleting zone:', zoneId);
      
      await zoneApi.delete(selectedVenueForManagement.id, zoneId);
      console.log('✅ Zone deleted successfully');
      
      await fetchZones(selectedVenueForManagement.id);
      setError('');
    } catch (err) {
      console.error('❌ Error deleting zone:', err);
      
      if (err.response?.status === 403) {
        setError('Zone deletion requires SuperAdmin privileges.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to delete zone: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Business CRUD operations
  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Creating new business:', businessForm);
      
      try {
        await businessApi.superAdmin.create(businessForm);
        console.log('✅ Business created via SuperAdmin API');
      } catch (superAdminError) {
        console.log('⚠️ SuperAdmin endpoint not available, using regular endpoint');
        await businessApi.create(businessForm);
        console.log('✅ Business created via regular API');
      }
      
      setShowCreateBusinessModal(false);
      resetBusinessForm();
      fetchBusinesses();
      setError('');
    } catch (err) {
      console.error('Error creating business:', err);
      setError('Failed to create business: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateBusiness = async (e) => {
    e.preventDefault();
    if (!editingBusiness) return;
    
    try {
      console.log('🔄 Updating business:', editingBusiness.id);
      
      // Try SuperAdmin endpoint first
      try {
        await businessApi.superAdmin.update(editingBusiness.id, businessForm);
        console.log('✅ Business updated via SuperAdmin API');
      } catch (superAdminError) {
        console.log('⚠️ SuperAdmin update failed:', {
          status: superAdminError.response?.status,
          statusText: superAdminError.response?.statusText,
          data: superAdminError.response?.data
        });
        
        // If it's 403, show specific error about SuperAdmin access
        if (superAdminError.response?.status === 403) {
          setError('Update operation requires SuperAdmin privileges. This feature is currently limited due to JWT role claims configuration.');
          return;
        }
        
        // If it's 401, redirect to login
        if (superAdminError.response?.status === 401) {
          console.log('❌ Authentication failed - redirecting to login');
          setError('Session expired. Please login again.');
          localStorage.clear();
          window.location.href = '/superadmin/login';
          return;
        }
        
        // For other errors, rethrow
        throw superAdminError;
      }
      
      setShowEditBusinessModal(false);
      setEditingBusiness(null);
      resetBusinessForm();
      fetchBusinesses();
      if (selectedBusiness?.id === editingBusiness.id) {
        fetchBusinessDetails(editingBusiness.id);
      }
      setError('');
    } catch (err) {
      console.error('Error updating business:', err);
      
      if (err.response?.status === 403) {
        setError('Update operation requires SuperAdmin privileges. Please contact system administrator to enable proper role claims in JWT tokens.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to update business: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) return;
    
    try {
      console.log('🔄 Deleting business:', businessId);
      
      // Try SuperAdmin endpoint first
      try {
        await businessApi.superAdmin.delete(businessId);
        console.log('✅ Business deleted via SuperAdmin API');
      } catch (superAdminError) {
        console.log('⚠️ SuperAdmin delete failed:', {
          status: superAdminError.response?.status,
          statusText: superAdminError.response?.statusText,
          data: superAdminError.response?.data
        });
        
        // If it's 403, show specific error about SuperAdmin access
        if (superAdminError.response?.status === 403) {
          setError('Delete operation requires SuperAdmin privileges. This feature is currently limited due to JWT role claims configuration.');
          return;
        }
        
        // If it's 401, redirect to login
        if (superAdminError.response?.status === 401) {
          console.log('❌ Authentication failed - redirecting to login');
          setError('Session expired. Please login again.');
          localStorage.clear();
          window.location.href = '/superadmin/login';
          return;
        }
        
        // For other errors, try regular endpoint (though delete might not be available)
        throw superAdminError;
      }
      
      fetchBusinesses();
      if (selectedBusiness?.id === businessId) {
        setSelectedBusiness(null);
        setActiveTab('businesses');
      }
      setError('');
    } catch (err) {
      console.error('Error deleting business:', err);
      
      if (err.response?.status === 403) {
        setError('Delete operation requires SuperAdmin privileges. Please contact system administrator to enable proper role claims in JWT tokens.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to delete business: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetBusinessForm = useCallback(() => {
    setBusinessForm({
      registeredName: '',
      brandName: '',
      taxId: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      description: '',
      logoUrl: '',
      isActive: true
    });
  }, []);

  const resetStaffForm = useCallback(() => {
    setStaffForm({
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      role: '',
      isActive: true
    });
  }, []);

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({
      name: '',
      sortOrder: 0,
      isActive: true
    });
  }, []);

  const resetProductForm = useCallback(() => {
    setProductForm({
      name: '',
      description: '',
      imageUrl: '',
      price: 0,
      oldPrice: null,
      isAvailable: true,
      isAlcohol: false,
      categoryId: null
    });
  }, []);

  const resetVenueForm = useCallback(() => {
    setVenueForm({
      name: '',
      type: '',
      location: '',
      description: '',
      capacity: 0,
      isActive: true
    });
  }, []);

  const resetZoneForm = useCallback(() => {
    setZoneForm({
      name: '',
      type: '',
      description: '',
      capacity: 0,
      sortOrder: 0,
      isActive: true
    });
  }, []);

  // Form handlers with useCallback to prevent re-renders
  const handleBusinessFormChange = useCallback((field, value) => {
    setBusinessForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleStaffFormChange = useCallback((field, value) => {
    setStaffForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCategoryFormChange = useCallback((field, value) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleProductFormChange = useCallback((field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleVenueFormChange = useCallback((field, value) => {
    setVenueForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleZoneFormChange = useCallback((field, value) => {
    setZoneForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Business Modal handlers
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateBusinessModal(false);
    resetBusinessForm();
  }, [resetBusinessForm]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditBusinessModal(false);
    setEditingBusiness(null);
    resetBusinessForm();
  }, [resetBusinessForm]);

  // Staff Modal handlers
  const handleCloseCreateStaffModal = useCallback(() => {
    setShowCreateStaffModal(false);
    resetStaffForm();
  }, [resetStaffForm]);

  const handleCloseEditStaffModal = useCallback(() => {
    setShowEditStaffModal(false);
    setEditingStaff(null);
    resetStaffForm();
  }, [resetStaffForm]);

  const handleCloseResetPasswordModal = useCallback(() => {
    setShowResetPasswordModal(false);
    setEditingStaff(null);
    setNewPassword('');
  }, []);

  // Menu Modal handlers
  const handleCloseCreateCategoryModal = useCallback(() => {
    setShowCreateCategoryModal(false);
    resetCategoryForm();
  }, [resetCategoryForm]);

  const handleCloseEditCategoryModal = useCallback(() => {
    setShowEditCategoryModal(false);
    setEditingCategory(null);
    resetCategoryForm();
  }, [resetCategoryForm]);

  const handleCloseCreateProductModal = useCallback(() => {
    setShowCreateProductModal(false);
    resetProductForm();
  }, [resetProductForm]);

  const handleCloseEditProductModal = useCallback(() => {
    setShowEditProductModal(false);
    setEditingProduct(null);
    resetProductForm();
  }, [resetProductForm]);

  // Venue Modal handlers
  const handleCloseCreateVenueModal = useCallback(() => {
    setShowCreateVenueModal(false);
    resetVenueForm();
  }, [resetVenueForm]);

  const handleCloseEditVenueModal = useCallback(() => {
    setShowEditVenueModal(false);
    setEditingVenue(null);
    resetVenueForm();
  }, [resetVenueForm]);

  // Zone Modal handlers
  const handleCloseCreateZoneModal = useCallback(() => {
    setShowCreateZoneModal(false);
    resetZoneForm();
  }, [resetZoneForm]);

  const handleCloseEditZoneModal = useCallback(() => {
    setShowEditZoneModal(false);
    setEditingZone(null);
    resetZoneForm();
  }, [resetZoneForm]);

  const openEditModal = (business) => {
    setEditingBusiness(business);
    setBusinessForm({
      registeredName: business.registeredName || '',
      brandName: business.brandName || '',
      taxId: business.taxId || '',
      contactEmail: business.contactEmail || '',
      contactPhone: business.contactPhone || '',
      address: business.address || '',
      description: business.description || '',
      logoUrl: business.logoUrl || '',
      isActive: business.isActive !== false
    });
    setShowEditBusinessModal(true);
  };

  const openEditStaffModal = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      email: staff.email || '',
      password: '', // Don't populate password for security
      fullName: staff.fullName || '',
      phoneNumber: staff.phoneNumber || '',
      role: staff.role || staff.userType || '',
      isActive: staff.isActive !== false
    });
    setShowEditStaffModal(true);
  };

  const openResetPasswordModal = (staff) => {
    setEditingStaff(staff);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false
    });
    setShowEditCategoryModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      price: product.price || 0,
      oldPrice: product.oldPrice || null,
      isAvailable: product.isAvailable !== false,
      isAlcohol: product.isAlcohol || false,
      categoryId: product.categoryId || selectedCategory?.id || null
    });
    setShowEditProductModal(true);
  };

  const openEditVenueModal = (venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name || '',
      type: venue.type || '',
      location: venue.location || '',
      description: venue.description || '',
      capacity: venue.capacity || 0,
      isActive: venue.isActive !== false
    });
    setShowEditVenueModal(true);
  };

  const openEditZoneModal = (zone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name || '',
      type: zone.type || '',
      description: zone.description || '',
      capacity: zone.capacity || 0,
      sortOrder: zone.sortOrder || 0,
      isActive: zone.isActive !== false
    });
    setShowEditZoneModal(true);
  };

  // Tab Navigation Component
  const TabNavigation = () => (
    <div className="border-b border-zinc-800 mb-8">
      <nav className="flex space-x-8">
        {[
          { id: 'businesses', label: 'Businesses', icon: '🏢' },
          { id: 'staff', label: 'Staff Management', icon: '👥' },
          { id: 'menu', label: 'Menu & Products', icon: '📋' },
          { id: 'venues', label: 'Venues & Zones', icon: '🏖️' },
          { id: 'settings', label: 'Settings', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );

  // Businesses Tab
  const BusinessesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Business Management</h2>
        <button 
          onClick={() => {
            console.log('🔘 Add Business button clicked - DEBUG');
            console.log('🔘 Current state:', { showCreateBusinessModal, loading, error });
            console.log('🔘 Setting showCreateBusinessModal to true');
            setShowCreateBusinessModal(true);
            console.log('🔘 Modal should now be visible');
          }}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Add Business
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          {error.includes('SuperAdmin') && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Using regular endpoints as fallback - some advanced features may be limited
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400">Loading businesses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-zinc-400 mb-4">No businesses found</p>
              <button 
                onClick={() => setShowCreateBusinessModal(true)}
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Create Your First Business
              </button>
            </div>
          ) : (
            businesses.map((business) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                    {business.logoUrl ? (
                      <img src={business.logoUrl} alt="" className="w-8 h-8 rounded" />
                    ) : (
                      <span className="text-xl">🏢</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    business.isActive 
                      ? 'bg-green-900/30 text-green-400 border border-green-800' 
                      : 'bg-red-900/30 text-red-400 border border-red-800'
                  }`}>
                    {business.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">
                  {business.brandName || business.registeredName}
                </h3>
                
                <p className="text-zinc-400 text-sm mb-4">
                  {business.registeredName}
                </p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Contact:</span>
                    <span className="text-zinc-300">{business.contactEmail || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Users:</span>
                    <span className="text-zinc-300">{business.users?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Venues:</span>
                    <span className="text-zinc-300">{business.venues?.length || 0}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('🔘 Manage button clicked for business:', business.id);
                      console.log('🔘 Calling fetchBusinessDetails...');
                      fetchBusinessDetails(business.id);
                      console.log('🔘 Setting activeTab to staff...');
                      setActiveTab('staff');
                      console.log('🔘 Should now show staff tab');
                    }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Staff
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔘 Menu Management button clicked for business:', business.id);
                      console.log('🔘 Calling fetchBusinessDetails and fetchVenues...');
                      fetchBusinessDetails(business.id);
                      fetchVenues(business.id);
                      console.log('🔘 Setting activeTab to menu...');
                      setActiveTab('menu');
                      console.log('🔘 Should now show menu tab');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔘 Venues Management button clicked for business:', business.id);
                      console.log('🔘 Calling fetchBusinessDetails and fetchVenuesForManagement...');
                      fetchBusinessDetails(business.id);
                      fetchVenuesForManagement(business.id);
                      console.log('🔘 Setting activeTab to venues...');
                      setActiveTab('venues');
                      console.log('🔘 Should now show venues tab');
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Venues
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔘 Edit button clicked for business:', business.id);
                      console.log('🔘 Business data:', business);
                      console.log('🔘 Calling openEditModal...');
                      openEditModal(business);
                      console.log('🔘 Edit modal should now be visible');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔘 Delete button clicked for business:', business.id);
                      console.log('🔘 Calling handleDeleteBusiness...');
                      handleDeleteBusiness(business.id);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Staff Management Tab
  const StaffTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('businesses')}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ← Back to Businesses
        </button>
        {selectedBusiness && (
          <div>
            <h2 className="text-2xl font-bold text-white">
              Staff - {selectedBusiness.brandName || selectedBusiness.registeredName}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Business ID: {selectedBusiness.id} | Contact: {selectedBusiness.contactEmail}
            </p>
          </div>
        )}
      </div>

      {selectedBusiness ? (
        <div className="space-y-6">
          {/* Staff Management Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-white">Staff Members</h3>
              <p className="text-sm text-zinc-400">
                {staffMembers.length} staff members registered
              </p>
            </div>
            <button 
              onClick={() => {
                console.log('🔘 Add Staff button clicked');
                setShowCreateStaffModal(true);
              }}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              + Add Staff Member
            </button>
          </div>

          {/* Staff Grid */}
          {staffLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-400">Loading staff members...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffMembers.length > 0 ? (
                staffMembers.map((staff) => (
                  <motion.div 
                    key={staff.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {staff.fullName?.charAt(0) || staff.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{staff.fullName || 'Unnamed User'}</h4>
                        <p className="text-sm text-zinc-400 truncate">{staff.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        staff.isActive 
                          ? 'bg-green-900/30 text-green-400 border border-green-800' 
                          : 'bg-red-900/30 text-red-400 border border-red-800'
                      }`}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Role:</span>
                        <span className="text-zinc-300">{staff.role || staff.userType || 'Staff'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Phone:</span>
                        <span className="text-zinc-300">{staff.phoneNumber || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Created:</span>
                        <span className="text-zinc-300 text-xs">
                          {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">ID:</span>
                        <span className="text-zinc-300 font-mono text-xs">{staff.id}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          console.log('🔘 Edit Staff button clicked for user:', staff.id);
                          openEditStaffModal(staff);
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔘 Reset Password button clicked for user:', staff.id);
                          openResetPasswordModal(staff);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔘 Toggle Activation button clicked for user:', staff.id);
                          handleToggleStaffActivation(staff.id);
                        }}
                        className={`px-3 py-2 rounded text-sm transition-colors ${
                          staff.isActive 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {staff.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔘 Delete Staff button clicked for user:', staff.id);
                          handleDeleteStaff(staff.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-zinc-400 mb-4">
                    <p>No staff members found for this business.</p>
                    <p className="text-sm mt-2">Add your first staff member to get started.</p>
                  </div>
                  <button 
                    onClick={() => {
                      console.log('🔘 Add First Staff button clicked');
                      setShowCreateStaffModal(true);
                    }}
                    className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Add First Staff Member
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Staff Management API Status */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-blue-400 mt-0.5">ℹ️</div>
              <div>
                <h4 className="text-blue-400 font-medium mb-1">Staff Management APIs</h4>
                <p className="text-blue-300 text-sm">
                  Full staff management functionality is available through SuperAdmin endpoints.
                </p>
                <div className="mt-2 space-y-1 text-xs text-blue-300 font-mono">
                  <div>✅ GET /api/superadmin/businesses/{'{businessId}'}/Users</div>
                  <div>✅ POST /api/superadmin/businesses/{'{businessId}'}/Users</div>
                  <div>✅ PUT /api/superadmin/businesses/{'{businessId}'}/Users/{'{id}'}</div>
                  <div>✅ DELETE /api/superadmin/businesses/{'{businessId}'}/Users/{'{id}'}</div>
                  <div>✅ POST /api/superadmin/businesses/{'{businessId}'}/Users/{'{id}'}/reset-password</div>
                  <div>✅ POST /api/superadmin/businesses/{'{businessId}'}/Users/{'{id}'}/activate</div>
                </div>
                <p className="text-blue-300 text-sm mt-2">
                  {error.includes('SuperAdmin') ? 
                    '⚠️ Currently limited due to JWT role claims configuration.' :
                    '✅ All staff management features should be fully functional.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">Select a business to view and manage staff members</p>
        </div>
      )}
    </div>
  );

  // Menu & Products Tab
  const MenuTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('businesses')}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ← Back to Businesses
        </button>
        {selectedBusiness && (
          <div>
            <h2 className="text-2xl font-bold text-white">
              Menu Management - {selectedBusiness.brandName || selectedBusiness.registeredName}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Business ID: {selectedBusiness.id} | Manage venues, categories, and products
            </p>
          </div>
        )}
      </div>

      {selectedBusiness ? (
        <div className="space-y-8">
          {/* Venue Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Select Venue</h3>
              <button 
                onClick={() => {
                  console.log('🔄 Refreshing venues for business:', selectedBusiness.id);
                  fetchVenues(selectedBusiness.id);
                }}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                🔄 Refresh Venues
              </button>
            </div>
            
            {menuLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin mb-2"></div>
                <p className="text-zinc-400 text-sm">Loading venues...</p>
              </div>
            ) : venues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venues.map((venue) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedVenue?.id === venue.id
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => {
                      console.log('🔘 Venue selected:', venue.id);
                      setSelectedVenue(venue);
                      setSelectedCategory(null);
                      setProducts([]);
                      fetchCategories(venue.id);
                    }}
                  >
                    <h4 className="font-medium text-white">{venue.name}</h4>
                    <p className="text-sm text-zinc-400">{venue.type || 'Venue'}</p>
                    <p className="text-xs text-zinc-500 mt-1">ID: {venue.id}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400">No venues found for this business.</p>
                <p className="text-sm text-zinc-500 mt-2">Venues are required to manage categories and products.</p>
              </div>
            )}
          </div>

          {/* Categories Management */}
          {selectedVenue && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">Categories - {selectedVenue.name}</h3>
                  <p className="text-sm text-zinc-400">{categories.length} categories</p>
                </div>
                <button 
                  onClick={() => {
                    console.log('🔘 Add Category button clicked');
                    setShowCreateCategoryModal(true);
                  }}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  + Add Category
                </button>
              </div>
              
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCategory?.id === category.id
                          ? 'bg-zinc-800 border-zinc-600'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                      onClick={() => {
                        console.log('🔘 Category selected:', category.id);
                        setSelectedCategory(category);
                        fetchProducts(category.id);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{category.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.isActive 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">Order: {category.sortOrder}</p>
                      <p className="text-xs text-zinc-500">ID: {category.id}</p>
                      
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCategoryModal(category);
                          }}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-400">No categories found for this venue.</p>
                  <button 
                    onClick={() => setShowCreateCategoryModal(true)}
                    className="mt-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Create First Category
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Products Management */}
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">Products - {selectedCategory.name}</h3>
                  <p className="text-sm text-zinc-400">{products.length} products</p>
                </div>
                <button 
                  onClick={() => {
                    console.log('🔘 Add Product button clicked');
                    setShowCreateProductModal(true);
                  }}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  + Add Product
                </button>
              </div>
              
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{product.name}</h4>
                          <p className="text-sm text-zinc-400 mt-1">{product.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.isAvailable 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {product.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          {product.isAlcohol && (
                            <span className="px-2 py-1 rounded-full text-xs bg-amber-900/30 text-amber-400">
                              Alcohol
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Price:</span>
                          <span className="text-white font-medium">€{product.price.toFixed(2)}</span>
                        </div>
                        {product.oldPrice && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Old Price:</span>
                            <span className="text-zinc-400 line-through">€{product.oldPrice.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-zinc-500">ID:</span>
                          <span className="text-zinc-300 font-mono text-xs">{product.id}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log('🔘 Edit Product button clicked for:', product.id);
                            openEditProductModal(product);
                          }}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            console.log('🔘 Delete Product button clicked for:', product.id);
                            handleDeleteProduct(product.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-400">No products found in this category.</p>
                  <button 
                    onClick={() => setShowCreateProductModal(true)}
                    className="mt-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Create First Product
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menu Management API Status */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-blue-400 mt-0.5">ℹ️</div>
              <div>
                <h4 className="text-blue-400 font-medium mb-1">Menu Management APIs</h4>
                <p className="text-blue-300 text-sm">
                  Complete menu management system with venues, categories, and products.
                </p>
                <div className="mt-2 space-y-1 text-xs text-blue-300 font-mono">
                  <div>✅ GET/POST/PUT/DELETE /api/superadmin/venues/{'{venueId}'}/Categories</div>
                  <div>✅ GET/POST/PUT/DELETE /api/superadmin/categories/{'{categoryId}'}/Products</div>
                  <div>✅ GET /api/superadmin/businesses/{'{businessId}'}/Venues</div>
                </div>
                <p className="text-blue-300 text-sm mt-2">
                  {error.includes('SuperAdmin') ? 
                    '⚠️ Currently limited due to JWT role claims configuration.' :
                    '✅ All menu management features should be fully functional.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">Select a business to manage menus and products</p>
        </div>
      )}
    </div>
  );

  // Venues & Zones Tab
  const VenuesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('businesses')}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ← Back to Businesses
        </button>
        {selectedBusiness && (
          <div>
            <h2 className="text-2xl font-bold text-white">
              Venues & Zones - {selectedBusiness.brandName || selectedBusiness.registeredName}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Business ID: {selectedBusiness.id} | Manage venues and their zones
            </p>
          </div>
        )}
      </div>

      {selectedBusiness ? (
        <div className="space-y-8">
          {/* Venues Management */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-white">Venues</h3>
                <p className="text-sm text-zinc-400">{venuesForManagement.length} venues configured</p>
              </div>
              <button 
                onClick={() => {
                  console.log('🔘 Add Venue button clicked');
                  setShowCreateVenueModal(true);
                }}
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                + Add Venue
              </button>
            </div>
            
            {venuesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin mb-2"></div>
                <p className="text-zinc-400 text-sm">Loading venues...</p>
              </div>
            ) : venuesForManagement.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venuesForManagement.map((venue) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedVenueForManagement?.id === venue.id
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => {
                      console.log('🔘 Venue selected for management:', venue.id);
                      setSelectedVenueForManagement(venue);
                      fetchZones(venue.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{venue.name}</h4>
                        <p className="text-sm text-zinc-400">{venue.type || 'Venue'}</p>
                        {venue.location && (
                          <p className="text-xs text-zinc-500">{venue.location}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        venue.isActive 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {venue.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-zinc-500 mb-3">
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span>{venue.capacity || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="font-mono">{venue.id}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditVenueModal(venue);
                        }}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVenue(venue.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400">No venues found for this business.</p>
                <button 
                  onClick={() => setShowCreateVenueModal(true)}
                  className="mt-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Create First Venue
                </button>
              </div>
            )}
          </div>

          {/* Zones Management */}
          {selectedVenueForManagement && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">Zones - {selectedVenueForManagement.name}</h3>
                  <p className="text-sm text-zinc-400">{zones.length} zones configured</p>
                </div>
                <button 
                  onClick={() => {
                    console.log('🔘 Add Zone button clicked');
                    setShowCreateZoneModal(true);
                  }}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  + Add Zone
                </button>
              </div>
              
              {zones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {zones.map((zone) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{zone.name}</h4>
                          <p className="text-sm text-zinc-400">{zone.type || 'Zone'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          zone.isActive 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-zinc-500 mb-3">
                        <div className="flex justify-between">
                          <span>Capacity:</span>
                          <span>{zone.capacity || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Order:</span>
                          <span>{zone.sortOrder}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ID:</span>
                          <span className="font-mono">{zone.id}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log('🔘 Edit Zone button clicked for:', zone.id);
                            openEditZoneModal(zone);
                          }}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            console.log('🔘 Delete Zone button clicked for:', zone.id);
                            handleDeleteZone(zone.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-400">No zones found in this venue.</p>
                  <button 
                    onClick={() => setShowCreateZoneModal(true)}
                    className="mt-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Create First Zone
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Venues & Zones API Status */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-blue-400 mt-0.5">ℹ️</div>
              <div>
                <h4 className="text-blue-400 font-medium mb-1">Venues & Zones Management APIs</h4>
                <p className="text-blue-300 text-sm">
                  Complete venue and zone management system with hierarchical structure.
                </p>
                <div className="mt-2 space-y-1 text-xs text-blue-300 font-mono">
                  <div>✅ GET/POST/PUT/DELETE /api/superadmin/businesses/{'{businessId}'}/Venues</div>
                  <div>✅ GET/POST/PUT/DELETE /api/superadmin/venues/{'{venueId}'}/Zones</div>
                  <div>✅ GET/PUT /api/superadmin/businesses/{'{businessId}'}/Venues/{'{id}'}/config</div>
                </div>
                <p className="text-blue-300 text-sm mt-2">
                  {error.includes('SuperAdmin') ? 
                    '⚠️ Currently limited due to JWT role claims configuration.' :
                    '✅ All venue and zone management features should be fully functional.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">Select a business to manage venues and zones</p>
        </div>
      )}
    </div>
  );

  // Settings Tab
  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">System Settings</h2>
        <p className="text-zinc-400 mb-6">Global system configuration and admin management</p>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-white mb-4">Available Features</h3>
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded">
              <span className="text-zinc-300">Admin Users Management</span>
              <span className="text-green-400 text-sm">Available</span>
            </div>
            <div className="text-zinc-400 font-mono text-xs ml-4">
              GET/POST /api/superadmin/AdminUsers
            </div>
            
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded">
              <span className="text-zinc-300">Dashboard Analytics</span>
              <span className="text-yellow-400 text-sm">Limited</span>
            </div>
            <div className="text-zinc-400 font-mono text-xs ml-4">
              GET /api/superadmin/Dashboard
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded">
            <p className="text-blue-400 text-sm">
              💡 Admin user management endpoints are available and should work once JWT role claims are fixed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
            <p className="text-zinc-400">Manage all businesses, staff, and system settings</p>
            
            {/* API Status Indicator */}
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-400">Basic APIs Working</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-yellow-400">SuperAdmin APIs Limited</span>
              </div>
            </div>
          </div>
          
          {userInfo && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{userInfo.name}</p>
                <p className="text-xs text-zinc-400">{userInfo.email}</p>
                <p className="text-xs text-emerald-400">{userInfo.role}</p>
              </div>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/superadmin/login';
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors border border-zinc-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <TabNavigation />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'businesses' && <BusinessesTab />}
            {activeTab === 'staff' && <StaffTab />}
            {activeTab === 'menu' && <MenuTab />}
            {activeTab === 'venues' && <VenuesTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>

        {/* Business Modals */}
        <CreateBusinessModal 
          isOpen={showCreateBusinessModal}
          onClose={handleCloseCreateModal}
          businessForm={businessForm}
          onFormChange={handleBusinessFormChange}
          onSubmit={handleCreateBusiness}
        />
        <EditBusinessModal 
          isOpen={showEditBusinessModal}
          onClose={handleCloseEditModal}
          businessForm={businessForm}
          onFormChange={handleBusinessFormChange}
          onSubmit={handleUpdateBusiness}
        />

        {/* Staff Modals */}
        <CreateStaffModal 
          isOpen={showCreateStaffModal}
          onClose={handleCloseCreateStaffModal}
          staffForm={staffForm}
          onFormChange={handleStaffFormChange}
          onSubmit={handleCreateStaff}
        />
        <EditStaffModal 
          isOpen={showEditStaffModal}
          onClose={handleCloseEditStaffModal}
          staffForm={staffForm}
          onFormChange={handleStaffFormChange}
          onSubmit={handleUpdateStaff}
        />
        <ResetPasswordModal 
          isOpen={showResetPasswordModal}
          onClose={handleCloseResetPasswordModal}
          staffMember={editingStaff}
          newPassword={newPassword}
          onPasswordChange={setNewPassword}
          onSubmit={handleResetPassword}
        />

        {/* Menu Management Modals */}
        <CreateCategoryModal 
          isOpen={showCreateCategoryModal}
          onClose={handleCloseCreateCategoryModal}
          categoryForm={categoryForm}
          onFormChange={handleCategoryFormChange}
          onSubmit={handleCreateCategory}
        />
        <EditCategoryModal 
          isOpen={showEditCategoryModal}
          onClose={handleCloseEditCategoryModal}
          categoryForm={categoryForm}
          onFormChange={handleCategoryFormChange}
          onSubmit={handleUpdateCategory}
        />
        <CreateProductModal 
          isOpen={showCreateProductModal}
          onClose={handleCloseCreateProductModal}
          productForm={productForm}
          onFormChange={handleProductFormChange}
          onSubmit={handleCreateProduct}
        />
        <EditProductModal 
          isOpen={showEditProductModal}
          onClose={handleCloseEditProductModal}
          productForm={productForm}
          onFormChange={handleProductFormChange}
          onSubmit={handleUpdateProduct}
        />

        {/* Venues & Zones Management Modals */}
        <CreateVenueModal 
          isOpen={showCreateVenueModal}
          onClose={handleCloseCreateVenueModal}
          venueForm={venueForm}
          onFormChange={handleVenueFormChange}
          onSubmit={handleCreateVenue}
        />
        <EditVenueModal 
          isOpen={showEditVenueModal}
          onClose={handleCloseEditVenueModal}
          venueForm={venueForm}
          onFormChange={handleVenueFormChange}
          onSubmit={handleUpdateVenue}
        />
        <CreateZoneModal 
          isOpen={showCreateZoneModal}
          onClose={handleCloseCreateZoneModal}
          zoneForm={zoneForm}
          onFormChange={handleZoneFormChange}
          onSubmit={handleCreateZone}
        />
        <EditZoneModal 
          isOpen={showEditZoneModal}
          onClose={handleCloseEditZoneModal}
          zoneForm={zoneForm}
          onFormChange={handleZoneFormChange}
          onSubmit={handleUpdateZone}
        />
      </div>
    </div>
  );
}