"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import DataTable from "../../components/table/DataTable";
import { apiFetch } from "../../lib/apiFetch";

type User = {
  id: string;
  email: string;
  name: string;
  locale: string;
  tz: string;
  active: boolean;
};

type Page<T> = { items: T[]; page: number; size: number; total: number };

const Schema = z.object({
  email: z.string().email("بريد غير صالح"),
  name: z.string().min(2, "الاسم قصير"),
  password: z.string().min(8, "كلمة المرور ≥ 8"),
});

type FormData = z.infer<typeof Schema>;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const size = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Page<User>>({
    queryKey: ["users", page, size],
    queryFn: () => apiFetch<Page<User>>(`/users?page=${page}&size=${size}`),
    placeholderData: (previous) => previous,
  });

  const columns: ColumnDef<User>[] = [
    { header: "البريد / Email", accessorKey: "email" },
    { header: "الاسم / Name", accessorKey: "name" },
    {
      header: "الحالة / Active",
      accessorKey: "active",
      cell: ({ getValue }) => (getValue<boolean>() ? "فعال" : "موقوف"),
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(Schema) });

  const onCreate = async (values: FormData) => {
    await apiFetch<User>("/users", { method: "POST", body: JSON.stringify(values) });
    reset();
    await queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  if (isLoading) return <p>جارِ التحميل…</p>;
  if (error) return <p className="text-red-600">خطأ في الجلب</p>;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">المستخدمون / Users</h1>
        <form
          onSubmit={handleSubmit(onCreate)}
          className="flex gap-2 items-start bg-white dark:bg-neutral-900 p-3 rounded-2xl border"
        >
          <div className="flex flex-col gap-1">
            <input
              className="border rounded-xl p-2"
              placeholder="Email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="border rounded-xl p-2"
              placeholder="Name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="border rounded-xl p-2"
              placeholder="Password"
              type="password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
          </div>
          <button disabled={isSubmitting} className="px-3 py-2 rounded-xl bg-black text-white" type="submit">
            {isSubmitting ? "…" : "إنشاء / Create"}
          </button>
        </form>
      </div>
      <DataTable data={data?.items ?? []} columns={columns} />
      <div className="flex items-center justify-end gap-2">
        <button
          className="px-3 py-1 border rounded-xl"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
        >
          السابق
        </button>
        <span className="text-sm">صفحة {page}</span>
        <button
          className="px-3 py-1 border rounded-xl"
          onClick={() => setPage((current) => current + 1)}
          disabled={(data?.items.length ?? 0) < size}
        >
          التالي
        </button>
      </div>
    </section>
  );
}
