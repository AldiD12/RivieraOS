import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        {/* Staff Login - Default Landing */}
        <Route path="/" element={<LoginPage />} />
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
            <ProtectedRoute role="Waiter">
              <BarDisplay />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manager" 
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="Admin">
              <OurAdmin />
            </ProtectedRoute>
          } 
        />

        {/* Manager Dashboard */}
        <Route 
          path="/manager/leaderboard" 
          element={
            <ProtectedRoute role="Admin">
              <ManagerLeaderboardPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
