import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { AppMode } from '../types/api';

/**
 * The Cinderella Switch - Automatically manages Day/Night mode based on time
 * 06:00 - 18:59: Day Mode
 * 19:00 - 05:59: Night Mode
 */
export const useModeManager = () => {
  const setMode = useAppStore(state => state.setMode);
  
  const getCurrentMode = (): AppMode => {
    const now = new Date();
    const hour = now.getHours();
    
    // Day mode: 6 AM to 6:59 PM (6-18)
    // Night mode: 7 PM to 5:59 AM (19-5)
    return (hour >= 6 && hour < 19) ? 'day' : 'night';
  };
  
  const updateMode = () => {
    const currentMode = getCurrentMode();
    setMode(currentMode);
  };
  
  useEffect(() => {
    // Set initial mode
    updateMode();
    
    // Update mode every minute to catch transitions
    const interval = setInterval(updateMode, 60000);
    
    // Also listen for app focus changes (when user returns to app)
    const handleAppStateChange = () => {
      updateMode();
    };
    
    // For React Native, you'd typically use AppState here
    // For now, we'll just use the interval
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return {
    getCurrentMode,
    updateMode
  };
};