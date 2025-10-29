"use client"

import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-white">إدارة الأدوار والصلاحيات</h1>
            </div>
            <p className="text-slate-400 mr-14">RBAC: أدوار وصلاحيات دقيقة</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Shield className="h-4 w-4 ml-2" />
            إضافة دور
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">الأدوار والصلاحيات</CardTitle>
            <CardDescription className="text-slate-400">
              هذه الصفحة قيد التطوير - سيتم إضافة نظام RBAC قريباً
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
