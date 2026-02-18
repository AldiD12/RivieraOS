import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';

// SuperAdmin Configuration
const SUPERADMIN_EMAILS = (import.meta.env.VITE_SUPERADMIN_EMAILS || 'superadmin@rivieraos.com').split(',').map(e => e.trim());

export default function SuperAdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();

  // Handle redirect in useEffect to avoid minified code initialization issues
  useEffect(() => {
    if (shouldRedirect) {
      navigate('/superadmin', { replace: true });
    }
  }, [shouldRedirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 SuperAdmin Login Step 1: Attempting authentication...');
      
      // TEMPORARY HARDCODED BYPASS FOR TESTING
      // TODO: Remove this and use real authentication once backend role is fixed
      const TEMP_BYPASS_EMAIL = 'superadmin@rivieraos.com';
      const TEMP_BYPASS_PASSWORD = 'admin123';
      
      if (credentials.email === TEMP_BYPASS_EMAIL && credentials.password === TEMP_BYPASS_PASSWORD) {
        console.log('⚠️ USING TEMPORARY HARDCODED BYPASS - FOR TESTING ONLY');
        
        // Generate fake token for testing
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHJpdmllcmFvcy5jb20iLCJyb2xlIjoiU3VwZXJBZG1pbiIsIm5hbWUiOiJTdXBlciBBZG1pbmlzdHJhdG9yIn0.test';
        
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('azure_jwt_token', fakeToken);
        localStorage.setItem('role', 'SuperAdmin');
        localStorage.setItem('userId', '1');
        localStorage.setItem('userName', 'Super Administrator (TEST MODE)');
        localStorage.setItem('userEmail', TEMP_BYPASS_EMAIL);
        
        console.log('✅ Temporary bypass successful - redirecting to dashboard');
        
        // Trigger redirect via state change to avoid minified code error
        setShouldRedirect(true);
        return;
      }
      
      // Step 1: Login → Get token
      const { azureAuth } = await import('../services/azureApi.js');
      
      const result = await azureAuth.login({
        email: credentials.email,
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
      // Verification methods (in order of preference):
      // 1. Role name check (primary - if API returns correct role)
      // 2. Email-based check (fallback - configured via environment variable)
      const userTypeUpper = (userType || '').toUpperCase();
      const isSuperAdmin = 
        userTypeUpper === 'SUPERADMIN' || 
        userTypeUpper === 'SYSTEMADMIN' || 
        SUPERADMIN_EMAILS.includes(userEmail);
      
      if (isSuperAdmin) {
        console.log('✅ SuperAdmin access granted');
        console.log('✅ Verification method:', {
          roleMatch: userTypeUpper === 'SUPERADMIN' || userTypeUpper === 'SYSTEMADMIN',
          emailMatch: SUPERADMIN_EMAILS.includes(userEmail),
          allowedEmails: SUPERADMIN_EMAILS,
          originalRole: userType
        });
        
        // Store user session data
        localStorage.setItem('role', 'SuperAdmin');
        localStorage.setItem('userId', userId || '0');
        localStorage.setItem('userName', result.user.fullName || 'Super Administrator');
        localStorage.setItem('userEmail', userEmail);
        
        // Trigger redirect via state change to avoid minified code error
        setShouldRedirect(true);
      } else {
        console.log('❌ Access denied - insufficient privileges');
        console.log('❌ Verification failed:', {
          userType,
          userEmail,
          userId,
          allowedEmails: SUPERADMIN_EMAILS
        });
        setError('Access denied. SuperAdmin privileges required.');
        
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
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
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
              disabled={loading || !credentials.email || !credentials.password}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Access System'}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              ← Back to Staff Login
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <p className="text-xs text-zinc-500">
            ⚠️ Restricted Area: All access attempts are logged and monitored.
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Unauthorized access is prohibited and may result in legal action.
          </p>
        </div>
      </div>
    </div>
  );
}