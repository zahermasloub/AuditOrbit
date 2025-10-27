"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Finding {
  id: number
  title: string
  description: string
  severity: "حرج" | "عالي" | "متوسط" | "منخفض"
  status: "مفتوح" | "قيد المعالجة" | "مغلق" | "مقبول"
  engagement: string
  department: string
  auditor: string
  identifiedDate: string
  dueDate: string
  recommendation: string
  managementResponse?: string
  cosoComponent?: string
  riskRating: number
}

export function FindingsSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)

  const [findings, setFindings] = useState<Finding[]>([
    {
      id: 1,
      title: "ضعف في ضوابط الموافقات على المشتريات",
      description:
        "تم اكتشاف عدم وجود مستويات موافقة واضحة للمشتريات التي تتجاوز 50,000 ريال، مما يشكل خطراً على الضوابط المالية.",
      severity: "حرج",
      status: "مفتوح",
      engagement: "تدقيق نظام المشتريات",
      department: "المشتريات",
      auditor: "أحمد محمد",
      identifiedDate: "2025-01-15",
      dueDate: "2025-02-28",
      recommendation:
        "تطوير وتوثيق سياسة واضحة لمستويات الموافقات على المشتريات مع تحديد الصلاحيات حسب القيمة المالية.",
      cosoComponent: "أنشطة الرقابة",
      riskRating: 95,
    },
    {
      id: 2,
      title: "عدم كفاية التوثيق للمعاملات المالية",
      description: "لوحظ نقص في المستندات الداعمة لبعض المعاملات المالية، خاصة في عمليات الصرف النقدي.",
      severity: "عالي",
      status: "قيد المعالجة",
      engagement: "مراجعة الضوابط المالية",
      department: "المالية",
      auditor: "فاطمة علي",
      identifiedDate: "2025-01-20",
      dueDate: "2025-03-15",
      recommendation: "تطبيق نظام إلكتروني لإدارة المستندات وضمان اكتمال التوثيق قبل الموافقة على أي معاملة.",
      managementResponse: "تم البدء في تطبيق نظام إدارة المستندات الإلكتروني، ومن المتوقع اكتماله خلال شهرين.",
      cosoComponent: "المعلومات والاتصالات",
      riskRating: 78,
    },
    {
      id: 3,
      title: "ثغرات في أمن الوصول للأنظمة الحساسة",
      description: "تم اكتشاف حسابات مستخدمين غير نشطة لا تزال تمتلك صلاحيات وصول للأنظمة المالية الحساسة.",
      severity: "عالي",
      status: "مفتوح",
      engagement: "تدقيق أمن المعلومات",
      department: "تقنية المعلومات",
      auditor: "خالد سعيد",
      identifiedDate: "2025-01-25",
      dueDate: "2025-02-15",
      recommendation: "تطبيق مراجعة دورية ربع سنوية لصلاحيات المستخدمين وإلغاء الحسابات غير النشطة فوراً.",
      cosoComponent: "أنشطة الرقابة",
      riskRating: 88,
    },
    {
      id: 4,
      title: "عدم الالتزام بسياسة الإجازات",
      description: "لوحظ عدم التزام بعض الموظفين بسياسة الإجازات السنوية، مع تراكم أرصدة إجازات كبيرة.",
      severity: "متوسط",
      status: "مغلق",
      engagement: "مراجعة الموارد البشرية",
      department: "الموارد البشرية",
      auditor: "سارة أحمد",
      identifiedDate: "2024-12-10",
      dueDate: "2025-01-31",
      recommendation: "تطبيق نظام تنبيهات تلقائي للموظفين والمدراء عند تجاوز رصيد الإجازات الحد المسموح.",
      managementResponse: "تم تطبيق النظام الجديد وإرسال تنبيهات لجميع الموظفين المعنيين.",
      cosoComponent: "بيئة الرقابة",
      riskRating: 45,
    },
  ])

  const filteredFindings = findings.filter((finding) => {
    const matchesSearch =
      finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.engagement.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = filterSeverity === "all" || finding.severity === filterSeverity
    const matchesStatus = filterStatus === "all" || finding.status === filterStatus
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const stats = {
    total: findings.length,
    open: findings.filter((f) => f.status === "مفتوح").length,
    inProgress: findings.filter((f) => f.status === "قيد المعالجة").length,
    closed: findings.filter((f) => f.status === "مغلق").length,
    critical: findings.filter((f) => f.severity === "حرج").length,
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "حرج":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "عالي":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "متوسط":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "منخفض":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return ""
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مفتوح":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "قيد المعالجة":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "مغلق":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "مقبول":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">إجمالي النتائج</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <AlertCircle className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">مفتوحة</p>
                <p className="text-3xl font-bold text-white">{stats.open}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">قيد المعالجة</p>
                <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">مغلقة</p>
                <p className="text-3xl font-bold text-white">{stats.closed}</p>
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
                <p className="text-slate-400 text-sm mb-1">حرجة</p>
                <p className="text-3xl font-bold text-white">{stats.critical}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <TrendingUp className="h-6 w-6 text-red-400" />
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
                placeholder="البحث في النتائج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="حرج">حرج</SelectItem>
                <SelectItem value="عالي">عالي</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="منخفض">منخفض</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="مفتوح">مفتوح</SelectItem>
                <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                <SelectItem value="مغلق">مغلق</SelectItem>
                <SelectItem value="مقبول">مقبول</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة نتيجة
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة نتيجة تدقيقية جديدة</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    أدخل تفاصيل النتيجة التدقيقية وفقاً لمعايير IIA
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>عنوان النتيجة</Label>
                      <Input
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="مثال: ضعف في الضوابط الداخلية"
                      />
                    </div>

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
                  </div>

                  <div className="space-y-2">
                    <Label>وصف النتيجة</Label>
                    <Textarea
                      className="bg-slate-800 border-slate-700 text-white min-h-24"
                      placeholder="وصف تفصيلي للنتيجة التدقيقية..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>مستوى الخطورة</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="اختر المستوى" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="حرج">حرج</SelectItem>
                          <SelectItem value="عالي">عالي</SelectItem>
                          <SelectItem value="متوسط">متوسط</SelectItem>
                          <SelectItem value="منخفض">منخفض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الإدارة</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="اختر الإدارة" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="finance">المالية</SelectItem>
                          <SelectItem value="procurement">المشتريات</SelectItem>
                          <SelectItem value="hr">الموارد البشرية</SelectItem>
                          <SelectItem value="it">تقنية المعلومات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>تاريخ الاستحقاق</Label>
                      <Input type="date" className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>مكون COSO</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="اختر مكون COSO" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="control-environment">بيئة الرقابة</SelectItem>
                        <SelectItem value="risk-assessment">تقييم المخاطر</SelectItem>
                        <SelectItem value="control-activities">أنشطة الرقابة</SelectItem>
                        <SelectItem value="information">المعلومات والاتصالات</SelectItem>
                        <SelectItem value="monitoring">المراقبة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>التوصية</Label>
                    <Textarea
                      className="bg-slate-800 border-slate-700 text-white min-h-24"
                      placeholder="التوصيات المقترحة لمعالجة النتيجة..."
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
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">حفظ النتيجة</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => (
          <Card key={finding.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{finding.title}</h3>
                      <p className="text-slate-400 text-sm">{finding.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                    {finding.severity}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(finding.status)}>
                    {finding.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-slate-400 text-xs mb-1">المهمة التدقيقية</p>
                  <p className="text-white text-sm font-medium">{finding.engagement}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">الإدارة</p>
                  <p className="text-white text-sm font-medium">{finding.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">المدقق</p>
                  <p className="text-white text-sm font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {finding.auditor}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">تاريخ الاستحقاق</p>
                  <p className="text-white text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {finding.dueDate}
                  </p>
                </div>
              </div>

              {finding.cosoComponent && (
                <div className="mb-4">
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 bg-cyan-500/10">
                    COSO: {finding.cosoComponent}
                  </Badge>
                </div>
              )}

              <Tabs defaultValue="recommendation" className="w-full">
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger value="recommendation" className="data-[state=active]:bg-indigo-600">
                    التوصية
                  </TabsTrigger>
                  {finding.managementResponse && (
                    <TabsTrigger value="response" className="data-[state=active]:bg-indigo-600">
                      رد الإدارة
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="recommendation" className="mt-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-300 text-sm">{finding.recommendation}</p>
                  </div>
                </TabsContent>
                {finding.managementResponse && (
                  <TabsContent value="response" className="mt-4">
                    <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-slate-300 text-sm">{finding.managementResponse}</p>
                    </div>
                  </TabsContent>
                )}
              </Tabs>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">درجة المخاطر:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          finding.riskRating >= 80
                            ? "bg-red-500"
                            : finding.riskRating >= 60
                              ? "bg-orange-500"
                              : finding.riskRating >= 40
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                        }`}
                        style={{ width: `${finding.riskRating}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-semibold">{finding.riskRating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Eye className="h-4 w-4 ml-1" />
                    عرض
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFindings.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center py-12">
            <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h3>
            <p className="text-slate-400">لم يتم العثور على نتائج تطابق معايير البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
