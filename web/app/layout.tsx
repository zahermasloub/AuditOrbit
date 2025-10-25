import "./globals.css";
import { NavbarPolished } from "./components/NavbarPolished";
import Providers from "./providers";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "AuditOrbit — Admin" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
     <body className="bg-bg text-fg antialiased">
        <Providers>
         <NavbarPolished />
          <main className="mx-auto max-w-6xl p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
