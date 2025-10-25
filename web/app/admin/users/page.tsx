"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DataTable, type DataTableColumn } from "@/app/components/table/DataTable";
import { DataTableToolbar } from "@/app/components/table/DataTableToolbar";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Modal } from "@/app/components/ui/Modal";
import { apiFetch } from "@/app/lib/apiFetch";

type User = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  status?: string | null;
  active?: boolean;
  created_at?: string | null;
};

type UsersResponse = {
  items?: User[];
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<User[]>({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const response = await apiFetch<UsersResponse>(
        `/users?page=1&size=200&search=${encodeURIComponent(search)}`,
      );
      return response.items ?? [];
    },
    staleTime: 60_000,
  });

  const rows = useMemo(() => {
    return (data ?? []).map((user: User) => ({
      ...user,
      status: user.status ?? (user.active === false ? "inactive" : "active"),
    }));
  }, [data]);

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      { header: "الاسم", accessorKey: "name" },
      { header: "البريد", accessorKey: "email" },
      { header: "الدور", accessorKey: "role" },
      {
        header: "الحالة",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge value={row.status ?? "active"} />,
      },
      {
        header: "أُنشئ",
        accessorKey: "created_at",
        cell: ({ row }) => formatDate(row.created_at),
      },
    ],
    [],
  );

  const resetModal = () => {
    setForm({ email: "", name: "", password: "" });
  };

  const createUser = useMutation({
    mutationFn: async ({ email, name, password }: { email: string; name: string; password: string }) => {
      return apiFetch<User>("/users", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      });
    },
    onSuccess: async () => {
      resetModal();
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const handleCreate = () => {
    const email = form.email.trim();
    const name = form.name.trim();
    const password = form.password;
    if (!email || !password) return;
    createUser.mutate({ email, name, password });
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[rgb(var(--ao-fg))]">المستخدمون / Users</h1>
        <p className="text-sm opacity-70">إدارة الحسابات، الأدوار، وحالة المستخدمين.</p>
      </header>

      <DataTableToolbar
        onSearchAction={setSearch}
        onCreateAction={() => setOpen(true)}
        placeholder="ابحث بالبريد أو الاسم"
      />

      {isLoading ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm opacity-70">
          جارٍ تحميل المستخدمين…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed border-red-400 bg-red-50 p-6 text-sm text-red-700">
          تعذر تحميل البيانات.
        </div>
      ) : (
        <DataTable<User> columns={columns} data={rows} pageSize={12} />
      )}

      <Modal
        title="إضافة مستخدم جديد"
        open={open}
        onOpenChangeAction={(value) => {
          if (!value) {
            resetModal();
          }
          setOpen(value);
        }}
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" onClick={handleCreate} disabled={createUser.isPending}>
              {createUser.isPending ? "جاري الحفظ…" : "حفظ"}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label htmlFor="user-email" className="text-sm">
            البريد الإلكتروني
          </label>
          <Input
            id="user-email"
            placeholder="user@example.com"
            type="email"
            autoFocus
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />

          <label htmlFor="user-name" className="text-sm">
            الاسم الكامل
          </label>
          <Input
            id="user-name"
            placeholder="اسم المستخدم"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />

          <label htmlFor="user-password" className="text-sm">
            كلمة المرور المؤقتة
          </label>
          <Input
            id="user-password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </div>
      </Modal>
    </section>
  );
}
