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
          response = await fetch(`${API_URL}/auth/login/pin`, {
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
          // If the backend sends a specific string (like telling managers to use email), show it.
          // Otherwise, fall back to the generic message.
          const errorMsg = lastError?.errorText && lastError.errorText.length < 100 
            ? lastError.errorText 
            : 'Invalid phone number or PIN. Please check your credentials.';
          setError(errorMsg);
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
      
      const response = await fetch(`${API_URL}/auth/login`, {
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
      
      // Normalize role name to match ProtectedRoute expectations (case-insensitive)
      const roleMapping = {
        'superadmin': 'SuperAdmin',
        'super admin': 'SuperAdmin',
        'owner': 'Owner',
        'manager': 'Manager',
        'bartender': 'Bartender',
        'collector': 'Collector'
      };
      
      const normalizedRole = roleMapping[role.toLowerCase()] || role;
      
      console.log('🔄 Role normalization:', {
        original: role,
        normalized: normalizedRole
      });
      
      // Store authentication data
      localStorage.setItem('token', data.token || data.Token);
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('userName', fullName);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('email', email);
      
      if (businessId) {
        localStorage.setItem('businessId', businessId.toString());
      }
      
      console.log('✅ Manager login successful:', {
        userId,
        fullName,
        role: normalizedRole,
        businessId
      });
      
      // Redirect SuperAdmin to correct login page
      if (normalizedRole === 'SuperAdmin') {
        console.log('⚠️ SuperAdmin detected - redirecting to /superadmin/login');
        setError('SuperAdmin users must login at /superadmin/login');
        localStorage.clear(); // Clear any stored data
        setTimeout(() => {
          navigate('/superadmin/login');
        }, 2000);
        return;
      }
      
      // Route based on role (Business roles only)
      const roleRoutes = {
        'Owner': '/admin',
        'Manager': '/admin'
      };
      
      const targetRoute = roleRoutes[normalizedRole] || '/admin';
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-zinc-950">
      {/* Deep premium background effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-900 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-zinc-800 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* App Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-zinc-800 to-zinc-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-zinc-700/50">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tighter">
            Riviera OS
          </h1>
          <p className="text-sm font-mono tracking-widest uppercase text-zinc-400">
            Secure Access
          </p>
        </div>

        {/* Floating Pill Tabs */}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-full border border-zinc-800 p-1.5 mb-8 flex gap-1 shadow-lg mx-4 sm:mx-0">
          <button
            onClick={() => {
              setActiveTab('staff');
              setPin('');
              setEmail('');
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'staff'
                ? 'bg-white text-zinc-900 shadow-md transform scale-[1.02]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <User className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            Staff PIN
          </button>
          <button
            onClick={() => {
              setActiveTab('manager');
              setPin('');
              setEmail('');
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'manager'
                ? 'bg-white text-zinc-900 shadow-md transform scale-[1.02]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Lock className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            Manager
          </button>
        </div>

        {/* Main Glass Container */}
        <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/80 p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {activeTab === 'staff' ? (
            <div className="animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Staff Terminal</h2>
                <p className="text-sm text-zinc-400">Enter your assigned phone and PIN</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-2xl text-red-400 text-sm text-center backdrop-blur-sm animate-in zoom-in-95 duration-200">
                  {error}
                </div>
              )}

              {/* Phone Number Input */}
              <div className="mb-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-0 group-focus-within:opacity-30 transition duration-500 blur"></div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 transition-colors group-focus-within:text-white" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-12 pr-6 py-4 bg-zinc-950/50 border border-zinc-800 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all font-mono tracking-wider text-center"
                      placeholder="e.g. +355 69 123 4567"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* PIN Indicator Dots */}
              <div className={`flex justify-center gap-4 mb-8 ${shake ? 'animate-shake' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      pin.length > i
                        ? 'border-white bg-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                        : 'border-zinc-700 bg-transparent'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Circular Luxury PIN Pad */}
              <div className="grid grid-cols-3 gap-y-4 gap-x-2 sm:gap-4 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinPress(digit.toString())}
                    disabled={loading || !phoneNumber}
                    className="aspect-square w-16 sm:w-20 mx-auto rounded-full bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-700 hover:border-zinc-500 text-2xl font-light text-white transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:hover:bg-zinc-800/30 flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}
                
                <button
                  onClick={handlePinDelete}
                  disabled={loading || pin.length === 0}
                  className="aspect-square w-16 sm:w-20 mx-auto rounded-full bg-transparent hover:bg-red-950/30 text-zinc-500 hover:text-red-400 transition-all duration-200 active:scale-90 disabled:opacity-30 flex items-center justify-center"
                >
                  <X className="w-8 h-8" />
                </button>
                
                <button
                  onClick={() => handlePinPress('0')}
                  disabled={loading || !phoneNumber}
                  className="aspect-square w-16 sm:w-20 mx-auto rounded-full bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-700 hover:border-zinc-500 text-2xl font-light text-white transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:hover:bg-zinc-800/30 flex items-center justify-center"
                >
                  0
                </button>
                
                <div className="aspect-square w-16 sm:w-20 mx-auto"></div>
              </div>

              {loading && (
                <div className="text-center mt-6">
                  <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin mx-auto"></div>
                </div>
              )}
            </div>
          ) : (
            // Manager Login
            <form onSubmit={handleManagerSubmit} className="animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Manager Dashboard</h2>
                <p className="text-sm text-zinc-400">Access your business analytics</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-2xl text-red-400 text-sm text-center backdrop-blur-sm animate-in zoom-in-95 duration-200">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="mb-5">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-0 group-focus-within:opacity-30 transition duration-500 blur"></div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="relative w-full px-6 py-4 bg-zinc-950/50 border border-zinc-800 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all text-center"
                    placeholder="Email Address"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-0 group-focus-within:opacity-30 transition duration-500 blur"></div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="relative w-full px-6 py-4 bg-zinc-950/50 border border-zinc-800 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all text-center tracking-widest"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full relative group overflow-hidden bg-white text-black py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-b-2 border-black rounded-full animate-spin"></div>
                      Authenticating
                    </span>
                  ) : (
                    'Unlock Dashboard'
                  )}
                </div>
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            ← Disconnect
          </button>
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
