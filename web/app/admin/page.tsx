"use client";

import Link from "next/link";

export default function AdminHome() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return (
      <div className="p-6">
        <p>
          يجب تسجيل الدخول. {" "}
          <Link href="/auth/sign-in" className="text-brand underline">
            الانتقال لصفحة الدخول
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">لوحة الإدارة / Admin</h1>
      <nav className="flex gap-3 flex-wrap">
        <Link className="px-4 py-2 rounded-xl border" href="/admin/users">
          المستخدمون / Users
        </Link>
        <Link className="px-4 py-2 rounded-xl border" href="/admin/roles">
          الأدوار / Roles
        </Link>
        <Link className="px-4 py-2 rounded-xl border" href="/admin/engagements">
          المهام / Engagements
        </Link>
        <Link className="px-4 py-2 rounded-xl border" href="/admin/checklists">
          القوائم / Checklists
        </Link>
      </nav>
    </div>
  );
}
