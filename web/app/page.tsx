import LogoFull from "./components/LogoFull";

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="logo text-brand">
        <LogoFull />
      </div>
      <h1 className="text-2xl font-bold">مرحبًا بك في AuditOrbit</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        مرحلة 0 — Bootstrap جاهز. يمكنك تغيير لون الشعار عبر CSS على الحاوي (currentColor).
      </p>
      <div className="rounded-2xl border border-dashed p-4">
        <p className="text-sm">مثال تغيير اللون:</p>
        <div className="logo" style={{ color: "#0EA5E9" }}>
          <svg width="48" height="48"><use href="/logo-icon.svg#icon" /></svg>
        </div>
        <p className="mt-2 text-sm opacity-80">دارك مود: <code>.dark .logo &#123; color:#E5E7EB &#125;</code></p>
      </div>
    </section>
  );
}
