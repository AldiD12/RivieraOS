import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

export default function TheSpeedGrid({ tableNumber = 'A1', products = [] }) {
  const [cart, setCart] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [longPressItem, setLongPressItem] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleTap = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleLongPress = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem) {
      setLongPressItem(cartItem);
    }
  };

  const handleRemove = () => {
    if (longPressItem) {
      setCart((prev) => prev.filter((item) => item.id !== longPressItem.id));
      setLongPressItem(null);
    }
  };

  const handleSyncClose = () => {
    if (cart.length > 0) {
      setShowConfirm(true);
    }
  };

  const confirmSync = () => {
    // TODO: Send order to backend
    console.log('Order synced:', { table: tableNumber, items: cart, total });
    setCart([]);
    setShowConfirm(false);
  };

  // Mock products if none provided
  const mockProducts = products.length > 0 ? products : [
    { id: 1, name: 'HEINEKEN', price: 5.0, category: 'drink' },
    { id: 2, name: 'WATER', price: 2.0, category: 'drink' },
    { id: 3, name: 'COCA COLA', price: 3.5, category: 'drink' },
    { id: 4, name: 'APEROL SPRITZ', price: 8.0, category: 'drink' },
    { id: 5, name: 'CLUB SANDWICH', price: 12.0, category: 'food' },
    { id: 6, name: 'CAESAR SALAD', price: 10.0, category: 'food' },
    { id: 7, name: 'BURGER', price: 14.0, category: 'food' },
    { id: 8, name: 'FRIES', price: 6.0, category: 'food' },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top 20%: Current Bill */}
      <div className="h-[20vh] bg-zinc-950 border-b border-zinc-800 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Table</p>
            <p className="text-white text-4xl font-black font-mono">{tableNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Total</p>
            <p className="text-white text-4xl font-black font-mono">€{total.toFixed(2)}</p>
          </div>
        </div>
        <div className="text-zinc-400 text-sm">
          {cart.length} items • Tap to add • Long press to remove
        </div>
      </div>

      {/* Bottom 80%: The Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 pb-24">
          {mockProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            const quantity = cartItem?.quantity || 0;

            return (
              <motion.button
                key={product.id}
                onClick={() => handleTap(product)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleLongPress(product);
                }}
                onTouchStart={(e) => {
                  const timer = setTimeout(() => handleLongPress(product), 500);
                  e.target.dataset.timer = timer;
                }}
                onTouchEnd={(e) => {
                  clearTimeout(e.target.dataset.timer);
                }}
                className={`relative h-[70px] rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  product.category === 'drink'
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                    : 'bg-zinc-800 border-zinc-600 text-white'
                } ${quantity > 0 ? 'ring-2 ring-white' : ''}`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm font-bold uppercase tracking-tight text-center px-2">
                  {product.name}
                </span>
                <span className="text-xs text-zinc-500 mt-1 font-mono">
                  €{product.price.toFixed(2)}
                </span>
                {quantity > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-black"
                  >
                    {quantity}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sync & Close Button */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-800"
        >
          <button
            onClick={handleSyncClose}
            className="w-full h-16 bg-white text-black rounded-lg text-lg font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            SYNC & CLOSE
          </button>
        </motion.div>
      )}

      {/* Remove Modal */}
      <AnimatePresence>
        {longPressItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setLongPressItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-xl font-bold mb-2">{longPressItem.name}</h3>
              <p className="text-zinc-400 mb-6">Quantity: {longPressItem.quantity}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLongPressItem(null)}
                  className="flex-1 h-12 bg-zinc-800 border border-zinc-700 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  className="flex-1 h-12 bg-red-600 text-white rounded-lg font-bold"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm w-full"
            >
              <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold text-center mb-2">
                Did you print the receipt?
              </h3>
              <p className="text-zinc-400 text-center mb-6 text-3xl font-mono">
                €{total.toFixed(2)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-12 bg-zinc-800 border border-zinc-700 text-white rounded-lg font-medium"
                >
                  No, Go Back
                </button>
                <button
                  onClick={confirmSync}
                  className="flex-1 h-12 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Yes, Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
