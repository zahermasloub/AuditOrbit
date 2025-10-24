"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiFetch } from "../../lib/apiFetch";

type Checklist = {
  id: string;
  name: string;
  department?: string | null;
  version: number;
};

type ChecklistItem = {
  id?: string;
  order_no: number;
  title: string;
  control_ref?: string | null;
  risk?: string | null;
};

type ChecklistDetail = Checklist & { items: ChecklistItem[] };

type EngagementChecklist = {
  id: string;
  engagement_id: string;
  name: string;
};

const CreateSchema = z.object({
  name: z.string().min(3),
  department: z.string().optional(),
});

const ItemSchema = z.object({
  order_no: z.number().int().min(1),
  title: z.string().min(3),
  control_ref: z.string().optional(),
  risk: z.string().optional(),
});

export default function ChecklistsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState("");

  const { data: checklists, isLoading: isListLoading } = useQuery<Checklist[]>({
    queryKey: ["checklists"],
    queryFn: () => apiFetch<Checklist[]>("/checklists"),
  });

  const {
    data: detail,
    refetch: refetchDetail,
    isFetching: isDetailLoading,
  } = useQuery<ChecklistDetail>({
    queryKey: ["checklists", selectedId],
    queryFn: () => apiFetch<ChecklistDetail>(`/checklists/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isCreating },
  } = useForm<z.infer<typeof CreateSchema>>({ resolver: zodResolver(CreateSchema) });

  const onCreate = async (values: z.infer<typeof CreateSchema>) => {
    const created = await apiFetch<Checklist>("/checklists", {
      method: "POST",
      body: JSON.stringify(values),
    });
    reset();
    await queryClient.invalidateQueries({ queryKey: ["checklists"] });
    setSelectedId(created.id);
  };

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    reset: resetItem,
    formState: { isSubmitting: isAddingItem },
  } = useForm<z.infer<typeof ItemSchema>>({ resolver: zodResolver(ItemSchema) });

  const onAddItem = async (values: z.infer<typeof ItemSchema>) => {
    if (!selectedId) return;
    await apiFetch(`/checklists/${selectedId}/items`, {
      method: "POST",
      body: JSON.stringify(values),
    });
    resetItem();
    await refetchDetail();
  };

  const onDispatch = async () => {
    if (!selectedId || !engagementId) return;
    const result = await apiFetch<EngagementChecklist>("/checklists/dispatch", {
      method: "POST",
      body: JSON.stringify({ engagement_id: engagementId, checklist_id: selectedId }),
    });
    alert(`Dispatched checklist to engagement ${result.engagement_id}`);
  };

  if (isListLoading) {
    return <p>جارِ التحميل…</p>;
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">منشئ القوائم / Checklist Builder</h1>

      <div className="space-y-3 rounded-2xl border bg-white p-4 dark:bg-neutral-900">
        <h2 className="font-semibold">إنشاء قالب / Create Template</h2>
        <form onSubmit={handleSubmit(onCreate)} className="flex flex-wrap items-start gap-2">
          <input className="rounded-xl border p-2" placeholder="الاسم / Name" {...register("name")} />
          <input
            className="rounded-xl border p-2"
            placeholder="القسم / Department"
            {...register("department")}
          />
          <button
            className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
            disabled={isCreating}
            type="submit"
          >
            {isCreating ? "…" : "إنشاء"}
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h2 className="mb-2 font-semibold">القوالب / Templates</h2>
          <ul className="space-y-1">
            {checklists?.map((checklist) => {
              const isSelected = checklist.id === selectedId;
              return (
                <li key={checklist.id}>
                  <button
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      isSelected ? "bg-neutral-100 dark:bg-neutral-800" : ""
                    }`}
                    onClick={() => setSelectedId(checklist.id)}
                  >
                    {checklist.name} — v{checklist.version}
                    {checklist.department ? ` (${checklist.department})` : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-3 rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h2 className="font-semibold">بنود القالب / Items</h2>
          {!selectedId && <p className="opacity-70">اختر قالبًا من القائمة.</p>}
          {selectedId && (
            <>
              <form
                onSubmit={handleSubmitItem(onAddItem)}
                className="flex flex-wrap items-start gap-2"
              >
                <input
                  className="w-24 rounded-xl border p-2"
                  type="number"
                  placeholder="ترتيب"
                  {...registerItem("order_no", { valueAsNumber: true })}
                />
                <input
                  className="flex-1 rounded-xl border p-2"
                  placeholder="العنوان / Title"
                  {...registerItem("title")}
                />
                <input
                  className="rounded-xl border p-2"
                  placeholder="Control Ref"
                  {...registerItem("control_ref")}
                />
                <select className="rounded-xl border p-2" {...registerItem("risk")}>
                  <option value="">Risk</option>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
                <button
                  className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
                  disabled={isAddingItem}
                >
                  {isAddingItem ? "…" : "إضافة"}
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="font-semibold">المحتوى الحالي</h3>
                {isDetailLoading && <p className="text-sm opacity-70">جارِ تحديث البنود…</p>}
                {!isDetailLoading && detail && detail.items.length === 0 && (
                  <p className="text-sm opacity-70">لم يتم إضافة بنود حتى الآن.</p>
                )}
                {!isDetailLoading && detail && detail.items.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {detail.items.map((item) => (
                      <li key={`${item.order_no}-${item.title}`} className="rounded-xl border px-3 py-2">
                        <div className="font-medium">{item.order_no}. {item.title}</div>
                        <div className="text-xs opacity-70">
                          {item.control_ref ? `Ref: ${item.control_ref} • ` : ""}
                          {item.risk ? `Risk: ${item.risk}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-2 border-t pt-3">
                <input
                  className="flex-1 rounded-xl border p-2"
                  placeholder="Engagement ID"
                  value={engagementId}
                  onChange={(event) => setEngagementId(event.target.value)}
                />
                <button className="rounded-xl border px-3 py-2" onClick={onDispatch}>
                  إرسال / Dispatch
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
