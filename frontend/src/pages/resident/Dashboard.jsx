import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, Tag, ArrowRight, CheckCircle2 } from 'lucide-react';
import Loader from '../../components/Loader';
import { StatusBadge, PriorityBadge } from '../../components/Badge';
import { staggerContainer, staggerItem, fadeUp } from '../../lib/motion';

export default function Dashboard() {
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: async () => (await api.get('/complaints/mine')).data
  });

  if (isLoading) return <Loader />;

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer(0.06)} className="mx-auto max-w-3xl">
      <motion.div variants={fadeUp} className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">My complaints</h1>
          <p className="mt-1 text-sm text-muted">Track the status of your reported issues</p>
        </div>
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/resident/raise"
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800"
          >
            <Plus size={16} />
            Raise new issue
          </Link>
        </motion.div>
      </motion.div>

      {complaints?.length === 0 ? (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500" />
          <h3 className="font-display text-lg font-semibold text-ink">All clear</h3>
          <p className="mt-1 text-sm text-muted">You haven't raised any complaints yet. Everything looks good!</p>
        </motion.div>
      ) : (
        <div className="grid gap-3.5">
          {complaints?.map(complaint => (
            <motion.div variants={staggerItem} key={complaint.id} whileHover={{ y: -2 }}>
              <Link
                to={`/resident/complaints/${complaint.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-border-c bg-surface p-5 shadow-soft transition-shadow hover:shadow-lift md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-1 items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                    <ClipboardList size={16} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink transition-colors group-hover:text-brand-300">{complaint.title}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5">
                        <Tag size={11} />
                        {complaint.category.name}
                      </span>
                      <span>{format(new Date(complaint.createdAt), 'MMM d, yyyy · h:mm a')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-12 md:pl-0">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} auto={complaint.priorityAutoSet} />
                  <ArrowRight size={16} className="ml-1 hidden shrink-0 text-muted-2 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-300 md:block" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
