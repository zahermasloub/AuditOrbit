"use client";

type ProgressRadialProps = {
  value: number;
  size?: number;
  label?: string;
};

export function ProgressRadial({ value, size = 96, label }: ProgressRadialProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - safeValue / 100);
  const ariaLabel = label ?? `progress ${safeValue}%`;

  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      className="text-[rgb(var(--ao-primary))]"
      viewBox="0 0 80 80"
    >
      <g transform="translate(40 40)">
        <circle
          r={radius}
          cx="0"
          cy="0"
          fill="none"
          stroke="rgb(var(--ao-muted))"
          strokeWidth="8"
          opacity={0.3}
        />
        <circle
          r={radius}
          cx="0"
          cy="0"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90)"
          strokeLinecap="round"
        />
        <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill="rgb(var(--ao-fg))">
          {Math.round(safeValue)}%
        </text>
      </g>
    </svg>
  );
}
