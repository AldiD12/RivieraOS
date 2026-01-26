import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../services/auth';

export default function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole(role)) {
    // Logged in but wrong role, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}
