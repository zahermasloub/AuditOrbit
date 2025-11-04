"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Plus, FileText, Clock, AlertTriangle, Building2, Target } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Department {
  id: string
  name: string
  priority?: 'high' | 'medium' | 'low'
}

interface AnnualPlan {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  targetDepartments: Department[]
  vacationStartDate: string
  vacationEndDate: string
  totalEngagements: number
  riskBasedHours: number
  status: string
  createdAt: string
}

const mockDepartments: Department[] = [
  { id: "1", name: "الإدارة المالية" },
  { id: "2", name: "إدارة الموارد البشرية" },
  { id: "3", name: "إدارة تقنية المعلومات" },
  { id: "4", name: "إدارة المشتريات" },
  { id: "5", name: "إدارة العمليات" },
  { id: "6", name: "إدارة المبيعات" },
]

const mockPlans: AnnualPlan[] = [
  {
    id: "1",
    title: "خطة التدقيق السنوية 2024",
    description: "خطة التدقيق الشاملة للعام المالي 2024",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    targetDepartments: [
      { id: "1", name: "الإدارة المالية", priority: "high" },
      { id: "2", name: "إدارة الموارد البشرية", priority: "medium" },
    ],
    vacationStartDate: "2024-07-01",
    vacationEndDate: "2024-07-31",
    totalEngagements: 12,
    riskBasedHours: 2400,
    status: "active",
    createdAt: "2024-01-01",
  },
]

