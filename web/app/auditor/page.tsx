"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/app/lib/apiFetch";

interface Task {
  id: string;
  title: string;
  start_date: string;
  status: string;
  assigned_at: string;
}

export default function AuditorDashboard() {
  const router = useRouter();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["auditor-tasks"],
    queryFn: () => apiFetch<{ items: Task[] }>("/auditor/tasks?archived=false"),
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
          <h1 className="text-3xl font-bold text-gray-900">مهامي</h1>
          <button
            onClick={() => router.push("/auditor/archive")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
          >
            الأرشيف
          </button>
        </div>

        {!tasks?.items || tasks.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">لا توجد مهام حالياً</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.items.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
                onClick={() => router.push(`/auditor/engagement/${task.id}`)}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {task.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
