"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <div className="mt-5 mb-4 space-y-2">
      {/* Dashes */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isFilled = step <= currentStep;
          return (
            <div
              key={i}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors duration-300",
                isFilled ? "bg-primary" : "bg-border"
              )}
            />
          );
        })}
      </div>
      {/* Current step label only */}
      <p className="text-center text-xs text-muted-foreground">
        {labels[currentStep - 1]}
      </p>
    </div>
  );
}
