import "./globals.css";
import NavbarPolished from "@/components/layout/NavbarPolished";
import { ToastProvider } from "@/components/toast/Toast";
import Providers from "./providers";

export const metadata = { title: "AuditOrbit" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[rgb(var(--bg))] text-[rgb(var(--fg))] antialiased">
        <ToastProvider>
          <Providers>
            <NavbarPolished />
            <main className="mx-auto max-w-6xl p-6">{children}</main>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
