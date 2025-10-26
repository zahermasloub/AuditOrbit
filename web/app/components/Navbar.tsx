"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar(){
  const p = usePathname() || "";
  const is = (k:string)=> p.startsWith(k);
  return (
    <header className="w-full border-b bg-[color:var(--ao-bg)]/80 backdrop-blur">
      <nav className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl">AuditOrbit</Link>
        <div className="flex gap-2">
          <Link className={`pill ${is("/auditor")?"pill-active":""}`} href="/auditor">Auditor</Link>
          <Link className={`pill ${is("/manager")?"pill-active":""}`} href="/manager">Manager</Link>
          <Link className={`pill ${is("/admin")?"pill-active":""}`} href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
