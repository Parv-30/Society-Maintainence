import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function NoticeManager() {
  const [formData, setFormData] = useState({ title: '', body: '', isImportant: false });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => (await api.get('/notices')).data
  });

  const mutation = useMutation({
    mutationFn: async (data) => await api.post('/notices', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notices']);
      setFormData({ title: '', body: '', isImportant: false });
      setError('');
    },
    onError: () => setError('Failed to post notice')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Post a Notice</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input 
              type="text" className="w-full border p-2 rounded" required minLength={5}
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Message Body</label>
            <textarea 
              className="w-full border p-2 rounded h-32" required minLength={10}
              value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" id="important"
              checked={formData.isImportant} onChange={e => setFormData({...formData, isImportant: e.target.checked})}
            />
            <label htmlFor="important" className="font-medium text-red-600">
              Mark as IMPORTANT (Emails will be sent to all residents)
            </label>
          </div>
          
          <button 
            type="submit" disabled={mutation.isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isLoading ? 'Posting...' : 'Post Notice'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Notices</h2>
        {isLoading ? <div>Loading...</div> : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {notices?.map(notice => (
              <div key={notice.id} className={`p-4 rounded shadow border-l-4 bg-white ${notice.isImportant ? 'border-red-500' : 'border-blue-500'}`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold flex items-center gap-2 text-lg">
                    {notice.isImportant && <span className="text-red-500 text-[10px] bg-red-100 px-1.5 py-0.5 rounded">IMPORTANT</span>}
                    {notice.title}
                  </h3>
                </div>
                <div className="text-xs text-gray-500 mb-2">{format(new Date(notice.createdAt), 'PPP')}</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
