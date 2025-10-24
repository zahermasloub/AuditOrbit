"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "../../lib/apiFetch";

type Report = {
  id: string;
  engagement_id: string;
  version_no: number;
  kind: string;
  title: string;
  status: string;
  created_at: string;
};

type ReportsPage = {
  items: Report[];
  page: number;
  size: number;
  total: number;
};

export default function ManagerReportsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ReportsPage>({
    queryKey: ["mgr-reports"],
    queryFn: () => apiFetch<ReportsPage>("/reports?page=1&size=50&status=in_review"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/reports/${id}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mgr-reports"] }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/reports/${id}/publish`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mgr-reports"] }),
  });

  if (isLoading) return <p>جارِ التحميل…</p>;
  if (isError) return <p className="text-red-600">تعذر تحميل التقارير.</p>;

  const items = data?.items ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">اعتمادات التقارير</h1>
      <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-neutral-900">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">العنوان</th>
              <th className="px-3 py-2">معرّف المهمة</th>
              <th className="px-3 py-2">الإصدار</th>
              <th className="px-3 py-2">الحالة</th>
              <th className="px-3 py-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((report) => (
              <tr key={report.id} className="border-t">
                <td className="px-3 py-2">{report.title}</td>
                <td className="px-3 py-2">{report.engagement_id}</td>
                <td className="px-3 py-2">{report.version_no} ({report.kind})</td>
                <td className="px-3 py-2">{report.status}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 border rounded-xl"
                      onClick={() => approveMutation.mutate(report.id)}
                      disabled={report.status !== "in_review" || approveMutation.isPending}
                    >
                      اعتماد
                    </button>
                    <button
                      className="px-3 py-1 border rounded-xl"
                      onClick={() => publishMutation.mutate(report.id)}
                      disabled={report.status !== "approved" && report.status !== "published" || publishMutation.isPending}
                    >
                      نشر النسخة النهائية
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={5}>
                  لا توجد تقارير قيد المراجعة حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
