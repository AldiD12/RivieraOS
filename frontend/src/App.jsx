import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';

// Eagerly loaded components (essential for layout/auth)
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppStore } from './store/appStore';

// Lazy loaded page components (Code Splitting)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BusinessAdminDashboard = lazy(() => import('./pages/BusinessAdminDashboard'));
const CollectorDashboard = lazy(() => import('./pages/CollectorDashboard'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const BarDisplay = lazy(() => import('./pages/BarDisplay'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const BusinessSetupPage = lazy(() => import('./pages/BusinessSetupPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const ReviewQRGenerator = lazy(() => import('./pages/ReviewQRGenerator'));
const ManagerLeaderboardPage = lazy(() => import('./pages/ManagerLeaderboardPage'));
const OurAdmin = lazy(() => import('./pages/OurAdmin'));
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const QRCodeGenerator = lazy(() => import('./pages/QRCodeGenerator'));
const TestCronBookings = lazy(() => import('./pages/TestCronBookings'));
const SpotPage = lazy(() => import('./pages/SpotPage'));
const LandingSpotPage = lazy(() => import('./pages/LandingSpotPage'));
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const BookingStatusPage = lazy(() => import('./pages/BookingStatusPage'));
const BookingSuccessPage = lazy(() => import('./pages/BookingSuccessPage'));
const BookingActionPage = lazy(() => import('./pages/BookingActionPage'));
const ZoneUnitsManager = lazy(() => import('./pages/ZoneUnitsManager'));
const SunbedMapper = lazy(() => import('./pages/SunbedMapper'));

// Full screen loading fallback for Suspense
const FullScreenLoader = () => (
  <div className="fixed inset-0 bg-stone-50 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-stone-200 border-t-zinc-900 rounded-full animate-spin"></div>
      <p className="text-sm font-medium tracking-widest uppercase text-zinc-500">Loading...</p>
    </div>
  </div>
);

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
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* Customer-Facing Routes */}
          {/* DISCOVER MODE - Default for tourists (no QR scan) */}
          <Route path="/" element={<DiscoveryPage />} />
          
          {/* EVENTS PAGE - Standalone events view with exact HTML mockup design */}
          <Route path="/events" element={<EventsPage />} />
          
          {/* Booking Status Page - Shows booking confirmation status */}
          <Route path="/booking/:bookingCode" element={<BookingStatusPage />} />
          
          {/* Booking Success Page - Instant booking confirmation */}
          <Route path="/success/:bookingCode" element={<BookingSuccessPage />} />
          
          {/* Booking Action Page - Staff approval from WhatsApp link */}
          <Route path="/action/:bookingCode" element={<BookingActionPage />} />
          
          {/* SPOT MODE - On-site at venue (QR scanned) */}
          <Route path="/spot" element={<LandingSpotPage />} />
          <Route path="/spot/menu" element={<SpotPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
