"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiFetch from "@/lib/apiFetch";

interface Task {
  id: string;
  title: string;
  start_date: string;
  status: string;
  assigned_at: string;
}

export default function AuditorTasks() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["auditor-all-tasks"],
    queryFn: () => apiFetch<{ items: Task[] }>("/auditor/tasks?archived=false"),
  });

  const acceptMutation = useMutation({
    mutationFn: (taskId: string) =>
      apiFetch(`/auditor/tasks/${taskId}/accept`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditor-all-tasks"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (taskId: string) =>
      apiFetch(`/auditor/tasks/${taskId}/decline`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditor-all-tasks"] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">جميع المهام</h1>
          <div className="space-x-4 space-x-reverse">
            <button
              onClick={() => router.push("/auditor/archive")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
            >
              الأرشيف
            </button>
            <button
              onClick={() => router.push("/auditor")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              لوحة التحكم
            </button>
          </div>
        </div>

        {!tasks?.items || tasks.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">لا توجد مهام</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.items.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {task.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">تاريخ البدء:</span>{" "}
                        {new Date(task.start_date).toLocaleDateString("ar-SA")}
                      </p>
                      <p>
                        <span className="font-medium">الحالة:</span>{" "}
                        <span
                          className={`px-2 py-1 rounded ${
                            task.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status === "active" ? "نشط" : task.status}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">تم التعيين:</span>{" "}
                        {new Date(task.assigned_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mr-4">
                    <button
                      onClick={() => acceptMutation.mutate(task.id)}
                      disabled={acceptMutation.isPending}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => declineMutation.mutate(task.id)}
                      disabled={declineMutation.isPending}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      رفض
                    </button>
                    <button
                      onClick={() => router.push(`/auditor/engagement/${task.id}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      عرض
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
