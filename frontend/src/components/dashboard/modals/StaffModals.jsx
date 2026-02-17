import { motion, AnimatePresence } from 'framer-motion';

export const CreateStaffModal = ({ 
  isOpen, 
  onClose, 
  staffForm, 
  onFormChange, 
  onSubmit,
  isSuperAdmin = false  // SuperAdmin can assign "Owner" role
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
                  {isSuperAdmin && <option value="Owner">Owner (SuperAdmin only)</option>}
                  <option value="Manager">Manager</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Collector">Collector</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  {isSuperAdmin 
                    ? "✅ SuperAdmin: Can assign Owner, Manager, Bartender, Collector" 
                    : "✅ Business roles: Manager, Bartender, Collector"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Assigned Venue
                </label>
                <select
                  value={staffForm.venueId || ''}
                  onChange={(e) => onFormChange('venueId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Not Assigned</option>
                  {staffForm.venues?.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  Optional: Assign staff to specific venue
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

export const EditStaffModal = ({ 
  isOpen, 
  onClose, 
  staffForm, 
  onFormChange, 
  onSubmit,
  isSuperAdmin = false  // SuperAdmin can assign "Owner" role
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
                  {isSuperAdmin && <option value="Owner">Owner (SuperAdmin only)</option>}
                  <option value="Manager">Manager</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Collector">Collector</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  {isSuperAdmin 
                    ? "✅ SuperAdmin: Can assign Owner, Manager, Bartender, Collector" 
                    : "✅ Business roles: Manager, Bartender, Collector"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Assigned Venue
                </label>
                <select
                  value={staffForm.venueId || ''}
                  onChange={(e) => onFormChange('venueId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Not Assigned</option>
                  {staffForm.venues?.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  Optional: Assign staff to specific venue
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

export const ResetPasswordModal = ({ 
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
