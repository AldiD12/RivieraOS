import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function SuperAdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 SuperAdmin Login Step 1: Attempting authentication...');
      
      // Step 1: Login → Get token
      const { azureAuth } = await import('../services/azureApi.js');
      
      const result = await azureAuth.login({
        email: credentials.username,
        password: credentials.password
      });
      
      console.log('🔐 Login result:', result);
      
      // Check if login was successful
      if (!result.success || !result.user || !result.token) {
        console.log('❌ Login failed - missing success, user, or token');
        setError('Authentication failed. Invalid credentials.');
        return;
      }
      
      console.log('🔐 Step 2: Login successful, storing token...');
      
      // Step 2: Store token
      localStorage.setItem('token', result.token);
      localStorage.setItem('azure_jwt_token', result.token);
      
      console.log('🔐 Step 3: Checking user permissions...');
      
      // Step 3: Check role from user object to show correct UI
      const userType = result.user.userType || result.user.role || 'Guest';
      const userEmail = result.user.email || '';
      const userId = result.user.id;
      
      console.log('🔐 User details:', {
        id: userId,
        userType,
        email: userEmail,
        fullName: result.user.fullName
      });
      
      // Check if user has SuperAdmin privileges
      // Multiple verification methods:
      // 1. Role name check (if API returns correct role)
      // 2. Email-based check (fallback for superadmin@rivieraos.com)
      // 3. User ID check (if SuperAdmin has specific ID like 6)
      const isSuperAdmin = userType === 'SuperAdmin' || 
                          userType === 'SystemAdmin' || 
                          userEmail === 'superadmin@rivieraos.com' ||
                          (userId === 6 && userEmail === 'superadmin@rivieraos.com'); // ID 6 from curl test
      
      if (isSuperAdmin) {
        console.log('✅ SuperAdmin access granted');
        console.log('✅ Verification method:', {
          roleMatch: userType === 'SuperAdmin' || userType === 'SystemAdmin',
          emailMatch: userEmail === 'superadmin@rivieraos.com',
          idMatch: userId === 6
        });
        
        // Store user session data
        localStorage.setItem('role', 'SuperAdmin');
        localStorage.setItem('userId', userId || '0');
        localStorage.setItem('userName', result.user.fullName || 'Super Administrator');
        localStorage.setItem('userEmail', userEmail);
        
        navigate('/superadmin');
      } else {
        console.log('❌ Access denied - insufficient privileges');
        console.log('❌ Verification failed:', {
          userType,
          userEmail,
          userId,
          expectedEmail: 'superadmin@rivieraos.com'
        });
        setError(`Access denied. SuperAdmin privileges required. Current role: ${userType}, Email: ${userEmail}`);
        
        // Clear any stored tokens
        localStorage.removeItem('token');
        localStorage.removeItem('azure_jwt_token');
      }
      
    } catch (err) {
      console.error('❌ SuperAdmin login error:', err);
      
      // Clear any stored tokens on error
      localStorage.removeItem('token');
      localStorage.removeItem('azure_jwt_token');
      
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.response?.status === 400) {
        setError('Invalid request. Please check your credentials format.');
      } else if (err.response?.status === 403) {
        setError('Access forbidden. SuperAdmin privileges required.');
      } else {
        setError('Authentication failed. Please try again. ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-full mb-4 border border-zinc-800">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Super Admin Access</h1>
          <p className="text-sm text-zinc-400">System Administrator Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition-colors"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition-colors"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !credentials.username || !credentials.password}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Access System'}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              ← Back to Staff Login
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <p className="text-xs text-zinc-500">
            This is a restricted area. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}