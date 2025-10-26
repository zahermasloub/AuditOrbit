"use client";
import Container from "../../components/layout/Container";
import SectionTitle from "../../components/layout/SectionTitle";
import CardGrid, { CardItem } from "../../components/ui/CardGrid";

export default function Page(){
  const items: CardItem[] = [
    { href:"/admin/reports/templates", kicker:"Templates", title:"قوالب التقارير", sub:"إدارة القوالب والإصدارات.", icon:"settings" },
    { href:"/admin/reports/versions",  kicker:"Versioning", title:"إدارة الإصدارات", sub:"سجل التعديلات.", icon:"fileArchive" },
    { href:"/admin/reports/publishing",kicker:"Publishing", title:"سياسات النشر", sub:"قواعد التسميات والموافقات.", icon:"send" },
    { href:"/admin/reports/audit",     kicker:"Audit", title:"سجل تغييرات التقارير", sub:"شفافية كاملة.", icon:"shield" },
  ];
  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle title="إدارة التقارير / Reports Admin" sub="تهيئة وإدارة دورة حياة التقارير." />
      <CardGrid items={items}/>
    </Container>
  );
}
