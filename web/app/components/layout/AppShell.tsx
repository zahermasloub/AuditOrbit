"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import clsx from "clsx";

type SidebarItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type AppShellProps = {
  sidebarItems: SidebarItem[];
  user: { name: string; role: "Manager" | "Auditor" | "Admin" };
  breadcrumbs?: BreadcrumbItem[];
  dir?: "rtl" | "ltr";
  right?: ReactNode;
  onSidebarToggleAction?: (open: boolean) => void;
  children: ReactNode;
};

export default function AppShell({
  sidebarItems,
  user,
  breadcrumbs,
  dir = "rtl",
  right,
  onSidebarToggleAction,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const breadcrumbItems = useMemo(() => breadcrumbs ?? [], [breadcrumbs]);

  const handleToggle = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      onSidebarToggleAction?.(next);
      return next;
    });
  };

  return (
    <div
      dir={dir}
      className="min-h-dvh bg-[rgb(var(--ao-bg))] text-[rgb(var(--ao-fg))]"
      role="application"
    >
      <a
        id="ao-skip-to-content"
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-ao-md"
      >
        تخطي إلى المحتوى
      </a>
      <header className="sticky top-0 z-[600] border-b border-[rgb(var(--ao-border))] bg-[rgb(var(--ao-card))]">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
          <button
            type="button"
            onClick={handleToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-[rgb(var(--ao-muted))] bg-opacity-30 text-[rgb(var(--ao-fg))] transition hover:bg-opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ao-ring))]"
            aria-label="Toggle sidebar"
            aria-pressed={sidebarOpen}
          >
            <Menu size={20} />
          </button>
          <nav aria-label="breadcrumb" className="text-sm text-[rgb(var(--ao-muted))]">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <span key={`${item.label}-${index}`} className="mx-1">
                  {item.href && !isLast ? (
                    <Link className="hover:text-[rgb(var(--ao-primary))]" href={item.href}>
                      {item.label}
                    </Link>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
                  )}
                  {!isLast && <span className="mx-1 text-[rgb(var(--ao-muted))]">/</span>}
                </span>
              );
            })}
          </nav>
          <div className="text-sm text-[rgb(var(--ao-muted))]">
            {user.name} — {user.role}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-4 px-4 py-4">
        <aside
          className={clsx(
            "col-span-12 md:col-span-3 lg:col-span-2",
            "transition-all duration-200",
            "md:opacity-100",
            sidebarOpen ? "max-md:translate-x-0 max-md:opacity-100" : "max-md:-translate-x-full max-md:opacity-0",
          )}
          aria-label="Sidebar"
        >
          <nav className="rounded-2xl border border-[rgb(var(--ao-border))] bg-[rgb(var(--ao-card))] p-3">
            <ul className="space-y-1" role="list">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-[rgb(var(--ao-muted))] hover:bg-opacity-40"
                    >
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main
          id="main-content"
          className="col-span-12 md:col-span-9 lg:col-span-7"
          role="main"
        >
          {children}
        </main>

        <aside className="col-span-12 lg:col-span-3" aria-label="Complementary">
          {right}
        </aside>
      </div>
    </div>
  );
}
