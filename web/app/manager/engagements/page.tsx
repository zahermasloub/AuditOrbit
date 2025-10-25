"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { FilterBar } from "@/app/components/manager/FilterBar";
import { DataTable, type DataTableColumn } from "@/app/components/table/DataTable";
import { DataTableToolbar } from "@/app/components/table/DataTableToolbar";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/apiFetch";

type EngagementRow = {
  id: string;
  title: string;
  department?: string | null;
  status: string;
  start_date?: string | null;
  due_date?: string | null;
};

type EngagementResponse = {
  items?: EngagementRow[];
};

function formatPeriod(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
}

export default function ManagerEngagementsPage() {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState(30);

  const { data, isLoading, isError } = useQuery<EngagementRow[]>({
    queryKey: ["mgr-engagements", search, range],
    queryFn: async () => {
      const response = await apiFetch<EngagementResponse>(
        `/engagements?page=1&size=200&search=${encodeURIComponent(search)}&range=${range}`,
      );
      return response.items ?? [];
    },
    staleTime: 60_000,
  });

  const rows = data ?? [];

  const columns = useMemo<DataTableColumn<EngagementRow>[]>(
    () => [
      { header: "العنوان", accessorKey: "title" },
      { header: "الإدارة", accessorKey: "department" },
      {
        header: "الحالة",
        accessorKey: "status",
        cell: ({ row }: { row: EngagementRow }) => <StatusBadge value={row.status} />,
      },
      {
        header: "بداية",
        accessorKey: "start_date",
        cell: ({ row }: { row: EngagementRow }) => formatPeriod(row.start_date),
      },
      {
        header: "استحقاق",
        accessorKey: "due_date",
        cell: ({ row }: { row: EngagementRow }) => formatPeriod(row.due_date),
      },
    ],
    [],
  );

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--ao-fg))]">المهام / Engagements</h1>
          <p className="text-sm opacity-70">عرض حالة المهام مع الفلاتر الزمنية والبحث.</p>
        </div>
        <FilterBar onChangeAction={({ range: value }) => setRange(value)} />
      </header>

      <DataTableToolbar
        onSearchAction={setSearch}
        placeholder="ابحث بعنوان المهمة أو الإدارة"
        right={<span className="text-xs opacity-60">النطاق: آخر {range} يومًا</span>}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm opacity-70">
          جارٍ تحميل المهام…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed border-red-400 bg-red-50 p-6 text-sm text-red-700">
          تعذر تحميل البيانات.
        </div>
      ) : (
        <DataTable<EngagementRow> columns={columns} data={rows} pageSize={12} />
      )}
    </section>
  );
}
