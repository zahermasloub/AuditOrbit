"use client";

import type { ReactNode } from "react";
import { Fragment } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type TrendPoint = { x: string | number; y: number };

type KpiCardProps = {
  title: string;
  value: string | number;
  delta?: number;
  trend?: TrendPoint[];
  footer?: ReactNode;
};

export function KpiCard({ title, value, delta = 0, trend = [], footer }: KpiCardProps) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const deltaLabel = isPositive ? `+${delta}%` : isNegative ? `${delta}%` : "—";
  const deltaTone = isPositive
    ? "text-[rgb(var(--ao-success))]"
    : isNegative
      ? "text-[rgb(var(--ao-danger))]"
      : "text-[rgb(var(--ao-muted))]";

  const hasTrend = trend.length > 1;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[rgb(var(--ao-border))] bg-[rgb(var(--ao-card))] p-4 shadow-ao-lg">
      <div className="text-sm text-[rgb(var(--ao-muted))]">{title}</div>
      <div className="text-2xl font-bold text-[rgb(var(--ao-fg))]">{value}</div>
      <div className={`text-xs font-medium ${deltaTone}`}>{deltaLabel}</div>
      {hasTrend ? (
        <div className="h-12 text-[rgb(var(--ao-primary))]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Line
                type="monotone"
                dataKey="y"
                dot={false}
                stroke="currentColor"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      {footer ? <Fragment>{footer}</Fragment> : null}
    </div>
  );
}
