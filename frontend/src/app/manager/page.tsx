"use client";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/layout/SectionTitle";
import CardGrid, { CardItem } from "@/components/ui/CardGrid";

export default function ManagerPage() {
  const items: CardItem[] = [
    {
      href: "/manager/engagements",
      title: "المهام والتعيينات / Engagements",
      sub: "إدارة الخطة السنوية والموارد.",
      icon: "kanban",
      tone: "accent",
    },
    {
      href: "/manager/findings",
      title: "نتائج المراجعة / Findings",
      sub: "تحليل النتائج وتتبع الإقفال.",
      icon: "search",
    },
    {
      href: "/manager/reports",
      title: "التقارير / Reports",
      sub: "مراجعة وإقرار ونشر.",
      icon: "report",
      tone: "success",
    },
  ];

  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle
        title="IA Manager / مساحة المدير"
        sub="إدارة الخطط والمهام والنتائج والتقارير."
      />
      <CardGrid items={items} />
    </Container>
  );
}
