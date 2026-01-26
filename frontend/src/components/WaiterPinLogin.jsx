import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function WaiterPinLogin({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Auto-submit after 4 digits
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === '1111') {
            onLogin({ name: 'Waiter', role: 'waiter' });
          } else {
            setError('Invalid PIN');
            setPin('');
          }
        }, 200);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-12">
          <Lock className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Waiter Login
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Enter your 4-digit PIN</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${
                pin.length > i
                  ? 'bg-white border-white'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
              animate={pin.length === i ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              {pin.length > i && (
                <div className="w-3 h-3 bg-black rounded-full" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 text-red-500 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {digits.map((digit) => (
            <motion.button
              key={digit}
              onClick={() => handleDigit(digit.toString())}
              className="h-20 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-2xl font-bold hover:bg-zinc-800 active:bg-white active:text-black transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {digit}
            </motion.button>
          ))}
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="w-full h-14 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-sm font-medium uppercase tracking-widest hover:bg-zinc-800 transition-colors"
        >
          Clear
        </button>

        {/* Hint */}
        <p className="text-center text-zinc-600 text-xs mt-8">
          Default PIN: 1111
        </p>
      </div>
    </div>
  );
}
