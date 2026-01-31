import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, X } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'manager'
  const [pin, setPin] = useState('');
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

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return;

    setLoading(true);
    setError('');

    try {
      // Map PIN to BlackBear credentials
      const waiterMap = {
        '1111': { email: 'marco@hotelcoral.al', password: '1111' },
        '2222': { email: 'sofia@hotelcoral.al', password: '2222' },
        '3333': { email: 'luca@hotelcoral.al', password: '3333' }
      };
      
      const credentials = waiterMap[pin];
      
      if (!credentials) {
        setError('Invalid PIN');
        setShake(true);
        setPin('');
        setTimeout(() => setShake(false), 500);
        setLoading(false);
        return;
      }

      // Use unified API for authentication
      const { loginUser } = await import('../services/api.js');
      const result = await loginUser(credentials);
      
      if (result.success) {
        // Store authentication data
        localStorage.setItem('token', result.token || 'mock-token');
        localStorage.setItem('userId', '1');
        localStorage.setItem('userName', result.user?.name || 'Staff Member');
        localStorage.setItem('role', 'Waiter');
        
        console.log('Login successful, redirecting...');
        
        // Route based on PIN to appropriate dashboard
        const pinRoutes = {
          '1111': '/collector',  // Beach/Sunbed Collector
          '2222': '/bar',        // Bar Staff
          '3333': '/collector'   // Another Collector
        };
        
        navigate(pinRoutes[pin] || '/collector');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid PIN');
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      // Use unified API for admin authentication
      const { loginUser } = await import('../services/api.js');
      const result = await loginUser({
        email: 'admin@hotelcoral.al',
        password: password
      });
      
      if (result.success) {
        // Store authentication data
        localStorage.setItem('token', result.token || 'mock-admin-token');
        localStorage.setItem('userId', '999');
        localStorage.setItem('userName', result.user?.name || 'Administrator');
        localStorage.setItem('role', 'Admin');
        
        console.log('Admin login successful, redirecting...');
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid password');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 4 digits entered
  if (pin.length === 4 && !loading) {
    handlePinSubmit();
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Restaurant QR</h1>
          <p className="text-sm text-zinc-600">Sign in to continue</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-zinc-200 p-1 mb-6 flex gap-1">
          <button
            onClick={() => {
              setActiveTab('staff');
              setPin('');
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
              <h2 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">Enter PIN</h2>
              <p className="text-sm text-zinc-600 mb-6">Enter your 4-digit staff PIN</p>

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

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinPress(digit.toString())}
                    disabled={loading}
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
                  disabled={loading}
                  className="aspect-square bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-2xl font-bold text-zinc-900 transition-all active:scale-95 disabled:opacity-50"
                >
                  0
                </button>
                <div className="aspect-square"></div>
              </div>

              {loading && (
                <div className="text-center text-sm text-zinc-500">
                  Verifying...
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <h2 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">Manager Access</h2>
              <p className="text-sm text-zinc-600 mb-6">Enter your password to continue</p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

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
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password}
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
