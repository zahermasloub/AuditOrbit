"use client";
import LogoIcon from "./LogoIcon";
import Link from "next/link";
import { useEffect, useState } from "react";

/** لماذا: عرض الهوية، تبديل الوضع الداكن، وعناوين عربية/إنجليزية */
export default function Navbar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 logo" aria-label="AuditOrbit Home">
          <span className="text-brand">
            <LogoIcon className="w-8 h-8" />
          </span>
          <span className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100">AuditOrbit</span>
          <span className="sr-only">Internal Audit Platform</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-700 dark:text-neutral-300 hidden md:block">
            منصة التدقيق الداخلي / Internal Audit
          </span>
          <button
            className="text-sm px-3 py-1 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
            onClick={() => setDark((v) => !v)}
            aria-pressed={dark}
            aria-label="Toggle dark mode"
          >
            {dark ? "فاتح / Light" : "داكن / Dark"}
          </button>
        </div>
      </nav>
    </header>
  );
}
