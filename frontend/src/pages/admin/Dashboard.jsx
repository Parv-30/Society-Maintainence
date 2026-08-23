import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data
  });

  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );

  const statCards = [
    { label: 'Open', value: data.statusCounts.Open, color: 'border-blue-500', text: 'text-blue-600' },
    { label: 'In Progress', value: data.statusCounts.InProgress, color: 'border-yellow-500', text: 'text-yellow-600' },
    { label: 'Resolved', value: data.statusCounts.Resolved, color: 'border-green-500', text: 'text-green-600' },
    { label: 'Overdue', value: data.overdueCount, color: 'border-red-500', text: 'text-red-600' },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all society maintenance activity</p>
      </div>

      {/* Stat Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(card => (
          <motion.div variants={item} key={card.label} className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${card.color} border border-gray-100`}>
            <h3 className="text-gray-500 font-medium text-sm">{card.label}</h3>
            <div className={`text-4xl font-bold mt-1 ${card.text}`}>{card.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Counts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-gray-900">Complaints by Category</h3>
          <ul className="space-y-2">
            {data.categoryCounts.filter(c => c.count > 0).map(c => (
              <li key={c.category} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm font-medium text-gray-700">{c.category}</span>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Recurring */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">Top Recurring Issues</h3>
            <Link to="/admin/recurring" className="text-sm text-blue-600 hover:underline">View All →</Link>
          </div>
          {data.topRecurring.length === 0 ? (
            <p className="text-sm text-gray-400">No recurring issues yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topRecurring.map(t => (
                <li key={t.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between font-semibold text-sm">
                    <span className="text-gray-800">{t.category.name} — Block {t.block}</span>
                    <span className="text-red-600 font-bold">{t.recurrenceCount}×</span>
                  </div>
                  {t.autoEscalated && (
                    <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Auto-escalated</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
