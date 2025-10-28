import * as React from "react";

export function Badge({ 
  children, 
  color = "muted" 
}: { 
  children: React.ReactNode; 
  color?: "muted" | "success" | "warning" | "danger" | "accent"
}) {
  const colorMap: Record<string, string> = {
    muted: "bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted))]",
    success: "bg-[rgb(var(--success))]/15 text-[rgb(var(--success))]",
    warning: "bg-[rgb(var(--warning))]/15 text-[rgb(var(--warning))]",
    danger: "bg-[rgb(var(--danger))]/15 text-[rgb(var(--danger))]",
    accent: "bg-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))]/15 text-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))]"
  };

  return (
    <span className={`inline-flex items-center rounded-xl px-2 py-0.5 text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}
