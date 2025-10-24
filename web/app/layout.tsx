import "./globals.css";
import Navbar from "./components/Navbar";
import type { ReactNode } from "react";

export const metadata = { title: "AuditOrbit — Internal Audit Platform" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <Navbar />
        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </body>
    </html>
  );
}
