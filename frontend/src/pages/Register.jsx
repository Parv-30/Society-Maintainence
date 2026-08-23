import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'resident', block: '', flatNumber: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Name</label>
          <input type="text" className="w-full border p-2 rounded"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Email</label>
          <input type="email" className="w-full border p-2 rounded"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Password</label>
          <input type="password" className="w-full border p-2 rounded" minLength={6}
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Role</label>
          <select className="w-full border p-2 rounded"
            value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {formData.role === 'resident' && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Block</label>
              <input type="text" className="w-full border p-2 rounded"
                value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} required />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium">Flat Number</label>
              <input type="text" className="w-full border p-2 rounded"
                value={formData.flatNumber} onChange={e => setFormData({...formData, flatNumber: e.target.value})} required />
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
      </div>
    </div>
  );
}
