import "./globals.css";

export const metadata = { title: "AuditOrbit" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="">
      <body className="bg-[rgb(var(--bg))]">{children}</body>
    </html>
  );
}
