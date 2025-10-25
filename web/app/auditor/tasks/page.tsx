"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/apiFetch";

type Task = {
  id: string;
  engagement_id: string;
  title: string;
  status: string;
  assigned_at?: string | null;
  due_date?: string | null;
  start_date?: string | null;
};

type TasksResponse = {
  items?: Task[];
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

export default function AuditorTasksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Task[]>({
    queryKey: ["auditor-tasks"],
    queryFn: async () => {
      const response = await apiFetch<TasksResponse>("/auditor/tasks?page=1&size=100");
      return response.items ?? [];
    },
  });

  const tasks = data ?? [];

  const acceptTask = useMutation({
    mutationFn: (taskId: string) => apiFetch(`/auditor/tasks/${taskId}/accept`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auditor-tasks"] }),
  });

  const declineTask = useMutation({
    mutationFn: (taskId: string) => apiFetch(`/auditor/tasks/${taskId}/decline`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auditor-tasks"] }),
  });

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--ao-fg))]">مهامي / My Tasks</h1>
          <p className="text-sm opacity-70">اطّلع على المهام الحالية واتخذ إجراءً سريعًا.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={() => router.push("/auditor")}>لوحة التحكم</Button>
          <Button variant="outline" type="button" onClick={() => router.push("/auditor/archive")}>الأرشيف</Button>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm opacity-70">
          جارٍ تحميل المهام…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed border-red-400 bg-red-50 p-6 text-sm text-red-700">
          تعذر تحميل البيانات.
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm opacity-70">
          لا توجد مهام حالية.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[rgb(var(--ao-fg))]">{task.title}</h3>
                  <div className="text-xs opacity-70">معرف المهمة: {task.engagement_id.slice(0, 8)}…</div>
                </div>
                <StatusBadge value={task.status} />
              </div>
              <dl className="grid gap-2 text-xs opacity-70">
                <div className="flex items-center justify-between">
                  <dt>بدء</dt>
                  <dd>{formatDate(task.start_date)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>تعيين</dt>
                  <dd>{formatDate(task.assigned_at)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>استحقاق</dt>
                  <dd>{formatDate(task.due_date)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="success"
                  type="button"
                  disabled={acceptTask.isPending}
                  onClick={() => acceptTask.mutate(task.id)}
                >
                  {acceptTask.isPending ? "..." : "قبول"}
                </Button>
                <Button
                  variant="danger"
                  type="button"
                  disabled={declineTask.isPending}
                  onClick={() => declineTask.mutate(task.id)}
                >
                  {declineTask.isPending ? "..." : "رفض"}
                </Button>
                <Button variant="outline" type="button" asChild>
                  <Link href={`/auditor/engagement/${task.engagement_id}`}>التفاصيل</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
