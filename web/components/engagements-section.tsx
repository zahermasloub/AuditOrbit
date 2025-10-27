"use client"

import { useMemo, useState } from "react"
import { Plus, FileText, Calendar, Target, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEngagements } from "@/lib/hooks/useEngagements"
import type { Engagement, EngagementCreate, EngagementStatus } from "@/lib/api"

const statusLabels: Record<EngagementStatus, string> = {
  DRAFT: "مسودة",
  PLANNING: "تخطيط",
  IN_PROGRESS: "قيد التنفيذ",
  FIELDWORK: "عمل ميداني",
  REPORTING: "إعداد التقرير",
  REVIEW: "مراجعة",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
}

const statusColors: Record<EngagementStatus, string> = {
  DRAFT: "bg-slate-500/20 text-slate-200 border-slate-500/30",
  PLANNING: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  FIELDWORK: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  REPORTING: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
  REVIEW: "bg-purple-500/20 text-purple-200 border-purple-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  CANCELLED: "bg-rose-500/20 text-rose-200 border-rose-500/30",
}

const riskLabels: Record<string, string> = {
  high: "عالي",
  medium: "متوسط",
  low: "منخفض",
}

const riskColors: Record<string, string> = {
  high: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  medium: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
}

type UiEngagement = {
  id: string
  title: string
  scope: string
  status: EngagementStatus
  riskRating: string
  startDate?: string | null
  endDate?: string | null
  createdAt: string
}

function toUiEngagement(engagement: Engagement): UiEngagement {
  return {
    id: engagement.id,
    title: engagement.title,
    scope: engagement.scope ?? "غير محدد",
    status: engagement.status,
    riskRating: (engagement.risk_rating ?? "medium").toLowerCase(),
    startDate: engagement.start_date,
    endDate: engagement.end_date,
    createdAt: engagement.created_at,
  }
}

export function EngagementsSection() {
  const {
    engagements: apiEngagements,
    loading,
    error,
    createEngagement,
    refresh,
  } = useEngagements({ page: 1, size: 20 })

  const engagements = useMemo(() => apiEngagements.map(toUiEngagement), [apiEngagements])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedEngagement, setSelectedEngagement] = useState<UiEngagement | null>(null)
  const [formData, setFormData] = useState<EngagementCreate>({
    title: "",
    scope: "",
    risk_rating: "medium",
    annual_plan_year: new Date().getFullYear(),
  })
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      setSubmissionError("يرجى إدخال عنوان المهمة")
      return
    }

    try {
      setSubmitting(true)
      setSubmissionError(null)
      await createEngagement({
        title: formData.title.trim(),
        scope: formData.scope?.trim() || undefined,
        risk_rating: formData.risk_rating,
        annual_plan_year: formData.annual_plan_year,
      })
      setFormData({
        title: "",
        scope: "",
        risk_rating: "medium",
        annual_plan_year: new Date().getFullYear(),
      })
      setShowCreateDialog(false)
      refresh()
    } catch (err) {
      setSubmissionError(err instanceof Error ? err.message : "فشل إنشاء المهمة")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">المهام الرقابية</h3>
          <p className="text-slate-400 mt-1">عرض المهام المضافة من قاعدة البيانات المحدثة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-200" onClick={refresh} disabled={loading}>
            <RefreshCw className="h-4 w-4 ml-2" /> تحديث
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 ml-2" /> مهمة جديدة
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 border border-rose-500/40 bg-rose-500/10 text-rose-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading && engagements.length === 0 && (
          <Card className="bg-slate-900 border-slate-800 md:col-span-2 xl:col-span-3">
            <CardContent className="flex items-center justify-center gap-3 py-12 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" /> يجري تحميل المهام...
            </CardContent>
          </Card>
        )}

        {!loading && engagements.length === 0 && (
          <Card className="bg-slate-900 border-slate-800 md:col-span-2 xl:col-span-3">
            <CardContent className="py-12 text-center text-slate-400">
              لا توجد مهام مسجلة حتى الآن
            </CardContent>
          </Card>
        )}

        {engagements.map((engagement) => (
          <Card
            key={engagement.id}
            className="bg-slate-900 border-slate-800 hover:border-indigo-500/40 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-300" />
                <span className="truncate" title={engagement.title}>
                  {engagement.title}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={statusColors[engagement.status]}>
                  {statusLabels[engagement.status]}
                </Badge>
                <Badge variant="outline" className={riskColors[engagement.riskRating] ?? riskColors.medium}>
                  {riskLabels[engagement.riskRating] ?? riskLabels.medium}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-slate-300">
                <p className="line-clamp-3 whitespace-pre-line">{engagement.scope}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-slate-500">بداية المهمة</p>
                    <p className="text-slate-200">{engagement.startDate ?? "غير محدد"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-slate-500">نهاية المهمة</p>
                    <p className="text-slate-200">{engagement.endDate ?? "غير محدد"}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-center text-slate-200 hover:text-white"
                onClick={() => setSelectedEngagement(engagement)}
              >
                <Target className="h-4 w-4 ml-2" /> عرض التفاصيل
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">إضافة مهمة رقابية</DialogTitle>
            <DialogDescription className="text-slate-400">
              سيتم حفظ المهمة بالحد الأدنى من البيانات المطلوبة (العنوان، السنة، مستوى الخطورة).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {submissionError && (
              <div className="p-3 border border-rose-500/40 bg-rose-500/10 text-rose-200 rounded-lg text-sm">
                {submissionError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">عنوان المهمة</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="مراجعة إدارة المشتريات"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">نطاق المهمة</Label>
              <Textarea
                id="scope"
                value={formData.scope ?? ""}
                onChange={(event) => setFormData((prev) => ({ ...prev, scope: event.target.value }))}
                placeholder="ملخص نطاق المهمة أو الأهداف"
                className="bg-slate-800 border-slate-700 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">سنة الخطة</Label>
                <Input
                  id="year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.annual_plan_year}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, annual_plan_year: Number(event.target.value) }))
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>مستوى الخطورة</Label>
                <Select
                  value={formData.risk_rating ?? "medium"}
                  onValueChange={(value: "high" | "medium" | "low") =>
                    setFormData((prev) => ({ ...prev, risk_rating: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-200"
                onClick={() => setShowCreateDialog(false)}
                disabled={submitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEngagement} onOpenChange={(open) => !open && setSelectedEngagement(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">تفاصيل المهمة</DialogTitle>
            <DialogDescription className="text-slate-400">
              عرض البيانات كما توفرها الواجهة البرمجية المحدثة.
            </DialogDescription>
          </DialogHeader>

          {selectedEngagement && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">عنوان المهمة</p>
                <p className="text-lg font-semibold text-white">{selectedEngagement.title}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-400">النطاق</p>
                <p className="whitespace-pre-line text-slate-200">{selectedEngagement.scope}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs">الحالة</p>
                  <Badge variant="outline" className={statusColors[selectedEngagement.status]}>
                    {statusLabels[selectedEngagement.status]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs">التصنيف</p>
                  <Badge variant="outline" className={riskColors[selectedEngagement.riskRating] ?? riskColors.medium}>
                    {riskLabels[selectedEngagement.riskRating] ?? riskLabels.medium}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">البداية</p>
                  <p>{selectedEngagement.startDate ?? "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">النهاية</p>
                  <p>{selectedEngagement.endDate ?? "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">تاريخ الإنشاء</p>
                  <p>{selectedEngagement.createdAt}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
