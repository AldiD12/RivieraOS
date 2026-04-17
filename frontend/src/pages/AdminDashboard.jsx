import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessOrderApi, businessDashboardApi } from '../services/businessApi';

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

function timeAgo(dateString) {
  if (!dateString) return '';
  const diff = Math.floor((Date.now() - new Date(dateString)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Average minutes from order createdAt → updatedAt for delivered orders
function calcAvgDeliveryTime(orders) {
  const delivered = orders.filter(
    o => (o.status === 'Delivered' || o.status === 'Completed') && o.createdAt && o.updatedAt
  );
  if (!delivered.length) return null;
  const totalMins = delivered.reduce((sum, o) => {
    return sum + (new Date(o.updatedAt) - new Date(o.createdAt)) / 60000;
  }, 0);
  return Math.round(totalMins / delivered.length);
}

// Top N products by total quantity across all orders
function calcTopProducts(orders, n = 5) {
  const map = {};
  for (const order of orders) {
    if (!order.items) continue;
    for (const item of order.items) {
      const key = item.productName || item.name || `Product ${item.productId}`;
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0 };
      map[key].qty += item.quantity || 0;
      map[key].revenue += item.subtotal ?? (item.quantity * item.unitPrice) ?? 0;
    }
  }
  return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, n);
}

// Sum totalAmount for delivered/completed orders
function calcRevenue(orders) {
  return orders
    .filter(o => o.status === 'Delivered' || o.status === 'Completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
}

function todayOnly(orders) {
  const today = new Date().toDateString();
  return orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === today);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [bizInfo, setBizInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const [ordersData, dashData] = await Promise.all([
        businessOrderApi.list(),
        businessDashboardApi.get()
      ]);
      const list = Array.isArray(ordersData) ? ordersData : (ordersData?.items || []);
      setOrders(list);
      setBizInfo(dashData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const todayOrders = todayOnly(orders);
  const allTimeRevenue = calcRevenue(orders);
  const todayRevenue = calcRevenue(todayOrders);
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const avgOrderValue = deliveredOrders.length ? allTimeRevenue / deliveredOrders.length : 0;
  const avgDelivery = calcAvgDeliveryTime(orders);
  const topProducts = calcTopProducts(orders);
  const maxQty = topProducts[0]?.qty || 1;

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const deliveredCount = deliveredOrders.length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-sm font-mono uppercase tracking-widest animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-widest uppercase">
            {bizInfo?.business?.brandName || bizInfo?.business?.registeredName || 'Dashboard'}
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            {lastUpdated ? `Updated ${timeAgo(lastUpdated)}` : 'Manager View'}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          title="Refresh"
        >
          <Icon name="refresh" className="text-zinc-400 text-xl" />
        </button>
      </header>

      {error && (
        <div className="mx-5 mt-4 bg-red-900/30 border border-red-700 rounded-2xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <main className="px-5 py-5 space-y-4 max-w-2xl mx-auto">

        {/* ── Revenue ── */}
        <section className="grid grid-cols-2 gap-3">
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-1">
              Total Cash Received
            </p>
            <p className="text-4xl font-black text-green-400">
              €{allTimeRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {deliveredCount} delivered orders · all time
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Today</p>
            <p className="text-2xl font-black text-white">€{todayRevenue.toFixed(2)}</p>
            <p className="text-xs text-zinc-600 mt-1">{todayOrders.length} orders</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Avg Order</p>
            <p className="text-2xl font-black text-white">
              {deliveredCount ? `€${avgOrderValue.toFixed(2)}` : '—'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">per delivery</p>
          </div>
        </section>

        {/* ── Delivery Time ── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Avg Delivery Time</p>
            <Icon name="timer" className="text-zinc-500 text-lg" />
          </div>
          {avgDelivery !== null ? (
            <div className="flex items-end gap-2 mb-4">
              <p className="text-5xl font-black text-white">{avgDelivery}</p>
              <p className="text-xl text-zinc-400 mb-1">min</p>
            </div>
          ) : (
            <p className="text-zinc-600 text-sm mb-4">No completed deliveries yet</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Pending', count: pendingCount, color: 'text-amber-400', dot: 'bg-amber-400' },
              { label: 'Preparing', count: preparingCount, color: 'text-blue-400', dot: 'bg-blue-400' },
              { label: 'Delivered', count: deliveredCount, color: 'text-green-400', dot: 'bg-green-400' },
            ].map(({ label, count, color, dot }) => (
              <div key={label} className="bg-zinc-800 rounded-2xl p-3 text-center">
                <div className={`w-2 h-2 rounded-full ${dot} mx-auto mb-1`} />
                <p className={`text-xl font-black ${color}`}>{count}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Top Products ── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Most Ordered</p>
            <Icon name="local_fire_department" className="text-orange-400 text-lg" />
          </div>
          {topProducts.length === 0 ? (
            <p className="text-zinc-600 text-sm">No order data yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-zinc-600 font-mono w-4 shrink-0">{i + 1}</span>
                      <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-zinc-400 font-mono">€{p.revenue.toFixed(2)}</span>
                      <span className="text-sm font-black text-orange-400 w-8 text-right">{p.qty}×</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${(p.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Orders ── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Recent Orders</p>
            <button
              onClick={() => navigate('/bar')}
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              All orders <Icon name="chevron_right" className="text-sm" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-zinc-600 text-sm">No orders yet</div>
          ) : (
            recentOrders.map((order, idx) => (
              <div
                key={order.id}
                className={`flex items-center gap-3 px-5 py-3 ${
                  idx < recentOrders.length - 1 ? 'border-b border-zinc-800/60' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  order.status === 'Pending' ? 'bg-amber-400' :
                  order.status === 'Preparing' ? 'bg-blue-400' :
                  order.status === 'Ready' ? 'bg-purple-400' :
                  order.status === 'Delivered' ? 'bg-green-400' : 'bg-zinc-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white truncate">
                      {order.customerName || 'Guest'} · {order.zoneName || order.venueName || ''}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono shrink-0 ml-2">
                      {timeAgo(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-zinc-500 truncate">
                      {order.items?.length
                        ? order.items.map(i => `${i.quantity}× ${i.productName}`).join(', ')
                        : `${order.itemCount ?? '?'} item(s)`}
                    </p>
                    <span className="text-xs font-mono text-green-400 shrink-0 ml-2">
                      €{(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ── Business Stats ── */}
        {bizInfo && (
          <section className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Venues', value: `${bizInfo.activeVenues ?? '—'}/${bizInfo.totalVenues ?? '—'}`, icon: 'storefront' },
              { label: 'Active Staff', value: `${bizInfo.activeStaff ?? '—'}/${bizInfo.totalStaff ?? '—'}`, icon: 'badge' },
              { label: 'Products', value: `${bizInfo.availableProducts ?? '—'}/${bizInfo.totalProducts ?? '—'}`, icon: 'restaurant_menu' },
              { label: 'Upcoming Events', value: bizInfo.upcomingEvents ?? '—', icon: 'event' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex items-center gap-3">
                <Icon name={icon} className="text-zinc-500 text-2xl" />
                <div>
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="text-base font-black text-white">{value}</p>
                </div>
              </div>
            ))}
          </section>
        )}

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-zinc-900/95 backdrop-blur border-t border-zinc-800 pb-5 pt-3 px-6 z-40">
        <ul className="flex justify-around items-center max-w-md mx-auto">
          {[
            { path: '/manager', icon: 'dashboard', label: 'Home', active: true },
            { path: '/bar', icon: 'receipt_long', label: 'Orders' },
            { path: '/collector', icon: 'beach_access', label: 'Collector' },
          ].map(({ path, icon, label, active }) => (
            <li key={path}>
              <button
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1"
              >
                <Icon name={icon} className={active ? 'text-green-400' : 'text-zinc-500'} />
                <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-zinc-500'}`}>
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
