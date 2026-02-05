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
import ManagerLeaderboardPage from './pages/ManagerLeaderboardPage';
import OurAdmin from './pages/OurAdmin';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
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
        <Route path="/review/:venueId" element={<ReviewPage />} />
        
        {/* Staff Dashboards - Protected */}
        <Route 
          path="/collector" 
          element={
            <ProtectedRoute role="Waiter">
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

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
