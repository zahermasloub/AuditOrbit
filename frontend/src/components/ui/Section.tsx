export function Section({ title, desc, right, children }: { title: string; desc?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {desc && <p className="text-sm text-[rgb(var(--muted))]">{desc}</p>}
        </div>
        {right}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}
