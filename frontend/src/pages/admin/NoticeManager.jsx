import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Type, AlignLeft, Megaphone, Send, TriangleAlert, Inbox } from 'lucide-react';
import api from '../../api';
import Loader from '../../components/Loader';
import { FormField, inputClass } from '../../components/FormField';
import { fadeUp, staggerContainer, staggerItem } from '../../lib/motion';

export default function NoticeManager() {
  const [formData, setFormData] = useState({ title: '', body: '', isImportant: false });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => (await api.get('/notices')).data
  });

  const mutation = useMutation({
    mutationFn: async (data) => await api.post('/notices', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notices']);
      setFormData({ title: '', body: '', isImportant: false });
      setError('');
    },
    onError: () => setError('Failed to post notice')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Post a notice</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border-c bg-surface p-6 shadow-soft">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                <TriangleAlert size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <FormField label="Title" icon={Type}>
            <input
              type="text" className={inputClass} required minLength={5}
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Elevator maintenance this weekend"
            />
          </FormField>

          <FormField label="Message body" icon={AlignLeft}>
            <textarea
              className={`${inputClass} h-32 resize-none`} required minLength={10}
              value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })}
              placeholder="Add the details residents need to know"
            />
          </FormField>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5">
            <input
              type="checkbox"
              checked={formData.isImportant} onChange={e => setFormData({ ...formData, isImportant: e.target.checked })}
              className="h-4 w-4 accent-red-600"
            />
            <span className="flex items-center gap-1.5 text-sm font-medium text-red-300">
              <Megaphone size={14} /> Mark as important (emails sent to all residents)
            </span>
          </label>

          <motion.button
            whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {mutation.isPending ? 'Posting...' : (<><Send size={15} /> Post notice</>)}
          </motion.button>
        </form>
      </motion.div>

      <div>
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Recent notices</h2>
        {isLoading ? <Loader height="30vh" /> : notices?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center">
            <Inbox size={26} className="mx-auto mb-2 text-muted-2" />
            <p className="text-sm text-muted">No notices posted yet.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="show" variants={staggerContainer(0.06)}
            className="max-h-[600px] space-y-3.5 overflow-y-auto pr-1"
          >
            {notices?.map(notice => (
              <motion.div
                variants={staggerItem}
                key={notice.id}
                className="rounded-2xl border border-border-c bg-surface p-4 shadow-soft"
                style={{ borderLeftWidth: 4, borderLeftColor: notice.isImportant ? '#ef4444' : 'var(--color-brand-400)' }}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                    {notice.isImportant && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">Important</span>
                    )}
                    {notice.title}
                  </h3>
                </div>
                <div className="mb-2 text-xs text-muted-2">{format(new Date(notice.createdAt), 'PPP')}</div>
                <p className="whitespace-pre-wrap text-sm text-muted">{notice.body}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
