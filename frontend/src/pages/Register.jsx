import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Building, Home, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { FormField, inputClass } from '../components/FormField';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'resident', block: '', flatNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Creating account...');
    try {
      await register(formData);
      toast.success('Registration successful! Please login.', { id: loadingToast });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed', { id: loadingToast });
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Create account</h2>
        <p className="mt-1.5 text-sm text-muted">Join your society's resident network</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField label="Full name" icon={User}>
          <input type="text" className={inputClass}
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" />
        </FormField>
        <FormField label="Email address" icon={Mail}>
          <input type="email" className={inputClass}
            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required placeholder="name@example.com" />
        </FormField>
        <FormField label="Password" icon={Lock}>
          <input type="password" className={inputClass} minLength={6}
            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder="••••••••" />
        </FormField>
        <div className="flex gap-3.5">
          <div className="flex-1">
            <FormField label="Block" icon={Building}>
              <input type="text" className={inputClass}
                value={formData.block} onChange={e => setFormData({ ...formData, block: e.target.value })} required placeholder="A" />
            </FormField>
          </div>
          <div className="flex-1">
            <FormField label="Flat number" icon={Home}>
              <input type="text" className={inputClass}
                value={formData.flatNumber} onChange={e => setFormData({ ...formData, flatNumber: e.target.value })} required placeholder="101" />
            </FormField>
          </div>
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          Create account
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </form>
      <div className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
