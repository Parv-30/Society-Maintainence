import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api';
import { format } from 'date-fns';

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

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">All Complaints</h1>
      
      <div className="bg-white p-4 rounded shadow flex gap-4 items-center flex-wrap">
        <select className="border p-2 rounded" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
          <option value="">All Categories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Reopened">Reopened</option>
        </select>
        <label className="flex items-center gap-2 font-medium text-red-600">
          <input type="checkbox" checked={filters.overdue} onChange={e => setFilters({...filters, overdue: e.target.checked})} />
          Overdue Only
        </label>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {isLoading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">ID / Title</th>
                <th className="p-3">Resident</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Reported</th>
              </tr>
            </thead>
            <tbody>
              {complaints?.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Link to={`/admin/complaints/${c.id}`} className="text-blue-600 font-semibold hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    {c.resident.name}<br/>
                    <span className="text-xs text-gray-500">Block {c.resident.block} | Flat {c.resident.flatNumber}</span>
                  </td>
                  <td className="p-3">{c.category.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                      c.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      c.status === 'Reopened' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                    }`}>{c.status}</span>
                  </td>
                  <td className="p-3">
                    <select 
                      className={`border rounded p-1 text-xs font-semibold ${c.priority === 'High' ? 'bg-red-50 text-red-700' : ''}`}
                      value={c.priority}
                      onChange={e => priorityMutation.mutate({ id: c.id, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    {c.priorityAutoSet && <div className="text-[10px] text-red-500 mt-1">Auto-set</div>}
                  </td>
                  <td className="p-3 text-sm">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
