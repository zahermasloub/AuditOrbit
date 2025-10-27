"use client"

import { useState } from "react"
import {
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Send,
  Eye,
  Edit,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FollowUpItem {
  id: number
  finding: string
  recommendation: string
  department: string
  responsiblePerson: string
  dueDate: string
  status: "معلق" | "قيد التنفيذ" | "مكتمل" | "متأخر"
  priority: "حرج" | "عالي" | "متوسط" | "منخفض"
  progress: number
  managementResponse?: string
  responseDate?: string
  implementationPlan?: string
  actualCompletionDate?: string
  verificationStatus?: "غير محقق" | "قيد التحقق" | "محقق"
  updates: {
    date: string
    author: string
    comment: string
  }[]
}

export function FollowUpSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null)

  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>([
    {
      id: 1,
      finding: "ضعف في ضوابط الموافقات على المشتريات",
      recommendation: "تطوير وتوثيق سياسة واضحة لمستويات الموافقات على المشتريات",
      department: "المشتريات",
      responsiblePerson: "مدير المشتريات",
      dueDate: "2025-02-28",
      status: "قيد التنفيذ",
      priority: "حرج",
      progress: 45,
      managementResponse:
        "تم تشكيل فريق عمل لمراجعة السياسات الحالية وتطوير سياسة جديدة. من المتوقع الانتهاء خلال 6 أسابيع.",
      responseDate: "2025-01-20",
      implementationPlan:
        "المرحلة 1: مراجعة السياسات الحالية (أسبوعان)\nالمرحلة 2: تطوير السياسة الجديدة (3 أسابيع)\nالمرحلة 3: الاعتماد والتطبيق (أسبوع)",
      verificationStatus: "قيد التحقق",
      updates: [
        {
          date: "2025-01-25",
          author: "مدير المشتريات",
          comment: "تم الانتهاء من مراجعة السياسات الحالية وتحديد الفجوات",
        },
        {
          date: "2025-01-28",
          author: "مدير المشتريات",
          comment: "جاري العمل على صياغة السياسة الجديدة بالتعاون مع الشؤون القانونية",
        },
      ],
    },
    {
      id: 2,
      finding: "عدم كفاية التوثيق للمعاملات المالية",
      recommendation: "تطبيق نظام إلكتروني لإدارة المستندات",
      department: "المالية",
      responsiblePerson: "المدير المالي",
      dueDate: "2025-03-15",
      status: "قيد التنفيذ",
      priority: "عالي",
      progress: 60,
      managementResponse: "تم البدء في تطبيق نظام إدارة المستندات الإلكتروني، ومن المتوقع اكتماله خلال شهرين.",
      responseDate: "2025-01-22",
      implementationPlan: "تم اختيار النظام وجاري التطبيق التجريبي في قسم الحسابات",
      verificationStatus: "قيد التحقق",
      updates: [
        {
          date: "2025-01-26",
          author: "المدير المالي",
          comment: "تم تركيب النظام وبدء التدريب للموظفين",
        },
      ],
    },
    {
      id: 3,
      finding: "ثغرات في أمن الوصول للأنظمة الحساسة",
      recommendation: "تطبيق مراجعة دورية ربع سنوية لصلاحيات المستخدمين",
      department: "تقنية المعلومات",
      responsiblePerson: "مدير تقنية المعلومات",
      dueDate: "2025-02-15",
      status: "متأخر",
      priority: "حرج",
      progress: 30,
      managementResponse: "نوافق على التوصية وسيتم تطبيق المراجعة الدورية بدءاً من الربع القادم.",
      responseDate: "2025-01-27",
      verificationStatus: "غير محقق",
      updates: [
        {
          date: "2025-01-29",
          author: "مدير تقنية المعلومات",
          comment: "تأخر التنفيذ بسبب نقص الموارد، جاري طلب دعم إضافي",
        },
      ],
    },
    {
      id: 4,
      finding: "عدم الالتزام بسياسة الإجازات",
      recommendation: "تطبيق نظام تنبيهات تلقائي للموظفين والمدراء",
      department: "الموارد البشرية",
      responsiblePerson: "مدير الموارد البشرية",
      dueDate: "2025-01-31",
      status: "مكتمل",
      priority: "متوسط",
      progress: 100,
      managementResponse: "تم تطبيق النظام الجديد وإرسال تنبيهات لجميع الموظفين المعنيين.",
      responseDate: "2025-01-15",
      actualCompletionDate: "2025-01-30",
      verificationStatus: "محقق",
      updates: [
        {
          date: "2025-01-30",
          author: "مدير الموارد البشرية",
          comment: "تم الانتهاء من تطبيق النظام بنجاح وإرسال التنبيهات",
        },
      ],
    },
  ])

  const filteredItems = followUpItems.filter((item) => {
    const matchesSearch =
      item.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesPriority = filterPriority === "all" || item.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: followUpItems.length,
    pending: followUpItems.filter((i) => i.status === "معلق").length,
    inProgress: followUpItems.filter((i) => i.status === "قيد التنفيذ").length,
    completed: followUpItems.filter((i) => i.status === "مكتمل").length,
    overdue: followUpItems.filter((i) => i.status === "متأخر").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "معلق":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      case "قيد التنفيذ":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "مكتمل":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "متأخر":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return ""
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getVerificationColor = (status?: string) => {
    switch (status) {
      case "محقق":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "قيد التحقق":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "غير محقق":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
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
                <p className="text-slate-400 text-sm mb-1">إجمالي المتابعات</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <MessageSquare className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">معلقة</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <div className="p-3 bg-slate-500/10 rounded-lg border border-slate-500/20">
                <Clock className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">قيد التنفيذ</p>
                <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">مكتملة</p>
                <p className="text-3xl font-bold text-white">{stats.completed}</p>
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
                <p className="text-slate-400 text-sm mb-1">متأخرة</p>
                <p className="text-3xl font-bold text-white">{stats.overdue}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-400" />
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
                placeholder="البحث في المتابعات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="معلق">معلق</SelectItem>
                <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                <SelectItem value="مكتمل">مكتمل</SelectItem>
                <SelectItem value="متأخر">متأخر</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="حرج">حرج</SelectItem>
                <SelectItem value="عالي">عالي</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="منخفض">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <MessageSquare className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{item.finding}</h3>
                      <p className="text-slate-400 text-sm mb-2">{item.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-slate-400 text-xs mb-1">الإدارة</p>
                  <p className="text-white text-sm font-medium">{item.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">المسؤول</p>
                  <p className="text-white text-sm font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.responsiblePerson}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">تاريخ الاستحقاق</p>
                  <p className="text-white text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.dueDate}
                  </p>
                </div>
                {item.verificationStatus && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">حالة التحقق</p>
                    <Badge variant="outline" className={getVerificationColor(item.verificationStatus)} size="sm">
                      {item.verificationStatus}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">التقدم</span>
                  <span className="text-white text-sm font-semibold">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>

              <Tabs defaultValue="response" className="w-full">
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger value="response" className="data-[state=active]:bg-indigo-600">
                    رد الإدارة
                  </TabsTrigger>
                  {item.implementationPlan && (
                    <TabsTrigger value="plan" className="data-[state=active]:bg-indigo-600">
                      خطة التنفيذ
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="updates" className="data-[state=active]:bg-indigo-600">
                    التحديثات ({item.updates.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="response" className="mt-4">
                  {item.managementResponse ? (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400 text-sm">{item.responsiblePerson}</span>
                        <span className="text-slate-500 text-xs">•</span>
                        <span className="text-slate-400 text-xs">{item.responseDate}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{item.managementResponse}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                      <p className="text-slate-400 text-sm">لم يتم استلام رد من الإدارة بعد</p>
                    </div>
                  )}
                </TabsContent>

                {item.implementationPlan && (
                  <TabsContent value="plan" className="mt-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
                        {item.implementationPlan}
                      </pre>
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="updates" className="mt-4">
                  <div className="space-y-3">
                    {item.updates.map((update, idx) => (
                      <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-sm">{update.author}</span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="text-slate-400 text-xs">{update.date}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{update.comment}</p>
                      </div>
                    ))}
                    {item.updates.length === 0 && (
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                        <p className="text-slate-400 text-sm">لا توجد تحديثات</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() => {
                    setSelectedItem(item)
                    setIsResponseDialogOpen(true)
                  }}
                >
                  <MessageSquare className="h-4 w-4 ml-1" />
                  إضافة تحديث
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Eye className="h-4 w-4 ml-1" />
                  عرض التفاصيل
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Edit className="h-4 w-4 ml-1" />
                  تحديث الحالة
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center py-12">
            <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد متابعات</h3>
            <p className="text-slate-400">لم يتم العثور على متابعات تطابق معايير البحث</p>
          </CardContent>
        </Card>
      )}

      {/* Add Update Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة تحديث للمتابعة</DialogTitle>
            <DialogDescription className="text-slate-400">{selectedItem?.finding}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>التحديث</Label>
              <Textarea
                className="bg-slate-800 border-slate-700 text-white min-h-32"
                placeholder="أدخل تفاصيل التحديث..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نسبة الإنجاز</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="0-100"
                />
              </div>

              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="overdue">متأخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 bg-transparent"
                onClick={() => setIsResponseDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Send className="h-4 w-4 ml-2" />
                إرسال التحديث
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
