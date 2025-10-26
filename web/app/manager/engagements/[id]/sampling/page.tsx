"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import AppShell from "@/app/components/layout/AppShell";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import SamplingLegend from "@/app/components/legends/SamplingLegend";
import { managerLinks } from "@/app/manager/_nav/links";
import { DataTable, type DataTableColumn } from "@/app/components/table/DataTable";
import { DataTableToolbar } from "@/app/components/table/DataTableToolbar";
import { apiFetch } from "@/app/lib/apiFetch";
import ModalEditSample from "./_modals/ModalEditSample";

type Sample = {
  id: string;
  method: string;
  size: number;
  created_at: string;
};

type CreatePayload = {
  engagement_id: string;
  method: string;
  size: number;
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

const METHOD_LABELS: Record<string, string> = {
  random: "Random / عشوائي",
  systematic: "Systematic / منهجي",
  high_value: "High Value / قيمة عالية",
};

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return DATE_TIME_FORMATTER.format(parsed);
}

export default function ManagerSamplingPage({ params }: { params: { id: string } }) {
  const engagementId = params.id;
  const queryClient = useQueryClient();
  const sidebarItems = managerLinks(engagementId);

  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("random");
  const [size, setSize] = useState("10");
  const [editingSample, setEditingSample] = useState<Sample | null>(null);

  const { data: samples = [], isLoading } = useQuery<Sample[]>({
    queryKey: ["manager-samples", engagementId],
    queryFn: async () => {
      const response = await apiFetch<{ items?: Sample[] }>(`/samples?engagement_id=${engagementId}`);
      return response.items ?? [];
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return samples
      .filter((item) => `${item.method} ${item.size}`.toLowerCase().includes(searchValue))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [samples, search]);

  const createMutation = useMutation({
    mutationFn: (payload: CreatePayload) =>
      apiFetch("/samples", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-samples"] });
      setMethod("random");
      setSize("10");
    },
  });

  const columns = useMemo<DataTableColumn<Sample>[]>(
    () => [
      {
        accessorKey: "method",
        header: "المنهجية / Method",
        cell: ({ row }) => {
          const label = METHOD_LABELS[row.method] ?? row.method;
          return <StatusBadge value={label} />;
        },
      },
      {
        accessorKey: "size",
        header: "الحجم",
        cell: ({ row }) => row.size.toLocaleString("ar-SA"),
      },
      {
        accessorKey: "created_at",
        header: "تاريخ الإنشاء",
        cell: ({ row }) => formatDateTime(row.created_at),
      },
      {
        accessorKey: "actions",
        header: "إجراءات",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingSample(row)}>
              تعديل
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const parsedSize = Number(size);
  const createDisabled = !method.trim() || Number.isNaN(parsedSize) || parsedSize <= 0 || createMutation.isPending;

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{ name: "Manager", role: "Manager" }}
      breadcrumbs={[
        { label: "المدير", href: "/manager/dashboard" },
        { label: "المهام", href: "/manager/engagements" },
        { label: "العينات" },
      ]}
    >
      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">العينات / Sampling</h1>
            <p className="text-sm text-[rgb(var(--ao-muted))]">إدارة العينات والطرق المستخدمة للمهمة {engagementId}.</p>
          </div>
          <DataTableToolbar
            placeholder="ابحث في طرق العينات..."
            onSearchAction={setSearch}
            right={
              <Button
                type="button"
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["manager-samples"] })}
              >
                تحديث
              </Button>
            }
          />
          <div className="px-1">
            <SamplingLegend />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">إضافة عينة جديدة</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Method</label>
              <Input
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                placeholder="random | systematic | high_value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Size</label>
              <Input
                value={size}
                onChange={(event) => setSize(event.target.value)}
                placeholder="10"
                inputMode="numeric"
              />
            </div>
            {createMutation.error instanceof Error ? (
              <p className="sm:col-span-3 text-sm text-danger">{createMutation.error.message}</p>
            ) : null}
            {createMutation.isSuccess ? (
              <p className="sm:col-span-3 text-sm text-success">تم إنشاء العينة بنجاح.</p>
            ) : null}
            <div className="sm:col-span-3 flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  createMutation.mutate({
                    engagement_id: engagementId,
                    method: method.trim(),
                    size: parsedSize,
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
                  setMethod("random");
                  setSize("10");
                }}
                disabled={createMutation.isPending}
              >
                مسح الحقول
              </Button>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="text-center text-sm text-[rgb(var(--ao-muted))]">يتم تحميل بيانات العينات...</Card>
        ) : (
          <Card className="p-4">
            <DataTable columns={columns} data={filtered} pageSize={8} />
          </Card>
        )}
      </div>
      {editingSample && (
        <ModalEditSample
          open={true}
          onCloseAction={() => setEditingSample(null)}
          defaults={{
            id: editingSample.id,
            method: editingSample.method as "random" | "systematic" | "high_value",
            size: editingSample.size,
          }}
          engagementId={engagementId}
        />
      )}
    </AppShell>
  );
}
