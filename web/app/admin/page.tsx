"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminHome() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    setToken(stored);
  }, []);

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
      <ul className="list-disc ps-6 space-y-1">
        <li>المستخدمون / Users</li>
        <li>الأدوار / Roles</li>
      </ul>
    </div>
  );
}
