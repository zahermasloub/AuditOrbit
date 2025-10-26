"use client";

import PageShell from "@/components/layout/PageShell";
import { Section } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

type Risk = { 
  owner_dept: string; 
  process: string; 
  risk_title: string; 
  inherent_impact: number; 
  inherent_likelihood: number 
};

const columns: ColumnDef<Risk, any>[] = [
  { accessorKey: "owner_dept", header: "القطاع" },
  { accessorKey: "process", header: "العملية" },
  { accessorKey: "risk_title", header: "الخطر" },
  { accessorKey: "inherent_impact", header: "الأثر" },
  { accessorKey: "inherent_likelihood", header: "الاحتمال" },
];

export default function Page(){
  const data: Risk[] = [];
  return (
    <PageShell
      title="كون المخاطر (Risk Universe)"
      subtitle="إدارة قائمة المخاطر وعوامل الترجيح"
      sidebarItems={[
        { href: "/planning/risk-universe", label: "Risk Universe" },
        { href: "/planning/scoring", label: "Scoring & Heat Map" },
        { href: "/planning/plan-builder", label: "Plan Builder" },
        { href: "/planning/approvals", label: "Approvals" },
        { href: "/planning/calendar", label: "Calendar" },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="عدد المخاطر" value={data.length} hint="الكل" />
        <StatCard label="عالية الأثر" value="—" hint="Top-N" />
        <StatCard label="محدّثة هذا الأسبوع" value="—" />
      </div>

      <Section title="سجل المخاطر" desc="قابل للفرز والتصفية والاستيراد CSV">
        <DataTable columns={columns} data={data} />
      </Section>
    </PageShell>
  );
}
