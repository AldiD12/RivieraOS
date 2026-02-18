import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, X, Building2, Phone } from 'lucide-react';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io';

// Utility function to normalize phone numbers (match backend format)
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'manager'
  const [pin, setPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handlePinPress = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit);
      setError('');
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleStaffLogin = async () => {
    if (pin.length !== 4 || !phoneNumber || loading) return;

    setLoading(true);
    setError('');

    try {
      // Use backend-compatible phone normalization
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // Generate multiple phone formats to try (backend expects normalized format)
      const phoneFormats = [
        normalizedPhone, // Backend normalized format (primary)
        phoneNumber.trim(), // Original format as fallback
        `0${normalizedPhone}`, // With leading 0
        normalizedPhone.startsWith('0') ? normalizedPhone.substring(1) : normalizedPhone, // Remove leading 0
      ];
      
      // Remove duplicates and empty strings
      const uniquePhoneFormats = [...new Set(phoneFormats)].filter(p => p && p.length > 0);
      
      console.log('🔐 Attempting login with normalized phone:', {
        original: phoneNumber,
        normalized: normalizedPhone,
        formats: uniquePhoneFormats,
        pinLength: pin.length
      });

      let response;
      let loginSuccessful = false;
      let lastError = null;

      // Try each phone format
      for (const phoneFormat of uniquePhoneFormats) {
        if (loginSuccessful) break;
        
        try {
          console.log(`🔐 Trying phone: ${phoneFormat} with PIN`);
          response = await fetch(`${API_URL}/api/auth/login/pin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: phoneFormat,
              pin: pin
            })
          });

          if (response.ok) {
            loginSuccessful = true;
            console.log(`✅ Login successful with phone: ${phoneFormat}`);
            break;
          } else {
            // Store the error for debugging
            const errorText = await response.text();
            lastError = { status: response.status, statusText: response.statusText, errorText };
            console.log(`❌ Failed with phone: ${phoneFormat} - ${response.status}: ${errorText}`);
          }
        } catch (error) {
          console.log(`🔐 Network error with phone: ${phoneFormat}:`, error.message);
          lastError = { status: 0, statusText: 'Network Error', errorText: error.message };
        }
      }

      if (!loginSuccessful) {
        console.log('🔐 All phone/PIN combinations failed:', lastError);
        
        // Show user-friendly error message
        if (lastError?.status === 401) {
          setError('Invalid phone number or PIN. Please check your credentials.');
        } else if (lastError?.status === 400) {
          setError('Invalid phone number format. Please enter a valid phone number.');
        } else if (lastError?.status === 0) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('Login failed. Please try again or contact support.');
        }
        
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      console.log('✅ Login response received:', data);
      
      // Handle different response structures - be more flexible
      let user = data.user || data;
      
      // The backend might return LoginResponse (with UserId) or UserDetailDto (with id)
      // Handle both structures
      let userId, businessId, fullName, role;
      
      if (data.UserId) {
        // LoginResponse structure
        userId = data.UserId;
        fullName = data.FullName || data.fullName;
        role = user.role; // No default - must be present
        businessId = user.businessId || data.businessId;
      } else if (data.id || data.userId) {
        // UserDetailDto structure
        userId = data.id || data.userId;
        fullName = data.fullName || data.FullName;
        role = data.role;
        businessId = data.businessId;
      } else {
        console.error('❌ Invalid response structure - no user ID found:', data);
        throw new Error('Invalid login response format - missing user ID');
      }
      
      if (!userId) {
        console.error('❌ No user ID found in response:', data);
        throw new Error('Invalid login response - missing user ID');
      }
      
      if (!role) {
        console.error('❌ No role found in response:', data);
        throw new Error('Invalid login response - missing role. Please contact support.');
      }
      
      // Validate token format (basic JWT check)
      const token = data.token || data.Token;
      if (!token) {
        throw new Error('Invalid login response - missing token');
      }
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('❌ Invalid token format:', token);
        throw new Error('Invalid token format received. Please try again.');
      }
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('userName', fullName || 'User');
      localStorage.setItem('phoneNumber', phoneNumber);
      
      // Store businessId if available (needed for business-level API calls)
      if (businessId) {
        localStorage.setItem('businessId', businessId.toString());
        console.log('💼 Business ID stored:', businessId);
      }
      
      // Store venue assignment if available (for Collectors)
      if (data.venueId) {
        localStorage.setItem('venueId', data.venueId.toString());
        console.log('🏖️ Venue ID stored:', data.venueId);
      }
      if (data.venueName) {
        localStorage.setItem('venueName', data.venueName);
        console.log('🏖️ Venue Name stored:', data.venueName);
      }
      
      console.log('✅ Staff login successful with real API:', {
        userId,
        fullName,
        role,
        businessId,
        venueId: data.venueId,
        venueName: data.venueName
      });
      
      // Route based on role - Business roles: Manager, Bartender, Collector
      const roleRoutes = {
        'Manager': '/admin',        // Manager goes to admin dashboard
        'Bartender': '/bar',        // Bartender goes to bar dashboard
        'Collector': '/collector'   // Collector goes to collector dashboard
      };
      
      const targetRoute = roleRoutes[role] || '/collector';
      console.log('🔄 Redirecting to:', targetRoute);
      console.log('🔍 Role mapping debug (v3):', {
        userRole: role,
        availableRoutes: roleRoutes,
        selectedRoute: targetRoute
      });
      
      // Store the actual role for ProtectedRoute validation
      // Now using exact database roles in ProtectedRoute
      localStorage.setItem('role', role);
      
      console.log('🔐 Role mapping:', {
        originalRole: role,
        storedRole: role,
        targetRoute
      });
      
      // Clear form and navigate
      setPin('');
      setPhoneNumber('');
      navigate(targetRoute);
      
    } catch (err) {
      console.error('Staff login error:', err);
      setError('Invalid phone number or PIN');
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting manager login:', { email });
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Manager login failed:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 400) {
          throw new Error('Invalid email format');
        } else {
          throw new Error('Login failed. Please try again.');
        }
      }

      const data = await response.json();
      console.log('✅ Manager login response:', data);
      
      // Extract user data (handle different response structures)
      const userId = data.userId || data.UserId || data.id;
      const fullName = data.fullName || data.FullName || 'Manager';
      const role = data.role;
      const businessId = data.businessId;
      
      if (!userId) {
        throw new Error('Invalid login response - missing user ID');
      }
      
      if (!role) {
        throw new Error('Invalid login response - missing role');
      }
      
      // Store authentication data
      localStorage.setItem('token', data.token || data.Token);
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('userName', fullName);
      localStorage.setItem('role', role);
      localStorage.setItem('email', email);
      
      if (businessId) {
        localStorage.setItem('businessId', businessId.toString());
      }
      
      console.log('✅ Manager login successful:', {
        userId,
        fullName,
        role,
        businessId
      });
      
      // Route based on role
      const roleRoutes = {
        'Owner': '/admin',
        'Manager': '/admin',
        'SuperAdmin': '/superadmin'
      };
      
      const targetRoute = roleRoutes[role] || '/admin';
      console.log('🔄 Redirecting to:', targetRoute);
      
      // Clear form and navigate
      setEmail('');
      setPassword('');
      navigate(targetRoute);
      
    } catch (err) {
      console.error('Manager login error:', err);
      setError(err.message || 'Invalid email or password');
      setPassword('');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 4 digits entered and phone number provided (but only once)
  useEffect(() => {
    if (pin.length === 4 && phoneNumber && !loading && activeTab === 'staff') {
      handleStaffLogin();
    }
  }, [pin, phoneNumber, loading, activeTab]); // Dependencies to prevent multiple calls

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* App Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1 tracking-tight">
            RivieraOS
          </h1>
          <p className="text-sm text-zinc-600">
            Staff Login
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-zinc-200 p-1 mb-6 flex gap-1">
          <button
            onClick={() => {
              setActiveTab('staff');
              setPin('');
              setEmail('');
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'staff'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <User className="w-4 h-4 inline-block mr-1.5" />
            Staff Login
          </button>
          <button
            onClick={() => {
              setActiveTab('manager');
              setPin('');
              setEmail('');
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'manager'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Lock className="w-4 h-4 inline-block mr-1.5" />
            Manager Login
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-zinc-200 p-8">
          {activeTab === 'staff' ? (
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">Staff Login</h2>
              <p className="text-sm text-zinc-600 mb-6">Enter your phone number and 4-digit PIN</p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Phone Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                    placeholder="Enter your phone number"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Example: +355691234567</p>
              </div>

              {/* PIN Display */}
              <div className={`flex justify-center gap-3 mb-8 ${shake ? 'animate-shake' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all ${
                      pin.length > i
                        ? 'border-zinc-900 bg-zinc-900'
                        : 'border-zinc-200 bg-white'
                    }`}
                  >
                    {pin.length > i && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinPress(digit.toString())}
                    disabled={loading || !phoneNumber}
                    className="aspect-square bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-2xl font-bold text-zinc-900 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={handlePinDelete}
                  disabled={loading || pin.length === 0}
                  className="aspect-square bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-600 transition-all active:scale-95 disabled:opacity-30"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handlePinPress('0')}
                  disabled={loading || !phoneNumber}
                  className="aspect-square bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-2xl font-bold text-zinc-900 transition-all active:scale-95 disabled:opacity-50"
                >
                  0
                </button>
                <div className="aspect-square"></div>
              </div>

              {loading && (
                <div className="text-center text-sm text-zinc-500 mb-4">
                  Verifying credentials...
                </div>
              )}

              {!phoneNumber && (
                <div className="text-center text-sm text-zinc-500">
                  Please enter your phone number first
                </div>
              )}
            </div>
          ) : (
            // Manager Login
            <form onSubmit={handleManagerSubmit}>
              <h2 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">Manager Access</h2>
              <p className="text-sm text-zinc-600 mb-6">Enter your credentials to continue</p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                  placeholder="Enter your email"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                  placeholder="Enter password"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-900"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
