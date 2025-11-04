# تقرير شامل: تعديلات نماذج الخطط السنوية والمهام التدقيقية
## AuditOrbit - Forms Modifications Export

---

## 📋 ملخص التعديلات

تم تحديث نموذجين رئيسيين في نظام AuditOrbit:

### 1. نموذج الخطة السنوية (Annual Plan Form)
**الملف:** `components/annual-plans-section.tsx`

**التعديلات الرئيسية:**
- ✅ استبدال حقل السنة بفترة زمنية (من تاريخ - إلى تاريخ)
- ✅ إضافة اختيار الإدارات المستهدفة (Multi-select)
- ✅ إضافة أولوية التدقيق لكل إدارة (عالية / متوسطة / منخفضة)
- ✅ إضافة فترة الإجازة السنوية مع تحذير واضح
- ✅ نظام تحذير عند جدولة مهام خلال فترة الإجازة

### 2. نموذج المهمة التدقيقية (Engagement/Audit Task Form)
**الملف:** `components/engagements-section.tsx`

**التعديلات الرئيسية:**
- ✅ إضافة حقل المدقق المسؤول (Responsible Auditor)
- ✅ إضافة فريق المدققين المشاركين (Multi-select)
- ✅ إضافة حالة المهمة القابلة للتحديد (مجدولة / قيد التنفيذ / قيد المراجعة / مكتملة)
- ✅ نظام تحذير تلقائي عند الجدولة خلال فترة الإجازة
- ✅ منع حفظ المهام المجدولة خلال فترة الإجازة

---

## 🔧 التعديلات التقنية

### البيانات الجديدة المضافة

