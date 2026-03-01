import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import BusinessAdminDashboard from './pages/BusinessAdminDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import MenuPage from './pages/MenuPage';
import BarDisplay from './pages/BarDisplay';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import BusinessSetupPage from './pages/BusinessSetupPage';
import ReviewPage from './pages/ReviewPage';
import ReviewQRGenerator from './pages/ReviewQRGenerator';
import ManagerLeaderboardPage from './pages/ManagerLeaderboardPage';
import OurAdmin from './pages/OurAdmin';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import QRCodeGenerator from './pages/QRCodeGenerator';
import TestCronBookings from './pages/TestCronBookings';
import SpotPage from './pages/SpotPage';
import DiscoveryPage from './pages/DiscoveryPage';
import BookingStatusPage from './pages/BookingStatusPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingActionPage from './pages/BookingActionPage';
import ZoneUnitsManager from './pages/ZoneUnitsManager';
import SunbedMapper from './pages/SunbedMapper';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ApiStatus from './components/ApiStatus';
import { useAppStore } from './store/appStore';

// Context-Aware Router - Detects QR scans and manages mode
function ContextAwareRouter() {
  const [searchParams] = useSearchParams();
  const { mode, startSession, isSessionActive } = useAppStore();
  
  useEffect(() => {
    // Check for QR code parameters
    const venueId = searchParams.get('v');
    const unitId = searchParams.get('u');
    
    if (venueId && unitId) {
      // QR code scanned - start new session
      console.log('🔍 QR code detected:', { venueId, unitId });
      startSession(venueId, unitId, ''); // venueName will be fetched by SpotPage
    } else {
      // No QR params - check if session is still active
      if (!isSessionActive()) {
        console.log('⚠️ No active session');
      }
    }
  }, [searchParams, startSession, isSessionActive]);
  
  // For now, always show SpotPage for /spot and /menu routes
  // Full context-aware routing will be implemented in Phase 2
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ContextAwareRouter />
      <ApiStatus />
      <Routes>
        {/* Customer-Facing Routes */}
        {/* DISCOVER MODE - Default for tourists (no QR scan) */}
        <Route path="/" element={<DiscoveryPage />} />
        
        {/* Booking Status Page - Shows booking confirmation status */}
        <Route path="/booking/:bookingCode" element={<BookingStatusPage />} />
        
        {/* Booking Success Page - Instant booking confirmation */}
        <Route path="/success/:bookingCode" element={<BookingSuccessPage />} />
        
        {/* Booking Action Page - Staff approval from WhatsApp link */}
        <Route path="/action/:bookingCode" element={<BookingActionPage />} />
        
        {/* SPOT MODE - On-site at venue (QR scanned) */}
        <Route path="/spot" element={<SpotPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/review/:venueId" element={<ReviewPage />} />
        <Route path="/review" element={<ReviewPage />} />
        
        {/* Staff Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Staff Dashboards - Protected */}
        <Route 
          path="/collector" 
          element={
            <ProtectedRoute role="Collector">
              <CollectorDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/bar" 
          element={
            <ProtectedRoute role="Bartender">
              <BarDisplay />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manager" 
          element={
            <ProtectedRoute role="Manager">
              <BusinessAdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="Manager">
              <BusinessAdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ouradmin" 
          element={
            <ProtectedRoute role="Manager">
              <OurAdmin />
            </ProtectedRoute>
          } 
        />

        {/* Super Admin Login - Separate from regular staff login */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* Super Admin Dashboard - Protected Route */}
        <Route 
          path="/superadmin" 
          element={
            <ErrorBoundary>
              <ProtectedRoute role="SuperAdmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />

        {/* Manager Dashboard */}
        <Route 
          path="/manager/leaderboard" 
          element={
            <ProtectedRoute role="Manager">
              <ManagerLeaderboardPage />
            </ProtectedRoute>
          } 
        />

        {/* QR Code Generator - Manager Only */}
        <Route 
          path="/qr-generator" 
          element={
            <ProtectedRoute role="Manager">
              <QRCodeGenerator />
            </ProtectedRoute>
          } 
        />

        {/* Review QR Code Generator - Manager Only */}
        <Route 
          path="/review-qr-generator" 
          element={
            <ProtectedRoute role="Manager">
              <ReviewQRGenerator />
            </ProtectedRoute>
          } 
        />

        {/* Zone Units Manager - Manager Only */}
        <Route 
          path="/admin/zones/:zoneId/units" 
          element={
            <ProtectedRoute role="Manager">
              <ZoneUnitsManager />
            </ProtectedRoute>
          } 
        />

        {/* Sunbed Mapper - Manager Only */}
        <Route 
          path="/admin/venues/:venueId/mapper" 
          element={
            <ProtectedRoute role="Manager">
              <SunbedMapper />
            </ProtectedRoute>
          } 
        />

        {/* Test Cron Job Bookings - Manager/Collector Only */}
        <Route 
          path="/test-cron" 
          element={
            <ProtectedRoute role="Manager">
              <TestCronBookings />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to discovery page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
