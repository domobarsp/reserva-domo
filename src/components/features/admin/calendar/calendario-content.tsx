"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { CalendarHeader } from "@/components/features/admin/calendar/calendar-header";
import { MonthGrid } from "@/components/features/admin/calendar/month-grid";
import { CalendarLegend } from "@/components/features/admin/calendar/calendar-legend";
import type {
  ReservationFull,
  TimeSlot,
  AccommodationType,
  CapacityRule,
  ExceptionDate,
} from "@/types";

interface CalendarioContentProps {
  reservations: ReservationFull[];
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

export function CalendarioContent({
  reservations,
  timeSlots,
  accommodationTypes,
  capacityRules,
  exceptionDates,
}: CalendarioContentProps) {
  const router = useRouter();
  useRealtimeSubscription({ table: "reservations" });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [isPending, startTransition] = useTransition();

  const handlePreviousMonth = useCallback(() => {
    startTransition(() => {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      );
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    startTransition(() => {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      );
    });
  }, []);

  const handleDayClick = useCallback(
    (dateStr: string) => {
      router.push(`/admin/reservas?date=${dateStr}`);
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Calendário</h1>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Navigation header */}
        <div className="border-b px-4 py-4">
          <CalendarHeader
            currentMonth={currentMonth}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </div>

        {/* Grid */}
        <MonthGrid
          currentMonth={currentMonth}
          onDayClick={handleDayClick}
          reservations={reservations}
          timeSlots={timeSlots}
          accommodationTypes={accommodationTypes}
          capacityRules={capacityRules}
          exceptionDates={exceptionDates}
          isPending={isPending}
        />

        {/* Legend */}
        <div className="border-t px-4 py-3">
          <CalendarLegend />
        </div>
      </div>
    </div>
  );
}
