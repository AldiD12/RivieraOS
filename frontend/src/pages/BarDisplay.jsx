import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const API_URL = 'http://localhost:5171/api';
const HUB_URL = 'http://localhost:5171/hubs/beach';
const VENUE_ID = 1; // Hotel Coral Beach

// Material Icons Component
const MaterialIcon = ({ name, className = "", filled = false }) => (
  <span className={`material-symbols-outlined ${className}`} style={{
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`
  }}>
    {name}
  </span>
);

export default function BarDisplay() {
  const [orders, setOrders] = useState([]);
  const [connection, setConnection] = useState(null);
  const audioRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedItems, setCheckedItems] = useState(new Set());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Add Material Symbols font if not already present
  useEffect(() => {
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Add JetBrains Mono font
    if (!document.querySelector('link[href*="JetBrains+Mono"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
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
                userId: orderData.userId,
                productId: orderData.productId,
                userName: orderData.userName,
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
      const response = await fetch(`${API_URL}/Orders/active/${VENUE_ID}`);
      const data = await response.json();
      
      // Map to display format
      const formattedOrders = data.map(order => ({
        id: order.id,
        sunbedCode: order.unitLabel || 'Unknown',
        items: order.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.unitPrice
        })),
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        assignedUserId: null,
        assignedUserName: null,
        userId: order.waiterId,
        productId: order.unitId,
        userName: order.waiterName,
        status: order.status,
        isPosSynced: order.isPosSynced
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const claimOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/Orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Preparing' }),
      });

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'Preparing', assignedUserId: 2, assignedUserName: 'Staff' }
              : order
          )
        );
        console.log('Order claimed and set to preparing');
      }
    } catch (error) {
      console.error('Error claiming order:', error);
    }
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const completeOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/Orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Delivered' }),
      });

      if (response.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const toggleItemCheck = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getElapsedTime = (dateString) => {
    const orderTime = new Date(dateString);
    const elapsed = Math.floor((currentTime - orderTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return { minutes, seconds, total: elapsed };
  };

  const getOrderPriority = (elapsed) => {
    if (elapsed >= 2520) return 'critical'; // 42+ minutes
    if (elapsed >= 1320) return 'warning'; // 22+ minutes  
    if (elapsed <= 60) return 'new'; // < 1 minute
    return 'normal';
  };

  const getOrderBorderClass = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-2 border-red-500 shadow-[0_0_15px_rgba(255,51,51,0.25)]';
      case 'warning':
        return 'border border-yellow-500/50';
      case 'new':
        return 'border border-cyan-500 shadow-[0_0_15px_rgba(0,229,255,0.25)]';
      default:
        return 'border border-zinc-800';
    }
  };

  const getTimerColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 animate-pulse';
      case 'warning':
        return 'text-yellow-500';
      case 'new':
        return 'text-cyan-500';
      default:
        return 'text-zinc-400';
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const lateOrders = orders.filter(order => {
      const elapsed = getElapsedTime(order.createdAt).total;
      return elapsed >= 2520; // 42+ minutes
    }).length;
    const readyOrders = orders.filter(order => order.status === 'Ready').length;
    
    if (orders.length === 0) return { total: 0, late: 0, ready: 0, avgTime: '14m' };
    
    const totalSeconds = orders.reduce((sum, order) => {
      const elapsed = getElapsedTime(order.createdAt).total;
      return sum + elapsed;
    }, 0);
    
    const avgSeconds = Math.floor(totalSeconds / orders.length);
    const avgMinutes = Math.floor(avgSeconds / 60);
    
    return {
      total: totalOrders,
      late: lateOrders,
      ready: readyOrders,
      avgTime: `${avgMinutes}m`
    };
  };

  const handleOrderAction = (order) => {
    const isAssigned = order.status === 'Preparing';
    
    if (!isAssigned) {
      claimOrder(order.id);
    } else {
      completeOrder(order.id);
    }
  };

  const stats = calculateStats();

  return (
    <div className="bg-zinc-950 text-gray-300 h-screen w-full overflow-hidden flex flex-row" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-900/50 border-r border-zinc-800 flex flex-col justify-between z-20">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <MaterialIcon name="terminal" className="text-cyan-500 mr-2 text-xl" />
            <h1 className="text-sm font-bold tracking-[0.15em] text-white uppercase">
              Riviera<span className="text-zinc-600">_</span>OS
            </h1>
          </div>
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Live Queue</h3>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-zinc-800 rounded text-white">
                  <MaterialIcon name="receipt_long" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white leading-none">{stats.total}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Total Orders</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Throughput</h3>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-zinc-800 rounded text-white">
                  <MaterialIcon name="timelapse" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white leading-none">{stats.avgTime}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Avg Prep Time</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Kitchen Crew</h3>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-zinc-800 rounded text-white">
                  <MaterialIcon name="groups" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white leading-none">5</div>
                  <div className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between text-zinc-400">
            <button className="hover:text-white transition-colors p-2 rounded hover:bg-zinc-800" title="Sound Settings">
              <MaterialIcon name="volume_up" />
            </button>
            <button className="hover:text-white transition-colors p-2 rounded hover:bg-zinc-800" title="Full Screen">
              <MaterialIcon name="fullscreen" />
            </button>
            <button className="hover:text-white transition-colors p-2 rounded hover:bg-zinc-800" title="Settings">
              <MaterialIcon name="settings" />
            </button>
          </div>
          <div className="mt-4 text-center">
            <span className="text-[10px] text-zinc-600 font-mono">v2.4.0-stable</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950 relative">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white tracking-tight">KITCHEN DISPLAY</h2>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400">ALL</span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold text-red-500">LATE ({stats.late})</span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold text-green-500">READY ({stats.ready})</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-white leading-none">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                })}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Orders Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          {orders.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-8xl font-black text-zinc-800 mb-6">00</div>
                <p className="text-3xl text-zinc-700 font-black tracking-tight uppercase">
                  No Pending Orders
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 items-start">
              {orders.map((order) => {
                const elapsed = getElapsedTime(order.createdAt);
                const priority = getOrderPriority(elapsed.total);
                const borderClass = getOrderBorderClass(priority);
                const timerColor = getTimerColor(priority);
                const isAssigned = order.status === 'Preparing';

                return (
                  <article 
                    key={order.id}
                    className={`flex flex-col bg-zinc-900 ${borderClass} rounded-lg overflow-hidden relative group h-full min-h-[380px] cursor-pointer hover:scale-[1.02] transition-transform`}
                    onClick={() => handleOrderAction(order)}
                  >
                    {priority === 'critical' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_10px_#ff3333]"></div>
                    )}
                    
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {order.userId ? 'WAITER' : 'QR-CODE'}
                          </span>
                          {order.id && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              #{order.id.slice(-4)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-3xl font-bold text-white">{order.sunbedCode}</h3>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold tabular-nums ${timerColor}`}>
                          {elapsed.minutes.toString().padStart(2, '0')}:{elapsed.seconds.toString().padStart(2, '0')}
                        </div>
                        {priority === 'critical' && (
                          <div className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Critical</div>
                        )}
                        {priority === 'new' && (
                          <div className="text-[10px] text-cyan-500 uppercase font-bold tracking-wider">New</div>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 flex-1">
                      <ul className="space-y-3">
                        {order.items.map((item, index) => {
                          const itemKey = `${order.id}-${index}`;
                          const isChecked = checkedItems.has(itemKey);
                          
                          return (
                            <li 
                              key={index}
                              className={`flex items-start group/item cursor-pointer ${isChecked ? 'opacity-50' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItemCheck(order.id, index);
                              }}
                            >
                              <MaterialIcon 
                                name={isChecked ? "check_box" : "check_box_outline_blank"}
                                className={`mr-2 text-xl ${isChecked ? 'text-green-500' : 'text-zinc-600 group-hover/item:text-white'}`}
                              />
                              <div>
                                <div className={`text-sm font-bold ${isChecked ? 'text-zinc-400 line-through' : 'text-white'}`}>
                                  <span className={`mr-1 ${priority === 'critical' ? 'text-red-500' : priority === 'warning' ? 'text-yellow-500' : 'text-zinc-500'}`}>
                                    {item.quantity}x
                                  </span> 
                                  {item.name}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="p-3 bg-zinc-800/50 mt-auto border-t border-zinc-800">
                      <button className="w-full bg-zinc-800 hover:bg-green-600 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] text-zinc-400 font-bold py-3 px-4 rounded transition-all duration-200 uppercase tracking-widest text-sm flex items-center justify-center gap-2 group/btn">
                        <span>{isAssigned ? 'Complete' : 'Start'}</span>
                        <MaterialIcon name="arrow_forward" className="text-lg group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: #09090b; }
          ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        `
      }} />

      {/* Hidden audio element for fallback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
