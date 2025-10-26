"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import AppShell from "@/app/components/layout/AppShell";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input, Textarea } from "@/app/components/ui/Input";
import { DataTable, type DataTableColumn } from "@/app/components/table/DataTable";
import { DataTableToolbar } from "@/app/components/table/DataTableToolbar";
import { apiFetch } from "@/app/lib/apiFetch";

const SIDEBAR_ITEMS = [
  { href: "/manager/dashboard", label: "لوحة المدير" },
  { href: "/manager/engagements", label: "المهام" },
  { href: "/manager/reports", label: "التقارير" },
];

type WorkingPaper = {
  id: string;
  wp_ref: string;
  objective: string;
  procedure?: string | null;
  prepared_at: string | null;
  reviewed_at: string | null;
};

type CreatePayload = {
  engagement_id: string;
  wp_ref: string;
  objective: string;
  procedure?: string | null;
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return DATE_TIME_FORMATTER.format(parsed);
}

export default function ManagerWorkingPapersPage({ params }: { params: { id: string } }) {
  const engagementId = params.id;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [wpRef, setWpRef] = useState("");
  const [objective, setObjective] = useState("");
  const [procedure, setProcedure] = useState("");

  const { data: workingPapers = [], isLoading } = useQuery<WorkingPaper[]>({
    queryKey: ["manager-working-papers", engagementId],
    queryFn: async () => {
      const response = await apiFetch<{ items?: WorkingPaper[] }>(`/wp?engagement_id=${engagementId}`);
      return response.items ?? [];
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return workingPapers
      .filter((item) => {
        const haystack = `${item.wp_ref} ${item.objective}`.toLowerCase();
        return haystack.includes(searchValue);
      })
      .sort((a, b) => {
        const aTime = a.prepared_at ? new Date(a.prepared_at).getTime() : 0;
        const bTime = b.prepared_at ? new Date(b.prepared_at).getTime() : 0;
        return bTime - aTime;
      });
  }, [workingPapers, search]);

  const createMutation = useMutation({
    mutationFn: (payload: CreatePayload) =>
      apiFetch("/wp", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-working-papers"] });
      setWpRef("");
      setObjective("");
      setProcedure("");
    },
  });

  const columns = useMemo<DataTableColumn<WorkingPaper>[]>(
    () => [
      {
        accessorKey: "wp_ref",
        header: "المعرف / Ref",
        cell: ({ row }) => <span className="font-mono text-xs sm:text-sm">{row.wp_ref}</span>,
      },
      {
        accessorKey: "objective",
        header: "الهدف / Objective",
      },
      {
        accessorKey: "prepared_at",
        header: "إعداد / Prepared",
        cell: ({ row }) => formatDateTime(row.prepared_at),
      },
      {
        accessorKey: "reviewed_at",
        header: "مراجعة / Reviewed",
        cell: ({ row }) => formatDateTime(row.reviewed_at),
      },
      {
        accessorKey: "actions",
        header: "إجراءات",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => console.log("Edit WP:", row.id)}>
              تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => console.log("Delete WP:", row.id)}>
              حذف
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const createDisabled = !wpRef.trim() || !objective.trim() || createMutation.isPending;

  return (
    <AppShell
      sidebarItems={SIDEBAR_ITEMS}
      user={{ name: "Manager", role: "Manager" }}
      breadcrumbs={[
        { label: "المدير", href: "/manager/dashboard" },
        { label: "المهام", href: "/manager/engagements" },
        { label: "أوراق العمل" },
      ]}
    >
      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">أوراق العمل / Working Papers</h1>
            <p className="text-sm text-[rgb(var(--ao-muted))]">إدارة أوراق العمل المرتبطة بالمهمة {engagementId}.</p>
          </div>
          <DataTableToolbar
            placeholder="ابحث عن ورقة عمل..."
            onSearchAction={setSearch}
            right={
              <Button
                type="button"
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["manager-working-papers"] })}
              >
                تحديث
              </Button>
            }
          />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">إنشاء ورقة عمل جديدة</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">WP Ref</label>
              <Input value={wpRef} onChange={(event) => setWpRef(event.target.value)} placeholder="مثل WP-01" />
            </div>
            <div>
              <label className="block text-sm font-medium">Objective</label>
              <Input value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="وصف الهدف" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium">Procedure</label>
              <Textarea
                rows={3}
                value={procedure}
                onChange={(event) => setProcedure(event.target.value)}
                placeholder="وصف الإجراءات المتبعة"
              />
            </div>
            {createMutation.error instanceof Error ? (
              <p className="sm:col-span-3 text-sm text-danger">{createMutation.error.message}</p>
            ) : null}
            {createMutation.isSuccess ? (
              <p className="sm:col-span-3 text-sm text-success">تم إنشاء ورقة العمل بنجاح.</p>
            ) : null}
            <div className="sm:col-span-3 flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  createMutation.mutate({
                    engagement_id: engagementId,
                    wp_ref: wpRef.trim(),
                    objective: objective.trim(),
                    procedure: procedure.trim() || undefined,
                  })
                }
                disabled={createDisabled}
              >
                {createMutation.isPending ? "جارٍ الحفظ..." : "إنشاء"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setWpRef("");
                  setObjective("");
                  setProcedure("");
                }}
                disabled={createMutation.isPending}
              >
                مسح الحقول
              </Button>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="text-center text-sm text-[rgb(var(--ao-muted))]">يتم تحميل أوراق العمل...</Card>
        ) : (
          <Card className="p-4">
            <DataTable columns={columns} data={filtered} pageSize={8} />
          </Card>
        )}
      </div>
    </AppShell>
  );
}
