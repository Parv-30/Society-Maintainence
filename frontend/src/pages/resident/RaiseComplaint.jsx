import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Type, AlignLeft, Camera, Send, TriangleAlert, X } from 'lucide-react';
import api from '../../api';
import { FormField, inputClass } from '../../components/FormField';
import { pageVariants } from '../../lib/motion';

export default function RaiseComplaint() {
  const [formData, setFormData] = useState({ categoryId: '', title: '', description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await api.post('/complaints', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-complaints']);
      navigate('/resident');
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to submit')
  });

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    let photoUrl = '';
    if (file) {
      setUploading(true);
      try {
        const fileData = new FormData();
        fileData.append('photo', file);
        const res = await api.post('/upload', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photoUrl = res.data.url;
      } catch (err) {
        setError('Photo upload failed');
        setUploading(false);
        return;
      }
    }

    createMutation.mutate({ ...formData, photoUrl });
  };

  const busy = createMutation.isPending || uploading;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border-c bg-surface p-8 shadow-soft">
        <h1 className="font-display text-2xl font-semibold text-ink">Raise a complaint</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Tell us what's wrong and we'll route it to the right team.</p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex items-center gap-2 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              <TriangleAlert size={15} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Category" icon={Tag}>
            <select
              className={inputClass}
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Title" icon={Type}>
            <input
              type="text" className={inputClass}
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              required minLength={5} placeholder="Brief description of the issue"
            />
          </FormField>

          <FormField label="Detailed description" icon={AlignLeft}>
            <textarea
              className={`${inputClass} h-32 resize-none`}
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              required minLength={10} placeholder="Include location, timing, and severity if relevant"
            />
          </FormField>

          <FormField label="Photo (optional)" icon={Camera}>
            {preview ? (
              <div className="relative w-fit">
                <img src={preview} alt="Selected preview" className="h-32 w-32 rounded-xl border border-border-c object-cover" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-ink shadow-soft"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-c py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-500/5">
                <Camera size={22} className="text-muted-2" />
                <span className="text-sm text-muted">Click to attach a photo</span>
                <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleFile} />
              </label>
            )}
            <p className="mt-1.5 text-xs text-muted-2">Max 5MB (JPG/PNG)</p>
          </FormField>

          <motion.button
            whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {uploading ? 'Uploading photo...' : createMutation.isPending ? 'Submitting...' : (
              <>
                <Send size={15} /> Submit complaint
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
