import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBusinessSetup();
  }, []);

  const checkBusinessSetup = async () => {
    try {
      // Check for QR code setup parameter
      const businessCode = searchParams.get('bid');
      if (businessCode) {
        // QR code setup flow
        await handleQRSetup(businessCode);
        return;
      }

      // Check if business is already configured
      const businessId = localStorage.getItem('business_id');
      const businessData = localStorage.getItem('business_data');

      if (businessId && businessData) {
        // Business already configured - go to login
        console.log('Business already configured:', JSON.parse(businessData));
        navigate('/login');
      } else {
        // No business configured - go to setup
        navigate('/setup');
      }
    } catch (error) {
      console.error('Error checking business setup:', error);
      navigate('/setup');
    } finally {
      setLoading(false);
    }
  };

  const handleQRSetup = async (businessCode) => {
    try {
      setLoading(true);
      
      // Mock business validation
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

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const businessData = mockBusinesses[businessCode.toUpperCase()];
      
      if (businessData) {
        // Save business configuration
        localStorage.setItem('business_id', businessData.id.toString());
        localStorage.setItem('business_data', JSON.stringify(businessData));
        
        console.log('QR Setup successful:', businessData);
        
        // Redirect to login with business context
        navigate('/login');
      } else {
        // Invalid business code - go to manual setup
        console.error('Invalid business code');
        navigate('/setup?error=invalid_code');
      }
    } catch (error) {
      console.error('QR setup error:', error);
      navigate('/setup?error=network');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">RivieraOS</h1>
          <p className="text-zinc-600">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return null; // This component just handles routing logic
}