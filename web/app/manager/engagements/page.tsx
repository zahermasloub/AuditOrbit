"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { apiFetch } from "../../lib/apiFetch";

type Engagement = {
  id: string;
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
};

type User = {
  id: string;
  email: string;
  name: string;
};

type Page<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

type AssignmentResponse = {
  ok: boolean;
  engagement_id: string;
  auditor_id: string;
  created?: boolean;
  removed?: boolean;
};

type AssignInput = {
  engagementId: string;
  auditorId: string;
};

export default function ManagerEngagementsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedEngagement, setSelectedEngagement] = useState<string>("");
  const [auditorId, setAuditorId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const { data: engagements, isLoading, error } = useQuery<Page<Engagement>>({
    queryKey: ["mgr-engagements"],
    queryFn: () => apiFetch<Page<Engagement>>("/engagements?page=1&size=20"),
  });

  const { data: users } = useQuery<Page<User>, Error, User[]>({
    queryKey: ["mgr-users"],
    queryFn: () => apiFetch<Page<User>>("/users?page=1&size=200"),
    select: (page) => page.items,
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const items = engagements?.items ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.title.toLowerCase().includes(term));
  }, [engagements, search]);

  const assignMutation = useMutation<AssignmentResponse, Error, AssignInput>({
    mutationFn: ({ engagementId, auditorId }) => {
      const qs = new URLSearchParams({ auditor_id: auditorId });
      return apiFetch<AssignmentResponse>(`/manager/engagements/${engagementId}/assign?${qs.toString()}`, {
        method: "POST",
      });
    },
    onSuccess: (response) => {
      setMessage(response.created ? "تم تعيين المدقق بنجاح." : "المدقق معين مسبقًا.");
      queryClient.invalidateQueries({ queryKey: ["mgr-engagements"] });
    },
    onError: () => setMessage("تعذر تعيين المدقق."),
  });

  const unassignMutation = useMutation<AssignmentResponse, Error, AssignInput>({
    mutationFn: ({ engagementId, auditorId }) => {
      const qs = new URLSearchParams({ auditor_id: auditorId });
      return apiFetch<AssignmentResponse>(`/manager/engagements/${engagementId}/assign?${qs.toString()}`, {
        method: "DELETE",
      });
    },
    onSuccess: (response) => {
      setMessage(response.removed ? "تم إلغاء التعيين." : "لم يتم العثور على تعيين لحذفه.");
      queryClient.invalidateQueries({ queryKey: ["mgr-engagements"] });
    },
    onError: () => setMessage("تعذر إلغاء التعيين."),
  });

  const onAssign = () => {
    if (!selectedEngagement || !auditorId) return;
    assignMutation.mutate({ engagementId: selectedEngagement, auditorId });
  };

  const onUnassign = () => {
    if (!selectedEngagement || !auditorId) return;
    unassignMutation.mutate({ engagementId: selectedEngagement, auditorId });
  };

  if (isLoading) return <p>جارِ التحميل…</p>;
  if (error) return <p className="text-red-600">تعذر جلب المهام.</p>;

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-xl font-bold">إدارة المهام والتعيينات</h1>
        <p className="text-sm opacity-70">اختر مهمة ثم قم بتعيين أو إلغاء تعيين المدقق المناسب.</p>
        <input
          className="border rounded-xl p-2 w-full sm:max-w-md"
          placeholder="بحث بالعنوان"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </header>

      <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-neutral-900">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">العنوان</th>
              <th className="px-3 py-2">الفترة</th>
              <th className="px-3 py-2">الحالة</th>
              <th className="px-3 py-2">اختيار</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((engagement) => (
              <tr key={engagement.id} className="border-t">
                <td className="px-3 py-2">{engagement.title}</td>
                <td className="px-3 py-2">
                  {(engagement.start_date ?? "—") + " → " + (engagement.end_date ?? "—")}
                </td>
                <td className="px-3 py-2">{engagement.status ?? "—"}</td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="radio"
                    name="selected-engagement"
                    onChange={() => {
                      setSelectedEngagement(engagement.id);
                      setMessage("");
                    }}
                    checked={selectedEngagement === engagement.id}
                    aria-label={`Select ${engagement.title}`}
                  />
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={4}>
                  لا يوجد مهام مطابقة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border rounded-2xl p-4 space-y-3 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold">التعيين / Assignment</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="border rounded-xl p-2 min-w-[240px]"
            value={auditorId}
            onChange={(event) => setAuditorId(event.target.value)}
          >
            <option value="">اختر مدقق</option>
            {(users ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {user.email}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-xl border"
              onClick={onAssign}
              disabled={!selectedEngagement || !auditorId || assignMutation.isPending}
            >
              تعيين
            </button>
            <button
              className="px-3 py-2 rounded-xl border"
              onClick={onUnassign}
              disabled={!selectedEngagement || !auditorId || unassignMutation.isPending}
            >
              إلغاء التعيين
            </button>
          </div>
        </div>
        {!selectedEngagement && <p className="text-xs opacity-60">اختر مهمة من الجدول أولاً.</p>}
        {message && <p className="text-sm text-brand">{message}</p>}
      </div>
    </section>
  );
}
