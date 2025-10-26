"use client";
import PageShell from "@/components/layout/PageShell";
import { StatCard } from "@/components/ui/StatCard";
import { Section } from "@/components/ui/Section";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

type User = { id: number; name: string; role: string; status: string };
const columns: ColumnDef<User, any>[] = [
  { accessorKey: "status", header: "الحالة" },
  { accessorKey: "role", header: "الدور" },
  { accessorKey: "name", header: "الاسم" },
  { accessorKey: "id", header: "الرقم" },
];
const rows: User[] = [
  { id: 1, name: "أحمد محمد", role: "مدقق", status: "نشط" },
  { id: 2, name: "فاطمة علي", role: "مدير", status: "نشط" },
  { id: 3, name: "خالد حسن", role: "مراجع", status: "معلّق" },
];

export default function UIPlayground() {
  return (
    <PageShell
      title="اختبار مكونات الواجهة - Playground"
      subtitle="صفحة منظمة لاختبار المكونات والتحقق من إمكانية الوصول والأداء"
      sidebarItems={[
        { href: "/planning/risk-universe", label: "Risk Universe" },
        { href: "/planning/scoring", label: "Scoring" },
        { href: "/planning/plan-builder", label: "Plan Builder" },
        { href: "/planning/approvals", label: "Approvals" },
        { href: "/planning/calendar", label: "Calendar" },
      ]}
      actions={<button className="btn">إجراء</button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="المستخدمون" value={rows.length} hint="إجمالي" />
        <StatCard label="نشطون" value="2" />
        <StatCard label="معلّقون" value="1" />
      </div>

      <Section title="جدول TanStack" desc="حالات: تحميل/فارغ/بيانات">
        <div className="card p-3">
          <DataTable columns={columns} data={rows} />
        </div>
      </Section>
    </PageShell>
  );
}
