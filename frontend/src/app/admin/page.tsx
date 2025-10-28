"use client";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/layout/SectionTitle";
import CardGrid, { CardItem } from "@/components/ui/CardGrid";

export default function AdminPage() {
  const items: CardItem[] = [
    {
      href: "/admin/users",
      title: "المستخدمون / Users",
      sub: "إدارة الحسابات والصلاحيات.",
      icon: "users",
      tone: "accent",
    },
    {
      href: "/admin/roles",
      title: "الأدوار / Roles",
      sub: "RBAC: أدوار وصلاحيات دقيقة.",
      icon: "key",
    },
    {
      href: "/admin/engagements",
      title: "المهام / Engagements",
      sub: "إنشاء المهام وتخصيص الموارد.",
      icon: "kanban",
    },
    {
      href: "/admin/checklists",
      title: "القوائم / Checklists",
      sub: "قوالب وبنود قابلة لإعادة الاستخدام.",
      icon: "list",
    },
    {
      href: "/admin/evidence",
      title: "الأدلة / Evidence",
      sub: "رفع ملفات، إدارة MinIO، تتبّع الحالة.",
      icon: "upload",
    },
    {
      href: "/admin/reports",
      title: "التقارير / Reports",
      sub: "الإصدارات والموافقات والنشر.",
      icon: "report",
      tone: "success",
    },
    {
      href: "/admin/notifications",
      title: "الإشعارات / Notifications",
      sub: "قنوات التبليغ وتتبع الحالة.",
      icon: "bell",
    },
    {
      href: "/admin/audit-log",
      title: "سجل التدقيق / Audit Log",
      sub: "شفافية كاملة لكل الإجراءات.",
      icon: "shield",
    },
    {
      href: "/admin/ai-lab",
      title: "AI Lab",
      sub: "OCR, Parsing, Extraction, Comparison.",
      icon: "lab",
      tone: "warning",
    },
  ];

  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle title="Admin / لوحة الإدارة" sub="وحدات الإدارة والتجهيز." />
      <CardGrid items={items} />
    </Container>
  );
}
