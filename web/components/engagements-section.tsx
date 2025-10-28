"use client"

import { useMemo, useState, useEffect } from "react"
import { Plus, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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

const riskLabels: Record<string, string> = {
  high: "عالي",
  medium: "متوسط",
  low: "منخفض",
}

// StatusBadge component inline (inspired by backup)
function StatusBadge({ value }: { value: string | null | undefined }) {
  const normalized = (value ?? "").toLowerCase()
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"
  
  if (normalized.includes("completed") || normalized.includes("مكتمل")) {
    variant = "default" // success tone
  } else if (normalized.includes("progress") || normalized.includes("التنفيذ")) {
    variant = "default"
  } else if (normalized.includes("draft") || normalized.includes("مسودة")) {
    variant = "secondary"
  } else if (normalized.includes("cancelled") || normalized.includes("ملغى")) {
    variant = "destructive"
  }
  
  return (
    <Badge variant={variant} className="text-xs">
      {value ?? "—"}
    </Badge>
  )
}

// FilterBar component (matching backup's time range filter)
function FilterBar({ onRangeChange }: { onRangeChange: (range: number) => void }) {
  const [activeRange, setActiveRange] = useState(30)
  const ranges = [30, 60, 90]

  const handleSelect = (value: number) => {
    setActiveRange(value)
    onRangeChange(value)
  }

  return (
    <div className="flex items-center gap-2">
      {ranges.map((value) => {
        const isActive = value === activeRange
        return (
          <Button
            key={value}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelect(value)}
          >
            آخر {value} يومًا
          </Button>
        )
      })}
    </div>
  )
}

