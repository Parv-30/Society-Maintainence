import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox, Clock4, CircleCheck, AlertTriangle, Flame, ArrowRight } from 'lucide-react';
import api from '../../api';
import Loader from '../../components/Loader';
import { staggerContainer, staggerItem, fadeUp } from '../../lib/motion';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data
  });

  if (isLoading) return <Loader />;

  const statCards = [
    { label: 'Open', value: data.statusCounts.Open, icon: Inbox, bg: 'bg-brand-500/10', fg: 'text-brand-300' },
    { label: 'In progress', value: data.statusCounts.InProgress, icon: Clock4, bg: 'bg-accent-500/10', fg: 'text-accent-300' },
    { label: 'Resolved', value: data.statusCounts.Resolved, icon: CircleCheck, bg: 'bg-emerald-500/10', fg: 'text-emerald-300' },
    { label: 'Overdue', value: data.overdueCount, icon: AlertTriangle, bg: 'bg-red-500/10', fg: 'text-red-300' },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer(0.06)} className="grid gap-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-semibold text-ink">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of all society maintenance activity</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map(card => (
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3 }}
            key={card.label}
            className="rounded-2xl border border-border-c bg-surface p-5 shadow-soft transition-shadow hover:shadow-lift hover:border-border-strong"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.fg}`}>
              <card.icon size={19} strokeWidth={2.25} />
            </span>
            <h3 className="mt-3.5 text-sm font-medium text-muted">{card.label}</h3>
            <div className="mt-0.5 text-3xl font-bold tracking-tight text-ink">{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div variants={fadeUp} className="rounded-2xl border border-border-c bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">Complaints by category</h3>
          <ul className="space-y-1.5">
            {data.categoryCounts.filter(c => c.count > 0).map((c, i) => (
              <motion.li
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                key={c.category}
                className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-white/5"
              >
                <span className="text-sm font-medium text-muted">{c.category}</span>
                <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-300">{c.count}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-border-c bg-surface p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Top recurring issues</h3>
            <Link to="/admin/recurring" className="flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {data.topRecurring.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-2">No recurring issues yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topRecurring.map(t => (
                <li key={t.id} className="rounded-xl border border-border-c bg-white/5 p-3.5">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-ink">{t.category.name} &mdash; Block {t.block}</span>
                    <span className="flex items-center gap-1 font-bold text-red-400">
                      {t.recurrenceCount}&times;
                    </span>
                  </div>
                  {t.autoEscalated && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
                      <Flame size={10} /> Auto-escalated
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
