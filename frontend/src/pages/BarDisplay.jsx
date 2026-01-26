import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Check } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const HUB_URL = 'http://localhost:5000/hubs/beach';
const VENUE_ID = 1; // Hotel Coral Beach

export default function BarDisplay() {
  const [orders, setOrders] = useState([]);
  const [connection, setConnection] = useState(null);
  const audioRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current user from localStorage
  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (role && token) {
      setCurrentUser({ role });
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

  // Start SignalR connection and listen for new orders
  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Bar Display - SignalR Connected');

          // Listen for new orders
          connection.on('NewOrder', (orderData) => {
            console.log('New order received:', orderData);
            
            // Play notification sound
            playNotificationSound();
            
            // Add order to display
            setOrders((prevOrders) => [
              {
                id: orderData.orderId,
                sunbedCode: orderData.sunbedCode,
                items: orderData.items,
                totalAmount: orderData.totalAmount,
                createdAt: orderData.createdAt,
                assignedUserId: null,
                assignedUserName: null,
              },
              ...prevOrders,
            ]);
          });

          // Listen for order assignments
          connection.on('OrderAssigned', (data) => {
            console.log('Order assigned:', data);
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === data.orderId
                  ? { ...order, assignedUserId: data.assignedUserId, assignedUserName: data.assignedUserName }
                  : order
              )
            );
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

  // Fetch existing orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/order?venueId=${VENUE_ID}&status=0`); // Status 0 = Pending
      const data = await response.json();
      
      // Map to display format
      const formattedOrders = data.map(order => ({
        id: order.id,
        sunbedCode: order.sunbedCode || `Bed ${order.productId}`,
        items: order.items,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        assignedUserId: order.assignedUserId,
        assignedUserName: order.assignedUserName,
        assignedAt: order.assignedAt,
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const claimOrder = async (orderId) => {
    // For now, use a hardcoded user ID (in production, get from auth token)
    const userId = 2; // Collector user ID from seed data
    
    try {
      const response = await fetch(`${API_URL}/order/${orderId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Update will come via SignalR
        console.log('Order claimed successfully');
      }
    } catch (error) {
      console.error('Error claiming order:', error);
    }
  };

  const playNotificationSound = () => {
    // Create audio context and play a simple beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const completeOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/order/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 2 }), // 2 = Completed
      });

      if (response.ok) {
        // Remove from display
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const getElapsedTime = (dateString) => {
    const orderTime = new Date(dateString);
    const elapsed = Math.floor((currentTime - orderTime) / 1000); // seconds
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return { minutes, seconds, total: elapsed };
  };

  const getTimerColor = (seconds) => {
    if (seconds < 300) return 'text-emerald-400'; // < 5 min - Green
    if (seconds < 600) return 'text-yellow-400'; // < 10 min - Yellow
    return 'text-red-400'; // >= 10 min - Red
  };

  const getCardBorderClass = (order, elapsed) => {
    const isAssigned = order.assignedUserId !== null;
    const isAssignedToMe = order.assignedUserId === 2;
    
    if (elapsed >= 600) {
      // LATE (>10 mins) - Red border
      return 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    } else if (isAssigned && isAssignedToMe) {
      // CLAIMED by me - Bronze/Gold border with glow
      return 'border-[#9f7928] shadow-[0_0_30px_rgba(159,121,40,0.4)] bg-zinc-900/80';
    } else if (isAssigned) {
      // CLAIMED by someone else - Dimmed
      return 'border-zinc-800 opacity-40';
    } else {
      // NEW - Pulsing white border
      return 'border-white animate-pulse';
    }
  };

  const calculateStats = () => {
    if (orders.length === 0) return { pending: 0, avgTime: '0m 00s' };
    
    const totalSeconds = orders.reduce((sum, order) => {
      const elapsed = getElapsedTime(order.createdAt).total;
      return sum + elapsed;
    }, 0);
    
    const avgSeconds = Math.floor(totalSeconds / orders.length);
    const avgMinutes = Math.floor(avgSeconds / 60);
    const avgSecs = avgSeconds % 60;
    
    return {
      pending: orders.length,
      avgTime: `${avgMinutes}m ${avgSecs.toString().padStart(2, '0')}s`
    };
  };

  const handleCardClick = (order) => {
    const isAssigned = order.assignedUserId !== null;
    const isAssignedToMe = order.assignedUserId === 2;
    
    if (!isAssigned) {
      // Single tap claims the order
      claimOrder(order.id);
    } else if (isAssignedToMe) {
      // If already claimed by me, complete it
      completeOrder(order.id);
    }
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Global Header - The Cockpit HUD */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-8 py-6">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          {/* Left - Stats Ticker */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xs font-geist-mono uppercase tracking-[0.3em] text-zinc-600 mb-1">
                Pending
              </div>
              <div className="text-5xl font-black tabular-nums text-white">
                {stats.pending}
              </div>
            </div>
            <div className="w-px h-12 bg-zinc-800"></div>
            <div>
              <div className="text-xs font-geist-mono uppercase tracking-[0.3em] text-zinc-600 mb-1">
                Avg Time
              </div>
              <div className="text-2xl font-geist-mono font-bold tabular-nums text-zinc-400">
                {stats.avgTime}
              </div>
            </div>
          </div>

          {/* Right - The Clock (The Only God) */}
          <div className="text-right">
            <div className="text-xs font-geist-mono uppercase tracking-[0.3em] text-zinc-600 mb-2">
              Current Time
            </div>
            <div className="text-7xl font-geist-mono font-black tabular-nums tracking-tighter text-white">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Orders - Masonry Grid */}
      <div className="p-8">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="text-center">
              <div className="text-8xl font-black text-zinc-800 mb-6">00</div>
              <p className="text-3xl text-zinc-700 font-black tracking-tight uppercase">
                No Pending Orders
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-[2000px] mx-auto">
            {orders.map((order) => {
              const elapsed = getElapsedTime(order.createdAt);
              const timerColor = getTimerColor(elapsed.total);
              const borderClass = getCardBorderClass(order, elapsed.total);
              const isAssigned = order.assignedUserId !== null;
              const isAssignedToMe = order.assignedUserId === 2;

              return (
                <div
                  key={order.id}
                  onClick={() => handleCardClick(order)}
                  className={`bg-zinc-900 border-2 rounded-lg p-6 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${borderClass}`}
                >
                  {/* Header - Table + Timer */}
                  <div className="flex items-start justify-between mb-8">
                    {/* Table Number - MASSIVE */}
                    <div className="text-8xl font-geist-sans font-black tracking-tighter text-white leading-none">
                      {order.sunbedCode}
                    </div>

                    {/* Timer + Checkmark */}
                    <div className="text-right">
                      {isAssignedToMe && (
                        <div className="mb-2">
                          <Check className="w-8 h-8 text-[#9f7928]" />
                        </div>
                      )}
                      <div className={`text-3xl font-geist-mono font-black tabular-nums ${timerColor}`}>
                        {elapsed.minutes.toString().padStart(2, '0')}:{elapsed.seconds.toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>

                  {/* Body - The Drinks (NO PRICES) */}
                  <div className="space-y-5">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-5">
                        {/* Quantity - MASSIVE, BOLD, MONO */}
                        <div className="text-5xl font-geist-mono font-black text-white tabular-nums min-w-[80px]">
                          {item.quantity}×
                        </div>
                        {/* Item Name - LARGE, SANS */}
                        <div className="text-3xl font-geist-sans font-bold text-zinc-200 leading-tight">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Visual Feedback for State */}
                  {isAssigned && !isAssignedToMe && (
                    <div className="mt-6 pt-6 border-t border-zinc-800">
                      <div className="text-sm font-geist-mono uppercase tracking-[0.3em] text-zinc-600">
                        Claimed by {order.assignedUserName}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden audio element for fallback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
