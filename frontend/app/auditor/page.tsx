// ═══════════════════════════════════════════════════════════════════════════
// 📄 ملف التصدير الكامل - صفحة مساحة المدقق
// ═══════════════════════════════════════════════════════════════════════════
//
// هذا الملف يحتوي على الكود الكامل لصفحة مساحة المدقق
// يمكنك نسخ هذا الملف بالكامل إلى التطبيق الفعلي
//
// المسار المقترح: app/auditor/page.tsx
//
// ═══════════════════════════════════════════════════════════════════════════

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Eye,
  CheckCircle,
  Clock,
  TrendingUp,
  Scale,
  Home,
  Target,
  FolderOpen,
  Download,
  CheckSquare,
  FileCheck,
  Search,
  Loader2,
  Save,
  ArrowRight,
  FileOutput,
  Printer,
  Mail,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"

export default function AuditorPage() {
  const router = useRouter()
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
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      title: "التحقق من صلاحية طلب الشراء",
      items: [
        { id: "1-1", text: "التوقيعات المطلوبة متوفرة", checked: true },
        { id: "1-2", text: "التاريخ صحيح ومنطقي", checked: true },
        { id: "1-3", text: "المبلغ محدد بوضوح", checked: true },
      ],
      completed: true,
    },
    {
      id: 2,
      title: "التحقق من عملية المناقصة",
      items: [
        { id: "2-1", text: "تم الحصول على 3 عروض أسعار على الأقل", checked: false },
        { id: "2-2", text: "معايير التقييم واضحة", checked: false },
        { id: "2-3", text: "قرار اللجنة موثق", checked: false },
      ],
      completed: false,
    },
    {
      id: 3,
      title: "مراجعة العقد والشروط",
      items: [
        { id: "3-1", text: "العقد موقع من الطرفين", checked: false },
        { id: "3-2", text: "الشروط واضحة", checked: false },
        { id: "3-3", text: "مدة التسليم محددة", checked: false },
      ],
      completed: false,
    },
    {
      id: 4,
      title: "التحقق من استلام البضاعة",
      items: [
        { id: "4-1", text: "محضر استلام موقع", checked: false },
        { id: "4-2", text: "المواصفات مطابقة", checked: false },
      ],
      completed: false,
    },
  ])

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
    setReportTitle(`تقرير مراجعة عملية شراء أجهزة حاسوب - ${selectedTask?.department || ""}`)
    setReportNotes(
      "تمت مراجعة عملية الشراء بالكامل ووجد أنها متوافقة مع قانون المناقصات رقم 24 لسنة 2015. جميع الإجراءات تمت بشكل نظامي وسليم. التوصية: الموافقة على العملية.",
    )
    setActiveView("report-generation")
  }

  const handleChecklistItemToggle = (sectionId: number, itemId: string) => {
    setChecklistItems((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          const updatedItems = section.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item,
          )
          const allChecked = updatedItems.every((item) => item.checked)
          return { ...section, items: updatedItems, completed: allChecked }
        }
        return section
      }),
    )

    // Update progress
    const totalItems = checklistItems.reduce((acc, section) => acc + section.items.length, 0)
    const checkedItems = checklistItems.reduce(
      (acc, section) => acc + section.items.filter((item) => item.checked).length,
      0,
    )
    setChecklistProgress(Math.round((checkedItems / totalItems) * 100))
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

  return (
    <div className="min-h-screen bg-slate-950" dir="rtl">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <DynamicBreadcrumbs className="mb-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">مساحة المدقق</h1>
                  <p className="text-slate-400 text-sm">إدارة المهام التدقيقية والمطابقة القانونية الذكية</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <div>
                  <p className="text-white font-medium text-sm">أحمد المهندي</p>
                  <p className="text-slate-400 text-xs">مدقق داخلي</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <Home className="h-4 w-4 ml-2" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Tasks List View */}
        {activeView === "tasks" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
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

              <Card className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
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

              <Card className="bg-slate-900 border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
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

              <Card className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
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

            {/* Assigned Tasks */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Target className="h-6 w-6 text-indigo-400" />
                  المهام المعينة لك
                </CardTitle>
                <CardDescription className="text-slate-400">المهام التدقيقية المطلوب إنجازها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {assignedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-xl hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedTask(task)
                        setActiveView("task-details")
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
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
                            <span className="text-slate-400 text-sm font-mono">#{task.id}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-slate-400 text-sm mb-4 flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            {task.department}
                          </p>
                        </div>
                        <Badge
                          variant={task.priority === "عالية" ? "destructive" : "secondary"}
                          className={
                            task.priority === "عالية"
                              ? "shadow-lg shadow-red-500/20"
                              : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">القيمة</p>
                          <p className="text-white font-bold">{task.value}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">الاستحقاق</p>
                          <p className="text-white font-bold">{task.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">المستندات</p>
                          <p className="text-white font-bold">{task.documents} ملفات</p>
                        </div>
                        {task.supplier && (
                          <div className="col-span-2">
                            <p className="text-slate-400 text-xs mb-1">المورد</p>
                            <p className="text-white font-semibold text-sm">{task.supplier}</p>
                          </div>
                        )}
                      </div>

                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                        <Eye className="h-4 w-4 ml-2" />
                        عرض التفاصيل والبدء
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Task Details View */}
        {activeView === "task-details" && selectedTask && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setActiveView("tasks")}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للمهام
            </Button>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl mb-2">{selectedTask.title}</CardTitle>
                    <CardDescription className="text-slate-400 flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      {selectedTask.department}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={selectedTask.priority === "عالية" ? "destructive" : "secondary"}
                    className={
                      selectedTask.priority === "عالية"
                        ? "shadow-lg shadow-red-500/20"
                        : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                    }
                  >
                    {selectedTask.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm mb-1">رقم المشروع</p>
                    <p className="text-white font-bold">{selectedTask.id}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm mb-1">القيمة</p>
                    <p className="text-white font-bold">{selectedTask.value}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm mb-1">تاريخ الاستحقاق</p>
                    <p className="text-white font-bold">{selectedTask.dueDate}</p>
                  </div>
                  {selectedTask.purchaseDate && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <p className="text-slate-400 text-sm mb-1">تاريخ الشراء</p>
                      <p className="text-white font-bold">{selectedTask.purchaseDate}</p>
                    </div>
                  )}
                  {selectedTask.supplier && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 md:col-span-2">
                      <p className="text-slate-400 text-sm mb-1">المورد</p>
                      <p className="text-white font-bold">{selectedTask.supplier}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    المستندات المرفقة ({documents.length} ملفات)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/50 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSelectedDocument(doc)
                          setActiveView("document-review")
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="h-5 w-5 text-indigo-400" />
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-white font-medium text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-slate-400 text-xs">{doc.size}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setActiveView("checklist")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20"
                >
                  <CheckSquare className="h-5 w-5 ml-2" />
                  بدء المراجعة
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Checklist View */}
        {activeView === "checklist" && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setActiveView("task-details")}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة لتفاصيل المهمة
            </Button>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <CheckSquare className="h-6 w-6 text-indigo-400" />
                  قائمة فحص عملية الشراء
                </CardTitle>
                <CardDescription className="text-slate-400">تقدم المراجعة: {checklistProgress}%</CardDescription>
                <Progress value={checklistProgress} className="h-3 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {checklistItems.map((section, idx) => (
                    <div key={section.id} className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 bg-indigo-500/20 rounded-full text-indigo-400 font-bold">
                            {idx + 1}
                          </span>
                          {section.title}
                        </h3>
                        {section.completed && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            مكتمل
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-3">
                        {section.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-indigo-500/30 transition-colors"
                          >
                            <Checkbox
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={() => handleChecklistItemToggle(section.id, item.id)}
                              className="border-slate-600"
                            />
                            <label
                              htmlFor={item.id}
                              className={`flex-1 text-sm cursor-pointer ${
                                item.checked ? "text-slate-400 line-through" : "text-white"
                              }`}
                            >
                              {item.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => setActiveView("compliance")}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20"
                  >
                    <Scale className="h-5 w-5 ml-2" />
                    المطابقة القانونية الذكية
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Review View */}
        {activeView === "document-review" && selectedDocument && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setActiveView("task-details")}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة لتفاصيل المهمة
            </Button>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <FileCheck className="h-6 w-6 text-indigo-400" />
                  فحص: {selectedDocument.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-8 bg-slate-800/50 border border-slate-700 rounded-lg min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">معاينة المستند</p>
                    <p className="text-slate-500 text-sm mt-2">{selectedDocument.name}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="review-notes" className="text-white mb-2 block">
                    ملاحظات المراجع
                  </Label>
                  <Textarea
                    id="review-notes"
                    placeholder="أدخل ملاحظاتك هنا..."
                    className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setActiveView("checklist")}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                  >
                    <CheckCircle className="h-5 w-5 ml-2" />
                    تم الفحص - التالي
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-transparent"
                  >
                    تسجيل ملاحظة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legal Compliance Matching View */}
        {activeView === "compliance" && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setActiveView("checklist")}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة لقائمة الفحص
            </Button>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Scale className="h-6 w-6 text-indigo-400" />
                  المطابقة القانونية الذكية - AI Powered
                </CardTitle>
                <CardDescription className="text-slate-400">
                  هذه الأداة تستخدم الذكاء الاصطناعي لمطابقة نصوص المستندات مع القوانين واللوائح القطرية تلقائياً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="compliance-text" className="text-white mb-2 block">
                      النص المراد مطابقته
                    </Label>
                    <Textarea
                      id="compliance-text"
                      value={complianceText}
                      onChange={(e) => setComplianceText(e.target.value)}
                      placeholder="اكتب أو الصق النص هنا... مثال: تم شراء أجهزة حاسوب بقيمة 500,000 ريال عن طريق مناقصة محدودة شارك فيها 3 موردين"
                      className="bg-slate-800 border-slate-700 text-white min-h-[150px]"
                    />
                    <p className="text-slate-500 text-sm mt-2">{complianceText.length} / 10,000 حرف</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="results-count" className="text-white mb-2 block">
                        عدد النتائج
                      </Label>
                      <Input
                        id="results-count"
                        type="number"
                        defaultValue={5}
                        min={1}
                        max={20}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-accuracy" className="text-white mb-2 block">
                        الحد الأدنى للدقة
                      </Label>
                      <Input
                        id="min-accuracy"
                        type="number"
                        defaultValue={70}
                        min={50}
                        max={100}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSearchCompliance}
                    disabled={isSearching || !complianceText}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                        جاري البحث...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 ml-2" />
                        بحث عن المطابقات القانونية
                      </>
                    )}
                  </Button>

                  {complianceResults.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold text-lg">النتائج ({complianceResults.length})</h3>
                        <p className="text-slate-400 text-sm">وقت البحث: 487 ms</p>
                      </div>

                      {complianceResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{getSimilarityIcon(result.level)}</span>
                                <h4 className="text-white font-semibold">{result.law}</h4>
                              </div>
                              <p className="text-indigo-400 text-sm mb-3">{result.article}</p>
                            </div>
                            <Badge className={getSimilarityColor(result.level)}>
                              {getSimilarityLabel(result.level)} {result.similarity}%
                            </Badge>
                          </div>

                          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 mb-4">
                            <p className="text-slate-300 text-sm leading-relaxed">{result.excerpt}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                            >
                              عرض المادة كاملة
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveMatch(result.id)}
                              className={
                                savedMatches.includes(result.id)
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                              }
                            >
                              <Save className="h-4 w-4 ml-1" />
                              {savedMatches.includes(result.id) ? "تم الحفظ" : "حفظ كدليل تدقيق"}
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={handleGenerateReport}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                        >
                          <FileOutput className="h-5 w-5 ml-2" />
                          توليد تقرير
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                        >
                          حفظ جميع النتائج
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Generation View */}
        {activeView === "report-generation" && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setActiveView("compliance")}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للمطابقة القانونية
            </Button>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <FileOutput className="h-6 w-6 text-indigo-400" />
                  توليد تقرير المراجعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-white mb-3 block">اختر نوع التقرير</Label>
                    <RadioGroup value={reportType} onValueChange={setReportType}>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/30 transition-colors cursor-pointer">
                          <RadioGroupItem value="summary" id="summary" />
                          <Label htmlFor="summary" className="text-white cursor-pointer flex-1">
                            تقرير مختصر (ملخص النتائج فقط)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/30 transition-colors cursor-pointer">
                          <RadioGroupItem value="detailed" id="detailed" />
                          <Label htmlFor="detailed" className="text-white cursor-pointer flex-1">
                            تقرير مفصل (مع جميع الأدلة والمطابقات)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/30 transition-colors cursor-pointer">
                          <RadioGroupItem value="comprehensive" id="comprehensive" />
                          <Label htmlFor="comprehensive" className="text-white cursor-pointer flex-1">
                            تقرير شامل (مع الصور والمرفقات)
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-white mb-3 block">صيغة التقرير</Label>
                    <RadioGroup value={reportFormat} onValueChange={setReportFormat}>
                      <div className="flex gap-3">
                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/30 transition-colors cursor-pointer flex-1">
                          <RadioGroupItem value="pdf" id="pdf" />
                          <Label htmlFor="pdf" className="text-white cursor-pointer">
                            PDF
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/30 transition-colors cursor-pointer flex-1">
                          <RadioGroupItem value="word" id="word" />
                          <Label htmlFor="word" className="text-white cursor-pointer">
                            Word
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/30 transition-colors cursor-pointer flex-1">
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
                      عنوان التقرير
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
                      ملاحظات ختامية (اختياري)
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
                      onClick={() => setActiveView("report-preview")}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                      <FileOutput className="h-5 w-5 ml-2" />
                      توليد التقرير الآن
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveView("compliance")}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Preview View */}
        {activeView === "report-preview" && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setActiveView("report-generation")}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة لإعدادات التقرير
            </Button>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Eye className="h-6 w-6 text-indigo-400" />
                  معاينة التقرير
                </CardTitle>
                <CardDescription className="text-slate-400">
                  تقرير_مراجعة_{selectedTask?.id}.{reportFormat}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 bg-white text-slate-900 rounded-lg min-h-[600px] mb-6">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Scale className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-3xl font-bold">نظام AuditOrbit للتدقيق الداخلي</h1>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{reportTitle}</h2>
                    <div className="h-1 w-32 bg-gradient-to-r from-indigo-600 to-cyan-600 mx-auto rounded-full" />
                  </div>

                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-xl font-bold mb-3">معلومات المراجعة</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">رقم المهمة:</span> {selectedTask?.id}
                        </div>
                        <div>
                          <span className="font-semibold">المراجع:</span> أحمد المهندي
                        </div>
                        <div>
                          <span className="font-semibold">تاريخ المراجعة:</span> 28 أكتوبر 2025
                        </div>
                        <div>
                          <span className="font-semibold">حالة المراجعة:</span> مكتملة ✓
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-xl font-bold mb-3">ملخص تنفيذي</h3>
                      <p className="text-sm leading-relaxed">
                        تمت مراجعة عملية شراء 100 جهاز حاسوب بقيمة 500,000 ريال قطري من شركة التقنية المتقدمة. العملية
                        تمت وفق قانون المناقصات رقم (24) لسنة 2015، وجميع الإجراءات المتبعة سليمة ونظامية.
                      </p>
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="font-bold text-emerald-700">النتيجة: الموافقة على العملية</p>
                      </div>
                    </div>

                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-xl font-bold mb-3">نتائج الفحص</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="font-semibold">صلاحية طلب الشراء: متوافق</p>
                            <p className="text-slate-600">التوقيعات: 3/3 ✓ | التاريخ: صحيح ✓ | المبلغ: محدد بوضوح ✓</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="font-semibold">عملية المناقصة: متوافق</p>
                            <p className="text-slate-600">
                              عدد العروض: 3 عروض ✓ | معايير التقييم: واضحة ✓ | قرار اللجنة: موثق ✓
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-xl font-bold mb-3">المطابقات القانونية (بواسطة AI)</h3>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="font-semibold text-emerald-700">🟢 قانون رقم (24) لسنة 2015 - المادة 12</p>
                          <p className="text-slate-600 mt-1">درجة المطابقة: 92.3% (مطابقة قوية)</p>
                          <p className="text-slate-600">الموضوع: المناقصات المحدودة</p>
                          <p className="text-slate-600">الحكم: العملية متطابقة مع متطلبات القانون</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3">التوصيات</h3>
                      <p className="text-sm leading-relaxed">{reportNotes}</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-200">
                      <p className="text-sm">
                        <span className="font-semibold">التوقيع:</span> أحمد المهندي - مدقق داخلي
                      </p>
                      <p className="text-sm text-slate-600">28 أكتوبر 2025</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white">
                    <Download className="h-5 w-5 ml-2" />
                    تحميل {reportFormat.toUpperCase()}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                  >
                    <Mail className="h-5 w-5 ml-2" />
                    إرسال
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                  >
                    <Printer className="h-5 w-5 ml-2" />
                    طباعة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveView("tasks")}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إغلاق
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
