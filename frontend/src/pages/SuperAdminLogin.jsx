import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';

// SuperAdmin Configuration
const SUPERADMIN_EMAILS = (import.meta.env.VITE_SUPERADMIN_EMAILS || 'superadmin@rivieraos.com').split(',').map(e => e.trim());

export default function SuperAdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 SuperAdmin Login: Attempting authentication...');
      
      // Use the standard backend API endpoint (same as business login)
      const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SuperAdmin login failed:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. SuperAdmin privileges required.');
        } else {
          throw new Error('Authentication failed. Please try again.');
        }
      }

      const data = await response.json();
      console.log('✅ Login response received:', data);
      
      // Extract user data
      const userId = data.userId || data.UserId || data.id;
      const fullName = data.fullName || data.FullName || 'Super Administrator';
      const role = data.role;
      
      if (!userId) {
        throw new Error('Invalid login response - missing user ID');
      }
      
      if (!role) {
        throw new Error('Invalid login response - missing role');
      }
      
      // Normalize role (case-insensitive)
      const normalizedRole = role.toLowerCase() === 'superadmin' || role.toLowerCase() === 'super admin' 
        ? 'SuperAdmin' 
        : role;
      
      console.log('🔐 User details:', {
        id: userId,
        role: normalizedRole,
        email: credentials.email,
        fullName
      });
      
      // Verify SuperAdmin role
      if (normalizedRole !== 'SuperAdmin') {
        console.log('❌ Access denied - insufficient privileges');
        console.log('❌ User role:', normalizedRole);
        throw new Error('Access denied. SuperAdmin privileges required.');
      }
      
      console.log('✅ SuperAdmin access granted');
      
      // Store authentication data (use azure_jwt_token for consistency with dashboard)
      const token = data.token || data.Token;
      localStorage.setItem('azure_jwt_token', token);
      localStorage.setItem('token', token); // Also store as 'token' for backward compatibility
      localStorage.setItem('role', 'SuperAdmin');
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userEmail', credentials.email);
      
      console.log('✅ Token stored successfully');
      
      // Navigate to SuperAdmin dashboard
      navigate('/superadmin');
      
    } catch (err) {
      console.error('❌ SuperAdmin login error:', err);
      
      // Clear any stored tokens on error
      localStorage.removeItem('azure_jwt_token');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      
      setError(err.message || 'Authentication failed. Please try again.');
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