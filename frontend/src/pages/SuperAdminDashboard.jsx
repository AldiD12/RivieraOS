import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Super Admin Dashboard - Business Management System
export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('businesses');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Step 4: Check role from user object to show correct UI
  useEffect(() => {
    const checkUserRole = () => {
      const role = localStorage.getItem('role');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      
      console.log('Step 4: Checking user role for UI display');
      console.log('Role:', role);
      console.log('User:', userName);
      console.log('Email:', userEmail);
      
      if (role !== 'SuperAdmin') {
        console.log('❌ Access denied - not SuperAdmin');
        window.location.href = '/login';
        return;
      }
      
      setUserInfo({
        role,
        name: userName,
        email: userEmail
      });
      
      console.log('✅ SuperAdmin UI access granted');
    };
    
    checkUserRole();
  }, []);

  // Fetch businesses from Azure API
  useEffect(() => {
    if (userInfo) {
      fetchBusinesses();
    }
  }, [userInfo]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching businesses with authenticated API call...');
      
      // Step 3: Authorization header is automatically added by interceptor
      const token = localStorage.getItem('azure_jwt_token');
      
      const response = await fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/Businesses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Businesses fetched successfully:', data.length, 'businesses');
        setBusinesses(data);
      } else if (response.status === 401) {
        console.log('❌ Token expired or invalid');
        setError('Session expired. Please login again.');
        // Clear tokens and redirect
        localStorage.clear();
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch businesses');
      }
    } catch (err) {
      setError('Error connecting to API');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessDetails = async (businessId) => {
    try {
      const token = localStorage.getItem('azure_jwt_token');
      
      const response = await fetch(`https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/Businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedBusiness(data);
      }
    } catch (err) {
      console.error('Error fetching business details:', err);
    }
  };

  const createBusiness = async (businessData) => {
    try {
      const token = localStorage.getItem('azure_jwt_token');
      
      const response = await fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/Businesses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(businessData)
      });

      if (response.ok) {
        fetchBusinesses(); // Refresh list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating business:', err);
      return false;
    }
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
          onClick={() => {/* TODO: Open create business modal */}}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Add Business
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400">Loading businesses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => {
                fetchBusinessDetails(business.id);
                setActiveTab('staff');
              }}
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
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Contact:</span>
                  <span className="text-zinc-300">{business.contactEmail || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subscription:</span>
                  <span className="text-zinc-300">{business.subscriptionStatus || 'Basic'}</span>
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
            </motion.div>
          ))}
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
          <h2 className="text-2xl font-bold text-white">
            Staff - {selectedBusiness.brandName || selectedBusiness.registeredName}
          </h2>
        )}
      </div>

      {selectedBusiness ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Team Members</h3>
            <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              + Add Staff Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedBusiness.users?.map((user) => (
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
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Role:</span>
                    <span className="text-zinc-300">{user.userType || 'Staff'}</span>
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
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-8">
                <p className="text-zinc-400">No staff members found for this business.</p>
              </div>
            )}
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
      <h2 className="text-2xl font-bold text-white">Menu & Products Management</h2>
      
      {selectedBusiness ? (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedBusiness.venues?.map((venue) => 
                venue.categories?.map((category) => (
                  <div key={category.id} className="bg-zinc-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">{category.name}</h4>
                    <p className="text-sm text-zinc-400">
                      {category.products?.length || 0} products
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Sort Order: {category.sortOrder}
                    </p>
                  </div>
                ))
              ) || (
                <div className="col-span-full text-center py-4">
                  <p className="text-zinc-400">No categories found</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Products</h3>
            <div className="space-y-3">
              {selectedBusiness.venues?.map((venue) => 
                venue.products?.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <span className="text-lg">🍽️</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{product.name}</h4>
                        <p className="text-sm text-zinc-400">{product.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">€{product.price.toFixed(2)}</p>
                      <p className={`text-sm ${product.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                ))
              ) || (
                <div className="text-center py-4">
                  <p className="text-zinc-400">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">Select a business to manage menu and products</p>
        </div>
      )}
    </div>
  );

  // Venues & Zones Tab
  const VenuesTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Venues & Zones Management</h2>
      
      {selectedBusiness ? (
        <div className="space-y-6">
          {selectedBusiness.venues?.map((venue) => (
            <div key={venue.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{venue.name}</h3>
                  <p className="text-zinc-400">{venue.type}</p>
                  <p className="text-sm text-zinc-500 mt-1">{venue.description}</p>
                </div>
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-300">
                  {venue.venueZones?.length || 0} zones
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {venue.venueZones?.map((zone) => (
                  <div key={zone.id} className="bg-zinc-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">{zone.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Type:</span>
                        <span className="text-zinc-300">{zone.zoneType || 'Standard'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Capacity:</span>
                        <span className="text-zinc-300">{zone.capacityPerUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Base Price:</span>
                        <span className="text-zinc-300">€{zone.basePrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="col-span-full text-center py-4">
                    <p className="text-zinc-400">No zones configured</p>
                  </div>
                )}
              </div>

              {venue.address && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400">
                    📍 {venue.address}
                  </p>
                  {venue.latitude && venue.longitude && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Coordinates: {venue.latitude}, {venue.longitude}
                    </p>
                  )}
                </div>
              )}
            </div>
          )) || (
            <div className="text-center py-12">
              <p className="text-zinc-400">No venues found for this business</p>
            </div>
          )}
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
      <h2 className="text-2xl font-bold text-white">Business Settings</h2>
      
      {selectedBusiness ? (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Registered Name</label>
                <input 
                  type="text" 
                  value={selectedBusiness.registeredName}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Brand Name</label>
                <input 
                  type="text" 
                  value={selectedBusiness.brandName || ''}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Tax ID</label>
                <input 
                  type="text" 
                  value={selectedBusiness.taxId || ''}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Email</label>
                <input 
                  type="email" 
                  value={selectedBusiness.contactEmail || ''}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Subscription Status</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white">
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Business Status</label>
                <select 
                  value={selectedBusiness.isActive ? 'active' : 'inactive'}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button className="px-6 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">Select a business to manage settings</p>
        </div>
      )}
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
      </div>
    </div>
  );
}