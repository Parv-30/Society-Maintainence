import { motion } from 'framer-motion';
import { Building2, ShieldCheck, TrendingUp } from 'lucide-react';

const STATS = [
  { label: 'issues resolved', value: '2.4k', icon: ShieldCheck },
  { label: 'on-time SLA', value: '98%', icon: TrendingUp },
];

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border-c bg-surface shadow-lift md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden flex-col justify-between overflow-hidden bg-brand-700 p-10 text-white md:flex"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-accent-500/15" />

          <div className="relative flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Building2 size={18} />
            </span>
            SocietyTracker
          </div>

          <div className="relative">
            <h2 className="font-display text-3xl font-semibold leading-snug">
              Keep your community running smoothly.
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-100">
              Track repairs, spot recurring problems early, and keep every resident in the loop &mdash; all from one place.
            </p>
          </div>

          <div className="relative flex gap-3">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex-1 rounded-xl bg-white/10 p-3.5"
              >
                <s.icon size={16} className="mb-2 text-accent-300" />
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-[11px] text-brand-100">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col justify-center bg-surface p-8 sm:p-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
