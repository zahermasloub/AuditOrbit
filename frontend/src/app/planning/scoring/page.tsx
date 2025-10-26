"use client";

import PageShell from "@/components/layout/PageShell";
import { Section } from "@/components/ui/Section";
import HeatMap from "@/components/charts/HeatMap";

export default function Page(){
  const data = [ [0,0,10],[1,1,30],[2,2,60],[3,3,80],[4,4,95] ];
  return (
    <PageShell title="التقييم وHeat Map" subtitle="ضبط الأوزان واستعراض مصفوفة 5×5"
      sidebarItems={[
        { href: "/planning/risk-universe", label: "Risk Universe" },
        { href: "/planning/scoring", label: "Scoring & Heat Map" },
        { href: "/planning/plan-builder", label: "Plan Builder" },
        { href: "/planning/approvals", label: "Approvals" },
        { href: "/planning/calendar", label: "Calendar" },
      ]}
    >
      <Section title="مصفوفة المخاطر (5×5)" desc="Impact × Likelihood مع تدرّج لوني">
        <HeatMap data={data} />
      </Section>
      <Section title="أوزان عوامل المخاطر" desc="اضبط الأوزان واحفظ إصدارًا">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[rgb(var(--border))] p-4">Impact Weight</div>
          <div className="rounded-2xl border border-[rgb(var(--border))] p-4">Likelihood Weight</div>
          <div className="rounded-2xl border border-[rgb(var(--border))] p-4">Sensitivity / Legal</div>
        </div>
      </Section>
    </PageShell>
  );
}
