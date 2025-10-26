export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 text-center">
      <div className="text-xl font-semibold mb-1">{title}</div>
      {desc && <div className="text-sm text-[rgb(var(--muted))] mb-4">{desc}</div>}
      {action}
    </div>
  );
}
