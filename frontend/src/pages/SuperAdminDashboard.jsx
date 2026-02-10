import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { businessApi, staffApi, venueApi, zoneApi, categoryApi, productApi, adminUsersApi, authApi, dashboardApi } from '../services/superAdminApi.js';

// Utility function to normalize phone numbers (match backend format)
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

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
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={staffForm.phoneNumber}
                  onChange={(e) => onFormChange('phoneNumber', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter phone number"
                />
                <p className="text-xs text-zinc-500 mt-1">Primary identifier for staff login</p>
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
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  value={staffForm.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      onFormChange('pin', value);
                    }
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none font-mono text-center text-lg tracking-widest"
                  placeholder="0000"
                />
                <p className="text-xs text-zinc-500 mt-1">4-digit PIN for staff login</p>
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
                  <option value="Manager">Manager</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Collector">Collector</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  ✅ Backend roles: Manager, Bartender, Collector (aligned with backend)
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="createStaffIsActive"
                checked={staffForm.isActive}
                onChange={(e) => onFormChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="createStaffIsActive" className="text-sm text-zinc-300">
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
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={staffForm.phoneNumber}
                  onChange={(e) => onFormChange('phoneNumber', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="Enter phone number"
                />
                <p className="text-xs text-zinc-500 mt-1">Primary identifier for staff login</p>
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
                  PIN Code (leave blank to keep current)
                </label>
                <input
                  type="text"
                  maxLength="4"
                  pattern="[0-9]{4}"
                  value={staffForm.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      onFormChange('pin', value);
                    }
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none font-mono text-center text-lg tracking-widest"
                  placeholder="0000"
                />
                <p className="text-xs text-zinc-500 mt-1">Leave blank to keep existing PIN</p>
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
                  <option value="Manager">Manager</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Collector">Collector</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  ✅ Backend roles: Manager, Bartender, Collector (aligned with backend)
                </p>
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

// Business Modal Components
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

// Business Tab Component - Extracted outside
const BusinessTab = ({ 
  businesses, 
  selectedBusiness, 
  onBusinessSelect, 
  onCreateBusiness, 
  onEditBusiness, 
  onDeleteBusiness,
  loading 
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Business Management</h2>
      <button
        onClick={onCreateBusiness}
        className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
      >
        + Create Business
      </button>
    </div>

    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <div
            key={business.id}
            className={`bg-zinc-800 rounded-lg p-6 cursor-pointer transition-all ${
              selectedBusiness?.id === business.id 
                ? 'ring-2 ring-blue-500 bg-zinc-700' 
                : 'hover:bg-zinc-700'
            }`}
            onClick={() => onBusinessSelect(business)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">
                {business.brandName || business.registeredName}
              </h3>
              <span className={`px-2 py-1 rounded text-xs ${
                business.isActive 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-red-900 text-red-300'
              }`}>
                {business.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-zinc-400 text-sm mb-2">
              {business.contactEmail}
            </p>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBusiness(business);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBusiness(business.id);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Staff Tab Component - Extracted outside
const StaffTab = ({ 
  staffMembers, 
  selectedBusiness, 
  onCreateStaff, 
  onEditStaff, 
  onDeleteStaff, 
  onResetPassword,
  onToggleActivation,
  loading 
}) => {
  if (!selectedBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Please select a business first to manage staff members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Management</h2>
          <p className="text-zinc-400">Managing staff for: {selectedBusiness.brandName || selectedBusiness.registeredName}</p>
        </div>
        <button
          onClick={onCreateStaff}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Add Staff Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  PIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="hover:bg-zinc-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {staff.fullName || 'No name'}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {staff.phoneNumber || 'No phone number'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-300 rounded">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      staff.hasPinSet 
                        ? 'bg-emerald-900/20 text-emerald-400' 
                        : 'bg-amber-900/20 text-amber-400'
                    }`}>
                      {staff.hasPinSet ? '✓ Set' : '✗ Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActivation(staff.id)}
                      className={`px-2 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                        staff.isActive 
                          ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                          : 'bg-red-900 text-red-300 hover:bg-red-800'
                      }`}
                    >
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEditStaff(staff)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onResetPassword(staff)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => onDeleteStaff(staff.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {staffMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-zinc-400">No staff members found for this business.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Menu Tab Component - Extracted outside
const MenuTab = ({ 
  selectedBusiness, 
  categories, 
  selectedCategory, 
  products, 
  onCategorySelect, 
  onCreateCategory, 
  onEditCategory, 
  onDeleteCategory,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
  isMenuLoading,
  productsLoading 
}) => {
  if (!selectedBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Please select a business first to manage menu items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu Management</h2>
          <p className="text-zinc-400">Managing menu for: {selectedBusiness.brandName || selectedBusiness.registeredName}</p>
        </div>
        <button
          onClick={onCreateCategory}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Create Category
        </button>
      </div>

      {isMenuLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedCategory?.id === category.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                    onClick={() => onCategorySelect(category)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCategory(category);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(category.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {categories.length === 0 && (
                <p className="text-zinc-400 text-sm">No categories found. Create one to get started.</p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Products {selectedCategory && `- ${selectedCategory.name}`}
                </h3>
                {selectedCategory && (
                  <button
                    onClick={onCreateProduct}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    + Add Product
                  </button>
                )}
              </div>

              {!selectedCategory ? (
                <p className="text-zinc-400 text-sm">Select a category to view products.</p>
              ) : productsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-zinc-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{product.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.isAvailable 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      <p className="text-zinc-400 text-sm mb-2">{product.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-white font-semibold">
                          €{product.price.toFixed(2)}
                          {product.oldPrice && (
                            <span className="text-zinc-400 line-through ml-2">
                              €{product.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedCategory && products.length === 0 && !productsLoading && (
                <p className="text-zinc-400 text-sm">No products found in this category.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Venues Tab Component - Extracted outside
const VenuesTab = ({ 
  selectedBusiness, 
  venues, 
  selectedVenue, 
  zones, 
  onVenueSelect, 
  onCreateVenue, 
  onEditVenue, 
  onDeleteVenue,
  onCreateZone,
  onEditZone,
  onDeleteZone,
  loading 
}) => {
  if (!selectedBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Please select a business first to manage venues.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Venues & Zones</h2>
          <p className="text-zinc-400">Managing venues for: {selectedBusiness.brandName || selectedBusiness.registeredName}</p>
        </div>
        <button
          onClick={onCreateVenue}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Create Venue
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Venues */}
          <div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Venues</h3>
              <div className="space-y-3">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className={`p-4 rounded cursor-pointer transition-colors ${
                      selectedVenue?.id === venue.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                    onClick={() => onVenueSelect(venue)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{venue.name}</h4>
                        <p className="text-sm opacity-75">{venue.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        venue.isActive 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {venue.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Capacity: {venue.capacity || 'N/A'}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditVenue(venue);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVenue(venue.id);
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {venues.length === 0 && (
                <p className="text-zinc-400 text-sm">No venues found. Create one to get started.</p>
              )}
            </div>
          </div>

          {/* Zones */}
          <div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Zones {selectedVenue && `- ${selectedVenue.name}`}
                </h3>
                {selectedVenue && (
                  <button
                    onClick={onCreateZone}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    + Add Zone
                  </button>
                )}
              </div>

              {!selectedVenue ? (
                <p className="text-zinc-400 text-sm">Select a venue to view zones.</p>
              ) : (
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div key={zone.id} className="bg-zinc-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-white">{zone.name}</h4>
                          <p className="text-sm text-zinc-400">{zone.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          zone.isActive 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">
                          Capacity: {zone.capacity || 'N/A'}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEditZone(zone)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteZone(zone.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedVenue && zones.length === 0 && (
                <p className="text-zinc-400 text-sm">No zones found in this venue.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main SuperAdminDashboard Component
export default function SuperAdminDashboard() {
  // Core state
  const [activeTab, setActiveTab] = useState('businesses');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  // Staff state
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Menu state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Venues state
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  
  // Business state
  const [editingBusiness, setEditingBusiness] = useState(null);
  
  // Modal states
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showCreateVenueModal, setShowCreateVenueModal] = useState(false);
  const [showEditVenueModal, setShowEditVenueModal] = useState(false);
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  
  // Form states
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    fullName: '',
    role: '',
    pin: '',
    isActive: true
  });

  const [businessForm, setBusinessForm] = useState({
    registeredName: '',
    brandName: '',
    taxId: '',
    contactEmail: '',
    logoUrl: '',
    isActive: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sortOrder: 0,
    isActive: true
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    oldPrice: null,
    isAvailable: true,
    isAlcohol: false
  });

  const [venueForm, setVenueForm] = useState({
    name: '',
    type: '',
    location: '',
    description: '',
    capacity: 0,
    isActive: true
  });

  const [zoneForm, setZoneForm] = useState({
    name: '',
    type: '',
    description: '',
    capacity: 0,
    sortOrder: 0,
    isActive: true
  });

  // Memoized form handlers to prevent re-renders
  const handleStaffFormChange = useCallback((field, value) => {
    setStaffForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBusinessFormChange = useCallback((field, value) => {
    setBusinessForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryFormChange = useCallback((field, value) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProductFormChange = useCallback((field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleVenueFormChange = useCallback((field, value) => {
    setVenueForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleZoneFormChange = useCallback((field, value) => {
    setZoneForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Authentication check
  useEffect(() => {
    const checkUserRole = () => {
      const role = localStorage.getItem('role');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
      
      if (!token || role !== 'SuperAdmin') {
        localStorage.clear();
        window.location.href = '/superadmin/login';
        return;
      }
      
      setUserInfo({
        role,
        name: userName || 'Super Administrator',
        email: userEmail || 'superadmin@rivieraos.com'
      });
    };
    
    checkUserRole();
  }, []);

  // Fetch businesses when authenticated
  useEffect(() => {
    if (userInfo) {
      fetchBusinesses();
    }
  }, [userInfo]);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await businessApi.superAdmin.getAll();
      const businessesArray = Array.isArray(data) ? data : data?.items || [];
      setBusinesses(businessesArray);
      setError('');
    } catch (err) {
      console.error('Error fetching businesses:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch businesses: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBusinessSelect = useCallback(async (business) => {
    setSelectedBusiness(business);
    
    // Fetch staff for selected business
    try {
      setStaffLoading(true);
      const staffData = await staffApi.getByBusiness(business.id);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaffMembers([]);
    } finally {
      setStaffLoading(false);
    }

    // Fetch menu data for selected business
    await fetchMenuForBusiness(business.id);
    
    // Fetch venues for selected business
    await fetchVenuesForBusiness(business.id);
  }, []);

  // Business Management Functions
  const handleCreateBusiness = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      await businessApi.superAdmin.create(businessForm);
      setShowCreateBusinessModal(false);
      setBusinessForm({
        registeredName: '',
        brandName: '',
        taxId: '',
        contactEmail: '',
        logoUrl: '',
        isActive: true
      });
      
      // Refresh businesses list
      await fetchBusinesses();
      setError('');
    } catch (err) {
      console.error('Error creating business:', err);
      setError('Failed to create business: ' + (err.response?.data?.message || err.message));
    }
  }, [businessForm, fetchBusinesses]);

  const handleUpdateBusiness = useCallback(async (e) => {
    e.preventDefault();
    if (!editingBusiness) return;
    
    try {
      await businessApi.superAdmin.update(editingBusiness.id, businessForm);
      setShowEditBusinessModal(false);
      setEditingBusiness(null);
      setBusinessForm({
        registeredName: '',
        brandName: '',
        taxId: '',
        contactEmail: '',
        logoUrl: '',
        isActive: true
      });
      
      // Refresh businesses list
      await fetchBusinesses();
      setError('');
    } catch (err) {
      console.error('Error updating business:', err);
      setError('Failed to update business: ' + (err.response?.data?.message || err.message));
    }
  }, [editingBusiness, businessForm, fetchBusinesses]);

  const handleDeleteBusiness = useCallback(async (businessId) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) return;
    
    try {
      await businessApi.superAdmin.delete(businessId);
      await fetchBusinesses();
      setError('');
    } catch (err) {
      console.error('Error deleting business:', err);
      setError('Failed to delete business: ' + (err.response?.data?.message || err.message));
    }
  }, [fetchBusinesses]);

  // Staff Management Functions
  const handleCreateStaff = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    
    try {
      // Create staff member with email, password, phone number and PIN
      // Normalize phone number to match backend format
      const staffData = {
        email: staffForm.email,
        password: staffForm.password,
        phoneNumber: normalizePhoneNumber(staffForm.phoneNumber),
        fullName: staffForm.fullName,
        role: staffForm.role,
        pin: staffForm.pin,
        isActive: staffForm.isActive
      };
      
      console.log('📤 Creating staff with data:', {
        email: staffData.email,
        password: '************',
        phoneNumber: staffData.phoneNumber,
        fullName: staffData.fullName,
        role: staffData.role,
        pin: '****',
        businessId: selectedBusiness.id
      });
      
      await staffApi.create(selectedBusiness.id, staffData);
      setShowCreateStaffModal(false);
      setStaffForm({
        email: '',
        password: '',
        phoneNumber: '',
        fullName: '',
        role: '',
        pin: '',
        isActive: true
      });
      
      // Refresh staff list
      const refreshedStaffData = await staffApi.getByBusiness(selectedBusiness.id);
      console.log('📊 Refreshed staff data:', refreshedStaffData);
      setStaffMembers(Array.isArray(refreshedStaffData) ? refreshedStaffData : []);
      setError('');
      
      console.log('✅ Staff member created successfully');
    } catch (err) {
      console.error('Error creating staff:', err);
      setError('Failed to create staff member: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, staffForm]);

  const handleUpdateStaff = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !editingStaff) return;
    
    try {
      // Update staff member with email, phone number and PIN
      const staffData = {
        email: staffForm.email,
        phoneNumber: staffForm.phoneNumber,
        fullName: staffForm.fullName,
        role: staffForm.role,
        pin: staffForm.pin,
        isActive: staffForm.isActive
      };
      
      await staffApi.update(selectedBusiness.id, editingStaff.id, staffData);
      setShowEditStaffModal(false);
      setEditingStaff(null);
      setStaffForm({
        email: '',
        phoneNumber: '',
        fullName: '',
        role: '',
        pin: '',
        isActive: true
      });
      
      // Refresh staff list
      const refreshedStaffData = await staffApi.getByBusiness(selectedBusiness.id);
      setStaffMembers(Array.isArray(refreshedStaffData) ? refreshedStaffData : []);
      setError('');
    } catch (err) {
      console.error('Error updating staff:', err);
      setError('Failed to update staff member: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingStaff, staffForm]);

  const handleDeleteStaff = useCallback(async (staffId) => {
    if (!selectedBusiness) return;
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await staffApi.delete(selectedBusiness.id, staffId);
      
      // Refresh staff list
      const staffData = await staffApi.getByBusiness(selectedBusiness.id);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setError('');
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness]);

  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !editingStaff || !newPassword) return;
    
    try {
      await staffApi.resetPassword(selectedBusiness.id, editingStaff.id, newPassword);
      setShowResetPasswordModal(false);
      setEditingStaff(null);
      setNewPassword('');
      setError('');
      alert('Password reset successfully!');
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Failed to reset password: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingStaff, newPassword]);

  const handleToggleStaffActivation = useCallback(async (staffId) => {
    if (!selectedBusiness) return;
    
    try {
      await staffApi.toggleActivation(selectedBusiness.id, staffId);
      
      // Refresh staff list
      const staffData = await staffApi.getByBusiness(selectedBusiness.id);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setError('');
    } catch (err) {
      console.error('Error toggling staff activation:', err);
      setError('Failed to toggle staff activation: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness]);

  // Menu Management Functions
  const fetchMenuForBusiness = useCallback(async (businessId) => {
    if (!businessId) return;

    setCategories([]);
    setSelectedCategory(null);
    setProducts([]);
    setIsMenuLoading(true);
    setError('');

    try {
      const categoryData = await categoryApi.business.getByBusiness(businessId);
      setCategories(Array.isArray(categoryData) ? categoryData : []);

      if (categoryData && categoryData.length > 0) {
        const firstCategory = categoryData[0];
        setSelectedCategory(firstCategory);

        const productData = await productApi.getByCategory(firstCategory.id);
        setProducts(Array.isArray(productData) ? productData : []);
      } else {
        setSelectedCategory(null);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      if (err.response?.status === 404) {
        setCategories([]);
        setSelectedCategory(null);
        setProducts([]);
        setError('');
      } else {
        setError('Failed to load menu: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsMenuLoading(false);
    }
  }, []);

  const handleCategorySelect = useCallback(async (category) => {
    if (!category) return;

    setSelectedCategory(category);
    setProductsLoading(true);
    
    try {
      const productData = await productApi.getByCategory(category.id);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err) {
      console.error('Error fetching products for category:', err);
      setProducts([]);
      setError('Failed to fetch products: ' + (err.response?.data?.message || err.message));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const handleCreateCategory = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id) return;
    
    try {
      await categoryApi.business.create(selectedBusiness.id, categoryForm);
      setShowCreateCategoryModal(false);
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      await fetchMenuForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, categoryForm, fetchMenuForBusiness]);

  const handleUpdateCategory = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id || !editingCategory) return;
    
    try {
      await categoryApi.business.update(selectedBusiness.id, editingCategory.id, categoryForm);
      setShowEditCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      await fetchMenuForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingCategory, categoryForm, fetchMenuForBusiness]);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    if (!selectedBusiness?.id) return;
    if (!confirm('Are you sure you want to delete this category? This will also delete all products in this category.')) return;
    
    try {
      await categoryApi.business.delete(selectedBusiness.id, categoryId);
      await fetchMenuForBusiness(selectedBusiness.id);
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setProducts([]);
      }
      setError('');
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, selectedCategory, fetchMenuForBusiness]);

  const handleCreateProduct = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    try {
      await productApi.create(selectedCategory.id, productForm);
      setShowCreateProductModal(false);
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false
      });
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(selectedCategory.id);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedCategory, productForm]);

  const handleUpdateProduct = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedCategory || !editingProduct) return;
    
    try {
      await productApi.update(selectedCategory.id, editingProduct.id, productForm);
      setShowEditProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false
      });
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(selectedCategory.id);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedCategory, editingProduct, productForm]);

  const handleDeleteProduct = useCallback(async (productId) => {
    if (!selectedCategory) return;
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      await productApi.delete(selectedCategory.id, productId);
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(selectedCategory.id);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedCategory]);

  // Venues Management Functions
  const fetchVenuesForBusiness = useCallback(async (businessId) => {
    if (!businessId) return;

    setVenuesLoading(true);
    try {
      const venueData = await venueApi.getByBusiness(businessId);
      setVenues(Array.isArray(venueData) ? venueData : []);
      setError('');
    } catch (err) {
      console.error('Error fetching venues:', err);
      setVenues([]);
      if (err.response?.status !== 404) {
        setError('Failed to fetch venues: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setVenuesLoading(false);
    }
  }, []);

  const handleVenueSelect = useCallback(async (venue) => {
    setSelectedVenue(venue);
    
    // Fetch zones for selected venue
    try {
      const zoneData = await zoneApi.getByVenue(venue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setZones([]);
    }
  }, []);

  const handleCreateVenue = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id) return;
    
    try {
      await venueApi.create(selectedBusiness.id, venueForm);
      setShowCreateVenueModal(false);
      setVenueForm({
        name: '',
        type: '',
        location: '',
        description: '',
        capacity: 0,
        isActive: true
      });
      await fetchVenuesForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error creating venue:', err);
      setError('Failed to create venue: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, venueForm, fetchVenuesForBusiness]);

  const handleUpdateVenue = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id || !editingVenue) return;
    
    try {
      await venueApi.update(selectedBusiness.id, editingVenue.id, venueForm);
      setShowEditVenueModal(false);
      setEditingVenue(null);
      setVenueForm({
        name: '',
        type: '',
        location: '',
        description: '',
        capacity: 0,
        isActive: true
      });
      await fetchVenuesForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error updating venue:', err);
      setError('Failed to update venue: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingVenue, venueForm, fetchVenuesForBusiness]);

  const handleDeleteVenue = useCallback(async (venueId) => {
    if (!selectedBusiness?.id) return;
    if (!confirm('Are you sure you want to delete this venue? This will also delete all zones in this venue.')) return;
    
    try {
      await venueApi.delete(selectedBusiness.id, venueId);
      await fetchVenuesForBusiness(selectedBusiness.id);
      if (selectedVenue?.id === venueId) {
        setSelectedVenue(null);
        setZones([]);
      }
      setError('');
    } catch (err) {
      console.error('Error deleting venue:', err);
      setError('Failed to delete venue: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, selectedVenue, fetchVenuesForBusiness]);

  const handleCreateZone = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;
    
    try {
      console.log('📤 [SuperAdmin] Creating zone with data:', {
        name: zoneForm.name,
        type: zoneForm.type,
        capacity: zoneForm.capacity,
        capacityType: typeof zoneForm.capacity,
        description: zoneForm.description,
        sortOrder: zoneForm.sortOrder,
        isActive: zoneForm.isActive
      });
      
      const response = await zoneApi.create(selectedVenue.id, zoneForm);
      
      console.log('✅ [SuperAdmin] Zone created successfully:', response);
      
      setShowCreateZoneModal(false);
      setZoneForm({
        name: '',
        type: '',
        description: '',
        capacity: 0,
        sortOrder: 0,
        isActive: true
      });
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      console.log('📊 [SuperAdmin] Refreshed zone data:', zoneData);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('❌ [SuperAdmin] Error creating zone:', err);
      setError('Failed to create zone: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue, zoneForm]);

  const handleUpdateZone = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVenue || !editingZone) return;
    
    try {
      await zoneApi.update(selectedVenue.id, editingZone.id, zoneForm);
      setShowEditZoneModal(false);
      setEditingZone(null);
      setZoneForm({
        name: '',
        type: '',
        description: '',
        capacity: 0,
        sortOrder: 0,
        isActive: true
      });
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('Error updating zone:', err);
      setError('Failed to update zone: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue, editingZone, zoneForm]);

  const handleDeleteZone = useCallback(async (zoneId) => {
    if (!selectedVenue) return;
    if (!confirm('Are you sure you want to delete this zone? This action cannot be undone.')) return;
    
    try {
      await zoneApi.delete(selectedVenue.id, zoneId);
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError('Failed to delete zone: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue]);

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'businesses':
        return (
          <BusinessTab
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onBusinessSelect={handleBusinessSelect}
            onCreateBusiness={() => setShowCreateBusinessModal(true)}
            onEditBusiness={(business) => {
              setEditingBusiness(business);
              setBusinessForm({
                registeredName: business.registeredName || '',
                brandName: business.brandName || '',
                taxId: business.taxId || '',
                contactEmail: business.contactEmail || '',
                logoUrl: business.logoUrl || '',
                isActive: business.isActive
              });
              setShowEditBusinessModal(true);
            }}
            onDeleteBusiness={handleDeleteBusiness}
            loading={loading}
          />
        );
      case 'staff':
        return (
          <StaffTab
            staffMembers={staffMembers}
            selectedBusiness={selectedBusiness}
            onCreateStaff={() => setShowCreateStaffModal(true)}
            onEditStaff={(staff) => {
              setEditingStaff(staff);
              setStaffForm({
                email: staff.email || '',
                phoneNumber: staff.phoneNumber || '',
                fullName: staff.fullName || '',
                role: staff.role || '',
                pin: '', // Don't pre-fill PIN for security
                isActive: staff.isActive
              });
              setShowEditStaffModal(true);
            }}
            onDeleteStaff={handleDeleteStaff}
            onResetPassword={(staff) => {
              setEditingStaff(staff);
              setNewPassword('');
              setShowResetPasswordModal(true);
            }}
            onToggleActivation={handleToggleStaffActivation}
            loading={staffLoading}
          />
        );
      case 'menu':
        return (
          <MenuTab
            selectedBusiness={selectedBusiness}
            categories={categories}
            selectedCategory={selectedCategory}
            products={products}
            onCategorySelect={handleCategorySelect}
            onCreateCategory={() => setShowCreateCategoryModal(true)}
            onEditCategory={(category) => {
              setEditingCategory(category);
              setCategoryForm({
                name: category.name || '',
                sortOrder: category.sortOrder || 0,
                isActive: category.isActive
              });
              setShowEditCategoryModal(true);
            }}
            onDeleteCategory={handleDeleteCategory}
            onCreateProduct={() => setShowCreateProductModal(true)}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setProductForm({
                name: product.name || '',
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                price: product.price || 0,
                oldPrice: product.oldPrice || null,
                isAvailable: product.isAvailable,
                isAlcohol: product.isAlcohol
              });
              setShowEditProductModal(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            isMenuLoading={isMenuLoading}
            productsLoading={productsLoading}
          />
        );
      case 'venues':
        return (
          <VenuesTab
            selectedBusiness={selectedBusiness}
            venues={venues}
            selectedVenue={selectedVenue}
            zones={zones}
            onVenueSelect={handleVenueSelect}
            onCreateVenue={() => setShowCreateVenueModal(true)}
            onEditVenue={(venue) => {
              setEditingVenue(venue);
              setVenueForm({
                name: venue.name || '',
                type: venue.type || '',
                location: venue.location || '',
                description: venue.description || '',
                capacity: venue.capacity || 0,
                isActive: venue.isActive
              });
              setShowEditVenueModal(true);
            }}
            onDeleteVenue={handleDeleteVenue}
            onCreateZone={() => setShowCreateZoneModal(true)}
            onEditZone={(zone) => {
              setEditingZone(zone);
              setZoneForm({
                name: zone.name || '',
                type: zone.type || '',
                description: zone.description || '',
                capacity: zone.capacity || 0,
                sortOrder: zone.sortOrder || 0,
                isActive: zone.isActive
              });
              setShowEditZoneModal(true);
            }}
            onDeleteZone={handleDeleteZone}
            loading={venuesLoading}
          />
        );
      default:
        return null;
    }
  }, [activeTab, businesses, selectedBusiness, staffMembers, categories, selectedCategory, products, venues, selectedVenue, zones, loading, staffLoading, isMenuLoading, productsLoading, venuesLoading, handleBusinessSelect, handleDeleteBusiness, handleDeleteStaff, handleToggleStaffActivation, handleCategorySelect, handleDeleteCategory, handleDeleteProduct, handleVenueSelect, handleDeleteVenue, handleDeleteZone]);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-zinc-400">Welcome back, {userInfo.name}</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/superadmin/login';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-6 py-3 mx-6 mt-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'businesses', label: 'Businesses' },
              { id: 'staff', label: 'Staff Management' },
              { id: 'menu', label: 'Menu Management' },
              { id: 'venues', label: 'Venues & Zones' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {tabContent}
      </div>

      {/* Modals */}
      <CreateStaffModal
        isOpen={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleCreateStaff}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={showEditStaffModal}
        onClose={() => {
          setShowEditStaffModal(false);
          setEditingStaff(null);
        }}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleUpdateStaff}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setEditingStaff(null);
          setNewPassword('');
        }}
        staffMember={editingStaff}
        newPassword={newPassword}
        onPasswordChange={setNewPassword}
        onSubmit={handleResetPassword}
      />

      {/* Create Business Modal */}
      <CreateBusinessModal
        isOpen={showCreateBusinessModal}
        onClose={() => setShowCreateBusinessModal(false)}
        businessForm={businessForm}
        onFormChange={handleBusinessFormChange}
        onSubmit={handleCreateBusiness}
      />

      {/* Edit Business Modal */}
      <EditBusinessModal
        isOpen={showEditBusinessModal}
        onClose={() => {
          setShowEditBusinessModal(false);
          setEditingBusiness(null);
        }}
        businessForm={businessForm}
        onFormChange={handleBusinessFormChange}
        onSubmit={handleUpdateBusiness}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleCreateCategory}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false);
          setEditingCategory(null);
        }}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleUpdateCategory}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => setShowCreateProductModal(false)}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleCreateProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => {
          setShowEditProductModal(false);
          setEditingProduct(null);
        }}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleUpdateProduct}
      />

      {/* Create Venue Modal */}
      <CreateVenueModal
        isOpen={showCreateVenueModal}
        onClose={() => setShowCreateVenueModal(false)}
        venueForm={venueForm}
        onFormChange={handleVenueFormChange}
        onSubmit={handleCreateVenue}
      />

      {/* Edit Venue Modal */}
      <EditVenueModal
        isOpen={showEditVenueModal}
        onClose={() => {
          setShowEditVenueModal(false);
          setEditingVenue(null);
        }}
        venueForm={venueForm}
        onFormChange={handleVenueFormChange}
        onSubmit={handleUpdateVenue}
      />

      {/* Create Zone Modal */}
      <CreateZoneModal
        isOpen={showCreateZoneModal}
        onClose={() => setShowCreateZoneModal(false)}
        zoneForm={zoneForm}
        onFormChange={handleZoneFormChange}
        onSubmit={handleCreateZone}
        selectedVenue={selectedVenue}
      />

      {/* Edit Zone Modal */}
      <EditZoneModal
        isOpen={showEditZoneModal}
        onClose={() => {
          setShowEditZoneModal(false);
          setEditingZone(null);
        }}
        zoneForm={zoneForm}
        onFormChange={handleZoneFormChange}
        onSubmit={handleUpdateZone}
        selectedVenue={selectedVenue}
      />
    </div>
  );
}

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

// Venue Modal Components
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
                  Venue Type *
                </label>
                <select
                  required
                  value={venueForm.type || ''}
                  onChange={(e) => onFormChange('type', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select venue type...</option>
                  <option value="BEACH">Beach</option>
                  <option value="POOL">Pool</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="BAR">Bar</option>
                  <option value="CAFE">Cafe</option>
                  <option value="OTHER">Other</option>
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
                  Venue Type *
                </label>
                <select
                  required
                  value={venueForm.type || ''}
                  onChange={(e) => onFormChange('type', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select venue type...</option>
                  <option value="BEACH">Beach</option>
                  <option value="POOL">Pool</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="BAR">Bar</option>
                  <option value="CAFE">Cafe</option>
                  <option value="OTHER">Other</option>
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
  onSubmit,
  selectedVenue
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
          
          {selectedVenue && (
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
              <p className="text-blue-400 text-sm">
                🏖️ This zone will be created inside: <strong>{selectedVenue.name}</strong>
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Venue ID: {selectedVenue.id} • Type: {selectedVenue.type || 'Venue'}
              </p>
            </div>
          )}
          
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
  onSubmit,
  selectedVenue
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
          
          {selectedVenue && (
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
              <p className="text-blue-400 text-sm">
                🏖️ This zone belongs to: <strong>{selectedVenue.name}</strong>
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Venue ID: {selectedVenue.id} • Type: {selectedVenue.type || 'Venue'}
              </p>
            </div>
          )}
          
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