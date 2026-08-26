export function FormField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted">
        {Icon && <Icon size={14} className="text-muted-2" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-border-c bg-white/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-2 outline-none transition-all duration-150 focus:border-brand-400 focus:bg-white/[0.07] focus:ring-4 focus:ring-brand-500/15';
