import * as React from "react";

export function Empty({ 
  title = "لا توجد بيانات", 
  hint = "جرب تغيير المرشّحات" 
}: { 
  title?: string; 
  hint?: string 
}) {
  return (
    <div className="text-center py-10 opacity-70 space-y-1">
      <div className="text-lg text-muted">{title}</div>
      <div className="text-xs text-muted">{hint}</div>
    </div>
  );
}

export function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-danger/40 bg-danger/10 text-danger p-3 text-sm">
      ⚠️ {msg}
    </div>
  );
}

export function Loading({ text = "جاري التحميل..." }: { text?: string }) {
  return (
    <div className="animate-pulse text-sm opacity-70 text-muted py-8 text-center">
      {text}
    </div>
  );
}
