import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { businessApi, staffApi, venueApi, zoneApi, categoryApi, productApi, adminUsersApi, authApi, dashboardApi } from '../services/superAdminApi.js';

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
                        {staff.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-300 rounded">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-zinc-300">
                      {staff.pin || '----'}
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
  
  // Menu state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Venues state
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  
  // Modal states
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  
  // Form states
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: '',
    pin: '',
    isActive: true
  });

  // Memoized form handlers to prevent re-renders
  const handleStaffFormChange = useCallback((field, value) => {
    setStaffForm(prev => ({ ...prev, [field]: value }));
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
  }, []);

  const handleCreateStaff = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    
    try {
      await staffApi.create(selectedBusiness.id, staffForm);
      setShowCreateStaffModal(false);
      setStaffForm({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: '',
        pin: '',
        isActive: true
      });
      
      // Refresh staff list
      const staffData = await staffApi.getByBusiness(selectedBusiness.id);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setError('');
    } catch (err) {
      console.error('Error creating staff:', err);
      setError('Failed to create staff member: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, staffForm]);

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'businesses':
        return (
          <BusinessTab
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onBusinessSelect={handleBusinessSelect}
            onCreateBusiness={() => {/* TODO */}}
            onEditBusiness={() => {/* TODO */}}
            onDeleteBusiness={() => {/* TODO */}}
            loading={loading}
          />
        );
      case 'staff':
        return (
          <StaffTab
            staffMembers={staffMembers}
            selectedBusiness={selectedBusiness}
            onCreateStaff={() => setShowCreateStaffModal(true)}
            onEditStaff={() => {/* TODO */}}
            onDeleteStaff={() => {/* TODO */}}
            onResetPassword={() => {/* TODO */}}
            onToggleActivation={() => {/* TODO */}}
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
            onCategorySelect={() => {/* TODO */}}
            onCreateCategory={() => {/* TODO */}}
            onEditCategory={() => {/* TODO */}}
            onDeleteCategory={() => {/* TODO */}}
            onCreateProduct={() => {/* TODO */}}
            onEditProduct={() => {/* TODO */}}
            onDeleteProduct={() => {/* TODO */}}
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
            onVenueSelect={() => {/* TODO */}}
            onCreateVenue={() => {/* TODO */}}
            onEditVenue={() => {/* TODO */}}
            onDeleteVenue={() => {/* TODO */}}
            onCreateZone={() => {/* TODO */}}
            onEditZone={() => {/* TODO */}}
            onDeleteZone={() => {/* TODO */}}
            loading={venuesLoading}
          />
        );
      default:
        return null;
    }
  }, [activeTab, businesses, selectedBusiness, staffMembers, categories, selectedCategory, products, venues, selectedVenue, zones, loading, staffLoading, isMenuLoading, productsLoading, venuesLoading, handleBusinessSelect]);

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
    </div>
  );
}