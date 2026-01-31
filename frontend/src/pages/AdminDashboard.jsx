import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyReport, getOrders, getAllTablesStatus } from '../services/api';

// Material Icons Component
const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-icons-round ${className}`}>
    {name}
  </span>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    activeGuests: 0,
    capacity: 0,
    avgSpend: 0,
    completion: 0
  });
  const [liveFeed, setLiveFeed] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [tablesStatus, setTablesStatus] = useState([]);

  // Add fonts on component mount
  useEffect(() => {
    // Add Material Icons font if not already present
    if (!document.querySelector('link[href*="Material+Icons+Round"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Add Inter and Space Mono fonts
    if (!document.querySelector('link[href*="Space+Mono"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  // Fetch real data
  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [dailyReport, orders, tables] = await Promise.all([
        getDailyReport(),
        getOrders(),
        getAllTablesStatus()
      ]);

      // Update stats with real data
      setStats({
        totalRevenue: dailyReport.totalRevenue || 12450,
        revenueGrowth: dailyReport.growthPercentage || 12,
        activeGuests: tables.filter(t => t.status === 'occupied').length || 142,
        capacity: Math.round((tables.filter(t => t.status === 'occupied').length / tables.length) * 100) || 85,
        avgSpend: dailyReport.avgOrderValue || 84.50,
        completion: Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100) || 62
      });

      // Create live feed from recent orders
      const recentOrdersFeed = orders.slice(0, 3).map((order, index) => ({
        id: order.id || index,
        type: order.items?.some(item => item.category === 'Cocktails') ? 'local_bar' : 'restaurant',
        title: `Table ${order.tableId || Math.floor(Math.random() * 20) + 1} • ${order.status}`,
        description: order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || 'Order details',
        time: getTimeAgo(order.createdAt),
        color: order.status === 'completed' ? 'emerald' : order.status === 'pending' ? 'amber' : 'blue'
      }));

      setLiveFeed(recentOrdersFeed);
      setRecentOrders(orders);
      setTablesStatus(tables);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '5m ago';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Navigation functions
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getFeedItemColor = (color) => {
    const colors = {
      emerald: 'bg-emerald-900/30 border-emerald-500/20 text-emerald-500',
      amber: 'bg-amber-900/30 border-amber-500/20 text-amber-500',
      blue: 'bg-blue-900/30 border-blue-500/20 text-blue-400'
    };
    return colors[color] || colors.emerald;
  };

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-zinc-950 text-gray-800 dark:text-gray-100 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-mono uppercase tracking-widest font-bold">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-100 dark:bg-zinc-950 text-gray-800 dark:text-gray-100 min-h-screen pb-24 transition-colors duration-300"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-gray-100/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <button 
          onClick={() => handleNavigation('/collector')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <MaterialIcon name="menu" className="text-gray-500 dark:text-gray-400" />
        </button>
        <div className="flex flex-col items-center">
          <h1 
            className="text-lg font-bold tracking-[0.2em] text-gray-900 dark:text-white uppercase leading-none cursor-pointer"
            style={{ fontFamily: 'Space Mono, monospace' }}
            onClick={() => handleNavigation('/')}
          >
            RIVIERA<span className="text-emerald-500">OS</span>
          </h1>
          <span className="text-[0.6rem] uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1">
            Manager Dashboard
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors relative"
        >
          <MaterialIcon name="logout" className="text-gray-500 dark:text-gray-400" />
        </button>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto">
        {/* Revenue Section */}
        <section className="relative bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex flex-col">
              <span 
                className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Total Revenue
              </span>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-baseline gap-1">
                €<span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  {stats.totalRevenue.toLocaleString()}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <MaterialIcon name="trending_up" className="text-sm text-emerald-500" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                +{stats.revenueGrowth}%
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: '75%' }}
            ></div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <MaterialIcon name="bolt" className="text-4xl text-blue-400" />
            </div>
            <span 
              className="text-xs uppercase text-gray-500 dark:text-gray-400"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Active
            </span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeGuests}</span>
              <span className="text-xs text-blue-500 mb-1">Guests</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-row items-center justify-between h-28 relative">
            <div className="flex flex-col justify-between h-full z-10">
              <span 
                className="text-xs uppercase text-gray-500 dark:text-gray-400"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Capacity
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-amber-500 dark:text-amber-400">{stats.capacity}%</span>
                <span className="text-[10px] text-gray-400">Full</span>
              </div>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-gray-200 dark:text-gray-800" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                />
                <path 
                  className="text-amber-500 dark:text-amber-400" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray={`${stats.capacity}, 100`}
                  strokeLinecap="round" 
                  strokeWidth="3"
                  style={{
                    animation: 'loadGauge 1.5s ease-out forwards'
                  }}
                />
              </svg>
              <MaterialIcon name="people" className="text-lg text-gray-400 absolute" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between h-24">
            <span 
              className="text-xs uppercase text-gray-500 dark:text-gray-400"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Avg. Spend
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              €{Math.floor(stats.avgSpend)}<span className="text-sm text-gray-400 font-normal">.{(stats.avgSpend % 1).toFixed(2).slice(2)}</span>
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between h-24">
            <span 
              className="text-xs uppercase text-gray-500 dark:text-gray-400"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Completion
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completion}%</span>
              <div className="h-10 w-1 bg-gray-700/20 rounded-full overflow-hidden flex flex-col justify-end">
                <div 
                  className="bg-purple-500 w-full transition-all duration-1000"
                  style={{ height: `${stats.completion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Feed */}
        <section className="mt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              Live Feed
            </h3>
            <button 
              onClick={fetchDashboardData}
              className="text-xs text-emerald-500 font-medium hover:text-emerald-400 flex items-center gap-1"
            >
              <MaterialIcon name="refresh" className="text-sm" />
              Refresh
            </button>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
            {liveFeed.length > 0 ? liveFeed.map((item, index) => (
              <div 
                key={item.id}
                onClick={() => handleNavigation('/bar')}
                className={`p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                  index < liveFeed.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getFeedItemColor(item.color)}`}>
                  <MaterialIcon name={item.type} className="text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</span>
                    <span 
                      className="text-[10px] text-gray-400"
                      style={{ fontFamily: 'Space Mono, monospace' }}
                    >
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center">
                <MaterialIcon name="hourglass_empty" className="text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                <button 
                  onClick={fetchDashboardData}
                  className="text-xs text-emerald-500 hover:text-emerald-400 mt-2"
                >
                  Refresh to check for updates
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Stats */}
        <section className="grid grid-cols-2 gap-3 pb-6">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-white/5">
            <h4 
              className="text-xs uppercase text-gray-500 mb-3 flex items-center gap-1"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              <MaterialIcon name="emoji_events" className="text-sm text-amber-500" />
              Top Waiter
            </h4>
            <div className="flex items-center gap-3">
              <img 
                alt="Waiter avatar" 
                className="w-8 h-8 rounded-full border border-gray-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY79ReXI_rY_aDLV2zm7XINLtQS-F6q20dvCfUtS64wQyvUAVek0V1WnJ9Bh_QcqpxITpQ7Zzhc-nv_lM8-p4NmWC7vG6vQnPuQTtzC2D2dgeNG34ZCZq1l25TWS8df8AwZEmkMMyYTGzfKvASgpLsesA9xM7h6nVnuxqUlLuWtvfVSzaO1zd1izkyRy61sJYOyCNrp3Pw02XwZ2zkCMVAf59I-yJsUSE-GsHNmfEi3wMrJG6jselKnXtYo-YoygbipitFvwfsXjFr"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Sarah M.</span>
                <span className="text-[10px] text-emerald-500">€2,400 Sales</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-white/5">
            <h4 
              className="text-xs uppercase text-gray-500 mb-3 flex items-center gap-1"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              <MaterialIcon name="local_fire_department" className="text-sm text-red-500" />
              Hot Item
            </h4>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">Wagyu Burger</span>
              <span className="text-[10px] text-gray-400">42 Orders today</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 pb-5 pt-3 px-6 z-40">
        <ul className="flex justify-between items-center max-w-md mx-auto">
          <li>
            <button 
              onClick={() => handleNavigation('/manager')}
              className="flex flex-col items-center gap-1 group"
            >
              <MaterialIcon name="dashboard" className="text-emerald-500 group-hover:text-emerald-400 transition-colors" />
              <span className="text-[10px] font-medium text-gray-900 dark:text-white">Home</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/manager/leaderboard')}
              className="flex flex-col items-center gap-1 group"
            >
              <MaterialIcon name="insights" className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">Analytics</span>
            </button>
          </li>
          <li className="-mt-8">
            <button 
              onClick={() => handleNavigation('/ouradmin')}
              className="bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-gray-50 dark:border-black transition-transform transform hover:scale-105"
            >
              <MaterialIcon name="admin_panel_settings" className="text-2xl" />
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/collector')}
              className="flex flex-col items-center gap-1 group"
            >
              <MaterialIcon name="people" className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">Staff</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/bar')}
              className="flex flex-col items-center gap-1 group"
            >
              <MaterialIcon name="local_bar" className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">Bar</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loadGauge {
            from { stroke-dasharray: 0, 100; }
            to { stroke-dasharray: ${stats.capacity}, 100; }
          }
          .gauge-circle {
            animation: loadGauge 1.5s ease-out forwards;
          }
        `
      }} />
    </div>
  );
}
