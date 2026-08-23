import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints/mine');
      return res.data;
    }
  });

  if (isLoading) return <div>Loading complaints...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Complaints</h1>
        <Link to="/resident/raise" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Raise New Complaint
        </Link>
      </div>

      <div className="grid gap-4">
        {complaints?.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center text-gray-500">
            You haven't raised any complaints yet.
          </div>
        ) : (
          complaints?.map(complaint => (
            <Link key={complaint.id} to={`/resident/complaints/${complaint.id}`} className="block bg-white p-4 rounded shadow hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{complaint.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Category: {complaint.category.name} | Created on {format(new Date(complaint.createdAt), 'PPP')}
                  </div>
                </div>
                <div className="flex gap-2 flex-col items-end">
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${
                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    complaint.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'Reopened' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${
                    complaint.priority === 'High' ? 'bg-red-100 text-red-800' :
                    complaint.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {complaint.priority} Priority {complaint.priorityAutoSet && '(Auto)'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
