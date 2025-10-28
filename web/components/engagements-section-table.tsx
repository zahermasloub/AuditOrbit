"use client"

import { useMemo, useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { FilterBar } from "@/components/ui/filter-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { useEngagements } from "@/lib/hooks/useEngagements"
import type { Engagement, EngagementCreate } from "@/lib/api"

// Helper function to format dates
function formatPeriod(value?: string | null) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("ar-SA", { month: "short", day: "numeric", year: "numeric" })
}

type EngagementRow = {
  id: string
  title: string
  scope: string
  status: string
  start_date?: string | null
  end_date?: string | null
  risk_rating?: string | null
}

function toEngagementRow(engagement: Engagement): EngagementRow {
  return {
    id: engagement.id,
    title: engagement.title,
    scope: engagement.scope ?? "غير محدد",
    status: engagement.status,
    start_date: engagement.start_date,
    end_date: engagement.end_date,
    risk_rating: engagement.risk_rating,
  }
}

export function EngagementsSectionTable() {
  const [search, setSearch] = useState("")
  const [range, setRange] = useState(90)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState<EngagementCreate>({
    title: "",
    scope: "",
    risk_rating: "medium",
    annual_plan_year: new Date().getFullYear(),
  })
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { engagements: apiEngagements, loading, error, createEngagement, refresh } = useEngagements({
    page: 1,
    size: 200,
  })

  // Filter engagements based on search
  const filteredEngagements = useMemo(() => {
    if (!search.trim()) return apiEngagements

    const query = search.toLowerCase()
    return apiEngagements.filter(
      (eng) =>
        eng.title.toLowerCase().includes(query) ||
        (eng.scope && eng.scope.toLowerCase().includes(query)) ||
        eng.status.toLowerCase().includes(query)
    )
  }, [apiEngagements, search])

  const rows = useMemo(() => filteredEngagements.map(toEngagementRow), [filteredEngagements])

  const columns = useMemo<DataTableColumn<EngagementRow>[]>(
    () => [
      { header: "العنوان", accessorKey: "title" },
      { header: "النطاق", accessorKey: "scope" },
      {
        header: "الحالة",
        accessorKey: "status",
        cell: ({ row }: { row: EngagementRow }) => <StatusBadge value={row.status} />,
      },
      {
        header: "مستوى الخطورة",
        accessorKey: "risk_rating",
        cell: ({ row }: { row: EngagementRow }) => <StatusBadge value={row.risk_rating} />,
      },
      {
        header: "بداية",
        accessorKey: "start_date",
        cell: ({ row }: { row: EngagementRow }) => formatPeriod(row.start_date),
      },
      {
        header: "استحقاق",
        accessorKey: "end_date",
        cell: ({ row }: { row: EngagementRow }) => formatPeriod(row.end_date),
      },
    ],
    []
  )

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
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">المهام التدقيقية / Engagements</h1>
          <p className="text-sm text-slate-400">عرض حالة المهام مع الفلاتر الزمنية والبحث</p>
        </div>
        <div className="flex items-center gap-2">
          <FilterBar onChangeAction={({ range: value }) => setRange(value)} />
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 ml-2" />
            مهمة جديدة
          </Button>
        </div>
      </header>

      <DataTableToolbar
        onSearchAction={setSearch}
        placeholder="ابحث بعنوان المهمة أو النطاق"
        right={<span className="text-xs text-slate-400">النطاق: آخر {range} يومًا</span>}
      />

      {error && (
        <div className="p-3 border border-rose-500/40 bg-rose-500/10 text-rose-200 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          جارٍ تحميل المهام…
        </div>
      ) : (
        <DataTable<EngagementRow> columns={columns} data={rows} pageSize={12} />
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">إضافة مهمة تدقيقية</DialogTitle>
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
    </section>
  )
}
