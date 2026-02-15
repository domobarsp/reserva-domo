"use client";

import { useMemo } from "react";
import { CalendarCheck, Clock, Users, BarChart3 } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationStatus } from "@/types";
import type {
  ReservationFull,
  TimeSlot,
  AccommodationType,
  CapacityRule,
  ExceptionDate,
} from "@/types";
import { getTotalCapacityForDate, getTodayStr } from "@/lib/availability";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  className?: string;
  todayReservations: ReservationFull[];
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

export function DashboardStats({
  className,
  todayReservations,
  timeSlots,
  accommodationTypes,
  capacityRules,
  exceptionDates,
}: DashboardStatsProps) {
  useRealtimeSubscription({ table: "reservations" });

  const stats = useMemo(() => {
    const nonCancelled = todayReservations.filter(
      (r) => r.status !== ReservationStatus.CANCELLED
    );

    const confirmed = todayReservations.filter(
      (r) => r.status === ReservationStatus.CONFIRMED
    );

    const pending = todayReservations.filter(
      (r) => r.status === ReservationStatus.PENDING
    );

    const activeStatuses = [
      ReservationStatus.PENDING,
      ReservationStatus.CONFIRMED,
      ReservationStatus.SEATED,
    ];
    const activePartySize = todayReservations
      .filter((r) => activeStatuses.includes(r.status))
      .reduce((sum, r) => sum + r.party_size, 0);

    const totalCapacity = getTotalCapacityForDate(
      getTodayStr(),
      timeSlots,
      accommodationTypes,
      capacityRules,
      exceptionDates
    );

    const occupancyPercent =
      totalCapacity > 0
        ? Math.round((activePartySize / totalCapacity) * 100)
        : 0;

    return {
      totalToday: nonCancelled.length,
      confirmed: confirmed.length,
      pending: pending.length,
      occupancyPercent,
    };
  }, [
    todayReservations,
    timeSlots,
    accommodationTypes,
    capacityRules,
    exceptionDates,
  ]);

  const cards = [
    {
      label: "Reservas Hoje",
      value: stats.totalToday,
      icon: CalendarCheck,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Confirmadas",
      value: stats.confirmed,
      icon: Clock,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Pendentes",
      value: stats.pending,
      icon: Users,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Ocupacao",
      value: `${stats.occupancyPercent}%`,
      icon: BarChart3,
      iconColor: "text-violet-600",
      bgColor: "bg-violet-50",
    },
  ] as const;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {cards.map((card) => (
        <Card key={card.label} className="border-0 shadow-none">
          <CardContent className={cn("flex flex-col gap-3", card.bgColor)}>
            <div className="flex items-center gap-2">
              <card.icon className={cn("h-5 w-5", card.iconColor)} />
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
            </div>
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
