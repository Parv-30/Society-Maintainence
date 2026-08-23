import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'resident', block: '', flatNumber: ''
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating account...');
    try {
      await register(formData);
      toast.success('Registration successful! Please login.', { id: loadingToast });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed', { id: loadingToast });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-gray-500 mt-2 text-sm">Join the society network</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-sm text-gray-700">Full Name</label>
          <input type="text" className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-sm text-gray-700">Email Address</label>
          <input type="email" className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="name@example.com" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-sm text-gray-700">Password</label>
          <input type="password" className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" minLength={6}
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="••••••••" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-sm text-gray-700">Role</label>
          <select className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {formData.role === 'resident' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium text-sm text-gray-700">Block</label>
              <input type="text" className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} required placeholder="A" />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium text-sm text-gray-700">Flat Number</label>
              <input type="text" className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.flatNumber} onChange={e => setFormData({...formData, flatNumber: e.target.value})} required placeholder="101" />
            </div>
          </motion.div>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white p-3 mt-4 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:-translate-y-0.5 shadow-md">
          Create Account
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
      </div>
    </motion.div>
  );
}
