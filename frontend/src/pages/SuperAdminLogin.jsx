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
      
      console.log('🔐 Using API URL:', API_URL);
      
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
      console.log('🔍 Full response data:', JSON.stringify(data, null, 2));
      
      // Extract user data
      const userId = data.userId || data.UserId || data.id;
      const fullName = data.fullName || data.FullName || 'Super Administrator';
      const role = data.role;
      const token = data.token || data.Token;
      
      console.log('🔐 Extracted values:', {
        userId,
        fullName,
        role,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
      });
      
      if (!userId) {
        throw new Error('Invalid login response - missing user ID');
      }
      
      if (!role) {
        throw new Error('Invalid login response - missing role');
      }
      
      if (!token) {
        throw new Error('Invalid login response - missing token');
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
      localStorage.setItem('azure_jwt_token', token);
      localStorage.setItem('token', token); // Also store as 'token' for backward compatibility
      localStorage.setItem('role', 'SuperAdmin');
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userEmail', credentials.email);
      
      console.log('✅ Token stored successfully');
      console.log('📦 LocalStorage contents:', {
        azure_jwt_token: localStorage.getItem('azure_jwt_token')?.substring(0, 30) + '...',
        token: localStorage.getItem('token')?.substring(0, 30) + '...',
        role: localStorage.getItem('role'),
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName')
      });
      
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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Deep premium background effects for SuperAdmin */}
      <div className="absolute top-1/2 left-1/2 -mt-64 -ml-64 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-b from-zinc-800 to-black rounded-full mb-5 shadow-[0_0_40px_rgba(255,0,0,0.15)] border border-zinc-800">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">SuperAdmin</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">System Override Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/80 p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Error Message */}
            {error && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-4 text-red-400 text-sm text-center backdrop-blur-sm animate-in zoom-in-95 duration-200">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-900 rounded-full opacity-0 group-focus-within:opacity-30 transition duration-500 blur"></div>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="relative w-full bg-black/50 border border-zinc-800 rounded-full px-6 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-900/50 transition-all font-mono text-center tracking-wide"
                  placeholder="Master Email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-900 rounded-full opacity-0 group-focus-within:opacity-30 transition duration-500 blur"></div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full bg-black/50 border border-zinc-800 rounded-full px-6 py-4 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-red-900/50 transition-all text-center tracking-widest"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !credentials.email || !credentials.password}
              className="w-full relative group overflow-hidden bg-white text-black py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2"
            >
              <div className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-b-2 border-black rounded-full animate-spin"></div>
                    Authenticating
                  </span>
                ) : (
                  'Authorize'
                )}
              </div>
            </button>
          </form>

          {/* Security Notice */}
          <div className="text-center mt-10">
            <p className="text-[10px] font-mono tracking-widest uppercase text-red-500/70">
              ⚠️ Restricted Override Area
            </p>
            <p className="text-[10px] text-zinc-600 mt-2">
              All access attempts are fully logged and monitored.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-mono uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
          >
            ← Standard Portal
          </button>
        </div>
      </div>
    </div>
  );
}