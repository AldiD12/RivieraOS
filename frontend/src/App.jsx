import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DiscoveryPage from './pages/DiscoveryPage';
import AdminDashboard from './pages/AdminDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import MenuPage from './pages/MenuPage';
import BarDisplay from './pages/BarDisplay';
import LoginPage from './pages/LoginPage';
import ReviewPage from './pages/ReviewPage';
import WaiterSpeedPage from './pages/WaiterSpeedPage';
import ManagerLeaderboardPage from './pages/ManagerLeaderboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/bar" element={<BarDisplay />} />
        <Route path="/review/:venueId" element={<ReviewPage />} />
        
        {/* New Speed Waiter Routes */}
        <Route path="/waiter/speed" element={<WaiterSpeedPage />} />
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
