/**
 * AuditOrbit — Icon + Wordmark (inline SVG).
 */
export default function LogoFull({ className }: { className?: string }) {
  return (
    <div className={className} aria-label="AuditOrbit Logo" role="img">
      <div className="flex items-center gap-3">
        <span className="inline-block" style={{ width: 40, height: 40 }}>
          <svg viewBox="0 0 256 256">
            <g fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
              <path d="M128 24c-28 20-56 26-84 28v56c0 36 20 69 50 89l34 22 34-22c30-20 50-53 50-89V52c-28-2-56-8-84-28z" />
              <path d="M76 122l38 38 66-66" />
              <circle cx="196" cy="84" r="10" fill="currentColor" stroke="none" />
            </g>
          </svg>
        </span>
        <div className="leading-tight">
          <div className="font-extrabold text-2xl tracking-tight">AuditOrbit</div>
          <div className="text-sm opacity-85">Internal Audit Platform</div>
        </div>
      </div>
    </div>
  );
}
