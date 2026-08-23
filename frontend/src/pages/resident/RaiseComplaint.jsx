import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function RaiseComplaint() {
  const [formData, setFormData] = useState({ categoryId: '', title: '', description: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await api.post('/complaints', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-complaints']);
      navigate('/resident');
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to submit')
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    let photoUrl = '';
    if (file) {
      setUploading(true);
      try {
        const fileData = new FormData();
        fileData.append('photo', file);
        const res = await api.post('/upload', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photoUrl = res.data.url;
      } catch (err) {
        setError('Photo upload failed');
        setUploading(false);
        return;
      }
    }

    createMutation.mutate({ ...formData, photoUrl });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Raise a Complaint</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select 
            className="w-full border p-2 rounded"
            value={formData.categoryId}
            onChange={e => setFormData({...formData, categoryId: e.target.value})}
            required
          >
            <option value="">Select Category</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input 
            type="text" className="w-full border p-2 rounded"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            required minLength={5} placeholder="Brief description of the issue"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Detailed Description</label>
          <textarea 
            className="w-full border p-2 rounded h-32"
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            required minLength={10}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Photo (Optional)</label>
          <input 
            type="file" accept="image/jpeg, image/png"
            className="w-full border p-2 rounded"
            onChange={e => setFile(e.target.files[0])}
          />
          <p className="text-sm text-gray-500 mt-1">Max 5MB (JPG/PNG)</p>
        </div>

        <button 
          type="submit" 
          disabled={createMutation.isLoading || uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading Photo...' : createMutation.isLoading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
