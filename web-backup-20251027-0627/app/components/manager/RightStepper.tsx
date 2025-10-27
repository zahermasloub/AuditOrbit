"use client";

import { useMemo } from "react";

type StepStatus = "pending" | "active" | "done" | "blocked";

type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

type RightStepperProps = {
  steps: Step[];
  currentStepId: string;
  onStepClickAction?: (id: string) => void;
  reversedInRTL?: boolean;
};

const STATUS_STYLES: Record<StepStatus, string> = {
  done: "border-[rgb(var(--ao-success))] text-[rgb(var(--ao-success))]",
  active: "border-[rgb(var(--ao-primary))] text-[rgb(var(--ao-primary))]",
  blocked: "border-[rgb(var(--ao-danger))] text-[rgb(var(--ao-danger))]",
  pending: "border-[rgb(var(--ao-border))] text-[rgb(var(--ao-fg))]",
};

export function RightStepper({ steps, currentStepId, onStepClickAction, reversedInRTL = true }: RightStepperProps) {
  const orderedSteps = useMemo(() => {
    if (!reversedInRTL) {
      return steps;
    }
    if (typeof document === "undefined") {
      return steps;
    }
    const dir = document.documentElement.getAttribute("dir") ?? "ltr";
    return dir === "rtl" ? [...steps].reverse() : steps;
  }, [steps, reversedInRTL]);

  return (
    <ol className="space-y-2" role="list">
      {orderedSteps.map((step) => {
        const tone = STATUS_STYLES[step.status];
        const isCurrent = step.id === currentStepId;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onStepClickAction?.(step.id)}
              className={`w-full rounded-2xl border ${tone} px-3 py-2 text-start transition hover:bg-[rgb(var(--ao-muted))] hover:bg-opacity-30`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="text-sm font-medium">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
