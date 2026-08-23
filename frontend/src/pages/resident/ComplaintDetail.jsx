import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function ComplaintDetail({ isAdmin }) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [reopen, setReopen] = useState(false);

  // For Admin status updates
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  const { data: history, isLoading } = useQuery({
    queryKey: ['complaint-history', id],
    queryFn: async () => (await api.get(`/complaints/${id}/history`)).data
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data) => await api.post(`/complaints/${id}/feedback`, data),
    onSuccess: () => queryClient.invalidateQueries(['complaint-history', id])
  });

  const statusMutation = useMutation({
    mutationFn: async (data) => await api.patch(`/admin/complaints/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint-history', id]);
      setNewStatus('');
      setNote('');
    }
  });

  if (isLoading) return <div>Loading timeline...</div>;

  const currentStatus = history?.[history.length - 1]?.toStatus || 'Open';
  const resolvedEvent = history?.find(h => h.toStatus === 'Resolved');
  const canFeedback = !isAdmin && currentStatus === 'Resolved';
  const hoursSinceResolved = resolvedEvent 
    ? (new Date() - new Date(resolvedEvent.changedAt)) / (1000 * 60 * 60)
    : 0;
  const canReopen = canFeedback && hoursSinceResolved <= 48;

  return (
    <div className="max-w-3xl mx-auto grid gap-6">
      <h1 className="text-2xl font-bold">Complaint Timeline</h1>
      
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Status History</h2>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {history?.map((event, idx) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {idx + 1}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{event.toStatus}</span>
                  <span className="text-xs text-gray-500">{format(new Date(event.changedAt), 'PP p')}</span>
                </div>
                <div className="text-sm">
                  By: {event.actor.name} ({event.actor.role})
                </div>
                {event.note && (
                  <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border">
                    Note: {event.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-4">Update Status</h3>
          <div className="flex gap-4">
            <select className="border p-2 rounded" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <input 
              type="text" placeholder="Optional note" className="border p-2 rounded flex-1"
              value={note} onChange={e => setNote(e.target.value)}
            />
            <button 
              onClick={() => statusMutation.mutate({ status: newStatus, note })}
              disabled={!newStatus || statusMutation.isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {canFeedback && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-2">Submit Feedback</h3>
          <div className="flex items-center gap-4 mb-4">
            <label>Rating (1-5):</label>
            <input 
              type="number" min="1" max="5" className="border p-2 rounded w-20"
              value={rating} onChange={e => setRating(parseInt(e.target.value))}
            />
          </div>
          {canReopen && rating <= 2 && (
            <div className="mb-4 flex items-center gap-2">
              <input type="checkbox" id="reopen" checked={reopen} onChange={e => setReopen(e.target.checked)} />
              <label htmlFor="reopen" className="text-red-600 font-medium">Reopen this complaint (Rating is 2 or below)</label>
            </div>
          )}
          <button 
            onClick={() => feedbackMutation.mutate({ rating, reopen: rating <= 2 ? reopen : false })}
            disabled={feedbackMutation.isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}
