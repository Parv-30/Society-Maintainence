import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { SlidersHorizontal } from 'lucide-react';
import api from '../../api';
import Loader from '../../components/Loader';
import { staggerContainer, staggerItem, fadeUp } from '../../lib/motion';

export default function CategorySettings() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get('/admin/categories')).data
  });

  const mutation = useMutation({
    mutationFn: async ({ id, overdueThresholdDays }) =>
      await api.patch(`/admin/categories/${id}`, { overdueThresholdDays: parseInt(overdueThresholdDays) }),
    onSuccess: () => {
      toast.success('SLA threshold updated!');
      queryClient.invalidateQueries(['admin-categories']);
    },
    onError: () => toast.error('Failed to update threshold')
  });

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer(0.06)} className="grid max-w-3xl gap-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-semibold text-ink">Category SLA settings</h1>
        <p className="mt-1 text-sm text-muted">Configure overdue thresholds per complaint category</p>
      </motion.div>

      {isLoading ? (
        <Loader height="30vh" />
      ) : (
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-border-c bg-surface shadow-soft">
          <table className="w-full text-left">
            <thead className="border-b border-border-c bg-white/5">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-wide text-muted">Category</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wide text-muted">Overdue after (days)</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wide text-muted">Action</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer(0.04)}>
              {categories?.map(cat => (
                <motion.tr variants={staggerItem} key={cat.id} className="border-b border-border-c transition-colors last:border-0 hover:bg-white/5">
                  <td className="p-4 font-medium text-ink">{cat.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={13} className="text-muted-2" />
                      <input
                        type="number" min="1"
                        className="w-24 rounded-lg border border-border-c bg-white/5 p-2 text-sm text-ink outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
                        defaultValue={cat.overdueThresholdDays}
                        id={`threshold-${cat.id}`}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <motion.button
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const val = document.getElementById(`threshold-${cat.id}`).value;
                        mutation.mutate({ id: cat.id, overdueThresholdDays: val });
                      }}
                      disabled={mutation.isPending}
                      className="rounded-lg bg-brand-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
                    >
                      Save
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
