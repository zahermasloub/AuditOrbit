"use client"

import { useState } from "react"
import { Plus, Calendar, Target, Edit, Trash2, Eye, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

interface AnnualPlan {
  id: number
  year: string
  title: string
  description: string
  status: "draft" | "approved" | "in-progress" | "completed"
  totalEngagements: number
  completedEngagements: number
  riskBasedHours: number
  actualHours: number
  approvedBy: string
  approvedDate: string
  departments: string[]
}

export function AnnualPlansSection() {
  const [plans, setPlans] = useState<AnnualPlan[]>([
    {
      id: 1,
      year: "2025",
      title: "الخطة السنوية للتدقيق الداخلي 2025",
      description: "خطة تدقيق شاملة قائمة على المخاطر تغطي جميع الإدارات الحرجة",
      status: "in-progress",
      totalEngagements: 24,
      completedEngagements: 8,
      riskBasedHours: 2400,
      actualHours: 850,
      approvedBy: "لجنة التدقيق",
      approvedDate: "2025-01-15",
      departments: ["المالية", "المشتريات", "تقنية المعلومات", "الموارد البشرية", "العمليات"],
    },
    {
      id: 2,
      year: "2024",
      title: "الخطة السنوية للتدقيق الداخلي 2024",
      description: "خطة تدقيق سنوية مع التركيز على الضوابط المالية والتشغيلية",
      status: "completed",
      totalEngagements: 20,
      completedEngagements: 20,
      riskBasedHours: 2200,
      actualHours: 2150,
      approvedBy: "لجنة التدقيق",
      approvedDate: "2024-01-10",
      departments: ["المالية", "المشتريات", "العمليات"],
    },
  ])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null)
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    description: "",
    totalEngagements: "",
    riskBasedHours: "",
  })

  const handleCreatePlan = () => {
    const newPlan: AnnualPlan = {
      id: plans.length + 1,
      year: formData.year,
      title: formData.title,
      description: formData.description,
      status: "draft",
      totalEngagements: Number.parseInt(formData.totalEngagements),
      completedEngagements: 0,
      riskBasedHours: Number.parseInt(formData.riskBasedHours),
      actualHours: 0,
      approvedBy: "",
      approvedDate: "",
      departments: [],
    }
    setPlans([newPlan, ...plans])
    setShowCreateDialog(false)
    setFormData({ year: "", title: "", description: "", totalEngagements: "", riskBasedHours: "" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      case "approved":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      case "in-progress":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "مسودة"
      case "approved":
        return "معتمد"
      case "in-progress":
        return "قيد التنفيذ"
      case "completed":
        return "مكتمل"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">الخطط السنوية للتدقيق</h3>
          <p className="text-slate-400 mt-1">إدارة الخطط السنوية القائمة على المخاطر</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
        >
          <Plus className="h-4 w-4 ml-2" />
          خطة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">إجمالي الخطط</p>
                <p className="text-3xl font-bold text-white">{plans.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">المهام المخططة</p>
                <p className="text-3xl font-bold text-white">
                  {plans.reduce((sum, plan) => sum + plan.totalEngagements, 0)}
                </p>
              </div>
              <Target className="h-10 w-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">المهام المكتملة</p>
                <p className="text-3xl font-bold text-white">
                  {plans.reduce((sum, plan) => sum + plan.completedEngagements, 0)}
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
                <p className="text-sm text-slate-400">الساعات المخططة</p>
                <p className="text-3xl font-bold text-white">
                  {plans.reduce((sum, plan) => sum + plan.riskBasedHours, 0)}
                </p>
              </div>
              <Clock className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-semibold text-white">{plan.title}</h4>
                    <Badge className={getStatusColor(plan.status)}>{getStatusLabel(plan.status)}</Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{plan.description}</p>
                  {plan.departments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.departments.map((dept, idx) => (
                        <Badge key={idx} variant="outline" className="border-slate-600 text-slate-300">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedPlan(plan)
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">المهام</p>
                  <p className="text-lg font-semibold text-white">
                    {plan.completedEngagements} / {plan.totalEngagements}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">الساعات</p>
                  <p className="text-lg font-semibold text-white">
                    {plan.actualHours} / {plan.riskBasedHours}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">معتمد من</p>
                  <p className="text-lg font-semibold text-white">{plan.approvedBy || "-"}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">تاريخ الاعتماد</p>
                  <p className="text-lg font-semibold text-white">{plan.approvedDate || "-"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">نسبة الإنجاز</span>
                  <span className="text-white font-medium">
                    {Math.round((plan.completedEngagements / plan.totalEngagements) * 100)}%
                  </span>
                </div>
                <Progress value={(plan.completedEngagements / plan.totalEngagements) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">إنشاء خطة سنوية جديدة</DialogTitle>
            <DialogDescription className="text-slate-400">أدخل تفاصيل الخطة السنوية للتدقيق الداخلي</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-slate-300">
                  السنة
                </Label>
                <Input
                  id="year"
                  placeholder="2025"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalEngagements" className="text-slate-300">
                  عدد المهام المخططة
                </Label>
                <Input
                  id="totalEngagements"
                  type="number"
                  placeholder="24"
                  value={formData.totalEngagements}
                  onChange={(e) => setFormData({ ...formData, totalEngagements: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">
                عنوان الخطة
              </Label>
              <Input
                id="title"
                placeholder="الخطة السنوية للتدقيق الداخلي 2025"
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
                placeholder="وصف شامل للخطة السنوية..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskBasedHours" className="text-slate-300">
                الساعات المخططة
              </Label>
              <Input
                id="riskBasedHours"
                type="number"
                placeholder="2400"
                value={formData.riskBasedHours}
                onChange={(e) => setFormData({ ...formData, riskBasedHours: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleCreatePlan}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
            >
              إنشاء الخطة
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

      {/* View Plan Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPlan?.title}</DialogTitle>
            <DialogDescription className="text-slate-400">{selectedPlan?.description}</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-400 mb-1">السنة</p>
                    <p className="text-2xl font-bold text-white">{selectedPlan.year}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-400 mb-1">الحالة</p>
                    <Badge className={getStatusColor(selectedPlan.status)}>{getStatusLabel(selectedPlan.status)}</Badge>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">المهام المكتملة</p>
                  <p className="text-xl font-semibold text-white">
                    {selectedPlan.completedEngagements} / {selectedPlan.totalEngagements}
                  </p>
                  <Progress
                    value={(selectedPlan.completedEngagements / selectedPlan.totalEngagements) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">الساعات المستخدمة</p>
                  <p className="text-xl font-semibold text-white">
                    {selectedPlan.actualHours} / {selectedPlan.riskBasedHours}
                  </p>
                  <Progress value={(selectedPlan.actualHours / selectedPlan.riskBasedHours) * 100} className="h-2" />
                </div>
              </div>
              {selectedPlan.departments.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">الإدارات المشمولة</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlan.departments.map((dept, idx) => (
                      <Badge key={idx} variant="outline" className="border-slate-600 text-slate-300">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
