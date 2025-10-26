"use client";

import { Badge } from "./Badge";

type Tone = "success" | "warning" | "danger" | "muted" | "primary";

function resolveTone(value: string | null | undefined): Tone {
  const normalized = (value ?? "").toLowerCase();
  if (!normalized) return "muted";
  if (normalized.includes("approved") || normalized.includes("done") || normalized.includes("uploaded")) {
    return "success";
  }
  if (normalized.includes("in_review") || normalized.includes("review") || normalized.includes("pending")) {
    return "warning";
  }
  if (normalized.includes("implemented")) {
    return "success";
  }
  if (normalized.includes("in_progress") || normalized.includes("progress")) {
    return "primary";
  }
  if (normalized.includes("open")) {
    return "warning";
  }
  if (normalized.includes("closed")) {
    return "muted";
  }
  if (normalized.includes("systematic")) {
    return "warning";
  }
  if (normalized.includes("high_value") || normalized.includes("high value")) {
    return "success";
  }
  if (normalized.includes("random")) {
    return "primary";
  }
  if (normalized.includes("rejected") || normalized.includes("blocked") || normalized.includes("error")) {
    return "danger";
  }
  if (normalized.includes("draft")) {
    return "muted";
  }
  return "primary";
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const tone = resolveTone(value);
  return <Badge color={tone}>{value ?? "—"}</Badge>;
}