// DataTable component (matching backup's table structure)
type Column<T> = {
  header: React.ReactNode
  accessorKey: keyof T | string
  cell?: (row: T) => React.ReactNode
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
}: {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
}) {
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null)

  const sortedData = useMemo(() => {
    if (!sort) return data
    const snapshot = [...data]
    snapshot.sort((a, b) => {
      const aVal = a[sort.key as keyof T]
      const bVal = b[sort.key as keyof T]
      const comparison = String(aVal ?? "").localeCompare(String(bVal ?? ""), "ar")
      return sort.dir === "asc" ? comparison : -comparison
    })
    return snapshot
  }, [data, sort])

  const pageRows = useMemo(
    () => sortedData.slice(page * pageSize, page * pageSize + pageSize),
    [page, pageSize, sortedData]
  )

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))

  return (
    <div className="rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/30 text-right">
            <tr>
              {columns.map((column, index) => {
                const key = String(column.accessorKey)
                const isActive = sort?.key === key
                const indicator = isActive ? (sort?.dir === "asc" ? " ▲" : " ▼") : ""

                return (
                  <th
                    key={index}
                    className="cursor-pointer select-none px-3 py-2 font-medium"
                    onClick={() => {
                      setSort((current) => {
                        if (!current || current.key !== key) {
                          return { key, dir: "asc" }
                        }
                        return { key, dir: current.dir === "asc" ? "desc" : "asc" }
                      })
                    }}
                  >
                    {column.header}
                    {indicator}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? (
              pageRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border hover:bg-muted/15">
                  {columns.map((column, columnIndex) => {
                    const value = column.cell
                      ? column.cell(row)
                      : row[column.accessorKey as keyof T]

                    return (
                      <td key={`${rowIndex}-${columnIndex}`} className="px-3 py-2 align-middle">
                        {value !== undefined && value !== null ? String(value) : "—"}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-6 text-center text-sm opacity-70" colSpan={columns.length}>
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 p-2 text-sm">
        <span className="px-2 opacity-70">
          صفحة {page + 1}/{totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
        >
          السابق
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
          disabled={page + 1 >= totalPages}
        >
          التالي
        </Button>
      </div>
    </div>
  )
}

// DataTableToolbar (matching backup's search with debounce)
function DataTableToolbar({
  onSearch,
  placeholder = "ابحث...",
  right,
}: {
  onSearch?: (query: string) => void
  placeholder?: string
  right?: React.ReactNode
}) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!onSearch) return
    const handle = setTimeout(() => {
      onSearch(query.trim())
    }, 300)
    return () => clearTimeout(handle)
  }, [onSearch, query])

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-[240px] max-w-md">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="بحث"
          className="bg-background"
        />
      </div>
      {right}
    </div>
  )
}

// Format date helper
function formatPeriod(value?: string | null) {
  if (!value) return "—"
  try {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString("ar-SA", { month: "short", day: "numeric" })
  } catch {
    return value
  }
}

type EngagementRow = {
  id: string
  title: string
  scope: string
  status: string
  risk_rating: string
  start_date?: string | null
  end_date?: string | null
}

function toEngagementRow(engagement: Engagement): EngagementRow {
  return {
    id: engagement.id,
    title: engagement.title,
    scope: engagement.scope ?? "غير محدد",
    status: engagement.status,
    risk_rating: (engagement.risk_rating ?? "medium").toLowerCase(),
    start_date: engagement.start_date,
    end_date: engagement.end_date,
  }
}

export function EngagementsSection() {
  const {
    engagements: apiEngagements,
    loading,
    error,
    createEngagement,
    refresh,
  } = useEngagements({ page: 1, size: 200 })

  const engagements = useMemo(() => apiEngagements.map(toEngagementRow), [apiEngagements])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState<EngagementCreate>({
    title: "",
    scope: "",
    risk_rating: "medium",
    annual_plan_year: new Date().getFullYear(),
  })
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [range, setRange] = useState(30)

  const filteredEngagements = useMemo(() => {
    if (!search) return engagements
    const query = search.toLowerCase()
    return engagements.filter(
      (eng) =>
        eng.title.toLowerCase().includes(query) ||
        eng.scope.toLowerCase().includes(query) ||
        eng.status.toLowerCase().includes(query)
    )
  }, [engagements, search])

  const columns = useMemo<Column<EngagementRow>[]>(
    () => [
      { header: "العنوان", accessorKey: "title" },
      { header: "النطاق", accessorKey: "scope" },
      {
        header: "الحالة",
        accessorKey: "status",
        cell: (row: EngagementRow) => <StatusBadge value={statusLabels[row.status as EngagementStatus] ?? row.status} />,
      },
      {
        header: "التصنيف",
        accessorKey: "risk_rating",
        cell: (row: EngagementRow) => <StatusBadge value={riskLabels[row.risk_rating] ?? row.risk_rating} />,
      },
      {
        header: "بداية",
        accessorKey: "start_date",
        cell: (row: EngagementRow) => formatPeriod(row.start_date),
      },
      {
        header: "استحقاق",
        accessorKey: "end_date",
        cell: (row: EngagementRow) => formatPeriod(row.end_date),
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
      {/* Header matching backup's style */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المهام الرقابية</h1>
          <p className="text-sm text-muted-foreground mt-1">عرض حالة المهام مع الفلاتر الزمنية والبحث.</p>
        </div>
        <FilterBar onRangeChange={setRange} />
      </header>

      {/* Toolbar matching backup's search and buttons */}
      <DataTableToolbar
        onSearch={setSearch}
        placeholder="ابحث بعنوان المهمة أو النطاق"
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">النطاق: آخر {range} يومًا</span>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" />
              جديد
            </Button>
          </div>
        }
      />

      {/* Error alert matching backup's style */}
      {error && (
        <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          حدث خطأ في قاعدة البيانات: {error}
        </div>
      )}

      {/* Loading state */}
      {loading && engagements.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          جارٍ تحميل المهام…
        </div>
      ) : (
        /* DataTable matching backup's table structure */
        <DataTable<EngagementRow> columns={columns} data={filteredEngagements} pageSize={12} />
      )}

      {/* Create Dialog - keeping existing implementation */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">إضافة مهمة رقابية</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              سيتم حفظ المهمة بالحد الأدنى من البيانات المطلوبة (العنوان، السنة، مستوى الخطورة).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {submissionError && (
              <div className="p-3 border border-destructive/40 bg-destructive/10 text-destructive rounded-lg text-sm">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">نطاق المهمة</Label>
              <Textarea
                id="scope"
                value={formData.scope ?? ""}
                onChange={(event) => setFormData((prev) => ({ ...prev, scope: event.target.value }))}
                placeholder="ملخص نطاق المهمة أو الأهداف"
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
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
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
                onClick={() => setShowCreateDialog(false)}
                disabled={submitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreate}
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
