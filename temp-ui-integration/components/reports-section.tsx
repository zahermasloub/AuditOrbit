"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Download,
  FileText,
  Calendar,
  User,
  TrendingUp,
  Eye,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Report {
  id: number
  title: string
  engagement: string
  type: "نهائي" | "مسودة" | "متابعة"
  status: "قيد الإعداد" | "قيد المراجعة" | "معتمد" | "مرسل"
  author: string
  createdDate: string
  approvedDate?: string
  findingsCount: number
  criticalFindings: number
  department: string
  executiveSummary: string
}

export function ReportsSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "تقرير تدقيق نظام المشتريات - 2025",
      engagement: "تدقيق نظام المشتريات",
      type: "مسودة",
      status: "قيد المراجعة",
      author: "أحمد محمد",
      createdDate: "2025-01-20",
      findingsCount: 8,
      criticalFindings: 2,
      department: "المشتريات",
      executiveSummary:
        "تم إجراء تدقيق شامل لنظام المشتريات وتم اكتشاف عدة نقاط ضعف في الضوابط الداخلية تتطلب معالجة فورية.",
    },
    {
      id: 2,
      title: "تقرير مراجعة الضوابط المالية - Q4 2024",
      engagement: "مراجعة الضوابط المالية",
      type: "نهائي",
      status: "معتمد",
      author: "فاطمة علي",
      createdDate: "2024-12-15",
      approvedDate: "2025-01-10",
      findingsCount: 5,
      criticalFindings: 1,
      department: "المالية",
      executiveSummary: "أظهرت المراجعة تحسناً ملحوظاً في الضوابط المالية مع وجود بعض المجالات التي تحتاج إلى تطوير.",
    },
    {
      id: 3,
      title: "تقرير تدقيق أمن المعلومات - يناير 2025",
      engagement: "تدقيق أمن المعلومات",
      type: "مسودة",
      status: "قيد الإعداد",
      author: "خالد سعيد",
      createdDate: "2025-01-25",
      findingsCount: 12,
      criticalFindings: 3,
      department: "تقنية المعلومات",
      executiveSummary: "تم تحديد عدة ثغرات أمنية حرجة في أنظمة الوصول والمصادقة تتطلب معالجة عاجلة.",
    },
  ])

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.engagement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || report.type === filterType
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: reports.length,
    draft: reports.filter((r) => r.type === "مسودة").length,
    final: reports.filter((r) => r.type === "نهائي").length,
    approved: reports.filter((r) => r.status === "معتمد").length,
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "نهائي":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "مسودة":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "متابعة":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return ""
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد الإعداد":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      case "قيد المراجعة":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "معتمد":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "مرسل":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">إجمالي التقارير</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <FileText className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">مسودات</p>
                <p className="text-3xl font-bold text-white">{stats.draft}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">نهائية</p>
                <p className="text-3xl font-bold text-white">{stats.final}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">معتمدة</p>
                <p className="text-3xl font-bold text-white">{stats.approved}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <TrendingUp className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="البحث في التقارير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="نوع التقرير" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="نهائي">نهائي</SelectItem>
                <SelectItem value="مسودة">مسودة</SelectItem>
                <SelectItem value="متابعة">متابعة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="قيد الإعداد">قيد الإعداد</SelectItem>
                <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                <SelectItem value="معتمد">معتمد</SelectItem>
                <SelectItem value="مرسل">مرسل</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء تقرير
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إنشاء تقرير تدقيق جديد</DialogTitle>
                  <DialogDescription className="text-slate-400">أدخل تفاصيل التقرير وفقاً لمعايير IIA</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>عنوان التقرير</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="مثال: تقرير تدقيق نظام المشتريات - 2025"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>المهمة التدقيقية</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="اختر المهمة" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="1">تدقيق نظام المشتريات</SelectItem>
                          <SelectItem value="2">مراجعة الضوابط المالية</SelectItem>
                          <SelectItem value="3">تدقيق أمن المعلومات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>نوع التقرير</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="draft">مسودة</SelectItem>
                          <SelectItem value="final">نهائي</SelectItem>
                          <SelectItem value="followup">متابعة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>الملخص التنفيذي</Label>
                    <Textarea
                      className="bg-slate-800 border-slate-700 text-white min-h-32"
                      placeholder="ملخص تنفيذي للتقرير يتضمن أهم النتائج والتوصيات..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الأهداف</Label>
                    <Textarea
                      className="bg-slate-800 border-slate-700 text-white min-h-24"
                      placeholder="أهداف المهمة التدقيقية..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>النطاق</Label>
                    <Textarea
                      className="bg-slate-800 border-slate-700 text-white min-h-24"
                      placeholder="نطاق العمل التدقيقي..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المنهجية</Label>
                    <Textarea
                      className="bg-slate-800 border-slate-700 text-white min-h-24"
                      placeholder="المنهجية المتبعة في التدقيق..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-300 bg-transparent"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">إنشاء التقرير</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <FileText className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{report.title}</h3>
                      <p className="text-slate-400 text-sm">{report.engagement}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
                <p className="text-slate-300 text-sm">{report.executiveSummary}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">الإدارة</p>
                  <p className="text-white text-sm font-medium">{report.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">المؤلف</p>
                  <p className="text-white text-sm font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {report.author}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">تاريخ الإنشاء</p>
                  <p className="text-white text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {report.createdDate}
                  </p>
                </div>
                {report.approvedDate && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">تاريخ الاعتماد</p>
                    <p className="text-white text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {report.approvedDate}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400 text-sm">إجمالي النتائج:</span>
                  <span className="text-white font-semibold">{report.findingsCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-slate-400 text-sm">نتائج حرجة:</span>
                  <span className="text-red-400 font-semibold">{report.criticalFindings}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Eye className="h-4 w-4 ml-1" />
                  عرض
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Download className="h-4 w-4 ml-1" />
                  تحميل PDF
                </Button>
                {report.status === "معتمد" && (
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Send className="h-4 w-4 ml-1" />
                    إرسال
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center py-12">
            <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد تقارير</h3>
            <p className="text-slate-400">لم يتم العثور على تقارير تطابق معايير البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
