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
import { Plus, Calendar, Users, AlertTriangle, Target } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserOption {
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

const mockUsers: UserOption[] = [
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
    annualPlanId: "",
  })
  const [activePlan, setActivePlan] = useState<{ id: string; year: number; title: string } | null>(null)

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

    if (!newEngagement.annualPlanId) {
      alert("الرجاء اختيار الخطة السنوية الفعالة. إن لم تكن موجودة، يرجى إنشاء خطة سنوية أولاً.")
      return
    }
    
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
      annualPlanId: "",
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (open) {
            // Lazy-load active plan when dialog opens
            try {
              const getCookie = (name: string) => document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1]
              const token = typeof document !== 'undefined' ? getCookie('auth_token') : undefined
              const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
              const url = `${base}/annual-plans/active`
              fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                .then(r => r.ok ? r.json() : Promise.reject(r))
                .then((plan) => {
                  if (plan?.id && plan?.year && plan?.title) {
                    setActivePlan({ id: plan.id, year: plan.year, title: plan.title })
                    setNewEngagement(prev => ({ ...prev, annualPlanId: plan.id }))
                  } else if (plan?.year && plan?.title) {
                    // Fallback plan without ID - show but don't allow submission
                    setActivePlan({ id: '', year: plan.year, title: plan.title })
                  }
                })
                .catch(() => { 
                  // Silent failure - user will see "لا توجد خطة فعالة"
                })
            } catch { /* silent */ }
          }
        }}>
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
                  <Label htmlFor="annualPlan" className="text-slate-300">الخطة السنوية الفعالة *</Label>
                  <Select
                    value={newEngagement.annualPlanId}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, annualPlanId: value })}
                    disabled={!activePlan?.id}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue placeholder={activePlan ? `${activePlan.title} (${activePlan.year})` : "جارٍ التحميل..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {activePlan?.id ? (
                        <SelectItem value={activePlan.id} className="text-slate-100">
                          {activePlan.title} ({activePlan.year})
                        </SelectItem>
                      ) : (
                        <SelectItem value="__no_plan__" disabled className="text-slate-400">
                          لا توجد خطة فعالة - يرجى إنشاء خطة أولاً
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!activePlan?.id && (
                    <p className="text-xs text-amber-400">يرجى إنشاء خطة سنوية قبل إضافة مهام تدقيقية</p>
                  )}
                </div>

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
