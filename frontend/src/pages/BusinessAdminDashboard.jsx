import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import businessApi from '../services/businessApi';

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
  const [venuesLoading, setVenuesLoading] = useState(false);

  // Modal states
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [staffForm, setStaffForm] = useState({
    phoneNumber: '',
    fullName: '',
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

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const role = localStorage.getItem('role');
      const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
      
      if (!token || !['Manager', 'Owner'].includes(role)) {
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

      // Fetch business profile and dashboard data
      const [profile, dashboard] = await Promise.all([
        businessApi.profile.get().catch(err => {
          console.warn('Profile fetch failed:', err);
          return null;
        }),
        businessApi.dashboard.get().catch(err => {
          console.warn('Dashboard fetch failed:', err);
          return null;
        })
      ]);

      setBusinessProfile(profile);
      setDashboardData(dashboard);

      // Fetch staff data
      await fetchStaffMembers();

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load dashboard data');
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
      setError('Failed to load staff members');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      console.log('📤 Creating staff with data:', {
        ...staffForm,
        pin: '****' // Hide PIN in logs
      });

      await businessApi.staff.create(staffForm);
      
      // Reset form and close modal
      setStaffForm({
        phoneNumber: '',
        fullName: '',
        role: '',
        pin: '',
        isActive: true
      });
      setShowCreateStaffModal(false);
      
      // Refresh staff list
      await fetchStaffMembers();
      
    } catch (err) {
      console.error('Error creating staff:', err);
      setError(`Failed to create staff member: ${err.data || err.message}`);
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      await businessApi.staff.update(editingStaff.id, staffForm);
      
      // Reset form and close modal
      setStaffForm({
        phoneNumber: '',
        fullName: '',
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

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'staff' && staffMembers.length === 0) {
      fetchStaffMembers();
    } else if (activeTab === 'menu' && categories.length === 0) {
      fetchCategories();
    }
  }, [activeTab, staffMembers.length, categories.length, fetchStaffMembers, fetchCategories]);

  // Load products when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory.id);
    }
  }, [selectedCategory, fetchProducts]);

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
              { id: 'venues', label: 'Venues' }
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
            <h2 className="text-xl font-semibold">Venues Management</h2>
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-400">Venues management will be implemented here.</p>
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
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
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
                    <option value="Waiter">Waiter</option>
                    <option value="Bartender">Bartender</option>
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
    </div>
  );
}