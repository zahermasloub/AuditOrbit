"use client";
import Container from "../components/layout/Container";
import SectionTitle from "../components/layout/SectionTitle";
import CardGrid, { CardItem } from "../components/ui/CardGrid";

export default function Page(){
  const items: CardItem[] = [
    { href:"/auditor/tasks",     title:"مهامي الحالية / My Tasks",   sub:"استلام المهام ورفع الأدلة.", icon:"ok", tone:"primary" },
    { href:"/auditor/archive",   title:"الأرشيف / Archive",          sub:"مهام منتهية وسجل التنفيذ.", icon:"library" },
    { href:"/auditor/checklists",title:"قوائم العمل / Checklists",   sub:"عرض القوائم المسندة ومتابعتها.", icon:"checks" , disabled:true },
  ];
  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle title="Auditor / مساحة المراجع" sub="لوحة تسليم واستكمال إجراءات المهمة." />
      <CardGrid items={items}/>
    </Container>
  );
}
