import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="relative px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-blue-600 text-gray-700">
        {children}
        {isActive && (
          <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          SocietyTracker
        </motion.div>
        
        <div className="flex items-center gap-1 md:gap-4 hidden sm:flex">
          {user.role === 'admin' ? (
            <>
              <NavLink to="/admin">Dashboard</NavLink>
              <NavLink to="/admin/complaints">Complaints</NavLink>
              <NavLink to="/admin/recurring">Recurring</NavLink>
              <NavLink to="/admin/categories">Settings</NavLink>
              <NavLink to="/admin/notices">Notices</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/resident">My Complaints</NavLink>
              <NavLink to="/resident/raise">Raise Issue</NavLink>
              <NavLink to="/resident/notices">Notice Board</NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700 hidden md:block">
            Hi, {user.name.split(' ')[0]}
          </div>
          <button onClick={handleLogout} className="text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
