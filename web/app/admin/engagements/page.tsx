"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import DataTable from "../../components/table/DataTable";
import { apiFetch } from "../../lib/apiFetch";

type Engagement = {
  id: string;
  annual_plan_id: string;
  title: string;
  scope?: string | null;
  risk_rating?: string | null;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
};

type Page<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

const Schema = z.object({
  annual_plan_year: z
    .number()
    .int()
    .min(2000)
    .max(2100),
  title: z.string().min(3),
  scope: z.string().optional(),
  risk_rating: z.enum(["low", "medium", "high"]).optional(),
});

type FormData = z.infer<typeof Schema>;

export default function EngagementsPage() {
  const [page, setPage] = useState(1);
  const size = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Page<Engagement>>({
    queryKey: ["engagements", page, size],
    queryFn: () => apiFetch<Page<Engagement>>(`/engagements?page=${page}&size=${size}`),
    placeholderData: (previous) => previous,
  });

  const columns: ColumnDef<Engagement>[] = [
    { header: "العنوان / Title", accessorKey: "title" },
    { header: "الحالة / Status", accessorKey: "status" },
    { header: "المخاطر / Risk", accessorKey: "risk_rating" },
    { header: "تاريخ الإنشاء / Created", accessorKey: "created_at" },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(Schema) });

  const onCreate = async (values: FormData) => {
    await apiFetch<Engagement>("/engagements", { method: "POST", body: JSON.stringify(values) });
    reset();
    await queryClient.invalidateQueries({ queryKey: ["engagements"] });
  };

  if (isLoading) {
    return <p>جارِ التحميل…</p>;
  }

  if (error) {
    return <p className="text-red-600">خطأ في الجلب</p>;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المهام / Engagements</h1>
        <form
          onSubmit={handleSubmit(onCreate)}
          className="flex flex-wrap items-start gap-2 rounded-2xl border bg-white p-3 dark:bg-neutral-900"
        >
          <div className="flex flex-col">
            <input
              className="w-28 rounded-xl border p-2"
              placeholder="السنة"
              type="number"
              {...register("annual_plan_year", { valueAsNumber: true })}
            />
            {errors.annual_plan_year && (
              <span className="text-xs text-red-600">{errors.annual_plan_year.message}</span>
            )}
          </div>
          <div className="flex flex-col">
            <input
              className="rounded-xl border p-2"
              placeholder="العنوان / Title"
              {...register("title")}
            />
            {errors.title && <span className="text-xs text-red-600">{errors.title.message}</span>}
          </div>
          <div className="flex flex-col">
            <input
              className="rounded-xl border p-2"
              placeholder="النطاق / Scope"
              {...register("scope")}
            />
            {errors.scope && <span className="text-xs text-red-600">{errors.scope.message}</span>}
          </div>
          <div className="flex flex-col">
            <select className="rounded-xl border p-2" {...register("risk_rating")}>
              <option value="">المخاطر</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.risk_rating && (
              <span className="text-xs text-red-600">{errors.risk_rating.message}</span>
            )}
          </div>
          <button
            disabled={isSubmitting}
            className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
            type="submit"
          >
            {isSubmitting ? "…" : "إنشاء"}
          </button>
        </form>
      </div>

      <DataTable data={data?.items ?? []} columns={columns} />
      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-xl border px-3 py-1"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
        >
          السابق
        </button>
        <span className="text-sm">صفحة {page}</span>
        <button
          className="rounded-xl border px-3 py-1"
          onClick={() => setPage((current) => current + 1)}
          disabled={(data?.items?.length ?? 0) < size}
        >
          التالي
        </button>
      </div>
    </section>
  );
}
