"use client"

import Link from "next/link"
import { ArrowLeft, UserPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-white">إدارة المستخدمين</h1>
            </div>
            <p className="text-slate-400 mr-14">إدارة حسابات المستخدمين والصلاحيات</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة مستخدم
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="ابحث عن مستخدم..."
              className="pr-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Content */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">قائمة المستخدمين</CardTitle>
            <CardDescription className="text-slate-400">
              هذه الصفحة قيد التطوير - سيتم إضافة قائمة المستخدمين وإدارتهم قريباً
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