#### Annual Plan Interface:
\`\`\`typescript
interface AnnualPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;          // NEW: تاريخ بداية الخطة
  endDate: string;            // NEW: تاريخ نهاية الخطة
  targetDepartments: Array<{  // NEW: الإدارات المستهدفة
    id: string;
    name: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  vacationStartDate: string;  // NEW: بداية فترة الإجازة
  vacationEndDate: string;    // NEW: نهاية فترة الإجازة
  totalEngagements: number;
  riskBasedHours: number;
  status: string;
  createdAt: string;
}
\`\`\`

#### Engagement Interface:
\`\`\`typescript
interface Engagement {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  responsibleAuditor: string;      // NEW: المدقق المسؤول
  assignedAuditors: string[];      // UPDATED: فريق المدققين
  status: 'scheduled' | 'in-progress' | 'under-review' | 'completed'; // UPDATED
  estimatedHours: number;
  objectives: string;
  scope: string;
  criteria: string;
  annualPlanId: string;
}
\`\`\`

---

## 📝 الكود الكامل

### 1. Annual Plans Section Component

\`\`\`tsx
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
\`\`\`

### 2. Engagements Section Component

\`\`\`tsx
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
import { Plus, Calendar, Users, AlertTriangle, Building2, Target, User } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: string
  name: string
  role: string
}

interface Engagement {
  id: string
  title: string
  description: string
  department: string
  priority: 'high' | 'medium' | 'low'
  startDate: string
  endDate: string
  responsibleAuditor: string
  assignedAuditors: string[]
  status: 'scheduled' | 'in-progress' | 'under-review' | 'completed'
  estimatedHours: number
  objectives: string
  scope: string
  criteria: string
  annualPlanId: string
}

const mockUsers: User[] = [
  { id: "1", name: "أحمد محمد", role: "مدقق أول" },
  { id: "2", name: "فاطمة علي", role: "مدقق" },
  { id: "3", name: "محمد خالد", role: "مدقق" },
  { id: "4", name: "سارة أحمد", role: "مدقق مساعد" },
  { id: "5", name: "عمر حسن", role: "مدقق مساعد" },
]

const mockDepartments = [
  "الإدارة المالية",
  "إدارة الموارد البشرية",
  "إدارة تقنية المعلومات",
  "إدارة المشتريات",
  "إدارة العمليات",
  "إدارة المبيعات",
]

const mockEngagements: Engagement[] = [
  {
    id: "1",
    title: "تدقيق الحسابات المالية Q1",
    description: "مراجعة شاملة للحسابات المالية للربع الأول",
    department: "الإدارة المالية",
    priority: "high",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    responsibleAuditor: "1",
    assignedAuditors: ["2", "3"],
    status: "in-progress",
    estimatedHours: 120,
    objectives: "التحقق من دقة التقارير المالية",
    scope: "جميع الحسابات المالية للربع الأول",
    criteria: "معايير المحاسبة الدولية",
    annualPlanId: "1",
  },
]

// Mock vacation period (should come from annual plan)
const mockVacationPeriod = {
  startDate: "2024-07-01",
  endDate: "2024-07-31",
}

export function EngagementsSection() {
  const [engagements, setEngagements] = useState<Engagement[]>(mockEngagements)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAuditors, setSelectedAuditors] = useState<string[]>([])
  const [vacationWarning, setVacationWarning] = useState(false)
  const [newEngagement, setNewEngagement] = useState({
    title: "",
    description: "",
    department: "",
    priority: "medium" as 'high' | 'medium' | 'low',
    startDate: "",
    endDate: "",
    responsibleAuditor: "",
    status: "scheduled" as 'scheduled' | 'in-progress' | 'under-review' | 'completed',
    estimatedHours: 0,
    objectives: "",
    scope: "",
    criteria: "",
    annualPlanId: "1",
  })

  const checkVacationConflict = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return false
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const vacStart = new Date(mockVacationPeriod.startDate)
    const vacEnd = new Date(mockVacationPeriod.endDate)
    
    return (start <= vacEnd && end >= vacStart)
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updatedEngagement = { ...newEngagement, [field]: value }
    setNewEngagement(updatedEngagement)
    
    if (updatedEngagement.startDate && updatedEngagement.endDate) {
      const hasConflict = checkVacationConflict(updatedEngagement.startDate, updatedEngagement.endDate)
      setVacationWarning(hasConflict)
    }
  }

  const handleAddAuditor = (auditorId: string) => {
    if (!selectedAuditors.includes(auditorId)) {
      setSelectedAuditors([...selectedAuditors, auditorId])
    }
  }

  const handleRemoveAuditor = (auditorId: string) => {
    setSelectedAuditors(selectedAuditors.filter(id => id !== auditorId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (vacationWarning) {
      alert("لا يمكن حفظ المهمة: التواريخ المحددة تتعارض مع فترة الإجازة السنوية")
      return
    }
    
    const engagement: Engagement = {
      id: Date.now().toString(),
      ...newEngagement,
      assignedAuditors: selectedAuditors,
    }
    
    setEngagements([...engagements, engagement])
    setIsDialogOpen(false)
    setNewEngagement({
      title: "",
      description: "",
      department: "",
      priority: "medium",
      startDate: "",
      endDate: "",
      responsibleAuditor: "",
      status: "scheduled",
      estimatedHours: 0,
      objectives: "",
      scope: "",
      criteria: "",
      annualPlanId: "1",
    })
    setSelectedAuditors([])
    setVacationWarning(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'in-progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      case 'under-review': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدولة'
      case 'in-progress': return 'قيد التنفيذ'
      case 'under-review': return 'قيد المراجعة'
      case 'completed': return 'مكتملة'
      default: return status
    }
  }

  const getUserName = (userId: string) => {
    return mockUsers.find(u => u.id === userId)?.name || 'غير محدد'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">المهام التدقيقية</h2>
          <p className="text-slate-400 mt-1">إدارة مهام التدقيق والمراجعة</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
              <Plus className="h-4 w-4 ml-2" />
              مهمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl text-slate-100">إنشاء مهمة تدقيقية جديدة</DialogTitle>
              <DialogDescription className="text-slate-400">
                أدخل تفاصيل المهمة التدقيقية وفريق العمل
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* معلومات المهمة */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  معلومات المهمة
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">اسم المهمة *</Label>
                  <Input
                    id="title"
                    value={newEngagement.title}
                    onChange={(e) => setNewEngagement({ ...newEngagement, title: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    placeholder="مثال: تدقيق الحسابات المالية Q1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">هدف المهمة *</Label>
                  <Textarea
                    id="description"
                    value={newEngagement.description}
                    onChange={(e) => setNewEngagement({ ...newEngagement, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100 min-h-[80px]"
                    placeholder="وصف موجز لهدف المهمة..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-slate-300">الإدارة المستهدفة *</Label>
                    <Select
                      value={newEngagement.department}
                      onValueChange={(value) => setNewEngagement({ ...newEngagement, department: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                        <SelectValue placeholder="اختر الإدارة..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {mockDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept} className="text-slate-100">
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-slate-300">الأولوية *</Label>
                    <Select
                      value={newEngagement.priority}
                      onValueChange={(value: 'high' | 'medium' | 'low') => 
                        setNewEngagement({ ...newEngagement, priority: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="high" className="text-slate-100">عالية</SelectItem>
                        <SelectItem value="medium" className="text-slate-100">متوسطة</SelectItem>
                        <SelectItem value="low" className="text-slate-100">منخفضة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-300">حالة المهمة *</Label>
                  <Select
                    value={newEngagement.status}
                    onValueChange={(value: 'scheduled' | 'in-progress' | 'under-review' | 'completed') => 
                      setNewEngagement({ ...newEngagement, status: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="scheduled" className="text-slate-100">مجدولة</SelectItem>
                      <SelectItem value="in-progress" className="text-slate-100">قيد التنفيذ</SelectItem>
                      <SelectItem value="under-review" className="text-slate-100">قيد المراجعة</SelectItem>
                      <SelectItem value="completed" className="text-slate-100">مكتملة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* الجدول الزمني */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  الجدول الزمني
                </h3>
                
                {vacationWarning && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-200 text-sm">
                      تحذير: التواريخ المحددة تتعارض مع فترة الإجازة السنوية ({new Date(mockVacationPeriod.startDate).toLocaleDateString('ar-SA')} - {new Date(mockVacationPeriod.endDate).toLocaleDateString('ar-SA')}). لا يمكن حفظ المهمة.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-slate-300">تاريخ البداية *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEngagement.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-slate-300">تاريخ النهاية *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEngagement.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours" className="text-slate-300">الساعات المقدرة</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={newEngagement.estimatedHours}
                    onChange={(e) => setNewEngagement({ ...newEngagement, estimatedHours: parseInt(e.target.value) || 0 })}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    min="0"
                  />
                </div>
              </div>

              {/* فريق العمل */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  فريق العمل
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="responsibleAuditor" className="text-slate-300">المدقق المسؤول *</Label>
                  <Select
                    value={newEngagement.responsibleAuditor}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, responsibleAuditor: value })}
                    required
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue placeholder="اختر المدقق المسؤول..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="text-slate-100">
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">فريق المدققين المشاركين</Label>
                  <Select onValueChange={handleAddAuditor}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue placeholder="إضافة مدقق..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {mockUsers
                        .filter(user => 
                          user.id !== newEngagement.responsibleAuditor && 
                          !selectedAuditors.includes(user.id)
                        )
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id} className="text-slate-100">
                            {user.name} - {user.role}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAuditors.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-slate-400">المدققون المشاركون:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAuditors.map((auditorId) => {
                        const user = mockUsers.find(u => u.id === auditorId)
                        return (
                          <Badge
                            key={auditorId}
                            className="bg-slate-800 text-slate-200 border-slate-700 flex items-center gap-2"
                          >
                            {user?.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveAuditor(auditorId)}
                              className="text-slate-400 hover:text-red-400"
                            >
                              ×
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* تفاصيل إضافية */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">تفاصيل إضافية</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="objectives" className="text-slate-300">الأهداف التفصيلية</Label>
                  <Textarea
                    id="objectives"
                    value={newEngagement.objectives}
                    onChange={(e) => setNewEngagement({ ...newEngagement, objectives: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100 min-h-[60px]"
                    placeholder="الأهداف التفصيلية للمهمة..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope" className="text-slate-300">نطاق العمل</Label>
                  <Textarea
                    id="scope"
                    value={newEngagement.scope}
                    onChange={(e) => setNewEngagement({ ...newEngagement, scope: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100 min-h-[60px]"
                    placeholder="نطاق العمل والمجالات المشمولة..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criteria" className="text-slate-300">معايير التدقيق</Label>
                  <Textarea
                    id="criteria"
                    value={newEngagement.criteria}
                    onChange={(e) => setNewEngagement({ ...newEngagement, criteria: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100 min-h-[60px]"
                    placeholder="المعايير والإجراءات المتبعة..."
                  />
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
                  disabled={vacationWarning}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إنشاء المهمة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {engagements.map((engagement) => (
          <Card key={engagement.id} className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-slate-100">{engagement.title}</CardTitle>
                  <CardDescription className="text-slate-400">{engagement.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(engagement.priority)}>
                    {engagement.priority === 'high' ? 'عالية' : engagement.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </Badge>
                  <Badge className={getStatusColor(engagement.status)}>
                    {getStatusLabel(engagement.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">الإدارة</p>
                  <p className="text-sm text-slate-200">{engagement.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">الفترة</p>
                  <p className="text-sm text-slate-200">
                    {new Date(engagement.startDate).toLocaleDateString('ar-SA')} - {new Date(engagement.endDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">المدقق المسؤول</p>
                  <p className="text-sm text-slate-200">{getUserName(engagement.responsibleAuditor)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">الساعات المقدرة</p>
                  <p className="text-sm text-slate-200">{engagement.estimatedHours}</p>
                </div>
              </div>
              
              {engagement.assignedAuditors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400 mb-2">فريق العمل:</p>
                  <div className="flex flex-wrap gap-2">
                    {engagement.assignedAuditors.map((auditorId) => (
                      <Badge key={auditorId} className="bg-slate-800 text-slate-200 border-slate-700">
                        {getUserName(auditorId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
\`\`\`

---

## 🔄 خطوات التطبيق

### 1. استبدال الملفات
\`\`\`bash
# استبدل الملفات القديمة بالملفات الجديدة
cp annual-plans-section.tsx components/
cp engagements-section.tsx components/
\`\`\`

### 2. التحقق من التبعيات
تأكد من وجود المكونات التالية في مشروعك:
- `@/components/ui/card`
- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/textarea`
- `@/components/ui/badge`
- `@/components/ui/dialog`
- `@/components/ui/select`
- `@/components/ui/alert`
- `lucide-react` (للأيقونات)

