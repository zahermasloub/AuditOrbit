"use client"

import { useState } from "react"
import { Plus, CheckSquare, Edit, Eye, FileText, Download, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChecklistItem {
  id: number
  description: string
  status: "not-started" | "in-progress" | "completed" | "not-applicable"
  notes: string
  evidence: string[]
  assignedTo: string
}

interface Checklist {
  id: number
  title: string
  description: string
  department: string
  engagementId: number
  engagementTitle: string
  category: string
  totalItems: number
  completedItems: number
  createdDate: string
  lastUpdated: string
  items: ChecklistItem[]
}

interface WorkingPaper {
  id: number
  title: string
  description: string
  engagementId: number
  engagementTitle: string
  type: "test" | "analysis" | "interview" | "observation" | "documentation"
  preparedBy: string
  reviewedBy: string
  date: string
  status: "draft" | "under-review" | "approved"
  content: string
}

export function ChecklistsSection() {
  const [activeTab, setActiveTab] = useState("checklists")
  const [checklists, setChecklists] = useState<Checklist[]>([
    {
      id: 1,
      title: "قائمة تحقق المشتريات",
      description: "قائمة تحقق شاملة لعمليات المشتريات",
      department: "المشتريات",
      engagementId: 1,
      engagementTitle: "تدقيق نظام المشتريات",
      category: "ضوابط داخلية",
      totalItems: 15,
      completedItems: 10,
      createdDate: "2025-01-15",
      lastUpdated: "2025-01-26",
      items: [
        {
          id: 1,
          description: "التحقق من وجود سياسة مشتريات معتمدة",
          status: "completed",
          notes: "السياسة معتمدة ومحدثة في 2024",
          evidence: ["policy-doc-2024.pdf"],
          assignedTo: "أحمد محمد",
        },
        {
          id: 2,
          description: "مراجعة صلاحيات الموافقة على الطلبات",
          status: "completed",
          notes: "الصلاحيات محددة بوضوح حسب المبالغ",
          evidence: ["approval-matrix.xlsx"],
          assignedTo: "أحمد محمد",
        },
        {
          id: 3,
          description: "اختبار الفصل بين المهام",
          status: "in-progress",
          notes: "جاري اختبار عينة من المعاملات",
          evidence: [],
          assignedTo: "سارة علي",
        },
      ],
    },
    {
      id: 2,
      title: "قائمة تحقق الضوابط المالية",
      description: "مراجعة الضوابط المالية والمحاسبية",
      department: "المالية",
      engagementId: 2,
      engagementTitle: "مراجعة الضوابط المالية",
      category: "ضوابط مالية",
      totalItems: 20,
      completedItems: 6,
      createdDate: "2025-02-01",
      lastUpdated: "2025-01-26",
      items: [],
    },
  ])

  const [workingPapers, setWorkingPapers] = useState<WorkingPaper[]>([
    {
      id: 1,
      title: "اختبار عينة المشتريات",
      description: "اختبار 30 معاملة شراء للتحقق من الامتثال",
      engagementId: 1,
      engagementTitle: "تدقيق نظام المشتريات",
      type: "test",
      preparedBy: "أحمد محمد",
      reviewedBy: "مدير التدقيق",
      date: "2025-01-20",
      status: "approved",
      content: "تم اختبار 30 معاملة شراء...",
    },
    {
      id: 2,
      title: "تحليل اتجاهات المشتريات",
      description: "تحليل بيانات المشتريات للربع الأخير",
      engagementId: 1,
      engagementTitle: "تدقيق نظام المشتريات",
      type: "analysis",
      preparedBy: "سارة علي",
      reviewedBy: "",
      date: "2025-01-22",
      status: "under-review",
      content: "تحليل شامل لبيانات المشتريات...",
    },
  ])

  const [showChecklistDialog, setShowChecklistDialog] = useState(false)
  const [showWorkingPaperDialog, setShowWorkingPaperDialog] = useState(false)
  const [showViewChecklistDialog, setShowViewChecklistDialog] = useState(false)
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not-started":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      case "in-progress":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "not-applicable":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not-started":
        return "لم يبدأ"
      case "in-progress":
        return "قيد التنفيذ"
      case "completed":
        return "مكتمل"
      case "not-applicable":
        return "غير قابل للتطبيق"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-indigo-400" />
      default:
        return <Circle className="h-4 w-4 text-slate-400" />
    }
  }

  const getWorkingPaperStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      case "under-review":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "approved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return ""
    }
  }

  const getWorkingPaperStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "مسودة"
      case "under-review":
        return "قيد المراجعة"
      case "approved":
        return "معتمد"
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "test":
        return "اختبار"
      case "analysis":
        return "تحليل"
      case "interview":
        return "مقابلة"
      case "observation":
        return "ملاحظة"
      case "documentation":
        return "توثيق"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">قوائم التحقق وأوراق العمل</h3>
          <p className="text-slate-400 mt-1">إدارة قوائم التحقق وأوراق العمل التدقيقية</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowChecklistDialog(true)}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
          >
            <Plus className="h-4 w-4 ml-2" />
            قائمة تحقق جديدة
          </Button>
          <Button
            onClick={() => setShowWorkingPaperDialog(true)}
            variant="outline"
            className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 bg-transparent"
          >
            <Plus className="h-4 w-4 ml-2" />
            ورقة عمل جديدة
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="checklists" className="data-[state=active]:bg-indigo-600">
            <CheckSquare className="h-4 w-4 ml-2" />
            قوائم التحقق
          </TabsTrigger>
          <TabsTrigger value="working-papers" className="data-[state=active]:bg-indigo-600">
            <FileText className="h-4 w-4 ml-2" />
            أوراق العمل
          </TabsTrigger>
        </TabsList>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">إجمالي القوائم</p>
                    <p className="text-3xl font-bold text-white">{checklists.length}</p>
                  </div>
                  <CheckSquare className="h-10 w-10 text-indigo-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">إجمالي البنود</p>
                    <p className="text-3xl font-bold text-white">
                      {checklists.reduce((sum, c) => sum + c.totalItems, 0)}
                    </p>
                  </div>
                  <FileText className="h-10 w-10 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">البنود المكتملة</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {checklists.reduce((sum, c) => sum + c.completedItems, 0)}
                    </p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">معدل الإنجاز</p>
                    <p className="text-3xl font-bold text-white">
                      {Math.round(
                        (checklists.reduce((sum, c) => sum + c.completedItems, 0) /
                          checklists.reduce((sum, c) => sum + c.totalItems, 0)) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checklists List */}
          <div className="space-y-4">
            {checklists.map((checklist) => (
              <Card
                key={checklist.id}
                className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-semibold text-white">{checklist.title}</h4>
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                          {checklist.category}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{checklist.description}</p>
                      <p className="text-slate-500 text-xs">المهمة: {checklist.engagementTitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedChecklist(checklist)
                          setShowViewChecklistDialog(true)
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">البنود</p>
                      <p className="text-lg font-semibold text-white">
                        {checklist.completedItems} / {checklist.totalItems}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">الإدارة</p>
                      <p className="text-lg font-semibold text-white">{checklist.department}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">آخر تحديث</p>
                      <p className="text-lg font-semibold text-white">{checklist.lastUpdated}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">التقدم</span>
                      <span className="text-white font-medium">
                        {Math.round((checklist.completedItems / checklist.totalItems) * 100)}%
                      </span>
                    </div>
                    <Progress value={(checklist.completedItems / checklist.totalItems) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Working Papers Tab */}
        <TabsContent value="working-papers" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">إجمالي الأوراق</p>
                    <p className="text-3xl font-bold text-white">{workingPapers.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-indigo-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">مسودات</p>
                    <p className="text-3xl font-bold text-slate-400">
                      {workingPapers.filter((wp) => wp.status === "draft").length}
                    </p>
                  </div>
                  <Edit className="h-10 w-10 text-slate-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">قيد المراجعة</p>
                    <p className="text-3xl font-bold text-orange-400">
                      {workingPapers.filter((wp) => wp.status === "under-review").length}
                    </p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">معتمد</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {workingPapers.filter((wp) => wp.status === "approved").length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Working Papers List */}
          <div className="space-y-4">
            {workingPapers.map((paper) => (
              <Card
                key={paper.id}
                className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-semibold text-white">{paper.title}</h4>
                        <Badge className={getWorkingPaperStatusColor(paper.status)}>
                          {getWorkingPaperStatusLabel(paper.status)}
                        </Badge>
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                          {getTypeLabel(paper.type)}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{paper.description}</p>
                      <p className="text-slate-500 text-xs">المهمة: {paper.engagementTitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">أعده</p>
                      <p className="text-sm font-semibold text-white">{paper.preparedBy}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">راجعه</p>
                      <p className="text-sm font-semibold text-white">{paper.reviewedBy || "-"}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">التاريخ</p>
                      <p className="text-sm font-semibold text-white">{paper.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Checklist Dialog */}
      <Dialog open={showViewChecklistDialog} onOpenChange={setShowViewChecklistDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedChecklist?.title}</DialogTitle>
            <DialogDescription className="text-slate-400">{selectedChecklist?.description}</DialogDescription>
          </DialogHeader>
          {selectedChecklist && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">التقدم</p>
                  <Progress
                    value={(selectedChecklist.completedItems / selectedChecklist.totalItems) * 100}
                    className="h-3"
                  />
                  <p className="text-right text-sm text-white font-medium mt-1">
                    {Math.round((selectedChecklist.completedItems / selectedChecklist.totalItems) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">البنود</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedChecklist.completedItems} / {selectedChecklist.totalItems}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">بنود القائمة</h4>
                <div className="space-y-3">
                  {selectedChecklist.items.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">{item.description}</p>
                            <Badge className={getStatusColor(item.status)}>{getStatusLabel(item.status)}</Badge>
                          </div>
                          {item.notes && <p className="text-sm text-slate-400 mb-2">{item.notes}</p>}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>المسؤول: {item.assignedTo}</span>
                            {item.evidence.length > 0 && <span>الأدلة: {item.evidence.length}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
