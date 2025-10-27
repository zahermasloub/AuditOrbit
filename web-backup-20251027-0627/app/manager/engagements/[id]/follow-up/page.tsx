"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import AppShell from "@/app/components/layout/AppShell";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input, Textarea } from "@/app/components/ui/Input";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { DataTable, type DataTableColumn } from "@/app/components/table/DataTable";
import { DataTableToolbar } from "@/app/components/table/DataTableToolbar";
import { apiFetch } from "@/app/lib/apiFetch";

type FollowUp = {
  id: string;
  finding_id: string;
  status: string;
  next_review_at: string | null;
  notes: string | null;
  created_at: string;
};

type CreatePayload = {
  finding_id: string;
  notes?: string;
  next_review_at?: string;
};

type UpdatePayload = {
  id: string;
  status: string;
};

type TestPayload = {
  follow_up_id: string;
  approach: string;
  result: string;
  evidence_notes?: string;
};

const SIDEBAR_ITEMS = [
  { href: "/manager/dashboard", label: "لوحة المدير" },
  { href: "/manager/engagements", label: "المهام" },
  { href: "/manager/reports", label: "التقارير" },
];

const STATUS_OPTIONS: Array<{ value: string | null; label: string }> = [
  { value: null, label: "الكل" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "implemented", label: "Implemented" },
  { value: "closed", label: "Closed" },
];

const STATUS_LABELS: Record<string, string> = {
  open: "Open / مفتوح",
  in_progress: "In Progress / جارٍ",
  implemented: "Implemented / منفذ",
  closed: "Closed / مغلق",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" });

const createSchema = z.object({
  finding_id: z.string().uuid({ message: "معرّف finding يجب أن يكون UUID" }),
  notes: z.string().max(2000).optional(),
  next_review_at: z.union([
    z.literal(""),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ YYYY-MM-DD"),
  ]),
});

const testSchema = z.object({
  follow_up_id: z.string().uuid({ message: "المعرف غير صالح" }),
  approach: z.string().min(2, "أدخل منهجية الاختبار"),
  result: z.string().min(2, "أدخل نتيجة الاختبار"),
  evidence_notes: z.string().max(2000).optional(),
});

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_FORMATTER.format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_TIME_FORMATTER.format(date);
}

