import "./globals.css";
import Navbar from "./components/Navbar";
import Providers from "./providers";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "AuditOrbit — Admin" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
