import { Circle, Clock4, CircleCheck, RotateCcw, Sparkles } from 'lucide-react';

const STATUS_STYLES = {
  Open: { cls: 'bg-white/5 text-muted border-border-c', icon: Circle },
  InProgress: { cls: 'bg-accent-500/10 text-accent-300 border-accent-500/20', icon: Clock4 },
  Resolved: { cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: CircleCheck },
  Reopened: { cls: 'bg-red-500/10 text-red-300 border-red-500/20', icon: RotateCcw },
};

const PRIORITY_STYLES = {
  Low: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
  Medium: 'bg-accent-500/10 text-accent-300 border-accent-500/20',
  High: 'bg-red-500/10 text-red-300 border-red-500/20',
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Open;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${s.cls}`}>
      <Icon size={11} strokeWidth={2.5} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, auto }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Low}`}>
      {priority}
      {auto && <Sparkles size={10} />}
    </span>
  );
}
