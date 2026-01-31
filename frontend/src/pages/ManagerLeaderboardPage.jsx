import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import ManagerStaffLeaderboard from '../components/ManagerStaffLeaderboard';

export default function ManagerLeaderboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="relative">
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider rounded border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-2"
      >
        <LogOut className="w-3 h-3" />
        Logout
      </button>
      
      <ManagerStaffLeaderboard />
    </div>
  );
}
