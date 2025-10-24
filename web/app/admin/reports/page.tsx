"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { apiFetch } from "../../lib/apiFetch";

type Report = {
  id: string;
  engagement_id: string;
  version_no: number;
  kind: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ReportsResponse = {
  items: Report[];
  page: number;
  size: number;
  total: number;
};

const STATUS_OPTIONS = ["draft", "in_review", "approved", "published", "rejected"] as const;

type StatusFilter = "" | (typeof STATUS_OPTIONS)[number];

export default function ReportsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [engagementId, setEngagementId] = useState<string>("");
  const [title, setTitle] = useState<string>("Draft Report");
  const [content, setContent] = useState<string>(
    '{"sections":[{"title":"Executive Summary","text":""}]}'
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const queryKey = useMemo(() => ["reports", engagementId, statusFilter], [engagementId, statusFilter]);

  const { data, isLoading } = useQuery<ReportsResponse>({
    queryKey,
    queryFn: async () => {
      const qs = new URLSearchParams({ page: "1", size: "20" });
      if (engagementId) {
        qs.set("engagement_id", engagementId);
      }
      if (statusFilter) {
        qs.set("status", statusFilter);
      }
      return apiFetch(`/reports?${qs.toString()}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!engagementId) {
        throw new Error("Engagement ID is required");
      }
      try {
        const parsed = JSON.parse(content);
        const body = {
          engagement_id: engagementId,
          title,
          content: parsed,
        };
        return await apiFetch("/reports", {
          method: "POST",
          body: JSON.stringify(body),
        });
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error("Content must be valid JSON");
        }
        throw error;
      }
    },
    onSuccess: () => {
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create report");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (reportId: string) => apiFetch(`/reports/${reportId}/submit`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  });

  const approveMutation = useMutation({
    mutationFn: async (reportId: string) => apiFetch(`/reports/${reportId}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  });

  const publishMutation = useMutation({
    mutationFn: async (reportId: string) => apiFetch(`/reports/${reportId}/publish`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  });

  const reports: Report[] = data?.items ?? [];

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">التقارير / Reports</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h2 className="font-semibold">إنشاء مسودة / Create Draft</h2>
          {errorMessage && <div className="rounded-xl bg-red-100 p-2 text-sm text-red-700 dark:bg-red-900/30">{errorMessage}</div>}
          <input
            className="w-full rounded-xl border p-2"
            placeholder="Engagement ID"
            value={engagementId}
            onChange={(event) => setEngagementId(event.target.value)}
          />
          <input
            className="w-full rounded-xl border p-2"
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <textarea
            className="w-full rounded-xl border p-2 font-mono text-xs"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
          />
          <button
            className="rounded-xl border px-3 py-2"
            onClick={() => createMutation.mutate()}
            disabled={!engagementId || createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Create Draft"}
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h2 className="font-semibold">فلترة / Filter</h2>
          <select
            className="rounded-xl border p-2"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
          <div className="text-sm opacity-70">Total: {data?.total ?? 0}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-neutral-900">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2">Engagement</th>
              <th className="px-3 py-2">Version</th>
              <th className="px-3 py-2">Kind</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-3 py-4 text-center" colSpan={6}>
                  جارٍ التحميل...
                </td>
              </tr>
            )}
            {!isLoading && reports.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={6}>
                  لا يوجد بيانات
                </td>
              </tr>
            )}
            {reports.map((report) => (
              <tr key={report.id} className="border-t">
                <td className="px-3 py-2">{report.title}</td>
                <td className="px-3 py-2">{report.engagement_id}</td>
                <td className="px-3 py-2">{report.version_no}</td>
                <td className="px-3 py-2">{report.kind}</td>
                <td className="px-3 py-2">{report.status}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-lg border px-2 py-1"
                      onClick={() => submitMutation.mutate(report.id)}
                      disabled={!(report.status === "draft" || report.status === "rejected")}
                    >
                      Submit
                    </button>
                    <button
                      className="rounded-lg border px-2 py-1"
                      onClick={() => approveMutation.mutate(report.id)}
                      disabled={report.status !== "in_review"}
                    >
                      Approve
                    </button>
                    <button
                      className="rounded-lg border px-2 py-1"
                      onClick={() => publishMutation.mutate(report.id)}
                      disabled={!(report.status === "approved" || report.status === "published")}
                    >
                      Publish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