export function AnnualPlansSection() {
  const [plans, setPlans] = useState<AnnualPlan[]>(mockPlans)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([])
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    vacationStartDate: "",
    vacationEndDate: "",
    totalEngagements: 0,
    riskBasedHours: 0,
  })

  const handleAddDepartment = (deptId: string) => {
    const dept = mockDepartments.find(d => d.id === deptId)
    if (dept && !selectedDepartments.find(d => d.id === deptId)) {
      setSelectedDepartments([...selectedDepartments, { ...dept, priority: 'medium' }])
    }
  }

  const handleRemoveDepartment = (deptId: string) => {
    setSelectedDepartments(selectedDepartments.filter(d => d.id !== deptId))
  }

  const handlePriorityChange = (deptId: string, priority: 'high' | 'medium' | 'low') => {
    setSelectedDepartments(
      selectedDepartments.map(d => 
        d.id === deptId ? { ...d, priority } : d
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const plan: AnnualPlan = {
      id: Date.now().toString(),
      ...newPlan,
      targetDepartments: selectedDepartments,
      status: "draft",
      createdAt: new Date().toISOString(),
    }
    
    setPlans([...plans, plan])
    setIsDialogOpen(false)
    setNewPlan({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      vacationStartDate: "",
      vacationEndDate: "",
      totalEngagements: 0,
      riskBasedHours: 0,
    })
    setSelectedDepartments([])
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high': return 'عالية'
      case 'medium': return 'متوسطة'
      case 'low': return 'منخفضة'
      default: return 'غير محدد'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">الخطط السنوية</h2>
          <p className="text-slate-400 mt-1">إدارة خطط التدقيق السنوية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
              <Plus className="h-4 w-4 ml-2" />
              خطة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl text-slate-100">إنشاء خطة تدقيق سنوية جديدة</DialogTitle>
              <DialogDescription className="text-slate-400">
                أدخل تفاصيل الخطة السنوية والإدارات المستهدفة
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* معلومات أساسية */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  المعلومات الأساسية
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">عنوان الخطة *</Label>
                  <Input
                    id="title"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    placeholder="مثال: خطة التدقيق السنوية 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">الوصف *</Label>
                  <Textarea
                    id="description"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100 min-h-[100px]"
                    placeholder="وصف تفصيلي للخطة السنوية..."
                    required
                  />
                </div>
              </div>

              {/* فترة الخطة */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  فترة الخطة
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-slate-300">تاريخ البداية *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newPlan.startDate}
                      onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-slate-300">تاريخ النهاية *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newPlan.endDate}
                      onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* الإدارات المستهدفة */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  الإدارات المستهدفة
                </h3>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">إضافة إدارة</Label>
                  <Select onValueChange={handleAddDepartment}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue placeholder="اختر إدارة..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {mockDepartments
                        .filter(dept => !selectedDepartments.find(d => d.id === dept.id))
                        .map((dept) => (
                          <SelectItem key={dept.id} value={dept.id} className="text-slate-100">
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDepartments.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {selectedDepartments.map((dept) => (
                      <div key={dept.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">{dept.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-slate-400">الأولوية:</Label>
                          <Select
                            value={dept.priority}
                            onValueChange={(value: 'high' | 'medium' | 'low') => 
                              handlePriorityChange(dept.id, value)
                            }
                          >
                            <SelectTrigger className="w-[120px] h-8 bg-slate-900 border-slate-700 text-slate-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="high" className="text-slate-100">عالية</SelectItem>
                              <SelectItem value="medium" className="text-slate-100">متوسطة</SelectItem>
                              <SelectItem value="low" className="text-slate-100">منخفضة</SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge className={getPriorityColor(dept.priority)}>
                            {getPriorityLabel(dept.priority)}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDepartment(dept.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          إزالة
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* فترة الإجازة السنوية */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  فترة الإجازة السنوية
                </h3>
                
                <Alert className="bg-amber-500/10 border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-200 text-sm">
                    لن يتم السماح بجدولة أي مهام تدقيقية خلال فترة الإجازة المحددة
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vacationStartDate" className="text-slate-300">بداية الإجازة</Label>
                    <Input
                      id="vacationStartDate"
                      type="date"
                      value={newPlan.vacationStartDate}
                      onChange={(e) => setNewPlan({ ...newPlan, vacationStartDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vacationEndDate" className="text-slate-300">نهاية الإجازة</Label>
                    <Input
                      id="vacationEndDate"
                      type="date"
                      value={newPlan.vacationEndDate}
                      onChange={(e) => setNewPlan({ ...newPlan, vacationEndDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  معلومات إضافية
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalEngagements" className="text-slate-300">عدد المهام المتوقعة</Label>
                    <Input
                      id="totalEngagements"
                      type="number"
                      value={newPlan.totalEngagements}
                      onChange={(e) => setNewPlan({ ...newPlan, totalEngagements: parseInt(e.target.value) || 0 })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riskBasedHours" className="text-slate-300">ساعات التدقيق المقدرة</Label>
                    <Input
                      id="riskBasedHours"
                      type="number"
                      value={newPlan.riskBasedHours}
                      onChange={(e) => setNewPlan({ ...newPlan, riskBasedHours: parseInt(e.target.value) || 0 })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                >
                  إنشاء الخطة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-slate-100">{plan.title}</CardTitle>
                  <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  {plan.status === 'active' ? 'نشطة' : 'مسودة'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">الفترة</p>
                  <p className="text-sm text-slate-200">
                    {new Date(plan.startDate).toLocaleDateString('ar-SA')} - {new Date(plan.endDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">عدد المهام</p>
                  <p className="text-sm text-slate-200">{plan.totalEngagements}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">ساعات التدقيق</p>
                  <p className="text-sm text-slate-200">{plan.riskBasedHours}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">الإدارات المستهدفة</p>
                  <p className="text-sm text-slate-200">{plan.targetDepartments.length}</p>
                </div>
              </div>
              
              {plan.targetDepartments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400 mb-2">الإدارات:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.targetDepartments.map((dept) => (
                      <Badge key={dept.id} className={getPriorityColor(dept.priority)}>
                        {dept.name} - {getPriorityLabel(dept.priority)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {plan.vacationStartDate && plan.vacationEndDate && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <Alert className="bg-amber-500/10 border-amber-500/20">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-200 text-sm">
                      فترة الإجازة: {new Date(plan.vacationStartDate).toLocaleDateString('ar-SA')} - {new Date(plan.vacationEndDate).toLocaleDateString('ar-SA')}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
