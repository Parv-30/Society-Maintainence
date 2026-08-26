import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertOctagon, Search } from 'lucide-react';
import api from '../../api';
import { format } from 'date-fns';
import Loader from '../../components/Loader';
import { StatusBadge } from '../../components/Badge';
import { fadeUp, staggerContainer, staggerItem } from '../../lib/motion';

export default function ComplaintList() {
  const [filters, setFilters] = useState({ category: '', status: '', overdue: false });
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['admin-complaints', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.overdue) params.append('overdue', 'true');
      return (await api.get(`/admin/complaints?${params.toString()}`)).data;
    }
  });

  const priorityMutation = useMutation({
    mutationFn: async ({ id, priority }) => await api.patch(`/admin/complaints/${id}/priority`, { priority }),
    onSuccess: () => queryClient.invalidateQueries(['admin-complaints'])
  });

  const selectClass = 'rounded-xl border border-border-c bg-white/5 px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15';

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer(0.06)} className="grid gap-6">
      <motion.h1 variants={fadeUp} className="font-display text-3xl font-semibold text-ink">All complaints</motion.h1>

      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-c bg-surface p-4 shadow-soft">
        <select className={selectClass} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className={selectClass} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Reopened">Reopened</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300">
          <input type="checkbox" checked={filters.overdue} onChange={e => setFilters({ ...filters, overdue: e.target.checked })} className="accent-red-600" />
          <AlertOctagon size={14} />
          Overdue only
        </label>
      </motion.div>

      {isLoading ? (
        <Loader height="30vh" />
      ) : complaints?.length === 0 ? (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
          <Search size={28} className="mx-auto mb-3 text-muted-2" />
          <h3 className="font-display text-lg font-semibold text-ink">No complaints match</h3>
          <p className="mt-1 text-sm text-muted">Try adjusting your filters.</p>
        </motion.div>
      ) : (
        <>
          {/* Desktop table */}
          <motion.div variants={fadeUp} className="hidden overflow-hidden rounded-2xl border border-border-c bg-surface shadow-soft md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-c bg-white/5 text-xs uppercase tracking-wide text-muted">
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Resident</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Priority</th>
                  <th className="p-4 font-semibold">Reported</th>
                </tr>
              </thead>
              <tbody>
                {complaints?.map(c => (
                  <tr key={c.id} className="border-b border-border-c transition-colors last:border-0 hover:bg-white/5">
                    <td className="p-4">
                      <Link to={`/admin/complaints/${c.id}`} className="font-semibold text-brand-300 hover:text-brand-200 hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      {c.resident.name}
                      <div className="text-xs text-muted-2">Block {c.resident.block} · Flat {c.resident.flatNumber}</div>
                    </td>
                    <td className="p-4 text-muted">{c.category.name}</td>
                    <td className="p-4"><StatusBadge status={c.status} /></td>
                    <td className="p-4">
                      <select
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none ${c.priority === 'High' ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-border-c bg-white/5'}`}
                        value={c.priority}
                        onChange={e => priorityMutation.mutate({ id: c.id, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      {c.priorityAutoSet && <div className="mt-1 text-[10px] font-medium text-accent-400">Auto-set</div>}
                    </td>
                    <td className="p-4 text-muted">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Mobile cards */}
          <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="show" className="grid gap-3 md:hidden">
            {complaints?.map(c => (
              <motion.div variants={staggerItem} key={c.id} className="rounded-2xl border border-border-c bg-surface p-4 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/admin/complaints/${c.id}`} className="font-semibold text-brand-300">{c.title}</Link>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-1.5 text-xs text-muted">
                  {c.resident.name} · Block {c.resident.block} · Flat {c.resident.flatNumber}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted">{c.category.name} · {format(new Date(c.createdAt), 'MMM d')}</span>
                  <select
                    className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none ${c.priority === 'High' ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-border-c bg-white/5'}`}
                    value={c.priority}
                    onChange={e => priorityMutation.mutate({ id: c.id, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
