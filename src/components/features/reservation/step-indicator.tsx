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
    <div className="mb-8">
      {/* Texto "Etapa X de Y" */}
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Etapa {currentStep} de {totalSteps}
      </p>

      {/* Indicadores visuais */}
      <div className="flex items-center justify-center gap-2">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={label} className="flex items-center gap-2">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isCompleted &&
                      "bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-2 border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-2 border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isCurrent
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {index < labels.length - 1 && (
                <div
                  className={cn(
                    "mb-4 h-0.5 w-8 sm:w-12",
                    stepNumber < currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
