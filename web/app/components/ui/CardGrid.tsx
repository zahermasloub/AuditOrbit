"use client";
import Link from "next/link";
import { Icon, AOIconKey } from "./icons";
import { Card } from "./Card";

export type CardItem = {
  href: string;
  title: string;   // عربي / English
  sub?: string;
  icon: AOIconKey;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  disabled?: boolean;
};

export default function CardGrid({items}:{items: CardItem[]}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, idx)=>(
        <Link key={idx} href={it.disabled? "#" : it.href} aria-disabled={it.disabled}>
          <Card className={`group relative h-full transition ${
            it.disabled ? "opacity-60 pointer-events-none" : "hover:shadow-ao-lg"
          }`}>
            <div className={`absolute inset-0 -z-[1] rounded-2xl opacity-0 group-hover:opacity-100 transition ${toneBg(it.tone)}`} />
            <div className="flex items-start gap-3">
              <span className={`rounded-xl p-2 border ${toneBorder(it.tone)}`}>
                <Icon name={it.icon} className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="font-semibold leading-6 truncate">{it.title}</div>
                {it.sub && <div className="text-xs opacity-70 mt-1 line-clamp-2">{it.sub}</div>}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function toneBg(t?: CardItem["tone"]) {
  if (t==="primary") return "bg-[color:var(--ao-primary)]/5";
  if (t==="success") return "bg-[color:var(--ao-success)]/5";
  if (t==="warning") return "bg-[color:var(--ao-warning)]/5";
  if (t==="danger")  return "bg-[color:var(--ao-danger)]/5";
  return "bg-[color:var(--ao-muted)]/5";
}
function toneBorder(t?: CardItem["tone"]) {
  if (t==="primary") return "border-[color:var(--ao-primary)]/30";
  if (t==="success") return "border-[color:var(--ao-success)]/30";
  if (t==="warning") return "border-[color:var(--ao-warning)]/30";
  if (t==="danger")  return "border-[color:var(--ao-danger)]/30";
  return "border-black/10 dark:border-white/10";
}
