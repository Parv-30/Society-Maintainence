import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
          <h3 className="text-gray-500 font-medium">Open</h3>
          <div className="text-3xl font-bold">{data.statusCounts.Open}</div>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
          <h3 className="text-gray-500 font-medium">In Progress</h3>
          <div className="text-3xl font-bold">{data.statusCounts.InProgress}</div>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
          <h3 className="text-gray-500 font-medium">Resolved</h3>
          <div className="text-3xl font-bold">{data.statusCounts.Resolved}</div>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-red-500">
          <h3 className="text-red-500 font-medium">Overdue</h3>
          <div className="text-3xl font-bold text-red-600">{data.overdueCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-4">Complaints by Category</h3>
          <ul className="space-y-2">
            {data.categoryCounts.map(c => (
              <li key={c.category} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border">
                <span>{c.category}</span>
                <span className="bg-blue-100 text-blue-800 px-2 rounded-full font-bold">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Top Recurring Issues</h3>
            <Link to="/admin/recurring" className="text-sm text-blue-600">View All</Link>
          </div>
          <ul className="space-y-2">
            {data.topRecurring.map(t => (
              <li key={t.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between font-semibold">
                  <span>{t.category.name} - Block {t.block}</span>
                  <span className="text-red-600 font-bold">{t.recurrenceCount} reports</span>
                </div>
                {t.autoEscalated && <div className="text-xs text-red-500 mt-1">Auto-escalated applied</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
