/**
 * Haptic Feedback Utility
 * Physical vibration for critical actions
 * Critical for loud beach environments
 */

export const haptics = {
  /**
   * Light tap - Button press
   */
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium tap - Order confirmed, item added
   */
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },

  /**
   * Strong tap - Error, alert, important notification
   */
  strong: () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  },

  /**
   * Success pattern - Order placed, booking confirmed
   */
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
  },

  /**
   * Error pattern - Failed action
   */
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  },

  /**
   * Check if haptics are supported
   * @returns {boolean}
   */
  isSupported: () => {
    return 'vibrate' in navigator;
  }
};

export default haptics;