### 3. تحديث Backend API
يجب تحديث Backend API لدعم الحقول الجديدة:

#### Annual Plans Endpoint:
\`\`\`typescript
POST /api/annual-plans
{
  "title": string,
  "description": string,
  "startDate": string,
  "endDate": string,
  "targetDepartments": [
    {
      "id": string,
      "name": string,
      "priority": "high" | "medium" | "low"
    }
  ],
  "vacationStartDate": string,
  "vacationEndDate": string,
  "totalEngagements": number,
  "riskBasedHours": number
}
\`\`\`

#### Engagements Endpoint:
\`\`\`typescript
POST /api/engagements
{
  "title": string,
  "description": string,
  "department": string,
  "priority": "high" | "medium" | "low",
  "startDate": string,
  "endDate": string,
  "responsibleAuditor": string,
  "assignedAuditors": string[],
  "status": "scheduled" | "in-progress" | "under-review" | "completed",
  "estimatedHours": number,
  "objectives": string,
  "scope": string,
  "criteria": string,
  "annualPlanId": string
}
\`\`\`

### 4. تحديث قاعدة البيانات
أضف الأعمدة الجديدة إلى جداول قاعدة البيانات:

\`\`\`sql
-- Annual Plans Table
ALTER TABLE annual_plans
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN vacation_start_date DATE,
ADD COLUMN vacation_end_date DATE;

-- Create junction table for departments
CREATE TABLE annual_plan_departments (
  id SERIAL PRIMARY KEY,
  annual_plan_id INTEGER REFERENCES annual_plans(id),
  department_id INTEGER REFERENCES departments(id),
  priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engagements Table
ALTER TABLE engagements
ADD COLUMN responsible_auditor_id INTEGER REFERENCES users(id),
ADD COLUMN status VARCHAR(20) CHECK (status IN ('scheduled', 'in-progress', 'under-review', 'completed'));

-- Update existing engagement_team table if needed
-- (already exists for assigned auditors)
\`\`\`

---

## ✅ قائمة التحقق

- [ ] استبدال ملفات المكونات
- [ ] التحقق من وجود جميع التبعيات
- [ ] تحديث Backend API endpoints
- [ ] تحديث قاعدة البيانات
- [ ] اختبار نموذج الخطة السنوية
- [ ] اختبار نموذج المهمة التدقيقية
- [ ] التحقق من عمل التحذيرات (فترة الإجازة)
- [ ] التحقق من عمل Multi-select (الإدارات والمدققين)
- [ ] اختبار حفظ البيانات في Backend
- [ ] التحقق من ظهور المهام في حسابات المستخدمين المعينين

---

## 📌 ملاحظات مهمة

1. **فترة الإجازة**: يتم التحقق من التعارض مع فترة الإجازة في Frontend، لكن يجب إضافة التحقق في Backend أيضاً
2. **إشعارات المستخدمين**: عند حفظ مهمة جديدة، يجب إرسال إشعارات للمدققين المعينين (يتم في Backend)
3. **الصلاحيات**: تأكد من أن المستخدمين لديهم الصلاحيات المناسبة لإنشاء الخطط والمهام
4. **التحقق من البيانات**: أضف validation إضافي في Backend للتأكد من صحة البيانات

---

## 🎯 الميزات المضافة

### نموذج الخطة السنوية:
✅ فترة زمنية محددة (من - إلى)
✅ اختيار متعدد للإدارات المستهدفة
✅ تحديد أولوية لكل إدارة
✅ فترة إجازة سنوية مع تحذير
✅ واجهة منظمة وسهلة الاستخدام

### نموذج المهمة التدقيقية:
✅ اختيار المدقق المسؤول
✅ اختيار متعدد لفريق المدققين
✅ حالة المهمة القابلة للتحديد
✅ تحذير تلقائي عند التعارض مع الإجازة
✅ منع الحفظ في حالة التعارض
✅ واجهة شاملة لجميع تفاصيل المهمة

---

## 📞 الدعم

في حالة وجود أي استفسارات أو مشاكل في التطبيق، يرجى التواصل مع فريق التطوير.

---

**تاريخ الإنشاء:** 2024
**الإصدار:** 1.0
**الحالة:** جاهز للتطبيق
