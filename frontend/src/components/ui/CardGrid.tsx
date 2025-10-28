"use client";
import Link from "next/link";
import { Icon, AOIconKey } from "./icons";
import { Card } from "./Card";

export type CardItem = {
  href: string;
  title: string;
  sub?: string;
  icon: AOIconKey;
  tone?: "accent" | "success" | "warning" | "danger" | "muted";
  kicker?: string;
  disabled?: boolean;
};

export default function CardGrid({ items }: { items: CardItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, idx) => (
        <Link key={idx} href={it.disabled ? "#" : it.href} aria-disabled={it.disabled}>
          <Card
            className={`group relative h-full transition ${
              it.disabled ? "opacity-60 pointer-events-none" : "hover:shadow-soft"
            }`}
          >
            <div
              className={`absolute inset-0 -z-[1] rounded-2xl opacity-0 group-hover:opacity-100 transition ${toneBg(
                it.tone
              )}`}
            />
            <div className="flex items-start gap-3">
              <span className={`rounded-xl p-2 border ${toneBorder(it.tone)}`}>
                <Icon name={it.icon} className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                {it.kicker && <div className="text-[10px] uppercase opacity-60">{it.kicker}</div>}
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
  if (t === "accent") return "bg-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))]/5";
  if (t === "success") return "bg-[rgb(var(--success))]/5";
  if (t === "warning") return "bg-[rgb(var(--warning))]/5";
  if (t === "danger") return "bg-[rgb(var(--danger))]/5";
  return "bg-black/5 dark:bg-white/5";
}

function toneBorder(t?: CardItem["tone"]) {
  if (t === "accent") return "border-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))]/30";
  if (t === "success") return "border-[rgb(var(--success))]/30";
  if (t === "warning") return "border-[rgb(var(--warning))]/30";
  if (t === "danger") return "border-[rgb(var(--danger))]/30";
  return "border-black/10 dark:border-white/10";
}
