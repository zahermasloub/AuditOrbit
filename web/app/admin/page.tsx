"use client"

import Link from "next/link"
import { 
  Users, 
  KeyRound, 
  FolderKanban, 
  ClipboardList, 
  Upload, 
  FileChartColumn, 
  Bell, 
  ShieldCheck, 
  FlaskConical 
} from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const adminItems = [
  {
    href: "/admin/users",
    title: "المستخدمون",
    titleEn: "Users",
    description: "إدارة الحسابات والصلاحيات",
    icon: Users,
    color: "text-blue-600",
  },
  {
    href: "/admin/roles",
    title: "الأدوار",
    titleEn: "Roles",
    description: "RBAC: أدوار وصلاحيات دقيقة",
    icon: KeyRound,
    color: "text-purple-600",
  },
  {
    href: "/admin/engagements",
    title: "المهام",
    titleEn: "Engagements",
    description: "إنشاء المهام وتخصيص الموارد",
    icon: FolderKanban,
    color: "text-indigo-600",
  },
  {
    href: "/admin/checklists",
    title: "القوائم",
    titleEn: "Checklists",
    description: "قوالب وبنود قابلة لإعادة الاستخدام",
    icon: ClipboardList,
    color: "text-cyan-600",
  },
  {
    href: "/admin/evidence",
    title: "الأدلة",
    titleEn: "Evidence",
    description: "رفع ملفات، إدارة MinIO، تتبّع الحالة",
    icon: Upload,
    color: "text-teal-600",
  },
  {
    href: "/admin/reports",
    title: "التقارير",
    titleEn: "Reports",
    description: "الإصدارات والموافقات والنشر",
    icon: FileChartColumn,
    color: "text-green-600",
  },
  {
    href: "/admin/notifications",
    title: "الإشعارات",
    titleEn: "Notifications",
    description: "قنوات التبليغ وتتبع الحالة",
    icon: Bell,
    color: "text-yellow-600",
  },
  {
    href: "/admin/audit-log",
    title: "سجل التدقيق",
    titleEn: "Audit Log",
    description: "شفافية كاملة لكل الإجراءات",
    icon: ShieldCheck,
    color: "text-red-600",
  },
  {
    href: "/admin/ai-lab",
    title: "مختبر الذكاء الاصطناعي",
    titleEn: "AI Lab",
    description: "OCR, Parsing, Extraction, Comparison",
    icon: FlaskConical,
    color: "text-orange-600",
  },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
          <p className="text-slate-400">Admin Dashboard - وحدات الإدارة والتجهيز</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-600/50 transition-all hover:shadow-lg hover:shadow-indigo-600/10">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-800/50 ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">
                          {item.title} / {item.titleEn}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
