import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import businessApi from '../services/businessApi';

// Utility function to normalize phone numbers (match backend format)
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

// Business Admin Dashboard - For Manager/Owner role
export default function BusinessAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  
  // Business data
  const [businessProfile, setBusinessProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Staff data
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  
  // Menu data
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  
  // Venues data
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(false);

  // Modal states
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showCreateVenueModal, setShowCreateVenueModal] = useState(false);
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingZone, setEditingZone] = useState(null);

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
    description: '',
    address: '',
    imageUrl: '',
    latitude: null,
    longitude: null,
    orderingEnabled: true
  });

  const [zoneForm, setZoneForm] = useState({
    name: '',
    zoneType: '',
    capacityPerUnit: 1,
    basePrice: 0
  });

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const role = localStorage.getItem('role');
      const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
      
      console.log('🔐 Business dashboard auth check:', { role, hasToken: !!token });
      
      // Debug JWT token contents
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔑 JWT Token Analysis:', {
            userId: payload.sub,
            email: payload.email,
            role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            businessId: payload.businessId,
            exp: new Date(payload.exp * 1000).toLocaleString(),
            isExpired: payload.exp * 1000 < Date.now()
          });
          
          // Check for critical missing claims
          if (!payload.businessId) {
            console.error('❌ CRITICAL: JWT token missing businessId claim');
            setError('Authentication error: Missing business context. Please re-login.');
          }
          
          const userRole = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          if (!userRole) {
            console.error('❌ CRITICAL: JWT token missing role claim');
            setError('Authentication error: Missing role information. Please re-login.');
          }
          
        } catch (err) {
          console.error('❌ Failed to parse JWT token:', err);
          setError('Authentication error: Invalid token. Please re-login.');
        }
      }
      
      if (!token || !['Manager', 'Owner'].includes(role)) {
        console.log('❌ Authentication failed - redirecting to login');
        localStorage.clear();
        navigate('/login');
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      fetchInitialData();
    }
  }, [navigate]);

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if we have businessId (required for business API calls)
      const businessId = localStorage.getItem('businessId');
      if (!businessId) {
        console.warn('⚠️ No businessId found in localStorage - business API calls may fail');
      }

      // Fetch business profile and dashboard data
      const [profile, dashboard] = await Promise.all([
        businessApi.profile.get().catch(err => {
          console.warn('Profile fetch failed:', err);
          if (err.status === 403) {
            console.warn('⚠️ Profile access denied - continuing without profile data');
            return null; // Continue without profile
          }
          if (err.message?.includes('CORS') || err.status === undefined) {
            throw new Error('Business API endpoints not available. Please contact your administrator.');
          }
          if (err.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          }
          return null;
        }),
        businessApi.dashboard.get().catch(err => {
          console.warn('Dashboard fetch failed:', err);
          if (err.status === 403) {
            console.warn('⚠️ Dashboard access denied - continuing without dashboard data');
            return null; // Continue without dashboard
          }
          if (err.message?.includes('CORS') || err.status === undefined) {
            throw new Error('Business API endpoints not available. Please contact your administrator.');
          }
          if (err.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          }
          return null;
        })
      ]);

      setBusinessProfile(profile);
      setDashboardData(dashboard);

      // Fetch staff data
      await fetchStaffMembers();

    } catch (err) {
      console.error('Error fetching initial data:', err);
      if (err.message?.includes('Business API endpoints not available')) {
        setError('Business management features are not yet available. The backend developer needs to implement the business-level API endpoints.');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Staff management functions
  const fetchStaffMembers = useCallback(async () => {
    try {
      setStaffLoading(true);
      const staff = await businessApi.staff.list();
      setStaffMembers(staff);
    } catch (err) {
      console.error('Error fetching staff:', err);
      if (err.status === 403) {
        console.warn('⚠️ Staff access denied - staff management will be disabled');
        setStaffMembers([]); // Empty array, don't show error
      } else {
        setError('Failed to load staff members');
      }
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    
    try {
      // Client-side validation
      if (!staffForm.email || !staffForm.password || !staffForm.phoneNumber || !staffForm.role || !staffForm.pin) {
        setError('Email, password, phone number, role, and PIN are required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(staffForm.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate password length
      if (staffForm.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Validate PIN format
      if (!/^\d{4}$/.test(staffForm.pin)) {
        setError('PIN must be exactly 4 digits');
        return;
      }

      // Validate role - use backend role names (Bartender, Collector match StaffController)
      const allowedRoles = ['Manager', 'Bartender', 'Collector'];
      if (!allowedRoles.includes(staffForm.role)) {
        setError(`Role must be one of: ${allowedRoles.join(', ')}`);
        return;
      }

      // Normalize phone number to match backend format (remove spaces, dashes, parentheses, plus signs)
      const normalizedPhone = normalizePhoneNumber(staffForm.phoneNumber);
      
      if (!normalizedPhone) {
        setError('Please enter a valid phone number');
        return;
      }

      const normalizedStaffForm = {
        ...staffForm,
        phoneNumber: normalizedPhone
      };
      
      console.log('📤 Creating staff with data:', {
        email: normalizedStaffForm.email,
        password: '************',
        phoneNumber: normalizedStaffForm.phoneNumber,
        fullName: normalizedStaffForm.fullName,
        role: normalizedStaffForm.role,
        pin: '****',
        isActive: normalizedStaffForm.isActive
      });

      // Call API
      await businessApi.staff.create(normalizedStaffForm);
      
      console.log('✅ Staff member created successfully');
      
      // Reset form and close modal
      setStaffForm({
        email: '',
        password: '',
        phoneNumber: '',
        fullName: '',
        role: '',
        pin: '',
        isActive: true
      });
      setShowCreateStaffModal(false);
      setError(null);
      
      // Refresh staff list
      await fetchStaffMembers();
      
    } catch (err) {
      console.error('❌ Error creating staff:', err);
      
      // Provide user-friendly error messages
      if (err.status === 403) {
        setError('Permission denied. Your account may not have the required permissions to create staff members. Please ensure you are logged in as a Manager or Business Owner.');
      } else if (err.status === 400) {
        setError(err.data?.message || err.data || 'Invalid data. Please check all fields and try again.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create staff member. Please try again.');
      }
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      // Normalize phone number to match backend format
      const normalizedStaffForm = {
        ...staffForm,
        phoneNumber: normalizePhoneNumber(staffForm.phoneNumber)
      };
      
      await businessApi.staff.update(editingStaff.id, normalizedStaffForm);
      
      // Reset form and close modal
      setStaffForm({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: '',
        pin: '',
        isActive: true
      });
      setEditingStaff(null);
      
      // Refresh staff list
      await fetchStaffMembers();
      
    } catch (err) {
      console.error('Error updating staff:', err);
      setError(`Failed to update staff member: ${err.data || err.message}`);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await businessApi.staff.delete(staffId);
      await fetchStaffMembers();
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError(`Failed to delete staff member: ${err.data || err.message}`);
    }
  };

  const handleActivateStaff = async (staffId) => {
    try {
      await businessApi.staff.activate(staffId);
      await fetchStaffMembers();
    } catch (err) {
      console.error('Error activating staff:', err);
      setError(`Failed to activate staff member: ${err.data || err.message}`);
    }
  };

  // Menu management functions
  const fetchCategories = useCallback(async () => {
    try {
      setMenuLoading(true);
      const cats = await businessApi.categories.list();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (categoryId) => {
    if (!categoryId) return;
    
    try {
      const prods = await businessApi.products.list(categoryId);
      setProducts(prods);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await businessApi.categories.create(categoryForm);
      
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      setShowCreateCategoryModal(false);
      
      await fetchCategories();
      
    } catch (err) {
      console.error('Error creating category:', err);
      setError(`Failed to create category: ${err.data || err.message}`);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await businessApi.products.create(selectedCategory.id, productForm);
      
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false
      });
      setShowCreateProductModal(false);
      
      await fetchProducts(selectedCategory.id);
      
    } catch (err) {
      console.error('Error creating product:', err);
      setError(`Failed to create product: ${err.data || err.message}`);
    }
  };

  const handleToggleProductAvailability = async (categoryId, productId) => {
    try {
      await businessApi.products.toggleAvailable(categoryId, productId);
      await fetchProducts(categoryId);
    } catch (err) {
      console.error('Error toggling product availability:', err);
      setError(`Failed to toggle product availability: ${err.data || err.message}`);
    }
  };

  // Venue management functions
  const fetchVenues = useCallback(async () => {
    try {
      setVenuesLoading(true);
      const venueList = await businessApi.venues.list();
      setVenues(venueList);
    } catch (err) {
      console.error('Error fetching venues:', err);
      if (err.status === 403) {
        console.warn('⚠️ Venues access denied - venue management will be disabled');
        setVenues([]);
      } else {
        setError('Failed to load venues');
      }
    } finally {
      setVenuesLoading(false);
    }
  }, []);

  const fetchZones = useCallback(async (venueId) => {
    if (!venueId) return;
    
    try {
      setZonesLoading(true);
      const zoneList = await businessApi.zones.list(venueId);
      setZones(zoneList);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setError('Failed to load zones');
    } finally {
      setZonesLoading(false);
    }
  }, []);

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    try {
      await businessApi.venues.create(venueForm);
      
      setVenueForm({
        name: '',
        type: '',
        description: '',
        address: '',
        imageUrl: '',
        latitude: null,
        longitude: null,
        orderingEnabled: true
      });
      setShowCreateVenueModal(false);
      
      await fetchVenues();
      
    } catch (err) {
      console.error('Error creating venue:', err);
      setError(`Failed to create venue: ${err.data || err.message}`);
    }
  };

  const handleEditVenue = async (e) => {
    e.preventDefault();
    if (!editingVenue) return;

    try {
      await businessApi.venues.update(editingVenue.id, venueForm);
      
      setVenueForm({
        name: '',
        type: '',
        description: '',
        address: '',
        imageUrl: '',
        latitude: null,
        longitude: null,
        orderingEnabled: true
      });
      setEditingVenue(null);
      
      await fetchVenues();
      
    } catch (err) {
      console.error('Error updating venue:', err);
      setError(`Failed to update venue: ${err.data || err.message}`);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!confirm('Are you sure you want to delete this venue? This will also delete all zones within it.')) return;

    try {
      await businessApi.venues.delete(venueId);
      await fetchVenues();
      
      // Clear selected venue if it was deleted
      if (selectedVenue?.id === venueId) {
        setSelectedVenue(null);
        setZones([]);
      }
    } catch (err) {
      console.error('Error deleting venue:', err);
      setError(`Failed to delete venue: ${err.data || err.message}`);
    }
  };

  const handleToggleVenueActive = async (venueId) => {
    try {
      await businessApi.venues.toggleActive(venueId);
      await fetchVenues();
    } catch (err) {
      console.error('Error toggling venue status:', err);
      setError(`Failed to toggle venue status: ${err.data || err.message}`);
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;

    try {
      const zoneData = {
        ...zoneForm,
        isActive: true // Set zones as active by default
      };
      
      console.log('📤 Creating zone with data:', {
        name: zoneData.name,
        zoneType: zoneData.zoneType,
        capacityPerUnit: zoneData.capacityPerUnit,
        capacityType: typeof zoneData.capacityPerUnit,
        basePrice: zoneData.basePrice,
        basePriceType: typeof zoneData.basePrice,
        isActive: zoneData.isActive
      });
      
      const response = await businessApi.zones.create(selectedVenue.id, zoneData);
      
      console.log('✅ Zone created successfully:', response);
      
      setZoneForm({
        name: '',
        zoneType: '',
        capacityPerUnit: 1,
        basePrice: 0
      });
      setShowCreateZoneModal(false);
      
      await fetchZones(selectedVenue.id);
      
    } catch (err) {
      console.error('❌ Error creating zone:', err);
      setError(`Failed to create zone: ${err.data || err.message}`);
    }
  };

  const handleEditZone = async (e) => {
    e.preventDefault();
    if (!editingZone || !selectedVenue) return;

    try {
      await businessApi.zones.update(selectedVenue.id, editingZone.id, zoneForm);
      
      setZoneForm({
        name: '',
        zoneType: '',
        capacityPerUnit: 1,
        basePrice: 0
      });
      setEditingZone(null);
      
      await fetchZones(selectedVenue.id);
      
    } catch (err) {
      console.error('Error updating zone:', err);
      setError(`Failed to update zone: ${err.data || err.message}`);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!confirm('Are you sure you want to delete this zone?') || !selectedVenue) return;

    try {
      await businessApi.zones.delete(selectedVenue.id, zoneId);
      await fetchZones(selectedVenue.id);
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError(`Failed to delete zone: ${err.data || err.message}`);
    }
  };

  // Form handlers
  const handleStaffFormChange = useCallback((field, value) => {
    setStaffForm(prev => ({ ...prev, [field]: value }));
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

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'staff' && staffMembers.length === 0) {
      fetchStaffMembers();
    } else if (activeTab === 'menu' && categories.length === 0) {
      fetchCategories();
    } else if (activeTab === 'venues' && venues.length === 0) {
      fetchVenues();
    }
  }, [activeTab, staffMembers.length, categories.length, venues.length, fetchStaffMembers, fetchCategories, fetchVenues]);

  // Load products when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory.id);
    }
  }, [selectedCategory, fetchProducts]);

  // Load zones when venue is selected
  useEffect(() => {
    if (selectedVenue) {
      fetchZones(selectedVenue.id);
    }
  }, [selectedVenue, fetchZones]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading Business Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Business Admin</h1>
            <p className="text-zinc-400 text-sm">
              {businessProfile?.name || 'Business Management Dashboard'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-300 hover:text-red-200 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-800">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'staff', label: 'Staff Management' },
              { id: 'menu', label: 'Menu Management' },
              { id: 'venues', label: 'Venues' },
              { id: 'qr-generator', label: 'QR Codes' },
              { id: 'debug', label: 'JWT Debug' }
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
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Business Overview</h2>
            
            {dashboardData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-400">
                    €{dashboardData.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Active Staff</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {staffMembers.filter(s => s.isActive).length}
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Menu Items</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    {products.length}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-lg p-6">
                <p className="text-zinc-400">Dashboard data will appear here once loaded.</p>
              </div>
            )}
          </div>
        )}

        {/* Staff Management Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Staff Management</h2>
              <button
                onClick={() => setShowCreateStaffModal(true)}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Add Staff Member
              </button>
            </div>

            {staffLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-zinc-400">Loading staff members...</p>
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                          Phone
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
                    <tbody className="divide-y divide-zinc-800">
                      {staffMembers.map((staff) => (
                        <tr key={staff.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {staff.fullName || 'Unnamed Staff'}
                              </div>
                              <div className="text-sm text-zinc-400">
                                ID: {staff.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-900/20 text-blue-400 rounded-full">
                              {staff.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                            {staff.phoneNumber || staff.email || 'No contact'}
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
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              staff.isActive 
                                ? 'bg-green-900/20 text-green-400' 
                                : 'bg-red-900/20 text-red-400'
                            }`}>
                              {staff.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => {
                                setEditingStaff(staff);
                                setStaffForm({
                                  email: staff.email || '',
                                  password: '', // Don't pre-fill password for security
                                  phoneNumber: staff.phoneNumber || '',
                                  fullName: staff.fullName || '',
                                  role: staff.role || '',
                                  pin: '',
                                  isActive: staff.isActive
                                });
                              }}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleActivateStaff(staff.id)}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              {staff.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff.id)}
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
                      <p className="text-zinc-400">No staff members found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Management Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Menu Management</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setShowCreateCategoryModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Category
                </button>
                {selectedCategory && (
                  <button
                    onClick={() => setShowCreateProductModal(true)}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Add Product
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Categories */}
              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                {menuLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-zinc-400 text-sm">Loading categories...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedCategory?.id === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            category.isActive
                              ? 'bg-green-900/20 text-green-400'
                              : 'bg-red-900/20 text-red-400'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {categories.length === 0 && (
                      <p className="text-zinc-400 text-center py-4">No categories found.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Products {selectedCategory && `- ${selectedCategory.name}`}
                </h3>
                {selectedCategory ? (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="p-3 bg-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-zinc-400">€{product.price}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleProductAvailability(selectedCategory.id, product.id)}
                              className={`px-2 py-1 text-xs rounded-full ${
                                product.isAvailable
                                  ? 'bg-green-900/20 text-green-400'
                                  : 'bg-red-900/20 text-red-400'
                              }`}
                            >
                              {product.isAvailable ? 'Available' : 'Unavailable'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {products.length === 0 && (
                      <p className="text-zinc-400 text-center py-4">No products in this category.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-4">Select a category to view products.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Venues Tab */}
        {activeTab === 'venues' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Venues & Zones</h2>
                <p className="text-zinc-400">Manage your business venues and zones</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          onClick={() => setSelectedVenue(venue)}
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
                              {venue.orderingEnabled ? '🛒 Ordering Enabled' : '🚫 Ordering Disabled'}
                            </span>
                            <div className="flex space-x-2">
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
                                    orderingEnabled: venue.orderingEnabled
                                  });
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete venue "${venue.name}"? This cannot be undone.`)) {
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
                          + Add Zone
                        </button>
                      )}
                    </div>

                    {!selectedVenue ? (
                      <p className="text-zinc-400 text-sm">Select a venue to view and manage zones.</p>
                    ) : zonesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {zones.map((zone) => (
                          <div key={zone.id} className="bg-zinc-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-white">{zone.name}</h4>
                                {zone.zoneType && <p className="text-sm text-zinc-400">{zone.zoneType}</p>}
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
                                Capacity: {zone.capacityPerUnit || 'N/A'} | Price: €{zone.basePrice || 0}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    // Navigate to unit creation for this zone
                                    navigate(`/admin/zones/${zone.id}/units`);
                                  }}
                                  className="text-green-400 hover:text-green-300 text-sm"
                                >
                                  Units
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingZone(zone);
                                    setZoneForm({
                                      name: zone.name,
                                      zoneType: zone.zoneType || '',
                                      capacityPerUnit: zone.capacityPerUnit || 1,
                                      basePrice: zone.basePrice || 0
                                    });
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete zone "${zone.name}"? This cannot be undone.`)) {
                                      handleDeleteZone(zone.id);
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
                        
                        {zones.length === 0 && (
                          <p className="text-zinc-400 text-sm">No zones found for this venue. Add one to get started.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Generator Tab */}
        {activeTab === 'qr-generator' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">QR Code Generator</h2>
                <p className="text-zinc-400 text-sm mt-1">Generate QR codes for sunbeds and tables</p>
              </div>
              <button
                onClick={() => navigate('/qr-generator')}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Open QR Generator
              </button>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Generate QR Codes</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                      Create unique QR codes for each sunbed and table in your venues. Customers can scan these codes to access the menu and place orders directly from their location.
                    </p>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                        View all QR codes for your venues
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                        Download individual QR codes as PNG
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                        Print all QR codes optimized for A4 paper
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JWT Debug Tab */}
        {activeTab === 'debug' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">JWT Token Debug</h2>
            <div className="bg-zinc-900 rounded-lg p-6">
              <JWTDebugPanel />
            </div>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      <AnimatePresence>
        {showCreateStaffModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateStaffModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Add Staff Member</h2>
              
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={staffForm.email}
                    onChange={(e) => handleStaffFormChange('email', e.target.value)}
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
                    onChange={(e) => handleStaffFormChange('password', e.target.value)}
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
                    onChange={(e) => handleStaffFormChange('phoneNumber', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={staffForm.fullName}
                    onChange={(e) => handleStaffFormChange('fullName', e.target.value)}
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
                        handleStaffFormChange('pin', value);
                      }
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none font-mono text-center text-lg tracking-widest"
                    placeholder="0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={staffForm.role}
                    onChange={(e) => handleStaffFormChange('role', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  >
                    <option value="">Select role</option>
                    <option value="Manager">Manager</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Collector">Collector</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="staffIsActive"
                    checked={staffForm.isActive}
                    onChange={(e) => handleStaffFormChange('isActive', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="staffIsActive" className="text-sm text-zinc-300">
                    Active Staff Member
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateStaffModal(false)}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Create Staff Member
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {editingStaff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingStaff(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit Staff Member</h2>
              
              <form onSubmit={handleEditStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={staffForm.email}
                    onChange={(e) => handleStaffFormChange('email', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    minLength="6"
                    value={staffForm.password}
                    onChange={(e) => handleStaffFormChange('password', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="Enter new password (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={staffForm.phoneNumber}
                    onChange={(e) => handleStaffFormChange('phoneNumber', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={staffForm.fullName}
                    onChange={(e) => handleStaffFormChange('fullName', e.target.value)}
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
                        handleStaffFormChange('pin', value);
                      }
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none font-mono text-center text-lg tracking-widest"
                    placeholder="0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={staffForm.role}
                    onChange={(e) => handleStaffFormChange('role', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  >
                    <option value="">Select role</option>
                    <option value="Manager">Manager</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Collector">Collector</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editStaffIsActive"
                    checked={staffForm.isActive}
                    onChange={(e) => handleStaffFormChange('isActive', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="editStaffIsActive" className="text-sm text-zinc-300">
                    Active Staff Member
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Update Staff Member
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Category Modal */}
      <AnimatePresence>
        {showCreateCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Add Category</h2>
              
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => handleCategoryFormChange('name', e.target.value)}
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
                    onChange={(e) => handleCategoryFormChange('sortOrder', parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="categoryIsActive"
                    checked={categoryForm.isActive}
                    onChange={(e) => handleCategoryFormChange('isActive', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="categoryIsActive" className="text-sm text-zinc-300">
                    Active Category
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateCategoryModal(false)}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Product Modal */}
      <AnimatePresence>
        {showCreateProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Add Product</h2>
              
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => handleProductFormChange('name', e.target.value)}
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
                      onChange={(e) => handleProductFormChange('price', parseFloat(e.target.value) || 0)}
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
                      onChange={(e) => handleProductFormChange('oldPrice', e.target.value ? parseFloat(e.target.value) : null)}
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
                      onChange={(e) => handleProductFormChange('imageUrl', e.target.value)}
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
                    onChange={(e) => handleProductFormChange('description', e.target.value)}
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
                      onChange={(e) => handleProductFormChange('isAvailable', e.target.checked)}
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
                      onChange={(e) => handleProductFormChange('isAlcohol', e.target.checked)}
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
                    onClick={() => setShowCreateProductModal(false)}
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

      {/* Create Venue Modal */}
      <AnimatePresence>
        {showCreateVenueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateVenueModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Create New Venue</h3>
              <form onSubmit={handleCreateVenue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueForm.name}
                    onChange={(e) => handleVenueFormChange('name', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., Beach Club, Pool Bar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Type
                  </label>
                  <input
                    type="text"
                    value={venueForm.type}
                    onChange={(e) => handleVenueFormChange('type', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., Beach, Pool, Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={venueForm.description}
                    onChange={(e) => handleVenueFormChange('description', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    rows="3"
                    placeholder="Brief description of the venue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={venueForm.address}
                    onChange={(e) => handleVenueFormChange('address', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={venueForm.imageUrl}
                    onChange={(e) => handleVenueFormChange('imageUrl', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={venueForm.latitude || ''}
                      onChange={(e) => handleVenueFormChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                      placeholder="e.g., 41.3275"
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
                      onChange={(e) => handleVenueFormChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                      placeholder="e.g., 19.8187"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="venueOrderingEnabled"
                    checked={venueForm.orderingEnabled}
                    onChange={(e) => handleVenueFormChange('orderingEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="venueOrderingEnabled" className="text-sm text-zinc-300">
                    Enable Ordering
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateVenueModal(false)}
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

      {/* Edit Venue Modal */}
      <AnimatePresence>
        {editingVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingVenue(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Edit Venue</h3>
              <form onSubmit={handleEditVenue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueForm.name}
                    onChange={(e) => handleVenueFormChange('name', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., Beach Club, Pool Bar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Type
                  </label>
                  <input
                    type="text"
                    value={venueForm.type}
                    onChange={(e) => handleVenueFormChange('type', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., Beach, Pool, Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={venueForm.description}
                    onChange={(e) => handleVenueFormChange('description', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    rows="3"
                    placeholder="Brief description of the venue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={venueForm.address}
                    onChange={(e) => handleVenueFormChange('address', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={venueForm.imageUrl}
                    onChange={(e) => handleVenueFormChange('imageUrl', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={venueForm.latitude || ''}
                      onChange={(e) => handleVenueFormChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                      placeholder="e.g., 41.3275"
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
                      onChange={(e) => handleVenueFormChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                      placeholder="e.g., 19.8187"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editVenueOrderingEnabled"
                    checked={venueForm.orderingEnabled}
                    onChange={(e) => handleVenueFormChange('orderingEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="editVenueOrderingEnabled" className="text-sm text-zinc-300">
                    Enable Ordering
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingVenue(null)}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Update Venue
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Zone Modal */}
      <AnimatePresence>
        {showCreateZoneModal && selectedVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateZoneModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Create New Zone for {selectedVenue.name}</h3>
              <form onSubmit={handleCreateZone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., VIP Section, Pool Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Zone Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={zoneForm.zoneType}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, zoneType: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., Sunbed, Table, Cabana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Capacity Per Unit *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={zoneForm.capacityPerUnit}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, capacityPerUnit: parseInt(e.target.value) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Base Price (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={zoneForm.basePrice}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., 50.00"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateZoneModal(false)}
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

      {/* Edit Zone Modal */}
      <AnimatePresence>
        {editingZone && selectedVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingZone(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Edit Zone</h3>
              <form onSubmit={handleEditZone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., VIP Section, Pool Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Zone Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={zoneForm.zoneType}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, zoneType: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., Sunbed, Table, Cabana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Capacity Per Unit *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={zoneForm.capacityPerUnit}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, capacityPerUnit: parseInt(e.target.value) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Base Price (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={zoneForm.basePrice}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., 50.00"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingZone(null)}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Update Zone
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// JWT Debug Panel Component
function JWTDebugPanel() {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    analyzeToken();
  }, []);

  const analyzeToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
    
    if (!token) {
      setTokenInfo({ error: 'No token found in localStorage' });
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      // Analyze token
      const analysis = {
        header,
        payload,
        isExpired: payload.exp ? new Date(payload.exp * 1000) < new Date() : false,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiration',
        timeLeft: payload.exp ? Math.max(0, Math.floor((new Date(payload.exp * 1000) - new Date()) / 1000 / 60)) : null,
        issues: []
      };

      // Extract role from Microsoft claim format or simple format
      const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      // Check for issues
      if (!payload.businessId) {
        analysis.issues.push('Missing businessId claim - business API calls will fail');
      }
      if (!role || !['Owner', 'Manager', 'Waiter', 'Bartender', 'Guest'].includes(role)) {
        analysis.issues.push(`Invalid role: ${role || 'undefined'}`);
      }
      
      // Add role to analysis for display
      analysis.role = role;
      if (analysis.isExpired) {
        analysis.issues.push('Token is expired');
      }

      setTokenInfo(analysis);
    } catch (error) {
      setTokenInfo({ error: `Failed to decode token: ${error.message}` });
    }
  };

  const testBusinessEndpoints = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('azure_jwt_token');
    if (!token) return;

    setTesting(true);
    setTestResults([]);

    const endpoints = [
      { url: '/business/Profile', name: 'Business Profile' },
      { url: '/business/Dashboard', name: 'Business Dashboard' },
      { url: '/business/Staff', name: 'Staff Management' },
      { url: '/business/Categories', name: 'Categories' },
      { url: '/business/Venues', name: 'Venues' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api${endpoint.url}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          error: response.ok ? null : await response.text()
        });

      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          statusText: 'Network Error',
          success: false,
          error: error.message
        });
      }

      setTestResults([...results]);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
    }

    setTesting(false);
  };

  if (!tokenInfo) {
    return <div className="text-zinc-400">Loading token analysis...</div>;
  }

  if (tokenInfo.error) {
    return (
      <div className="space-y-4">
        <div className="text-red-400">❌ {tokenInfo.error}</div>
        <button 
          onClick={analyzeToken}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Token Claims</h3>
          <div className="bg-zinc-800 rounded-lg p-4 font-mono text-sm space-y-2">
            <div><span className="text-purple-400">sub:</span> <span className="text-yellow-400">{tokenInfo.payload.sub}</span></div>
            <div><span className="text-purple-400">role:</span> <span className="text-yellow-400">{tokenInfo.role || tokenInfo.payload.role || tokenInfo.payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'undefined'}</span></div>
            <div><span className="text-purple-400">businessId:</span> <span className="text-yellow-400">{tokenInfo.payload.businessId || 'undefined'}</span></div>
            <div><span className="text-purple-400">userId:</span> <span className="text-yellow-400">{tokenInfo.payload.userId}</span></div>
            <div><span className="text-purple-400">email:</span> <span className="text-yellow-400">{tokenInfo.payload.email}</span></div>
            <div><span className="text-purple-400">fullName:</span> <span className="text-yellow-400">{tokenInfo.payload.fullName}</span></div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Token Status</h3>
          <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${tokenInfo.isExpired ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span>{tokenInfo.isExpired ? 'Expired' : 'Valid'}</span>
            </div>
            <div className="text-sm text-zinc-400">
              Expires: {tokenInfo.expiresAt}
            </div>
            {tokenInfo.timeLeft !== null && !tokenInfo.isExpired && (
              <div className="text-sm text-zinc-400">
                Time left: {tokenInfo.timeLeft} minutes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issues */}
      {tokenInfo.issues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-400">Issues Found</h3>
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            {tokenInfo.issues.map((issue, index) => (
              <div key={index} className="text-red-400">❌ {issue}</div>
            ))}
          </div>
        </div>
      )}

      {/* API Testing */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-400">API Endpoint Testing</h3>
          <button
            onClick={testBusinessEndpoints}
            disabled={testing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Business APIs'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-zinc-400">{result.url}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.status} {result.statusText}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-400 mt-1 max-w-xs truncate">
                      {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Troubleshooting Guide */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-yellow-400">Troubleshooting 403 Errors</h3>
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 text-sm space-y-2">
          <div>💡 <strong>Common causes of 403 Forbidden errors:</strong></div>
          <div>• Missing <code className="bg-zinc-700 px-1 rounded">businessId</code> claim in JWT token</div>
          <div>• Backend authorization rules don't allow Manager role for business endpoints</div>
          <div>• Business not properly associated with user account in database</div>
          <div>• Token issued before business association was created</div>
          <div className="mt-3">
            <strong>Solutions:</strong>
          </div>
          <div>• Re-login to get fresh token with businessId claim</div>
          <div>• Check backend logs for detailed authorization errors</div>
          <div>• Verify business-user association in database</div>
          <div>• Contact backend developer to check Manager role permissions</div>
        </div>
      </div>
    </div>
  );
}