import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints/mine');
      return res.data;
    }
  });

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-500 text-sm mt-1">Track the status of your reported issues</p>
        </div>
        <Link to="/resident/raise" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          Raise New Issue
        </Link>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
        {complaints?.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            You haven't raised any complaints yet. Everything looks good!
          </div>
        ) : (
          complaints?.map(complaint => (
            <motion.div variants={item} key={complaint.id}>
              <Link to={`/resident/complaints/${complaint.id}`} className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{complaint.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">{complaint.category.name}</span>
                      <span>•</span>
                      <span>{format(new Date(complaint.createdAt), 'MMM d, yyyy - h:mm a')}</span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${
                      complaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                      complaint.status === 'InProgress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      complaint.status === 'Reopened' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {complaint.status}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${
                      complaint.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                      complaint.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {complaint.priority} {complaint.priorityAutoSet && '(Auto)'}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
