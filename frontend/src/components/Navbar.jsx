import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl text-blue-600">
          Society Tracker
        </div>
        <div className="flex gap-4">
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className="hover:text-blue-500">Dashboard</Link>
              <Link to="/admin/complaints" className="hover:text-blue-500">Complaints</Link>
              <Link to="/admin/recurring" className="hover:text-blue-500">Recurring</Link>
              <Link to="/admin/categories" className="hover:text-blue-500">Settings</Link>
              <Link to="/admin/notices" className="hover:text-blue-500">Notices</Link>
            </>
          ) : (
            <>
              <Link to="/resident" className="hover:text-blue-500">My Complaints</Link>
              <Link to="/resident/raise" className="hover:text-blue-500">Raise Issue</Link>
              <Link to="/resident/notices" className="hover:text-blue-500">Notice Board</Link>
            </>
          )}
          <button onClick={handleLogout} className="text-red-500 ml-4 font-semibold">Logout ({user.name})</button>
        </div>
      </div>
    </nav>
  );
}
