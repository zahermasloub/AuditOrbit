'use client';

import type { FC } from "react";

type LegendItemProps = {
  c: string;
  label: string;
};

const LegendItem: FC<LegendItemProps> = ({ c, label }) => (
  <div className="flex items-center gap-2">
    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--ao-${c}))` }} />
    <span className="text-sm opacity-80">{label}</span>
  </div>
);

const SamplingLegend: FC = () => (
  <div className="flex gap-6 flex-wrap">
    <LegendItem c="primary" label="random / عشوائي" />
    <LegendItem c="warning" label="systematic / منهجي" />
    <LegendItem c="success" label="high_value / قيمة-عالية" />
  </div>
);

export default SamplingLegend;
