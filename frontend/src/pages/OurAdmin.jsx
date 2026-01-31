import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5171/api';

// Material Icons Component
const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>
    {name}
  </span>
);

export default function OurAdmin() {
  const [currentView, setCurrentView] = useState('business'); // business, analytics, warroom
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 124592,
    avgOrder: 84.50,
    activeTables: 42,
    revenueGrowth: 12,
    orderGrowth: 5.2,
    tableGrowth: -2.1
  });

  // Add fonts on component mount
  useEffect(() => {
    // Add Material Icons font if not already present
    if (!document.querySelector('link[href*="Material+Symbols+Outlined"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Add Space Grotesk and other fonts
    if (!document.querySelector('link[href*="Space+Grotesk"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  const BusinessDashboard = () => (
    <div 
      className="bg-gray-100 dark:bg-[#102216] min-h-screen text-slate-900 dark:text-white overflow-x-hidden selection:bg-[#0df259] selection:text-black"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-gray-100/95 dark:bg-[#102216]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#234230] px-4 py-3 flex items-center justify-between">
        <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#162e20] transition-colors text-slate-600 dark:text-white">
          <MaterialIcon name="arrow_back" className="text-xl" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-slate-500 dark:text-[#9cbaa6]">Client #8821</h1>
        <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#162e20] transition-colors text-slate-600 dark:text-white">
          <MaterialIcon name="more_vert" className="text-xl" />
        </button>
      </header>

      <main className="flex flex-col gap-6 pb-12">
        {/* Business Profile Header */}
        <section className="px-4 pt-6">
          <div className="flex flex-col items-center gap-5">
            <div className="relative group">
              <div 
                className="h-28 w-28 rounded-xl bg-cover bg-center shadow-lg ring-4 ring-gray-200 dark:ring-[#162e20]" 
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyzZLvhZWR5o1PFaEhW93LjD3FDfa3r3XsbiFkjcM0Ki9tgbhQsTCC7ucLUlucGi7KY3ytQgOe53MnbhiiJMvIIBicULqV8HA5r5uKYlobzCB0BAQzI3DRV6N76STYUO3Q16bbzpNeMomZCMKi9jyMW3QSasgz8rlGw3U7CRsGiChXNzoLoe4CEIdZT9JX57RnQZXHYQNr2GjHIG-iq_A_wBeU40k934jELuSsy7p_tU7IPFx75I6WtjMWh4-S2RLLoE4LmCIkb1ef')"
                }}
              />
              <div className="absolute -bottom-2 -right-2 bg-gray-100 dark:bg-[#102216] p-1 rounded-full">
                <div className="bg-[#0df259] text-black size-8 rounded-full flex items-center justify-center border-2 border-gray-100 dark:border-[#102216]">
                  <MaterialIcon name="verified" className="text-sm font-bold" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold leading-tight">The Azure Lounge</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-[#9cbaa6]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                <span className="flex items-center gap-1">
                  <MaterialIcon name="location_on" className="text-[16px]" /> San Francisco, CA
                </span>
                <span>•</span>
                <span className="text-[#0df259] font-medium tracking-wide">LIVE ●</span>
              </div>
            </div>
            <div className="flex w-full max-w-xs gap-3">
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-gray-200 dark:bg-[#162e20] rounded-lg text-sm font-bold text-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-[#1e3d2b] transition-colors border border-transparent dark:border-[#234230]">
                <MaterialIcon name="call" className="text-lg" />
                Call
              </button>
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-gray-200 dark:bg-[#162e20] rounded-lg text-sm font-bold text-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-[#1e3d2b] transition-colors border border-transparent dark:border-[#234230]">
                <MaterialIcon name="mail" className="text-lg" />
                Email
              </button>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-gray-200 dark:bg-[#234230]"></div>

        {/* Staff Management Module */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold tracking-tight">Staff Management</h3>
            <button className="text-[#0df259] text-sm font-bold hover:underline flex items-center gap-1">
              <MaterialIcon name="add" className="text-sm" /> Add New
            </button>
          </div>
          
          {/* Tabs */}
          <div className="bg-gray-100 dark:bg-[#162e20] p-1 rounded-lg flex gap-1 mb-4">
            <button className="flex-1 py-2 px-3 rounded text-xs font-bold uppercase tracking-wider bg-white dark:bg-[#0df259] dark:text-black shadow-sm transition-all">
              Waiters (12)
            </button>
            <button className="flex-1 py-2 px-3 rounded text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9cbaa6] hover:bg-white/50 dark:hover:bg-white/5 transition-all">
              Managers (3)
            </button>
          </div>

          {/* Staff List */}
          <div className="space-y-3">
            {[
              {
                name: "Sarah Jenkins",
                status: "Active 2m ago",
                online: true,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfnIiIePFlA13EfbepWeNsCvDijO2xhhVZ737Pk24Oz9e5UNkAkFevaax3x2XmUCj5dnrT_Y6sJMfaCKOFtkY19_zWInEP9DECXKK8OxFiyNfNjSCsJMrf0kSf_NHv5rOKS_8x2W1ZwuTyXvL7d7mJv3fKflYitg_tWv93RB-s9Mr4-rZpU6eVCXbOneYIhsHY-SBjth6i2fta2b2u5UzkqfNi63kYT9MU4R-wZsb8-e_uZMCRLHJ7HKj0qJbDxN6ny0BoyHYprVws"
              },
              {
                name: "Michael Torres",
                status: "Active 4h ago",
                online: false,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOTxDGONZHrX8kvDjhEVWFxo2uCky7xshpyO-GCXe6hixCmZcv1A-Wot0IvP7Mk5hEvFNq8KL9wbxmks0LrFEB6tDjphOqb2xjFl7YDxc4ar3DxKg6-3f0_Tzh6HDVvMDT9yaE8ZAwxSz7qlcWQnsKDO5FcbRFAby03b7ij2bV-JR2xfoICxNd82BLvaPXo5-BqOlNNrOE8dNSHUDsXNY7Kyuh9RWTKxGu-k5JQePilYVS0XM-X3tpixZ4av_QNMEzCoQ6vOMEwDvd"
              },
              {
                name: "Elena Rodriguez",
                status: "Active 12m ago",
                online: true,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvyJwL02nokqqAjmJyytVTX1QyiNDM0Vb_GLcbytt1GYmpU_8Fy4IQSSlgMq3XkonWyZwNYqnAlv6LPd6sXXDWrKzZXWyyz2jmTbEw6jXp3WVHNR-kqUvTUoCXhU-t2hhx0x3eU0443KKK-ubIu9glYDGaXCLBmtc9LHWt4YvYRTsmbQ334BZ5s9twjS5OflEpXcQWX1BdSz9_MMekedlteeRAHk6UXzSUBw2sIIg4dN12ZdDnLKIu6fUIOyvebQWJ4XUWQv3KErw4"
              }
            ].map((staff, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#162e20]/50 border border-gray-200 dark:border-[#234230] hover:border-[#0df259]/50 transition-colors group">
                <div 
                  className="size-10 rounded-full bg-cover bg-center" 
                  style={{ backgroundImage: `url('${staff.image}')` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-[#0df259] transition-colors">{staff.name}</p>
                  <p className="text-xs text-slate-500 dark:text-[#9cbaa6] truncate">{staff.status}</p>
                </div>
                <div className={`px-2 py-1 rounded border ${staff.online 
                  ? 'bg-green-100 dark:bg-[#0df259]/10 border-green-200 dark:border-[#0df259]/20' 
                  : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10'
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${staff.online 
                    ? 'text-green-700 dark:text-[#0df259]' 
                    : 'text-slate-500 dark:text-[#9cbaa6]'
                  }`}>
                    {staff.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#9cbaa6] hover:text-[#0df259] transition-colors flex items-center justify-center gap-2">
            View All Staff <MaterialIcon name="arrow_forward" className="text-sm" />
          </button>
        </section>

        {/* Order History Module */}
        <section className="px-4">
          <h3 className="text-lg font-bold tracking-tight mb-4">Order History</h3>
          
          {/* Search */}
          <div className="relative mb-4 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MaterialIcon name="search" className="text-slate-400 group-focus-within:text-[#0df259] transition-colors" />
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-white dark:bg-[#162e20] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9cbaa6]/50 focus:outline-none focus:ring-1 focus:ring-[#0df259] sm:text-sm shadow-sm" 
              placeholder="Search by Order ID..." 
              type="text"
              style={{ fontFamily: 'Noto Sans, sans-serif' }}
            />
          </div>

          {/* Order List */}
          <div className="space-y-2">
            {[
              { id: "#ORD-0921-XJ", status: "Paid", description: "Table 4 - Dinner Service", time: "Today, 19:42 PM", amount: "$142.50", borderColor: "border-l-[#0df259]", statusColor: "bg-green-100 dark:bg-[#0df259]/20 text-green-800 dark:text-[#0df259]" },
              { id: "#ORD-0920-AA", status: "Void", description: "Bar Tab - Walk-in", time: "Today, 19:15 PM", amount: "$45.00", borderColor: "border-l-gray-300 dark:border-l-gray-600", statusColor: "bg-gray-100 dark:bg-white/10 text-slate-600 dark:text-slate-300", opacity: "opacity-75", strikethrough: true },
              { id: "#ORD-0919-BB", status: "Pending", description: "Table 12 - Private Room", time: "Today, 18:55 PM", amount: "$890.00", borderColor: "border-l-amber-500", statusColor: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-500" }
            ].map((order, index) => (
              <div key={index} className={`bg-white dark:bg-[#162e20] p-3 rounded-lg border-l-4 ${order.borderColor} shadow-sm ${order.opacity || ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-mono text-xs text-slate-500 dark:text-[#9cbaa6]">{order.id}</p>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${order.statusColor}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{order.description}</p>
                    <p className="text-xs text-slate-400 dark:text-[#9cbaa6]/70 mt-0.5">{order.time}</p>
                  </div>
                  <p className={`text-base font-bold ${order.strikethrough ? 'text-slate-500 dark:text-[#9cbaa6] line-through' : 'text-slate-900 dark:text-white'}`}>
                    {order.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="px-4 mt-6">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-500">
              <MaterialIcon name="warning" />
              <h4 className="font-bold text-sm uppercase tracking-wider">Danger Zone</h4>
            </div>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-4 leading-relaxed" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              Deactivating this subscription will immediately revoke access for all 15 staff members. This action cannot be undone automatically.
            </p>
            <button className="w-full bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2">
              <MaterialIcon name="block" className="text-lg" />
              DEACTIVATE SUBSCRIPTION
            </button>
          </div>
        </section>

        {/* Footer Info */}
        <footer className="text-center pb-8 pt-4">
          <p className="text-[10px] text-slate-400 dark:text-[#9cbaa6]/40 font-mono">RIVIERA OS v2.4.1 • BUILD 8821</p>
        </footer>
      </main>
    </div>
  );

  const AnalyticsDashboard = () => (
    <div 
      className="bg-gray-100 dark:bg-[#102216] min-h-screen text-slate-900 dark:text-white"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto border-x border-[#284532]/30">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gray-100/95 dark:bg-[#102216]/95 backdrop-blur-md border-b border-[#284532]/30">
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <MaterialIcon name="arrow_back" className="text-2xl" />
          </button>
          <h1 className="text-lg font-bold tracking-tight uppercase">Revenue Analytics</h1>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#0df259]">
            <MaterialIcon name="ios_share" className="text-2xl" />
          </button>
        </header>

        {/* Filters */}
        <div className="w-full py-4 pl-4 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pr-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#0df259] px-4 shadow-[0_0_15px_rgba(13,242,89,0.3)] transition-all active:scale-95">
              <p className="text-[#102216] text-sm font-bold leading-normal">Last 7 Days</p>
              <MaterialIcon name="expand_more" className="text-[#102216] text-lg" />
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#162b1e] border border-[#284532] px-4 transition-all hover:border-[#0df259]/50 active:scale-95">
              <p className="text-white/80 text-sm font-medium leading-normal">Month to Date</p>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#162b1e] border border-[#284532] px-4 transition-all hover:border-[#0df259]/50 active:scale-95">
              <p className="text-white/80 text-sm font-medium leading-normal">All Venues</p>
              <MaterialIcon name="expand_more" className="text-white/60 text-lg" />
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#162b1e] border border-[#284532] px-4 transition-all hover:border-[#0df259]/50 active:scale-95">
              <p className="text-white/80 text-sm font-medium leading-normal">VIP</p>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 flex flex-col gap-6 px-4 pb-24 overflow-y-auto">
          {/* KPI Section */}
          <div className="grid grid-cols-2 gap-3">
            {/* Large Card */}
            <div className="col-span-2 flex flex-col gap-1 rounded-2xl bg-[#162b1e] border border-[#284532] p-5 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#0df259]/10 blur-[50px] rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start z-10">
                <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                <span className="flex items-center text-[#0df259] bg-[#0df259]/10 px-2 py-0.5 rounded text-xs font-bold">
                  <MaterialIcon name="trending_up" className="text-base mr-1" />
                  +12%
                </span>
              </div>
              <p className="text-white text-4xl font-bold tracking-tight mt-1 z-10">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-white/40 text-xs mt-1 z-10">vs $111,200 last period</p>
            </div>

            {/* Small Cards */}
            <div className="flex flex-col gap-1 rounded-2xl bg-[#162b1e] border border-[#284532] p-4 hover:border-[#0df259]/30 transition-colors">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Avg Order</p>
              <p className="text-white text-2xl font-bold tracking-tight mt-1">${stats.avgOrder}</p>
              <p className="text-[#0df259] text-xs font-bold">+{stats.orderGrowth}%</p>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl bg-[#162b1e] border border-[#284532] p-4 hover:border-[#0df259]/30 transition-colors">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Active Tables</p>
              <p className="text-white text-2xl font-bold tracking-tight mt-1">{stats.activeTables}</p>
              <p className="text-orange-500 text-xs font-bold">{stats.tableGrowth}%</p>
            </div>
          </div>

          {/* Insight Ticker */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#0df259]/20 to-transparent p-3 rounded-xl border-l-4 border-[#0df259]">
            <MaterialIcon name="auto_awesome" className="text-[#0df259] animate-pulse" />
            <p className="text-sm font-medium text-white/90 leading-tight">Projected to beat monthly targets by Friday if current volume persists.</p>
          </div>

          {/* Chart 1: Revenue Bar Chart */}
          <div className="flex flex-col gap-4 rounded-2xl bg-[#162b1e] border border-[#284532] p-5">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-white text-lg font-bold tracking-tight uppercase">Daily Performance</h2>
                <p className="text-white/50 text-xs">Revenue per day (Last 7 Days)</p>
              </div>
              <button className="p-1 rounded hover:bg-white/5">
                <MaterialIcon name="more_horiz" className="text-white/50" />
              </button>
            </div>

            {/* Bar Chart Visualization */}
            <div className="grid grid-cols-7 gap-2 items-end h-48 pt-4 pb-2 px-1 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full border-t border-dashed border-white"></div>
                ))}
              </div>

              {/* Days */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const heights = ['40%', '55%', '45%', '70%', '85%', '95%', '60%'];
                const isHighlight = day === 'Thu';
                return (
                  <div key={day} className="group flex flex-col items-center gap-2 z-10 h-full justify-end cursor-pointer">
                    <div 
                      className={`w-full rounded-t-sm relative transition-all duration-300 ${
                        isHighlight 
                          ? 'bg-gradient-to-t from-[#0df259]/60 to-[#0df259] shadow-[0_0_10px_rgba(13,242,89,0.2)]' 
                          : 'bg-[#284532] group-hover:bg-[#0df259]/50'
                      }`}
                      style={{ height: heights[index] }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#102216] border border-[#284532] px-2 py-1 rounded text-xs text-white whitespace-nowrap transition-opacity pointer-events-none shadow-xl z-20">
                        ${42 + index * 8}k
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isHighlight ? 'text-[#0df259]' : 'text-white/50'
                    }`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-6"></div>
        </main>
      </div>
    </div>
  );

  const WarRoomDashboard = () => (
    <div 
      className="bg-gray-100 dark:bg-[#09090b] text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Top App Bar */}
      <header className="flex-none bg-[#111113]/80 backdrop-blur-md border-b border-white/5 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#0df259]/10 text-[#0df259]">
              <MaterialIcon name="grid_view" className="text-[24px]" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold leading-tight tracking-tight">Riviera OS</h1>
              <p className="text-xs text-gray-500 tracking-wider uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>War Room v2.4</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0df259]/10 px-3 py-1.5 rounded-full border border-[#0df259]/20">
              <div className="size-2 rounded-full bg-[#0df259] animate-pulse shadow-[0_0_8px_rgba(13,242,89,0.5)]"></div>
              <span className="text-[#0df259] text-xs font-bold uppercase tracking-wide">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-64 relative">
        {/* Stats Carousel */}
        <section className="p-4 overflow-x-auto whitespace-nowrap flex gap-3 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { title: 'Total Revenue', value: '€ 7,450.50', icon: 'payments', color: 'text-[#0df259]/50', progress: 75 },
            { title: 'Orders (1h)', value: '152', icon: 'shopping_cart', color: 'text-blue-400/50', trend: '+12%' },
            { title: 'Active Venues', value: '22/25', icon: 'storefront', color: 'text-yellow-400/50', warning: '3 Offline' },
            { title: 'Server Status', value: 'Healthy', icon: 'dns', color: 'text-purple-400/50', uptime: '99.9% Uptime' }
          ].map((stat, index) => (
            <div key={index} className="inline-flex min-w-[200px] snap-center flex-col gap-3 rounded-xl p-5 bg-[#18181b] border border-white/5 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0df259]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between relative z-10">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.title}</p>
                <MaterialIcon name={stat.icon} className={`${stat.color} text-[20px]`} />
              </div>
              <p className="text-white text-2xl font-bold tracking-tight z-10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {stat.value}
              </p>
              {stat.progress && (
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-1 z-10">
                  <div 
                    className="bg-[#0df259] h-full shadow-[0_0_10px_rgba(13,242,89,0.5)]"
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              )}
              {stat.trend && (
                <div className="flex items-center gap-1 text-xs text-[#0df259] mt-1 z-10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <MaterialIcon name="trending_up" className="text-[14px]" />
                  <span>{stat.trend}</span>
                </div>
              )}
              {stat.warning && (
                <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1 z-10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <MaterialIcon name="warning" className="text-[14px]" />
                  <span>{stat.warning}</span>
                </div>
              )}
              {stat.uptime && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 z-10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>{stat.uptime}</span>
                </div>
              )}
            </div>
          ))}
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

        {/* Section Header */}
        <div className="px-5 py-3 flex items-center justify-between">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <MaterialIcon name="leaderboard" className="text-[#0df259] text-[18px]" />
            Client Leaderboard
          </h3>
          <button className="text-xs text-[#0df259] font-medium hover:text-white transition-colors">View All</button>
        </div>

        {/* Leaderboard List */}
        <div className="px-4 flex flex-col gap-3 pb-4">
          {[
            { name: 'Grand Blue Resort', initials: 'GB', revenue: '€ 1,200', status: 'online', lastSeen: '2m ago' },
            { name: 'Azure Beach Club', initials: 'AB', revenue: '€ 850', status: 'warning', lastSeen: '12m ago' },
            { name: 'The Cliffside', initials: 'TC', revenue: '€ 0', status: 'offline', lastSeen: 'OFFLINE' },
            { name: 'Vista Mar Hotel', initials: 'VM', revenue: '€ 2,430', status: 'online', lastSeen: '45s ago' },
            { name: 'Palm Heights', initials: 'PH', revenue: '€ 620', status: 'online', lastSeen: '1m ago' }
          ].map((client, index) => (
            <div key={index} className={`flex items-center justify-between bg-[#18181b] p-4 rounded-xl border border-white/5 shadow-sm hover:border-[#0df259]/30 transition-colors cursor-pointer group ${client.status === 'offline' ? 'opacity-75' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="size-10 rounded-lg bg-gray-800 flex items-center justify-center text-white border border-white/10">
                    <span className="font-bold text-lg">{client.initials}</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-[#18181b] ${
                    client.status === 'online' ? 'bg-[#0df259] shadow-[0_0_8px_rgba(13,242,89,0.8)]' :
                    client.status === 'warning' ? 'bg-[#f59e0b]' :
                    'bg-[#ef4444] animate-pulse'
                  }`}></div>
                </div>
                <div className="flex flex-col">
                  <p className="text-white font-medium text-sm leading-tight">{client.name}</p>
                  <p className={`text-xs mt-1 ${
                    client.status === 'offline' ? 'text-[#ef4444] font-bold' : 'text-gray-500'
                  }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {client.status === 'offline' ? client.lastSeen : `Last: ${client.lastSeen}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-base ${client.status === 'offline' ? 'text-gray-400' : 'text-white'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {client.revenue}
                </p>
                <p className={`text-xs ${client.status === 'offline' ? 'text-gray-600' : 'text-gray-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Today
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom System Log - Fixed & Sticky */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111113]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 transition-all duration-300 ease-in-out h-60 flex flex-col">
        {/* Log Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-2">
            <MaterialIcon name="terminal" className="text-gray-500 text-[16px]" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>System Log</span>
          </div>
          <div className="flex gap-2">
            <div className="size-2 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="size-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="size-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
        </div>

        {/* Log Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[11px] leading-relaxed relative" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#111113]/95 to-transparent pointer-events-none"></div>
          
          {[
            { time: '[14:02:18]', type: 'SUCCESS', message: 'User authenticated (ID: #8821)', color: 'text-[#0df259]', opacity: 'opacity-60' },
            { time: '[14:02:22]', type: 'SUCCESS', message: 'Payment gateway synced (ID: #9921)', color: 'text-[#0df259]', opacity: 'opacity-70' },
            { time: '[14:02:25]', type: 'INFO', message: 'New menu deployment started @ GB Resort', color: 'text-blue-400', opacity: '' },
            { time: '[14:02:31]', type: 'SUCCESS', message: 'Order #4402 printed @ Kitchen', color: 'text-[#0df259]', opacity: '', highlight: true },
            { time: '[14:02:35]', type: 'INFO', message: 'Health check routine passed', color: 'text-blue-400', opacity: '' },
            { time: '[14:02:40]', type: 'ERROR', message: 'Timeout at node eu-west-3 (The Cliffside)', color: 'text-red-500', opacity: '', error: true },
            { time: '[14:02:42]', type: 'WARN', message: 'Retry attempt 1/3 initiated...', color: 'text-yellow-500', opacity: '' }
          ].map((log, index) => (
            <div key={index} className={`flex gap-3 text-gray-400 ${log.opacity} ${
              log.highlight ? 'bg-white/5 -mx-4 px-4 py-1 border-l-2 border-[#0df259]' :
              log.error ? 'text-white bg-red-500/10 -mx-4 px-4 py-1 border-l-2 border-red-500 animate-pulse' : ''
            }`}>
              <span className={log.error ? 'text-red-400' : 'text-gray-600'} style={{ flexShrink: 0 }}>{log.time}</span>
              <span className={`${log.color} font-bold`}>{log.type}:</span>
              <span className="truncate">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-64 right-4 z-50 bg-[#0df259] hover:bg-green-400 text-black rounded-full size-14 shadow-[0_0_20px_rgba(13,242,89,0.4)] flex items-center justify-center transition-transform active:scale-95 group">
        <MaterialIcon name="add" className="text-[28px] group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );

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
    <div className="min-h-screen">
      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 px-4 py-2">
        <div className="flex gap-2 max-w-md mx-auto">
          {[
            { id: 'business', label: 'Business', icon: 'business' },
            { id: 'analytics', label: 'Analytics', icon: 'analytics' },
            { id: 'warroom', label: 'War Room', icon: 'security' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                currentView === tab.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <MaterialIcon name={tab.icon} className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      {currentView === 'business' && <BusinessDashboard />}
      {currentView === 'analytics' && <AnalyticsDashboard />}
      {currentView === 'warroom' && <WarRoomDashboard />}
    </div>
  );
}