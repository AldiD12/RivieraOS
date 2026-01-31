import { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const API_URL = 'http://localhost:5171/api';
const HUB_URL = 'http://localhost:5171/hubs/beach';
const VENUE_ID = 1; // Hotel Coral Beach

// Material Icons Component
const MaterialIcon = ({ name, className = "", filled = true }) => (
  <span className={`material-symbols-outlined ${className}`} style={{
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`
  }}>
    {name}
  </span>
);

export default function CollectorDashboard() {
  const [zones, setZones] = useState([
    { id: 1, name: 'VIP ZONE', status: 'green', flag: 'GREEN FLAG' },
    { id: 2, name: 'FAMILY ZONE', status: 'yellow', flag: 'YELLOW FLAG' },
    { id: 3, name: 'PUBLIC AREA', status: 'red', flag: 'RED FLAG' }
  ]);
  const [connection, setConnection] = useState(null);
  const [currentUser, setCurrentUser] = useState('Manager Alex');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Add fonts on component mount
  useEffect(() => {
    // Add Material Symbols font if not already present
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Add Noto fonts
    if (!document.querySelector('link[href*="Noto"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Noto+Sans:wght@400;500;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  // Setup SignalR connection
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  // Start SignalR connection and listen for updates
  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Beach Commander - SignalR Connected');

          connection.on('ZoneStatusUpdate', (data) => {
            updateZoneStatus(data.zoneId, data.status);
          });
        })
        .catch((err) => console.error('SignalR Connection Error:', err));
    }

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  const updateZoneStatus = (zoneId, newStatus) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId
          ? { 
              ...zone, 
              status: newStatus, 
              flag: `${newStatus.toUpperCase()} FLAG` 
            }
          : zone
      )
    );
    setLastUpdated(new Date());
  };

  const handleZoneStatusChange = async (zoneId, newStatus) => {
    try {
      // Update local state immediately for better UX
      updateZoneStatus(zoneId, newStatus);

      // Send to backend (mock for now due to CORS)
      try {
        // In production, this would call the API
        console.log(`Updating zone ${zoneId} to ${newStatus}`);
        // Simulate API success
      } catch (error) {
        console.error('Failed to update zone status:', error);
      }
    } catch (error) {
      console.error('Error updating zone status:', error);
    }
  };

  const handleEmergencyOverride = async () => {
    try {
      // Set all zones to red
      const updatedZones = zones.map(zone => ({
        ...zone,
        status: 'red',
        flag: 'RED FLAG'
      }));
      setZones(updatedZones);
      setLastUpdated(new Date());

      // Send emergency override to backend (mock for now due to CORS)
      try {
        console.log('Emergency override: setting all zones to red');
        // In production, this would call the API
      } catch (error) {
        console.error('Error setting emergency override:', error);
      }
    } catch (error) {
      console.error('Error setting emergency override:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'green':
        return {
          bg: 'bg-green-500/10 dark:bg-green-500/20',
          text: 'text-green-600',
          icon: 'check_circle',
          label: 'OPEN'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
          text: 'text-yellow-600',
          icon: 'warning',
          label: 'CAUTION'
        };
      case 'red':
        return {
          bg: 'bg-red-500/10 dark:bg-red-500/20',
          text: 'text-red-600',
          icon: 'block',
          label: 'CLOSED'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-600',
          icon: 'help',
          label: 'UNKNOWN'
        };
    }
  };

  const getFlagButton = (currentStatus, targetStatus, zoneId) => {
    const isActive = currentStatus === targetStatus;
    const colors = {
      green: {
        active: 'bg-green-500 text-white shadow-[0_0_15px_rgba(46,204,113,0.6)] ring-2 ring-green-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800',
        inactive: 'bg-gray-100 dark:bg-white/5 border border-transparent hover:border-green-500/50 hover:bg-green-500/10 text-gray-300 hover:text-green-500'
      },
      yellow: {
        active: 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(241,196,15,0.6)] ring-2 ring-yellow-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800',
        inactive: 'bg-gray-100 dark:bg-white/5 border border-transparent hover:border-yellow-500/50 hover:bg-yellow-500/10 text-gray-300 hover:text-yellow-500'
      },
      red: {
        active: 'bg-red-500 text-white shadow-[0_0_15px_rgba(242,13,13,0.6)] ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800',
        inactive: 'bg-gray-100 dark:bg-white/5 border border-transparent hover:border-red-500/50 hover:bg-red-500/10 text-gray-300 hover:text-red-500'
      }
    };

    return (
      <button
        onClick={() => handleZoneStatusChange(zoneId, targetStatus)}
        className={`w-full h-full rounded-xl flex items-center justify-center transition-all ${
          isActive ? colors[targetStatus].active : colors[targetStatus].inactive
        }`}
      >
        <MaterialIcon name="flag" className="text-3xl drop-shadow-md" />
        <span className="sr-only">Set {targetStatus}</span>
      </button>
    );
  };

  return (
    <div 
      className="bg-[#f8f5f5] dark:bg-[#221010] min-h-screen flex flex-col antialiased text-[#181111] dark:text-gray-100 transition-colors duration-200"
      style={{ fontFamily: '"Noto Serif", serif' }}
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#1a0f0f]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col items-center w-full">
            <h1 className="text-xl font-bold tracking-tight uppercase text-center">Grand Blue Resort</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span 
                className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase"
                style={{ fontFamily: '"Noto Sans", sans-serif' }}
              >
                Live Status
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full gap-6 pb-12">
        {/* Emergency Override */}
        <section aria-label="Emergency Controls">
          <button 
            onClick={handleEmergencyOverride}
            className="relative w-full overflow-hidden group rounded-2xl bg-red-500 text-white shadow-xl shadow-red-500/30 active:scale-[0.98] transition-transform duration-150"
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            {/* Striped background pattern for warning effect */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'
              }}
            ></div>
            <div className="relative flex flex-col items-center justify-center py-6 px-4">
              <MaterialIcon name="warning" className="text-4xl mb-2 animate-pulse" />
              <span className="text-lg font-bold tracking-wider leading-tight text-center">SET ENTIRE BEACH TO RED</span>
              <span 
                className="text-[10px] opacity-80 mt-1"
                style={{ fontFamily: '"Noto Sans", sans-serif' }}
              >
                EMERGENCY OVERRIDE
              </span>
            </div>
          </button>
        </section>

        {/* Zones List */}
        <div className="flex flex-col gap-5">
          {zones.map((zone) => {
            const badge = getStatusBadge(zone.status);
            
            return (
              <article 
                key={zone.id}
                className="bg-white dark:bg-[#2a1515] rounded-2xl p-5 shadow-md border border-gray-100 dark:border-white/5 relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 ${badge.bg} px-4 py-1.5 rounded-bl-2xl`}>
                  <p 
                    className={`text-xs font-bold ${badge.text} tracking-wide flex items-center gap-1`}
                    style={{ fontFamily: '"Noto Sans", sans-serif' }}
                  >
                    <MaterialIcon name={badge.icon} className="text-[14px]" />
                    {badge.label}
                  </p>
                </div>

                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                    {zone.name}
                  </h2>
                  <p 
                    className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                    style={{ fontFamily: '"Noto Sans", sans-serif' }}
                  >
                    Currently: <span className={`font-bold ${badge.text}`}>{zone.flag}</span>
                  </p>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-3 gap-3 h-20">
                  {getFlagButton(zone.status, 'green', zone.id)}
                  {getFlagButton(zone.status, 'yellow', zone.id)}
                  {getFlagButton(zone.status, 'red', zone.id)}
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer Info */}
        <footer className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-10 bg-gray-300 dark:bg-gray-700"></div>
            <MaterialIcon name="waves" className="text-gray-400 text-sm" />
            <div className="h-px w-10 bg-gray-300 dark:bg-gray-700"></div>
          </div>
          <p 
            className="text-xs text-gray-400"
            style={{ fontFamily: '"Noto Sans", sans-serif' }}
          >
            Last updated: {lastUpdated.toLocaleTimeString()}<br/>
            Logged in as: <span className="font-bold text-gray-600 dark:text-gray-300">{currentUser}</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
