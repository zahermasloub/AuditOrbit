"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun, Languages } from "lucide-react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const v = !dark;
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  };

  return (
    <button
      className="px-3 py-2 border border-border rounded-xl hover:bg-surface transition-colors"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function DirToggle() {
  const [rtl, setRtl] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("direction");
    const isRtl = saved === "rtl" || saved === null;
    setRtl(isRtl);
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  }, []);

  const toggle = () => {
    const v = !rtl;
    setRtl(v);
    document.documentElement.setAttribute("dir", v ? "rtl" : "ltr");
    localStorage.setItem("direction", v ? "rtl" : "ltr");
  };

  return (
    <button
      className="px-3 py-2 border border-border rounded-xl hover:bg-surface transition-colors"
      onClick={toggle}
      aria-label="Toggle direction"
    >
      <Languages className="w-4 h-4" />
    </button>
  );
}

export default function NavbarPolished() {
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="logo flex items-center gap-2 font-extrabold text-lg hover:opacity-80 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-accent">AuditOrbit</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link className="px-3 py-2 rounded-xl border border-border hover:bg-surface transition-colors text-sm" href="/admin">
            Admin
          </Link>
          <Link className="px-3 py-2 rounded-xl border border-border hover:bg-surface transition-colors text-sm" href="/manager">
            Manager
          </Link>
          <Link className="px-3 py-2 rounded-xl border border-border hover:bg-surface transition-colors text-sm" href="/auditor">
            Auditor
          </Link>
          <ThemeToggle />
          <DirToggle />
        </nav>
      </div>
    </header>
  );
}
