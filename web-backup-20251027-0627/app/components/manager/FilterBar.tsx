"use client";

import { useState } from "react";

import { Button } from "../ui/Button";

type FilterBarProps = {
  onChangeAction?: (filters: { range: number }) => void;
  ranges?: number[];
};

const DEFAULT_RANGES = [30, 60, 90];

export function FilterBar({ onChangeAction, ranges = DEFAULT_RANGES }: FilterBarProps) {
  const [activeRange, setActiveRange] = useState<number>(ranges[0] ?? 30);

  const handleSelect = (value: number) => {
    setActiveRange(value);
    onChangeAction?.({ range: value });
  };

  return (
    <div className="flex items-center gap-2">
      {ranges.map((value) => {
        const isActive = value === activeRange;
        return (
          <Button
            key={value}
            type="button"
            variant={isActive ? "primary" : "outline"}
            size="sm"
            aria-pressed={isActive}
            onClick={() => handleSelect(value)}
          >
            آخر {value} يومًا
          </Button>
        );
      })}
    </div>
  );
}
