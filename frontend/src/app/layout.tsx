import "./globals.css";

export const metadata = { title: "AuditOrbit" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="">
      <body>{children}</body>
    </html>
  );
}