export default function EngagementFollowUpPage({ params }: { params: { id: string } }) {
  const engagementId = params.id;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const followUpsQuery = useQuery({
    queryKey: ["followups", engagementId, statusFilter],
    queryFn: async () => {
      const suffix = statusFilter ? `?status=${statusFilter}` : "";
      const response = await apiFetch<{ items?: FollowUp[] }>(`/followups${suffix}`);
      return response.items ?? [];
    },
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreatePayload) => {
      await apiFetch<{ id: string }>("/followups", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: UpdatePayload) =>
      apiFetch(`/followups/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: payload.status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: (payload: TestPayload) =>
      apiFetch("/followups/tests", {
        method: "POST",
        body: JSON.stringify({
          follow_up_id: payload.follow_up_id,
          approach: payload.approach,
          result: payload.result,
          evidence: payload.evidence_notes ? { notes: payload.evidence_notes } : undefined,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
    },
  });

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { finding_id: "", notes: "", next_review_at: "" },
  });

  const testForm = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: { follow_up_id: "", approach: "", result: "", evidence_notes: "" },
  });

  const filteredItems = useMemo(() => {
    const lowerQuery = search.trim().toLowerCase();
    const fromDateValue = dateFrom ? new Date(dateFrom) : null;
    const toDateValue = dateTo ? new Date(dateTo) : null;
    const toDateInclusive = toDateValue ? new Date(toDateValue.getTime() + 86_399_000) : null;

    const list = followUpsQuery.data ?? [];

    return list
      .filter((item) => {
        const haystack = `${item.finding_id} ${item.notes ?? ""}`.toLowerCase();
        const matchesSearch = !lowerQuery || haystack.includes(lowerQuery);

        const createdAt = new Date(item.created_at);
        const validCreated = !Number.isNaN(createdAt.getTime());
        const matchesFrom = !fromDateValue || !validCreated || createdAt >= fromDateValue;
        const matchesTo = !toDateInclusive || !validCreated || createdAt <= toDateInclusive;

        return matchesSearch && matchesFrom && matchesTo;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [followUpsQuery.data, search, dateFrom, dateTo]);

  const columns: DataTableColumn<FollowUp>[] = [
    {
      accessorKey: "finding_id",
      header: "Finding",
      cell: ({ row }) => <span className="font-mono text-xs sm:text-sm">{row.finding_id}</span>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <StatusBadge value={STATUS_LABELS[row.status] ?? row.status} />,
    },
    {
      accessorKey: "next_review_at",
      header: "الزيارة القادمة",
      cell: ({ row }) => formatDate(row.next_review_at),
    },
    {
      accessorKey: "created_at",
      header: "تاريخ الإنشاء",
      cell: ({ row }) => formatDateTime(row.created_at),
    },
    {
      accessorKey: "notes",
      header: "ملاحظات",
      cell: ({ row }) => row.notes ?? "—",
    },
    {
      accessorKey: "actions",
      header: "إجراءات",
      sortable: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: "in_progress" })}
            disabled={updateStatusMutation.isPending}
          >
            قيد التنفيذ
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: "implemented" })}
            disabled={updateStatusMutation.isPending}
          >
            تم التنفيذ
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: "closed" })}
            disabled={updateStatusMutation.isPending}
          >
            إغلاق
          </Button>
        </div>
      ),
    },
  ];

  const createErrorMessage = createMutation.error instanceof Error ? createMutation.error.message : null;
  const testErrorMessage = testMutation.error instanceof Error ? testMutation.error.message : null;

  return (
    <AppShell
      sidebarItems={SIDEBAR_ITEMS}
      user={{ name: "Manager", role: "Manager" }}
      breadcrumbs={[
        { label: "المدير", href: "/manager/dashboard" },
        { label: "المهام", href: "/manager/engagements" },
        { label: "متابعة التوصيات" },
      ]}
    >
      <div className="space-y-6">
        <Card className="space-y-4">
          <DataTableToolbar
            placeholder="ابحث عن متابعة أو ملاحظة"
            onSearchAction={setSearch}
            onCreateAction={() => {
              const element = document.getElementById("create-followup");
              element?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            right={
              <Button type="button" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["followups"] })}>
                تحديث
              </Button>
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isActive = statusFilter === option.value;
                return (
                  <Button
                    key={option.label}
                    type="button"
                    size="sm"
                    variant={isActive ? "primary" : "outline"}
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                aria-label="تاريخ البدء"
                className="w-auto min-w-[160px]"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                aria-label="تاريخ النهاية"
                className="w-auto min-w-[160px]"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setStatusFilter(null);
                  setDateFrom("");
                  setDateTo("");
                  setSearch("");
                }}
              >
                إعادة تعيين الفلاتر
              </Button>
            </div>
          </div>
        </Card>

        {followUpsQuery.isLoading ? (
          <Card className="text-center text-sm text-[rgb(var(--ao-muted))]">
            يتم تحميل المتابعات...
          </Card>
        ) : (
          <Card className="p-4">
            <DataTable columns={columns} data={filteredItems} pageSize={8} />
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div id="create-followup">
            <Card className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">إنشاء متابعة جديدة</h3>
                <p className="text-sm text-[rgb(var(--ao-muted))]">اربط المتابعة بـ Finding وحدد موعد المراجعة القادم.</p>
              </div>
              <form
                onSubmit={createForm.handleSubmit(async (values) => {
                  const payload: CreatePayload = {
                    finding_id: values.finding_id.trim(),
                    notes: values.notes?.toString().trim() || undefined,
                    next_review_at: values.next_review_at || undefined,
                  };
                  try {
                    await createMutation.mutateAsync(payload);
                    createForm.reset();
                  } catch {
                    // mutation error already surfaced via createMutation.error
                  }
                })}
                className="grid gap-3"
              >
                <div>
                  <label className="block text-sm font-medium">Finding ID</label>
                  <Input placeholder="UUID" {...createForm.register("finding_id")} aria-invalid={Boolean(createForm.formState.errors.finding_id)} />
                  {createForm.formState.errors.finding_id ? (
                    <p className="mt-1 text-xs text-danger">{createForm.formState.errors.finding_id.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium">Next Review (YYYY-MM-DD)</label>
                  <Input type="date" {...createForm.register("next_review_at")} aria-invalid={Boolean(createForm.formState.errors.next_review_at)} />
                  {createForm.formState.errors.next_review_at ? (
                    <p className="mt-1 text-xs text-danger">{createForm.formState.errors.next_review_at.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <Textarea rows={4} {...createForm.register("notes")} />
                </div>
                {createErrorMessage ? <p className="text-sm text-danger">{createErrorMessage}</p> : null}
                {createMutation.isSuccess ? <p className="text-sm text-success">تم حفظ المتابعة بنجاح.</p> : null}
                <div className="flex gap-3">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "جارٍ الحفظ..." : "إنشاء متابعة"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => createForm.reset()}
                    disabled={createMutation.isPending}
                  >
                    مسح الحقول
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">تسجيل اختبار متابعة</h3>
              <p className="text-sm text-[rgb(var(--ao-muted))]">وثّق اختبار المتابعة وربط الأدلة الداعمة.</p>
            </div>
            <form
              onSubmit={testForm.handleSubmit(async (values) => {
                const payload: TestPayload = {
                  follow_up_id: values.follow_up_id.trim(),
                  approach: values.approach.trim(),
                  result: values.result.trim(),
                  evidence_notes: values.evidence_notes?.toString().trim() || undefined,
                };
                try {
                  await testMutation.mutateAsync(payload);
                  testForm.reset();
                } catch {
                  // handled by testMutation.error state
                }
              })}
              className="grid gap-3"
            >
              <div>
                <label className="block text-sm font-medium">Follow-up ID</label>
                <Input placeholder="UUID" {...testForm.register("follow_up_id")} aria-invalid={Boolean(testForm.formState.errors.follow_up_id)} />
                {testForm.formState.errors.follow_up_id ? (
                  <p className="mt-1 text-xs text-danger">{testForm.formState.errors.follow_up_id.message}</p>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium">Approach</label>
                <Textarea rows={3} {...testForm.register("approach")} />
                {testForm.formState.errors.approach ? (
                  <p className="mt-1 text-xs text-danger">{testForm.formState.errors.approach.message}</p>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium">Result</label>
                <Textarea rows={3} {...testForm.register("result")} />
                {testForm.formState.errors.result ? (
                  <p className="mt-1 text-xs text-danger">{testForm.formState.errors.result.message}</p>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium">Evidence Notes (اختياري)</label>
                <Textarea rows={3} {...testForm.register("evidence_notes")} />
              </div>
              {testErrorMessage ? <p className="text-sm text-danger">{testErrorMessage}</p> : null}
              {testMutation.isSuccess ? <p className="text-sm text-success">تم تسجيل اختبار المتابعة.</p> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={testMutation.isPending}>
                  {testMutation.isPending ? "جارٍ الحفظ..." : "حفظ الاختبار"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testForm.reset()}
                  disabled={testMutation.isPending}
                >
                  مسح الحقول
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
