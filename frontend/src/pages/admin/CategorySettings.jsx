import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api';

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
    <div className="grid gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Category SLA Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure overdue thresholds per complaint category</p>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Category</th>
                <th className="p-4 font-semibold text-gray-700">Overdue After (Days)</th>
                <th className="p-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map(cat => (
                <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="p-4">
                    <input
                      type="number" min="1"
                      className="border border-gray-200 p-2 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      defaultValue={cat.overdueThresholdDays}
                      id={`threshold-${cat.id}`}
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        const val = document.getElementById(`threshold-${cat.id}`).value;
                        mutation.mutate({ id: cat.id, overdueThresholdDays: val });
                      }}
                      disabled={mutation.isPending}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
