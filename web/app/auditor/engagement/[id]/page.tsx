"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/app/lib/apiFetch";

interface Checklist {
  id: string;
  name: string;
  dispatched_at: string;
}

interface ChecklistItem {
  id: string;
  description: string;
  status: string;
  note: string | null;
  updated_at: string;
}

export default function AuditorEngagementPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const engagementId = params.id as string;

  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemStatus, setItemStatus] = useState<string>("");
  const [itemNote, setItemNote] = useState<string>("");

  const { data: checklists, isLoading: loadingChecklists } = useQuery({
    queryKey: ["auditor-checklists", engagementId],
    queryFn: () =>
      apiFetch<{ items: Checklist[] }>(
        `/auditor/engagements/${engagementId}/checklists`
      ),
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ["auditor-checklist-items", engagementId, selectedChecklist],
    queryFn: () =>
      apiFetch<{ items: ChecklistItem[] }>(
        `/auditor/engagements/${engagementId}/checklists/${selectedChecklist}/items`
      ),
    enabled: !!selectedChecklist,
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      itemId,
      status,
      note,
    }: {
      itemId: string;
      status: string;
      note: string;
    }) =>
      apiFetch(`/auditor/checklist-items/${itemId}?status=${status}&note=${encodeURIComponent(note)}`, {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auditor-checklist-items", engagementId, selectedChecklist],
      });
      setEditingItem(null);
      setItemStatus("");
      setItemNote("");
    },
  });

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item.id);
    setItemStatus(item.status);
    setItemNote(item.note || "");
  };

  const handleSave = () => {
    if (editingItem) {
      updateItemMutation.mutate({
        itemId: editingItem,
        status: itemStatus,
        note: itemNote,
      });
    }
  };

  if (loadingChecklists) {
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
          <h1 className="text-3xl font-bold text-gray-900">تفاصيل المهمة</h1>
          <button
            onClick={() => router.push("/auditor")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
          >
            العودة
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Checklists Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                قوائم المراجعة
              </h2>
              <div className="space-y-2">
                {checklists?.items?.map((checklist) => (
                  <button
                    key={checklist.id}
                    onClick={() => setSelectedChecklist(checklist.id)}
                    className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                      selectedChecklist === checklist.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    <div className="font-medium">{checklist.name}</div>
                    <div className="text-xs mt-1 opacity-75">
                      {new Date(checklist.dispatched_at).toLocaleDateString(
                        "ar-SA"
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="col-span-9">
            {!selectedChecklist ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">اختر قائمة مراجعة لعرض العناصر</p>
              </div>
            ) : loadingItems ? (
              <div className="bg-white rounded-lg shadow p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    عناصر القائمة
                  </h2>
                </div>
                <div className="divide-y">
                  {items?.items?.map((item) => (
                    <div key={item.id} className="p-6">
                      {editingItem === item.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              الوصف
                            </label>
                            <p className="text-gray-900">{item.description}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              الحالة
                            </label>
                            <select
                              value={itemStatus}
                              onChange={(e) => setItemStatus(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="in_progress">قيد التنفيذ</option>
                              <option value="completed">مكتمل</option>
                              <option value="not_applicable">غير قابل للتطبيق</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ملاحظات
                            </label>
                            <textarea
                              value={itemNote}
                              onChange={(e) => setItemNote(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="أضف ملاحظات..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              disabled={updateItemMutation.isPending}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(null);
                                setItemStatus("");
                                setItemNote("");
                              }}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-gray-900 mb-2">
                              {item.description}
                            </p>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span
                                className={`px-2 py-1 rounded ${
                                  item.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.status === "completed"
                                  ? "مكتمل"
                                  : item.status === "in_progress"
                                  ? "قيد التنفيذ"
                                  : item.status === "not_applicable"
                                  ? "غير قابل للتطبيق"
                                  : "قيد الانتظار"}
                              </span>
                              {item.note && (
                                <span className="text-gray-600">
                                  ملاحظة: {item.note}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium mr-4"
                          >
                            تعديل
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
