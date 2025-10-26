import { ReactNode } from "react";

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-soft p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[rgb(var(--muted))]">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-sm text-[rgb(var(--muted))]">{hint}</div>}
    </div>
  );
}
