"use client";

import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";

type SampleData = {
  id: number;
  name: string;
  role: string;
  status: string;
};

const columns: ColumnDef<SampleData>[] = [
  {
    accessorKey: "id",
    header: "الرقم",
  },
  {
    accessorKey: "name",
    header: "الاسم",
  },
  {
    accessorKey: "role",
    header: "الدور",
  },
  {
    accessorKey: "status",
    header: "الحالة",
  },
];

const sampleData: SampleData[] = [
  { id: 1, name: "أحمد محمد", role: "مدقق", status: "نشط" },
  { id: 2, name: "فاطمة علي", role: "مدير", status: "نشط" },
  { id: 3, name: "خالد حسن", role: "مراجع", status: "معلق" },
];

export default function PlaygroundUIPage() {
  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-fg mb-2">
            Playground - اختبار مكونات الواجهة
          </h1>
          <p className="text-muted">
            صفحة لاختبار المكونات والتحقق من إمكانية الوصول والأداء
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">DataTable Component</h2>
          <DataTable columns={columns} data={sampleData} />
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">حالة التحميل</h2>
          <DataTable columns={columns} data={[]} loading={true} />
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">حالة فارغة</h2>
          <DataTable
            columns={columns}
            data={[]}
            emptyMessage="لا توجد سجلات للعرض"
          />
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">الألوان والتيم</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-surface border border-border">
              <div className="w-12 h-12 rounded bg-accent mb-2"></div>
              <p className="text-sm font-medium">Accent</p>
            </div>
            <div className="p-4 rounded-lg bg-surface border border-border">
              <div className="w-12 h-12 rounded bg-[rgb(var(--danger))] mb-2"></div>
              <p className="text-sm font-medium">Danger</p>
            </div>
            <div className="p-4 rounded-lg bg-surface border border-border">
              <div className="w-12 h-12 rounded bg-[rgb(var(--warning))] mb-2"></div>
              <p className="text-sm font-medium">Warning</p>
            </div>
            <div className="p-4 rounded-lg bg-surface border border-border">
              <div className="w-12 h-12 rounded bg-[rgb(var(--success))] mb-2"></div>
              <p className="text-sm font-medium">Success</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">عناصر الواجهة</h2>
          <div className="space-y-4">
            <button className="px-6 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity">
              زر أساسي
            </button>
            <div className="p-4 bg-surface rounded-lg border border-border shadow-soft">
              <p className="text-fg">بطاقة بسيطة مع ظل وحدود</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
