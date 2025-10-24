"use client";

import Link from "next/link";

export default function ManagerHome() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">مساحة المدير / IA Manager</h1>
      <nav className="flex gap-3 flex-wrap">
        <Link className="px-4 py-2 rounded-xl border" href="/manager/engagements">
          Engagements &amp; Assignments
        </Link>
        <Link className="px-4 py-2 rounded-xl border" href="/manager/findings">
          Findings Overview
        </Link>
        <Link className="px-4 py-2 rounded-xl border" href="/manager/reports">
          Report Approvals
        </Link>
      </nav>
      <p className="opacity-70 text-sm">اختر صفحة لإدارة المهام، التعيينات، النتائج، وموافقات التقارير.</p>
    </section>
  );
}
