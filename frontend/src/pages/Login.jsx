import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // user role check is handled by protection, but let's navigate properly
      // We need to fetch the updated user from localstorage since context update might lag one cycle here
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'admin') navigate('/admin');
      else navigate('/resident');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Email</label>
          <input 
            type="email" 
            className="w-full border p-2 rounded"
            value={email} onChange={e => setEmail(e.target.value)} required 
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Password</label>
          <input 
            type="password" 
            className="w-full border p-2 rounded"
            value={password} onChange={e => setPassword(e.target.value)} required 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
      </div>
    </div>
  );
}
