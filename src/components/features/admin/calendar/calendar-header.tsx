"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  const monthLabel = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // Capitalize first letter
  const formatted = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" size="icon" onClick={onPreviousMonth} aria-label="Mês anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="min-w-[200px] text-center text-base font-semibold">
        {formatted}
      </h2>
      <Button variant="outline" size="icon" onClick={onNextMonth} aria-label="Próximo mês">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
