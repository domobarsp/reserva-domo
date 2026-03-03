"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
    <div className="mt-4 mb-6">
      <div className="flex items-center justify-center gap-2">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={label} className="flex items-center gap-2">
              {/* Step dot */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-2 border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-2 border-muted-foreground/25 text-muted-foreground/40"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="text-xs font-medium">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isCurrent ? "font-medium text-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector */}
              {index < labels.length - 1 && (
                <div
                  className={cn(
                    "mb-4 h-px w-8 sm:w-12 transition-colors duration-200",
                    stepNumber < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Etapa {currentStep} de {totalSteps}
      </p>
    </div>
  );
}
