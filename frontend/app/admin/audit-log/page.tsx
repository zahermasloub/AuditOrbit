"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuditLogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">سجل النشاطات</h1>
            <p className="text-slate-400">تتبع جميع العمليات</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">سجل التدقيق</CardTitle>
            <CardDescription className="text-slate-400">
              هذه الصفحة قيد التطوير - عرض وتحليل سجل النشاطات
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
