"use client"

import { Badge } from "./badge"

type Tone = "default" | "secondary" | "destructive" | "outline"

function resolveTone(value: string | null | undefined): Tone {
  const normalized = (value ?? "").toLowerCase()
  if (!normalized) return "outline"

  // Success states
  if (
    normalized.includes("approved") ||
    normalized.includes("done") ||
    normalized.includes("uploaded") ||
    normalized.includes("implemented") ||
    normalized.includes("completed")
  ) {
    return "default"
  }

  // Warning states
  if (
    normalized.includes("in_review") ||
    normalized.includes("review") ||
    normalized.includes("pending") ||
    normalized.includes("open") ||
    normalized.includes("systematic")
  ) {
    return "secondary"
  }

  // In progress states
  if (normalized.includes("in_progress") || normalized.includes("progress") || normalized.includes("planning")) {
    return "default"
  }

  // Danger states
  if (
    normalized.includes("rejected") ||
    normalized.includes("blocked") ||
    normalized.includes("error") ||
    normalized.includes("cancelled")
  ) {
    return "destructive"
  }

  // Draft/muted states
  if (normalized.includes("draft") || normalized.includes("closed")) {
    return "outline"
  }

  return "default"
}

function getTailwindClass(value: string | null | undefined): string {
  const normalized = (value ?? "").toLowerCase()

  // Success - Green
  if (
    normalized.includes("completed") ||
    normalized.includes("approved") ||
    normalized.includes("implemented")
  ) {
    return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"
  }

  // Warning - Yellow
  if (
    normalized.includes("pending") ||
    normalized.includes("review") ||
    normalized.includes("open")
  ) {
    return "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
  }

  // In Progress - Blue
  if (
    normalized.includes("in_progress") ||
    normalized.includes("fieldwork") ||
    normalized.includes("planning")
  ) {
    return "bg-blue-500/20 text-blue-200 border-blue-500/30"
  }

  // Reporting - Cyan
  if (normalized.includes("reporting")) {
    return "bg-cyan-500/20 text-cyan-200 border-cyan-500/30"
  }

  // Danger - Red
  if (normalized.includes("cancelled") || normalized.includes("rejected")) {
    return "bg-rose-500/20 text-rose-200 border-rose-500/30"
  }

  // Draft - Slate
  if (normalized.includes("draft")) {
    return "bg-slate-500/20 text-slate-200 border-slate-500/30"
  }

  // Default - Indigo
  return "bg-indigo-500/20 text-indigo-200 border-indigo-500/30"
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const tone = resolveTone(value)
  const className = getTailwindClass(value)

  return (
    <Badge variant={tone} className={className}>
      {value ?? "—"}
    </Badge>
  )
}
