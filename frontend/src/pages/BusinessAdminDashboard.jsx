import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import businessApi from '../services/businessApi';
import { CreateVenueModal, EditVenueModal } from '../components/dashboard/modals/VenueModals';
import { CreateZoneModal, EditZoneModal } from '../components/dashboard/modals/ZoneModals';
import { CreateStaffModal, EditStaffModal, ResetPasswordModal } from '../components/dashboard/modals/StaffModals';
import { CreateCategoryModal, EditCategoryModal } from '../components/dashboard/modals/CategoryModals';
import { CreateProductModal, EditProductModal } from '../components/dashboard/modals/ProductModals';

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or default to dark
    const saved = localStorage.getItem('businessDashboardTheme');
    return saved ? saved === 'dark' : true;
  });
  
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
  
  // Venue exclusion data
  const [categoryExcludedVenues, setCategoryExcludedVenues] = useState([]);
  const [productExcludedVenues, setProductExcludedVenues] = useState([]);
  const [loadingExclusions, setLoadingExclusions] = useState(false);

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
    isActive: true,
    venueId: null,
    venues: []
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
    categoryId: null
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
    googlePlaceId: '',
    isDigitalOrderingEnabled: null
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
        isActive: true,
        venueId: null,
        venues: []
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
        isActive: true,
        venueId: null,
        venues: []
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
      const newCategory = await businessApi.categories.create(categoryForm);
      
      // Set exclusions for new category
      if (categoryExcludedVenues.length > 0) {
        await businessApi.categories.setExclusions(newCategory.id, categoryExcludedVenues);
      }
      
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      setCategoryExcludedVenues([]);
      setShowCreateCategoryModal(false);
      
      await fetchCategories();
      
    } catch (err) {
      console.error('Error creating category:', err);
      setError(`Failed to create category: ${err.data || err.message}`);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      // Update category data
      await businessApi.categories.update(editingCategory.id, categoryForm);
      
      // Update exclusions
      await businessApi.categories.setExclusions(editingCategory.id, categoryExcludedVenues);
      
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      setCategoryExcludedVenues([]);
      setEditingCategory(null);
      
      await fetchCategories();
      
    } catch (err) {
      console.error('Error updating category:', err);
      setError(`Failed to update category: ${err.data || err.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? All products in this category will also be deleted.')) return;

    try {
      await businessApi.categories.delete(categoryId);
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setProducts([]);
      }
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(`Failed to delete category: ${err.data || err.message}`);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const newProduct = await businessApi.products.create(selectedCategory.id, productForm);
      
      // Set exclusions for new product
      if (productExcludedVenues.length > 0) {
        await businessApi.products.setExclusions(selectedCategory.id, newProduct.id, productExcludedVenues);
      }
      
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false
      });
      setProductExcludedVenues([]);
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

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !editingProduct) return;

    try {
      console.log('🔄 Updating product:', {
        categoryId: selectedCategory.id,
        productId: editingProduct.id,
        productData: productForm,
        excludedVenues: productExcludedVenues
      });

      // Update product data
      await businessApi.products.update(selectedCategory.id, editingProduct.id, productForm);
      console.log('✅ Product data updated successfully');
      
      // Update exclusions
      console.log('🔄 Setting product exclusions:', productExcludedVenues);
      await businessApi.products.setExclusions(selectedCategory.id, editingProduct.id, productExcludedVenues);
      console.log('✅ Product exclusions updated successfully');
      
      // Verify exclusions were saved
      const savedExclusions = await businessApi.products.getExclusions(selectedCategory.id, editingProduct.id);
      console.log('🔍 Verified saved exclusions:', savedExclusions);
      
      await fetchProducts(selectedCategory.id);
      setEditingProduct(null);
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
      setProductExcludedVenues([]);
      
      console.log('✅ Product update complete');
    } catch (err) {
      console.error('❌ Error updating product:', err);
      setError(`Failed to update product: ${err.data || err.message}`);
    }
  };

  const handleDeleteProduct = async (categoryId, productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await businessApi.products.delete(categoryId, productId);
      await fetchProducts(categoryId);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(`Failed to delete product: ${err.data || err.message}`);
    }
  };

  // Exclusion management functions
  const fetchCategoryExclusions = async (categoryId) => {
    try {
      setLoadingExclusions(true);
      const exclusions = await businessApi.categories.getExclusions(categoryId);
      setCategoryExcludedVenues(exclusions.map(e => e.venueId));
    } catch (err) {
      console.error('Error fetching category exclusions:', err);
      setCategoryExcludedVenues([]);
    } finally {
      setLoadingExclusions(false);
    }
  };

  const fetchProductExclusions = async (categoryId, productId) => {
    try {
      setLoadingExclusions(true);
      const exclusions = await businessApi.products.getExclusions(categoryId, productId);
      setProductExcludedVenues(exclusions.map(e => e.venueId));
    } catch (err) {
      console.error('Error fetching product exclusions:', err);
      setProductExcludedVenues([]);
    } finally {
      setLoadingExclusions(false);
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
        orderingEnabled: true,
        googlePlaceId: '',
        isDigitalOrderingEnabled: null
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
        orderingEnabled: true,
        googlePlaceId: '',
        isDigitalOrderingEnabled: null
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
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(`Failed to create zone: ${errorMessage}`);
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
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(`Failed to update zone: ${errorMessage}`);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!confirm('Are you sure you want to delete this zone?') || !selectedVenue) return;

    try {
      await businessApi.zones.delete(selectedVenue.id, zoneId);
      await fetchZones(selectedVenue.id);
    } catch (err) {
      console.error('Error deleting zone:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(`Failed to delete zone: ${errorMessage}`);
    }
  };

  const handleToggleZoneActive = async (zoneId) => {
    if (!selectedVenue) return;

    try {
      await businessApi.zones.toggleActive(selectedVenue.id, zoneId);
      await fetchZones(selectedVenue.id);
    } catch (err) {
      console.error('Error toggling zone active status:', err);
      setError(`Failed to toggle zone: ${err.data || err.message}`);
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
    // Validate coordinates
    if (field === 'latitude') {
      const lat = parseFloat(value);
      if (!isNaN(lat) && (lat < -90 || lat > 90)) {
        setError('Latitude must be between -90 and 90');
        return;
      }
    }
    if (field === 'longitude') {
      const lng = parseFloat(value);
      if (!isNaN(lng) && (lng < -180 || lng > 180)) {
        setError('Longitude must be between -180 and 180');
        return;
      }
    }
    setVenueForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'staff' && staffMembers.length === 0) {
      fetchStaffMembers();
    } else if (activeTab === 'menu') {
      if (categories.length === 0) {
        fetchCategories();
      }
      if (venues.length === 0) {
        fetchVenues(); // Fetch venues for exclusion management
      }
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

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('businessDashboardTheme', newTheme ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 mx-auto ${isDarkMode ? 'border-blue-500' : 'border-blue-600'}`}></div>
          <p className={`font-mono text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>LOADING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto min-h-screen relative flex flex-col pb-20 ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      {/* Header - Sticky */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-5 py-4 ${
        isDarkMode 
          ? 'bg-zinc-950/95 border-zinc-800' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                System Live
              </span>
            </div>
            <h1 className={`text-lg font-bold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Mirësevjen, {businessProfile?.name || '[Emri]'}
            </h1>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              Riviera OS Admin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-zinc-800 text-zinc-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-xl">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-zinc-800 text-zinc-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </header>
      {/* Navigation Tabs - Sticky */}
      <nav className={`sticky top-[85px] z-40 border-b overflow-x-auto no-scrollbar ${
        isDarkMode 
          ? 'bg-zinc-950 border-zinc-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex px-4 min-w-full">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'staff', label: 'Staff' },
            { id: 'menu', label: 'Menu' },
            { id: 'venues', label: 'Venues' },
            { id: 'qr-generator', label: 'QR Codes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'text-blue-500 border-blue-500'
                    : 'text-blue-600 border-blue-600'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-zinc-200 border-transparent'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Error Display */}
      {error && (
        <div className={`mx-5 mt-4 p-3 border rounded-lg ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-800' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          <button
            onClick={() => setError('')}
            className={`text-xs mt-2 ${isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-500 hover:text-red-700'}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-5 space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <section>
            {/* Business Overview Section */}
            <div className="flex items-baseline justify-between mb-4 pl-1">
              <h2 className={`text-xs font-bold uppercase tracking-widest font-mono ${
                isDarkMode ? 'text-zinc-500' : 'text-gray-500'
              }`}>
                Business Overview
              </h2>
              <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                UPDATED NOW
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Total Revenue Card */}
              <div className={`group relative border rounded-lg p-6 shadow-sm transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-xs font-medium tracking-wide uppercase ${
                      isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      Total Revenue
                    </p>
                    <p className={`text-4xl font-extrabold mt-3 font-mono tracking-tighter ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      €{dashboardData?.totalRevenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50'
                  }`}>
                    <span className={`material-symbols-outlined text-2xl ${
                      isDarkMode ? 'text-blue-500' : 'text-blue-600'
                    }`}>
                      payments
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className={`h-1 flex-1 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'
                  }`}>
                    <div className={`h-full w-[2%] rounded-full ${
                      isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
                    }`}></div>
                  </div>
                  <span className={`text-[10px] font-mono ${
                    isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                  }`}>
                    0%
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`border rounded-lg p-5 shadow-sm ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800' 
                    : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                  }`}>
                    Active Staff
                  </p>
                  <div className="flex items-end justify-between mt-3">
                    <p className={`text-2xl font-bold font-mono ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {staffMembers.filter(s => s.isActive).length}
                    </p>
                    <span className={`material-symbols-outlined text-xl ${
                      isDarkMode ? 'text-zinc-700' : 'text-gray-300'
                    }`}>
                      groups
                    </span>
                  </div>
                </div>
                <div className={`border rounded-lg p-5 shadow-sm ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800' 
                    : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                  }`}>
                    Menu Items
                  </p>
                  <div className="flex items-end justify-between mt-3">
                    <p className={`text-2xl font-bold font-mono ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {products.length}
                    </p>
                    <span className={`material-symbols-outlined text-xl ${
                      isDarkMode ? 'text-zinc-700' : 'text-gray-300'
                    }`}>
                      restaurant_menu
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Section */}
            <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 font-mono pl-1 mt-8 ${
              isDarkMode ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Quick Access
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/bar')}
                className={`block w-full group relative overflow-hidden border rounded-lg p-4 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 hover:border-blue-500/30' 
                    : 'bg-white border-gray-200 hover:border-blue-600/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md border text-lg ${
                    isDarkMode 
                      ? 'bg-zinc-800 border-zinc-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    🍹
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className={`text-sm font-bold font-sans transition-colors ${
                      isDarkMode 
                        ? 'text-white group-hover:text-blue-500' 
                        : 'text-gray-900 group-hover:text-blue-600'
                    }`}>
                      Bar Display
                    </h3>
                    <p className={`text-xs mt-0.5 font-mono ${
                      isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      Kitchen Order Queue
                    </p>
                  </div>
                  <div className={`transition-colors ${
                    isDarkMode 
                      ? 'text-zinc-700 group-hover:text-blue-500' 
                      : 'text-gray-300 group-hover:text-blue-600'
                  }`}>
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/collector')}
                className={`block w-full group relative overflow-hidden border rounded-lg p-4 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 hover:border-blue-500/30' 
                    : 'bg-white border-gray-200 hover:border-blue-600/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md border text-lg ${
                    isDarkMode 
                      ? 'bg-zinc-800 border-zinc-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    🏖️
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className={`text-sm font-bold font-sans transition-colors ${
                      isDarkMode 
                        ? 'text-white group-hover:text-blue-500' 
                        : 'text-gray-900 group-hover:text-blue-600'
                    }`}>
                      Collector Dashboard
                    </h3>
                    <p className={`text-xs mt-0.5 font-mono ${
                      isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      Bookings & Reservations
                    </p>
                  </div>
                  <div className={`transition-colors ${
                    isDarkMode 
                      ? 'text-zinc-700 group-hover:text-blue-500' 
                      : 'text-gray-300 group-hover:text-blue-600'
                  }`}>
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/qr-generator')}
                className={`block w-full group relative overflow-hidden border rounded-lg p-4 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 hover:border-blue-500/30' 
                    : 'bg-white border-gray-200 hover:border-blue-600/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md border text-lg ${
                    isDarkMode 
                      ? 'bg-zinc-800 border-zinc-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    📱
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className={`text-sm font-bold font-sans transition-colors ${
                      isDarkMode 
                        ? 'text-white group-hover:text-blue-500' 
                        : 'text-gray-900 group-hover:text-blue-600'
                    }`}>
                      QR Code Generator
                    </h3>
                    <p className={`text-xs mt-0.5 font-mono ${
                      isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      Zone Management
                    </p>
                  </div>
                  <div className={`transition-colors ${
                    isDarkMode 
                      ? 'text-zinc-700 group-hover:text-blue-500' 
                      : 'text-gray-300 group-hover:text-blue-600'
                  }`}>
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </div>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Staff Management Tab */}
        {/* Staff Management Tab - Mobile Responsive */}
        {activeTab === 'staff' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">Staff Management</h2>
              <button
                onClick={async () => {
                  // Fetch venues if not already loaded
                  if (venues.length === 0) {
                    await fetchVenues();
                  }
                  // Add venues to staffForm
                  setStaffForm(prev => ({
                    ...prev,
                    venues: venues
                  }));
                  setShowCreateStaffModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Add Staff Member
              </button>
            </div>

            {staffLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-zinc-400 text-sm md:text-base">Loading staff members...</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-zinc-900 rounded-lg overflow-hidden">
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
                            Venue
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
                              {staff.venueName ? (
                                <span className="px-2 py-1 text-xs font-medium bg-purple-900/20 text-purple-400 rounded-full">
                                  {staff.venueName}
                                </span>
                              ) : (
                                <span className="text-zinc-500 text-xs">Not Assigned</span>
                              )}
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
                                onClick={async () => {
                                  // Fetch venues if not already loaded
                                  if (venues.length === 0) {
                                    await fetchVenues();
                                  }
                                  setEditingStaff(staff);
                                  setStaffForm({
                                    email: staff.email || '',
                                    password: '',
                                    phoneNumber: staff.phoneNumber || '',
                                    fullName: staff.fullName || '',
                                    role: staff.role || '',
                                    pin: '',
                                    isActive: staff.isActive,
                                    venueId: staff.venueId || null,
                                    venues: venues
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {staffMembers.length === 0 ? (
                    <div className="bg-zinc-900 rounded-lg p-6 text-center">
                      <p className="text-zinc-400 text-sm">No staff members found.</p>
                    </div>
                  ) : (
                    staffMembers.map((staff) => (
                      <div key={staff.id} className="bg-zinc-900 rounded-lg p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-white">
                              {staff.fullName || 'Unnamed Staff'}
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1">ID: {staff.id}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            staff.isActive 
                              ? 'bg-green-900/20 text-green-400' 
                              : 'bg-red-900/20 text-red-400'
                          }`}>
                            {staff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-zinc-500 text-xs mb-1">Role</p>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-900/20 text-blue-400 rounded-full">
                              {staff.role}
                            </span>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs mb-1">Venue</p>
                            {staff.venueName ? (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-900/20 text-purple-400 rounded-full">
                                {staff.venueName}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-xs">Not Assigned</span>
                            )}
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs mb-1">PIN Status</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              staff.hasPinSet 
                                ? 'bg-emerald-900/20 text-emerald-400' 
                                : 'bg-amber-900/20 text-amber-400'
                            }`}>
                              {staff.hasPinSet ? '✓ Set' : '✗ Not Set'}
                            </span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">Contact</p>
                          <p className="text-sm text-zinc-300">
                            {staff.phoneNumber || staff.email || 'No contact'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                          <button
                            onClick={async () => {
                              // Fetch venues if not already loaded
                              if (venues.length === 0) {
                                await fetchVenues();
                              }
                              setEditingStaff(staff);
                              setStaffForm({
                                email: staff.email || '',
                                password: '',
                                phoneNumber: staff.phoneNumber || '',
                                fullName: staff.fullName || '',
                                role: staff.role || '',
                                pin: '',
                                isActive: staff.isActive,
                                venueId: staff.venueId || null,
                                venues: venues
                              });
                            }}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleActivateStaff(staff.id)}
                              className="px-3 py-2 bg-zinc-800 text-yellow-400 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
                            >
                              {staff.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="px-3 py-2 bg-zinc-800 text-red-400 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Menu Management Tab */}
        {/* Menu Management Tab - Mobile Responsive */}
        {activeTab === 'menu' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">Menu Management</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowCreateCategoryModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  Add Category
                </button>
                {selectedCategory && (
                  <button
                    onClick={() => setShowCreateProductModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
                  >
                    Add Product
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Categories - Mobile Responsive */}
              <div className="bg-zinc-900 rounded-lg p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Categories</h3>
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
                        className={`p-3 rounded-lg transition-colors ${
                          selectedCategory?.id === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span 
                            className="font-medium cursor-pointer flex-1"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              category.isActive
                                ? 'bg-green-900/20 text-green-400'
                                : 'bg-red-900/20 text-red-400'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                setEditingCategory(category);
                                setCategoryForm({
                                  name: category.name,
                                  sortOrder: category.sortOrder || 0,
                                  isActive: category.isActive
                                });
                                try {
                                  await fetchCategoryExclusions(category.id);
                                } catch (error) {
                                  console.error('Failed to fetch category exclusions:', error);
                                  setError('Failed to load venue exclusions. You can still edit the category.');
                                }
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {categories.length === 0 && (
                      <p className="text-zinc-400 text-center py-4">No categories found.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Products - Mobile Responsive */}
              <div className="bg-zinc-900 rounded-lg p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                  Products {selectedCategory && `- ${selectedCategory.name}`}
                </h3>
                {selectedCategory ? (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="p-3 bg-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-zinc-400">€{product.price}</div>
                            {product.description && (
                              <div className="text-xs text-zinc-500 mt-1">{product.description}</div>
                            )}
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
                            <button
                              onClick={async () => {
                                setEditingProduct(product);
                                setProductForm({
                                  name: product.name,
                                  description: product.description || '',
                                  imageUrl: product.imageUrl || '',
                                  price: product.price,
                                  oldPrice: product.oldPrice || null,
                                  isAvailable: product.isAvailable,
                                  isAlcohol: product.isAlcohol || false,
                                  categoryId: selectedCategory.id
                                });
                                try {
                                  await fetchProductExclusions(selectedCategory.id, product.id);
                                } catch (error) {
                                  console.error('Failed to fetch product exclusions:', error);
                                  setError('Failed to load venue exclusions. You can still edit the product.');
                                }
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(selectedCategory.id, product.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Delete
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
        {/* Venues Tab - Mobile Responsive */}
        {activeTab === 'venues' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Venues & Zones</h2>
                <p className="text-zinc-400 text-sm md:text-base">Manage your business venues and zones</p>
              </div>
              <button
                onClick={() => setShowCreateVenueModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                + Create Venue
              </button>
            </div>

            {venuesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Venues Column - Mobile Responsive */}
                <div>
                  <div className="bg-zinc-800 rounded-lg p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Venues</h3>
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
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              venue.orderingEnabled 
                                ? 'bg-green-900/20 text-green-400' 
                                : 'bg-red-900/20 text-red-400'
                            }`}>
                              {venue.orderingEnabled ? '🛒 Ordering' : '🚫 No Ordering'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              venue.allowsDigitalOrdering 
                                ? 'bg-blue-900/20 text-blue-400' 
                                : 'bg-amber-900/20 text-amber-400'
                            }`}>
                              {venue.isDigitalOrderingEnabled === null 
                                ? '🤖 Auto Menu' 
                                : venue.allowsDigitalOrdering 
                                  ? '✓ Menu Enabled' 
                                  : '✗ Menu Disabled'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/venues/${venue.id}/mapper`);
                                }}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                                title="Visual Sunbed Mapper"
                              >
                                🗺️ Mapper
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
                                    googlePlaceId: venue.googlePlaceId || '',
                                    isDigitalOrderingEnabled: venue.isDigitalOrderingEnabled ?? null
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
                                  onClick={() => handleToggleZoneActive(zone.id)}
                                  className={`text-sm ${
                                    zone.isActive 
                                      ? 'text-yellow-400 hover:text-yellow-300' 
                                      : 'text-green-400 hover:text-green-300'
                                  }`}
                                >
                                  {zone.isActive ? 'Deactivate' : 'Activate'}
                                </button>
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
      </main>

      {/* Create Staff Modal */}
      <CreateStaffModal
        isOpen={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleCreateStaff}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleEditStaff}
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
        isOpen={!!editingCategory}
        onClose={() => {
          setEditingCategory(null);
          setCategoryForm({
            name: '',
            sortOrder: 0,
            isActive: true
          });
          setCategoryExcludedVenues([]);
        }}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleEditCategory}
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
        isOpen={!!editingProduct}
        onClose={() => {
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
          setProductExcludedVenues([]);
        }}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleEditProduct}
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
        isOpen={!!editingVenue}
        onClose={() => setEditingVenue(null)}
        venueForm={venueForm}
        onFormChange={handleVenueFormChange}
        onSubmit={handleEditVenue}
      />

      {/* Create Zone Modal */}
      <CreateZoneModal
        isOpen={showCreateZoneModal && !!selectedVenue}
        onClose={() => setShowCreateZoneModal(false)}
        zoneForm={zoneForm}
        onFormChange={setZoneForm}
        onSubmit={handleCreateZone}
        venueName={selectedVenue?.name}
      />

      {/* Edit Zone Modal */}
      <EditZoneModal
        isOpen={!!editingZone && !!selectedVenue}
        onClose={() => setEditingZone(null)}
        zoneForm={zoneForm}
        onFormChange={setZoneForm}
        onSubmit={handleEditZone}
        venueName={selectedVenue?.name}
      />
    </div>
  );
}