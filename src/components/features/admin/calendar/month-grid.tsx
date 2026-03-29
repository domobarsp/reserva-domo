"use client";

import { useMemo } from "react";
import type {
  ReservationFull,
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
import { DayPopover } from "./day-popover";

interface MonthGridProps {
  currentMonth: Date;
  onDayClick: (dateStr: string) => void;
  reservations: ReservationFull[];
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
  isPending?: boolean;
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

// Limiares: < 35% = baixa, 35-70% = média, > 70% = alta
function getOccupancyLevel(dayData: DayData): "none" | "low" | "medium" | "high" {
  if (!dayData.isCurrentMonth || dayData.isClosed) return "none";
  if (dayData.occupancyRatio === 0) return "none";
  if (dayData.occupancyRatio < 0.35) return "low";
  if (dayData.occupancyRatio < 0.70) return "medium";
  return "high";
}

const OCCUPANCY_BG: Record<string, string> = {
  none: "",
  low: "bg-emerald-50",
  medium: "bg-amber-100",
  high: "bg-rose-100",
};

export function MonthGrid({
  currentMonth,
  onDayClick,
  reservations,
  timeSlots,
  accommodationTypes,
  capacityRules,
  exceptionDates,
  isPending = false,
}: MonthGridProps) {
  const todayStr = dateToStr(new Date());

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const result: DayData[] = [];

    // Padding — mês anterior
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

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = dateToStr(new Date(year, month, day));
      const isClosed = isDateClosedFrom(dateStr, exceptionDates);
      const isToday = dateStr === todayStr;

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

    // Padding — próximo mês
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

  return (
    <div
      className={cn(
        "overflow-x-auto transition-opacity",
        isPending && "opacity-60"
      )}
    >
      <div className="grid min-w-[600px] grid-cols-7 gap-px bg-border">
        {/* Headers de dia da semana */}
        {WEEKDAY_HEADERS.map((header) => (
          <div
            key={header}
            className="bg-zinc-50 px-2 py-2 text-center text-[10px] font-medium text-zinc-500 sm:text-xs"
          >
            {header}
          </div>
        ))}

        {/* Células */}
        {days.map((dayData, index) => {
          const level = getOccupancyLevel(dayData);
          const occupancyPct =
            dayData.totalCapacity > 0
              ? Math.round(dayData.occupancyRatio * 100)
              : null;

          const cellContent = (
            <button
              type="button"
              disabled={!dayData.isCurrentMonth}
              onClick={() => {
                if (
                  dayData.isCurrentMonth &&
                  (dayData.reservationCount === 0 || dayData.isClosed)
                ) {
                  onDayClick(dayData.dateStr);
                }
              }}
              className={cn(
                "group flex min-h-[72px] w-full flex-col items-start p-2 text-left transition-colors md:min-h-[100px] md:p-3",
                dayData.isCurrentMonth
                  ? "cursor-pointer bg-white hover:bg-zinc-50"
                  : "cursor-default bg-white",
                dayData.isClosed && "bg-zinc-100 hover:bg-zinc-100",
                !dayData.isClosed && OCCUPANCY_BG[level],
                !dayData.isCurrentMonth && "opacity-30"
              )}
            >
              {/* Número do dia */}
              {dayData.isToday ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {dayData.day}
                </span>
              ) : (
                <span
                  className={cn(
                    "text-sm font-semibold text-zinc-700",
                    dayData.isClosed && "text-zinc-400",
                    !dayData.isCurrentMonth && "text-zinc-300"
                  )}
                >
                  {dayData.day}
                </span>
              )}

              {/* Fechado */}
              {dayData.isCurrentMonth && dayData.isClosed && (
                <span className="mt-1 text-[10px] font-medium text-zinc-400">
                  Fechado
                </span>
              )}

              {/* Dados de reserva */}
              {dayData.isCurrentMonth && !dayData.isClosed && dayData.reservationCount > 0 && (
                <div className="mt-auto w-full space-y-0.5">
                  <span className="block text-[10px] font-semibold text-zinc-700">
                    {dayData.reservationCount}{" "}
                    {dayData.reservationCount === 1 ? "reserva" : "reservas"}
                    {" · "}
                    {dayData.totalCovers} pax
                  </span>
                  {occupancyPct !== null && (
                    <span className="block text-[10px] text-zinc-400">
                      {occupancyPct}% ocupação
                    </span>
                  )}
                </div>
              )}

              {/* Dia vazio — ponto + hint no hover */}
              {dayData.isCurrentMonth && !dayData.isClosed && dayData.reservationCount === 0 && (
                <div className="mt-auto">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-200 group-hover:hidden" />
                  <span className="hidden text-[10px] text-zinc-400 group-hover:inline">
                    Adicionar reserva
                  </span>
                </div>
              )}
            </button>
          );

          // Dias com reservas abrem popover; outros navegam direto
          if (dayData.isCurrentMonth && !dayData.isClosed && dayData.reservationCount > 0) {
            return (
              <DayPopover
                key={`${dayData.dateStr}-${index}`}
                dateStr={dayData.dateStr}
                reservations={reservations}
              >
                {cellContent}
              </DayPopover>
            );
          }

          return (
            <div key={`${dayData.dateStr}-${index}`}>
              {cellContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
