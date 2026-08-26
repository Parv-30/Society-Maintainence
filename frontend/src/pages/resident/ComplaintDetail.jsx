import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Tag, User, Star, RotateCcw, MessageSquare } from 'lucide-react';
import api from '../../api';
import Loader from '../../components/Loader';
import { StatusBadge, PriorityBadge } from '../../components/Badge';
import { pageVariants, fadeUp, staggerContainer } from '../../lib/motion';

export default function ComplaintDetail({ isAdmin }) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
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
  if (isLoading) return <Loader />;

  const currentStatus = history?.[history.length - 1]?.toStatus || complaint?.status || 'Open';
  const resolvedEvent = history?.find(h => h.toStatus === 'Resolved');
  const canFeedback = !isAdmin && currentStatus === 'Resolved' && !complaint?.feedback;
  const hoursSinceResolved = resolvedEvent ? (new Date() - new Date(resolvedEvent.changedAt)) / (1000 * 60 * 60) : 0;
  const canReopen = canFeedback && hoursSinceResolved <= 48;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="mx-auto grid max-w-3xl gap-6">
      <Link to={isAdmin ? '/admin/complaints' : '/resident'} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted hover:text-brand-300">
        <ArrowLeft size={15} /> Back
      </Link>

      {complaint && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-border-c bg-surface p-6 shadow-soft">
          <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row">
            <div className="flex-1">
              <h1 className="font-display text-2xl font-semibold text-ink">{complaint.title}</h1>
              <div className="mb-3 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 font-medium text-muted">
                  <Tag size={11} /> {complaint.category?.name}
                </span>
                <span>Reported {format(new Date(complaint.createdAt), 'PPP')}</span>
                {complaint.resident && (
                  <span className="flex items-center gap-1"><User size={12} /> {complaint.resident.name}</span>
                )}
              </div>
              <p className="leading-relaxed text-ink">{complaint.description}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <StatusBadge status={currentStatus} />
              <PriorityBadge priority={complaint.priority} auto={complaint.priorityAutoSet} />
            </div>
          </div>
          {complaint.photoUrl && (
            <motion.img
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
              src={complaint.photoUrl} alt="Complaint evidence" className="mt-4 w-full rounded-xl border border-border-c object-cover max-h-72"
            />
          )}
        </motion.div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-border-c bg-surface p-6 shadow-soft">
        <h2 className="mb-5 font-display text-lg font-semibold text-ink">Status history</h2>
        <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-0">
          {history?.map((event, idx) => (
            <motion.div variants={fadeUp} key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-300">
                  {idx + 1}
                </div>
                {idx < history.length - 1 && <div className="my-1 w-0.5 flex-1 bg-border-c" />}
              </div>
              <div className="mb-4 flex-1 rounded-xl border border-border-c bg-white/5 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <StatusBadge status={event.toStatus} />
                  <span className="text-xs text-muted-2">{format(new Date(event.changedAt), 'PP p')}</span>
                </div>
                <div className="mt-1 text-sm text-muted">
                  By <span className="font-semibold text-ink">{event.actor?.name}</span>{' '}
                  <span className="text-muted-2">({event.actor?.role})</span>
                </div>
                {event.note && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-border-c bg-surface p-2.5 text-sm text-muted">
                    <MessageSquare size={13} className="mt-0.5 shrink-0 text-muted-2" />
                    {event.note}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {isAdmin && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-border-c bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">Update status</h3>
          <div className="flex flex-wrap gap-3">
            <select
              className="min-w-[140px] flex-1 rounded-xl border border-border-c bg-white/5 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
              value={newStatus} onChange={e => setNewStatus(e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Open">Open</option>
              <option value="InProgress">In progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <input
              type="text" placeholder="Optional note"
              className="flex-1 rounded-xl border border-border-c bg-white/5 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
              value={note} onChange={e => setNote(e.target.value)}
            />
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!newStatus) return toast.error('Select a status first');
                statusMutation.mutate({ status: newStatus, note });
              }}
              disabled={statusMutation.isPending}
              className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800 disabled:opacity-50"
            >
              {statusMutation.isPending ? 'Updating...' : 'Update'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {canFeedback && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-border-c bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">Submit feedback</h3>
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium text-muted">Rating:</label>
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map(n => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoverRating(n)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className="text-accent-500"
                >
                  <Star size={26} strokeWidth={1.5} fill={(hoverRating || rating) >= n ? 'currentColor' : 'none'} />
                </motion.button>
              ))}
            </div>
          </div>
          <AnimatePresence>
            {canReopen && rating <= 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-3.5"
              >
                <input type="checkbox" id="reopen" checked={reopen} onChange={e => setReopen(e.target.checked)} className="h-4 w-4 accent-red-600" />
                <label htmlFor="reopen" className="flex items-center gap-1.5 text-sm font-medium text-red-300">
                  <RotateCcw size={13} /> Reopen this complaint (rating &le; 2, within 48h of resolution)
                </label>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => feedbackMutation.mutate({ rating, reopen: rating <= 2 ? reopen : false })}
            disabled={feedbackMutation.isPending}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {feedbackMutation.isPending ? 'Submitting...' : 'Submit feedback'}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
