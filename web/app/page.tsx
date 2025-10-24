import Link from "next/link";
import LogoFull from "./components/LogoFull";

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="logo text-brand">
        <LogoFull />
      </div>
      <h1 className="text-2xl font-bold">مرحبًا بك في AuditOrbit</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        نظام إدارة المراجعة الداخلية - Internal Audit Management System
      </p>
      <div className="flex gap-3">
        <Link
          href="/auth/sign-in"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold"
        >
          🔑 تسجيل الدخول / Sign In
        </Link>
        <Link
          href="/admin"
          className="px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          📊 لوحة التحكم / Dashboard
        </Link>
      </div>
      <div className="rounded-2xl border bg-blue-50 dark:bg-blue-950 p-4 space-y-2">
        <p className="font-semibold text-sm">🔐 معلومات الدخول التجريبية:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="opacity-70">Email:</span>
            <code className="block bg-white dark:bg-neutral-800 px-2 py-1 rounded mt-1">
              admin@example.com
            </code>
          </div>
          <div>
            <span className="opacity-70">Password:</span>
            <code className="block bg-white dark:bg-neutral-800 px-2 py-1 rounded mt-1">
              Admin#2025
            </code>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed p-4 opacity-70">
        <p className="text-sm font-semibold mb-2">📦 الميزات المتاحة:</p>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>إدارة المستخدمين والأدوار (RBAC)</li>
          <li>إدارة المهام والقوائم المرجعية</li>
          <li>رفع وإدارة أدلة المراجعة</li>
          <li>استخراج النصوص بالذكاء الاصطناعي (OCR)</li>
          <li>استخراج الكيانات ومحرك المقارنة</li>
          <li>إدارة التقارير مع نظام الموافقات</li>
        </ul>
      </div>
    </section>
  );
}
