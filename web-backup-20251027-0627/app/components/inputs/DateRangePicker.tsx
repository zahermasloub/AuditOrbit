"use client";

import { useMemo } from "react";

export type DateRange = { from: Date; to: Date };
export type DateRangePreset = { label: string; days: number };

type DateRangePickerProps = {
  value: DateRange;
  onChangeAction: (value: DateRange) => void;
  presets?: DateRangePreset[];
};

const DEFAULT_PRESETS: DateRangePreset[] = [
  { label: "30 يوم", days: 30 },
  { label: "60 يوم", days: 60 },
  { label: "90 يوم", days: 90 },
];

export function DateRangePicker({ value, onChangeAction, presets }: DateRangePickerProps) {
  const options = useMemo(() => presets ?? DEFAULT_PRESETS, [presets]);

  const setDays = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    onChangeAction({ from, to });
  };

  const formatDate = (date: Date) => date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Date range picker">
      <div className="flex gap-2">
        {options.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setDays(preset.days)}
            className="rounded-xl border border-[rgb(var(--ao-border))] px-3 py-1 text-sm text-[rgb(var(--ao-fg))] transition hover:border-[rgb(var(--ao-primary))] hover:text-[rgb(var(--ao-primary))]"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-[rgb(var(--ao-muted))]">
        {formatDate(value.from)} — {formatDate(value.to)}
      </div>
    </div>
  );
}
