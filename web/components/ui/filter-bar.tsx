"use client"

import { useState } from "react"
import { Button } from "./button"

type FilterBarProps = {
  onChangeAction?: (filters: { range: number }) => void
  ranges?: number[]
}

const DEFAULT_RANGES = [30, 60, 90]

export function FilterBar({ onChangeAction, ranges = DEFAULT_RANGES }: FilterBarProps) {
  const [activeRange, setActiveRange] = useState<number>(ranges[0] ?? 30)

  const handleSelect = (value: number) => {
    setActiveRange(value)
    onChangeAction?.({ range: value })
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
            aria-pressed={isActive}
            onClick={() => handleSelect(value)}
            className={
              isActive
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "border-slate-700 text-slate-300"
            }
          >
            آخر {value} يومًا
          </Button>
        )
      })}
    </div>
  )
}
