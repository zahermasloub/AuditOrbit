"use client"

import { useState } from "react"
import {
  FileText,
  CheckSquare,
  Upload,
  Download,
  Eye,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  Search,
  Save,
  FileDown,
  Printer,
  Mail,
  X,
  Check,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

export function AuditorWorkspace() {
  const [activeView, setActiveView] = useState<
    "tasks" | "task-details" | "checklist" | "document-review" | "compliance" | "report-generation" | "report-preview"
  >("tasks")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [complianceText, setComplianceText] = useState("")
  const [complianceResults, setComplianceResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [checklistProgress, setChecklistProgress] = useState(25)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [reportType, setReportType] = useState("detailed")
  const [reportFormat, setReportFormat] = useState("pdf")
  const [reportTitle, setReportTitle] = useState("")
  const [reportNotes, setReportNotes] = useState("")
  const [savedMatches, setSavedMatches] = useState<number[]>([])
  const [resultLimit, setResultLimit] = useState(5)
  const [minAccuracy, setMinAccuracy] = useState(70)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const assignedTasks = [
    {
      id: "ENG-2025-089",
      title: "مراجعة عملية شراء أجهزة حاسوب",
      department: "وزارة التعليم والتعليم العالي",
      value: "500,000 ر.ق",
      status: "جديدة",
      priority: "عالية",
      dueDate: "2025-11-05",
      documents: 5,
      supplier: "شركة التقنية المتقدمة للحواسيب",
      purchaseDate: "2025-09-15",
    },
    {
      id: "ENG-2025-090",
      title: "تدقيق عملية تعيين موظف جديد",
      department: "الموارد البشرية",
      value: "15,000 ر.ق/شهر",
      status: "جاري التنفيذ",
      priority: "متوسطة",
      dueDate: "2025-11-10",
      documents: 8,
    },
  ]

  const documents = [
    { id: 1, name: "طلب الشراء.pdf", size: "2.4 MB", type: "pdf" },
    { id: 2, name: "عروض الأسعار.pdf", size: "3.1 MB", type: "pdf" },
    { id: 3, name: "قرار لجنة الشراء.pdf", size: "1.8 MB", type: "pdf" },
    { id: 4, name: "العقد.pdf", size: "2.9 MB", type: "pdf" },
    { id: 5, name: "فاتورة الاستلام.pdf", size: "1.2 MB", type: "pdf" },
  ]

  const checklistItems = [
    {
      id: 1,
      title: "التحقق من صلاحية طلب الشراء",
      items: [
        { id: "1-1", text: "التوقيعات المطلوبة متوفرة", checked: false },
        { id: "1-2", text: "التاريخ صحيح ومنطقي", checked: false },
        { id: "1-3", text: "المبلغ محدد بوضوح", checked: false },
      ],
    },
    {
      id: 2,
      title: "التحقق من عملية المناقصة",
      items: [
        { id: "2-1", text: "تم الحصول على 3 عروض أسعار على الأقل", checked: false },
        { id: "2-2", text: "معايير التقييم واضحة", checked: false },
        { id: "2-3", text: "قرار اللجنة موثق", checked: false },
      ],
    },
    {
      id: 3,
      title: "مراجعة العقد والشروط",
      items: [
        { id: "3-1", text: "العقد موقع من الطرفين", checked: false },
        { id: "3-2", text: "الشروط واضحة", checked: false },
        { id: "3-3", text: "مدة التسليم محددة", checked: false },
      ],
    },
    {
      id: 4,
      title: "التحقق من استلام البضاعة",
      items: [
        { id: "4-1", text: "محضر استلام موقع", checked: false },
        { id: "4-2", text: "المواصفات مطابقة", checked: false },
      ],
    },
    {
      id: 5,
      title: "المطابقة القانونية",
      items: [
        { id: "5-1", text: "مطابقة مع قانون المناقصات", checked: false },
        { id: "5-2", text: "مطابقة مع لائحة المشتريات", checked: false },
      ],
    },
  ]

  const mockComplianceResults = [
    {
      id: 1,
      law: "قانون رقم (24) لسنة 2015 بشأن المناقصات",
      article: "المادة (12) - المناقصات المحدودة",
      similarity: 92.3,
      level: "strong",
      excerpt:
        "يجوز للجهة الحكومية اللجوء إلى المناقصة المحدودة عندما يكون عدد الموردين المختصين محدوداً، على ألا يقل عددهم عن ثلاثة موردين مؤهلين. ويجب أن يتم التقييم وفقاً لمعايير واضحة ومعلنة مسبقاً...",
    },
    {
      id: 2,
      law: "قانون رقم (24) لسنة 2015 بشأن المناقصات",
      article: "المادة (28) - لجان التقييم",
      similarity: 78.5,
      level: "medium",
      excerpt:
        "تشكل الجهة الحكومية لجنة أو أكثر لدراسة وتقييم العروض المقدمة. يجب أن تضم اللجنة خبراء فنيين ومتخصصين في موضوع المناقصة...",
    },
    {
      id: 3,
      law: "قانون رقم (24) لسنة 2015 بشأن المناقصات",
      article: "المادة (35) - توقيع العقود",
      similarity: 75.2,
      level: "medium",
      excerpt:
        "يوقع العقد من قبل المسؤول المختص في الجهة الحكومية حسب الصلاحيات المحددة في القانون. يجب أن يتضمن العقد جميع الشروط والالتزامات...",
    },
    {
      id: 4,
      law: "لائحة المشتريات الحكومية التنفيذية",
      article: "المادة (8) - حدود الصلاحيات المالية",
      similarity: 72.8,
      level: "medium",
      excerpt:
        "يحدد جدول الصلاحيات المالية للمسؤولين في الجهات الحكومية. المشتريات التي تزيد قيمتها عن 500,000 ريال تتطلب موافقة وكيل الوزارة...",
    },
    {
      id: 5,
      law: "قانون رقم (8) لسنة 2022 بشأن ديوان المحاسبة",
      article: "المادة (15) - رقابة عمليات الشراء",
      similarity: 68.9,
      level: "review",
      excerpt:
        "يتولى ديوان المحاسبة الرقابة على جميع عمليات الشراء في الجهات الحكومية للتأكد من مطابقتها للقوانين واللوائح المعمول بها...",
    },
  ]

  const handleSearchCompliance = () => {
    setIsSearching(true)
    setTimeout(() => {
      setComplianceResults(mockComplianceResults)
      setIsSearching(false)
    }, 1500)
  }

  const handleSaveMatch = (matchId: number) => {
    if (savedMatches.includes(matchId)) {
      setSavedMatches(savedMatches.filter((id) => id !== matchId))
    } else {
      setSavedMatches([...savedMatches, matchId])
    }
  }

  const handleGenerateReport = () => {
    setReportTitle(`تقرير مراجعة ${selectedTask?.title || ""} - ${selectedTask?.department || ""}`)
    setReportNotes(
      "تمت مراجعة عملية الشراء بالكامل ووجد أنها متوافقة مع قانون المناقصات رقم 24 لسنة 2015. جميع الإجراءات تمت بشكل نظامي وسليم. التوصية: الموافقة على العملية.",
    )
    setActiveView("report-generation")
  }

  const getSimilarityColor = (level: string) => {
    switch (level) {
      case "strong":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
      case "review":
        return "text-slate-400 bg-slate-500/10 border-slate-500/30"
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30"
    }
  }

  const getSimilarityLabel = (level: string) => {
    switch (level) {
      case "strong":
        return "مطابقة قوية"
      case "medium":
        return "مطابقة متوسطة"
      case "review":
        return "راجع يدوياً"
      default:
        return "غير محدد"
    }
  }

  const getSimilarityIcon = (level: string) => {
    switch (level) {
      case "strong":
        return "🟢"
      case "medium":
        return "🟡"
      case "review":
        return "⚪"
      default:
        return "⚪"
    }
  }

  const toggleChecklistItem = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))

    const totalItems = checklistItems.reduce((sum, section) => sum + section.items.length, 0)
    const checkedCount = Object.values({ ...checkedItems, [itemId]: !checkedItems[itemId] }).filter(Boolean).length
    setChecklistProgress(Math.round((checkedCount / totalItems) * 100))
  }

  return (
    <div className="space-y-6">
      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">المهام المعينة</p>
                <p className="text-3xl font-bold text-white">12</p>
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
                <p className="text-slate-400 text-sm mb-1">المهام النشطة</p>
                <p className="text-3xl font-bold text-white">8</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <Clock className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">المهام المنتهية</p>
                <p className="text-3xl font-bold text-white">4</p>
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
                <p className="text-slate-400 text-sm mb-1">معدل الإنجاز</p>
                <p className="text-3xl font-bold text-white">87%</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <TrendingUp className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List View */}
      {activeView === "tasks" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              المهام المعينة لك
            </CardTitle>
            <CardDescription className="text-slate-400">المهام التدقيقية المطلوب إنجازها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/50 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task)
                    setActiveView("task-details")
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={task.status === "جديدة" ? "default" : "secondary"}
                          className={
                            task.status === "جديدة"
                              ? "bg-red-500/20 text-red-300 border-red-500/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          }
                        >
                          {task.status}
                        </Badge>
                        <span className="text-slate-400 text-sm">#{task.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                      <p className="text-slate-400 text-sm mb-3">{task.department}</p>
                    </div>
                    <Badge
                      variant={task.priority === "عالية" ? "destructive" : "secondary"}
                      className={
                        task.priority === "عالية" ? "" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      }
                    >
                      أولوية {task.priority}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">القيمة</p>
                      <p className="text-white font-semibold">{task.value}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">تاريخ الاستحقاق</p>
                      <p className="text-white font-semibold">{task.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">المستندات</p>
                      <p className="text-white font-semibold">{task.documents} ملفات</p>
                    </div>
                    {task.supplier && (
                      <div>
                        <p className="text-slate-400 text-xs mb-1">المورد</p>
                        <p className="text-white font-semibold text-sm">{task.supplier}</p>
                      </div>
                    )}
                  </div>

                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Eye className="h-4 w-4 ml-2" />
                    عرض التفاصيل
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Details View */}
      {activeView === "task-details" && selectedTask && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl mb-2">{selectedTask.title}</CardTitle>
                <CardDescription className="text-slate-400">رقم المشروع: {selectedTask.id}</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView("tasks")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للمهام
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">الجهة</p>
                <p className="text-white font-semibold">{selectedTask.department}</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">القيمة</p>
                <p className="text-white font-semibold">{selectedTask.value}</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">تاريخ الشراء</p>
                <p className="text-white font-semibold">{selectedTask.purchaseDate}</p>
              </div>
              {selectedTask.supplier && (
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg md:col-span-2">
                  <p className="text-slate-400 text-sm mb-1">المورد</p>
                  <p className="text-white font-semibold">{selectedTask.supplier}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                المستندات المرفقة ({documents.length} ملفات)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedDocument(doc)
                      setActiveView("document-review")
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                        <FileText className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{doc.name}</p>
                        <p className="text-slate-400 text-xs">{doc.size}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => setActiveView("checklist")}
              >
                <CheckSquare className="h-4 w-4 ml-2" />
                بدء المراجعة
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <Upload className="h-4 w-4 ml-2" />
                رفع مستند
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist View */}
      {activeView === "checklist" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  قائمة فحص عملية الشراء
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">تقدم المراجعة: {checklistProgress}%</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView("task-details")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            </div>
            <Progress value={checklistProgress} className="mt-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {checklistItems.map((section, sectionIndex) => (
                <div key={section.id} className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold">
                      {sectionIndex + 1}
                    </span>
                    {section.title}
                  </h3>
                  <div className="space-y-3 mr-10">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Checkbox
                          id={item.id}
                          checked={checkedItems[item.id] || false}
                          onCheckedChange={() => toggleChecklistItem(item.id)}
                          className="border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <label
                          htmlFor={item.id}
                          className={`text-sm cursor-pointer ${
                            checkedItems[item.id] ? "text-slate-400 line-through" : "text-white"
                          }`}
                        >
                          {item.text}
                        </label>
                      </div>
                    ))}
                  </div>
                  {section.id === 5 && (
                    <Button
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => setActiveView("compliance")}
                    >
                      <Search className="h-4 w-4 ml-2" />
                      تشغيل المطابقة الذكية
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleGenerateReport}>
                <FileDown className="h-4 w-4 ml-2" />
                توليد التقرير
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Review View */}
      {activeView === "document-review" && selectedDocument && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  فحص: {selectedDocument.name}
                </CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView("task-details")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="aspect-[8.5/11] bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">معاينة المستند</p>
                  <p className="text-slate-500 text-sm">{selectedDocument.name}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">قائمة الفحص:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">التوقيعات المطلوبة متوفرة (3/3)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">التاريخ صحيح ومنطقي</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">المبلغ محدد بوضوح</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="notes" className="text-white mb-2 block">
                ملاحظات المراجع:
              </Label>
              <Textarea
                id="notes"
                placeholder="أدخل ملاحظاتك هنا..."
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setActiveView("checklist")}
              >
                <Check className="h-4 w-4 ml-2" />
                تم الفحص - التالي
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <AlertCircle className="h-4 w-4 ml-2" />
                تسجيل ملاحظة
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal Compliance Matching View */}
      {activeView === "compliance" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  المطابقة القانونية الذكية - AI Powered
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  هذه الأداة تستخدم الذكاء الاصطناعي لمطابقة نصوص المستندات مع القوانين واللوائح القطرية تلقائياً
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView("checklist")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="compliance-text" className="text-white mb-2 block">
                  النص المراد مطابقته:
                </Label>
                <Textarea
                  id="compliance-text"
                  value={complianceText}
                  onChange={(e) => setComplianceText(e.target.value)}
                  placeholder="يمكنك نسخ أي نص من المستند هنا، أو كتابة ملخص للعملية...

مثال: اكتب 'تم شراء أجهزة حاسوب بقيمة 500,000 ريال عن طريق مناقصة محدودة شارك فيها 3 موردين'"
                  className="bg-slate-800 border-slate-700 text-white min-h-[200px]"
                />
                <p className="text-slate-400 text-sm mt-2">{complianceText.length} / 10,000 حرف</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="result-limit" className="text-white mb-2 block">
                    عدد النتائج:
                  </Label>
                  <Input
                    id="result-limit"
                    type="number"
                    value={resultLimit}
                    onChange={(e) => setResultLimit(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="min-accuracy" className="text-white mb-2 block">
                    الحد الأدنى للدقة (%):
                  </Label>
                  <Input
                    id="min-accuracy"
                    type="number"
                    value={minAccuracy}
                    onChange={(e) => setMinAccuracy(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSearchCompliance}
                disabled={isSearching || !complianceText.trim()}
              >
                {isSearching ? (
                  <>
                    <Clock className="h-4 w-4 ml-2 animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 ml-2" />
                    بحث عن المطابقات القانونية
                  </>
                )}
              </Button>

              {isSearching && (
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-center mb-4">
                    <Clock className="h-12 w-12 text-indigo-400 mx-auto mb-4 animate-spin" />
                    <p className="text-white font-semibold mb-2">جاري المطابقة القانونية...</p>
                    <p className="text-slate-400 text-sm">يرجى الانتظار...</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">تحليل النص</span>
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">توليد التضمينات (Embeddings)</span>
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">البحث في قاعدة القوانين...</span>
                      <Clock className="h-4 w-4 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm text-center mt-4">النظام يبحث في أكثر من 1000 مادة قانونية!</p>
                </div>
              )}

              {complianceResults.length > 0 && !isSearching && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-400" />
                      تم إيجاد المطابقات القانونية!
                    </h3>
                    <span className="text-slate-400 text-sm">النتائج ({complianceResults.length})</span>
                  </div>

                  {complianceResults.map((result, index) => (
                    <div key={result.id} className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getSimilarityIcon(result.level)}</span>
                            <span className="text-white font-semibold">
                              {index + 1}. {result.law}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{result.article}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSimilarityColor(result.level)}>{getSimilarityLabel(result.level)}</Badge>
                          <span className="text-white font-bold">{result.similarity}%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg mb-4">
                        <p className="text-slate-400 text-sm mb-1">الاقتباس:</p>
                        <p className="text-white text-sm leading-relaxed">{result.excerpt}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          عرض المادة كاملة
                        </Button>
                        <Button
                          size="sm"
                          variant={savedMatches.includes(result.id) ? "default" : "outline"}
                          onClick={() => handleSaveMatch(result.id)}
                          className={
                            savedMatches.includes(result.id)
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                          }
                        >
                          <Save className="h-4 w-4 ml-2" />
                          {savedMatches.includes(result.id) ? "تم الحفظ" : "حفظ كدليل تدقيق"}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleGenerateReport}
                    >
                      <FileDown className="h-4 w-4 ml-2" />
                      توليد تقرير
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
                      onClick={() => setActiveView("checklist")}
                    >
                      <ArrowLeft className="h-4 w-4 ml-2" />
                      رجوع
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Generation View */}
      {activeView === "report-generation" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  توليد تقرير المراجعة
                </CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView("compliance")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="text-white mb-3 block">اختر نوع التقرير:</Label>
                <RadioGroup value={reportType} onValueChange={setReportType}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <RadioGroupItem value="summary" id="summary" />
                      <Label htmlFor="summary" className="text-white cursor-pointer flex-1">
                        تقرير مختصر (ملخص النتائج فقط)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed" className="text-white cursor-pointer flex-1">
                        تقرير مفصل (مع جميع الأدلة والمطابقات)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <RadioGroupItem value="comprehensive" id="comprehensive" />
                      <Label htmlFor="comprehensive" className="text-white cursor-pointer flex-1">
                        تقرير شامل (مع الصور والمرفقات)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-white mb-3 block">صيغة التقرير:</Label>
                <RadioGroup value={reportFormat} onValueChange={setReportFormat}>
                  <div className="flex gap-3">
                    <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex-1">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf" className="text-white cursor-pointer">
                        PDF
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex-1">
                      <RadioGroupItem value="word" id="word" />
                      <Label htmlFor="word" className="text-white cursor-pointer">
                        Word
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex-1">
                      <RadioGroupItem value="excel" id="excel" />
                      <Label htmlFor="excel" className="text-white cursor-pointer">
                        Excel
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="report-title" className="text-white mb-2 block">
                  عنوان التقرير:
                </Label>
                <Input
                  id="report-title"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="report-notes" className="text-white mb-2 block">
                  ملاحظات ختامية (اختياري):
                </Label>
                <Textarea
                  id="report-notes"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => setActiveView("report-preview")}
                >
                  <FileDown className="h-4 w-4 ml-2" />
                  توليد التقرير الآن
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
                  onClick={() => setActiveView("compliance")}
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Preview View */}
      {activeView === "report-preview" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  معاينة التقرير
                </CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView("report-generation")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-8 bg-white text-black rounded-lg">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">نظام AuditOrbit للتدقيق الداخلي</h1>
                <h2 className="text-xl font-semibold mb-4">{reportTitle}</h2>
                <div className="border-t-2 border-b-2 border-gray-300 py-2 my-4">
                  <p className="text-sm">تقرير مراجعة تدقيقية</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">معلومات المراجعة:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>رقم المهمة: {selectedTask?.id}</li>
                  <li>المراجع: أحمد المهندي</li>
                  <li>تاريخ المراجعة: {new Date().toLocaleDateString("ar-QA")}</li>
                  <li>حالة المراجعة: مكتملة ✓</li>
                </ul>
              </div>

              <div className="border-t border-gray-300 pt-4 mb-6">
                <h3 className="font-bold mb-2">ملخص تنفيذي:</h3>
                <p className="text-sm leading-relaxed">{reportNotes}</p>
              </div>

              <div className="border-t border-gray-300 pt-4 mb-6">
                <h3 className="font-bold mb-2">نتائج الفحص:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">1. صلاحية طلب الشراء:</span>
                    <span className="text-green-600">✅ متوافق</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">2. عملية المناقصة:</span>
                    <span className="text-green-600">✅ متوافق</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">3. مراجعة العقد:</span>
                    <span className="text-green-600">✅ متوافق</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">4. استلام البضاعة:</span>
                    <span className="text-green-600">✅ متوافق</span>
                  </div>
                </div>
              </div>

              {complianceResults.length > 0 && (
                <div className="border-t border-gray-300 pt-4 mb-6">
                  <h3 className="font-bold mb-2">المطابقات القانونية (بواسطة AI):</h3>
                  <div className="space-y-3 text-sm">
                    {complianceResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="border-l-4 border-green-500 pl-3">
                        <p className="font-semibold">{result.law}</p>
                        <p className="text-gray-600">{result.article}</p>
                        <p className="text-gray-600">درجة المطابقة: {result.similarity}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-300 pt-4 mb-6">
                <h3 className="font-bold mb-2">التوصيات:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>✅ الموافقة على العملية</li>
                  <li>✅ جميع الإجراءات متطابقة مع القوانين</li>
                  <li>📌 التوصية: أرشفة المعاملة كنموذج مرجعي</li>
                </ul>
              </div>

              <div className="border-t border-gray-300 pt-4 text-sm">
                <p className="font-semibold">التوقيع:</p>
                <p>أحمد المهندي - مدقق داخلي</p>
                <p>{new Date().toLocaleDateString("ar-QA")}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Download className="h-4 w-4 ml-2" />
                تحميل PDF
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <Mail className="h-4 w-4 ml-2" />
                إرسال
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <Printer className="h-4 w-4 ml-2" />
                طباعة
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView("tasks")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4 ml-2" />
                إغلاق
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
