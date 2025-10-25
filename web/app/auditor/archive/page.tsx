"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiFetch from "@/lib/apiFetch";

interface Task {
  id: string;
  title: string;
  start_date: string;
  status: string;
  assigned_at: string;
}

export default function AuditorArchive() {
  const router = useRouter();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["auditor-archived-tasks"],
    queryFn: () => apiFetch<{ items: Task[] }>("/auditor/tasks?archived=true"),
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
          <h1 className="text-3xl font-bold text-gray-900">الأرشيف</h1>
          <button
            onClick={() => router.push("/auditor")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            العودة للوحة التحكم
          </button>
        </div>

        {!tasks?.items || tasks.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">لا توجد مهام مؤرشفة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.items.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow p-6 opacity-75"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {task.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">تاريخ البدء:</span>{" "}
                        {new Date(task.start_date).toLocaleDateString("ar-SA")}
                      </p>
                      <p>
                        <span className="font-medium">الحالة:</span>{" "}
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                          مؤرشف
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">تم التعيين:</span>{" "}
                        {new Date(task.assigned_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/auditor/engagement/${task.id}`)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium mr-4"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
