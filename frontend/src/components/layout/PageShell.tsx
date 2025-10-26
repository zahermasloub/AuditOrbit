"use client";
import { useState } from "react";
import Link from "next/link";

export default function PageShell({
  title,
  subtitle,
  actions,
  sidebarItems,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sidebarItems?: { href: string; label: string; icon?: React.ReactNode }[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button aria-label="Toggle sidebar"
              onClick={()=>setOpen((v)=>!v)}
              className="rounded-xl px-3 py-2 border border-[rgb(var(--border))] hover:bg-[rgb(var(--surface)/.6)]">
              ☰
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
              {subtitle && <p className="text-sm text-[rgb(var(--muted))]">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {/* Theme toggle placeholder: plug your ThemeProvider here */}
            <button className="rounded-xl px-3 py-2 border border-[rgb(var(--border))]">🌓</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl grid" style={{ gridTemplateColumns: open ? "260px 1fr" : "1fr" }}>
        {/* Sidebar */}
        {open && (
          <aside className="hidden md:block border-e border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
            <nav className="p-3 space-y-1">
              {(sidebarItems ?? []).map((it) => (
                <Link key={it.href} href={it.href}
                  className="block rounded-xl px-3 py-2 hover:bg-[rgb(var(--surface)/.6)] border border-transparent hover:border-[rgb(var(--border))]">
                  {it.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}
        {/* Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
