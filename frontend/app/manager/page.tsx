"use client"

import Link from "next/link"
import { FolderKanban, Search, FileChartColumn, Activity } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"

const managerItems = [
  {
    href: "/manager/engagements",
    title: "المهام والتعيينات",
    titleEn: "Engagements",
    description: "إدارة الخطة السنوية والموارد",
    icon: FolderKanban,
    color: "text-blue-600",
  },
  {
    href: "/manager/findings",
    title: "نتائج المراجعة",
    titleEn: "Findings",
    description: "تحليل النتائج وتتبع الإقفال",
    icon: Search,
    color: "text-purple-600",
  },
  {
    href: "/manager/reports",
    title: "التقارير",
    titleEn: "Reports",
    description: "مراجعة وإقرار ونشر",
    icon: FileChartColumn,
    color: "text-green-600",
  },
  {
    href: "/ops",
    title: "حالة النظام",
    titleEn: "System Status",
    description: "مراقبة صحة النظام (قراءة فقط)",
    icon: Activity,
    color: "text-amber-600",
    badge: "مراقبة",
  },
]

export default function ManagerPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DynamicBreadcrumbs />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">مساحة المدير</h1>
          <p className="text-slate-400">IA Manager - إدارة الخطط والمهام والنتائج والتقارير</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {managerItems.map((item) => {
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
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-white text-lg">
                            {item.title} / {item.titleEn}
                          </CardTitle>
                          {item.badge && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
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
