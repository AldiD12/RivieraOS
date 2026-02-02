import { create } from 'zustand';

interface AppStore {
  // Core state
  mode: 'day' | 'night';
  
  // Actions
  setMode: (mode: 'day' | 'night') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  mode: 'night',
  
  // Actions
  setMode: (mode) => set({ mode }),
}));