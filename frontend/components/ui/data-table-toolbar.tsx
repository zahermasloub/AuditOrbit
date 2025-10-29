"use client"

import { useEffect, useState } from "react"
import { Filter, Download } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"

type DataTableToolbarProps = {
  onSearchAction?: (query: string) => void
  onCreateAction?: () => void
  right?: React.ReactNode
  placeholder?: string
}

export function DataTableToolbar({
  onSearchAction,
  onCreateAction,
  right,
  placeholder = "ابحث...",
}: DataTableToolbarProps) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!onSearchAction) return
    const handle = setTimeout(() => {
      onSearchAction(query.trim())
    }, 300)
    return () => clearTimeout(handle)
  }, [onSearchAction, query])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[240px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label="بحث"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Button variant="outline" type="button" className="border-slate-700 text-slate-300">
          <Filter className="h-4 w-4 ml-2" />
          فلاتر
        </Button>
        <Button variant="outline" type="button" className="border-slate-700 text-slate-300">
          <Download className="h-4 w-4 ml-2" />
          تصدير
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {right}
        {onCreateAction ? (
          <Button type="button" onClick={onCreateAction} className="bg-indigo-600 hover:bg-indigo-700">
            جديد
          </Button>
        ) : null}
      </div>
    </div>
  )
}
