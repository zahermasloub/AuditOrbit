"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import AppShell from "@/app/components/layout/AppShell";
import { DateRangePicker, type DateRange } from "@/app/components/inputs/DateRangePicker";
import { KpiCard } from "@/app/components/manager/KpiCard";
import { ProgressRadial } from "@/app/components/manager/ProgressRadial";
import { RightStepper } from "@/app/components/manager/RightStepper";
import { apiFetch } from "@/app/lib/apiFetch";

type Engagement = { status: string };
type Finding = { id: string };

const SIDEBAR_ITEMS = [
  { href: "/manager/dashboard", label: "لوحة المدير" },
  { href: "/manager/engagements", label: "المهام" },
  { href: "/manager/reports", label: "التقارير" },
];

const STEPS = [
  { id: "plan", label: "الخطة السنوية", status: "done" as const },
  { id: "plan2", label: "التخطيط", status: "active" as const },
  { id: "risk", label: "فهم المخاطر", status: "pending" as const },
  { id: "program", label: "برنامج العمل", status: "pending" as const },
  { id: "field", label: "الأعمال الميدانية", status: "pending" as const },
  { id: "report", label: "التقرير النهائي", status: "pending" as const },
];

export default function ManagerDashboardPage() {
  const [range, setRange] = useState<DateRange>({ from: new Date(), to: new Date() });

  const query = useQuery({
    queryKey: ["manager-dashboard", range.from.toISOString(), range.to.toISOString()],
    queryFn: async () => {
      const [engagements, findings] = await Promise.all([
        apiFetch<{ items?: Engagement[] }>("/engagements?page=1&size=50"),
        apiFetch<{ items?: Finding[] }>("/ai/findings?page=1&size=50").catch(() => ({ items: [] })),
      ]);
      return {
        engagements: engagements.items ?? [],
        findings: findings.items ?? [],
      };
    },
  });

  const progress = useMemo(() => {
    const total = query.data?.engagements.length ?? 0;
    if (!total) {
      return 0;
    }
    const closedStatuses = new Set(["in_review", "approved", "published"]);
    const completed = query.data?.engagements.filter((eng) => closedStatuses.has(eng.status ?? "")).length ?? 0;
    return Math.round((completed / total) * 100);
  }, [query.data?.engagements]);

  const coverage = useMemo(() => {
    const findingsCount = query.data?.findings.length ?? 0;
    if (!findingsCount) {
      return 0;
    }
    return Math.min(100, Math.round(findingsCount * 3));
  }, [query.data?.findings]);

  const trend = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => ({
      x: index,
      y: Math.max(0, Math.min(100, progress + Math.sin(index / 2) * 10)),
    }));
  }, [progress]);

  const isLoading = query.isLoading;

  return (
    <AppShell
      sidebarItems={SIDEBAR_ITEMS}
      user={{ name: "Admin", role: "Manager" }}
      breadcrumbs={[{ label: "المدير" }, { label: "لوحة القيادة" }]}
      right={<RightStepper steps={STEPS} currentStepId="plan2" />}
    >
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[rgb(var(--ao-fg))]">لوحة القيادة</h1>
          <DateRangePicker value={range} onChangeAction={setRange} />
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-[rgb(var(--ao-border))] p-6 text-center text-sm text-[rgb(var(--ao-muted))]">
            يتم تحميل البيانات...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="إنجاز الخطة" value={`${progress}%`} delta={+3} trend={trend} />
            <KpiCard title="تغطية الاختبارات" value={`${coverage}%`} delta={-1} trend={trend} />
            <KpiCard title="طلبات PBC" value="3/15" delta={+1} />
            <div className="rounded-2xl border border-[rgb(var(--ao-border))] bg-[rgb(var(--ao-card))] p-4 shadow-ao-lg">
              <div className="text-sm text-[rgb(var(--ao-muted))]">التقدم الكلي</div>
              <div className="mt-3 flex justify-center">
                <ProgressRadial value={progress} />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-[rgb(var(--ao-border))] p-4 text-sm text-[rgb(var(--ao-muted))]">
          جدول مختصر (سيتم ربطه لاحقًا بـ DataTable)
        </div>
      </section>
    </AppShell>
  );
}
