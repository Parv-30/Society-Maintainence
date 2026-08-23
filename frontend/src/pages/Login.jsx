import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Authenticating...');
    try {
      await login(email, password);
      toast.success('Login successful!', { id: loadingToast });
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'admin') navigate('/admin');
      else navigate('/resident');
    } catch (err) {
      toast.error('Invalid credentials', { id: loadingToast });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 mt-2 text-sm">Sign in to your society account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">Email Address</label>
          <input 
            type="email" 
            className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">Password</label>
          <input 
            type="password" 
            className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:-translate-y-0.5 active:translate-y-0 shadow-md">
          Sign In
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register now</Link>
      </div>
    </motion.div>
  );
}
