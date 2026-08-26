import { motion } from 'framer-motion';

export default function Loader({ height = '50vh' }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <motion.div
        className="h-9 w-9 rounded-full border-[3px] border-white/10 border-t-brand-400"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
      />
    </div>
  );
}
