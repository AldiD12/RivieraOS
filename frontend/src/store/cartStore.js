/**
 * Cart Store - Shopping Cart State Management
 * Persists across refreshes (localStorage)
 * Industrial Grade: Zustand with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Cart items
      items: [],
      
      // Venue context
      venueId: null,
      unitId: null,
      venueName: null,
      
      /**
       * Add item to cart
       * @param {object} item - Product item
       */
      addItem: (item) => {
        const newItem = {
          ...item,
          cartId: `${Date.now()}-${Math.random()}`,
          addedAt: Date.now()
        };
        
        set((state) => ({
          items: [...state.items, newItem]
        }));
        
        console.log('🛒 Item added to cart:', newItem);
        return newItem;
      },
      
      /**
       * Remove item from cart
       * @param {string} cartId - Cart item ID
       */
      removeItem: (cartId) => {
        set((state) => ({
          items: state.items.filter(item => item.cartId !== cartId)
        }));
        
        console.log('🗑️ Item removed from cart:', cartId);
      },
      
      /**
       * Update item quantity
       * @param {string} cartId - Cart item ID
       * @param {number} quantity - New quantity
       */
      updateQuantity: (cartId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.cartId === cartId
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      /**
       * Clear entire cart
       */
      clearCart: () => {
        console.log('🗑️ Cart cleared');
        set({
          items: [],
          venueId: null,
          unitId: null,
          venueName: null
        });
      },
      
      /**
       * Set venue context
       * @param {string} venueId
       * @param {string} unitId
       * @param {string} venueName
       */
      setVenue: (venueId, unitId, venueName = null) => {
        set({ venueId, unitId, venueName });
      },
      
      /**
       * Get cart total
       * @returns {number}
       */
      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const quantity = item.quantity || 1;
          return sum + (item.price * quantity);
        }, 0);
      },
      
      /**
       * Get cart item count
       * @returns {number}
       */
      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      }
    }),
    {
      name: 'riviera-cart',
      partialize: (state) => ({
        items: state.items,
        venueId: state.venueId,
        unitId: state.unitId,
        venueName: state.venueName
      })
    }
  )
);
