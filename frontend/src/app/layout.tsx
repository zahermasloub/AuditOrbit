import "./globals.css";

export const metadata = { title: "AuditOrbit" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[rgb(var(--bg))]">{children}</body>
    </html>
  );
}
