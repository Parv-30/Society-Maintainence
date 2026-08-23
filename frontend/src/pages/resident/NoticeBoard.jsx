import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '../../api';

export default function NoticeBoard() {
  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => (await api.get('/notices')).data
  });

  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notice Board</h1>
        <p className="text-gray-500 text-sm mt-1">Important announcements pinned to top</p>
      </div>

      {notices?.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
          No notices posted yet.
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
          {notices?.map(notice => (
            <motion.div
              variants={item}
              key={notice.id}
              className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${
                notice.isImportant ? 'border-red-500' : 'border-blue-400'
              } border border-gray-100`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  {notice.isImportant && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded uppercase tracking-wide">
                      📢 Important
                    </span>
                  )}
                  {notice.title}
                </h3>
                <span className="text-xs text-gray-400 shrink-0">
                  {format(new Date(notice.createdAt), 'PP')}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{notice.body}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
