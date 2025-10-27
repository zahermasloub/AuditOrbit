"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { apiFetch } from "../../lib/apiFetch";

type Finding = {
  id: string;
  check_id: string | null;
  title: string;
  severity: string | null;
  status: string | null;
  created_at: string;
  details: unknown;
  evidence_id: string | null;
  scenario_id: string | null;
};

type FindingsResponse = {
  items: Finding[];
};

export default function ManagerFindingsPage() {
  const [engagementId, setEngagementId] = useState("");

  const { data, isFetching, isError } = useQuery<FindingsResponse>({
    queryKey: ["mgr-findings", engagementId],
    queryFn: () => apiFetch<FindingsResponse>(`/manager/findings/by-engagement?engagement_id=${engagementId}`),
    enabled: engagementId.trim().length > 0,
  });

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-xl font-bold">Findings Overview</h1>
        <p className="text-sm opacity-70">أدخل Engagement ID لعرض النتائج المرتبطة به.</p>
        <input
          className="border rounded-xl p-2 w-full sm:max-w-md"
          placeholder="Engagement ID"
          value={engagementId}
          onChange={(event) => setEngagementId(event.target.value)}
        />
      </header>

      {engagementId.trim().length === 0 && <p className="text-sm opacity-60">أدخل معرف المهمة لبدء الاستعلام.</p>}
      {isError && <p className="text-sm text-red-600">تعذر جلب النتائج.</p>}

      {isFetching && <p className="text-sm">جارِ التحميل…</p>}

      {!isFetching && (data?.items?.length ?? 0) === 0 && engagementId.trim().length > 0 && (
        <p className="text-sm opacity-60">لا توجد نتائج.</p>
      )}

      {(data?.items?.length ?? 0) > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-neutral-900">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">العنوان</th>
                <th className="px-3 py-2">الحدة</th>
                <th className="px-3 py-2">الحالة</th>
                <th className="px-3 py-2">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((finding) => (
                <tr key={finding.id} className="border-t">
                  <td className="px-3 py-2">{finding.title}</td>
                  <td className="px-3 py-2">{finding.severity ?? "—"}</td>
                  <td className="px-3 py-2">{finding.status ?? "—"}</td>
                  <td className="px-3 py-2">{finding.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
