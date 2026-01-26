import { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { X, Euro, Sun } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const HUB_URL = 'http://localhost:5000/hubs/beach';
const VENUE_ID = 1; // Hotel Coral Beach

export default function CollectorDashboard() {
  const [zones, setZones] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connection, setConnection] = useState(null);
  const [totalCashToday, setTotalCashToday] = useState(0);

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

          connection.on('LayoutUpdate', (data) => {
            updateProductInState(data.productId, data.status, data.guestName);
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
      setZones(data.zones);
    } catch (error) {
      console.error('Error fetching venue layout:', error);
    }
  };

  const updateProductInState = (productId, newStatus, guestName) => {
    setZones((prevZones) =>
      prevZones.map((zone) => ({
        ...zone,
        products: zone.products.map((product) =>
          product.id === productId
            ? { ...product, status: newStatus, currentGuestName: guestName }
            : product
        ),
      }))
    );
  };

  const handleProductClick = (product) => {
    // Only allow interaction with Available products
    if (product.status === 0) {
      setSelectedProduct(product);
      setShowModal(true);
    }
  };

  const handleTakePayment = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`${API_URL}/venue/products/${selectedProduct.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 2, // Occupied
          guestName: 'Cash Payment',
        }),
      });

      if (response.ok) {
        // Update total cash
        setTotalCashToday((prev) => prev + selectedProduct.basePrice);
        setShowModal(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error taking payment:', error);
    }
  };

  const getProductStyles = (product) => {
    const baseStyles = 'relative w-full aspect-square rounded-md transition-all cursor-pointer flex items-center justify-center text-lg font-bold border-2';

    switch (product.status) {
      case 0: // Available
        return `${baseStyles} bg-emerald-500 border-emerald-600 text-black hover:bg-emerald-400 active:scale-95 shadow-lg`;
      case 1: // BookedOnline
        return `${baseStyles} bg-yellow-500/20 border-yellow-600/40 text-yellow-500 cursor-not-allowed`;
      case 2: // Occupied
        return `${baseStyles} bg-red-500/20 border-red-600/40 text-red-500 cursor-not-allowed`;
      case 3: // HotelBlocked
        return `${baseStyles} bg-blue-500/20 border-blue-600/40 text-blue-500 cursor-not-allowed`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header - Industrial Minimalist */}
      <nav className="border-b border-zinc-800 bg-black sticky top-0 z-10">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Sun className="w-7 h-7 text-zinc-400" />
                <h1 className="text-2xl font-black tracking-tight">COLLECTOR</h1>
              </div>
              <p className="text-sm font-medium text-zinc-500 tracking-wide">Tap available beds to collect payment</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">
                Cash Today
              </div>
              <div className="text-5xl font-black tabular-nums tracking-tight">
                €{totalCashToday.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Beach Map - Large Touch Targets */}
      <div className="p-6 space-y-6 pb-32">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400">
                {zone.name}
              </h2>
              <span className="text-sm font-black tabular-nums bg-white text-black px-4 py-2 rounded-md tracking-wide">
                {zone.products.filter(p => p.status === 0).length} AVAILABLE
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {zone.products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={getProductStyles(product)}
                  disabled={product.status !== 0}
                >
                  <span className="text-xl font-black tracking-tight">{product.unitCode}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black mb-1 tracking-tight">
                  {selectedProduct.unitCode}
                </h3>
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                  Collect Payment
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
              >
                <X className="w-7 h-7 text-zinc-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Price Display */}
              <div className="bg-black border border-zinc-800 rounded-lg p-8 text-center">
                <div className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-3">
                  Daily Rate
                </div>
                <div className="text-7xl font-black tabular-nums tracking-tighter">
                  €{selectedProduct.basePrice}
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handleTakePayment}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 border-2 border-emerald-600 text-black text-xl font-black py-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-wide"
              >
                <Euro className="w-8 h-8" />
                Collect Cash
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedProduct(null);
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 text-white text-lg font-bold py-4 rounded-lg transition-all uppercase tracking-wide"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-5">
        <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 border-2 border-emerald-600 rounded-md"></div>
            <span className="text-sm font-black uppercase tracking-wide">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 border-2 border-yellow-600/40 rounded-md"></div>
            <span className="text-sm font-black uppercase tracking-wide text-zinc-500">Booked</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 border-2 border-red-600/40 rounded-md"></div>
            <span className="text-sm font-black uppercase tracking-wide text-zinc-500">Occupied</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 border-2 border-blue-600/40 rounded-md"></div>
            <span className="text-sm font-black uppercase tracking-wide text-zinc-500">Hotel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
