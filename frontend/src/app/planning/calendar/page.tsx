import PageShell from "@/components/layout/PageShell";
import { Section } from "@/components/ui/Section";

export default function Page(){
  return (
    <PageShell title="التقويم السنوي" subtitle="توزيع الموارد على الشهور"
      sidebarItems={[
        { href: "/planning/risk-universe", label: "Risk Universe" },
        { href: "/planning/scoring", label: "Scoring & Heat Map" },
        { href: "/planning/plan-builder", label: "Plan Builder" },
        { href: "/planning/approvals", label: "Approvals" },
        { href: "/planning/calendar", label: "Calendar" },
      ]}
    >
      <Section title="العرض الشهري">
        <div className="rounded-2xl border border-[rgb(var(--border))] p-8 text-center text-[rgb(var(--muted))]">
          (Calendar/Gantt placeholder)
        </div>
      </Section>
    </PageShell>
  );
}
