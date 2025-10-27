"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun, Languages } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <button 
      className="px-3 py-2 border border-border rounded-xl hover:bg-card transition-colors" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export function DirToggle() {
  const [rtl, setRtl] = useState(true);
  
  useEffect(() => {
    const savedDir = localStorage.getItem("direction");
    const isRtl = savedDir === "rtl" || savedDir === null;
    setRtl(isRtl);
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  }, []);

  const toggleDir = () => {
    const newRtl = !rtl;
    setRtl(newRtl);
    document.documentElement.setAttribute("dir", newRtl ? "rtl" : "ltr");
    localStorage.setItem("direction", newRtl ? "rtl" : "ltr");
  };

  return (
    <button 
      className="px-3 py-2 border border-border rounded-xl hover:bg-card transition-colors" 
      onClick={toggleDir}
      aria-label="Toggle direction"
    >
      <Languages className="w-4 h-4" />
    </button>
  );
}

export function NavbarPolished() {
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link 
          href="/" 
          className="logo flex items-center gap-2 font-extrabold text-lg hover:opacity-80 transition-opacity"
        >
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path 
              d="M12 2L2 7L12 12L22 7L12 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M2 17L12 22L22 17" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M2 12L12 17L22 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-primary">AuditOrbit</span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Link 
            className="px-3 py-2 rounded-xl border border-border hover:bg-card transition-colors text-sm" 
            href="/admin"
          >
            Admin
          </Link>
          <Link 
            className="px-3 py-2 rounded-xl border border-border hover:bg-card transition-colors text-sm" 
            href="/manager"
          >
            Manager
          </Link>
          <Link 
            className="px-3 py-2 rounded-xl border border-border hover:bg-card transition-colors text-sm" 
            href="/auditor"
          >
            Auditor
          </Link>
          <ThemeToggle />
          <DirToggle />
        </nav>
      </div>
    </header>
  );
}
