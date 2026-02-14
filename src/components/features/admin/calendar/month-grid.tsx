"use client";

import { useMemo } from "react";
import type {
  Reservation,
  TimeSlot,
  AccommodationType,
  CapacityRule,
  ExceptionDate,
} from "@/types";
import { ReservationStatus } from "@/types";
import {
  getTotalCapacityForDate,
  isDateClosedFrom,
  dateToStr,
} from "@/lib/availability";
import { cn } from "@/lib/utils";

interface MonthGridProps {
  currentMonth: Date;
  onDayClick: (dateStr: string) => void;
  reservations: Reservation[];
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

const WEEKDAY_HEADERS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface DayData {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isClosed: boolean;
  reservationCount: number;
  totalCovers: number;
  totalCapacity: number;
  occupancyRatio: number;
}

export function MonthGrid({
  currentMonth,
  onDayClick,
  reservations,
  timeSlots,
  accommodationTypes,
  capacityRules,
  exceptionDates,
}: MonthGridProps) {
  const todayStr = dateToStr(new Date());

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month and how many days in the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month padding days
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const result: DayData[] = [];

    // Padding days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = dateToStr(new Date(prevYear, prevMonth, day));
      result.push({
        day,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        isClosed: false,
        reservationCount: 0,
        totalCovers: 0,
        totalCapacity: 0,
        occupancyRatio: 0,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = dateToStr(new Date(year, month, day));
      const isClosed = isDateClosedFrom(dateStr, exceptionDates);
      const isToday = dateStr === todayStr;

      // Count active reservations (not cancelled)
      const activeReservations = reservations.filter(
        (r) => r.date === dateStr && r.status !== ReservationStatus.CANCELLED
      );
      const reservationCount = activeReservations.length;
      const totalCovers = activeReservations.reduce(
        (sum, r) => sum + r.party_size,
        0
      );

      const totalCapacity = getTotalCapacityForDate(
        dateStr,
        timeSlots,
        accommodationTypes,
        capacityRules,
        exceptionDates
      );

      const occupancyRatio =
        totalCapacity > 0 ? totalCovers / totalCapacity : 0;

      result.push({
        day,
        dateStr,
        isCurrentMonth: true,
        isToday,
        isClosed,
        reservationCount,
        totalCovers,
        totalCapacity,
        occupancyRatio,
      });
    }

    // Padding days for next month (fill remaining cells to complete the grid)
    const remainder = result.length % 7;
    if (remainder > 0) {
      const paddingCount = 7 - remainder;
      for (let i = 1; i <= paddingCount; i++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const dateStr = dateToStr(new Date(nextYear, nextMonth, i));
        result.push({
          day: i,
          dateStr,
          isCurrentMonth: false,
          isToday: false,
          isClosed: false,
          reservationCount: 0,
          totalCovers: 0,
          totalCapacity: 0,
          occupancyRatio: 0,
        });
      }
    }

    return result;
  }, [
    currentMonth,
    reservations,
    timeSlots,
    accommodationTypes,
    capacityRules,
    exceptionDates,
    todayStr,
  ]);

  function getOccupancyBg(dayData: DayData): string {
    if (!dayData.isCurrentMonth) return "";
    if (dayData.isClosed) return "bg-gray-100";
    if (dayData.occupancyRatio === 0) return "";
    if (dayData.occupancyRatio <= 0.5) return "bg-green-50";
    if (dayData.occupancyRatio <= 0.8) return "bg-yellow-50";
    return "bg-red-50";
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[600px] grid-cols-7 gap-px rounded-lg border bg-gray-200">
        {/* Weekday headers */}
        {WEEKDAY_HEADERS.map((header) => (
          <div
            key={header}
            className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {header}
          </div>
        ))}

        {/* Day cells */}
        {days.map((dayData, index) => (
          <button
            key={`${dayData.dateStr}-${index}`}
            type="button"
            disabled={!dayData.isCurrentMonth}
            onClick={() => {
              if (dayData.isCurrentMonth) {
                onDayClick(dayData.dateStr);
              }
            }}
            className={cn(
              "flex min-h-[80px] flex-col items-start p-2 text-left transition-colors",
              dayData.isCurrentMonth
                ? "cursor-pointer bg-white hover:bg-gray-50"
                : "cursor-default bg-white",
              getOccupancyBg(dayData),
              dayData.isToday && "ring-2 ring-blue-500 ring-inset",
              !dayData.isCurrentMonth && "text-gray-300"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                dayData.isToday && "text-blue-600",
                !dayData.isCurrentMonth && "text-gray-300"
              )}
            >
              {dayData.day}
            </span>

            {dayData.isCurrentMonth && dayData.isClosed && (
              <span className="mt-1 text-[10px] font-medium text-gray-500">
                Fechado
              </span>
            )}

            {dayData.isCurrentMonth &&
              !dayData.isClosed &&
              dayData.reservationCount > 0 && (
                <div className="mt-auto space-y-0.5">
                  <span className="block text-[10px] text-gray-600">
                    {dayData.reservationCount} res.
                  </span>
                  <span className="block text-[10px] text-gray-600">
                    {dayData.totalCovers} pax
                  </span>
                </div>
              )}
          </button>
        ))}
      </div>
    </div>
  );
}
