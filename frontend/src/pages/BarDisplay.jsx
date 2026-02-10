import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { businessApi } from '../services/api';

export default function BarDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await businessApi.orders.getActive();
      setOrders(data);
      setLastUpdate(new Date());
      setLoading(false);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await businessApi.orders.updateStatus(orderId, { status: newStatus });
      await fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'new':
        return 'bg-yellow-500';
      case 'preparing':
      case 'inprogress':
        return 'bg-blue-500';
      case 'ready':
      case 'completed':
        return 'bg-green-500';
      case 'delivered':
        return 'bg-zinc-700';
      default:
        return 'bg-zinc-500';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'pending':
      case 'new':
        return 'Preparing';
      case 'preparing':
      case 'inprogress':
        return 'Ready';
      case 'ready':
      case 'completed':
        return 'Delivered';
      default:
        return null;
    }
  };

  const groupOrdersByStatus = () => {
    const groups = {
      new: [],
      preparing: [],
      ready: [],
      delivered: []
    };

    orders.forEach(order => {
      const status = order.status?.toLowerCase();
      if (status === 'pending' || status === 'new') {
        groups.new.push(order);
      } else if (status === 'preparing' || status === 'inprogress') {
        groups.preparing.push(order);
      } else if (status === 'ready' || status === 'completed') {
        groups.ready.push(order);
      } else if (status === 'delivered') {
        groups.delivered.push(order);
      }
    });

    return groups;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeSince = (dateString) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMinutes = Math.floor((now - orderTime) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 min ago';
    return `${diffMinutes} mins ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading orders...</div>
      </div>
    );
  }

  const groupedOrders = groupOrdersByStatus();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-6xl font-black mb-2">BAR DISPLAY</h1>
          <p className="text-zinc-400 text-xl">
            Active Orders: {orders.length}
          </p>
        </div>
        <div className="text-right">
          <div className="text-zinc-400 text-sm mb-1">Last Updated</div>
          <div className="text-white text-2xl font-mono">
            {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Order Columns */}
      <div className="grid grid-cols-4 gap-6">
        {/* New Orders */}
        <OrderColumn
          title="NEW"
          count={groupedOrders.new.length}
          color="yellow"
          orders={groupedOrders.new}
          onUpdateStatus={updateOrderStatus}
          formatTime={formatTime}
          getTimeSince={getTimeSince}
          getStatusColor={getStatusColor}
          getNextStatus={getNextStatus}
        />

        {/* Preparing */}
        <OrderColumn
          title="PREPARING"
          count={groupedOrders.preparing.length}
          color="blue"
          orders={groupedOrders.preparing}
          onUpdateStatus={updateOrderStatus}
          formatTime={formatTime}
          getTimeSince={getTimeSince}
          getStatusColor={getStatusColor}
          getNextStatus={getNextStatus}
        />

        {/* Ready */}
        <OrderColumn
          title="READY"
          count={groupedOrders.ready.length}
          color="green"
          orders={groupedOrders.ready}
          onUpdateStatus={updateOrderStatus}
          formatTime={formatTime}
          getTimeSince={getTimeSince}
          getStatusColor={getStatusColor}
          getNextStatus={getNextStatus}
        />

        {/* Delivered */}
        <OrderColumn
          title="DELIVERED"
          count={groupedOrders.delivered.length}
          color="zinc"
          orders={groupedOrders.delivered}
          onUpdateStatus={updateOrderStatus}
          formatTime={formatTime}
          getTimeSince={getTimeSince}
          getStatusColor={getStatusColor}
          getNextStatus={getNextStatus}
        />
      </div>
    </div>
  );
}

function OrderColumn({ title, count, color, orders, onUpdateStatus, formatTime, getTimeSince, getStatusColor, getNextStatus }) {
  const colorClasses = {
    yellow: 'border-yellow-500 bg-yellow-500/10',
    blue: 'border-blue-500 bg-blue-500/10',
    green: 'border-green-500 bg-green-500/10',
    zinc: 'border-zinc-700 bg-zinc-800/50'
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`border-2 ${colorClasses[color]} rounded-lg p-4 mb-4`}>
        <div className="text-sm text-zinc-400 mb-1">STATUS</div>
        <div className="text-3xl font-black">{title}</div>
        <div className="text-xl text-zinc-400 mt-1">{count} orders</div>
      </div>

      {/* Orders List */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center text-zinc-600 py-8">
            No orders
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              formatTime={formatTime}
              getTimeSince={getTimeSince}
              getStatusColor={getStatusColor}
              getNextStatus={getNextStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, formatTime, getTimeSince, getStatusColor, getNextStatus }) {
  const nextStatus = getNextStatus(order.status);

  return (
    <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      {/* Order Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-2xl font-black text-white mb-1">
            #{order.orderNumber}
          </div>
          <div className="text-sm text-zinc-400">
            {order.zoneName || 'Zone'} • {order.customerName || 'Guest'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500 mb-1">
            {formatTime(order.createdAt)}
          </div>
          <div className="text-sm text-zinc-400">
            {getTimeSince(order.createdAt)}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-4">
        {order.items?.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{item.quantity}x</span>
              <span className="text-lg">{item.productName}</span>
            </div>
            <span className="text-zinc-400">€{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-zinc-800 rounded p-2 mb-4">
          <div className="text-xs text-zinc-500 mb-1">NOTES</div>
          <div className="text-sm text-zinc-300">{order.notes}</div>
        </div>
      )}

      {/* Action Button */}
      {nextStatus && (
        <button
          onClick={() => onUpdateStatus(order.id, nextStatus)}
          className="w-full bg-white text-black py-3 rounded-lg font-bold text-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Mark as {nextStatus}
        </button>
      )}
    </div>
  );
}
