import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { businessApi } from '../services/superAdminApi.js';

// Super Admin Dashboard - Complete Business Management System
export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('businesses');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  // Modal states
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  // Form states
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
        console.log('✅ SuperAdmin businesses fetched successfully:', data.length, 'businesses');
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
      
      setBusinesses(data || []);
      setError('');
      console.log('✅ Businesses loaded successfully');
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
    } catch (err) {
      console.error('Error fetching business details:', err);
      setError('Failed to fetch business details');
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
      
      await businessApi.superAdmin.update(editingBusiness.id, businessForm);
      console.log('✅ Business updated');
      
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
      setError('Failed to update business: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) return;
    
    try {
      console.log('🔄 Deleting business:', businessId);
      
      await businessApi.superAdmin.delete(businessId);
      console.log('✅ Business deleted');
      
      fetchBusinesses();
      if (selectedBusiness?.id === businessId) {
        setSelectedBusiness(null);
        setActiveTab('businesses');
      }
      setError('');
    } catch (err) {
      console.error('Error deleting business:', err);
      setError('Failed to delete business: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetBusinessForm = () => {
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
  };

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

  // Modal Components
  const CreateBusinessModal = () => (
    <AnimatePresence>
      {showCreateBusinessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateBusinessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">Create New Business</h2>
            
            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Registered Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessForm.registeredName}
                    onChange={(e) => setBusinessForm({...businessForm, registeredName: e.target.value})}
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
                    onChange={(e) => setBusinessForm({...businessForm, brandName: e.target.value})}
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
                    onChange={(e) => setBusinessForm({...businessForm, taxId: e.target.value})}
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
                    onChange={(e) => setBusinessForm({...businessForm, contactEmail: e.target.value})}
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
                  onChange={(e) => setBusinessForm({...businessForm, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-zinc-300">
                  Active Business
                </label>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateBusinessModal(false);
                    resetBusinessForm();
                  }}
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

  const EditBusinessModal = () => (
    <AnimatePresence>
      {showEditBusinessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditBusinessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">Edit Business</h2>
            
            <form onSubmit={handleUpdateBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Registered Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessForm.registeredName}
                    onChange={(e) => setBusinessForm({...businessForm, registeredName: e.target.value})}
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
                    onChange={(e) => setBusinessForm({...businessForm, brandName: e.target.value})}
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
                    onChange={(e) => setBusinessForm({...businessForm, contactEmail: e.target.value})}
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
                    onChange={(e) => setBusinessForm({...businessForm, taxId: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={businessForm.isActive}
                  onChange={(e) => setBusinessForm({...businessForm, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="editIsActive" className="text-sm text-zinc-300">
                  Active Business
                </label>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBusinessModal(false);
                    setEditingBusiness(null);
                    resetBusinessForm();
                  }}
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
                    Manage
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
                {selectedBusiness.users?.length || 0} staff members registered
              </p>
            </div>
            <button 
              onClick={() => {
                console.log('🔘 Add Staff button clicked');
                // TODO: Implement add staff modal when SuperAdmin endpoints are available
                setError('Staff management requires SuperAdmin API access. Feature coming soon.');
              }}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              + Add Staff Member
            </button>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedBusiness.users?.length > 0 ? (
              selectedBusiness.users.map((user) => (
                <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{user.fullName || 'Unnamed User'}</h4>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Role:</span>
                      <span className="text-zinc-300">{user.userType || user.role || 'Staff'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Phone:</span>
                      <span className="text-zinc-300">{user.phoneNumber || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status:</span>
                      <span className={user.isActive ? 'text-green-400' : 'text-red-400'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ID:</span>
                      <span className="text-zinc-300 font-mono text-xs">{user.id}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        console.log('🔘 Edit Staff button clicked for user:', user.id);
                        setError('Staff editing requires SuperAdmin API access. Feature coming soon.');
                      }}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔘 Reset Password button clicked for user:', user.id);
                        setError('Password reset requires SuperAdmin API access. Feature coming soon.');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-zinc-400 mb-4">
                  <p>No staff members found for this business.</p>
                  <p className="text-sm mt-2">Staff data may be available through SuperAdmin endpoints.</p>
                </div>
                <button 
                  onClick={() => {
                    console.log('🔘 Add First Staff button clicked');
                    setError('Staff management requires SuperAdmin API access. Feature coming soon.');
                  }}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Add First Staff Member
                </button>
              </div>
            )}
          </div>

          {/* Staff Management Notice */}
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-yellow-400 mt-0.5">⚠️</div>
              <div>
                <h4 className="text-yellow-400 font-medium mb-1">Limited Staff Management</h4>
                <p className="text-yellow-300 text-sm">
                  Full staff management (add, edit, delete, password reset) requires SuperAdmin API endpoints. 
                  Currently showing read-only data from business records.
                </p>
                <p className="text-yellow-300 text-sm mt-2">
                  Available endpoints: <code className="bg-yellow-900/30 px-1 rounded text-xs">GET /api/Businesses/{'{id}'}</code>
                </p>
                <p className="text-yellow-300 text-sm">
                  Required endpoints: <code className="bg-yellow-900/30 px-1 rounded text-xs">GET/POST/PUT/DELETE /api/superadmin/businesses/{'{businessId}'}/Users</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">Select a business to view staff members</p>
        </div>
      )}
    </div>
  );

  // Menu & Products Tab
  const MenuTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Menu & Products Management</h2>
        <p className="text-zinc-400 mb-6">Manage categories and products across all venues</p>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-white mb-4">Required API Endpoints</h3>
          <div className="space-y-2 text-sm text-left">
            <div className="text-zinc-300">
              <strong>Categories:</strong>
            </div>
            <div className="text-zinc-400 font-mono text-xs ml-4">
              GET/POST/PUT/DELETE /api/superadmin/venues/{'{venueId}'}/Categories
            </div>
            
            <div className="text-zinc-300 mt-4">
              <strong>Products:</strong>
            </div>
            <div className="text-zinc-400 font-mono text-xs ml-4">
              GET/POST/PUT/DELETE /api/superadmin/categories/{'{categoryId}'}/Products
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded">
            <p className="text-yellow-400 text-sm">
              ⚠️ These endpoints exist in the API but return 403 Forbidden due to missing role claims in JWT token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Venues & Zones Tab
  const VenuesTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Venues & Zones Management</h2>
        <p className="text-zinc-400 mb-6">Configure venues, zones, and seating layouts</p>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-white mb-4">Required API Endpoints</h3>
          <div className="space-y-2 text-sm text-left">
            <div className="text-zinc-300">
              <strong>Venues:</strong>
            </div>
            <div className="text-zinc-400 font-mono text-xs ml-4">
              GET/POST/PUT/DELETE /api/superadmin/businesses/{'{businessId}'}/Venues
            </div>
            
            <div className="text-zinc-300 mt-4">
              <strong>Zones:</strong>
            </div>
            <div className="text-zinc-400 font-mono text-xs ml-4">
              GET/POST/PUT/DELETE /api/superadmin/venues/{'{venueId}'}/Zones
            </div>
            
            <div className="text-zinc-300 mt-4">
              <strong>Venue Configuration:</strong>
            </div>
            <div className="text-zinc-400 font-mono text-xs ml-4">
              GET/PUT /api/superadmin/businesses/{'{businessId}'}/Venues/{'{id}'}/config
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded">
            <p className="text-yellow-400 text-sm">
              ⚠️ These endpoints exist in the API but return 403 Forbidden due to missing role claims in JWT token.
            </p>
          </div>
        </div>
      </div>
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

        {/* Modals */}
        <CreateBusinessModal />
        <EditBusinessModal />
      </div>
    </div>
  );
}