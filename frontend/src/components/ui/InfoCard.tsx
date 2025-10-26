export function InfoCard({ title, children, footer }: { title: string; children?: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-soft p-4">
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <div className="text-sm">{children}</div>
      {footer && <div className="mt-3 pt-3 border-t border-[rgb(var(--border))] text-sm">{footer}</div>}
    </section>
  );
}
