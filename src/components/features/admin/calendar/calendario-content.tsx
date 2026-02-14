"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { CalendarHeader } from "@/components/features/admin/calendar/calendar-header";
import { MonthGrid } from "@/components/features/admin/calendar/month-grid";
import { CalendarLegend } from "@/components/features/admin/calendar/calendar-legend";
import type {
  Reservation,
  TimeSlot,
  AccommodationType,
  CapacityRule,
  ExceptionDate,
} from "@/types";

interface CalendarioContentProps {
  reservations: Reservation[];
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

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  const handleDayClick = useCallback(
    (dateStr: string) => {
      router.push(`/admin/reservas?date=${dateStr}`);
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendário</h1>
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
      <MonthGrid
        currentMonth={currentMonth}
        onDayClick={handleDayClick}
        reservations={reservations}
        timeSlots={timeSlots}
        accommodationTypes={accommodationTypes}
        capacityRules={capacityRules}
        exceptionDates={exceptionDates}
      />
      <CalendarLegend />
    </div>
  );
}
