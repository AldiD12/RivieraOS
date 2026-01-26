import { useState } from 'react';
import WaiterPinLogin from '../components/WaiterPinLogin';
import TheSpeedGrid from '../components/TheSpeedGrid';

export default function WaiterSpeedPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [waiter, setWaiter] = useState(null);

  const handleLogin = (waiterData) => {
    setWaiter(waiterData);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <WaiterPinLogin onLogin={handleLogin} />;
  }

  return <TheSpeedGrid tableNumber="A1" />;
}
