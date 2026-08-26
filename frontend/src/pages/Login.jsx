import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { FormField, inputClass } from '../components/FormField';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Authenticating...');
    try {
      await login(email, password);
      toast.success('Login successful!', { id: loadingToast });
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'admin') navigate('/admin');
      else navigate('/resident');
    } catch (err) {
      toast.error('Invalid credentials', { id: loadingToast });
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-ink">Welcome back</h2>
        <p className="mt-1.5 text-sm text-muted">Sign in to your society account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email address" icon={Mail}>
          <input
            type="email"
            className={inputClass}
            value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com"
          />
        </FormField>
        <FormField label="Password" icon={Lock}>
          <input
            type="password"
            className={inputClass}
            value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
          />
        </FormField>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          Sign in
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </form>
      <div className="mt-6 text-center text-sm text-muted">
        Don't have an account? <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-200">Register now</Link>
      </div>
    </AuthLayout>
  );
}
