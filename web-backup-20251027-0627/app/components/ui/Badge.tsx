import * as React from "react";

export function Badge({ 
  children, 
  color = "muted" 
}: { 
  children: React.ReactNode; 
  color?: "muted" | "success" | "warning" | "danger" | "primary"
}) {
  const colorMap: Record<string, string> = {
    muted: "bg-muted/10 text-muted",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
    primary: "bg-primary/15 text-primary"
  };

  return (
    <span className={`inline-flex items-center rounded-xl px-2 py-0.5 text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}
