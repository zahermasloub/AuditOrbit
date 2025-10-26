"use client";

import PageShell from "@/components/layout/PageShell";
import { Section } from "@/components/ui/Section";
import { AuditCard } from "@/components/ui/AuditCard";

export default function Page(){
  return (
    <PageShell title="منشئ الخطة السنوية" subtitle="اختيار وترتيب بنود الخطة"
      sidebarItems={[
        { href: "/planning/risk-universe", label: "Risk Universe" },
        { href: "/planning/scoring", label: "Scoring & Heat Map" },
        { href: "/planning/plan-builder", label: "Plan Builder" },
        { href: "/planning/approvals", label: "Approvals" },
        { href: "/planning/calendar", label: "Calendar" },
      ]}
    >
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-[rgb(var(--border))] p-4">Filters</div>
        <div className="rounded-2xl border border-[rgb(var(--border))] p-4">Capacity Match</div>
        <div className="rounded-2xl border border-[rgb(var(--border))] p-4">Top-N</div>
      </div>
      <Section title="عناصر مقترحة">
        <div className="grid gap-2">
          <AuditCard title="دورة المشتريات" meta="أثر: عالي | احتمال: متوسط" right={<button className="px-3 py-2 rounded-xl border">إضافة</button>} />
          <AuditCard title="الإيرادات" meta="أثر: عالي | احتمال: عالي" right={<button className="px-3 py-2 rounded-xl border">إضافة</button>} />
        </div>
      </Section>
    </PageShell>
  );
}
