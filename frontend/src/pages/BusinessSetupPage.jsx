import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, QrCode, Shield, AlertCircle } from 'lucide-react';

export default function BusinessSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [businessCode, setBusinessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);

  useEffect(() => {
    // Check for error parameters from QR code setup
    const errorParam = searchParams.get('error');
    if (errorParam === 'invalid_code') {
      setError('Invalid business code. Please try again or contact support.');
    } else if (errorParam === 'network') {
      setError('Network error. Please check your connection and try again.');
    }
  }, [searchParams]);

  const handleBusinessCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!businessCode || businessCode.length !== 6) {
      setError('Business code must be exactly 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock business validation - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock business data based on code
      const mockBusinesses = {
        'CORAL1': {
          id: 1,
          name: 'Hotel Coral Beach',
          location: 'Saranda, Albania',
          type: 'Beach Resort',
          setupCode: 'CORAL1'
        },
        'MARINA': {
          id: 2,
          name: 'Marina Resort',
          location: 'Vlora, Albania',
          type: 'Marina Hotel',
          setupCode: 'MARINA'
        },
        'MOUNT1': {
          id: 3,
          name: 'Mountain Lodge',
          location: 'Berat, Albania',
          type: 'Mountain Resort',
          setupCode: 'MOUNT1'
        }
      };

      const businessData = mockBusinesses[businessCode.toUpperCase()];
      
      if (businessData) {
        // Save business configuration
        localStorage.setItem('business_id', businessData.id.toString());
        localStorage.setItem('business_data', JSON.stringify(businessData));
        
        console.log('Business setup successful:', businessData);
        
        // Redirect to login
        navigate('/login');
      } else {
        setError('Invalid business code. Try: CORAL1, MARINA, or MOUNT1');
      }
    } catch (error) {
      console.error('Business setup error:', error);
      setError('Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminSetup = () => {
    // Navigate to SuperAdmin login for business selection
    navigate('/superadmin/login?setup=true');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Business Setup</h1>
          <p className="text-zinc-600">Configure this device for your business</p>
        </div>

        {/* Setup Options */}
        <div className="space-y-4 mb-8">
          {/* QR Code Setup */}
          <div className="bg-white border border-zinc-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <QrCode className="w-6 h-6 text-zinc-700 mr-3" />
              <h3 className="font-bold text-zinc-900">QR Code Setup</h3>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Scan the QR code provided by your business owner for instant setup.
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-center">
              <QrCode className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Point your camera at the QR code</p>
            </div>
          </div>

          {/* Manual Setup */}
          <div className="bg-white border border-zinc-200 rounded-lg p-6">
            <h3 className="font-bold text-zinc-900 mb-4">Manual Setup</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleBusinessCodeSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Business Code
                </label>
                <input
                  type="text"
                  value={businessCode}
                  onChange={(e) => {
                    setBusinessCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-center text-lg font-mono tracking-widest"
                  disabled={loading}
                />
                <p className="text-xs text-zinc-500 mt-1 text-center">
                  Ask your business owner for this code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || businessCode.length !== 6}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validating...' : 'Setup Business'}
              </button>
            </form>
          </div>

          {/* SuperAdmin Setup */}
          <div className="bg-white border border-zinc-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-zinc-700 mr-3" />
              <h3 className="font-bold text-zinc-900">Administrator Setup</h3>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Business owners and administrators can configure the device directly.
            </p>
            <button
              onClick={handleSuperAdminSetup}
              className="w-full border border-zinc-300 text-zinc-700 py-3 rounded-lg font-bold hover:border-zinc-400 hover:bg-zinc-50 transition-all"
            >
              Administrator Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-zinc-500">
            Need help? Contact RivieraOS Support
          </p>
        </div>
      </div>
    </div>
  );
}