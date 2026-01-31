import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DiscoveryPage from './pages/DiscoveryPage';
import AdminDashboard from './pages/AdminDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import MenuPage from './pages/MenuPage';
import BarDisplay from './pages/BarDisplay';
import LoginPage from './pages/LoginPage';
import ReviewPage from './pages/ReviewPage';
import ManagerLeaderboardPage from './pages/ManagerLeaderboardPage';
import OurAdmin from './pages/OurAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import ApiStatus from './components/ApiStatus';

function App() {
  return (
    <BrowserRouter>
      <ApiStatus />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/bar" element={<BarDisplay />} />
        <Route path="/review/:venueId" element={<ReviewPage />} />
        
        {/* Manager Dashboard */}
        <Route path="/manager/leaderboard" element={<ManagerLeaderboardPage />} />

        {/* Admin Routes - Protected */}
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* OurAdmin Dashboard - Protected */}
        <Route 
          path="/ouradmin" 
          element={
            <ProtectedRoute role="Admin">
              <OurAdmin />
            </ProtectedRoute>
          } 
        />

        {/* Collector Routes - Protected */}
        <Route 
          path="/collector" 
          element={
            <ProtectedRoute role="Waiter">
              <CollectorDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
