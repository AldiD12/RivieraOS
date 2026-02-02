import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RivieraDiscoveryScreen } from './components/RivieraDiscoveryScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <RivieraDiscoveryScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}