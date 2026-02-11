import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ZoneUnitsManager from './pages/ZoneUnitsManager';
import SunbedMapper from './pages/SunbedMapper';
import ProtectedRoute from './components/ProtectedRoute';
import ApiStatus from './components/ApiStatus';

function App() {
  return (
    <BrowserRouter>
      <ApiStatus />
      <Routes>
        {/* Direct Login - Main Entry Point */}
        <Route path="/" element={<LoginPage />} />
        

        
        {/* Staff Login - After Business Setup */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Customer-Facing Routes (QR Code Access) */}
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/spot" element={<SpotPage />} />
        <Route path="/review/:venueId" element={<ReviewPage />} />
        <Route path="/review" element={<ReviewPage />} />
        
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
            <ProtectedRoute role="SuperAdmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
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

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
