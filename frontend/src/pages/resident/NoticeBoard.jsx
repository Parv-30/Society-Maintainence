import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Megaphone, Inbox } from 'lucide-react';
import api from '../../api';
import Loader from '../../components/Loader';
import { staggerContainer, staggerItem, fadeUp } from '../../lib/motion';

export default function NoticeBoard() {
  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => (await api.get('/notices')).data
  });

  if (isLoading) return <Loader />;

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer(0.06)} className="mx-auto max-w-2xl">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Notice board</h1>
        <p className="mt-1 text-sm text-muted">Important announcements, pinned to top</p>
      </motion.div>

      {notices?.length === 0 ? (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
          <Inbox size={28} className="mx-auto mb-3 text-muted-2" />
          <h3 className="font-display text-lg font-semibold text-ink">No notices yet</h3>
          <p className="mt-1 text-sm text-muted">Society announcements will show up here.</p>
        </motion.div>
      ) : (
        <div className="grid gap-3.5">
          {notices?.map(notice => (
            <motion.div
              variants={staggerItem}
              key={notice.id}
              whileHover={{ y: -2 }}
              className={`rounded-2xl border bg-surface p-5 shadow-soft transition-shadow hover:shadow-lift ${
                notice.isImportant ? 'border-red-500/20' : 'border-border-c'
              }`}
              style={notice.isImportant ? { borderLeftWidth: 4, borderLeftColor: '#ef4444' } : { borderLeftWidth: 4, borderLeftColor: 'var(--color-brand-400)' }}
            >
              <div className="mb-1.5 flex items-start justify-between gap-4">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                  {notice.isImportant && (
                    <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
                      <Megaphone size={10} /> Important
                    </span>
                  )}
                  {notice.title}
                </h3>
                <span className="shrink-0 text-xs text-muted-2">{format(new Date(notice.createdAt), 'PP')}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{notice.body}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
