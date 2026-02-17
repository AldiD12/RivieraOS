import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { businessApi, staffApi, venueApi, zoneApi, categoryApi, productApi, unitApi } from '../services/superAdminApi.js';
import { CreateVenueModal, EditVenueModal } from '../components/dashboard/modals/VenueModals.jsx';
import { CreateZoneModal, EditZoneModal } from '../components/dashboard/modals/ZoneModals.jsx';
import { CreateStaffModal, EditStaffModal, ResetPasswordModal } from '../components/dashboard/modals/StaffModals.jsx';
import { CreateBusinessModal, EditBusinessModal } from '../components/dashboard/modals/BusinessModals.jsx';
import { CreateCategoryModal, EditCategoryModal } from '../components/dashboard/modals/CategoryModals.jsx';
import { CreateProductModal, EditProductModal } from '../components/dashboard/modals/ProductModals.jsx';

// Utility function to normalize phone numbers (match backend format)
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

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
  const navigate = useNavigate();
  
  // Core state
  const [activeTab, setActiveTab] = useState('overview');
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
  
  // Venue exclusion state
  const [categoryExcludedVenues, setCategoryExcludedVenues] = useState([]);
  const [productExcludedVenues, setProductExcludedVenues] = useState([]);
  const [loadingExclusions, setLoadingExclusions] = useState(false);
  
  // Units state
  const [selectedZone, setSelectedZone] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  
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
    isAlcohol: false,
    categoryId: '' // Add categoryId for dropdown
  });

  const [venueForm, setVenueForm] = useState({
    name: '',
    type: '',
    description: '',
    address: '',
    imageUrl: '',
    latitude: null,
    longitude: null,
    orderingEnabled: true,
    googlePlaceId: ''
  });

  const [zoneForm, setZoneForm] = useState({
    name: '',
    type: '',
    description: '',
    capacity: 0,
    sortOrder: 0,
    isActive: true
  });

  const [bulkUnitForm, setBulkUnitForm] = useState({
    prefix: '',
    startNumber: 1,
    count: 10,
    unitType: 'Sunbed',
    basePrice: 0
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
      const newCategory = await categoryApi.business.create(selectedBusiness.id, categoryForm);
      
      // Set exclusions for new category
      if (categoryExcludedVenues.length > 0) {
        await categoryApi.business.setExclusions(selectedBusiness.id, newCategory.id, categoryExcludedVenues);
      }
      
      setShowCreateCategoryModal(false);
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      setCategoryExcludedVenues([]);
      await fetchMenuForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, categoryForm, categoryExcludedVenues, fetchMenuForBusiness]);

  const handleUpdateCategory = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id || !editingCategory) return;
    
    try {
      // Update category data
      await categoryApi.business.update(selectedBusiness.id, editingCategory.id, categoryForm);
      
      // Update exclusions
      await categoryApi.business.setExclusions(selectedBusiness.id, editingCategory.id, categoryExcludedVenues);
      
      setShowEditCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      setCategoryExcludedVenues([]);
      await fetchMenuForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingCategory, categoryForm, categoryExcludedVenues, fetchMenuForBusiness]);

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
    
    // Use categoryId from form (allows changing category in modal)
    const categoryId = productForm.categoryId || selectedCategory?.id;
    
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    
    try {
      const newProduct = await productApi.create(categoryId, productForm);
      
      // Set exclusions for new product
      if (productExcludedVenues.length > 0) {
        await productApi.setExclusions(categoryId, newProduct.id, productExcludedVenues);
      }
      
      setShowCreateProductModal(false);
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false,
        categoryId: ''
      });
      setProductExcludedVenues([]);
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(categoryId);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product: ' + (err.response?.data?.message || err.message));
    }
  }, [productForm, selectedCategory, productExcludedVenues]);

  const handleUpdateProduct = useCallback(async (e) => {
    e.preventDefault();
    
    // Use categoryId from form (allows changing category in modal)
    const categoryId = productForm.categoryId || selectedCategory?.id;
    
    if (!categoryId || !editingProduct) {
      setError('Please select a category');
      return;
    }
    
    try {
      // Update product data
      await productApi.update(categoryId, editingProduct.id, productForm);
      
      // Update exclusions
      await productApi.setExclusions(categoryId, editingProduct.id, productExcludedVenues);
      
      setShowEditProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false,
        categoryId: ''
      });
      setProductExcludedVenues([]);
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(categoryId);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product: ' + (err.response?.data?.message || err.message));
    }
  }, [productForm, selectedCategory, editingProduct]);

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

  // Exclusion management functions
  const fetchCategoryExclusions = useCallback(async (businessId, categoryId) => {
    try {
      setLoadingExclusions(true);
      const exclusions = await categoryApi.business.getExclusions(businessId, categoryId);
      setCategoryExcludedVenues(exclusions.map(e => e.venueId));
    } catch (err) {
      console.error('Error fetching category exclusions:', err);
      setCategoryExcludedVenues([]);
    } finally {
      setLoadingExclusions(false);
    }
  }, []);

  const fetchProductExclusions = useCallback(async (categoryId, productId) => {
    try {
      setLoadingExclusions(true);
      const exclusions = await productApi.getExclusions(categoryId, productId);
      setProductExcludedVenues(exclusions.map(e => e.venueId));
    } catch (err) {
      console.error('Error fetching product exclusions:', err);
      setProductExcludedVenues([]);
    } finally {
      setLoadingExclusions(false);
    }
  }, []);

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
        description: '',
        address: '',
        imageUrl: '',
        latitude: null,
        longitude: null,
        orderingEnabled: true,
        googlePlaceId: ''
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
        description: '',
        address: '',
        imageUrl: '',
        latitude: null,
        longitude: null,
        orderingEnabled: true,
        googlePlaceId: ''
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

  const handleToggleZoneActive = useCallback(async (zoneId) => {
    if (!selectedVenue) return;
    
    try {
      await zoneApi.toggleActive(selectedVenue.id, zoneId);
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('Error toggling zone active status:', err);
      setError('Failed to toggle zone: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue]);

  // Units Management Functions
  const fetchUnitsForZone = useCallback(async (venueId, zoneId) => {
    if (!venueId || !zoneId) return;
    
    setUnitsLoading(true);
    try {
      const unitData = await unitApi.getByVenue(venueId, { zoneId });
      setUnits(Array.isArray(unitData) ? unitData : []);
      setError('');
    } catch (err) {
      console.error('Error fetching units:', err);
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  }, []);

  const handleZoneSelect = useCallback((zone) => {
    setSelectedZone(zone);
    if (selectedVenue) {
      fetchUnitsForZone(selectedVenue.id, zone.id);
    }
  }, [selectedVenue, fetchUnitsForZone]);

  const handleBulkCreateUnits = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVenue || !selectedZone) return;
    
    try {
      await unitApi.bulkCreate(selectedVenue.id, {
        venueZoneId: selectedZone.id,
        ...bulkUnitForm
      });
      setShowBulkCreateModal(false);
      setBulkUnitForm({
        prefix: '',
        startNumber: 1,
        count: 10,
        unitType: 'Sunbed',
        basePrice: 0
      });
      await fetchUnitsForZone(selectedVenue.id, selectedZone.id);
      setError('');
    } catch (err) {
      console.error('Error bulk creating units:', err);
      setError('Failed to create units: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue, selectedZone, bulkUnitForm, fetchUnitsForZone]);

  const handleDeleteUnit = useCallback(async (unitId) => {
    if (!selectedVenue || !selectedZone) return;
    if (!confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await unitApi.delete(selectedVenue.id, unitId);
      await fetchUnitsForZone(selectedVenue.id, selectedZone.id);
      setError('');
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue, selectedZone, fetchUnitsForZone]);

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Platform Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Total Businesses</h3>
                <p className="text-3xl font-bold text-blue-400">
                  {businesses.length}
                </p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Active Businesses</h3>
                <p className="text-3xl font-bold text-green-400">
                  {businesses.filter(b => b.isActive).length}
                </p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Total Staff</h3>
                <p className="text-3xl font-bold text-purple-400">
                  {staffMembers.length}
                </p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Total Venues</h3>
                <p className="text-3xl font-bold text-amber-400">
                  {venues.length}
                </p>
              </div>
            </div>

            {/* Quick Access Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/bar')}
                  className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 rounded-lg p-6 text-left transition-all"
                >
                  <div className="text-2xl mb-2">🍹</div>
                  <h4 className="text-lg font-semibold mb-1 text-white">Bar Display</h4>
                  <p className="text-sm text-zinc-400">Kitchen/Bar order queue screen</p>
                </button>
                
                <button
                  onClick={() => navigate('/collector')}
                  className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 rounded-lg p-6 text-left transition-all"
                >
                  <div className="text-2xl mb-2">🏖️</div>
                  <h4 className="text-lg font-semibold mb-1 text-white">Collector Dashboard</h4>
                  <p className="text-sm text-zinc-400">Manage bookings and reservations</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('qr-generator')}
                  className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 rounded-lg p-6 text-left transition-all"
                >
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="text-lg font-semibold mb-1 text-white">QR Code Generator</h4>
                  <p className="text-sm text-zinc-400">Generate QR codes for zones</p>
                </button>
              </div>
            </div>

            {/* Business Selector Hint */}
            {!selectedBusiness && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-blue-300">
                  💡 Select a business from the Businesses tab to manage its staff, menu, and venues.
                </p>
              </div>
            )}
          </div>
        );

      case 'qr-generator':
        if (!selectedBusiness) {
          return (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-lg mb-4">Please select a business first</p>
              <button
                onClick={() => setActiveTab('businesses')}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Go to Businesses
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">QR Code Generator</h2>
                <p className="text-zinc-400 mt-1">
                  Business: {selectedBusiness.brandName || selectedBusiness.registeredName}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <p className="text-zinc-300 mb-4">
                Generate QR codes for zones and units. Customers can scan these to access menus and make orders/bookings.
              </p>
              
              {venues.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">No venues found for this business</p>
                  <button
                    onClick={() => setActiveTab('venues')}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Create Venue First
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500">
                    Navigate to Venues & Zones tab to generate QR codes for specific zones and units.
                  </p>
                  <button
                    onClick={() => setActiveTab('venues')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to Venues & Zones
                  </button>
                </div>
              )}
            </div>
          </div>
        );

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
            onEditCategory={async (category) => {
              setEditingCategory(category);
              setCategoryForm({
                name: category.name || '',
                sortOrder: category.sortOrder || 0,
                isActive: category.isActive
              });
              setShowEditCategoryModal(true);
              if (selectedBusiness?.id) {
                await fetchCategoryExclusions(selectedBusiness.id, category.id);
              }
            }}
            onDeleteCategory={handleDeleteCategory}
            onCreateProduct={() => {
              // Pre-fill categoryId with selected category
              setProductForm({
                name: '',
                description: '',
                imageUrl: '',
                price: 0,
                oldPrice: null,
                isAvailable: true,
                isAlcohol: false,
                categoryId: selectedCategory?.id || ''
              });
              setShowCreateProductModal(true);
            }}
            onEditProduct={async (product) => {
              setEditingProduct(product);
              setProductForm({
                name: product.name || '',
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                price: product.price || 0,
                oldPrice: product.oldPrice || null,
                isAvailable: product.isAvailable,
                isAlcohol: product.isAlcohol,
                categoryId: product.categoryId || selectedCategory?.id || ''
              });
              setShowEditProductModal(true);
              const categoryId = product.categoryId || selectedCategory?.id;
              if (categoryId) {
                await fetchProductExclusions(categoryId, product.id);
              }
            }}
            onDeleteProduct={handleDeleteProduct}
            isMenuLoading={isMenuLoading}
            productsLoading={productsLoading}
          />
        );
      case 'venues':
        if (!selectedBusiness) {
          return (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-lg mb-4">Please select a business first</p>
              <button
                onClick={() => setActiveTab('businesses')}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Go to Businesses
              </button>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Venues & Zones</h2>
                <p className="text-zinc-400">
                  Business: {selectedBusiness.brandName || selectedBusiness.registeredName}
                </p>
              </div>
              <button
                onClick={() => setShowCreateVenueModal(true)}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                + Create Venue
              </button>
            </div>

            {venuesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Venues Column */}
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
                          onClick={() => handleVenueSelect(venue)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{venue.name}</h4>
                              {venue.type && <p className="text-sm opacity-75">{venue.type}</p>}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              venue.isActive 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {venue.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          {venue.address && (
                            <p className="text-sm opacity-75 mb-2">{venue.address}</p>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              {venue.orderingEnabled ? '🛒 Ordering' : '🚫 No Ordering'}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/venues/${venue.id}/mapper`);
                                }}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                                title="Visual Mapper"
                              >
                                🗺️
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingVenue(venue);
                                  setVenueForm({
                                    name: venue.name,
                                    type: venue.type || '',
                                    description: venue.description || '',
                                    address: venue.address || '',
                                    imageUrl: venue.imageUrl || '',
                                    latitude: venue.latitude,
                                    longitude: venue.longitude,
                                    orderingEnabled: venue.orderingEnabled,
                                    googlePlaceId: venue.googlePlaceId || ''
                                  });
                                  setShowEditVenueModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete "${venue.name}"?`)) {
                                    handleDeleteVenue(venue.id);
                                  }
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

                {/* Zones Column */}
                <div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Zones {selectedVenue && `- ${selectedVenue.name}`}
                      </h3>
                      {selectedVenue && (
                        <button
                          onClick={() => setShowCreateZoneModal(true)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          + Zone
                        </button>
                      )}
                    </div>

                    {!selectedVenue ? (
                      <p className="text-zinc-400 text-sm">Select a venue to view zones</p>
                    ) : venuesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {zones.map((zone) => (
                          <div 
                            key={zone.id} 
                            className={`p-4 rounded cursor-pointer transition-colors ${
                              selectedZone?.id === zone.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-700 hover:bg-zinc-600'
                            }`}
                            onClick={() => handleZoneSelect(zone)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-white">{zone.name}</h4>
                                <p className="text-sm text-zinc-400">{zone.zoneType}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleZoneActive(zone.id);
                                  }}
                                  className={`text-sm ${
                                    zone.isActive 
                                      ? 'text-yellow-400 hover:text-yellow-300' 
                                      : 'text-green-400 hover:text-green-300'
                                  }`}
                                >
                                  {zone.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingZone(zone);
                                    setZoneForm({
                                      name: zone.name,
                                      zoneType: zone.zoneType || '',
                                      capacityPerUnit: zone.capacityPerUnit || 1,
                                      basePrice: zone.basePrice || 0,
                                      prefix: zone.prefix || ''
                                    });
                                    setShowEditZoneModal(true);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete zone "${zone.name}"?`)) {
                                      handleDeleteZone(zone.id);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-zinc-400">
                              <p>Capacity: {zone.capacityPerUnit} per unit</p>
                              <p>Base Price: €{zone.basePrice}</p>
                              {zone.units && <p>Units: {zone.units.length}</p>}
                            </div>
                          </div>
                        ))}
                        
                        {zones.length === 0 && (
                          <p className="text-zinc-400 text-sm">No zones found. Create one to get started.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Units Column */}
                <div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Units {selectedZone && `- ${selectedZone.name}`}
                      </h3>
                      {selectedZone && (
                        <button
                          onClick={() => setShowBulkCreateModal(true)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          + Bulk Create
                        </button>
                      )}
                    </div>

                    {!selectedZone ? (
                      <p className="text-zinc-400 text-sm">Select a zone to view units</p>
                    ) : unitsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-zinc-900 rounded p-3">
                            <p className="text-xs text-zinc-400">Total</p>
                            <p className="text-2xl font-bold">{units.length}</p>
                          </div>
                          <div className="bg-zinc-900 rounded p-3">
                            <p className="text-xs text-zinc-400">Available</p>
                            <p className="text-2xl font-bold text-green-400">
                              {units.filter(u => u.status === 'Available').length}
                            </p>
                          </div>
                          <div className="bg-zinc-900 rounded p-3">
                            <p className="text-xs text-zinc-400">Occupied</p>
                            <p className="text-2xl font-bold text-blue-400">
                              {units.filter(u => u.status === 'Occupied' || u.status === 'Reserved').length}
                            </p>
                          </div>
                        </div>

                        {/* Units Grid */}
                        <div className="max-h-[500px] overflow-y-auto">
                          {units.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-zinc-400 text-sm mb-3">No units created yet.</p>
                              <button
                                onClick={() => setShowBulkCreateModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Create First Units
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {units.map((unit) => (
                                <div
                                  key={unit.id}
                                  className="bg-zinc-700 rounded p-3 hover:bg-zinc-600 transition-colors"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-bold text-white">{unit.unitCode}</p>
                                      <p className="text-xs text-zinc-400">{unit.unitType}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Delete unit "${unit.unitCode}"?`)) {
                                          handleDeleteUnit(unit.id);
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <span className={`text-xs px-2 py-0.5 rounded inline-block ${
                                      unit.status === 'Available' ? 'bg-green-900 text-green-300' :
                                      unit.status === 'Occupied' ? 'bg-red-900 text-red-300' :
                                      unit.status === 'Reserved' ? 'bg-yellow-900 text-yellow-300' :
                                      'bg-gray-900 text-gray-300'
                                    }`}>
                                      {unit.status}
                                    </span>
                                    <p className="text-xs text-zinc-400">€{unit.basePrice}</p>
                                    {unit.currentBooking && (
                                      <p className="text-xs text-yellow-400 truncate">
                                        {unit.currentBooking.guestName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, businesses, selectedBusiness, staffMembers, categories, selectedCategory, products, venues, selectedVenue, zones, selectedZone, units, loading, staffLoading, isMenuLoading, productsLoading, venuesLoading, unitsLoading, handleBusinessSelect, handleDeleteBusiness, handleDeleteStaff, handleToggleStaffActivation, handleCategorySelect, handleDeleteCategory, handleDeleteProduct, handleVenueSelect, handleDeleteVenue, handleDeleteZone, handleZoneSelect, handleDeleteUnit]);

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
              { id: 'overview', label: 'Overview' },
              { id: 'businesses', label: 'Businesses' },
              { id: 'staff', label: 'Staff Management' },
              { id: 'menu', label: 'Menu Management' },
              { id: 'venues', label: 'Venues & Zones' },
              { id: 'qr-generator', label: 'QR Codes' }
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
        isSuperAdmin={true}
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
        isSuperAdmin={true}
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
        onClose={() => {
          setShowCreateCategoryModal(false);
          setCategoryExcludedVenues([]);
        }}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleCreateCategory}
        venues={venues}
        excludedVenueIds={categoryExcludedVenues}
        onExclusionsChange={setCategoryExcludedVenues}
        loadingVenues={venuesLoading}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false);
          setEditingCategory(null);
          setCategoryExcludedVenues([]);
        }}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleUpdateCategory}
        venues={venues}
        excludedVenueIds={categoryExcludedVenues}
        onExclusionsChange={setCategoryExcludedVenues}
        loadingVenues={loadingExclusions}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => {
          setShowCreateProductModal(false);
          setProductExcludedVenues([]);
        }}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleCreateProduct}
        categories={categories}
        venues={venues}
        excludedVenueIds={productExcludedVenues}
        onExclusionsChange={setProductExcludedVenues}
        loadingVenues={venuesLoading}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => {
          setShowEditProductModal(false);
          setEditingProduct(null);
          setProductExcludedVenues([]);
        }}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleUpdateProduct}
        categories={categories}
        venues={venues}
        excludedVenueIds={productExcludedVenues}
        onExclusionsChange={setProductExcludedVenues}
        loadingVenues={loadingExclusions}
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

      {/* Bulk Create Units Modal */}
      {showBulkCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-4">Bulk Create Units</h2>
            <form onSubmit={handleBulkCreateUnits} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Unit Type
                </label>
                <select
                  value={bulkUnitForm.unitType}
                  onChange={(e) => setBulkUnitForm(prev => ({ ...prev, unitType: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  required
                >
                  <option value="Sunbed">Sunbed</option>
                  <option value="Cabana">Cabana</option>
                  <option value="Umbrella">Umbrella</option>
                  <option value="Table">Table</option>
                  <option value="Lounge">Lounge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Prefix *
                </label>
                <input
                  type="text"
                  value={bulkUnitForm.prefix}
                  onChange={(e) => setBulkUnitForm(prev => ({ ...prev, prefix: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  placeholder="e.g., A, VIP, POOL"
                  required
                  maxLength={10}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Required. Example: Prefix "A" + Start 1 = A1, A2, A3...
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={bulkUnitForm.startNumber}
                    onChange={(e) => setBulkUnitForm(prev => ({ ...prev, startNumber: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Count
                  </label>
                  <input
                    type="number"
                    value={bulkUnitForm.count}
                    onChange={(e) => setBulkUnitForm(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Base Price (€)
                </label>
                <input
                  type="number"
                  value={bulkUnitForm.basePrice}
                  onChange={(e) => setBulkUnitForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded p-3">
                <p className="text-sm text-zinc-400 mb-2">Preview:</p>
                <p className="text-white font-mono text-sm">
                  {bulkUnitForm.prefix}{bulkUnitForm.startNumber}, {bulkUnitForm.prefix}{bulkUnitForm.startNumber + 1}, {bulkUnitForm.prefix}{bulkUnitForm.startNumber + 2}...
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Will create {bulkUnitForm.count} units
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Create Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

