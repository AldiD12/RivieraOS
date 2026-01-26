import { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { X, User, Lock, Unlock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const HUB_URL = 'http://localhost:5000/hubs/beach';
const VENUE_ID = 1; // Hotel Coral Beach

export default function AdminDashboard() {
  const [venue, setVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [connection, setConnection] = useState(null);
  const [guestName, setGuestName] = useState('');

  // Fetch venue layout
  useEffect(() => {
    fetchVenueLayout();
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
          console.log('SignalR Connected');

          // Listen for layout updates
          connection.on('LayoutUpdate', (data) => {
            console.log('Layout updated:', data);
            updateProductInState(data.productId, data.status, data.guestName, data.isAvailable);
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

  const fetchVenueLayout = async () => {
    try {
      const response = await fetch(`${API_URL}/venue/${VENUE_ID}/layout`);
      const data = await response.json();
      setVenue(data);
      setZones(data.zones);
    } catch (error) {
      console.error('Error fetching venue layout:', error);
    }
  };

  const updateProductInState = (productId, newStatus, guestName, isAvailable) => {
    setZones((prevZones) =>
      prevZones.map((zone) => ({
        ...zone,
        products: zone.products.map((product) =>
          product.id === productId
            ? { ...product, status: newStatus, currentGuestName: guestName, isAvailable }
            : product
        ),
      }))
    );

    // Update selected product if it's the one that changed
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) => ({
        ...prev,
        status: newStatus,
        currentGuestName: guestName,
        isAvailable,
      }));
    }
  };

  const updateProductStatus = async (productId, newStatus, guestName = null) => {
    try {
      const response = await fetch(`${API_URL}/venue/products/${productId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          guestName,
        }),
      });

      if (response.ok) {
        setGuestName('');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleBlockForHotel = () => {
    if (selectedProduct && guestName) {
      updateProductStatus(selectedProduct.id, 3, guestName); // 3 = HotelBlocked
    }
  };

  const handleRelease = () => {
    if (selectedProduct) {
      updateProductStatus(selectedProduct.id, 0, null); // 0 = Available
    }
  };

  const handleMarkOccupied = () => {
    if (selectedProduct && guestName) {
      updateProductStatus(selectedProduct.id, 2, guestName); // 2 = Occupied
    }
  };

  const getProductStyles = (product) => {
    const isSelected = selectedProduct?.id === product.id;
    const baseStyles = 'relative w-full aspect-square rounded-md transition-all cursor-pointer flex items-center justify-center text-xs font-mono font-bold';

    if (isSelected) {
      return `${baseStyles} bg-white text-black border-2 border-white`;
    }

    switch (product.status) {
      case 0: // Available
        return `${baseStyles} border border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-500`;
      case 1: // BookedOnline
        return `${baseStyles} bg-yellow-500/10 border border-yellow-500/30 text-yellow-400`;
      case 2: // Occupied
        return `${baseStyles} bg-red-500/10 border border-red-500/30 text-red-400`;
      case 3: // HotelBlocked
        return `${baseStyles} bg-blue-500/10 border border-blue-500/30 text-blue-400`;
      default:
        return baseStyles;
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 0: return 'Available';
      case 1: return 'BookedOnline';
      case 2: return 'Occupied';
      case 3: return 'HotelBlocked';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-zinc-800 bg-zinc-950">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">RIVIERA MANAGER</h1>
              <p className="text-sm text-zinc-500 mt-1 font-bold tracking-wide uppercase">Beach Management Dashboard</p>
            </div>
            <button className="px-6 py-3 bg-zinc-900 text-zinc-400 text-sm font-black rounded-md hover:bg-zinc-800 transition-all border border-zinc-800 uppercase tracking-widest">
              <a href="/">Exit</a>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-81px)]">
        {/* Left Panel - Beach Map (70%) */}
        <div className="w-[70%] border-r border-zinc-800 overflow-auto p-6 bg-zinc-950">
          <div className="space-y-6">
            {zones.map((zone) => (
              <Card key={zone.id} className="p-6 bg-zinc-900 border-zinc-800">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-800">
                  <h2 className="text-sm font-black tracking-widest uppercase text-zinc-400">
                    {zone.name}
                  </h2>
                  <span className="text-xs text-zinc-600 font-mono tabular-nums font-black tracking-wide">
                    {zone.products.length} BEDS
                  </span>
                </div>

                <div className="grid grid-cols-10 gap-3">
                  {zone.products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={getProductStyles(product)}
                    >
                      <span className="tabular-nums font-black">{product.unitCode}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel - Inspector (30%) */}
        <div className="w-[30%] bg-zinc-950">
          {selectedProduct ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="border-b border-zinc-800 p-5 bg-black">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-mono font-black tracking-tight mb-2">
                      {selectedProduct.unitCode}
                    </h3>
                    <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest font-black">
                      {selectedProduct.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 hover:bg-zinc-900 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-600" />
                  </button>
                </div>

                <Badge status={getStatusName(selectedProduct.status)}>
                  {getStatusName(selectedProduct.status)}
                </Badge>
              </div>

              {/* Details */}
              <div className="flex-1 overflow-auto p-5 space-y-5">
                {/* Price */}
                <Card className="p-4 bg-zinc-900 border-zinc-800">
                  <div className="text-xs text-zinc-600 mb-2 font-mono uppercase tracking-widest font-black">
                    Daily Rate
                  </div>
                  <div className="text-4xl font-mono font-black tabular-nums tracking-tight">
                    €{selectedProduct.basePrice}
                  </div>
                </Card>

                {/* Guest Name */}
                {selectedProduct.currentGuestName && (
                  <Card className="p-4 bg-zinc-900 border-zinc-800">
                    <div className="text-xs text-zinc-600 mb-2 font-mono uppercase tracking-widest font-black">
                      Current Guest
                    </div>
                    <div className="text-xl font-mono font-black tracking-tight">
                      {selectedProduct.currentGuestName}
                    </div>
                  </Card>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  {selectedProduct.status === 0 && (
                    <>
                      <div>
                        <label className="text-xs text-zinc-600 mb-2 block font-mono uppercase tracking-widest font-black">
                          Guest Name
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Enter name"
                          className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-md text-white font-mono placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none transition-all"
                        />
                      </div>

                      <button
                        onClick={handleBlockForHotel}
                        disabled={!guestName}
                        className="w-full px-4 py-3 bg-blue-600 text-white text-xs font-mono font-black rounded-md hover:bg-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        <Lock className="w-4 h-4" />
                        Block for Hotel
                      </button>

                      <button
                        onClick={handleMarkOccupied}
                        disabled={!guestName}
                        className="w-full px-4 py-3 bg-red-600 text-white text-xs font-mono font-black rounded-md hover:bg-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        <User className="w-4 h-4" />
                        Mark Occupied
                      </button>
                    </>
                  )}

                  {selectedProduct.status !== 0 && (
                    <button
                      onClick={handleRelease}
                      className="w-full px-4 py-3 bg-white text-black text-xs font-mono font-black rounded-md hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      <Unlock className="w-4 h-4" />
                      Release
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-800 p-5 bg-black">
                <div className="text-xs text-zinc-700 font-mono font-black uppercase tracking-widest">
                  Updated: {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-zinc-800 rounded-md mx-auto mb-4"></div>
                <p className="text-zinc-700 text-xs font-mono uppercase tracking-widest font-black">
                  Select a Sunbed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
