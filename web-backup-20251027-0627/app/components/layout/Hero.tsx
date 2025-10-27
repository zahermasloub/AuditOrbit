"use client";
/** لماذا: تقديم هوية بصرية وتراتبية واضحة في الهبوط */
export default function Hero({
  title = "AuditOrbit",
  sub = "Internal Audit Platform — نظام إدارة المراجعة الداخلية",
  ctaHref = "/auth/sign-in",
  ctaLabel = "تسجيل الدخول / Sign In",
  kicker = "مرحبًا بك في",
}:{
  title?:string; sub?:string; ctaHref?:string; ctaLabel?:string; kicker?:string;
}) {
  return (
    <section className="text-center py-10 sm:py-14">
      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs opacity-80">
        <span>🛡️</span><span>{kicker}</span>
      </div>
      <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm sm:text-base opacity-80">{sub}</p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <a href={ctaHref}
           className="pill pill-active">
          {ctaLabel}
        </a>
        <a href="/manager" className="pill">لوحة التحكم / Dashboard</a>
      </div>
    </section>
  );
}
