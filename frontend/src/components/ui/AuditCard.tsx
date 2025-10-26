export function AuditCard({ title, meta, right }: { title: string; meta?: string; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold">{title}</div>
        {meta && <div className="text-sm text-[rgb(var(--muted))]">{meta}</div>}
      </div>
      {right}
    </div>
  );
}
