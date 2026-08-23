import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';

export default function ComplaintDetail({ isAdmin }) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [reopen, setReopen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  const { data: complaint, isLoading: loadingComplaint } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => (await api.get(`/complaints/${id}`)).data
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['complaint-history', id],
    queryFn: async () => (await api.get(`/complaints/${id}/history`)).data
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data) => (await api.post(`/complaints/${id}/feedback`, data)).data,
    onSuccess: () => {
      toast.success('Feedback submitted!');
      queryClient.invalidateQueries(['complaint-history', id]);
      queryClient.invalidateQueries(['complaint', id]);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to submit feedback')
  });

  const statusMutation = useMutation({
    mutationFn: async (data) => (await api.patch(`/admin/complaints/${id}/status`, data)).data,
    onSuccess: () => {
      toast.success('Status updated!');
      queryClient.invalidateQueries(['complaint-history', id]);
      queryClient.invalidateQueries(['complaint', id]);
      queryClient.invalidateQueries(['admin-complaints']);
      setNewStatus('');
      setNote('');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update status')
  });

  const isLoading = loadingComplaint || loadingHistory;
  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );

  const currentStatus = history?.[history.length - 1]?.toStatus || complaint?.status || 'Open';
  const resolvedEvent = history?.find(h => h.toStatus === 'Resolved');
  const canFeedback = !isAdmin && currentStatus === 'Resolved' && !complaint?.feedback;
  const hoursSinceResolved = resolvedEvent ? (new Date() - new Date(resolvedEvent.changedAt)) / (1000 * 60 * 60) : 0;
  const canReopen = canFeedback && hoursSinceResolved <= 48;

  const statusColors = {
    Open: 'bg-gray-100 text-gray-700 border-gray-200',
    InProgress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Resolved: 'bg-green-50 text-green-700 border-green-200',
    Reopened: 'bg-red-50 text-red-700 border-red-200',
  };
  const priorityColors = {
    Low: 'bg-blue-50 text-blue-700 border-blue-200',
    Medium: 'bg-orange-50 text-orange-700 border-orange-200',
    High: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto grid gap-6">
      <Link to={isAdmin ? '/admin/complaints' : '/resident'} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Back
      </Link>

      {complaint && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{complaint.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                <span className="bg-gray-100 px-2 py-1 rounded-md font-medium">{complaint.category?.name}</span>
                <span>•</span>
                <span>Reported {format(new Date(complaint.createdAt), 'PPP')}</span>
                {complaint.resident && <span>• by {complaint.resident.name}</span>}
              </div>
              <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>
            <div className="flex flex-col gap-2 items-end shrink-0">
              <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${statusColors[currentStatus]}`}>
                {currentStatus}
              </span>
              <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${priorityColors[complaint.priority] || priorityColors.Low}`}>
                {complaint.priority} {complaint.priorityAutoSet && '(Auto)'}
              </span>
            </div>
          </div>
          {complaint.photoUrl && (
            <img src={complaint.photoUrl} alt="Complaint" className="mt-4 rounded-lg max-h-64 object-cover w-full border" />
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-5 text-gray-900">Status History</h2>
        <div className="space-y-4">
          {history?.map((event, idx) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                {idx < history.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 my-1"></div>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex-1 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold uppercase border ${statusColors[event.toStatus] || 'bg-gray-100'}`}>
                    {event.toStatus}
                  </span>
                  <span className="text-xs text-gray-400">{format(new Date(event.changedAt), 'PP p')}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  By <span className="font-semibold">{event.actor?.name}</span> <span className="text-gray-400">({event.actor?.role})</span>
                </div>
                {event.note && (
                  <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                    💬 {event.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Update Status</h3>
          <div className="flex gap-3 flex-wrap">
            <select className="border p-2 rounded-lg flex-1 min-w-[140px]" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <input
              type="text" placeholder="Optional note"
              className="border p-2 rounded-lg flex-1"
              value={note} onChange={e => setNote(e.target.value)}
            />
            <button
              onClick={() => {
                if (!newStatus) return toast.error('Select a status first');
                statusMutation.mutate({ status: newStatus, note });
              }}
              disabled={statusMutation.isPending}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {statusMutation.isPending ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {canFeedback && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Submit Feedback</h3>
          <div className="flex items-center gap-4 mb-4">
            <label className="font-medium text-gray-700">Rating (1–5):</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`w-9 h-9 rounded-full font-bold text-sm border-2 transition ${
                    rating >= n ? 'bg-yellow-400 border-yellow-400 text-white' : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {canReopen && rating <= 2 && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <input type="checkbox" id="reopen" checked={reopen} onChange={e => setReopen(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="reopen" className="text-red-700 font-medium text-sm">
                Reopen this complaint (rating ≤ 2, within 48h of resolution)
              </label>
            </div>
          )}
          <button
            onClick={() => feedbackMutation.mutate({ rating, reopen: rating <= 2 ? reopen : false })}
            disabled={feedbackMutation.isPending}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
