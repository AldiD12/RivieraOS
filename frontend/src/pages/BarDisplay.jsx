import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://blackbear-services-core.azurewebsites.net';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, pending, preparing, ready

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

  // Fetch active orders on mount and every 10 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // GET /api/business/Orders/active - Get active orders (Pending, Preparing, Ready)
      const response = await axios.get(`${API_BASE_URL}/api/business/Orders/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // PUT /api/business/Orders/{id}/status
      await axios.put(
        `${API_BASE_URL}/api/business/Orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Play success sound
      playSuccessSound();

      // Refresh orders
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.response?.data || 'Failed to update order status');
    }
  };

  const handleOrderAction = (order) => {
    // Status transitions: Pending → Preparing → Ready → Delivered
    if (order.status === 'Pending') {
      updateOrderStatus(order.id, 'Preparing');
    } else if (order.status === 'Preparing') {
      updateOrderStatus(order.id, 'Ready');
    } else if (order.status === 'Ready') {
      updateOrderStatus(order.id, 'Delivered');
    }
  };

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
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
    if (elapsed >= 1800) return 'critical'; // 30+ minutes
    if (elapsed >= 900) return 'warning'; // 15+ minutes  
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Preparing':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'Ready':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getActionButtonText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Start Preparing';
      case 'Preparing':
        return 'Mark Ready';
      case 'Ready':
        return 'Complete';
      default:
        return 'Update';
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
    const readyOrders = orders.filter(o => o.status === 'Ready').length;
    const lateOrders = orders.filter(order => {
      const elapsed = getElapsedTime(order.createdAt).total;
      return elapsed >= 1800; // 30+ minutes
    }).length;
    
    if (orders.length === 0) return { total: 0, pending: 0, preparing: 0, ready: 0, late: 0, avgTime: '0m' };
    
    const totalSeconds = orders.reduce((sum, order) => {
      const elapsed = getElapsedTime(order.createdAt).total;
      return sum + elapsed;
    }, 0);
    
    const avgSeconds = Math.floor(totalSeconds / orders.length);
    const avgMinutes = Math.floor(avgSeconds / 60);
    
    return {
      total: totalOrders,
      pending: pendingOrders,
      preparing: preparingOrders,
      ready: readyOrders,
      late: lateOrders,
      avgTime: `${avgMinutes}m`
    };
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return order.status === 'Pending';
    if (selectedFilter === 'preparing') return order.status === 'Preparing';
    if (selectedFilter === 'ready') return order.status === 'Ready';
    return true;
  });

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="bg-zinc-950 text-white h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">Loading...</div>
          <div className="text-zinc-500">Connecting to kitchen system</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-950 text-white h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4 text-red-500">Error</div>
          <div className="text-zinc-400">{error}</div>
          <button 
            onClick={fetchOrders}
            className="mt-6 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-gray-300 h-screen w-full overflow-hidden flex flex-row" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-900/50 border-r border-zinc-800 flex flex-col justify-between z-20">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <MaterialIcon name="local_bar" className="text-cyan-500 mr-2 text-xl" />
            <h1 className="text-sm font-bold tracking-[0.15em] text-white uppercase">
              Bar<span className="text-zinc-600">_</span>Display
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
                  <div className="text-[10px] text-zinc-500 mt-1">Active Orders</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Pending</span>
                  <span className="text-sm font-bold text-yellow-500">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Preparing</span>
                  <span className="text-sm font-bold text-blue-500">{stats.preparing}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Ready</span>
                  <span className="text-sm font-bold text-green-500">{stats.ready}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Performance</h3>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-zinc-800 rounded text-white">
                  <MaterialIcon name="timelapse" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white leading-none">{stats.avgTime}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Avg Time</div>
                </div>
              </div>
            </div>

            {stats.late > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <MaterialIcon name="warning" className="text-red-500 text-sm" />
                  <span className="text-xs font-bold text-red-500 uppercase">Alert</span>
                </div>
                <div className="text-lg font-bold text-red-500">{stats.late}</div>
                <div className="text-[10px] text-red-400">Orders over 30min</div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
          <button 
            onClick={fetchOrders}
            className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold"
          >
            <MaterialIcon name="refresh" />
            Refresh
          </button>
          <div className="mt-4 text-center">
            <span className="text-[10px] text-zinc-600 font-mono">Auto-refresh: 10s</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950 relative">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white tracking-tight">BARTENDER DASHBOARD</h2>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  selectedFilter === 'all' 
                    ? 'bg-white text-black' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                ALL ({stats.total})
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  selectedFilter === 'pending' 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-zinc-900 border border-zinc-800 text-yellow-500 hover:bg-yellow-500/10'
                }`}
              >
                PENDING ({stats.pending})
              </button>
              <button
                onClick={() => setSelectedFilter('preparing')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  selectedFilter === 'preparing' 
                    ? 'bg-blue-500 text-black' 
                    : 'bg-zinc-900 border border-zinc-800 text-blue-500 hover:bg-blue-500/10'
                }`}
              >
                PREPARING ({stats.preparing})
              </button>
              <button
                onClick={() => setSelectedFilter('ready')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  selectedFilter === 'ready' 
                    ? 'bg-green-500 text-black' 
                    : 'bg-zinc-900 border border-zinc-800 text-green-500 hover:bg-green-500/10'
                }`}
              >
                READY ({stats.ready})
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-white leading-none font-mono">
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
          {filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-8xl font-black text-zinc-800 mb-6">00</div>
                <p className="text-3xl text-zinc-700 font-black tracking-tight uppercase">
                  {selectedFilter === 'all' ? 'No Active Orders' : `No ${selectedFilter} Orders`}
                </p>
                <p className="text-sm text-zinc-600 mt-4">Orders will appear here automatically</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 items-start">
              {filteredOrders.map((order) => {
                const elapsed = getElapsedTime(order.createdAt);
                const priority = getOrderPriority(elapsed.total);
                const borderClass = getOrderBorderClass(priority);
                const timerColor = getTimerColor(priority);

                return (
                  <article 
                    key={order.id}
                    className={`flex flex-col bg-zinc-900 ${borderClass} rounded-lg overflow-hidden relative group h-full min-h-[380px]`}
                  >
                    {priority === 'critical' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_10px_#ff3333]"></div>
                    )}
                    
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{order.zoneName || 'Zone'}</h3>
                        {order.customerName && (
                          <p className="text-xs text-zinc-500 mt-1">{order.customerName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold tabular-nums font-mono ${timerColor}`}>
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
                        {order.items && order.items.map((item, index) => {
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
                                className={`mr-2 text-xl flex-shrink-0 ${isChecked ? 'text-green-500' : 'text-zinc-600 group-hover/item:text-white'}`}
                              />
                              <div className="flex-1">
                                <div className={`text-sm font-bold ${isChecked ? 'text-zinc-400 line-through' : 'text-white'}`}>
                                  <span className={`mr-1 ${priority === 'critical' ? 'text-red-500' : priority === 'warning' ? 'text-yellow-500' : 'text-zinc-500'}`}>
                                    {item.quantity}x
                                  </span> 
                                  {item.productName}
                                </div>
                                {item.notes && (
                                  <div className="text-xs text-zinc-500 mt-1 italic">Note: {item.notes}</div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      
                      {order.notes && (
                        <div className="mt-4 p-2 bg-zinc-800/50 rounded border border-zinc-700">
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Order Notes</div>
                          <div className="text-xs text-zinc-300">{order.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="p-3 bg-zinc-800/50 mt-auto border-t border-zinc-800">
                      <button 
                        onClick={() => handleOrderAction(order)}
                        className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded transition-all duration-200 uppercase tracking-widest text-sm flex items-center justify-center gap-2 group/btn"
                      >
                        <span>{getActionButtonText(order.status)}</span>
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
    </div>
  );
}
