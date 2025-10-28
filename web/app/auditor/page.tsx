"use client"

import Link from "next/link"
import { CheckCircle2, Library, ListChecks } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const auditorItems = [
  {
    href: "/auditor/tasks",
    title: "مهامي الحالية",
    titleEn: "My Tasks",
    description: "استلام المهام ورفع الأدلة",
    icon: CheckCircle2,
    color: "text-blue-600",
    disabled: false,
  },
  {
    href: "/auditor/archive",
    title: "الأرشيف",
    titleEn: "Archive",
    description: "مهام منتهية وسجل التنفيذ",
    icon: Library,
    color: "text-purple-600",
    disabled: false,
  },
  {
    href: "/auditor/checklists",
    title: "قوائم العمل",
    titleEn: "Checklists",
    description: "عرض القوائم المسندة ومتابعتها",
    icon: ListChecks,
    color: "text-cyan-600",
    disabled: true,
  },
]

export default function AuditorPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">مساحة المراجع</h1>
          <p className="text-slate-400">Auditor - لوحة تسليم واستكمال إجراءات المهمة</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {auditorItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.disabled ? "#" : item.href}>
                <Card
                  className={`bg-slate-900/50 border-slate-800 transition-all ${
                    item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-600/10"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-800/50 ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-white text-lg">
                            {item.title} / {item.titleEn}
                          </CardTitle>
                          {item.disabled && (
                            <Badge variant="secondary" className="text-xs">
                              قريباً
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
