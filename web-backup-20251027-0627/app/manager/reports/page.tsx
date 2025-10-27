"use client";
import Container from "../../components/layout/Container";
import SectionTitle from "../../components/layout/SectionTitle";
import CardGrid, { CardItem } from "../../components/ui/CardGrid";

export default function Page(){
  const items: CardItem[] = [
    { href:"/manager/reports/drafts",    kicker:"Reports", title:"المسودات / Drafts", sub:"تقارير قيد الإنشاء.", icon:"fileAdd", tone:"primary" },
    { href:"/manager/reports/in-review", kicker:"Approvals", title:"قيد المراجعة / In Review", sub:"بانتظار الاعتماد.", icon:"filePending" },
    { href:"/manager/reports/approvals", kicker:"Workflow", title:"الموافقات / Approvals", sub:"مراجعة واعتماد.", icon:"stamp" },
    { href:"/manager/reports/published", kicker:"Final", title:"المنشورة / Published", sub:"الإصدارات النهائية.", icon:"fileApprove", tone:"success" },
    { href:"/manager/reports/new",       kicker:"Builder", title:"إنشاء تقرير جديد", sub:"من قالب أو فارغ.", icon:"fileAdd", tone:"warning" },
    { href:"/manager/findings",          kicker:"Findings", title:"نتائج المراجعة", sub:"تحليل ومتابعة الإقفال.", icon:"search" },
  ];
  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle title="التقارير / Reports" sub="إدارة دورات حياة التقارير للمدير." />
      <CardGrid items={items}/>
    </Container>
  );
}
