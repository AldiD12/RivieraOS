import { useState, useEffect } from 'react';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('staff');
  const [staffForm, setStaffForm] = useState({
    phoneNumber: '',
    fullName: '',
    role: '',
    pin: '',
    isActive: true
  });

  // Check authentication
  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
    
    if (!token || role !== 'SuperAdmin') {
      localStorage.clear();
      window.location.href = '/superadmin/login';
    }
  }, []);

  const handleStaffFormChange = (field, value) => {
    setStaffForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    console.log('Creating staff with correct roles:', staffForm);
    // Add your staff creation logic here
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">SuperAdmin Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'staff' 
                ? 'bg-white text-black' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            Staff Management
          </button>
        </div>

        {/* Staff Management Tab */}
        {activeTab === 'staff' && (
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Create Staff Member</h2>
            
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Role * (Database Roles)
                  </label>
                  <select
                    required
                    value={staffForm.role}
                    onChange={(e) => handleStaffFormChange('role', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  >
                    <option value="">Select role</option>
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Bartender">Bartender (Bar Staff)</option>
                    <option value="Guest">Guest</option>
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">
                    ✅ These are the correct database roles. Use "Bartender" for bar staff.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="createStaffIsActive"
                  checked={staffForm.isActive}
                  onChange={(e) => handleStaffFormChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="createStaffIsActive" className="text-sm text-zinc-300">
                  Active Staff Member
                </label>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStaffForm({
                    phoneNumber: '',
                    fullName: '',
                    role: '',
                    pin: '',
                    isActive: true
                  })}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Create Staff Member
                </button>
              </div>
            </form>

            {/* Role Reference */}
            <div className="mt-8 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">✅ Valid Database Roles:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Owner:</strong> Business owner access</div>
                <div><strong>Manager:</strong> Management dashboard</div>
                <div><strong>Waiter:</strong> Collector dashboard</div>
                <div><strong>Bartender:</strong> Bar dashboard</div>
                <div><strong>Guest:</strong> Basic access</div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                ❌ Invalid roles: "Bar", "Staff", "Admin", "Collector" - these will cause "Role not found" errors
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}