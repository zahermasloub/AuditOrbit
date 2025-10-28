"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { TokenManager } from "@/lib/api-client"

type Engagement = {
  id: string
  annual_plan_id: string
  title: string
  scope?: string | null
  risk_rating?: string | null
  status: string
  start_date?: string | null
  end_date?: string | null
  created_at: string
}

type Page<T> = {
  items: T[]
  page: number
  size: number
  total: number
}

const Schema = z.object({
  annual_plan_year: z.number().int().min(2000).max(2100),
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  scope: z.string().optional(),
  risk_rating: z.enum(["low", "medium", "high"]).optional(),
})

type FormData = z.infer<typeof Schema>

// API fetch helper
async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = TokenManager.getToken()
  const headers = new Headers(init.headers)
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })

  if (!response.ok) {
    if (response.status === 401) {
      TokenManager.clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    const text = await response.text().catch(() => "")
    throw new Error(text || response.statusText)
  }

  return response.json() as Promise<T>
}

// DataTable Component
type DataTableColumn<T> = {
  header: React.ReactNode
  accessorKey: keyof T | string
  cell?: (ctx: { row: T }) => React.ReactNode
  sortable?: boolean
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
}: {
  columns: DataTableColumn<T>[]
  data: T[]
  pageSize?: number
}) {
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null)

  const sortedData = [...data].sort((a, b) => {
    if (!sort) return 0
    const aVal = a[sort.key as keyof T]
    const bVal = b[sort.key as keyof T]
    const comparison = String(aVal ?? "").localeCompare(String(bVal ?? ""), "ar")
    return sort.dir === "asc" ? comparison : -comparison
  })

  const pageRows = sortedData.slice(page * pageSize, page * pageSize + pageSize)
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800/50 text-right">
            <tr>
              {columns.map((column, index) => {
                const key = String(column.accessorKey)
                const isActive = sort?.key === key
                const indicator = isActive ? (sort?.dir === "asc" ? " ▲" : " ▼") : ""

                return (
                  <th
                    key={index}
                    className="cursor-pointer select-none px-4 py-3 text-slate-300 font-medium"
                    onClick={() => {
                      if (column.sortable === false) return
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
                <tr key={rowIndex} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                  {columns.map((column, columnIndex) => {
                    let content: React.ReactNode
                    if (column.cell) {
                      content = column.cell({ row })
                    } else {
                      const rawValue = row[column.accessorKey as keyof T]
                      content = rawValue === undefined || rawValue === null ? "—" : String(rawValue)
                    }

                    return (
                      <td key={`${rowIndex}-${columnIndex}`} className="px-4 py-3 text-slate-300">
                        {content}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={columns.length}>
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 p-3 bg-slate-800/30 border-t border-slate-800">
        <span className="px-2 text-slate-400 text-sm">
          صفحة {page + 1}/{totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
          className="border-slate-700 bg-transparent hover:bg-slate-800"
        >
          السابق
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
          disabled={page + 1 >= totalPages}
          className="border-slate-700 bg-transparent hover:bg-slate-800"
        >
          التالي
        </Button>
      </div>
    </div>
  )
}

function EngagementsContent() {
  const page = 1
  const size = 10
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
  } = useQuery<Page<Engagement>>({
    queryKey: ["engagements", page, size],
    queryFn: () => apiFetch<Page<Engagement>>(`/engagements?page=${page}&size=${size}`),
    placeholderData: (previous: Page<Engagement> | undefined) => previous,
  })

  const columns: DataTableColumn<Engagement>[] = [
    { header: "العنوان", accessorKey: "title" },
    { header: "النطاق", accessorKey: "scope" },
    { 
      header: "الحالة", 
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-indigo-600/20 text-indigo-300 border-indigo-600/30">
          {row.status}
        </Badge>
      )
    },
    { 
      header: "المخاطر", 
      accessorKey: "risk_rating",
      cell: ({ row }) => {
        const risk = row.risk_rating ?? "medium"
        const colors: Record<string, string> = {
          high: "bg-red-600/20 text-red-300 border-red-600/30",
          medium: "bg-yellow-600/20 text-yellow-300 border-yellow-600/30",
          low: "bg-green-600/20 text-green-300 border-green-600/30",
        }
        const labels: Record<string, string> = {
          high: "عالي",
          medium: "متوسط",
          low: "منخفض",
        }
        return (
          <Badge variant="secondary" className={colors[risk]}>
            {labels[risk]}
          </Badge>
        )
      }
    },
    {
      header: "تاريخ الإنشاء",
      accessorKey: "created_at",
      cell: ({ row }) => {
        if (!row.created_at) return "—"
        const parsed = new Date(row.created_at)
        if (Number.isNaN(parsed.getTime())) return row.created_at
        return format(parsed, "yyyy-MM-dd")
      },
    },
  ]

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ 
    resolver: zodResolver(Schema),
    defaultValues: {
      annual_plan_year: new Date().getFullYear(),
    }
  })

  const onCreate = async (values: FormData) => {
    try {
      await apiFetch<Engagement>("/engagements", { 
        method: "POST", 
        body: JSON.stringify(values) 
      })
      reset({
        annual_plan_year: new Date().getFullYear(),
        title: "",
        scope: "",
        risk_rating: undefined,
      })
      await queryClient.invalidateQueries({ queryKey: ["engagements"] })
    } catch (err) {
      console.error("Failed to create engagement:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="mr-3 text-slate-400">جارِ التحميل…</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-900/20 border-red-800">
        <p className="text-red-400">خطأ في جلب البيانات: {String(error)}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card className="p-4 bg-slate-900/50 border-slate-800">
        <form onSubmit={handleSubmit(onCreate)} className="flex flex-wrap items-start gap-3">
          <div className="flex flex-col min-w-[120px]">
            <Input
              className="bg-slate-800/50 border-slate-700 text-white"
              placeholder="السنة"
              type="number"
              {...register("annual_plan_year", { valueAsNumber: true })}
            />
            {errors.annual_plan_year && (
              <span className="text-xs text-red-400 mt-1">{errors.annual_plan_year.message}</span>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-[200px]">
            <Input
              className="bg-slate-800/50 border-slate-700 text-white"
              placeholder="العنوان / Title"
              {...register("title")}
            />
            {errors.title && <span className="text-xs text-red-400 mt-1">{errors.title.message}</span>}
          </div>
          <div className="flex flex-col flex-1 min-w-[200px]">
            <Input
              className="bg-slate-800/50 border-slate-700 text-white"
              placeholder="النطاق / Scope"
              {...register("scope")}
            />
            {errors.scope && <span className="text-xs text-red-400 mt-1">{errors.scope.message}</span>}
          </div>
          <div className="flex flex-col min-w-[140px]">
            <select 
              className="h-10 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white"
              {...register("risk_rating")}
            >
              <option value="">المخاطر</option>
              <option value="low">منخفض</option>
              <option value="medium">متوسط</option>
              <option value="high">عالي</option>
            </select>
            {errors.risk_rating && (
              <span className="text-xs text-red-400 mt-1">{errors.risk_rating.message}</span>
            )}
          </div>
          <Button
            disabled={isSubmitting}
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الإنشاء...
              </>
            ) : (
              "إنشاء مهمة جديدة"
            )}
          </Button>
        </form>
      </Card>

      {/* Data Table */}
      <DataTable<Engagement> data={data?.items ?? []} columns={columns} pageSize={10} />
    </div>
  )
}

// Main component with QueryClient wrapper
const queryClient = new QueryClient()

export function EngagementsSectionNew() {
  return (
    <QueryClientProvider client={queryClient}>
      <EngagementsContent />
    </QueryClientProvider>
  )
}
