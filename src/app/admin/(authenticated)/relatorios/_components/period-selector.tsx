"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateToStr } from "@/lib/availability";

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ReportPeriod } from "../actions";

const PILLS: { value: ReportPeriod; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "custom", label: "Personalizado" },
];

function strToDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface PeriodSelectorProps {
  currentPeriod: ReportPeriod;
  customStart?: string;
  customEnd?: string;
}

export function PeriodSelector({ currentPeriod, customStart, customEnd }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [start, setStart] = useState<string | undefined>(customStart);
  const [end, setEnd] = useState<string | undefined>(customEnd);

  function navigate(params: Record<string, string>) {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("period");
    current.delete("start");
    current.delete("end");
    for (const [k, v] of Object.entries(params)) {
      if (v) current.set(k, v);
    }
    startTransition(() => {
      router.push(`${pathname}?${current.toString()}`);
    });
  }

  function handlePillClick(value: ReportPeriod) {
    if (value === "custom") {
      // apenas ativa a pill — não navega ainda, aguarda o Aplicar
      navigate({ period: "custom", ...(start ? { start } : {}), ...(end ? { end } : {}) });
    } else {
      navigate({ period: value });
    }
  }

  function handleApplyCustom() {
    if (start && end && start <= end) {
      navigate({ period: "custom", start, end });
    }
  }

  const today = new Date();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Pills */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
        {PILLS.map((pill) => {
          const isActive = currentPeriod === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() => handlePillClick(pill.value)}
              disabled={isPending}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Custom range — só aparece quando a pill "Personalizado" está ativa */}
      {currentPeriod === "custom" && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className="h-9 justify-start gap-2 px-3 text-sm font-normal"
              >
                <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className={cn(!start && "text-muted-foreground")}>
                  {start ? formatShortDate(start) : "Data inicial"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={start ? strToDate(start) : undefined}
                onSelect={(date) => date && setStart(dateToStr(date))}
                disabled={(date) => date > today}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-muted-foreground">até</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className="h-9 justify-start gap-2 px-3 text-sm font-normal"
              >
                <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className={cn(!end && "text-muted-foreground")}>
                  {end ? formatShortDate(end) : "Data final"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={end ? strToDate(end) : undefined}
                onSelect={(date) => date && setEnd(dateToStr(date))}
                disabled={(date) => date > today || (!!start && date < strToDate(start))}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            onClick={handleApplyCustom}
            disabled={isPending || !start || !end}
          >
            Aplicar
          </Button>
        </div>
      )}

      {isPending && (
        <span className="text-xs text-muted-foreground">Carregando...</span>
      )}
    </div>
  );
}
