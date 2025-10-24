"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import DataTable from "../../components/table/DataTable";
import { apiFetch } from "../../lib/apiFetch";

type Role = { id: number; name: string };

export default function RolesPage() {
  const { data, isLoading, error } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: () => apiFetch<Role[]>("/roles"),
  });

  const columns: ColumnDef<Role>[] = [
    { header: "المعرّف / ID", accessorKey: "id" },
    { header: "الدور / Role", accessorKey: "name" },
  ];

  if (isLoading) return <p>جارِ التحميل…</p>;
  if (error) return <p className="text-red-600">خطأ في الجلب</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">الأدوار / Roles</h1>
      <DataTable data={data ?? []} columns={columns} />
    </section>
  );
}
