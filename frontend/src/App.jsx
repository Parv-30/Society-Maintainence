import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/resident/Dashboard';
import RaiseComplaint from './pages/resident/RaiseComplaint';
import ComplaintDetail from './pages/resident/ComplaintDetail';
import ResidentNotices from './pages/resident/NoticeBoard';
import AdminDashboard from './pages/admin/Dashboard';
import ComplaintList from './pages/admin/ComplaintList';
import RecurringIssues from './pages/admin/RecurringIssues';
import CategorySettings from './pages/admin/CategorySettings';
import NoticeManager from './pages/admin/NoticeManager';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/resident'} />;
  }
  
  return children;
};

function AppRoutes() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', borderRadius: '8px' } }} />
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Resident Routes */}
            <Route path="/resident" element={<ProtectedRoute role="resident"><ResidentDashboard /></ProtectedRoute>} />
            <Route path="/resident/raise" element={<ProtectedRoute role="resident"><RaiseComplaint /></ProtectedRoute>} />
            <Route path="/resident/complaints/:id" element={<ProtectedRoute role="resident"><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/resident/notices" element={<ProtectedRoute role="resident"><ResidentNotices /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><ComplaintList /></ProtectedRoute>} />
            <Route path="/admin/complaints/:id" element={<ProtectedRoute role="admin"><ComplaintDetail isAdmin={true} /></ProtectedRoute>} />
            <Route path="/admin/recurring" element={<ProtectedRoute role="admin"><RecurringIssues /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute role="admin"><CategorySettings /></ProtectedRoute>} />
            <Route path="/admin/notices" element={<ProtectedRoute role="admin"><NoticeManager /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
