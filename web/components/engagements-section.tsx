"use client"

import { useState } from "react"
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Engagement {
  id: number
  title: string
  description: string
  department: string
  status: "planning" | "fieldwork" | "reporting" | "follow-up" | "completed"
  priority: "critical" | "high" | "medium" | "low"
  progress: number
  startDate: string
  endDate: string
  assignedAuditors: string[]
  objectives: string[]
  scope: string
  criteria: string
  estimatedHours: number
  actualHours: number
  riskLevel: "high" | "medium" | "low"
}

export function EngagementsSection() {
  const [engagements, setEngagements] = useState<Engagement[]>([
    {
      id: 1,
      title: "تدقيق نظام المشتريات",
      description: "مراجعة شاملة لعمليات المشتريات والضوابط الداخلية",
      department: "المشتريات",
      status: "fieldwork",
      priority: "high",
      progress: 65,
      startDate: "2025-01-15",
      endDate: "2025-02-15",
      assignedAuditors: ["أحمد محمد", "سارة علي"],
      objectives: ["تقييم فعالية ضوابط المشتريات", "التحقق من الامتثال للسياسات", "تقييم كفاءة العمليات"],
      scope: "جميع عمليات المشتريات للربع الأخير من 2024",
      criteria: "سياسات المشتريات الداخلية، معايير ISO 9001",
      estimatedHours: 120,
      actualHours: 78,
      riskLevel: "high",
    },
    {
      id: 2,
      title: "مراجعة الضوابط المالية",
      description: "تدقيق الضوابط المالية والمحاسبية",
      department: "المالية",
      status: "planning",
      priority: "medium",
      progress: 30,
      startDate: "2025-02-01",
      endDate: "2025-03-01",
      assignedAuditors: ["محمد خالد"],
      objectives: ["تقييم الضوابط المالية", "مراجعة التقارير المالية"],
      scope: "العمليات المالية للسنة المالية 2024",
      criteria: "المعايير المحاسبية الدولية، السياسات المالية الداخلية",
      estimatedHours: 100,
      actualHours: 30,
      riskLevel: "high",
    },
    {
      id: 3,
      title: "تدقيق أمن المعلومات",
      description: "تقييم أمن البنية التحتية لتقنية المعلومات",
      department: "تقنية المعلومات",
      status: "reporting",
      priority: "critical",
      progress: 90,
      startDate: "2025-01-01",
      endDate: "2025-01-30",
      assignedAuditors: ["فاطمة حسن", "عمر يوسف"],
      objectives: ["تقييم الضوابط الأمنية", "اختبار الاختراق", "مراجعة السياسات"],
      scope: "جميع أنظمة تقنية المعلومات والشبكات",
      criteria: "ISO 27001، NIST Cybersecurity Framework",
      estimatedHours: 150,
      actualHours: 135,
      riskLevel: "high",
    },
  ])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    priority: "medium",
    startDate: "",
    endDate: "",
    estimatedHours: "",
    objectives: "",
    scope: "",
    criteria: "",
  })

  const handleCreateEngagement = () => {
    const newEngagement: Engagement = {
      id: engagements.length + 1,
      title: formData.title,
      description: formData.description,
      department: formData.department,
      status: "planning",
      priority: formData.priority as "critical" | "high" | "medium" | "low",
      progress: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      assignedAuditors: [],
      objectives: formData.objectives.split("\n").filter((o) => o.trim()),
      scope: formData.scope,
      criteria: formData.criteria,
      estimatedHours: Number.parseInt(formData.estimatedHours),
      actualHours: 0,
      riskLevel: "medium",
    }
    setEngagements([newEngagement, ...engagements])
    setShowCreateDialog(false)
    setFormData({
      title: "",
      description: "",
      department: "",
      priority: "medium",
      startDate: "",
      endDate: "",
      estimatedHours: "",
      objectives: "",
      scope: "",
      criteria: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      case "fieldwork":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
      case "reporting":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "follow-up":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planning":
        return "التخطيط"
      case "fieldwork":
        return "العمل الميداني"
      case "reporting":
        return "إعداد التقرير"
      case "follow-up":
        return "المتابعة"
      case "completed":
        return "مكتمل"
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical":
        return "حرج"
      case "high":
        return "عالي"
      case "medium":
        return "متوسط"
      case "low":
        return "منخفض"
      default:
        return priority
    }
  }

  const statusCounts = {
    planning: engagements.filter((e) => e.status === "planning").length,
    fieldwork: engagements.filter((e) => e.status === "fieldwork").length,
    reporting: engagements.filter((e) => e.status === "reporting").length,
    followUp: engagements.filter((e) => e.status === "follow-up").length,
    completed: engagements.filter((e) => e.status === "completed").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">المهام التدقيقية</h3>
          <p className="text-slate-400 mt-1">إدارة دورة حياة المهام التدقيقية الكاملة</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
        >
          <Plus className="h-4 w-4 ml-2" />
          مهمة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">التخطيط</p>
                <p className="text-3xl font-bold text-cyan-400">{statusCounts.planning}</p>
              </div>
              <Target className="h-10 w-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">العمل الميداني</p>
                <p className="text-3xl font-bold text-indigo-400">{statusCounts.fieldwork}</p>
              </div>
              <FileText className="h-10 w-10 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">إعداد التقرير</p>
                <p className="text-3xl font-bold text-orange-400">{statusCounts.reporting}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">المتابعة</p>
                <p className="text-3xl font-bold text-yellow-400">{statusCounts.followUp}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">مكتمل</p>
                <p className="text-3xl font-bold text-emerald-400">{statusCounts.completed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagements List */}
      <div className="space-y-4">
        {engagements.map((engagement) => (
          <Card
            key={engagement.id}
            className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-semibold text-white">{engagement.title}</h4>
                    <Badge className={getStatusColor(engagement.status)}>{getStatusLabel(engagement.status)}</Badge>
                    <Badge
                      variant={getPriorityColor(engagement.priority)}
                      className={
                        engagement.priority === "high"
                          ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                          : engagement.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            : ""
                      }
                    >
                      {getPriorityLabel(engagement.priority)}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{engagement.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{engagement.department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{engagement.assignedAuditors.length} مدقق</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {engagement.startDate} - {engagement.endDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEngagement(engagement)
                      setShowViewDialog(true)
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">الساعات</p>
                  <p className="text-lg font-semibold text-white">
                    {engagement.actualHours} / {engagement.estimatedHours}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">مستوى المخاطر</p>
                  <Badge
                    variant={engagement.riskLevel === "high" ? "destructive" : "secondary"}
                    className={
                      engagement.riskLevel === "medium"
                        ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                        : engagement.riskLevel === "low"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : ""
                    }
                  >
                    {engagement.riskLevel === "high" ? "عالي" : engagement.riskLevel === "medium" ? "متوسط" : "منخفض"}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">الأهداف</p>
                  <p className="text-lg font-semibold text-white">{engagement.objectives.length}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">التقدم</span>
                  <span className="text-white font-medium">{engagement.progress}%</span>
                </div>
                <Progress value={engagement.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Engagement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">إنشاء مهمة تدقيقية جديدة</DialogTitle>
            <DialogDescription className="text-slate-400">
              أدخل تفاصيل المهمة التدقيقية وفقاً لمعايير IIA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">
                عنوان المهمة
              </Label>
              <Input
                id="title"
                placeholder="تدقيق نظام المشتريات"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                الوصف
              </Label>
              <Textarea
                id="description"
                placeholder="وصف شامل للمهمة التدقيقية..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-slate-300">
                  الإدارة
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="اختر الإدارة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="المالية">المالية</SelectItem>
                    <SelectItem value="المشتريات">المشتريات</SelectItem>
                    <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                    <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                    <SelectItem value="العمليات">العمليات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-slate-300">
                  الأولوية
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="critical">حرج</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-slate-300">
                  تاريخ البدء
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-slate-300">
                  تاريخ الانتهاء
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedHours" className="text-slate-300">
                  الساعات المقدرة
                </Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  placeholder="120"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objectives" className="text-slate-300">
                الأهداف (سطر لكل هدف)
              </Label>
              <Textarea
                id="objectives"
                placeholder="تقييم فعالية الضوابط&#10;التحقق من الامتثال للسياسات&#10;تقييم كفاءة العمليات"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope" className="text-slate-300">
                النطاق
              </Label>
              <Textarea
                id="scope"
                placeholder="جميع عمليات المشتريات للربع الأخير من 2024"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criteria" className="text-slate-300">
                المعايير
              </Label>
              <Textarea
                id="criteria"
                placeholder="سياسات المشتريات الداخلية، معايير ISO 9001"
                value={formData.criteria}
                onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-20"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleCreateEngagement}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
            >
              إنشاء المهمة
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Engagement Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEngagement?.title}</DialogTitle>
            <DialogDescription className="text-slate-400">{selectedEngagement?.description}</DialogDescription>
          </DialogHeader>
          {selectedEngagement && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="planning">التخطيط</TabsTrigger>
                <TabsTrigger value="team">الفريق</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-400 mb-1">الحالة</p>
                      <Badge className={getStatusColor(selectedEngagement.status)}>
                        {getStatusLabel(selectedEngagement.status)}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-400 mb-1">الأولوية</p>
                      <Badge
                        variant={getPriorityColor(selectedEngagement.priority)}
                        className={
                          selectedEngagement.priority === "high"
                            ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                            : selectedEngagement.priority === "medium"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : ""
                        }
                      >
                        {getPriorityLabel(selectedEngagement.priority)}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">التقدم</p>
                  <Progress value={selectedEngagement.progress} className="h-3" />
                  <p className="text-right text-sm text-white font-medium">{selectedEngagement.progress}%</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">الساعات المستخدمة</p>
                    <p className="text-xl font-semibold text-white">
                      {selectedEngagement.actualHours} / {selectedEngagement.estimatedHours}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">مستوى المخاطر</p>
                    <Badge
                      variant={selectedEngagement.riskLevel === "high" ? "destructive" : "secondary"}
                      className={
                        selectedEngagement.riskLevel === "medium"
                          ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                          : selectedEngagement.riskLevel === "low"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : ""
                      }
                    >
                      {selectedEngagement.riskLevel === "high"
                        ? "عالي"
                        : selectedEngagement.riskLevel === "medium"
                          ? "متوسط"
                          : "منخفض"}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="planning" className="space-y-4 mt-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">الأهداف</h4>
                  <ul className="space-y-2">
                    {selectedEngagement.objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <Target className="h-4 w-4 text-indigo-400 mt-1 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">النطاق</h4>
                  <p className="text-slate-300">{selectedEngagement.scope}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">المعايير</h4>
                  <p className="text-slate-300">{selectedEngagement.criteria}</p>
                </div>
              </TabsContent>
              <TabsContent value="team" className="space-y-4 mt-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">المدققون المعينون</h4>
                  <div className="space-y-2">
                    {selectedEngagement.assignedAuditors.map((auditor, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {auditor.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{auditor}</p>
                          <p className="text-sm text-slate-400">مدقق داخلي</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
