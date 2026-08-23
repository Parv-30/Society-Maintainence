import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

export default function CategorySettings() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const mutation = useMutation({
    mutationFn: async ({ id, overdueThresholdDays }) => 
      await api.patch(`/categories/${id}`, { overdueThresholdDays: parseInt(overdueThresholdDays) }),
    onSuccess: () => queryClient.invalidateQueries(['categories'])
  });

  return (
    <div className="grid gap-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Category Settings</h1>
      
      {isLoading ? <div>Loading...</div> : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">Overdue Threshold (Days)</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map(cat => (
                <tr key={cat.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4">
                    <input 
                      type="number" min="1"
                      className="border p-2 rounded w-24"
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
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-semibold text-sm"
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
