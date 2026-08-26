import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, LayoutDashboard, ListChecks, Repeat, SlidersHorizontal,
  Megaphone, FileText, LogOut, Menu, X
} from 'lucide-react';

const NAV_ICONS = {
  '/admin': LayoutDashboard,
  '/admin/complaints': ListChecks,
  '/admin/recurring': Repeat,
  '/admin/categories': SlidersHorizontal,
  '/admin/notices': Megaphone,
  '/resident': ListChecks,
  '/resident/raise': FileText,
  '/resident/notices': Megaphone,
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const links = user.role === 'admin'
    ? [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/complaints', label: 'Complaints' },
        { to: '/admin/recurring', label: 'Recurring' },
        { to: '/admin/categories', label: 'Settings' },
        { to: '/admin/notices', label: 'Notices' },
      ]
    : [
        { to: '/resident', label: 'My complaints' },
        { to: '/resident/raise', label: 'Raise issue' },
        { to: '/resident/notices', label: 'Notice board' },
      ];

  const NavLink = ({ to, label, mobile }) => {
    const isActive = location.pathname === to;
    const Icon = NAV_ICONS[to];
    return (
      <Link
        to={to}
        onClick={() => setMenuOpen(false)}
        className={`relative flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${
          mobile ? 'px-4 py-3' : 'px-3 py-2'
        } ${isActive ? 'text-white' : 'text-muted hover:text-white hover:bg-white/5'}`}
      >
        {mobile && Icon && <Icon size={18} strokeWidth={2} />}
        {label}
        {isActive && !mobile && (
          <motion.div
            layoutId="navbar-indicator"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute -bottom-[1px] left-2 right-2 h-[2.5px] rounded-full bg-brand-400"
          />
        )}
        {isActive && mobile && (
          <motion.div layoutId="navbar-indicator-mobile" className="absolute inset-0 rounded-lg bg-white/5 -z-10" />
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border-c bg-page/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={user.role === 'admin' ? '/admin' : '/resident'} className="flex items-center gap-2 shrink-0">
          <motion.span
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow"
          >
            <Building2 size={18} strokeWidth={2.25} />
          </motion.span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            SocietyTracker
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map(l => <NavLink key={l.to} {...l} />)}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-3 text-sm font-medium text-muted">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
              {user.name.charAt(0)}
            </span>
            {user.name.split(' ')[0]}
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            <LogOut size={15} />
            Logout
          </button>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-white/5"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="sm:hidden overflow-hidden border-t border-border-c bg-page"
          >
            <div className="flex flex-col gap-1 p-3">
              {links.map(l => <NavLink key={l.to} {...l} mobile />)}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
