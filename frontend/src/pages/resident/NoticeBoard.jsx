import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function NoticeBoard() {
  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => (await api.get('/notices')).data
  });

  if (isLoading) return <div>Loading notices...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notice Board</h1>
      <div className="grid gap-4">
        {notices?.length === 0 && <div className="text-gray-500">No notices posted.</div>}
        {notices?.map(notice => (
          <div key={notice.id} className={`p-6 rounded shadow border-l-4 ${notice.isImportant ? 'bg-red-50 border-red-500' : 'bg-white border-blue-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {notice.isImportant && <span className="text-red-500 text-sm bg-red-100 px-2 py-1 rounded">IMPORTANT</span>}
                {notice.title}
              </h2>
              <span className="text-sm text-gray-500">{format(new Date(notice.createdAt), 'PPP')}</span>
            </div>
            <p className="whitespace-pre-wrap">{notice.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
