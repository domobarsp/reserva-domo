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
      iconColor: "text-blue-600",
    },
    {
      label: "Confirmadas",
      value: stats.confirmed,
      icon: Clock,
      iconColor: "text-green-600",
    },
    {
      label: "Pendentes",
      value: stats.pending,
      icon: Users,
      iconColor: "text-yellow-600",
    },
    {
      label: "Ocupacao",
      value: `${stats.occupancyPercent}%`,
      icon: BarChart3,
      iconColor: "text-purple-600",
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
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted",
                card.iconColor
              )}
            >
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
