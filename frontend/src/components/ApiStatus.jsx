import { useState, useEffect } from 'react';
import { checkApiHealth, API_CONFIG } from '../services/apiConfig';

export default function ApiStatus() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const status = await checkApiHealth();
      setApiStatus(status);
      setLoading(false);
    };

    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs">
        Checking API...
      </div>
    );
  }

  const getStatusColor = () => {
    if (apiStatus?.status === 'mock') return 'bg-blue-600';
    if (apiStatus?.healthy) return 'bg-green-600';
    return 'bg-red-600';
  };

  const getStatusText = () => {
    if (apiStatus?.status === 'mock') return 'MOCK DATA';
    if (apiStatus?.healthy) return `${apiStatus.status.toUpperCase()} API`;
    return `${apiStatus.status.toUpperCase()} OFFLINE`;
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${getStatusColor()} text-white px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2`}>
      <div className={`w-2 h-2 rounded-full ${apiStatus?.healthy || apiStatus?.status === 'mock' ? 'bg-white animate-pulse' : 'bg-red-300'}`}></div>
      {getStatusText()}
    </div>
  );
}